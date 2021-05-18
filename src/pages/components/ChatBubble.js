import { Box, makeStyles, Typography } from "@material-ui/core";

const useStyles = makeStyles(theme => ({
    botLine: {
        textAlign: "left"
    },
    userLine: {
        textAlign: "right"
    },
    botMessage: {
        display: "inline-block",
        backgroundColor: theme.palette.primary.main,
        borderRadius: "20px 20px 20px 5px",
        margin: "10px 20px",
        textAlign: "left",
        maxWidth: "60%",
        
    },
    userMessage: {
        display: "inline-block",
        backgroundColor: theme.palette.primary.main,
        borderRadius: "20px 20px 5px 20px",
        margin: "10px 20px",
        textAlign: "right",
        maxWidth: "60%",
        [theme.breakpoints.down('xs')]: {
            fontSize: "0.5rem",
        },
    },
    messageText: {
        padding: "10px 25px",
        color: "white",
        fontSize: "1.5rem",
        [theme.breakpoints.down('xs')]: {
            fontSize: "1rem",
            padding: "7px 17px",
        },
    }
}))

export default function ChatBubble(props) {
    const classes = useStyles();


    return (<Box className={props.sender === "bot" ? classes.botLine : classes.userLine}>
        <Box className={props.sender === "bot" ? classes.botMessage : classes.userMessage}>
            <Typography className={classes.messageText}>
                {props.message}
            </Typography>
        </Box>
    </Box>)
    

}