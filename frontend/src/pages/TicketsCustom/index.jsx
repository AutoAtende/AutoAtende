import React from "react";
import {useParams} from "react-router-dom";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import { useTheme } from "@mui/material/styles"; // Importe useTheme aqui

import makeStyles from '@mui/styles/makeStyles';

import TicketsManager from "../../components/TicketsManagerTabs/";
import Ticket from "../../components/Ticket/";

import { QueueSelectedProvider } from "../../context/QueuesSelected/QueuesSelectedContext";

import {i18n} from "../../translate/i18n";
import useSettings from "../../hooks/useSettings";



const useStyles = makeStyles((theme) => ({
    chatContainer: {
        flex: 1,
        padding: theme.spacing(1),
        height: `calc(100% - 48px)`,
        overflowY: "hidden",
    },

    chatPapper: {
        display: "flex",
        height: "100%",
    },

    contactsWrapper: {
        display: "flex",
        height: "100%",
        flexDirection: "column",
        overflowY: "hidden",
    },
    messagesWrapper: {
        display: "flex",
        height: "100%",
        flexDirection: "column",
    },
    welcomeMsg: {
        backgroundColor: theme.palette.boxticket,
        display: "flex",
        justifyContent: "space-evenly",
        alignItems: "center",
        height: "100%",
        textAlign: "center",
    },

    logoImg: {
        margin: "0 auto",
        width: "80%",
        content: "url(" + (theme.mode === "light" ? theme.calculatedLogoLight() : theme.calculatedLogoDark()) + ")"
      },
}));

const TicketsCustom = () => {
    const classes = useStyles();
    const {ticketId} = useParams();
    const { getPublicSetting } = useSettings();
    const theme = useTheme(); // Obtenha o objeto theme usando useTheme

    return (
        <QueueSelectedProvider>
            <div className={classes.chatContainer}>
                <div className={classes.chatPapper}>
                    <Grid container spacing={0}>
                        <Grid item xs={4} className={classes.contactsWrapper}>
                            <TicketsManager/>
                        </Grid>
                        <Grid item xs={8} className={classes.messagesWrapper}>
                            {ticketId ? (
                                <>
                                    <Ticket/>
                                </>
                            ) : (
                                <Paper square variant="outlined" className={classes.welcomeMsg}>
                                    <div>
                                        <center>
                                            <div className={"container-img"}>
                                                <img className={classes.logoImg} />
                                            </div>
                                        </center>
                                    </div>
                                </Paper>
                            )}
                        </Grid>
                    </Grid>
                </div>
            </div>
        </QueueSelectedProvider>
    );
};

export default TicketsCustom;
