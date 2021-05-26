import { Box, Button, makeStyles, TextField } from "@material-ui/core";
import SendSharpIcon from '@material-ui/icons/SendSharp';
import { useEffect, useState } from "react";
import ChatBubble from "./ChatBubble";
import axios from "axios";
import {BotSession} from "../../util/BotSession.js"

const useStyles = makeStyles(theme => ({
    root: {
        // border: "1px solid",
        // borderColor: "primary",
        borderRadius: "5px",
        padding: "20px",
        height: "800px",
        [theme.breakpoints.down('xs')]: {
            height: "600px"
        },
        backgroundColor: theme.palette.primary.main
    },
    chatDisplay: {
        backgroundColor: "white",
        borderRadius: "5px",
        height: "100%",
    },
    chatMessageSection: {
        padding: "5px 20px",
    },
    chats: {
        overflow: "auto",
        bottom: 0,
        height: "100%",
        /* Hide scrollbar for Chrome, Safari and Opera */
        '&::-webkit-scrollbar': {
            display: "none !important"
        },
        scrollbarWidth: "none",  /* Firefox */
    },
    textFieldInputRoot: {
        height: "1.8rem",
        fontSize: "1.4rem",
        [theme.breakpoints.down('xs')]: {
            height: "1.2rem",
            fontSize: "1rem",
        },
    }
    
}));

// To do: add botMessage chatbubble after user message chat bubble if botmessage chatbubble exists.
// If not, add a "..." chat bubbble while waiting

export default function ChatInterface() {
    const classes = useStyles();

    const botSession = new BotSession()

    const [initialBotMessage, setInitialBotMessage] = useState("")
    const [activeUserMessage, setActiveUserMessage] = useState("")
    const [userMessages, setUserMessages] = useState([])
    const [botMessages, setBotMessages] = useState([])
    const [messagesEnd, setMessagesEnd] = useState(null)
    const [errorMsg, setErrorMsg] = useState("")

    // Effects that take place only upon initial render.
    useEffect( () => {
        botSession.getWelcomeMessage().then( (message) => {
            console.log("firstBotMessage: " + message)
            setInitialBotMessage(message)
        }).catch( (errMsg) => {
            setErrorMsg("Our bot had a problem getting the welcome message. Sorry!")
            setInitialBotMessage("Uh oh: Our bot had a problem getting the welcome message. Sorry!")
        });
        
    }, [])
    
    // Effects that take place when new messages are sent.
    useEffect( () => {
        if(messagesEnd) {
            scrollToBottom()
        }

        function scrollToBottom() {
            messagesEnd.scrollIntoView(false, { block: "end" });
        }

        async function sendMessageToDialogflow(messageText, userMessageIndex) {

            botSession.sendMessageToBot(messageText).then( (message) => {
                sendBotMessage(message, userMessageIndex)
            })

        }

        function sendBotMessage(message, userMessageIndex) {
            let newMessage = {
                message: message,
                inReplyToUserMessageIndex: userMessageIndex,
                index: 0
            }
            setBotMessages(prevState => [
                ...prevState,
                newMessage
            ])
            scrollToBottom()
        }

        if (userMessages.length) {
            sendMessageToDialogflow(userMessages[userMessages.length - 1].message, userMessages.length - 1)
        }
        


    }, [userMessages])

    function sendUserMessage() {
        let newMessage = {
            message: activeUserMessage,
            index: userMessages.length
        }
        setUserMessages( prevState => [
            ...prevState,
            newMessage
        ])
        // sendMessageToDialogflow(activeUserMessage, numMessages + 1)
        setActiveUserMessage("")
    }

    
    function handleActiveUserMessageChange(event, value) {
        setActiveUserMessage(event.target.value)
    }

    function handleKeypress(event, value) {
        if (event.charCode === 13) {
            sendUserMessage()
        }

    }
    
    return (

        // Your JSX...

        <Box className={classes.root} border={2}>
            <Box display="flex" flexDirection="column"
                className={classes.chatDisplay}
                border={2}
            >
                <Box className={classes.chats}>
                    <Box flexGrow="1" display="flex" 
                    flexDirection="column"
                    justifyContent="flex-end"
                    >
                        {initialBotMessage? 
                        <ChatBubble sender="bot"
                        message={initialBotMessage} />
                        : null}
                        {userMessages.map(userMessage =>
                            <span key={userMessage.index}>
                                <ChatBubble sender="user"
                                    message={userMessage.message} />
                                {botMessages.filter(botMessage => botMessage.inReplyToUserMessageIndex === userMessage.index)
                                    .map(botReply => 
                                     <ChatBubble sender="bot"
                                        key={botReply.index}
                                        message={botReply.message} />)
                                }
                            </span> 

                        )}
                        <div style={{ float: "left", clear: "both" }}
                            ref={(el) => { setMessagesEnd(el) }}>
                        </div>
                    </Box>
                </Box>
                <Box display="flex" flexWrap="nowrap" 
                borderTop={1}
                className={classes.chatMessageSection}>
                    <Box flexGrow="1">
                        <TextField fullWidth 
                            placeholder="Send a message.."
                            value={activeUserMessage}
                            onChange={handleActiveUserMessageChange}
                            onKeyPress={handleKeypress}
                            inputProps= {{
                                className: classes.textFieldInputRoot
                            }}
                            
                        />
                    </Box>
                    <Button onClick={sendUserMessage} icon="true"><SendSharpIcon color="primary"/></Button>
                </Box>
                    
            </Box>
        </Box>

    );
}