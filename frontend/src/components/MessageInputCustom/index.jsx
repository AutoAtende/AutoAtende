import React, { useState, useEffect, useContext, useRef } from "react";
import "emoji-mart/css/emoji-mart.css";
import { Picker } from "emoji-mart";
import clsx from "clsx";
import { isNil, isString, isEmpty, isObject, has } from "../../utils/helpers";
import { styled } from "@mui/material/styles";
import {
  Paper,
  InputBase,
  CircularProgress,
  IconButton,
  FormControlLabel,
  Switch,
  Grid,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Badge,
  useMediaQuery,
  Tooltip,
  Autocomplete,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  Box,
  Menu,
  MenuItem,
  Divider,
  Fade,
  ClickAwayListener,
} from "@mui/material";
import { green } from "@mui/material/colors";
import {
  AttachFile as AttachFileIcon,
  Mood as MoodIcon,
  Send as SendIcon,
  Cancel as CancelIcon,
  Clear as ClearIcon,
  Mic as MicIcon,
  CheckCircleOutline as CheckCircleOutlineIcon,
  HighlightOff as HighlightOffIcon,
  PlayArrow as PlayArrowIcon,
  Pause as PauseIcon,
  Person as PersonIcon,
  MoreVert as MoreVertIcon,
  // Ícones para formatação de texto
  FormatBold as FormatBoldIcon,
  FormatItalic as FormatItalicIcon,
  FormatStrikethrough as FormatStrikethroughIcon,
  Code as CodeIcon,
  FormatListNumbered as FormatListNumberedIcon,
  FormatListBulleted as FormatListBulletedIcon,
  FormatQuote as FormatQuoteIcon,
  FormatClear as FormatClearIcon,
  Add as AddIcon,
  Close as CloseIcon
} from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import AudioRecorderService from '../../services/arService';

import { i18n } from "../../translate/i18n";
import api from "../../services/api";
import openApi from "../../services/api";
import RecordingTimer from "./RecordingTimer";
import { SocketContext } from "../../context/Socket/SocketContext";
import { ReplyMessageContext } from "../../context/ReplyingMessage/ReplyingMessageContext";
import { AuthContext } from "../../context/Auth/AuthContext";
import { useLocalStorage } from "../../hooks/useLocalStorage";
import { toast } from "../../helpers/toast";
import { EditMessageContext } from "../../context/EditingMessage/EditingMessageContext";
import useQuickMessages from "../../hooks/useQuickMessages";

import MediaPreviewModal from './MediaPreviewModal';
import ContactSendModal from "../ContactSendModal";

const audioRecorder = new AudioRecorderService();

// FIXME checkout https://mui.com/components/use-media-query/#migrating-from-withwidth
const withWidth = () => (WrappedComponent) => (props) =>
  <WrappedComponent {...props} width="xs" />;

// Estilos utilizando a API styled do MUI 5
const MainWrapper = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.bordabox,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  borderTop: "1px solid rgba(0, 0, 0, 0.12)",
  position: 'relative',
  zIndex: 2,
}));

const NewMessageBox = styled('div')(({ theme }) => ({
  backgroundColor: theme.palette.newmessagebox,
  width: "100%",
  display: "flex",
  padding: "7px",
  alignItems: "center",
  // Safari/iOS específico
  '@supports (-webkit-touch-callout: none)': {
    padding: '10px 7px',
    minHeight: '54px',
  },
}));

const AudioPlayer = styled('div')(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  marginTop: theme.spacing(1),
}));

const MessageInputWrapper = styled('div')(({ theme }) => ({
  padding: 6,
  marginRight: 7,
  backgroundColor: theme.palette.inputdigita,
  display: "flex",
  borderRadius: 20,
  flex: 1,
  // Safari/iOS específico
  '@supports (-webkit-touch-callout: none)': {
    padding: '8px 12px',
    minHeight: '44px',
  },
}));

const MessageInput = styled(InputBase)(({ theme }) => ({
  paddingLeft: 10,
  flex: 1,
  border: "none",
  whiteSpace: "pre-wrap",
}));

const SendMessageIcons = styled('span')(({ theme }) => ({
  color: "grey",
}));

const UploadInput = styled('input')({
  display: "none",
  // Safari/iOS específico
  '@supports (-webkit-touch-callout: none)': {
    position: 'absolute',
    left: '-9999px',
  },
});

const ViewMediaInputWrapper = styled(Paper)(({ theme }) => ({
  maxHeight: "80%",
  display: "flex",
  padding: "10px 13px",
  position: "relative",
  justifyContent: "space-between",
  alignItems: "center",
  backgroundColor: "#eee",
  borderTop: "1px solid rgba(0, 0, 0, 0.12)",
}));

const EmojiBox = styled('div')(({ theme }) => ({
  position: "absolute",
  bottom: 63,
  width: 40,
  borderTop: "1px solid #e8e8e8",
}));

const CircleLoading = styled(CircularProgress)(({ theme }) => ({
  color: green[500],
  opacity: "70%",
  position: "absolute",
  top: "20%",
  left: "50%",
  marginLeft: -12,
}));

const AudioLoading = styled(CircularProgress)(({ theme }) => ({
  color: green[500],
  opacity: "70%",
}));

const RecorderWrapper = styled('div')(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  alignContent: "middle",
  minHeight: '54px',
  width: '100%',
  justifyContent: 'space-between',
  padding: '0 8px',
  // Safari/iOS específico
  '@supports (-webkit-touch-callout: none)': {
    backgroundColor: 'rgba(248, 248, 248, 0.95)',
    borderRadius: '24px',
    marginRight: '4px',
    maxWidth: 'calc(100% - 20px)',
  },
}));

const CancelAudioIcon = styled(HighlightOffIcon)(({ theme }) => ({
  color: "red",
  // Safari/iOS específico
  '@supports (-webkit-touch-callout: none)': {
    fontSize: '28px',
  },
}));

const SendAudioIcon = styled(CheckCircleOutlineIcon)(({ theme }) => ({
  color: "green",
  // Safari/iOS específico
  '@supports (-webkit-touch-callout: none)': {
    fontSize: '28px',
  },
}));

const CancelRecordingButton = styled(IconButton)(({ theme }) => ({
  // Safari/iOS específico
  '@supports (-webkit-touch-callout: none)': {
    padding: '12px',
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: '50%',
  },
}));



const SendRecordingButton = styled(IconButton)(({ theme }) => ({
  // Safari/iOS específico
  '@supports (-webkit-touch-callout: none)': {
    padding: '12px',
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: '50%',
  },
}));

const MicButton = styled(IconButton)(({ theme }) => ({
  // Safari/iOS específico
  '@supports (-webkit-touch-callout: none)': {
    padding: '12px',
  },
}));

const ActionButton = styled(IconButton)(({ theme }) => ({
  // Safari/iOS específico
  '@supports (-webkit-touch-callout: none)': {
    padding: '12px',
  },
}));

const ReplyingMsgWrapper = styled('div')(({ theme }) => ({
  display: "flex",
  width: "100%",
  alignItems: "center",
  justifyContent: "center",
  paddingTop: 8,
  paddingLeft: 73,
  paddingRight: 7,
}));

const ReplyingMsgContainer = styled('div')(({ theme }) => ({
  flex: 1,
  marginRight: 5,
  overflowY: "hidden",
  backgroundColor: "rgba(0, 0, 0, 0.05)",
  borderRadius: "7.5px",
  display: "flex",
  position: "relative",
}));

const ReplyingMsgBody = styled('div')(({ theme }) => ({
  padding: 10,
  height: "auto",
  display: "block",
  whiteSpace: "pre-wrap",
  overflow: "hidden",
}));

const ReplyingContactMsgSideColor = styled('span')(({ theme }) => ({
  flex: "none",
  width: "4px",
  backgroundColor: "#35cd96",
}));

const ReplyingSelfMsgSideColor = styled('span')(({ theme }) => ({
  flex: "none",
  width: "4px",
  backgroundColor: "#6bcbef",
}));

const MessageContactName = styled('span')(({ theme }) => ({
  display: "flex",
  color: "#6bcbef",
  fontWeight: 500,
}));

const AvatarStyled = styled(Avatar)(({ theme }) => ({
  width: "50px",
  height: "50px",
  borderRadius: "25%",
}));

const DropInfo = styled('div')(({ theme }) => ({
  background: "#eee",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  width: "100%",
  padding: 15,
  left: 0,
  right: 0,
}));

const GridFiles = styled(Grid)(({ theme }) => ({
  maxHeight: "100%",
  overflow: "scroll",
}));

const CustomSpeedDial = styled(SpeedDial)(({ theme }) => ({
  position: 'absolute',
  '&.MuiSpeedDial-directionUp, &.MuiSpeedDial-directionLeft': {
    bottom: theme.spacing(1),
    right: theme.spacing(2),
  },
  '& .MuiSpeedDial-actions': {
    paddingBottom: theme.spacing(1),
  },
}));

// Componente de menu de formatação de texto estilizado
const FormatMenu = styled(Menu)(({ theme }) => ({
  '& .MuiMenu-paper': {
    borderRadius: theme.shape.borderRadius,
    backgroundColor: theme.palette.background.paper,
  },
  '& .MuiMenuItem-root': {
    minHeight: 42,
  },
}));

// Menu flutuante para formatação de texto selecionado
const FloatingFormatMenu = styled('div')(({ theme }) => ({
  position: 'absolute',
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[2],
  zIndex: 1400,
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  padding: '2px',
}));

const FormatIconButton = styled(IconButton)(({ theme }) => ({
  padding: '6px',
  borderRadius: '4px',
}));

const isValidFileType = (file) => {
  const validMimeTypes = [
    'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'video/webm',
    'video/mp4', 'video/3gpp', 'video/x-matroska', 'video/avi', 'video/quicktime', 'audio/mp4',
    'audio/aac', 'audio/mpeg', 'audio/wav', 'audio/ogg', 'application/cdr',
    'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/ovpn',
    'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain', 'text/csv', 'text/xml', 'application/pcap',
    'application/zip', 'application/x-rar-compressed', 'application/vnd.android.package-archive',
    'application/json', 'video/mpeg', 'application/x-tar', 'application/x-pkcs12', 'application/x-x509-ca-cert'
  ];

  // Verificar se o tipo MIME está na lista
  if (validMimeTypes.includes(file.type)) {
    return true;
  }

  // Verificar por extensão caso o MIME não seja reconhecido
  const extension = file.name.split('.').pop().toLowerCase();
  const validExtensions = [
    'jpg', 'jpeg', 'png', 'gif', 'webm',
    'mp4', '3gp', 'mkv', 'avi', 'mov', 'm4a',
    'aac', 'mp3', 'wav', 'ogg', 'cdr',
    'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ovpn',
    'ppt', 'pptx', 'txt', 'csv', 'xml', 'pcap',
    'zip', 'rar', 'apk', 'json', 'mpeg', 'tar', 'pfx', 'crt'
  ];

  return validExtensions.includes(extension);
};

const EmojiOptions = (props) => {
  const { disabled, showEmoji, setShowEmoji, handleAddEmoji } = props;

  return (
    <>
      <IconButton
        aria-label="emojiPicker"
        component="span"
        disabled={disabled}
        onClick={(e) => setShowEmoji((prevState) => !prevState)}
        size="large"
      >
        <MoodIcon sx={{ color: 'grey' }} />
      </IconButton>
      {showEmoji ? (
        <EmojiBox>
          <Picker
            perLine={16}
            showPreview={false}
            showSkinTones={false}
            onSelect={handleAddEmoji}
          />
        </EmojiBox>
      ) : null}
    </>
  );
};

function useIsWidthUp(breakpoint) {
  const theme = useTheme();
  return useMediaQuery(theme.breakpoints.up(breakpoint));
}

const SignSwitch = (props) => {
  const { width, setSignMessage, signMessage } = props;
  if (useIsWidthUp("md", width)) {
    return (
      <FormControlLabel
        style={{ marginRight: 7, color: "gray" }}
        label={i18n.t("messagesInput.signMessage")}
        labelPlacement="start"
        control={
          <Switch
            size="small"
            checked={signMessage}
            onChange={(e) => {
              setSignMessage(e.target.checked);
            }}
            name="showAllTickets"
            color="primary"
          />
        }
      />
    );
  }
  return null;
};

const FileInput = (props) => {
  const { handleChangeMedias, disableOption } = props;

  return (
    <>
      <UploadInput
        multiple
        type="file"
        id="upload-button"
        disabled={disableOption()}
        onChange={handleChangeMedias}
      />
      <label htmlFor="upload-button">
        <IconButton
          aria-label="upload"
          component="span"
          disabled={disableOption()}
          size="large"
        >
          <AttachFileIcon sx={{ color: 'grey' }} />
        </IconButton>
      </label>
    </>
  );
};

const ActionButtons = (props) => {
  const {
    inputMessage,
    loading,
    recording,
    ticketStatus,
    handleSendMessage,
    handleCancelAudio,
    handleUploadAudio,
    handleStartRecording,
  } = props;

  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  const isAndroid = /Android/.test(navigator.userAgent);
  const isMobile = isIOS || isAndroid;

  if (inputMessage) {
    return (
      <ActionButton
        aria-label="sendMessage"
        component="span"
        onClick={handleSendMessage}
        disabled={loading}
        size="large"
        sx={{
          '@supports (-webkit-touch-callout: none)': {
            padding: '12px',
          },
        }}
      >
        <SendIcon sx={{ color: 'grey' }} />
      </ActionButton>
    );
  } else if (recording) {
    return (
      <RecorderWrapper>
        <CancelRecordingButton
          aria-label="cancelRecording"
          component="span"
          disabled={loading}
          onClick={handleCancelAudio}
          size="large"
          sx={{
            padding: isMobile ? '12px' : '8px',
            '@supports (-webkit-touch-callout: none)': {
              padding: '12px',
              backgroundColor: 'rgba(255,255,255,0.8)',
              borderRadius: '50%',
            },
          }}
        >
          <CancelAudioIcon
            sx={{
              fontSize: isMobile ? 28 : 24
            }}
          />
        </CancelRecordingButton>
        {loading ? (
          <div>
            <AudioLoading />
          </div>
        ) : (
          <RecordingTimer isIOS={isIOS} />
        )}

        <SendRecordingButton
          aria-label="sendRecordedAudio"
          component="span"
          onClick={handleUploadAudio}
          disabled={loading}
          size="large"
          sx={{
            padding: isMobile ? '12px' : '8px',
            '@supports (-webkit-touch-callout: none)': {
              padding: '12px',
              backgroundColor: 'rgba(255,255,255,0.8)',
              borderRadius: '50%',
            },
          }}
        >
          <SendAudioIcon
            sx={{
              fontSize: isMobile ? 28 : 24
            }}
          />
        </SendRecordingButton>
      </RecorderWrapper>
    );
  } else {
    return (
      <Tooltip title={i18n.t("messagesInput.recording.tooltip") || "Gravar áudio"}>
        <MicButton
          aria-label="startRecording"
          component="span"
          disabled={loading || ticketStatus !== "open"}
          onClick={handleStartRecording}
          size="large"
          sx={{
            padding: isMobile ? '12px' : '8px',
            margin: isMobile ? '0 4px' : '0',
            '@supports (-webkit-touch-callout: none)': {
              padding: '12px',
            },
          }}
        >
          <MicIcon
            sx={{
              color: 'grey',
              fontSize: isMobile ? 28 : 24
            }}
          />
        </MicButton>
      </Tooltip>
    );
  }
};

const TextFormatMenu = (props) => {
  const {
    formatMenuAnchorPosition,
    handleCloseFormatMenu,
    handleFormatText,
    disableOption
  } = props;

  const isMenuOpen = Boolean(formatMenuAnchorPosition);

  // Verifica se está em plataforma móvel
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  const isAndroid = /Android/.test(navigator.userAgent);
  const isMobile = isIOS || isAndroid;

  return (
    <ClickAwayListener onClickAway={handleCloseFormatMenu}>
      <Fade in={isMenuOpen}>
        <FloatingFormatMenu
          style={{
            top: formatMenuAnchorPosition ? formatMenuAnchorPosition.y - 50 : 0,
            left: formatMenuAnchorPosition ? formatMenuAnchorPosition.x : 0,
          }}
        >
          <Tooltip title="Negrito">
            <FormatIconButton
              disabled={disableOption}
              onClick={() => handleFormatText('bold')}
              size="small"
            >
              <FormatBoldIcon fontSize={isMobile ? "small" : "medium"} />
            </FormatIconButton>
          </Tooltip>

          <Tooltip title="Itálico">
            <FormatIconButton
              disabled={disableOption}
              onClick={() => handleFormatText('italic')}
              size="small"
            >
              <FormatItalicIcon fontSize={isMobile ? "small" : "medium"} />
            </FormatIconButton>
          </Tooltip>

          <Tooltip title="Tachado">
            <FormatIconButton
              disabled={disableOption}
              onClick={() => handleFormatText('strikethrough')}
              size="small"
            >
              <FormatStrikethroughIcon fontSize={isMobile ? "small" : "medium"} />
            </FormatIconButton>
          </Tooltip>

          <Tooltip title="Código">
            <FormatIconButton
              disabled={disableOption}
              onClick={() => handleFormatText('code')}
              size="small"
            >
              <CodeIcon fontSize={isMobile ? "small" : "medium"} />
            </FormatIconButton>
          </Tooltip>

          <Tooltip title="Lista Numerada">
            <FormatIconButton
              disabled={disableOption}
              onClick={() => handleFormatText('numberedList')}
              size="small"
            >
              <FormatListNumberedIcon fontSize={isMobile ? "small" : "medium"} />
            </FormatIconButton>
          </Tooltip>

          <Tooltip title="Lista com Marcadores">
            <FormatIconButton
              disabled={disableOption}
              onClick={() => handleFormatText('bulletList')}
              size="small"
            >
              <FormatListBulletedIcon fontSize={isMobile ? "small" : "medium"} />
            </FormatIconButton>
          </Tooltip>

          <Tooltip title="Citação">
            <FormatIconButton
              disabled={disableOption}
              onClick={() => handleFormatText('quote')}
              size="small"
            >
              <FormatQuoteIcon fontSize={isMobile ? "small" : "medium"} />
            </FormatIconButton>
          </Tooltip>

          <Tooltip title="Limpar Formatação">
            <FormatIconButton
              disabled={disableOption}
              onClick={() => handleFormatText('clear')}
              size="small"
            >
              <FormatClearIcon fontSize={isMobile ? "small" : "medium"} />
            </FormatIconButton>
          </Tooltip>
        </FloatingFormatMenu>
      </Fade>
    </ClickAwayListener>
  );
};

const CustomInput = (props) => {
  const {
    loading,
    inputRef,
    ticketStatus,
    inputMessage,
    setInputMessage,
    handleSendMessage,
    sendTypingStatus,
    handleInputPaste,
    disableOption,
    handleQuickAnswersClick,
    internalMessageMode,   // Adicione esta prop
    messageInputWrapperInternal,  // Adicione esta prop
  } = props;

  const [quickMessages, setQuickMessages] = useState([]);
  const [options, setOptions] = useState([]);
  const [popupOpen, setPopupOpen] = useState(false);
  const [audioPlayingId, setAudioPlayingId] = useState();
  const { user } = useContext(AuthContext);

  // Estado para controlar o menu de formatação
  const [formatMenuAnchorPosition, setFormatMenuAnchorPosition] = useState(null);
  const [selectedText, setSelectedText] = useState({ text: '', start: 0, end: 0 });

  const { list: listQuickMessages } = useQuickMessages();

  // Verifica se existe texto selecionado no input
  const checkForSelectedText = () => {
    if (inputRef.current) {
      const start = inputRef.current.selectionStart;
      const end = inputRef.current.selectionEnd;

      if (start !== end) {
        const selectedText = inputMessage.substring(start, end);
        if (selectedText.trim() !== '') {
          // Captura a posição para mostrar o menu próximo ao texto selecionado
          const selection = window.getSelection();
          if (selection && selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            const rect = range.getBoundingClientRect();

            setSelectedText({
              text: selectedText,
              start: start,
              end: end
            });

            setFormatMenuAnchorPosition({
              x: rect.left + rect.width / 2,
              y: rect.top
            });

            return true;
          }
        }
      }
    }

    return false;
  };

  // Fecha o menu de formatação
  const handleCloseFormatMenu = () => {
    setFormatMenuAnchorPosition(null);
  };

  // Aplica a formatação ao texto selecionado
  const handleFormatText = (formatType) => {
    const { text, start, end } = selectedText;
    let formattedText = '';
    let cursorPosition = 0;

    switch (formatType) {
      case 'bold':
        formattedText = `*${text}*`;
        break;
      case 'italic':
        formattedText = `_${text}_`;
        break;
      case 'strikethrough':
        formattedText = `~${text}~`;
        break;
      case 'code':
        formattedText = `\`${text}\``;
        break;
      case 'numberedList':
        // Divide o texto em linhas e adiciona números
        formattedText = text.split('\n')
          .map((line, index) => `${index + 1}. ${line}`)
          .join('\n');
        break;
      case 'bulletList':
        // Divide o texto em linhas e adiciona marcadores
        formattedText = text.split('\n')
          .map(line => `• ${line}`)
          .join('\n');
        break;
      case 'quote':
        // Divide o texto em linhas e adiciona o símbolo de citação
        formattedText = text.split('\n')
          .map(line => `> ${line}`)
          .join('\n');
        break;
      case 'clear':
        // Remove todas as formatações conhecidas
        formattedText = text
          .replace(/\*([^*]+)\*/g, '$1')  // remove negrito
          .replace(/_([^_]+)_/g, '$1')    // remove itálico
          .replace(/~([^~]+)~/g, '$1')    // remove tachado
          .replace(/`([^`]+)`/g, '$1')    // remove código
          .replace(/^\d+\.\s/gm, '')      // remove numeração de lista
          .replace(/^•\s/gm, '')          // remove marcadores de lista
          .replace(/^>\s/gm, '');         // remove citação
        break;
      default:
        formattedText = text;
    }

    // Substitui o texto selecionado pelo texto formatado
    const newInputMessage =
      inputMessage.substring(0, start) +
      formattedText +
      inputMessage.substring(end);

    setInputMessage(newInputMessage);

    // Fecha o menu após a formatação
    handleCloseFormatMenu();

    // Define o foco e a posição do cursor após a operação
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        // Posiciona o cursor após o texto formatado
        const newCursorPosition = start + formattedText.length;
        inputRef.current.selectionStart = newCursorPosition;
        inputRef.current.selectionEnd = newCursorPosition;
      }
    }, 100);
  };

  useEffect(() => {
    async function fetchData() {
      const companyId = localStorage.getItem("companyId");
      const messages = await listQuickMessages({ companyId, userId: user.id });
      const options = messages.map((m) => {
        let truncatedMessage = m.message;
        if (isString(truncatedMessage) && truncatedMessage.length > 35) {
          truncatedMessage = m.message.substring(0, 35) + "...";
        }
        return {
          value: m.message,
          label: `/${m.shortcode} - ${truncatedMessage}`,
          mediaPath: String(m.mediaPath).replace(":443", ""),
          mediaType: m.mediaType,
          id: m.id,
        };
      });
      setQuickMessages(options);
    }

    fetchData();
  }, []);

  useEffect(() => {
    if (
      isString(inputMessage) &&
      !isEmpty(inputMessage) &&
      inputMessage.length >= 1
    ) {
      const firstWord = inputMessage.charAt(0);
      setPopupOpen(firstWord.indexOf("/") > -1);

      const filteredOptions = quickMessages?.filter(
        (m) => m.label?.indexOf(inputMessage) > -1
      );
      setOptions(filteredOptions);
    } else {
      setPopupOpen(false);
    }
  }, [inputMessage]);

  const handlePlayAudio = (quickMessage) => {
    if (audioPlayingId === quickMessage?.id) {
      setAudioPlayingId(null);
    } else {
      console.log(quickMessage);
      setAudioPlayingId(quickMessage?.id);
      const audio = new Audio(quickMessage?.mediaPath);
      audio.play();
      audio.onended = () => setAudioPlayingId(null);
    }
  };

  function isCharacterKeyPress(evt) {
    if (typeof evt.which == "undefined") {
      return true;
    } else if (typeof evt.which == "number" && evt.which > 0) {
      return (
        !evt.ctrlKey &&
        !evt.metaKey &&
        !evt.altKey &&
        evt.which != 8 &&
        evt.which != 13 &&
        evt.which != 17 &&
        evt.which != 18 &&
        evt.which != 27
      );
    }
    return false;
  }

  const onKeyPress = (e) => {
    if (loading) return;

    // Se CTRL+ENTER foi pressionado, insere quebra de linha
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      const cursorPosition = e.target.selectionStart;
      const textBeforeCursor = inputMessage.substring(0, cursorPosition);
      const textAfterCursor = inputMessage.substring(cursorPosition);

      // Adiciona quebra de linha na posição do cursor
      setInputMessage(textBeforeCursor + '\n' + textAfterCursor);

      // Define a posição do cursor após a quebra de linha
      setTimeout(() => {
        if (inputRef.current) {
          const newCursorPosition = cursorPosition + 1;
          inputRef.current.selectionStart = newCursorPosition;
          inputRef.current.selectionEnd = newCursorPosition;
        }
      }, 0);

      return;
    }
    // ENTER sem CTRL envia a mensagem
    else if (e.key === "Enter" && !e.shiftKey) {
      handleSendMessage();
    }
    // Para qualquer outro caractere, envia status de digitação
    else {
      if (isCharacterKeyPress(e)) {
        sendTypingStatus(true);
      }
    }
  };

  const onPaste = (e) => {
    if (ticketStatus === "open") {
      handleInputPaste(e);
    }
  };

  const renderPlaceholder = () => {
    if (ticketStatus === "open") {
      return i18n.t("messagesInput.placeholderOpen");
    }
    return i18n.t("messagesInput.placeholderClosed");
  };

  const setInputRef = (input) => {
    if (input) {
      input.focus();
      inputRef.current = input;
    }
  };

  // Handler para monitorar seleção de texto
  const handleSelectText = () => {
    checkForSelectedText();
  };

  // Eventos de mouse para detectar seleção
  const handleMouseUp = () => {
    checkForSelectedText();
  };

  // Manipuladores de teclado para detectar seleção via teclado
  const handleKeyUp = (e) => {
    // Teclas que podem alterar a seleção
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight' || e.key === 'Shift') {
      checkForSelectedText();
    }
  };

  return (
    <MessageInputWrapper
      style={internalMessageMode ? messageInputWrapperInternal : {}}
    >
      <Autocomplete
        freeSolo
        disabled={ticketStatus === "closed"}
        open={popupOpen}
        id="grouped-demo"
        value={inputMessage}
        options={options}
        clearIcon={null}
        getOptionLabel={(option) => {
          if (isObject(option)) {
            return option.label;
          } else {
            return option;
          }
        }}
        onChange={(event, opt) => {
          if (isObject(opt) && has(opt, "value")) {
            handleQuickAnswersClick(opt);
            setTimeout(() => {
              inputRef.current.scrollTop = inputRef.current.scrollHeight;
            }, 200);
          }
        }}
        onInputChange={(event, opt, reason) => {
          if (reason === "input") {
            setInputMessage(event.target.value);
          }
        }}
        renderOption={(props, option) => (
          <li {...props}>
            <div>
              {option.label}
              {option.mediaType === "audio" && (
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePlayAudio(option);
                  }}
                >
                  {audioPlayingId === option.id ? (
                    <PauseIcon />
                  ) : (
                    <PlayArrowIcon />
                  )}
                </IconButton>
              )}
            </div>
          </li>
        )}
        renderInput={(params) => (
          <InputBase
            {...params.InputProps}
            {...params}
            disabled={disableOption()}
            inputRef={inputRef}
            placeholder={renderPlaceholder()}
            multiline
            sx={{
              paddingLeft: 1,
              flex: 1,
              border: "none",
              whiteSpace: "pre-wrap",
            }}
            maxRows={5}
            onKeyPress={onKeyPress}
            onKeyUp={handleKeyUp}
            onMouseUp={handleMouseUp}
            onSelect={handleSelectText}
            onPaste={onPaste}
            spellCheck={true}
            fullWidth
          />
        )}
        fullWidth
      />

      {/* Menu de formatação que aparece quando texto é selecionado */}
      {formatMenuAnchorPosition && (
        <TextFormatMenu
          formatMenuAnchorPosition={formatMenuAnchorPosition}
          handleCloseFormatMenu={handleCloseFormatMenu}
          handleFormatText={handleFormatText}
          disableOption={disableOption()}
        />
      )}
    </MessageInputWrapper>
  );
};

const MessageInputCustom = (props) => {
  const { ticketStatus, ticketId } = props;
  const theme = useTheme();
  const isWidthUp = useMediaQuery(theme.breakpoints.up("md"));
  const socketManager = useContext(SocketContext);
  const [medias, setMedias] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [loading, setLoading] = useState(false);
  const [recording, setRecording] = useState(false);
  const inputRef = useRef();
  const [onDragEnter, setOnDragEnter] = useState(false);
  const { setReplyingMessage, replyingMessage } =
    useContext(ReplyMessageContext);
  const { setEditingMessage, editingMessage } = useContext(EditMessageContext);
  const { user } = useContext(AuthContext);
  const [senVcardModalOpen, setSenVcardModalOpen] = useState(false);
  const [speedDialOpen, setSpeedDialOpen] = useState(false);
  const [internalMessageMode, setInternalMessageMode] = useState(false);
  const [signMessage, setSignMessage] = useLocalStorage("signOption", true);

  const [lastTypingStatus, setLastTypingStatus] = useState(null);
  const [audioPlayingId, setAudioPlayingId] = useState(null);
  const [showMediaPreview, setShowMediaPreview] = useState(false);
  const [selectedMedias, setSelectedMedias] = useState([]);

  // Controle de visibilidade para ocultar o campo de texto durante a gravação
  const [inputVisible, setInputVisible] = useState(true);

  useEffect(() => {
    // Atualizar visibilidade do campo de texto baseado no estado de gravação
    setInputVisible(!recording);
  }, [recording]);

  useEffect(() => {
    inputRef.current && inputRef.current.focus();
    if (editingMessage) {
      setInputMessage(editingMessage.body);
    }
  }, [replyingMessage, editingMessage]);

  useEffect(() => {
    inputRef.current && inputRef.current.focus();
    return () => {
      sendTypingStatus(false).then(() => {
        setLastTypingStatus(null);
      });
      setInputMessage("");
      setShowEmoji(false);
      setMedias([]);
      setReplyingMessage(null);
      setEditingMessage(null);
    };
  }, [ticketId, setReplyingMessage, setEditingMessage]);

  useEffect(() => {
    setTimeout(() => {
      setOnDragEnter(false);
    }, 10000);
  }, [onDragEnter === true]);

  const handleAddEmoji = (e) => {
    let emoji = e.native;
    setInputMessage((prevState) => prevState + emoji);
  };

  const handleSendContatcMessage = async (vcard) => {
    setSenVcardModalOpen(false);
    setLoading(true);

    if (isNil(vcard)) {
      setLoading(false);
      return;
    }

    const message = {
      read: 1,
      fromMe: true,
      mediaUrl: "",
      body: null,
      quotedMsg: replyingMessage,
      vCard: vcard,
    };
    try {
      await api.post(`/messages/${ticketId}`, message);
    } catch (err) {
      toast.error(err);
    }

    setInputMessage("");
    setShowEmoji(false);
    setLoading(false);
    setReplyingMessage(null);
    await sendTypingStatus(false);
  };

  const handleUploadQuickMessageMedia = async (
    blob,
    message,
    quickMessageId,
    mediaType
  ) => {
    setLoading(true);
    try {
      const formData = new FormData();
      let filename = null
      if (mediaType === "audio") {
        filename = `audio-record-site-${new Date().getTime()}.${blob.type.split("/")[1]}`;
      } else {
        filename = `${new Date().getTime()}.${blob.type.split("/")[1]}`;
      }
      formData.append("medias", blob, filename);
      formData.append("body", message);
      formData.append("fromMe", true);

      if (quickMessageId) {
        formData.append("quickMessageId", quickMessageId);
      }

      await api.post(`/messages/${ticketId}`, formData);
      await sendTypingStatus(false);
    } catch (err) {
      toast.error(err);
    }
    setLoading(false);
  };

  const handleQuickAnswersClick = async (dataMessage) => {
    if (dataMessage?.mediaPath && dataMessage?.mediaPath !== "null") {
      try {
        const { data } = await openApi.get(dataMessage?.mediaPath, {
          responseType: "blob",
        });

        if (dataMessage?.mediaType === "audio") {
          await handleUploadQuickMessageMedia(data, dataMessage?.value, dataMessage?.id, dataMessage?.mediaType);
        } else {
          await handleUploadQuickMessageMedia(data, dataMessage?.value, dataMessage?.mediaType);
        }

        setInputMessage("");
      } catch (err) {
        toast.error(err);
      }
    } else {
      setInputMessage(dataMessage.value);
    }
    await sendTypingStatus(false);
  };

  const messageInputWrapperInternal = {
    backgroundColor: "#fff9c4", // Amarelo médio
    border: "1px solid #ffd54f",
  };

  const handleSendContactModalOpen = async () => {
    setSenVcardModalOpen(true);
    setSpeedDialOpen(false);
  };

  const handleChangeMedias = (e) => {
    if (!e.target.files) return;

    const files = Array.from(e.target.files);
    const validFiles = files.filter(file => isValidFileType(file));
    setSpeedDialOpen(false);

    if (validFiles.length > 0) {
      setSelectedMedias(validFiles);
      setShowMediaPreview(true);
    } else {
      toast.error(i18n.t("messagesInput.invalidFileType"));
    }
  };

  const handleInputPaste = (e) => {
    if (e.clipboardData.files[0]) {
      const selectedMedias = Array.from(e.clipboardData.files);
      setMedias(selectedMedias);
    }
  };

  const handleInputDrop = (e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);

    const validFiles = files.filter(file => isValidFileType(file));

    if (validFiles.length > 0) {
      setSelectedMedias(validFiles);
      setShowMediaPreview(true);
    } else {
      toast.error(i18n.t("messagesInput.invalidFileType"));
    }
  };

  const handleDeleteMedia = (index) => {
    setSelectedMedias(prev => prev.filter((_, i) => i !== index));
    if (selectedMedias.length === 1) {
      setShowMediaPreview(false);
    }
  };

  const handleAddMoreMedia = (newMedia) => {
    if (newMedia instanceof File) {
      // Se receber um File diretamente (caso da edição)
      setSelectedMedias(prev => [...prev, newMedia]);
    } else {
      // Caso normal de adicionar mais arquivos via input
      const input = document.createElement('input');
      input.type = 'file';
      input.multiple = true;
      input.accept = 'image/*,application/pdf';

      input.onchange = (e) => {
        const files = Array.from(e.target.files);
        const validFiles = files.filter(file =>
          file.type.startsWith('image/') || file.type === 'application/pdf'
        );

        if (validFiles.length > 0) {
          setSelectedMedias(prev => [...prev, ...validFiles]);
        }
      };

      input.click();
    }
  };

  const handleMediaCaptions = async (formData) => {
    try {
      await api.post(`/messages/${ticketId}`, formData);

      setShowMediaPreview(false);
      setSelectedMedias([]);
      setInputMessage('');
    } catch (err) {
      toast.error(err);
    }
  };

  const handleUploadMedia = async (e) => {
    setLoading(true);
    if (e) {
      e.preventDefault();
    }

    const formData = new FormData();
    formData.append("fromMe", true);
    medias.forEach((media) => {
      formData.append("medias", media);
      formData.append("body", inputMessage);
    });

    try {
      await api.post(`/messages/${ticketId}`, formData);
    } catch (err) {
      toast.error(err);
    }

    setLoading(false);
    setMedias([]);
  };

  const sendTypingStatus = async (status) => {
    try {
      if (!ticketId) return;
      if (inputMessage.trim() === "") status = false;

      if (
        lastTypingStatus &&
        new Date().getTime() - lastTypingStatus.getTime() < 3000
      )
        return;

      if (status) setLastTypingStatus(new Date());
      else setLastTypingStatus(null);

      await api.post(`/messages/typing/${ticketId}?status=${status}`);

      const companyId = localStorage.getItem("companyId");
      if (!companyId) return;
      if (!socketManager?.GetSocket) return;
      const socket = socketManager.GetSocket(companyId);
      if (socket) {
        socket.emit("typing", { ticketId, status });
      }
    } catch (err) {
      console.log(err);
    }
  };

const handleSendMessage = async () => {
  if (medias.length === 0 && inputMessage.trim() === "") return;
  setLoading(true);

  try {
    if (medias.length > 0) {
      const formData = new FormData();
      formData.append("fromMe", true);
      formData.append("body", inputMessage);

      // Adicionar a mensagem citada, se existir
      if (replyingMessage) {
        formData.append("quotedMsg", JSON.stringify(replyingMessage));
      }

      // Garantir que a propriedade internalMessage seja enviada corretamente
      if (internalMessageMode) {
        formData.append("internalMessage", true);
      }

      medias.forEach((media) => {
        formData.append("medias", media);
      });

      await api.post(`/messages/${ticketId}`, formData);
    } else {
      let messageBody = inputMessage.trim();

      // Formatação para assinatura
      if (signMessage && !internalMessageMode) {
        if (editingMessage) {
          const signaturePattern = new RegExp(`^\\*${user?.name}:\\*\\n`);
          if (!signaturePattern.test(messageBody)) {
            messageBody = `*${user?.name}:*\n${messageBody}`;
          }
        } else {
          messageBody = `*${user?.name}:*\n${messageBody}`;
        }
      }

      const message = {
        read: 1,
        fromMe: true,
        mediaUrl: "",
        body: messageBody,
        quotedMsg: replyingMessage,
        internalMessage: internalMessageMode
      };

      if (editingMessage) {
        await api.post(`/messages/edit/${editingMessage.id}`, message);
      } else {
        await api.post(`/messages/${ticketId}`, message);
      }
    }

    // Limpar estado após envio
    setInternalMessageMode(false);
    setInputMessage("");
    setShowEmoji(false);
    setMedias([]);
    setSelectedMedias([]);
    setLoading(false);
    setReplyingMessage(null);
    setEditingMessage(null);
  } catch (err) {
    toast.error(err);
    setLoading(false);
  }
};


  const handleStartRecording = async () => {
    setLoading(true);
    try {
      // Ocultar campo de texto durante a gravação
      setInputVisible(false);

      // Emitir evento de gravação
      const companyId = localStorage.getItem("companyId");
      if (!companyId) return;
      if (!socketManager?.GetSocket) return;
      const socket = socketManager.GetSocket(companyId);
      if (socket) {
        socket.emit("recording", { ticketId, status: true });
      }

      // Verificar permissões do navegador
      if (navigator.permissions && navigator.permissions.query) {
        try {
          const permissionStatus = await navigator.permissions.query({ name: 'microphone' });
          if (permissionStatus.state === 'denied') {
            throw new Error('permission_denied');
          }
        } catch (permErr) {
          console.warn('Não foi possível verificar permissões:', permErr);
        }
      }

      // Iniciar gravação
      console.log("Tentando iniciar gravação de áudio...");

      // Garantir que qualquer gravação prévia foi cancelada
      audioRecorder.cancelRecording();

      // Adicionar pequeno delay antes de iniciar nova gravação
      setTimeout(async () => {
        try {
          const success = await audioRecorder.startRecording();

          if (success) {
            setRecording(true);
            console.log("Gravação iniciada com sucesso");

            // Feedback visual
            toast.info("Gravando áudio...", {
              autoClose: 2000,
              position: "bottom-center"
            });
          } else {
            throw new Error("Falha ao iniciar gravação");
          }
        } catch (delayedErr) {
          console.error("Erro ao iniciar gravação após delay:", delayedErr);
          handleSpecificRecordingError(delayedErr);
          // Restaurar visibilidade do campo de texto em caso de erro
          setInputVisible(true);
        } finally {
          setLoading(false);
        }
      }, 300);

    } catch (err) {
      console.error('Erro ao iniciar gravação:', err);
      handleSpecificRecordingError(err);
      setLoading(false);
      // Restaurar visibilidade do campo de texto em caso de erro
      setInputVisible(true);
    }
  };

  // Função auxiliar para tratar erros específicos
  const handleSpecificRecordingError = (err) => {
    if (err.name === 'NotAllowedError' || err.message === 'permission_denied') {
      toast.error("Permissão de microfone negada. Verifique as configurações do seu dispositivo.");
    } else if (err.name === 'NotFoundError') {
      toast.error("Nenhum microfone encontrado. Conecte um microfone e tente novamente.");
    } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
      toast.error("Seu microfone está sendo usado por outro aplicativo. Feche outros apps e tente novamente.");
    } else if (err.name === 'SecurityError') {
      toast.error("Não foi possível acessar o microfone devido a restrições de segurança.");
    } else {
      toast.error("Falha ao iniciar gravação de áudio. Tente novamente.");
    }
  };

  const handleUploadAudio = async () => {
    setLoading(true);
    try {
      // Notificar que parou de gravar
      const companyId = localStorage.getItem("companyId");
      if (!companyId) return;
      if (!socketManager?.GetSocket) return;
      
      const socket = socketManager.GetSocket(companyId);
      if (socket) {
        socket.emit("recording", { ticketId, status: false });
      }

      // Feedback visual
      toast.info("Processando áudio...", {
        autoClose: 2000,
        position: "bottom-center"
      });

      console.log("Finalizando gravação de áudio...");

      // Tentar obter o blob de áudio com timeout seguro
      let audioBlob = null;
      try {
        audioBlob = await Promise.race([
          audioRecorder.stopRecording(),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error("Timeout ao processar áudio")), 15000)
          )
        ]);
      } catch (timeoutErr) {
        console.error("Erro ou timeout ao parar gravação:", timeoutErr);
        toast.error("Falha ao processar áudio. Tente novamente.");
        setRecording(false);
        setLoading(false);
        // Restaurar visibilidade do campo de texto
        setInputVisible(true);
        return;
      }

      // Verificações de segurança
      if (!audioBlob) {
        toast.error("Nenhum áudio foi gravado. Tente novamente.");
        setRecording(false);
        setLoading(false);
        // Restaurar visibilidade do campo de texto
        setInputVisible(true);
        return;
      }

      // Verificação de tamanho mínimo
      if (audioBlob.size < 1000) {
        console.warn(`Áudio muito pequeno detectado: ${audioBlob.size} bytes`);
        toast.error("Áudio muito curto. Por favor, grave uma mensagem mais longa.");
        setRecording(false);
        setLoading(false);
        // Restaurar visibilidade do campo de texto
        setInputVisible(true);
        return;
      }

      // Log detalhado para diagnóstico
      console.log(`Áudio gravado: ${audioBlob.size} bytes, tipo: ${audioBlob.type}`);

      try {
        // Preparar o arquivo para envio
        const audioFile = await audioRecorder.prepareForUpload(audioBlob);

        const formData = new FormData();
        formData.append("medias", audioFile);
        formData.append("body", inputMessage || "");
        formData.append("fromMe", true);

        console.log(`Enviando áudio: ${audioFile.name}, tipo: ${audioFile.type}, tamanho: ${audioFile.size} bytes`);

        // Configurar timeout maior para o upload
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 segundos

        try {
          // Usar uma função de envio mais robusta
          const response = await api.post(`/messages/${ticketId}`, formData, {
            signal: controller.signal,
            headers: {
              'Content-Type': 'multipart/form-data'
            },
            // Adicionar callbacks de progresso
            onUploadProgress: (progressEvent) => {
              const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              console.log(`Progresso de upload: ${percentCompleted}%`);
            }
          });

          clearTimeout(timeoutId);

          if (response.status >= 200 && response.status < 300) {
            setInputMessage("");
            toast.success("Áudio enviado com sucesso");
          } else {
            throw new Error(`Erro no servidor: ${response.status}`);
          }
        } catch (uploadErr) {
          clearTimeout(timeoutId);
          console.error('Erro ao enviar áudio:', uploadErr);

          if (uploadErr.name === 'AbortError') {
            toast.error("O upload do áudio demorou muito tempo e foi cancelado. Tente novamente com uma conexão melhor.");
          } else if (uploadErr.response) {
            toast.error(`Erro ao enviar áudio: ${uploadErr.response.status} - ${uploadErr.response.data.message || 'Erro desconhecido'}`);
          } else {
            toast.error("Erro ao enviar áudio. Tente novamente.");
          }
        }
      } catch (prepareErr) {
        console.error('Erro ao preparar áudio para upload:', prepareErr);
        toast.error("Erro ao processar áudio para envio. Tente novamente.");
      }
    } catch (err) {
      console.error('Erro ao processar áudio:', err);
      if (err.message === 'Gravação muito curta') {
        toast.error("Áudio muito curto. Por favor, grave uma mensagem mais longa.");
      } else if (err.message === 'Timeout ao processar áudio') {
        toast.error("O processamento do áudio demorou muito tempo. Tente novamente.");
      } else {
        toast.error("Erro ao processar áudio. Tente novamente.");
      }
    } finally {
      setRecording(false);
      setLoading(false);
      // Restaurar visibilidade do campo de texto após finalizar o áudio
      setInputVisible(true);
    }
  };

  const handleCancelAudio = async () => {
    try {
      // Notificar que parou de gravar
      const companyId = localStorage.getItem("companyId");
      if (!companyId) return;
      if (!socketManager?.GetSocket) return;
      const socket = socketManager.GetSocket(companyId);
      if (socket) {
        socket.emit("recording", { ticketId, status: false });
      }

      console.log("Cancelando gravação de áudio...");
      // Garantir que a gravação seja cancelada mesmo se houver algum problema
      try {
        const success = audioRecorder.cancelRecording();
        if (!success) {
          console.warn('Problema ao cancelar gravação');
        }
      } catch (cancelErr) {
        console.error('Erro específico ao cancelar gravação:', cancelErr);
      }

      // Limpar quaisquer recursos de áudio pendentes
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          stream.getTracks().forEach(track => track.stop());
        } catch (err) {
          console.warn('Não foi possível limpar recursos de mídia:', err);
        }
      }
    } catch (err) {
      console.error('Erro ao cancelar gravação:', err);
      toast.error("Erro ao cancelar gravação");
    } finally {
      setRecording(false);
      // Restaurar visibilidade do campo de texto após cancelar o áudio
      setInputVisible(true);
    }
  };

  const disableOption = () => {
    return loading || recording || ticketStatus !== "open";
  };

  const renderReplyingMessage = (message) => {
    return (
      <ReplyingMsgWrapper>
        <ReplyingMsgContainer>
          <span
            className={clsx(
              message.fromMe
                ? ReplyingContactMsgSideColor
                : ReplyingSelfMsgSideColor
            )}
          ></span>
          {replyingMessage && (
            <ReplyingMsgBody>
              {!message.fromMe && (
                <MessageContactName>
                  {message.contact?.name}
                </MessageContactName>
              )}
              {message.body}
            </ReplyingMsgBody>
          )}
        </ReplyingMsgContainer>
        <IconButton
          aria-label="showRecorder"
          component="span"
          disabled={loading || ticketStatus !== "open"}
          onClick={() => {
            setReplyingMessage(null);
            setEditingMessage(null);
            setInputMessage("");
          }}
          size="large"
        >
          <ClearIcon sx={{ color: 'grey' }} />
        </IconButton>
      </ReplyingMsgWrapper>
    );
  };

  // Ações para o SpeedDial
  const actions = [
    { icon: <MoodIcon />, name: "Emoji", action: () => setShowEmoji(prev => !prev) },
    { icon: <AttachFileIcon />, name: i18n.t("messagesInput.attach") || "Anexar", action: () => document.getElementById('upload-button').click() },
    { icon: <PersonIcon />, name: i18n.t("messagesInput.contact") || "Contato", action: handleSendContactModalOpen },
  ];

  if (medias.length > 0)
    return (
      <ViewMediaInputWrapper
        elevation={0}
        square
        onDragEnter={() => setOnDragEnter(true)}
        onDrop={(e) => handleInputDrop(e)}
      >
        <IconButton
          aria-label="cancel-upload"
          component="span"
          onClick={(e) => setMedias([])}
          size="large"
        >
          <CancelIcon sx={{ color: 'grey' }} />
        </IconButton>

        {loading ? (
          <div>
            <CircleLoading />
          </div>
        ) : (
          <GridFiles item>
            <Typography variant="h6" component="div">
              {i18n.t("uploads.titles.titleFileList")} ({medias.length})
            </Typography>
            <List>
              {medias.map((value, index) => {
                return (
                  <ListItem key={index}>
                    <ListItemAvatar>
                      <AvatarStyled
                        alt={value.name}
                        src={URL.createObjectURL(value)}
                      />
                    </ListItemAvatar>
                    <ListItemText
                      primary={`${value.name}`}
                      secondary={`${parseInt(value.size / 1024)} kB`}
                    />
                  </ListItem>
                );
              })}
            </List>
            <InputBase
              style={{ width: "0", height: "0" }}
              inputRef={function (input) {
                if (input != null) {
                  input.focus();
                }
              }}
              onKeyPress={async (e) => {
                if (e.key === "Enter") {
                  await handleUploadMedia();
                }
              }}
              defaultValue={medias[0].name}
            />
          </GridFiles>
        )}
        <IconButton
          aria-label="send-upload"
          component="span"
          onClick={handleUploadMedia}
          disabled={loading}
          size="large"
        >
          <SendIcon sx={{ color: 'grey' }} />
        </IconButton>
      </ViewMediaInputWrapper>
    );
  else {
    return (
      <>
        {senVcardModalOpen && (
          <ContactSendModal
            modalOpen={senVcardModalOpen}
            onClose={async (c) => {
              await handleSendContatcMessage(c);
            }}
          />
        )}

        <MediaPreviewModal
          open={showMediaPreview}
          onClose={() => setShowMediaPreview(false)}
          medias={selectedMedias}
          onCaption={handleMediaCaptions}
          onDelete={(index) => handleDeleteMedia(index)}
          onAddMore={handleAddMoreMedia}
        />

        <MainWrapper
          square
          elevation={0}
          onDragEnter={() => setOnDragEnter(true)}
          onDrop={(e) => handleInputDrop(e)}
        >
          {(replyingMessage && renderReplyingMessage(replyingMessage)) ||
            (editingMessage && renderReplyingMessage(editingMessage))}
          <NewMessageBox>
            {/* Área do SpeedDial */}
            <Box sx={{
              display: 'flex',
              alignItems: 'center',
              marginRight: '10px'
            }}>
              <SpeedDial
                ariaLabel="Message actions"
                sx={{
                  height: '32px',
                  '& .MuiFab-root': {
                    width: '28px',
                    height: '28px',
                    minHeight: '28px',
                    margin: 0
                  },
                  '& .MuiSpeedDial-actions': {
                    paddingBottom: '40px',
                    marginBottom: '0px'
                  },
                  '& .MuiSpeedDialAction-fab': {
                    marginBottom: '16px'
                  }
                }}
                icon={<AddIcon fontSize="small" sx={{ color: 'grey' }} />}
                onClose={() => {
                  // Não fechar o emoji aqui, apenas o SpeedDial
                  setSpeedDialOpen(false);
                }}
                onOpen={() => setSpeedDialOpen(true)}
                open={speedDialOpen}
                direction="up"
                FabProps={{
                  size: "small",
                  disabled: disableOption(),
                  sx: {
                    boxShadow: 'none',
                    backgroundColor: 'transparent',
                    '&:hover': {
                      backgroundColor: 'rgba(0, 0, 0, 0.04)'
                    }
                  }
                }}
              >
                {actions.map((action) => (
                  <SpeedDialAction
                    key={action.name}
                    icon={React.cloneElement(action.icon, { sx: { color: 'grey' } })}
                    tooltipTitle={action.name}
                    onClick={(e) => {
                      // Executar a ação normalmente
                      action.action(e);

                      // Fechar o SpeedDial apenas para ações diferentes de emoji
                      if (action.name !== "Emoji") {
                        setSpeedDialOpen(false);
                      }
                    }}
                    FabProps={{
                      disabled: disableOption(),
                      size: "small"
                    }}
                  />
                ))}
              </SpeedDial>

              {/* Input para upload de arquivos (invisível) */}
              <UploadInput
                multiple
                type="file"
                id="upload-button"
                disabled={disableOption()}
                onChange={handleChangeMedias}
              />

              {/* Painel de emoji com botão para fechar */}
              {/* Painel de emoji com botão para fechar */}
              {showEmoji && (
                <EmojiBox>
                  <Box sx={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    padding: '4px'
                  }}>
                    <IconButton
                      size="small"
                      onClick={() => setShowEmoji(false)}
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </Box>
                  <Picker
                    perLine={16}
                    showPreview={false}
                    showSkinTones={false}
                    onSelect={handleAddEmoji}
                  />
                </EmojiBox>
              )}
            </Box>

            <SignSwitch
              width={props.width}
              setSignMessage={setSignMessage}
              signMessage={signMessage}
            />

            <Tooltip title={internalMessageMode ? "Desativar mensagem interna" : "Ativar mensagem interna"}>
              <IconButton
                color={internalMessageMode ? "primary" : "default"}
                onClick={() => setInternalMessageMode(!internalMessageMode)}
                disabled={disableOption()}
                size="large"
              >
                <Badge
                  color="primary"
                  variant="dot"
                  invisible={!internalMessageMode}
                >
                  <MoreVertIcon sx={{ color: internalMessageMode ? "orange" : "grey" }} />
                </Badge>
              </IconButton>
            </Tooltip>


            {/* Campo de texto */}
            {inputVisible && (
              <CustomInput
                loading={loading}
                inputRef={inputRef}
                ticketStatus={ticketStatus}
                sendTypingStatus={sendTypingStatus}
                inputMessage={inputMessage}
                setInputMessage={setInputMessage}
                handleSendMessage={handleSendMessage}
                handleInputPaste={handleInputPaste}
                disableOption={disableOption}
                handleQuickAnswersClick={handleQuickAnswersClick}
                internalMessageMode={internalMessageMode}
                messageInputWrapperInternal={messageInputWrapperInternal}
                sx={{ flexGrow: 1 }}
              />
            )}

            <ActionButtons
              inputMessage={inputMessage}
              loading={loading}
              recording={recording}
              ticketStatus={ticketStatus}
              handleSendMessage={handleSendMessage}
              handleCancelAudio={handleCancelAudio}
              handleUploadAudio={handleUploadAudio}
              handleStartRecording={handleStartRecording}
            />
          </NewMessageBox>
        </MainWrapper>
      </>
    );
  }
};

export default withWidth()(MessageInputCustom);