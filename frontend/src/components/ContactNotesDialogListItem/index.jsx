import React from 'react';
import PropTypes from 'prop-types';
import IconButton from '@mui/material/IconButton';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import makeStyles from '@mui/styles/makeStyles';
import DeleteIcon from '@mui/icons-material/Delete';
import moment from 'moment';

const useStyles = makeStyles((theme) => ({
    inline: {
        width: '100%'
    }
}));

export default function ContactNotesDialogListItem(props) {
    const { note, deleteItem } = props;
    const classes = useStyles();

    const handleDelete = (item) => {
        deleteItem(item);
    }

    return (
        <ListItem alignItems="flex-start">
            <ListItemAvatar>
                <Avatar alt={note.user.name} src="/static/images/avatar/1.jpg" />
            </ListItemAvatar>
            <ListItemText
                primary={
                    <>
                        <Typography
                            component="span"
                            variant="body2"
                            className={classes.inline}
                            color="textPrimary"
                        >
                            {note.note}
                        </Typography>
                    </>
                }
                secondary={
                    <>
                        {note.user.name}, {moment(note.createdAt).format('DD/MM/YY HH:mm')}
                    </>
                }
            />
            <ListItemSecondaryAction>
                <IconButton
                    onClick={() => handleDelete(note)}
                    edge="end"
                    aria-label="delete"
                    size="large">
                    <DeleteIcon />
                </IconButton>
            </ListItemSecondaryAction>
        </ListItem>
    );
}

ContactNotesDialogListItem.propTypes = {
    note: PropTypes.object.isRequired,
    deleteItem: PropTypes.func.isRequired
}