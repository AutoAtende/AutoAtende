import React, { useEffect, useReducer, useState, useContext } from "react";
import makeStyles from '@mui/styles/makeStyles';
import { toast } from "../../helpers/toast";
import Popover from "@mui/material/Popover";
import AnnouncementIcon from "@mui/icons-material/Announcement";
import DOMPurify from 'dompurify';
import {
  Avatar,
  Badge,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Paper,
  Typography,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  DialogContentText
} from "@mui/material";
import api from "../../services/api";
import { isArray } from "../../utils/helpers";
import moment from "moment";
import { SocketContext } from "../../context/Socket/SocketContext";
import { getTicketsArrayByUser } from "../../hooks/useTickets";
import { AuthContext } from "../../context/Auth/AuthContext";

const useStyles = makeStyles((theme) => ({
  contend: {
    minWidth: 300,
    maxWidth: 500,
  },
  mainPaper: {
    flex: 1,
    maxHeight: 300,
    maxWidth: 500,
    padding: theme.spacing(1),
    overflowY: "scroll",
    ...theme.scrollbarStyles,
  },
  htmlContent: {
    '& img': {
      maxWidth: '100%',
      height: 'auto'
    },
    '& p': {
      margin: '0.5em 0'
    },
    '& *:first-child': {
      marginTop: 0
    },
    '& *:last-child': {
      marginBottom: 0
    }
  }
}));

function AnnouncementDialog({ announcement, open, handleClose }) {
  const classes = useStyles();

  const getMediaPath = (filename, companyId) => {
    return `${process.env.REACT_APP_BACKEND_URL}/public/company${companyId}/${filename}`;
  };

  const createSanitizedMarkup = (content) => {
    const sanitizedContent = DOMPurify.sanitize(content, {
      ALLOWED_TAGS: [
        'p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'ul', 'ol', 'li', 'a', 'img', 'blockquote', 'table', 'thead', 'tbody',
        'tr', 'td', 'th'
      ],
      ALLOWED_ATTR: ['href', 'target', 'src', 'alt', 'class']
    });
    return { __html: sanitizedContent };
  };

  return (
    <Dialog
      open={open}
      onClose={() => handleClose()}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
      maxWidth="md"
    >
      <DialogTitle id="alert-dialog-title">{announcement?.title}</DialogTitle>
      <DialogContent className={classes.contend}>
        {announcement?.mediaPath && (
          <div
            style={{
              border: "1px solid #f1f1f1",
              margin: "0 auto 20px",
              textAlign: "center",
              width: "90%",
              height: 300,
              backgroundImage: `url(${getMediaPath(announcement.mediaPath, announcement.companyId)})`,
              backgroundRepeat: "no-repeat",
              backgroundSize: "contain",
              backgroundPosition: "center",
            }}
          />
        )}
        <DialogContentText 
          id="alert-dialog-description"
          className={classes.htmlContent}
          component="div"
          dangerouslySetInnerHTML={createSanitizedMarkup(announcement?.text || '')}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={() => handleClose()} color="primary" autoFocus>
          Fechar
        </Button>
      </DialogActions>
    </Dialog>
  );
}

const reducer = (state, action) => {
  if (action.type === "LOAD_ANNOUNCEMENTS") {
    const announcements = action.payload;
    const newAnnouncements = [];

    if (isArray(announcements)) {
      announcements.forEach((announcement) => {
        const announcementIndex = state.findIndex(
          (u) => u?.id === announcement.id
        );
        if (announcementIndex !== -1) {
          state[announcementIndex] = announcement;
        } else {
          newAnnouncements.push(announcement);
        }
      });
    }

    return [...state, ...newAnnouncements];
  }

  if (action.type === "UPDATE_ANNOUNCEMENTS") {
    const announcement = action.payload;
    const announcementIndex = state.findIndex((u) => u?.id === announcement.id);

    if (announcementIndex !== -1) {
      state[announcementIndex] = announcement;
      return [...state];
    } else {
      return [announcement, ...state];
    }
  }

  if (action.type === "DELETE_ANNOUNCEMENT") {
    const announcementId = action.payload;

    const announcementIndex = state.findIndex((u) => u?.id === announcementId);
    if (announcementIndex !== -1) {
      state.splice(announcementIndex, 1);
    }
    return [...state];
  }

  if (action.type === "RESET") {
    return [];
  }
};

export default function AnnouncementsPopover() {
  const classes = useStyles();

  const [loading, setLoading] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [searchParam] = useState("");
  const [announcements, dispatch] = useReducer(reducer, []);
  const [invisible, setInvisible] = useState(false);
  const [announcement, setAnnouncement] = useState({});
  const [showAnnouncementDialog, setShowAnnouncementDialog] = useState(false);

  const socketManager = useContext(SocketContext);
  const { user } = useContext(AuthContext);

  const createSanitizedPreview = (content) => {
    const sanitizedContent = DOMPurify.sanitize(content, {
      ALLOWED_TAGS: ['p', 'br', 'strong', 'em'],
      ALLOWED_ATTR: []
    });
    // Remove todas as tags HTML para preview na listagem
    const textOnly = sanitizedContent.replace(/<[^>]+>/g, ' ').trim();
    // Limita o texto a 100 caracteres
    return textOnly.length > 100 ? textOnly.substring(0, 100) + '...' : textOnly;
  };

  useEffect(() => {
    dispatch({ type: "RESET" });
    setPageNumber(1);
  }, [searchParam]);

  useEffect(() => {
    setLoading(true);
    const delayDebounceFn = setTimeout(async () => {
      await fetchAnnouncements();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParam, pageNumber]);

  useEffect(() => {
    const companyId = localStorage.getItem("companyId");
    if (companyId === null) return () => {};
    const socket = socketManager.GetSocket(companyId);

    const onCompanyAnnouncement = (data) => {
      if (data.action === "update" || data.action === "create") {
        dispatch({ type: "UPDATE_ANNOUNCEMENTS", payload: data.record });
        setInvisible(false);
      }
      if (data.action === "delete") {
        dispatch({ type: "DELETE_ANNOUNCEMENT", payload: +data.id });
      }
    };

    socket.on(`company-announcement`, onCompanyAnnouncement);

    return () => {
      socket.off(`company-announcement`, onCompanyAnnouncement);
    };
  }, [socketManager]);

  const fetchAnnouncements = async () => {
    try {
      const { data } = await api.get("/announcements/", {
        params: { searchParam, pageNumber },
      });
      dispatch({ type: "LOAD_ANNOUNCEMENTS", payload: data.records });
      setHasMore(data.hasMore);
      setLoading(false);
    } catch (err) {
      toast.error(err);
    }
  };

  const loadMore = () => {
    setPageNumber((prevState) => prevState + 1);
  };

  const handleScroll = (e) => {
    if (!hasMore || loading) return;
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - (scrollTop + 100) < clientHeight) {
      loadMore();
    }
  };

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
    setInvisible(true);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const borderPriority = (priority) => {
    if (priority === 1) {
      return "4px solid #b81111";
    }
    if (priority === 2) {
      return "4px solid orange";
    }
    if (priority === 3) {
      return "4px solid grey";
    }
  };

  const getMediaPath = (filename, companyId) => {
    return `${process.env.REACT_APP_BACKEND_URL}/public/company${companyId}/${filename}`;
  };

  const handleShowAnnouncementDialog = (record) => {
    setAnnouncement(record);
    setShowAnnouncementDialog(true);
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? "simple-popover" : undefined;

  return (
    <div>
      <AnnouncementDialog
        announcement={announcement}
        open={showAnnouncementDialog}
        handleClose={() => setShowAnnouncementDialog(false)}
      />
      <IconButton
        variant="contained"
        aria-describedby={id}
        onClick={handleClick}
        size="large">
        <Badge
          color="secondary"
          variant="dot"
          invisible={invisible || announcements.length < 1}
        >
          <AnnouncementIcon style={{ color: "white" }} />
        </Badge>
      </IconButton>
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
      >
        <Paper
          variant="outlined"
          onScroll={handleScroll}
          className={classes.mainPaper}
        >
          <List
            component="nav"
            aria-label="main mailbox folders"
            style={{ minWidth: 300 }}
          >
            {isArray(getTicketsArrayByUser(announcements), user) &&
              announcements.map((item, key) => (
                <ListItem
                  key={key}
                  style={{
                    border: "1px solid #eee",
                    borderLeft: borderPriority(item.priority),
                    cursor: "pointer",
                  }}
                  onClick={() => handleShowAnnouncementDialog(item)}
                >
                  {item.mediaPath && (
                    <ListItemAvatar>
                      <Avatar
                        alt={item.mediaName}
                        src={getMediaPath(item.mediaPath, item.companyId)}
                      />
                    </ListItemAvatar>
                  )}
                  <ListItemText
                    className={classes.listItemText}
                    primary={item.title}
                    secondary={
                      <>
                        <Typography component="span" style={{ fontSize: 12 }}>
                          {moment(item.createdAt).format("DD/MM/YYYY")}
                        </Typography>
                        <span style={{ marginTop: 5, display: "block" }}></span>
                        <Typography 
                          component="div" 
                          variant="body2"
                          className={classes.htmlContent}
                        >
                          {createSanitizedPreview(item.text)}
                        </Typography>
                      </>
                    }
                  />
                </ListItem>
              ))}
            {isArray(announcements) && announcements.length === 0 && (
              <ListItemText primary="Nenhum registro" />
            )}
          </List>
        </Paper>
      </Popover>
    </div>
  );
}