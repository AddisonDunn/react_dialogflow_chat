import {randomString} from "./CommonTools.js";
import axios from "axios";

export class BotSession {
    constructor(username = null, isNewUser = true) {
        this.username = username;

        var env = process.env.NODE_ENV || 'development';
        if ( env === "test" ) {
            this.dialogflowEndpoint = "http://localhost:5005/"
        } else if ( env === "production" ) {
            this.dialogflowEndpoint = "http://localhost:5005/"
        } else {
            this.dialogflowEndpoint = process.env.REACT_APP_EXPRESS_ENDPOINT_DEV
        }
        
        if(isNewUser) {
            // Create new, random session ID if user is new. This will become standard if user account is created.
            this.sessionId = randomString(16);
        }
    }

    // Set up new connection between BotSession and DialogFlow.
    async getWelcomeMessage(isNewUser = true) {
        let dialogflowReply = ""
        const bot_post_url = this.dialogflowEndpoint + "welcome"
        return new Promise( (resolve, reject) => {
            axios.post(bot_post_url, {
                sessionId: this.sessionId,
                isNewUser: isNewUser
            }).then(response => {
            console.log("response: " + JSON.stringify(response.data));
            dialogflowReply = response.data.fulfillmentText;
            resolve(dialogflowReply);
            }).catch((err) => {
                console.log("There was an error fetching the message from dialogflow.");
                console.log(err);
                reject(err);
            })
        });
    }

    async sendMessageToBot(message) {
        let dialogflowReply = ""
        const bot_post_url = this.dialogflowEndpoint
        return new Promise((resolve, reject) => {
            axios.post(bot_post_url, {
                sessionId: this.sessionId,
                message: message
            }).then(response => {
                console.log("response: " + JSON.stringify(response.data));
                dialogflowReply = response.data.fulfillmentText;
                resolve(dialogflowReply);
            }).catch((err) => {
                console.log("There was an error fetching the message from dialogflow.");
                console.log(err);
                reject(err);
            })
        });
    }

    get sessionId() {
        return this._sessionId;
    }

    set sessionId(value) {
        this._sessionId = value;
    }

}