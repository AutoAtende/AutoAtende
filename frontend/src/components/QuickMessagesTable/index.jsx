import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { styled } from "@mui/material/styles";
import { 
    Grid,
    Card,
    CardContent,
    CardActions,
    Typography,
    IconButton,
    Tooltip,
    CircularProgress,
    Box
} from '@mui/material';
import {
    Edit as EditIcon,
    Delete as DeleteIcon,
    PlayArrow as PlayIcon,
    PauseCircle as PauseIcon,
    CheckCircle as CheckCircleIcon,
    AttachFile as AttachFileIcon
} from "@mui/icons-material";
import { i18n } from "../../translate/i18n";
import BaseButton from "../BaseButton";
import BasePageContent from "../BasePageContent";

const StyledCard = styled(Card)(({ theme }) => ({
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    transition: 'all 0.3s',
    '&:hover': {
        transform: 'translateY(-5px)',
        boxShadow: theme.shadows[4]
    }
}));

const CardContentStyled = styled(CardContent)({
    flexGrow: 1
});

const CardActionsStyled = styled(CardActions)({
    justifyContent: 'flex-end',
    paddingTop: 0
});

const GlobalBadge = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    marginTop: theme.spacing(1),
    color: theme.palette.success.main
}));

const MediaInfo = styled(Typography)(({ theme }) => ({
    marginTop: theme.spacing(1),
    color: theme.palette.text.secondary
}));

const LoadingContainer = styled(Box)(({ theme }) => ({
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '300px',
    width: '100%'
}));

function QuickMessagesTable({ messages, showLoading, editMessage, deleteMessage, readOnly, onPlayAudio }) {
    const [loading, setLoading] = useState(true);
    const [audioPlayingId, setAudioPlayingId] = useState(null);

    useEffect(() => {
        if (showLoading !== undefined) {
            setLoading(showLoading);
        }
    }, [showLoading]);

    const handleEdit = (message) => {
        editMessage(message);
    };

    const handleDelete = (message) => {
        deleteMessage(message);
    };

    const handlePlayAudio = (id) => {
        if (onPlayAudio) {
            onPlayAudio(id);
        }
        setAudioPlayingId(id);
    };

    const handleStopAudio = () => {
        setAudioPlayingId(null);
    };

    const handleShowFile = (filePath) => {
        if (filePath) {
            window.open(filePath, "_blank");
        }
    };

    if (loading) {
        return (
            <LoadingContainer>
                <CircularProgress />
            </LoadingContainer>
        );
    }

    if (!messages || messages.length === 0) {
        return (
            <BasePageContent
                empty={true}
                emptyProps={{
                    title: i18n.t("quickMessages.noMessages"),
                    message: i18n.t("quickMessages.noMessagesMessage"),
                    buttonText: i18n.t("quickMessages.buttons.add"),
                    onAction: () => editMessage({})
                }}
            />
        );
    }

    return (
        <Grid container spacing={3}>
            {messages.map((message) => (
                <Grid item xs={12} sm={6} md={4} key={message.id}>
                    <StyledCard variant="outlined">
                        <CardContentStyled>
                            <Typography variant="h6" component="h2" gutterBottom>
                                {message.shortcode}
                            </Typography>
                            <Typography variant="body2" color="textSecondary" component="p">
                                {message.message}
                            </Typography>
                            {message.mediaPath && (
                                <MediaInfo variant="body2">
                                    {i18n.t("quickMessages.table.media")}: {message.mediaName || (message.mediaType === "audio" ? "Áudio" : "Arquivo")}
                                </MediaInfo>
                            )}
                            {message.geral && (
                                <GlobalBadge>
                                    <CheckCircleIcon fontSize="small" sx={{ mr: 0.5 }} />
                                    {i18n.t("quickMessages.global")}
                                </GlobalBadge>
                            )}
                        </CardContentStyled>
                        <CardActionsStyled>
                            {message.mediaType === "audio" && (
                                <Tooltip title={i18n.t("quickMessages.buttons.playAudio")}>
                                    <IconButton
                                        size="small"
                                        onClick={() => audioPlayingId === message.id ? handleStopAudio() : handlePlayAudio(message.id)}
                                    >
                                        {audioPlayingId === message.id ? <PauseIcon /> : <PlayIcon />}
                                    </IconButton>
                                </Tooltip>
                            )}
                            {message.mediaType === "file" && (
                                <Tooltip title={i18n.t("quickMessages.buttons.openFile")}>
                                    <IconButton 
                                        size="small"
                                        onClick={() => handleShowFile(message.mediaPath)}
                                    >
                                        <AttachFileIcon />
                                    </IconButton>
                                </Tooltip>
                            )}
                            {!readOnly && (
                                <>
                                    <Tooltip title={i18n.t("quickMessages.buttons.edit")}>
                                        <IconButton size="small" onClick={() => handleEdit(message)}>
                                            <EditIcon />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title={i18n.t("quickMessages.buttons.delete")}>
                                        <IconButton size="small" onClick={() => handleDelete(message)}>
                                            <DeleteIcon />
                                        </IconButton>
                                    </Tooltip>
                                </>
                            )}
                        </CardActionsStyled>
                    </StyledCard>
                </Grid>
            ))}
        </Grid>
    );
}

QuickMessagesTable.propTypes = {
    messages: PropTypes.array.isRequired,
    showLoading: PropTypes.bool,
    editMessage: PropTypes.func.isRequired,
    deleteMessage: PropTypes.func.isRequired,
    readOnly: PropTypes.bool,
    onPlayAudio: PropTypes.func
};

export default QuickMessagesTable;