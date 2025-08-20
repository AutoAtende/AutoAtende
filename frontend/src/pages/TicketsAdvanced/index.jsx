import React, {useState, useEffect, useContext} from "react";
import {useParams} from "react-router-dom";
import { useTheme } from "@mui/material/styles";
import makeStyles from '@mui/styles/makeStyles';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';
import ChatIcon from '@mui/icons-material/Chat';

import TicketsManagerTabs from "../../components/TicketsManagerTabs/";
import Ticket from "../../components/Ticket/";
import TicketAdvancedLayout from "../../components/TicketAdvancedLayout";
import { TicketsContext } from "../../context/Tickets/TicketsContext";


import {i18n} from "../../translate/i18n";
import { QueueSelectedProvider } from "../../context/QueuesSelected/QueuesSelectedContext";

const useStyles = makeStyles((theme) => ({
    header: {},
    content: {
        overflow: "auto"
    },
    logoImg: {
        width: "75%",
        margin: "0 auto",
        content: "url(" + (theme.mode === "light" ? theme.calculatedLogoLight() : theme.calculatedLogoDark()) + ")"
    },
    placeholderContainer: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
        backgroundColor: theme.palette.boxticket,
    },
    placeholderItem: {},
}));

const TicketAdvanced = (props) => {
    const classes = useStyles();
    const {ticketId} = useParams();
    const [option, setOption] = useState(0);
    const {currentTicket, setCurrentTicket} = useContext(TicketsContext);

    useEffect(() => {
        if (currentTicket.id !== null) {
            setCurrentTicket({id: currentTicket.id, code: '#open'})
        }
        if (!ticketId) {
            setOption(1)
        }
        return () => {
            setCurrentTicket({id: null, code: null})
        }

    }, [])

    useEffect(() => {
        if (currentTicket.id !== null) {
            setOption(0)
        }
    }, [currentTicket])

    const renderPlaceholder = () => {
        return <Box className={classes.placeholderContainer}>
            <div>
                <center><img style={{margin: "0 auto", width: "70%"}} className={classes.logoImg} alt="logologin"/></center>
            </div>
            <br/>
            <Button onClick={() => setOption(1)} variant="contained" color="primary">
                Selecionar Ticket
            </Button>
        </Box>
    }

    const renderMessageContext = () => {
        if (ticketId) {
            return <Ticket/>
        }
        return renderPlaceholder()
    }

    const renderTicketsManagerTabs = () => {
        return <TicketsManagerTabs/>
    }

    return (
        <QueueSelectedProvider>

            <TicketAdvancedLayout>
                <Box className={classes.header}>
                    <BottomNavigation
                        value={option}
                        onChange={(event, newValue) => {
                            setOption(newValue);
                        }}
                        showLabels
                        className={classes.root}
                    >
                        <BottomNavigationAction label="Ticket" icon={<ChatIcon/>}/>
                        <BottomNavigationAction label="Atendimentos" icon={<QuestionAnswerIcon/>}/>
                    </BottomNavigation>
                </Box>
                <Box className={classes.content}>
                    {option === 0 ? renderMessageContext() : renderTicketsManagerTabs()}
                </Box>
            </TicketAdvancedLayout>
        </QueueSelectedProvider>
    );
};

export default TicketAdvanced;
