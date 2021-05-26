
const botInteraction = require( './google-cloud-env/bot_interaction.js' );
const express = require('express');
const app = express();
var cors = require('cors')

app.use(cors())
app.use(express.json())

// const sessionId = "123456";
const queries = [
    'Reserve a meeting room in Toronto office, there will be 5 of us',
]
// botInteraction.talkToBot(queries, sessionId)



app.post("/welcome", function (req, res) {
    console.log(req.body);
    botInteraction.startConversation(req.body.isNewUser, req.body.sessionId).then((result) => {
        console.log(result);
        res.json( result )
    }).catch( (err) => {
        res.json( {error: err} )
    })
})

app.post("/", function (req, res) {
    botInteraction.talkToBot(req.body.message, req.body.sessionId).then( (result) => {
        res.json(result)
    }).catch((err) => {
        res.json({ error: err })
    })
})



app.listen(5005, function () {
    console.log("server up and running on 5005.");
});