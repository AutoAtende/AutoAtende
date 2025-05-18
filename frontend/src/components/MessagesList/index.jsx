import React, { useState, useEffect, useReducer, useRef, useContext } from "react";
import { isSameDay, parseISO, format } from "date-fns";
import clsx from "clsx";
import { Mutex } from "async-mutex";

import { green, blue, red } from "@mui/material/colors";
import { Avatar, Button, CircularProgress, Divider, IconButton, Badge, Typography } from "@mui/material";

import makeStyles from '@mui/styles/makeStyles';

import {
  AccessTime,
  Block,
  Done,
  Error,
  DoneAll,
  ExpandMore,
  GetApp,
  Description,
  Forward,
} from "@mui/icons-material";

import WhatsMarkedWrapper from "../WhatsMarkedWrapper";
import ModalImageCors from "../ModalImageCors";
import MessageOptionsMenu from "../MessageOptionsMenu";
import whatsBackground from "../../assets/wa-background.png";
import LocationPreview from "../LocationPreview";
import { Checkbox } from "@mui/material";

import whatsBackgroundDark from "../../assets/wa-background-dark.png";

import api from "../../services/api";
import { toast } from "../../helpers/toast";
import { SocketContext } from "../../context/Socket/SocketContext";
import { i18n } from "../../translate/i18n";
import { ReplyMessageContext } from "../../context/ReplyingMessage/ReplyingMessageContext";
import VcardPreview from "../VcardPreview";
import YouTubePreview from "../ModalYoutubeCors";
import { QueueSelectedContext } from "../../context/QueuesSelected/QueuesSelectedContext";

import CustomAudioPlayer from "../Audio/CustomAudioPlayer";
import { GlobalContext } from "../../context/GlobalContext";
import { extractContactInfo } from "../../helpers/extractContactInfoVCard";
import { MessageNotificationUser } from "./MessageNotificationUser";
import MessageReaction from "./MessageReaction";
import { useWhitelabelSettings } from "../../hooks/useWhitelabelSettings";

// Mutex para controlar o carregamento de mensagens
const loadPageMutex = new Mutex();

const useStyles = makeStyles((theme) => ({
  messagesListWrapper: {
    overflow: "hidden",
    position: "relative",
    display: "flex",
    flexDirection: "column",
    flexGrow: 1,
    width: "100%",
    minWidth: 300,
    minHeight: 200,
    height: "calc(100% - 30px)",
  },

  messagesList: {
    backgroundImage: theme.mode === "light"
      ? `url(${whatsBackground})`
      : `url(${whatsBackgroundDark})`,
    display: "flex",
    flexDirection: "column",
    flexGrow: 1,
    padding: "10px",
    overflowY: "scroll",
    overflowX: "hidden",
    breakBefore: 'always',
    pageBreakInside: 'avoid',
    ...theme.scrollbarStyles,
  },

  circleLoading: {
    color: green[500],
    position: "absolute",
    opacity: "70%",
    top: 0,
    left: "50%",
    marginTop: 12,
  },

  messageCenter: {
    textAlign: "center",
    marginTop: 5,
  },

  reactionWrapper: {
    position: "absolute",
    bottom: -10, // Posiciona logo abaixo da mensagem
    right: 35,
    display: "flex",
    alignItems: "center",
    gap: 4,
    zIndex: 2,
  },

reactionBubble: {
  display: "flex",
  alignItems: "center",
  backgroundColor: theme.mode === 'light' ? "#e8e8e8" : "#374045", // Cor adequada para modo dark
  borderRadius: 12,
  padding: "2px 6px",
  boxShadow: "0 1px 2px rgba(0,0,0,0.15)",
  cursor: "pointer",
  "&:hover": {
    backgroundColor: theme.mode === 'light' ? "#d8d8d8" : "#485056",
  }
},

  reactionEmoji: {
    fontSize: "14px",
    lineHeight: "1",
  },

  reactionCount: {
    fontSize: "11px",
    color: theme.mode === 'light' ? "#666" : "#aaa",
    marginLeft: 4,
    lineHeight: "1",
  },

  quotedSideColorLeft: {
    flex: "none",
    width: "4px",
    backgroundColor: "#6bcbef",
  },

  quotedContainerLeft: {
    margin: "6px 6px 6px 6px",
    overflow: "hidden",
    backgroundColor: theme.mode === 'light' ? "#f0f0f0" : "#2a3942", // Cor melhorada para modo dark
    borderRadius: "7.5px",
    display: "flex",
    position: "relative",
    cursor: "pointer",
    maxWidth: "calc(100% - 12px)",
  },
  
  quotedContainerRight: {
    margin: "6px 6px 6px 6px",
    overflowY: "hidden",
    backgroundColor: theme.mode === 'light' ? "#cfe9ba" : "#1f5a4e", // Cor melhorada para modo dark
    borderRadius: "7.5px",
    display: "flex",
    position: "relative",
    maxWidth: "calc(100% - 12px)",
  },

  quotedMsg: {
    padding: 10,
    maxWidth: "calc(100% - 70px)", // Alterado de 300 para cálculo dinâmico
    height: "auto",
    display: "block",
    whiteSpace: "pre-wrap",
    overflow: "hidden",
    wordBreak: "break-word", // Adicionado para melhor quebra de texto
  },

  quotedMsgRight: {
    padding: 10,
    maxWidth: "calc(100% - 70px)", // Alterado de 300 para cálculo dinâmico
    height: "auto",
    whiteSpace: "pre-wrap",
    wordBreak: "break-word", // Adicionado para melhor quebra de texto
  },

  quotedSideColorRight: {
    flex: "none",
    width: "4px",
    backgroundColor: "#35cd96",
  },

  quotedThumbnail: {
    maxWidth: "180px",
    height: "90px",
  },

  messageActionsButton: {
    display: "none",
    position: "relative",
    color: "#999",
    zIndex: 1,
    backgroundColor: "inherit",
    opacity: "90%",
    "&:hover, &.Mui-focusVisible": { backgroundColor: "inherit" },
  },

  messageContactName: {
    display: "flex",
    color: "#6bcbef",
    fontWeight: 500,
  },

  forwardedMessage: {
    display: "flex",
    color: theme.mode === 'light' ? "#999" : "#d0d0d0",
    fontSize: 11,
    fontWeight: 'bold'
  },

  forwardedIcon: {
    color: theme.mode === 'light' ? "#999" : "#d0d0d0",
    fontSize: 15,
    verticalAlign: "middle",
    marginLeft: 4,
  },

  textContentItem: {
    overflowWrap: "break-word",
    wordWrap: "break-word",
    wordBreak: "break-word",
    padding: "3px 40px 4px 6px", // Reduzido ainda mais o padding inferior
    maxWidth: "100%",
  },

  textContentItemDeleted: {
    fontStyle: "italic",
    color: "rgba(0, 0, 0, 0.36)",
    overflowWrap: "break-word",
    padding: "3px 40px 8px 6px", // Reduzido de 18px para 8px
  },

  textContentItemEdited: {
    overflowWrap: "break-word",
    padding: "3px 40px 8px 6px", // Reduzido de 18px para 8px
  },


  messageRightNotificationWarning: {
    marginLeft: 20,
    marginTop: 2,
    minWidth: 100,
    maxWidth: 600,
    width: 'fit-content',
    breakBefore: 'always',
    pageBreakInside: 'avoid',
    height: "auto",
    display: "block",
    position: "relative",
    "&:hover #messageActionsButton": {
      display: "flex",
      position: "absolute",
      top: 0,
      right: 0,
    },
    whiteSpace: "pre-wrap",
    backgroundColor: "#fffde7",
    color: "#424242",
    alignSelf: "flex-end",
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 0,
    paddingLeft: 10,
    paddingRight: 10,
    paddingTop: 8,
    paddingBottom: 12, // Reduzido de 14px para 12px
    boxShadow: "0 1px 1px #b3b3b3",
    borderLeft: '4px solid #ffc107',
  },

  // Ajuste para os contêineres de mídia para padronizar larguras
  mediaContainer: {
    width: "100%",
    maxWidth: "230px", // Reduzido para garantir que caiba dentro da bolha da mensagem
    marginBottom: "5px",
    overflow: "hidden", // Previne que o conteúdo extrapole
  },

  audioContainer: {
    width: "100%",
    maxWidth: "230px",
    marginBottom: "0", // Removida margem inferior
    "& audio": {
      width: "100%",
      maxWidth: "100%"
    },
    "& > div": { // Estilo para o componente CustomAudioPlayer
      width: "100%",
      maxWidth: "100%",
      overflow: "hidden",
    }
  },

  mediaDescription: {
    fontSize: "13px",
    marginTop: "4px",
    overflowWrap: "break-word",
  },

  messageLeft: {
    marginRight: 20,
    marginTop: 2,
    breakBefore: 'always',
    pageBreakInside: 'avoid',
    minWidth: 100,
    maxWidth: 600,
    width: 'fit-content',
    height: "auto",
    display: "block",
    position: "relative",
    "&:hover #messageActionsButton": {
      display: "flex",
      position: "absolute",
      top: 0,
      right: 0,
    },
    whiteSpace: "pre-wrap",
    backgroundColor: theme.mode === 'light' ? "#ffffff" : "#1f2c33", // Cor mais escura para o modo dark
    color: theme.mode === 'light' ? "#303030" : "#ffffff",
    alignSelf: "flex-start",
    borderTopLeftRadius: 0,
    borderTopRightRadius: 8,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    paddingLeft: 5,
    paddingRight: 5,
    paddingTop: 5,
    paddingBottom: 12,
    boxShadow: theme.mode === 'light' ? "0 1px 1px #b3b3b3" : "0 1px 1px #000000",
    marginLeft: 0,
    marginRight: 0,
    transition: 'background-color 0.5s ease-in-out',
  },

  messageRight: {
    marginLeft: 20,
    marginTop: 2,
    minWidth: 100,
    maxWidth: 600,
    width: 'fit-content',
    breakBefore: 'always',
    pageBreakInside: 'avoid',
    height: "auto",
    display: "block",
    position: "relative",
    "&:hover #messageActionsButton": {
      display: "flex",
      position: "absolute",
      top: 0,
      right: 0,
    },
    whiteSpace: "pre-wrap",
    backgroundColor: theme.mode === 'light' ? "#dcf8c6" : "#005c4b",
    color: theme.mode === 'light' ? "#303030" : "#ffffff",
    alignSelf: "flex-end",
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 0,
    paddingLeft: 5,
    paddingRight: 5,
    paddingTop: 5,
    paddingBottom: 16, // Reduzido de 14px para 12px
    boxShadow: theme.mode === 'light' ? "0 1px 1px #b3b3b3" : "0 1px 1px #000000",
    marginLeft: 0,
    marginRight: 0,
    transition: 'background-color 0.5s ease-in-out',
  },

  // 4. Ajuste no timestamp para ficar mais próximo do texto
  timestamp: {
    fontSize: 11,
    position: "absolute",
    bottom: 2,
    right: 5,
    color: theme.mode === 'light' ? "#999" : "#aaaaaa", // Cor mais clara para modo dark
    backgroundColor: "transparent",
    zIndex: 1,
  },

  messageMedia: {
    objectFit: "cover",
    width: "100%", // Usar 100% para ficar dentro do container
    maxWidth: "230px",
    height: "auto",
    maxHeight: "200px",
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
  },

  messageVideo: {
    width: "100%", // Usar 100% para ficar dentro do container
    maxWidth: "230px",
    maxHeight: "400px",
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
  },

  timestamp: {
    fontSize: 11,
    position: "absolute",
    bottom: 3, // Ajustado para ficar mais próximo do fundo
    right: 5,
    color: theme.mode === 'light' ? "#999" : "#d0d0d0",
    backgroundColor: "transparent", // Adicionado para garantir que não seja coberto
    zIndex: 1, // Adicionado para garantir que fique acima de outros elementos
  },

  timestampStickerLeft: {
    backgroundColor: theme.mode === 'light' ? "#ffffff" : "#1f2c33", // Cor consistente com a mensagem
    borderRadius: 8,
    padding: 5,
    boxShadow: theme.mode === 'light' ? "0 1px 1px #b3b3b3" : "0 1px 1px #000000"
  },

  timestampStickerRight: {
    backgroundColor: theme.mode === 'light' ? "#dcf8c6" : "#128c7e",
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 0,
    paddingLeft: 5,
    paddingRight: 5,
    paddingTop: 5,
    paddingBottom: 0,
    boxShadow: theme.mode === 'light' ? "0 1px 1px #b3b3b3" : "0 1px 1px #000000"
  },

  dailyTimestamp: {
    alignItems: "center",
    textAlign: "center",
    alignSelf: "center",
    width: "110px",
    backgroundColor: "#e1f3fb",
    margin: "10px",
    borderRadius: "10px",
    boxShadow: "0 1px 1px #b3b3b3",
  },

  scrollStatus: {
    position: 'fixed',
    bottom: 20,
    left: '50%',
    transform: 'translateX(-50%)',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    color: 'white',
    padding: '10px 20px',
    borderRadius: 20,
    zIndex: 1000,
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },

  ticketNunberClosed: {
    alignItems: "center",
    textAlign: "center",
    alignSelf: "center",
    width: "auto",
    backgroundColor: "#ffebee",
    margin: "10px",
    padding: "8px 16px",
    borderRadius: "10px",
    boxShadow: "0 1px 1px #b3b3b3",
    color: "#d32f2f",
    fontSize: "13px",
    fontWeight: "500",
  },

  ticketNunberOpen: {
    alignItems: "center",
    textAlign: "center",
    alignSelf: "center",
    width: "auto",
    backgroundColor: "#e8f5e9",
    margin: "10px",
    padding: "8px 16px",
    borderRadius: "10px",
    boxShadow: "0 1px 1px #b3b3b3",
    color: "#2e7d32",
    fontSize: "13px",
    fontWeight: "500",
  },

  dailyTimestampText: {
    color: "#808888",
    padding: 8,
    alignSelf: "center",
    marginLeft: "0px",
  },

  ackIcons: {
    fontSize: 18,
    verticalAlign: "middle",
    marginLeft: 4,
  },

  ackDoneReadIcon: {
    color: blue[500],
    fontSize: 18,
    verticalAlign: "middle",
    marginLeft: 4,
  },

  deletedIcon: {
    fontSize: 18,
    verticalAlign: "middle",
    marginRight: 4,
  },

  messageContainer: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: 15, // Aumentado de 2 para 15 para mais espaço
    position: 'relative',
  },

  messageContainerLeft: {
    flexDirection: 'row',
  },

  messageContainerRight: {
    flexDirection: 'row-reverse',
  },

  avatar: {
    width: theme.spacing(4),
    height: theme.spacing(4),
    margin: theme.spacing(0, 1),
  },

  deletedMessage: {
    color: red[200],
    fontStyle: "italic",
    overflowWrap: "break-word",
    padding: "3px 40px 18px 6px", // Aumentado o padding inferior
  },

  ackDoneAllIcon: {
    color: green[500],
    fontSize: 18,
    verticalAlign: "middle",
    marginLeft: 4,
  },
  ackDoneAllIconBlue: {
    color: blue[500],
    fontSize: 18,
    verticalAlign: "middle",
    marginLeft: 4,
  },
  downloadMedia: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "inherit",
    padding: 10,
    maxWidth: "230px", // Limita a largura para evitar extrapolação
    margin: "0 auto", // Centraliza o botão
  },

  previewMedia: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "inherit",
    padding: 10,
    maxWidth: "230px", // Limita a largura
    margin: "0 auto", // Centraliza o botão
  },

  // Para link preview
  linkPreviewThumbnail: {
    width: "100%",
    maxWidth: "230px",
    height: "auto",
  },
  linkPreviewTitle: {
    fontWeight: "bold",
    marginBottom: "4px"
  },
  linkPreviewDescription: {
    marginBottom: "4px"
  },
  linkPreviewUrl: {
    opacity: 0.6
  },
  linkPreviewAnchor: {
    textDecoration: "none",
    color: theme.mode === 'light' ? "#303030" : "#ffffff",
    maxWidth: "100%",
    display: "block",
  },

  // Para destaque de mensagens
  messageHighlighted: {
    backgroundColor: theme.palette.primary.main,
    transition: 'background-color 0.5s ease'
  },

  // Para indicadores de digitação e gravação
  wave: {
    position: 'relative',
    textAlign: 'center',
    height: "30px",
    marginTop: "10px",
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  dot: {
    display: "inline-block",
    width: "7px",
    height: "7px",
    borderRadius: "50%",
    marginRight: "3px",
    background: theme.mode === 'light' ? "#303030" : "#ffffff",
    animation: "wave 1.3s linear infinite",
    "&:nth-child(2)": {
      animationDelay: "-1.1s",
    },
    "&:nth-child(3)": {
      animationDelay: "-0.9s",
    }
  },

  wavebarsContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    height: "30px",
    marginTop: "5px",
    marginBottom: "5px",
    marginLeft: "auto",
    marginRight: "auto",
    "--boxSize": "5px",
    "--gutter": "4px",
    width: "calc((var(--boxSize) + var(--gutter)) * 5)",
  },

  wavebars: {
    transform: "scaleY(.4)",
    height: "100%",
    width: "var(--boxSize)",
    animationDuration: "1.2s",
    backgroundColor: theme.mode === 'light' ? "#303030" : "#ffffff",
    animationTimingFunction: 'ease-in-out',
    animationIterationCount: 'infinite',
    borderRadius: '8px',
  },

  wavebar1: {
    animationName: 'quiet'
  },
  wavebar2: {
    animationName: 'normal'
  },
  wavebar3: {
    animationName: 'quiet'
  },
  wavebar4: {
    animationName: 'loud'
  },
  wavebar5: {
    animationName: 'quiet'
  },

  // Animações para os indicadores
  '@global': {
    '@keyframes wave': {
      '0%, 60%, 100%': {
        transform: 'initial',
      },
      '30%': {
        transform: 'translateY(-15px)',
      },
    },
    '@keyframes quiet': {
      '25%': {
        transform: 'scaleY(.6)'
      },
      '50%': {
        transform: 'scaleY(.4)',
      },
      '75%': {
        transform: 'scaleY(.8)',
      }
    },
    '@keyframes normal': {
      '25%': {
        transform: 'scaleY(.1)'
      },
      '50%': {
        transform: 'scaleY(.4)',
      },
      '75%': {
        transform: 'scaleY(.6)',
      }
    },
    '@keyframes loud': {
      '25%': {
        transform: 'scaleY(1)'
      },
      '50%': {
        transform: 'scaleY(.4)',
      },
      '75%': {
        transform: 'scaleY(1.2)',
      }
    },
  },
}));

// Modificação na função reducer
const reducer = (state, action) => {
  if (action.type === "LOAD_MESSAGES") {
    const messages = action.payload;
    const newMessages = [];

    messages.forEach((message) => {
      const messageIndex = state.findIndex((m) => m?.id === message.id);
      if (messageIndex !== -1) {
        state[messageIndex] = message;
      } else {
        newMessages.push(message);
      }
    });

    return [...newMessages, ...state];
  }

  if (action.type === "ADD_MESSAGE") {
    const newMessage = action.payload;

    // Verificação básica de ID duplicado primeiro
    const messageIndex = state.findIndex((m) => m?.id === newMessage.id);
    if (messageIndex !== -1) {
      // Se a mensagem já existir, apenas atualize-a
      const newState = [...state];
      newState[messageIndex] = {
        ...state[messageIndex],
        ...newMessage,
        internalMessage: newMessage.internalMessage || state[messageIndex].internalMessage,
        ack: newMessage.ack || state[messageIndex].ack
      };
      return newState;
    }

    // Verificar se é uma mensagem vazia que segue uma mensagem de mídia
    const isEmptyAfterMedia = newMessage.body === "" &&
      !newMessage.mediaUrl &&
      state.length > 0 &&
      state[state.length - 1].mediaUrl &&
      state[state.length - 1].fromMe === newMessage.fromMe &&
      Math.abs(new Date(newMessage.createdAt) - new Date(state[state.length - 1].createdAt)) < 2000;

    // Se for uma mensagem vazia após mídia e não tiver metadados importantes, ignorar
    if (isEmptyAfterMedia && !newMessage.isDeleted) {
      return state;
    }

    // Verificação de duplicidade de conteúdo (menos rigorosa)
    const similarMessage = state.find(m =>
      m.body === newMessage.body &&
      m.fromMe === newMessage.fromMe &&
      Math.abs(new Date(m.createdAt) - new Date(newMessage.createdAt)) < 5000 &&
      m.mediaUrl === newMessage.mediaUrl
    );

    if (similarMessage) {
      return state;
    }

    // Caso contrário, adiciona a nova mensagem
    return [...state, newMessage];
  }

  if (action.type === "UPDATE_MESSAGE") {
    const messageToUpdate = action.payload;
    const messageIndex = state.findIndex((m) => m?.id === messageToUpdate.id);

    if (messageIndex !== -1) {
      // Preservar propriedades importantes da mensagem original
      const updatedMessage = {
        ...state[messageIndex],
        ...messageToUpdate,
        internalMessage: messageToUpdate.internalMessage || state[messageIndex].internalMessage,
        isEdited: messageToUpdate.isEdited || state[messageIndex].isEdited,
        reactions: messageToUpdate.reactions || state[messageIndex].reactions
      };

      const newState = [...state];
      newState[messageIndex] = updatedMessage;
      return newState;
    }

    return [...state];
  }

  if (action.type === "RESET") {
    return [];
  }

  return state;
};

const MessagesList = ({
  ticket,
  ticketId,
  isGroup,
  showSelectMessageCheckbox,
  setShowSelectMessageCheckbox,
  setSelectedMessagesList,
  selectedMessagesList,
  forwardMessageModalOpen,
  setForwardMessageModalOpen
}) => {
  const classes = useStyles();
  const { settings } = useWhitelabelSettings();

  const [messagesList, dispatch] = useReducer(reducer, []);
  const [pageNumber, setPageNumber] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef();
  const [contactPresence, setContactPresence] = useState("available");
  const [selectedMessage, setSelectedMessage] = useState({});
  const [selectedMessageData, setSelectedMessageData] = useState({});
  const { setReplyingMessage } = useContext(ReplyMessageContext);
  const [anchorEl, setAnchorEl] = useState(null);
  const messageOptionsMenuOpen = Boolean(anchorEl);
  const currentTicketId = useRef(ticketId);
  const { selectedQueuesMessage } = useContext(QueueSelectedContext);
  const socketManager = useContext(SocketContext);
  const { setMakeRequestTagTotalTicketPending } = useContext(GlobalContext);
  const [trackingRecords, setTrackingRecords] = useState([]);
  const [scrollStatus, setScrollStatus] = useState({
    loading: false,
    message: null
  });

const displayProfileImages = settings.loadProfileImages.value;

  useEffect(() => {
    dispatch({ type: "RESET" });
    setPageNumber(1);
    setContactPresence("available");

    currentTicketId.current = ticketId;
  }, [ticketId, selectedQueuesMessage]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
  
      if (ticketId === undefined) return;
  
      try {
        await loadPageMutex.runExclusive(async () => {
          const { data } = await api.get("/messages/" + ticketId, {
            params: { pageNumber, selectedQueues: JSON.stringify(selectedQueuesMessage) },
          });
  
          if (currentTicketId.current === ticketId) {
            dispatch({ type: "LOAD_MESSAGES", payload: data.messages });
            setHasMore(data.hasMore);
            setTrackingRecords(data.trackingRecords || []); // Armazenar registros de rastreamento
            setLoading(false);
          }
  
          if (pageNumber === 1 && data.messages.length > 1) {
            scrollToBottom();
          }
        });
      } catch (err) {
        setLoading(false);
        toast.error(err);
      }
    };
  
    loadData();
  }, [pageNumber, ticketId, selectedQueuesMessage]);

  useEffect(() => {
    const companyId = localStorage.getItem("companyId");
    const socket = socketManager.GetSocket(companyId);

    const onConnect = () => {
      socket.emit("joinChatBox", ticket?.id || ticketId);
    };

    socketManager.onConnect(onConnect);

    // Gerenciar mensagens recebidas via socket
    const onAppMessage = (data) => {
      setMakeRequestTagTotalTicketPending(Math.random());

      if (data.action === "create" && data.message.ticketId === currentTicketId.current) {
        dispatch({
          type: "ADD_MESSAGE",
          payload: {
            ...data.message,
            internalMessage: data.message.internalMessage === true,
            ack: data.message.ack || 0
          }
        });

        const isAtBottom = checkIfUserIsAtBottom();
        if (isAtBottom) {
          scrollToBottom();
        }
      }

      if (data.action === "update" && data.message.ticketId === currentTicketId.current) {
        // Preserva o estado de mensagem editada
        const existingMessage = messagesList.find((m) => m.id === data.message.id);
        if (existingMessage?.isEdited) {
          data.message.isEdited = true;
        }
        dispatch({ type: "UPDATE_MESSAGE", payload: data.message });
      }
    };

    // Remover listeners antigos antes de adicionar novos
    socket.off(`company-${companyId}-appMessage`);
    socket.on(`company-${companyId}-appMessage`, onAppMessage);

    // Adicionar listener para o status de presença do contato
    socket.on(`company-${companyId}-presence`, (data) => {
      if (data?.ticketId === ticket?.id) {
        setContactPresence(data.presence);
        const isAtBottom = checkIfUserIsAtBottom();
        if (["composing", "recording"].includes(data.presence)) {
          if (isAtBottom) {
            scrollToBottom();
          }
        }
      }
    });

    return () => {
      socket.off(`company-${companyId}-appMessage`, onAppMessage);
      socket.off(`company-${companyId}-presence`);
    };
  }, [ticketId, ticket, socketManager, messagesList]);

  const checkIfUserIsAtBottom = () => {
    if (!scrollRef.current) return true;

    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    return scrollTop + clientHeight >= (scrollHeight - clientHeight / 4);
  };

  const handleSelectMessage = (e, message) => {
    const list = [...selectedMessagesList]; // Criar cópia para não modificar diretamente

    // Verificar se a mensagem já está na lista
    const index = list.findIndex((m) => m.id === message.id);

    if (e.target.checked) {
      if (index >= 0) return; // Já está na lista, não faz nada

      if (list.length >= 4) {
        toast.error("Não é possível selecionar mais de 4 mensagens para encaminhar.");
        return;
      }

      list.push(message);
    } else {
      if (index >= 0) {
        list.splice(index, 1);
      }
    }

    setSelectedMessagesList(list);
  };

  const SelectMessageCheckbox = ({ message, showSelectMessageCheckbox }) => {
    if (showSelectMessageCheckbox) {
      return <Checkbox aria-label="" color="primary" onChange={(e) => handleSelectMessage(e, message)} />;
    } else {
      return null;
    }
  };

  const loadMore = async () => {
    await loadPageMutex.runExclusive(async () => {
      setPageNumber((prevPageNumber) => prevPageNumber + 1);
    });
  };

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  const scrollToMessage = async (id) => {
    const element = document.getElementById(id);

    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      element.classList.add(classes.messageHighlighted);
      setTimeout(() => {
        element.classList.remove(classes.messageHighlighted);
      }, 2000);
      return;
    }

    // Se a mensagem não está visível, iniciamos a busca
    setScrollStatus({ loading: true, message: "Localizando mensagem..." });

    try {
      const lastMessageIds = {};
      let foundPageNumber = null;

      // Mostra aviso de que pode demorar
      setScrollStatus({ loading: true, message: "Buscando em mensagens antigas, pode levar alguns instantes..." });

      // Procura a mensagem nas páginas disponíveis
      for (let pageNumber = 1; pageNumber <= 11; pageNumber++) {
        const { data } = await api.get("/messages/" + ticketId, {
          params: { pageNumber, selectedQueues: JSON.stringify(selectedQueuesMessage) },
        });

        if (data.messages.length) {
          const foundMessage = data.messages.find(message => message.id === id);
          if (foundMessage) {
            lastMessageIds[pageNumber] = data.messages[0].id;
            foundPageNumber = pageNumber;
            break;
          }
          lastMessageIds[pageNumber] = data.messages[0].id;
        } else {
          break;
        }
      }

      if (foundPageNumber) {
        // Rola para cada mensagem de referência enquanto carrega mais páginas
        for (const pageNumber in lastMessageIds) {
          const lastMessageId = lastMessageIds[pageNumber];
          const element = await waitForElement(lastMessageId);

          if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
            element.classList.add(classes.messageHighlighted);
            setTimeout(() => {
              element.classList.remove(classes.messageHighlighted);
            }, 500);

            // Carrega mais mensagens se necessário
            if (pageNumber < foundPageNumber) {
              setPageNumber(prev => prev + 1);
            }
          } else {
            setScrollStatus({ loading: false, message: null });
            toast.error("Não foi possível localizar a mensagem.");
            return;
          }
        }

        // Aguarda a mensagem desejada aparecer
        const targetElement = await waitForElement(id);
        if (targetElement) {
          targetElement.scrollIntoView({ behavior: 'smooth' });
          targetElement.classList.add(classes.messageHighlighted);
          setTimeout(() => {
            targetElement.classList.remove(classes.messageHighlighted);
            setScrollStatus({ loading: false, message: null });
          }, 2000);
        } else {
          setScrollStatus({ loading: false, message: null });
          toast.error("Mensagem não encontrada após carregar todas as páginas.");
        }
      } else {
        setScrollStatus({ loading: false, message: null });
        toast.error("Mensagem não encontrada.");
      }
    } catch (err) {
      setScrollStatus({ loading: false, message: null });
      toast.error("Ocorreu um erro ao buscar a mensagem.");
      console.error(err);
    }
  };

  // Função auxiliar para esperar por um elemento
  const waitForElement = async (elementId, maxRetries = 30, delay = 500) => {
    for (let i = 0; i < maxRetries; i++) {
      const element = document.getElementById(elementId);
      if (element) return element;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
    return null;
  };

  const handleScroll = (e) => {
    if (!hasMore) return;
    const { scrollTop } = e.currentTarget;

    if (scrollTop === 0) {
      document.getElementById("messagesList").scrollTop = 1;
    }

    if (loading) {
      return;
    }

    if (scrollTop < 50) {
      loadMore();
    }
  };

  const handleOpenMessageOptionsMenu = (e, message, data) => {
    setAnchorEl(e.currentTarget);
    setSelectedMessage(message);
    setSelectedMessageData(data);
  };

  const handleCloseMessageOptionsMenu = (e) => {
    setAnchorEl(null);
  };

  // Nova função para tratamento de links
  const renderLinkPreview = (message) => {
    try {
      const data = JSON.parse(message.dataJson);

      const contextInfo = getDataContextInfo(data);
      if (!contextInfo) return null;

      const title = contextInfo.title;
      const description = contextInfo.description;
      const canonicalUrl = contextInfo.matchedText;

      if (!title && !description && !canonicalUrl) {
        return null;
      }

      const thumbnail = contextInfo.jpegThumbnail;
      const imageUrl = thumbnail ? `data:image/jpeg;base64,${thumbnail}` : "";

      return (
        <a href={canonicalUrl} className={classes.linkPreviewAnchor} target="_blank" rel="noopener noreferrer">
          <div className={clsx(classes.quotedContainerLeft, {
            [classes.quotedContainerRight]: message.fromMe,
          })}>
            <div className={classes.quotedMsg}>
              {title && <div className={classes.linkPreviewTitle}>{title}</div>}
              {description && <div className={classes.linkPreviewDescription}>{description}</div>}
              {canonicalUrl && <div className={classes.linkPreviewUrl}>{new URL(canonicalUrl).hostname}</div>}
            </div>
            {!message.thumbnailUrl && imageUrl && (
              <img className={classes.quotedThumbnail} src={imageUrl} alt={title || "Link Preview"} />
            )}
          </div>
        </a>
      );
    } catch (error) {
      console.error("Erro ao renderizar preview de link:", error);
      return null;
    }
  };

  // Função auxiliar para obter informações de contexto
  const getDataContextInfo = (data) => {
    if (!data) {
      return null;
    }

    return data.message?.extendedTextMessage?.contextInfo ||
      data.message?.imageMessage?.contextInfo ||
      data.message?.videoMessage?.contextInfo ||
      data.message?.audioMessage?.contextInfo ||
      data.message?.documentMessage?.contextInfo ||
      data.message?.stickerMessage?.contextInfo ||
      data.message?.productMessage?.contextInfo ||
      data.message?.locationMessage?.contextInfo ||
      data.message?.liveLocationMessage?.contextInfo ||
      data.message?.contactMessage?.contextInfo ||
      data.message?.listMessage?.contextInfo ||
      data.message?.buttonsResponseMessage?.contextInfo ||
      data.message?.paymentMessage?.contextInfo ||
      data.message?.orderMessage?.contextInfo ||
      data.message?.productCatalogMessage?.contextInfo ||
      data.message?.templateButtonReplyMessage?.contextInfo ||
      data.message?.templateMessage?.contextInfo ||
      data.message?.documentWithCaptionMessage?.contextInfo || null;
  };

  const checkMessageMedia = (message) => {
    let data;
    try {
      data = JSON.parse(message.dataJson);
    } catch (error) {
      console.error("Erro ao parsear dataJson:", error);
      data = {};
    }

    const document =
      data?.message?.documentMessage
      || data?.message?.documentWithCaptionMessage?.message?.documentMessage;

    if (message.mediaType === 'contactsArrayMessage') {
      var body = data;
      var contacts = body.message?.contactsArrayMessage?.contacts || [];

      return (
        <div>
          {contacts.map((contact, index) => {
            // Nome do contato
            var nome_contato = contact.displayName;

            // Todos os dados de Vcard
            var vcard = contact.vcard;

            // Usar regex para encontrar o número de telefone
            var regex = /TEL(;waid=\d+)?:(\+?\d[\d\s\-]+)/;
            var match = vcard.match(regex);

            if (match) {
              // Formatar o número de telefone
              var numero_completo = match[2].replace(/[\s\-\+]/g, '');

              return <VcardPreview key={index} contact={nome_contato} numbers={numero_completo} comandoAdicional={"<br>"} ticket={ticket} />;
            } else {
              return <VcardPreview key={index} contact={"Sem_Numero"} numbers={''} comandoAdicional={"<br>"} ticket={ticket} />;
            }
          })}
        </div>
      );
    } else if (
      message.mediaType === "locationMessage" &&
      message.body.split("|").length >= 2
    ) {
      let locationParts = message.body.split("|");
      let imageLocation = locationParts[0];
      let linkLocation = locationParts[1];

      let descriptionLocation = null;

      if (locationParts.length > 2)
        descriptionLocation = message.body.split("|")[2];

      return (
        <LocationPreview
          image={imageLocation}
          link={linkLocation}
          description={descriptionLocation}
        />
      );
    } else if (message.mediaType === "contactMessage") {
      var body = data;
      let array = body.message?.contactMessage?.vcard.split("\n") || [];
      const contactData = extractContactInfo(array);

      return <VcardPreview contact={contactData?.name} numbers={contactData?.phoneNumber} ticket={ticket} />;
    } else if (!document && message.mediaType === "image") {
      return (
        <div className={classes.mediaContainer}>
          <ModalImageCors imageUrl={message.mediaUrl} isDeleted={message.isDeleted} />
        </div>
      );
    } else if (!document && message.mediaType === "audio") {
      return (
        <div className={classes.audioContainer}>
          <CustomAudioPlayer src={message.mediaUrl} />
          {
            message.body &&
            !message.body.startsWith("Áudio") &&
            <div className={classes.mediaDescription} style={{ marginTop: "2px" }}>
              {message.body}
            </div>
          }
        </div>
      );
    } else if (!document && message.mediaType === "video") {
      return (
        <div className={classes.mediaContainer}>
          <video
            className={classes.messageVideo}
            src={message.mediaUrl}
            controls
          />
        </div>
      );
    } else if (message.mediaType === "docummentMessage") {
      return (
        <>
          <div className={classes.previewMedia}>
            <Button
              startIcon={<Description />}
              endIcon={<GetApp />}
              color="primary"
              variant="outlined"
              target="_blank"
              href={message.mediaUrl}
              style={{ maxWidth: "100%", overflow: "hidden", textOverflow: "ellipsis" }}
            >
              {document?.fileName || "Download"}
            </Button>
          </div>
          {document?.caption && document.caption !== document?.fileName && (
            <>
              <Divider />
              <div className={clsx({
                [classes.textContentItemDeleted]: message.isDeleted,
              })}>
                <WhatsMarkedWrapper>
                  {document.caption}
                </WhatsMarkedWrapper>
              </div>
            </>
          )}
        </>
      );
    } else {
      return (
        <>
          <div className={classes.downloadMedia}>
            <Button
              startIcon={<GetApp />}
              color="primary"
              variant="outlined"
              target="_blank"
              href={message.mediaUrl}
              style={{ maxWidth: "100%", overflow: "hidden", textOverflow: "ellipsis" }}
            >
              Download
            </Button>
          </div>
          {document?.caption && document.caption !== document?.fileName && (
            <>
              <Divider />
              <div className={clsx({
                [classes.textContentItemDeleted]: message.isDeleted,
              })}>
                <WhatsMarkedWrapper>
                  {document.caption}
                </WhatsMarkedWrapper>
              </div>
            </>
          )}
        </>
      );
    }
  };

  const renderMessageAck = (message) => {
    if (message.ack === 0) {
      return <Error fontSize="small" className={classes.ackIcons} />;
    }
    if (message.ack === 1 && message.fromMe === false) {
      return <AccessTime fontSize="small" className={classes.ackIcons} />;
    } else if (message.ack === 1 && message.fromMe === true) {
      return <Done fontSize="small" className={classes.ackIcons} />;
    }
    if (message.ack === 2) {
      return <Done fontSize="small" className={classes.ackIcons} />;
    }
    if (message.ack === 3) {
      return <DoneAll fontSize="small" className={classes.ackIcons} />;
    }
    if (message.ack === 4) {
      return <DoneAll fontSize="small" className={classes.ackDoneAllIcon} />;
    }
    if (message.ack === 5) {
      return <DoneAll fontSize="small" className={classes.ackDoneAllIconBlue} />;
    }
  };

  const renderDailyTimestamps = (message, index) => {
    if (index === 0) {
      return (
        <span
          className={classes.dailyTimestamp}
          key={`timestamp-${message.id}`}
        >
          <div className={classes.dailyTimestampText}>
            {format(parseISO(messagesList[index].createdAt), "dd/MM/yyyy")}
          </div>
        </span>
      );
    }
    if (index < messagesList.length - 1) {
      let messageDay = parseISO(messagesList[index].createdAt);
      let previousMessageDay = parseISO(messagesList[index - 1].createdAt);

      if (!isSameDay(messageDay, previousMessageDay)) {
        return (
          <span
            className={classes.dailyTimestamp}
            key={`timestamp-${message.id}`}
          >
            <div className={classes.dailyTimestampText}>
              {format(parseISO(messagesList[index].createdAt), "dd/MM/yyyy")}
            </div>
          </span>
        );
      }
    }
    if (index === messagesList.length - 1) {
      return (
        <div
          key={`ref-${message.createdAt}`}
          style={{ float: "left", clear: "both" }}
        />
      );
    }
  };

  const isNearTrackingEvent = (message, eventType) => {
    if (!trackingRecords || trackingRecords.length === 0) return false;
    
    const messageTime = new Date(message.createdAt).getTime();
    
    // Verificar se a mensagem está próxima a um evento de rastreamento (dentro de 2 minutos)
    return trackingRecords.some(record => {
      if (eventType === 'start' && record.startedAt) {
        const startTime = new Date(record.startedAt).getTime();
        return Math.abs(messageTime - startTime) < 2 * 60 * 1000; // 2 minutos
      }
      if (eventType === 'end' && record.finishedAt) {
        const endTime = new Date(record.finishedAt).getTime();
        return Math.abs(messageTime - endTime) < 2 * 60 * 1000; // 2 minutos
      }
      return false;
    });
  };
  
  // Encontrar os registros de rastreamento mais próximos da mensagem
  const findNearestTrackingRecord = (message, eventType) => {
    if (!trackingRecords || trackingRecords.length === 0) return null;
    
    const messageTime = new Date(message.createdAt).getTime();
    let nearestRecord = null;
    let smallestDiff = Infinity;
    
    trackingRecords.forEach(record => {
      const recordTime = eventType === 'start' 
        ? (record.startedAt ? new Date(record.startedAt).getTime() : null)
        : (record.finishedAt ? new Date(record.finishedAt).getTime() : null);
      
      if (recordTime) {
        const timeDiff = Math.abs(messageTime - recordTime);
        if (timeDiff < smallestDiff && timeDiff < 2 * 60 * 1000) { // 2 minutos
          smallestDiff = timeDiff;
          nearestRecord = record;
        }
      }
    });
    
    return nearestRecord;
  };
  
  // Atualizar a função renderNumberTicket para usar os eventos de rastreamento
  const renderNumberTicket = (message, index) => {
    // Verificar início de atendimento
    if (isNearTrackingEvent(message, 'start')) {
      const startRecord = findNearestTrackingRecord(message, 'start');
      if (startRecord) {
        return (
          <center key={`service-start-${message.id}`}>
            <div className={classes.ticketNunberOpen}>
              Conversa iniciada:{" "}
              {format(parseISO(startRecord.startedAt), "dd/MM/yyyy HH:mm:ss")}
            </div>
          </center>
        );
      }
    }
    
    // Verificar fim de atendimento
    if (isNearTrackingEvent(message, 'end')) {
      const endRecord = findNearestTrackingRecord(message, 'end');
      if (endRecord) {
        return (
          <center key={`service-end-${message.id}`}>
            <div className={classes.ticketNunberClosed}>
              Conversa encerrada:{" "}
              {format(parseISO(endRecord.finishedAt), "dd/MM/yyyy HH:mm:ss")}
            </div>
          </center>
        );
      }
    }
        
    return null;
  };

  const renderContactAvatar = (ticket, message) => {
    if (displayProfileImages === "disabled") {
      return <div className={classes.avatar} />;
    }

    // Obtém a URL do frontend a partir da variável de ambiente
    const frontendUrl = process.env.REACT_APP_FRONTEND_URL;

    // Monta a URL completa da foto de perfil do contato
    const contactProfilePicUrl = ticket.contact?.profilePicUrl
      ? ticket.contact.profilePicUrl
      : `${frontendUrl}/nopicture.png`; // Fallback

    // Nome do contato (com fallback)
    const contactName = ticket.contact?.name || "Contato";

    if (!message.fromMe) {
      return (
        <Avatar
          src={contactProfilePicUrl}
          alt={contactName}
          className={classes.avatar}
        >
          {/* Exibe iniciais se não houver imagem */}
          {!ticket.contact?.profilePicUrl && contactName[0]}
        </Avatar>
      );
    }
    return <div className={classes.avatar} />;
  };

  // Função para renderizar o avatar do usuário
  const renderUserAvatar = (ticket, message) => {
    if (displayProfileImages === "disabled") {
      return <div className={classes.avatar} />;
    }

    // Obtém a URL do backend a partir da variável de ambiente
    const backendUrl = process.env.REACT_APP_BACKEND_URL;
    const frontendUrl = process.env.REACT_APP_FRONTEND_URL;

    // Monta a URL completa da foto de perfil
    const userProfilePicUrl = ticket.user?.profilePic
      ? `${backendUrl}/public/company${ticket.companyId}/profile/${ticket.user.profilePic}`
      : `${frontendUrl}/nopicture.png`; // Fallback caso não haja foto

    // Nome do usuário (com fallback)
    const userName = ticket.user?.name || "Usuário";

    // Renderiza o avatar
    if (message.fromMe && userProfilePicUrl) {
      return (
        <Avatar
          src={userProfilePicUrl}
          alt={userName}
          className={classes.avatar}
        />
      );
    }

    // Espaço reservado para manter o alinhamento
    return <div className={classes.avatar} />;
  };

  const renderMessageDivider = (message, index) => {
    if (index < messagesList.length && index > 0) {
      let messageUser = messagesList[index].fromMe;
      let previousMessageUser = messagesList[index - 1].fromMe;

      if (messageUser !== previousMessageUser) {
        return (
          <span style={{ marginTop: 16 }} key={`divider-${message.id}`}></span>
        );
      }
    }
  };

  const getQuotedMessageText = (quotedMsg) => {
    // Se for áudio, mostra uma indicação de áudio
    if (quotedMsg?.mediaType === "audio") {
      return "🎵 Áudio";
    }
    
    // Se for outro tipo de mídia sem corpo
    if (!quotedMsg?.body && quotedMsg?.mediaUrl) {
      if (quotedMsg?.mediaType === "image") {
        return "📷 Imagem";
      }
      if (quotedMsg?.mediaType === "video") {
        return "🎥 Vídeo";
      }
      if (quotedMsg?.mediaType === "document") {
        return "📎 Documento";
      }
      return "📎 " + quotedMsg.mediaUrl.split("/").pop();
    }
  
    return quotedMsg?.body;
  };

  const renderQuotedMessage = (message) => {
    let data = {};
    try {
      if (message.quotedMsg.dataJson) {
        data = JSON.parse(message.quotedMsg.dataJson);
      }
    } catch (error) {
      console.error("Erro ao parsear dataJson da mensagem citada:", error);
    }
  
    const quotedMsg = message.quotedMsg;
    const thumbnail = data?.message?.imageMessage?.jpegThumbnail;
    const mediaUrl = quotedMsg?.mediaType === "image" ? quotedMsg.mediaUrl : null;
    const imageUrl = thumbnail ? `data:image/jpeg;base64,${thumbnail}` : mediaUrl;
  
    // Ícone especial para áudio
    let mediaIcon = null;
    if (quotedMsg?.mediaType === "audio") {
      mediaIcon = "🎵";
    } else if (quotedMsg?.mediaType === "video") {
      mediaIcon = "🎥";
    } else if (quotedMsg?.mediaType === "image") {
      mediaIcon = "📷";
    } else if (quotedMsg?.mediaType === "document") {
      mediaIcon = "📎";
    }
  
    return (
      <div
        className={clsx(classes.quotedContainerLeft, {
          [classes.quotedContainerRight]: message.fromMe,
        })}
        onClick={() => scrollToMessage(message.quotedMsg.id)}
      >
        <span
          className={clsx(classes.quotedSideColorLeft, {
            [classes.quotedSideColorRight]: message.quotedMsg?.fromMe,
          })}
        ></span>
        <div className={classes.quotedMsg}>
          {!message.quotedMsg?.fromMe && (
            <span className={classes.messageContactName}>
              {message.quotedMsg?.contact?.name}
            </span>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            {mediaIcon && <span style={{ fontSize: '14px' }}>{mediaIcon}</span>}
            <WhatsMarkedWrapper>{getQuotedMessageText(message.quotedMsg)}</WhatsMarkedWrapper>
          </div>
        </div>
        {imageUrl && (
          <img className={classes.quotedThumbnail} src={imageUrl} alt="Thumbnail" />
        )}
      </div>
    );
  };

  const isYouTubeLink = (url) => {
    if (!url) return false;
    const youtubeRegex = /(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    return youtubeRegex.test(url);
  };

  const renderMessages = () => {
    const viewMessagesList = messagesList.map((message, index) => {

      if (message.mediaType === "reactionMessage") {
        return null;
      }

      // Verificar se é uma mensagem vazia após mídia (validação para não renderizar)
      if (
        index > 0 &&
        messagesList[index - 1].mediaUrl &&
        message.body === "" &&
        !message.mediaUrl &&
        message.fromMe === messagesList[index - 1].fromMe &&
        Math.abs(new Date(message.createdAt) - new Date(messagesList[index - 1].createdAt)) < 2000
      ) {
        return null; // Não renderiza mensagens vazias após mensagens de mídia
      }

      let data = {};
      try {
        data = JSON.parse(message.dataJson || "{}");
      } catch (error) {
        console.error("Erro ao parsear dataJson:", error);
      }

      const dataContext = getDataContextInfo(data);
      const isSticker = data?.message && ("stickerMessage" in data.message);
      const isForwarded = dataContext?.isForwarded || false;

      if (message.mediaType === "call_log") {
        return (
          <React.Fragment key={message.id}>
            {renderDailyTimestamps(message, index)}
            {/*{renderNumberTicket(message, index)}*/}
            {renderMessageDivider(message, index)}
            <div
              id={message.id}
              className={classes.messageCenter}
              onDoubleClick={() => setReplyingMessage(message)}
            >
              <SelectMessageCheckbox showSelectMessageCheckbox={showSelectMessageCheckbox}
                message={message} />
              <IconButton
                variant="contained"
                size="small"
                id="messageActionsButton"
                disabled={message.isDeleted}
                className={classes.messageActionsButton}
                onClick={(e) => handleOpenMessageOptionsMenu(e, message, data)}
              >
                <ExpandMore />
              </IconButton>
              {isGroup && (
                <span className={classes.messageContactName}>
                  {message.contact?.name}
                </span>
              )}
              <div>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 17" width="20" height="17">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 17"
                    width="20"
                    height="17"
                  >
                    <path
                      fill="#df3333"
                      d="M18.2 12.1c-1.5-1.8-5-2.7-8.2-2.7s-6.7 1-8.2 2.7c-.7.8-.3 2.3.2 2.8.2.2.3.3.5.3 1.4 0 3.6-.7 3.6-.7.5-.2.8-.5.8-1v-1.3c.7-1.2 5.4-1.2 6.4-.1l.1.1v1.3c0 .2.1.4.2.6.1.2.3.3.5.4 0 0 2.2.7 3.6.7.2 0 1.4-2 .5-3.1zM5.4 3.2l4.7 4.6 5.8-5.7-.9-.8L10.1 6 6.4 2.3h2.5V1H4.1v4.8h1.3V3.2z"
                    ></path>
                  </svg>
                  {" "}
                  <span>
                    Chamada de voz/vídeo perdida às{" "}
                    {format(parseISO(message.createdAt), "HH:mm")}
                  </span>
                </svg>
              </div>
            </div>
          </React.Fragment>
        );
      }

      if (!message.fromMe) {
        return (
          <React.Fragment key={message.id}>
            {renderDailyTimestamps(message, index)}
            {/*{renderNumberTicket(message, index)}*/}
            {renderMessageDivider(message, index)}
            <div className={clsx(classes.messageContainer, classes.messageContainerLeft)}>
              {renderContactAvatar(ticket, message)}
              <div id={message.id} className={classes.messageLeft}>
                <SelectMessageCheckbox showSelectMessageCheckbox={showSelectMessageCheckbox}
                  message={message} />
                <IconButton
                  variant="contained"
                  size="small"
                  id="messageActionsButton"
                  disabled={message.isDeleted}
                  className={classes.messageActionsButton}
                  onClick={(e) => handleOpenMessageOptionsMenu(e, message, data)}
                >
                  <ExpandMore />
                </IconButton>

                {isForwarded && (
                  <span className={classes.forwardedMessage}>
                    <Forward fontSize="small" className={classes.forwardedIcon} /> {i18n.t("message.forwarded")}
                  </span>
                )}

                {isGroup && (
                  <span className={classes.messageContactName}>
                    {message.contact?.name}
                  </span>
                )}

                {isYouTubeLink(message.body) && (
                  <YouTubePreview videoUrl={message.body} />
                )}

                {/* Aviso de mensagem apagada pelo contato */}
                {message.isDeleted && (
                  <div>
                    <span className={classes.deletedMessage}>
                      🚫 {i18n.t("message.deleted")} &nbsp;
                    </span>
                  </div>
                )}

                {renderLinkPreview(message)}

                {(message.mediaUrl || message.mediaType === "locationMessage" || message.mediaType === 'contactMessage' || message.mediaType === 'contactsArrayMessage') && checkMessageMedia(message)}

                <div className={[clsx(classes.textContentItem, {
                  [classes.textContentItemDeleted]: message.isDeleted,
                  [classes.textContentItemEdited]: message.isEdited
                }),
                ]}
                >
                  {message.quotedMsg && renderQuotedMessage(message)}

                  {message.mediaType !== "reactionMessage" && (
                    <WhatsMarkedWrapper>
                      {message.mediaType === "locationMessage" || message.mediaType === "contactMessage" || message.mediaType === 'contactsArrayMessage'
                        ? null
                        : message.body}
                    </WhatsMarkedWrapper>
                  )}

                  <MessageReaction
                    message={message}
                    classes={classes}
                  />

                  <span className={classes.timestamp}>
                    {message.isEdited && <span>{i18n.t("message.edited")} </span>}
                    {format(parseISO(message.createdAt), "HH:mm")}
                  </span>
                </div>
              </div>
            </div>
          </React.Fragment>
        );
      }

      if (message.fromMe && (message.internalMessage || message?.isForceDeleteConnection)) {
        return (
          <MessageNotificationUser
            key={message.id}
            message={message}
            title={'Mensagem interna'}
            classes={classes}
          />
        );
      }

      if (!message?.isForceDeleteConnection && !message?.internalMessage) {
        return (
          <React.Fragment key={message.id}>
            {renderDailyTimestamps(message, index)}
            {/*{renderNumberTicket(message, index)}*/}
            {renderMessageDivider(message, index)}
            <div className={clsx(classes.messageContainer, classes.messageContainerRight)}>
              {renderUserAvatar(ticket, message)}
              <div id={message.id} className={classes.messageRight}>
                <IconButton
                  variant="contained"
                  size="small"
                  id="messageActionsButton"
                  disabled={message.isDeleted}
                  className={classes.messageActionsButton}
                  onClick={(e) => handleOpenMessageOptionsMenu(e, message, data)}
                >
                  <ExpandMore />
                </IconButton>

                {isForwarded && (
                  <span className={classes.forwardedMessage}>
                    <Forward fontSize="small" className={classes.forwardedIcon} /> {i18n.t("message.forwarded")}
                  </span>
                )}

                {isYouTubeLink(message.body) && (
                  <YouTubePreview videoUrl={message.body} />
                )}

                {(message.mediaUrl || message.mediaType === "locationMessage" || message.mediaType === 'contactMessage' || message.mediaType === "contactsArrayMessage") && checkMessageMedia(message)}

                <div
                  className={clsx(classes.textContentItem, {
                    [classes.textContentItemDeleted]: message.isDeleted,
                    [classes.textContentItemEdited]: message.isEdited
                  })}
                >
                  {message.isDeleted && (
                    <Block
                      color="disabled"
                      fontSize="small"
                      className={classes.deletedIcon}
                    />
                  )}
                  {message.quotedMsg && renderQuotedMessage(message)}
                  {renderLinkPreview(message)}

                  {message.mediaType !== "reactionMessage" && message.mediaType !== "locationMessage" && (
                    <WhatsMarkedWrapper>{message.body}</WhatsMarkedWrapper>
                  )}


                  <MessageReaction
                    message={message}
                    classes={classes}
                  />

                  <span className={classes.timestamp}>
                    {message.isEdited && <span>{i18n.t("message.edited")} </span>}
                    {format(parseISO(message.createdAt), "HH:mm")}
                    {renderMessageAck(message)}
                  </span>
                </div>
              </div>
            </div>
          </React.Fragment>
        );
      }
    });

    return viewMessagesList.filter(item => item !== null);
  };

  return (
    <div className={classes.messagesListWrapper}>
      <MessageOptionsMenu
        message={selectedMessage}
        data={selectedMessageData}
        anchorEl={anchorEl}
        menuOpen={messageOptionsMenuOpen}
        handleClose={handleCloseMessageOptionsMenu}
        showSelectCheckBox={showSelectMessageCheckbox}
        setShowSelectCheckbox={setShowSelectMessageCheckbox}
        forwardMessageModalOpen={forwardMessageModalOpen}
        setForwardMessageModalOpen={setForwardMessageModalOpen}
        selectedMessages={selectedMessagesList}
      />
      <div
        id="messagesList"
        className={classes.messagesList}
        onScroll={handleScroll}
        ref={scrollRef}
      >
        {messagesList.length > 0 ? renderMessages() : []}

        {/* Renderização de indicadores de presença */}
        {contactPresence === "composing" && (
          <div className={classes.messageLeft}>
            <div className={classes.wave}>
              <span className={classes.dot}></span>
              <span className={classes.dot}></span>
              <span className={classes.dot}></span>
            </div>
          </div>
        )}

        {contactPresence === "recording" && (
          <div className={classes.messageLeft}>
            <div className={classes.wavebarsContainer}>
              <div className={clsx(classes.wavebars, classes.wavebar1)}></div>
              <div className={clsx(classes.wavebars, classes.wavebar2)}></div>
              <div className={clsx(classes.wavebars, classes.wavebar3)}></div>
              <div className={clsx(classes.wavebars, classes.wavebar4)}></div>
              <div className={clsx(classes.wavebars, classes.wavebar5)}></div>
            </div>
          </div>
        )}
      </div>

      {scrollStatus.loading && (
        <div className={classes.messageCenter}>
          <Typography variant="body2" color="textSecondary">
            {scrollStatus.message}
          </Typography>
          <CircularProgress size={20} />
        </div>
      )}

      {loading && (
        <div>
          <CircularProgress className={classes.circleLoading} />
        </div>
      )}
    </div>
  );
};

export default MessagesList;
