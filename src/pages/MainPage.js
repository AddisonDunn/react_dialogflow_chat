import { Container, Grid, makeStyles } from "@material-ui/core";
import ChatInterface from "./components/ChatInterface.js"

const useStyles = makeStyles({
    root: {
    },
    chatContainer: {
        marginTop: "50px",
    },
});

export default function MainPage() {
    const classes = useStyles();

    return <div className={classes.root} >
        <Container maxWidth="xl">
            <Grid container style={{flexWrap: "wrap-reverse"}} justify="center">
                {/* <Grid item md={4} xs={12}>
                    
                </Grid> */}

                <Grid item md={8} xs={12}>
                    <Container className={classes.chatContainer}
                        >
                        <ChatInterface />
                    </Container>
                    
                </Grid>
            </Grid>
        </Container>
    </div>
}