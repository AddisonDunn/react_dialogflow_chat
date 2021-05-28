require('dotenv').config()

const botInteraction = require( './google-cloud-env/bot_interaction.js' );
const express = require('express');
const app = express();
var cors = require('cors')
const mongoose = require('mongoose');

app.use(cors())
app.use(express.json())

mongoose.connect(process.env.REACT_APP_MONGODB_URL, {
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
    let fulfillmentText, outputContext, outputParameters, firstName, lastName;

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
                let sessionData = req.body.queryResult.outputContexts.find( (outputContext) => 
                    outputContext.name === contextReturnPath + 'main-session'
                );
                firstName = sessionData.parameters['given-name']
                lastName = sessionData.parameters.lastname
                let birthdayPerson = sessionData.parameters.person.name
                let birthday = req.body.queryResult.parameters['birthday']
                console.log('firstname: ' + firstName + ', ' + 'lastName: ' + lastName + ', birthdayPerson' + birthdayPerson + ', birthday' + birthday)
                resolve(true)
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
        console.log(err.error)
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

// Person.find({firstName: 'James', lastName: 'Dunn'}, function (err, docs) {
//     if (!err) {
//         console.log(docs)
//     } else {
//         console.log('not found')
//     }

// });

app.listen(5005, function () {
    console.log("server up and running on 5005.");
});