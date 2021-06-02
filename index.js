require('dotenv').config()

const botInteraction = require( './google-cloud-env/bot_interaction.js' );
const express = require('express');
const app = express();
var cors = require('cors')
const mongoose = require('mongoose');
const voca = require('voca');

app.use(cors())
app.use(express.json())

mongoose.connect(process.env.MONGODB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true
});

const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const personSchema = new Schema({
    firstName: {
        type: String,
        required: [true, "you need to add a first name!"]
    },
    lastName: {
        type: String,
        required: [true, "you need to add a last name!"]
    },
    dateAdded: {
        type: Date
    }
}, { collection: 'persons' });

const Person = mongoose.model("Person", personSchema);

const birthdaySchema = new Schema({
    person: {
        type: String,
        required: [true, "you need to add the person whose birthday it is!"]
    },
    birthday: {
        type: Date,
        required: [true, "you need to add a birthday!"]
    },
    firstName: {
        type: String,
        required: [true, "you need to add a first name!"]
    },
    lastName: {
        type: String,
        required: [true, "you need to add a last name!"]
    },
}, { collection: 'birthdays' });

const Birthday = mongoose.model("Birthday", birthdaySchema);


app.post("/welcome", function (req, res) {
    botInteraction.startConversation(req.body.isNewUser, req.body.sessionId).then((result) => {
        // console.log(result)
        res.json( result )
    }).catch( (err) => {
        res.json( {error: err} )
    })
})

app.post("/", function (req, res) {
    botInteraction.talkToBot(req.body.message, req.body.sessionId, req.body.contexts).then( (result) => {
        res.json(result)
    }).catch((err) => {
        res.json({ error: err })
    })
})

app.post("/webhook", function (req, res) {
    console.log(req.body)
    let intentName = req.body.queryResult.intent.displayName
    let contextReturnPath = req.body.session + '/contexts/'
    let fulfillmentText, outputContext, outputParameters, firstName, lastName, sessionData;

    const processIntent = new Promise( (resolve, reject) => {
        switch (intentName) {
            case 'Provide first and last name':
                firstName = req.body.queryResult.parameters['given-name']
                lastName = req.body.queryResult.parameters['lastname']
                outputParameters = {'lastName': lastName, 'firstName': firstName}
                checkNameInDB(firstName, lastName).then( (result) => {
                    if (result) {
                        fulfillmentText = 'Hey, I know you! Do you want to save a new birthday or are you trying to remember one?'
                        outputContext = 'bot-questioning'
                        resolve(true)
                    } else {
                        fulfillmentText = 'Thanks! Whose birthday you like to me to remember?'
                        outputContext = 'new-information'
                        addPersonToDB(firstName, lastName).then( (newPerson) => {
                            resolve(true)
                        })
                    }
                })
                break;
            case 'Provide birthday':
                sessionData = req.body.queryResult.outputContexts.find( (outputContext) => 
                    outputContext.name === contextReturnPath + 'main-session'
                );
                firstName = sessionData.parameters['given-name']
                lastName = sessionData.parameters.lastname
                let birthdayPerson = sessionData.parameters.person.name
                let birthday = req.body.queryResult.parameters['birthday']
                console.log('firstname: ' + firstName + ', ' + 'lastName: ' + lastName + ', birthdayPerson' + birthdayPerson + ', birthday' + birthday)
                addBirthday(firstName, lastName, birthdayPerson, birthday)
                fulfillmentText = 'Thanks! I\'ve saved their birthday. Next, do you want to save another new birthday or remember one?'
                outputContext = 'bot-questioning'
                outputParameters = { 'lastName': lastName, 'firstName': firstName }
                resolve(true)
                break;
            case 'Provide friend name to get':
                sessionData = req.body.queryResult.outputContexts.find((outputContext) =>
                    outputContext.name === contextReturnPath + 'main-session'
                );
                firstName = sessionData.parameters['given-name']
                lastName = sessionData.parameters.lastname
                let birthdayPersonToGet = req.body.queryResult.parameters.person.name
                console.log('firstname: ' + firstName + ', ' + 'lastName: ' + lastName + ', birthdayPerson: ' + birthdayPersonToGet)
                getBirthday(firstName, lastName, birthdayPersonToGet).then((result) => {
                    if (result.birthday) {
                        let birthdayToDisplay = (result.birthday.getUTCMonth() + 1) + '/' + result.birthday.getUTCDate()
                        fulfillmentText = 'Their birthday is ' + birthdayToDisplay + '!'
                    } else {
                        fulfillmentText = 'Sorry, I don\'t rememebr that person.'
                    }
                    outputContext = 'bot-questioning'
                    outputParameters = { 'lastName': lastName, 'firstName': firstName }
                    resolve(true)
                }).catch((error) => {
                    console.log(error)
                    reject({ error: 'There was a problem getting the persons birthday.' })
                })
                break;
            default:
                reject({error: 'There was a problem processing the webhook request.'})
        }
    });
    
    processIntent.then((result) => {
        let fullContextString = contextReturnPath + outputContext
        let outputContexts = [{
            "name": fullContextString,
            "lifespanCount": 5,
            "parameters": outputParameters
        }]
        res.send({
            "fulfillment_text": fulfillmentText,
            "output_contexts": outputContexts
        });
    }).catch( (err) => {
        console.log(err)
        res.send({
            "fulfillment_text": 'Sorry, I ran into a problem.',
            "output_contexts": req.body.queryResult.outputContexts
        });
    })
    
    
})

function checkNameInDB(firstName, lastName) {
    // console.log("FirstName: " + firstName + ", lastName: " + lastName)
    return Person.findOne({firstName: firstName, lastName: lastName}, function (err, person) {
        if (person) {
            return person
        } else {
            return null
        }
    })
}

function addPersonToDB(firstName, lastName) {
    const newPerson = new Person({ firstName: firstName, lastName: lastName, dateAdded: new Date()});
    return newPerson.save();
}

function addBirthday(firstName, lastName, birthdayPerson, birthday) {
    let birthdayPersonToInsert = voca.capitalize(birthdayPerson)
    const newBirthday = new Birthday({ person: birthdayPersonToInsert, birthday, firstName, lastName})
    newBirthday.save().catch((error) => {
        console.log(error)
    })
}

async function getBirthday(firstName, lastName, birthdayPerson) {
    let birthdayPersonToSearch = voca.capitalize(birthdayPerson)
    return Birthday.findOne({ person: birthdayPersonToSearch, firstName, lastName }, function (err, birthdayPerson) {
        return birthdayPerson
    })
}

app.listen(5005, function () {
    console.log("server up and running on 5005.");
});