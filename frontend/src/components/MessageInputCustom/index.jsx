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
  Psychology as PsychologyIcon, // Added import statement for PsychologyIcon
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
import useSettings from "../../hooks/useSettings";
import AISuggestionWidget from "../AISuggestionWidget";
import MediaPreviewModal from './MediaPreviewModal';
import ContactSendModal from "../ContactSendModal";

const audioRecorder = new AudioRecorderService();

// Remainder of the file remains unchanged