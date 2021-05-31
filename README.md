# This is a simple React-based interface for interacting with a Dialogflow chatbot.

![image](https://user-images.githubusercontent.com/6729291/120214631-bbb73000-c202-11eb-9377-47382fb0a9e9.png)

It includes:
1) React chatbot UI.
2) A JavaScript class BotSession that holds two methods for interacting with the chatbot.

getWelcomeMessage(string)
-> Gets an inital welcome message if there is one.

sendMessageToBot(message)
 -> Sends the string to the bot and receives a reply in the form of a callback function with the reply.
 
 Creating a BotSession instance will start a new session with the Dialogflow bot using a random 16 character string.
 
 Interaction with the bot comes via calls to an API.

