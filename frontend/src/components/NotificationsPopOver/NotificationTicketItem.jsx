import React, { useState } from "react";
import { styled } from '@mui/material/styles';
import { format } from "date-fns";
import { parseISO } from "date-fns";
import { green, grey, red, blue, orange } from "@mui/material/colors";

import ListItem from "@mui/material/ListItem";
import Typography from "@mui/material/Typography";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Tooltip from "@mui/material/Tooltip";
import IconButton from "@mui/material/IconButton";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";

import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import InstagramIcon from "@mui/icons-material/Instagram";
import FacebookIcon from "@mui/icons-material/Facebook";
import AndroidIcon from "@mui/icons-material/Android";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import ThumbUpAltOutlinedIcon from '@mui/icons-material/ThumbUpAltOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import ThumbDownAltOutlinedIcon from '@mui/icons-material/ThumbDownAltOutlined';
import VisibilityIcon from "@mui/icons-material/Visibility";
import MoreVertIcon from '@mui/icons-material/MoreVert';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';

import { i18n } from "../../translate/i18n";
import { generateColor } from "../../helpers/colorGenerator";
import { getInitials } from "../../helpers/getInitials";
import WhatsMarkedWrapper from "../WhatsMarkedWrapper";
import TagsModal from "../TicketListItem/TagsModal";

// Styled components usando a API styled do MUI 5
const NotificationItem = styled(ListItem)(({ theme }) => ({
  marginBottom: "5px",
  borderRadius: "4px",
  backgroundColor: theme.palette.background.paper,
  transition: "background-color 0.2s",
  "&:hover": {
    backgroundColor: theme.palette.action.hover,
  },
  padding: "8px",
  position: "relative",
  minHeight: "70px",

  // Layout responsivo para mobile
  [theme.breakpoints.down('sm')]: {
    padding: "6px",
    minHeight: "60px",
  }
}));

const StyledAvatar = styled(Avatar)(({ theme }) => ({
  width: 42,
  height: 42,
  marginRight: "8px",

  // Layout responsivo para mobile
  [theme.breakpoints.down('sm')]: {
    width: 36,
    height: 36,
    marginRight: "6px",
  }
}));

const ContentWrapper = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  width: "100%",
  overflow: "hidden"
}));

const HeaderRow = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: "2px",
  width: "100%"
}));

const NameAndChannel = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
  maxWidth: "70%"
}));

const ContactName = styled(Typography)(({ theme }) => ({
  fontWeight: 500,
  marginLeft: "4px",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",

  // Layout responsivo para mobile
  [theme.breakpoints.down('sm')]: {
    fontSize: "13px",
  }
}));

const ChannelIcon = styled('span')(({ theme }) => ({
  marginRight: "4px",
  flexShrink: 0,
  display: "flex"
}));

const MessagePreview = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.secondary,
  fontSize: "13px",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
  width: "100%",

  // Layout responsivo para mobile
  [theme.breakpoints.down('sm')]: {
    fontSize: "12px",
  }
}));

const TimeStamp = styled(Typography)(({ theme }) => ({
  fontSize: "11px",
  color: theme.palette.text.secondary,
  marginLeft: "auto",
  flexShrink: 0,

  // Layout responsivo para mobile
  [theme.breakpoints.down('sm')]: {
    fontSize: "10px",
  }
}));

const BadgesRow = styled(Box)(({ theme }) => ({
  display: "flex",
  flexWrap: "wrap",
  gap: "4px",
  marginTop: "4px",

  // Layout responsivo para mobile
  [theme.breakpoints.down('sm')]: {
    marginTop: "2px",
  }
}));

const StandardBadge = styled('span')(({ theme, bgcolor }) => ({
  fontSize: "10px",
  padding: "1px 6px",
  borderRadius: "10px",
  backgroundColor: bgcolor || "#7C7C7C",
  color: "white",
  whiteSpace: "nowrap",
  display: "inline-flex",
  alignItems: "center",
  height: "16px",

  // Layout responsivo para mobile
  [theme.breakpoints.down('sm')]: {
    fontSize: "9px",
    padding: "1px 4px",
    height: "14px",
  }
}));

const MoreTagsButton = styled('span')(({ theme }) => ({
  fontSize: "10px",
  padding: "1px 6px",
  borderRadius: "10px",
  backgroundColor: "#757575",
  color: "white",
  cursor: "pointer",
  display: "inline-flex",
  alignItems: "center",
  height: "16px",

  // Layout responsivo para mobile
  [theme.breakpoints.down('sm')]: {
    fontSize: "9px",
    padding: "1px 4px",
    height: "14px",
  }
}));

const UnreadIndicator = styled('div')(({ theme }) => ({
  width: "8px",
  height: "8px",
  borderRadius: "50%",
  backgroundColor: green[500],
  marginLeft: "4px",
  flexShrink: 0
}));

const ActionButtons = styled(Box)(({ theme }) => ({
  display: "flex",
  position: "absolute",
  right: 8,
  top: 28,
  gap: 4,
  zIndex: 10,

  // Layout responsivo para mobile
  [theme.breakpoints.down('sm')]: {
    display: "none" // Esconde no mobile, usa o menu no lugar
  }
}));

const ActionButton = styled(IconButton)(({ theme }) => ({
  padding: 4,
  backgroundColor: theme.palette.background.paper,
  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
  "&:hover": {
    backgroundColor: theme.palette.action.hover
  },
  width: 24,
  height: 24
}));

const MobileMenuButton = styled(IconButton)(({ theme }) => ({
  padding: 4,
  marginLeft: 4,
  display: "none", // Esconde por padrão
  
  // Mostra apenas no mobile
  [theme.breakpoints.down('sm')]: {
    display: "flex"
  }
}));

const NotificationTicketItem = ({ ticket, onClick, onAccept, onReject, onSpy, onDelete, onClose }) => {
  const [tagsModalOpen, setTagsModalOpen] = useState(false);
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const handleOpenTagsModal = (e) => {
    if (e) e.stopPropagation();
    setTagsModalOpen(true);
  };
  
  const getLastMessage = (message) => {
    if (!message) return "";
    if (message.length > 30) return message.substring(0, 30) + "...";
    return message;
  };

  const handleOpenMenu = (e) => {
    e.stopPropagation();
    setMenuAnchorEl(e.currentTarget);
  };

  const handleCloseMenu = () => {
    setMenuAnchorEl(null);
  };

  // Esta função foi modificada para evitar usar o contexto problemático
  const handleSpyClick = (e) => {
    e.stopPropagation();
    handleCloseMenu();
    if (onSpy) {
      // Passamos apenas o ID do ticket, não o ticket inteiro
      onSpy(ticket.id);
    }
  };

  const handleAcceptClick = (e) => {
    e.stopPropagation();
    handleCloseMenu();
    if (onAccept) {
      onAccept(ticket.id);
    }
  };

  const handleRejectClick = (e) => {
    e.stopPropagation();
    handleCloseMenu();
    if (onReject) {
      onReject(ticket.id);
    }
  };

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    handleCloseMenu();
    if (onDelete) {
      onDelete(ticket.id);
    }
  };

  const handleCloseClick = (e) => {
    e.stopPropagation();
    handleCloseMenu();
    if (onClose) {
      onClose(ticket.id);
    }
  };

  // Renderiza botões de ação
  const renderActionButtons = () => {
    return (
      <ActionButtons>
        {ticket.status === "pending" && (
          <>
            <Tooltip title={i18n.t("ticketsList.buttons.accept") || "Aceitar"}>
              <ActionButton
                size="small"
                onClick={handleAcceptClick}
              >
                <ThumbUpAltOutlinedIcon
                  fontSize="small"
                  sx={{ color: green[700], fontSize: 14 }}
                />
              </ActionButton>
            </Tooltip>
            
            <Tooltip title={i18n.t("ticketsList.buttons.spy") || "Espiar"}>
              <ActionButton
                size="small"
                onClick={handleSpyClick}
              >
                <VisibilityIcon
                  fontSize="small"
                  sx={{ color: blue[700], fontSize: 14 }}
                />
              </ActionButton>
            </Tooltip>
            
            <Tooltip title={i18n.t("ticketsList.buttons.reject") || "Recusar"}>
              <ActionButton
                size="small"
                onClick={handleRejectClick}
              >
                <ThumbDownAltOutlinedIcon
                  fontSize="small" 
                  sx={{ color: orange[700], fontSize: 14 }}
                />
              </ActionButton>
            </Tooltip>
            
            <Tooltip title={i18n.t("ticketsList.buttons.delete") || "Deletar"}>
              <ActionButton
                size="small"
                onClick={handleDeleteClick}
              >
                <DeleteOutlineOutlinedIcon
                  fontSize="small"
                  sx={{ color: red[700], fontSize: 14 }}
                />
              </ActionButton>
            </Tooltip>
          </>
        )}
        
        {ticket.status === "open" && (
          <Tooltip title={i18n.t("ticketsList.buttons.close") || "Finalizar"}>
            <ActionButton
              size="small"
              onClick={handleCloseClick}
            >
              <CheckCircleOutlineIcon
                fontSize="small"
                sx={{ color: green[700], fontSize: 14 }}
              />
            </ActionButton>
          </Tooltip>
        )}
      </ActionButtons>
    );
  };
  
  // Renderiza menu de ações para mobile
  const renderActionMenu = () => {
    return (
      <>
        <MobileMenuButton
          size="small"
          onClick={handleOpenMenu}
          aria-label="Ações"
        >
          <MoreVertIcon fontSize="small" />
        </MobileMenuButton>
        
        <Menu
          anchorEl={menuAnchorEl}
          open={Boolean(menuAnchorEl)}
          onClose={handleCloseMenu}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
        >
          {ticket.status === "pending" && (
            <>
              <MenuItem onClick={handleAcceptClick}>
                <ListItemIcon>
                  <ThumbUpAltOutlinedIcon fontSize="small" sx={{ color: green[700] }} />
                </ListItemIcon>
                <ListItemText>Aceitar</ListItemText>
              </MenuItem>
              
              <MenuItem onClick={handleSpyClick}>
                <ListItemIcon>
                  <VisibilityIcon fontSize="small" sx={{ color: blue[700] }} />
                </ListItemIcon>
                <ListItemText>Espiar</ListItemText>
              </MenuItem>
              
              <MenuItem onClick={handleRejectClick}>
                <ListItemIcon>
                  <ThumbDownAltOutlinedIcon fontSize="small" sx={{ color: orange[700] }} />
                </ListItemIcon>
                <ListItemText>Recusar</ListItemText>
              </MenuItem>
              
              <MenuItem onClick={handleDeleteClick}>
                <ListItemIcon>
                  <DeleteOutlineOutlinedIcon fontSize="small" sx={{ color: red[700] }} />
                </ListItemIcon>
                <ListItemText>Deletar</ListItemText>
              </MenuItem>
            </>
          )}
          
          {ticket.status === "open" && (
            <MenuItem onClick={handleCloseClick}>
              <ListItemIcon>
                <CheckCircleOutlineIcon fontSize="small" sx={{ color: green[700] }} />
              </ListItemIcon>
              <ListItemText>Finalizar</ListItemText>
            </MenuItem>
          )}
        </Menu>
      </>
    );
  };
  
  // Renderiza badges de tags (limitado a 2)
  const renderTags = () => {
    if (!ticket.tags || ticket.tags.length === 0) return null;
    
    // Limite de tags mostradas
    const tagLimit = isMobile ? 1 : 2;
    
    // Mostra só as primeiras tags no popup de notificação
    const displayedTags = ticket.tags.slice(0, tagLimit);
    const remainingTags = ticket.tags.length > tagLimit ? ticket.tags.slice(tagLimit) : [];
    
    return (
      <>
        {displayedTags.map(tag => (
          <StandardBadge 
            key={tag.id} 
            bgcolor={tag.color}
          >
            {tag.name.toUpperCase()}
          </StandardBadge>
        ))}
        
        {remainingTags.length > 0 && (
          <MoreTagsButton 
            onClick={handleOpenTagsModal}
          >
            <MoreHorizIcon fontSize="small" style={{ fontSize: 10, marginRight: 2 }} />
            {`+${remainingTags.length}`}
          </MoreTagsButton>
        )}
      </>
    );
  };
  
  const renderChannelIcon = () => {
    switch (ticket.channel) {
      case "whatsapp":
        return <WhatsAppIcon sx={{ fontSize: isMobile ? 16 : 18, color: "#30D24E" }} />;
      case "instagram":
        return <InstagramIcon sx={{ fontSize: isMobile ? 16 : 18, color: "#F60078" }} />;
      case "facebook":
        return <FacebookIcon sx={{ fontSize: isMobile ? 16 : 18, color: "#4867AA" }} />;
      default:
        return null;
    }
  };
  
  return (
    <>
      <NotificationItem
        button 
        onClick={onClick}
      >
        <StyledAvatar
          src={ticket?.contact?.profilePicUrl}
          sx={{ 
            backgroundColor: generateColor(ticket?.contact?.number)
          }}
        >
          {getInitials(ticket?.contact?.name || "")}
        </StyledAvatar>
        
        <ContentWrapper>
          <HeaderRow>
            <NameAndChannel>
              <ChannelIcon>
                {renderChannelIcon()}
              </ChannelIcon>
              <ContactName variant="body2" noWrap>
                {ticket.contact?.name}
              </ContactName>
            </NameAndChannel>
            
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <TimeStamp variant="caption">
                {ticket.updatedAt && format(parseISO(ticket.updatedAt), "HH:mm")}
              </TimeStamp>
              
              {ticket.unreadMessages > 0 && (
                <UnreadIndicator sx={{ ml: 1 }} />
              )}
              
              {/* Menu de ações para mobile */}
              {renderActionMenu()}
            </Box>
          </HeaderRow>
          
          <MessagePreview variant="body2">
            {ticket.lastMessage?.includes('data:image/png;base64') ? (
              <WhatsMarkedWrapper>Localização</WhatsMarkedWrapper>
            ) : (
              <WhatsMarkedWrapper>{getLastMessage(ticket.lastMessage)}</WhatsMarkedWrapper>
            )}
          </MessagePreview>
          
          <BadgesRow>
            {ticket.queue?.name && (
              <StandardBadge bgcolor={ticket.queue.color}>
                {ticket.queue.name}
              </StandardBadge>
            )}
            
            {renderTags()}
            
            {ticket.chatbot && (
              <Tooltip title="Chatbot">
                <AndroidIcon
                  fontSize="small"
                  sx={{ 
                    color: grey[700], 
                    fontSize: isMobile ? 12 : 14,
                    ml: 0.5
                  }}
                />
              </Tooltip>
            )}
          </BadgesRow>
        </ContentWrapper>
        
        {/* Botões de ação para desktop */}
        {renderActionButtons()}
      </NotificationItem>
      
      {ticket.tags && ticket.tags.length > 0 && (
        <TagsModal 
          open={tagsModalOpen} 
          onClose={() => setTagsModalOpen(false)} 
          tags={ticket.tags}
          ticketId={ticket.id}
        />
      )}
    </>
  );
};

export default NotificationTicketItem;