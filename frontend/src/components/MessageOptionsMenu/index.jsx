import React, { useState, useContext } from "react";
import PropTypes from "prop-types";

import { Menu, MenuItem, MenuList, Grid, Popover, IconButton } from "@mui/material";
import makeStyles from '@mui/styles/makeStyles';
import AddCircleOutlineIcon from '@mui/icons-material/Add';
import { i18n } from "../../translate/i18n";
import api from "../../services/api";
import ConfirmationModal from "../ConfirmationModal";
import { ReplyMessageContext } from "../../context/ReplyingMessage/ReplyingMessageContext";
import { EditMessageContext } from "../../context/EditingMessage/EditingMessageContext";
import { toast } from "../../helpers/toast";
import ForwardMessageModal from "../ForwardMessageModal";
import MessageHistoryModal from "../MessageHistoryModal";

const useStyles = makeStyles((theme) => ({
	iconButton: {
	  padding: '4px', // Ajuste o valor conforme necessário
	},
	gridContainer: {
	  padding: '10px',
	  justifyContent: 'center',
	},
	addCircleButton: {
	  padding: '8px',
	  fontSize: '2rem', // Aumentar o tamanho do ícone
	  backgroundColor: 'rgb(242 242 247);',
	},
	popoverContent: {
	  maxHeight: '300px', // Ajuste conforme necessário
	  overflowY: 'auto',
	  '&::-webkit-scrollbar': {
		width: '0.4em',
		height: '0.4em',
	  },
	  '&::-webkit-scrollbar-thumb': {
		backgroundColor: 'rgba(0,0,0,.1)',
		borderRadius: '50px',
	  },
	  '&::-webkit-scrollbar-track': {
		boxShadow: 'inset 0 0 6px rgba(0,0,0,0.00)',
		webkitBoxShadow: 'inset 0 0 6px rgba(0,0,0,0.00)',
	  },
	},
	hideScrollbar: {
	  maxHeight: '300px',
	  overflow: 'hidden',
	},
  }));

const MessageOptionsMenu = ({ 
	message, 
	data,
  	menuOpen, 
  	handleClose, 
  	anchorEl, 
  	setShowSelectCheckbox, 
  	showSelectCheckBox, 
  	forwardMessageModalOpen, 
  	setForwardMessageModalOpen,
  	selectedMessages
 }) => {
	const { setReplyingMessage } = useContext(ReplyMessageContext);
	const editingContext = useContext(EditMessageContext);
 	const setEditingMessage = editingContext ? editingContext.setEditingMessage : null;
	const [confirmationOpen, setConfirmationOpen] = useState(false);
	const [messageHistoryOpen, setMessageHistoryOpen] = useState(false);
	const [reactionAnchorEl, setReactionAnchorEl] = useState(null);

	const [moreAnchorEl, setMoreAnchorEl] = useState(null);

	const classes = useStyles();

	const openReactionsMenu = (event) => {
		setReactionAnchorEl(event.currentTarget);
		handleClose();
	};
	
	const closeReactionsMenu = () => {
		setReactionAnchorEl(null);
		handleClose();
	};

	const openMoreReactionsMenu = (event) => {
		setMoreAnchorEl(event.currentTarget);
		closeReactionsMenu();  // Fechar o primeiro popover
	};

	const closeMoreReactionsMenu = () => {
		setMoreAnchorEl(null);
	};

	const handleDeleteMessage = async () => {
		try {
			await api.delete(`/messages/${message.id}`);
		} catch (err) {
			toast.error(err);
		}
	};
	
	const handleSetShowSelectCheckbox = () => {
		setShowSelectCheckbox(!showSelectCheckBox);
		handleClose();
	};

	const handleReplyMessage = () => {
		setReplyingMessage(message);
		handleClose();
	};

	const handleEditMessage = async () => {
		setEditingMessage(message);
		handleClose();
	};

	const handleOpenMessageHistoryModal = (e) => {
		setMessageHistoryOpen(true);
		handleClose();
	};

	const handleOpenConfirmationModal = e => {
		setConfirmationOpen(true);
		handleClose();
	};
	
	const handleForwardModal = () => {
		setForwardMessageModalOpen(true);
		handleClose();
	};

	const handleReactToMessage = async (reactionType) => {
		try {
			await api.post(`/messages/${message.id}/reactions`, { type: reactionType });
			toast.success(i18n.t("messageOptionsMenu.reactionSuccess"));
		} catch (err) {
			toast.error(err);
		}
		closeReactionsMenu(); // Fechar o menu de reações ao reagir
	};

	// Array de emojis
    const availableReactions = [
		'😀', '😂', '❤️', '👍', '🎉', '😢', '😮', '😡', '👏', '🔥',
        '🥳', '😎', '🤩', '😜', '🤔', '🙄', '😴', '😇', '🤯', '💩',
        '🤗', '🤫', '🤭', '🤓', '🤪', '🤥', '🤡', '🤠', '🤢', '🤧',
        '😷', '🤕', '🤒', '👻', '💀', '☠️', '👽', '👾', '🤖', '🎃',
        '😺', '😸', '😹', '😻', '😼', '😽', '🙀', '😿', '😾', '🙈',
        '🙉', '🙊', '🐵', '🐒', '🦍', '🐶', '🐕', '🐩', '🐺', '🦊',
        '🦝', '🐱', '🐈', '🦁', '🐯', '🐅', '🐆', '🐴', '🐎', '🦄'
	];

	const isSticker = data?.message && ("stickerMessage" in data.message);

	return <>
     <ForwardMessageModal
            modalOpen={forwardMessageModalOpen}
            message={message}
            onClose={(e) => {
                setForwardMessageModalOpen(false);
                setShowSelectCheckbox(false);
            }}
            messages={selectedMessages}
        />
        <ConfirmationModal
            title={i18n.t("messageOptionsMenu.confirmationModal.title")}
            open={confirmationOpen}
            onClose={setConfirmationOpen}
            onConfirm={handleDeleteMessage}
        >
            {i18n.t("messageOptionsMenu.confirmationModal.message")}
        </ConfirmationModal>
        <MessageHistoryModal
            open={messageHistoryOpen}
            onClose={setMessageHistoryOpen}
            oldMessages={message.oldMessages}
        >
        </MessageHistoryModal>
        <Menu
            anchorEl={anchorEl}
            getContentAnchorEl={null}
            anchorOrigin={{
                vertical: "bottom",
                horizontal: "right",
            }}
            transformOrigin={{
                vertical: "top",
                horizontal: "right",
            }}
            open={menuOpen}
            onClose={handleClose}
        >
{message.fromMe &&
  				(new Date().getTime() - new Date(message.createdAt).getTime() <= 15 * 60 * 1000) && ([
					<MenuItem key="delete" onClick={handleOpenConfirmationModal}>
						{i18n.t("messageOptionsMenu.delete")}
					</MenuItem>,
					<MenuItem key="edit" onClick={handleEditMessage}>
			            {i18n.t("messageOptionsMenu.edit")}
         			</MenuItem>
				])}
            {!isSticker && message.oldMessages?.length > 0 && (
                <MenuItem key="history" onClick={handleOpenMessageHistoryModal}>
                    {i18n.t("messageOptionsMenu.history")}
                </MenuItem>
            )}
            <MenuItem onClick={handleReplyMessage}>
                {i18n.t("messageOptionsMenu.reply")}
            </MenuItem>
            <MenuItem onClick={handleSetShowSelectCheckbox}>
                {i18n.t("messageOptionsMenu.forward")}
            </MenuItem>
            <MenuItem onClick={openReactionsMenu}>
            {i18n.t("messageOptionsMenu.react")}
            </MenuItem>
        </Menu>
            <Popover
                open={Boolean(reactionAnchorEl)}
                anchorEl={reactionAnchorEl}
                onClose={closeReactionsMenu}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
                PaperProps={{
                    style: { width: 'auto', maxWidth: '380px', borderRadius: '50px'  }
                }}
            >
                <div className={classes.hideScrollbar}>
                <Grid container spacing={1} className={classes.gridContainer}>
                    {availableReactions.slice(0, 6).map(reaction => (
                        <Grid item key={reaction}>
                            <IconButton
                                className={classes.iconButton}
                                onClick={() => handleReactToMessage(reaction)}
                                size="large">
                                {reaction}
                            </IconButton>
                        </Grid>
                    ))}
                    <Grid item>
                    <IconButton
                        className={classes.addCircleButton}
                        onClick={openMoreReactionsMenu}
                        size="large">
                            <AddCircleOutlineIcon fontSize="normal" />
                        </IconButton>
                    </Grid>
                </Grid>
                </div>
            </Popover>
            <Popover
                open={Boolean(moreAnchorEl)}
                anchorEl={moreAnchorEl}
                onClose={closeMoreReactionsMenu}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'center',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'center',
                }}
                PaperProps={{
                    style: { width: 'auto', maxWidth: '400px', borderRadius: '6px' }
                }}
            >
                <div className={classes.popoverContent}>
                <Grid container spacing={1} className={classes.gridContainer}>
                    {availableReactions.map(reaction => (
                        <Grid item key={reaction}>
                            <IconButton
                                className={classes.iconButton}
                                onClick={() => handleReactToMessage(reaction)}
                                size="large">
                                {reaction}
                            </IconButton>
                        </Grid>
                    ))}
                </Grid>
                </div>
            </Popover>
    </>;
};

MessageOptionsMenu.propTypes = {
    message: PropTypes.object,
    menuOpen: PropTypes.bool.isRequired,
    handleClose: PropTypes.func.isRequired,
    anchorEl: PropTypes.object,
    onReaction: PropTypes.func, // Callback opcional chamado após uma reação
    availableReactions: PropTypes.arrayOf(PropTypes.string) // Lista opcional de reações disponíveis
}

export default MessageOptionsMenu;