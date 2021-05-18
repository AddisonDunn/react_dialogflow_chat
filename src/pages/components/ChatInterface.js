import { Box, Button, Grid, makeStyles, TextField, Typography } from "@material-ui/core";
import { AddBox } from "@material-ui/icons";
import SendSharpIcon from '@material-ui/icons/SendSharp';
import { useEffect, useState } from "react";
import ChatBubble from "./ChatBubble";
import axios from "axios";

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
        height: "100%"
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

export default function ChatInterface() {
    const classes = useStyles();

    const [activeUserMessage, setActiveUserMessage] = useState("")
    const [messages, setUserMessages] = useState([])
    const [numMessages, setNumMessages] = useState(0)
    const [messagesEnd, setMessagesEnd] = useState(null)


    useEffect( () => {
        if(messagesEnd) {
            messagesEnd.scrollIntoView(false, { block: "end" });
        }

    }, [numMessages])

    function sendUserMessage() {
        let newMessage = {
            sender: "user",
            message: activeUserMessage,
            index: numMessages
        }
        setUserMessages( [
            ...messages,
            newMessage
        ])
        setNumMessages(numMessages + 1)
        setActiveUserMessage("")
        // scrollToBottom()
    }

    function sendMessageToRasaBot(messageText) {

    }

    function sendBotMessage(message) {
        let newMessage = {
            sender: "bot",
            message: message,
            index: numMessages
        }
        setUserMessages([
            ...messages,
            newMessage
        ])
        setNumMessages(numMessages + 1)
        console.log("bot message sent")
    }

    
    function handleActiveUserMessageChange(event, value) {
        setActiveUserMessage(event.target.value)
    }

    function handleKeypress(event, value) {
        if (event.charCode === 13) {
            sendUserMessage()
            console.log("enter pressed")
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
                        {messages.map(message =>
                            <ChatBubble sender={message.sender}
                                key={message.index}
                                message={message.message} />
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
                    <Button onClick={sendUserMessage} icon><SendSharpIcon color="primary"/></Button>
                </Box>
                    
            </Box>
        </Box>

    );
}