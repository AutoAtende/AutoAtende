import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Typography,
  Box,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Tooltip,
  useMediaQuery,
  styled
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { green, grey, red, blue, orange } from "@mui/material/colors";

import {
    Close as CloseIcon,
    Person as PersonIcon,
    WhatsApp as WhatsAppIcon,
    Instagram as InstagramIcon,
    Facebook as FacebookIcon,
    Android as AndroidIcon,
    Folder as FolderIcon,
    Tag as TagIcon,
    Label as LabelIcon,
    Visibility as VisibilityIcon,
    ThumbUpAltOutlined as ThumbUpAltOutlinedIcon,
    CheckCircleOutline as CheckCircleOutlineIcon,
    DeleteOutlineOutlined as DeleteOutlineOutlinedIcon,
    ThumbDownAltOutlined as ThumbDownAltOutlinedIcon,
    ViewKanban as KanbanIcon,
    Info as InfoIcon
  } from '@mui/icons-material';


import ConfirmationModal from "../ConfirmationModal";
import { i18n } from "../../translate/i18n";
import { Can } from "../Can";
import useSettings from "../../hooks/useSettings";
import ReasonSelectionModal from "../ReasonSelectionModal";
import QueueSelectionModal from "../QueueSelectionModal";
import TagsSelectionModal from "../TagsSelectionModal";
import TicketKanbanIntegration from "../TicketKanbanIntegration";

const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: 10,
    maxWidth: 500,
    width: '100%'
  }
}));

const CloseButton = styled(IconButton)(({ theme }) => ({
  position: 'absolute',
  right: 8,
  top: 8
}));

const DialogTitleStyled = styled(DialogTitle)(({ theme }) => ({
  padding: '16px 24px 8px 24px',
  textAlign: 'center'
}));

const DialogContentStyled = styled(DialogContent)(({ theme }) => ({
  padding: '0px 16px 16px 16px',
  overflowY: 'auto',
  maxHeight: 400
}));

const TagContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexWrap: 'wrap',
  gap: 8,
  marginTop: 8,
  marginBottom: 8
}));

const Tag = styled(Box)(({ theme, bgcolor }) => ({
  borderRadius: 10,
  padding: '6px 10px',
  fontSize: 12,
  color: 'white',
  display: 'inline-flex',
  alignItems: 'center',
  margin: '0 4px 4px 0',
  whiteSpace: 'nowrap',
  fontWeight: 500,
  backgroundColor: bgcolor || "#7C7C7C"
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  fontSize: 14,
  fontWeight: 500,
  color: theme.palette.text.secondary,
  margin: '16px 0 8px 0'
}));

const ActionButtons = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  gap: 12,
  marginTop: 16
}));

const ActionButton = styled(Button)(({ theme, color, bgcolor }) => ({
  backgroundColor: bgcolor || theme.palette.primary.main,
  color: color || 'white',
  '&:hover': {
    backgroundColor: bgcolor ? `${bgcolor}DD` : theme.palette.primary.dark,
  }
}));

const DialogActionsStyled = styled(DialogActions)(({ theme }) => ({
  padding: '8px 24px 16px 24px',
  justifyContent: 'center'
}));

const DetailItem = styled(ListItem)(({ theme }) => ({
  padding: '4px 0',
}));

const TicketDetailsModal = ({ 
  open, 
  onClose, 
  ticket, 
  ticketUser,
  whatsAppName,
  handleAcepptTicket,
  handleCloseTicket,
  handleSpyTicket,
  handleDeleteTicket,
  handleOpenConfirmationModal,
  user,
  confirmationOpen,
  setConfirmationOpen,
  setTabOpen
}) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const { settings } = useSettings();
  
  const enableQueueWhenCloseTicket = settings.enableQueueWhenCloseTicket;
  const enableTagsWhenCloseTicket = settings.enableTagsWhenCloseTicket;
  const enableReasonWhenCloseTicket = settings.enableReasonWhenCloseTicket;
  const [reasonModalOpen, setReasonModalOpen] = useState(false);
  const [queueModalOpen, setQueueModalOpen] = useState(false);
  const [tagModalOpen, setTagModalOpen] = useState(false);
  const [showKanbanSection, setShowKanbanSection] = useState(false);
    
  // Funções para o fechamento de ticket
  const handleCloseTicketWithModal = async () => {
    // Verificar qual configuração está ativa e abrir o modal correspondente
    if (enableQueueWhenCloseTicket && (!ticket.queue || !ticket.queue.id)) {
        // Só abre o modal de fila se o ticket não tiver fila definida
        setQueueModalOpen(true);
    } else if (enableTagsWhenCloseTicket) {
        setTagModalOpen(true);
    } else if (enableReasonWhenCloseTicket) {
        setReasonModalOpen(true);
    } else {
        // Se nenhuma opção estiver ativa, fechar ticket diretamente
        await handleCloseTicket(ticket.id);
        if (setTabOpen) setTabOpen("open");
        onClose();
    }
  };

  if (!ticket) {
    return null;
  }

  const getChannelIcon = () => {
    switch (ticket.channel) {
      case "whatsapp":
        return <WhatsAppIcon style={{ color: "#30D24E" }} />;
      case "instagram":
        return <InstagramIcon style={{ color: "#F60078" }} />;
      case "facebook":
        return <FacebookIcon style={{ color: "#4867AA" }} />;
      default:
        return null;
    }
  };

  const renderTagsList = () => {
    if (!ticket.tags || ticket.tags.length === 0) {
      return (
        <Typography variant="body2" color="textSecondary" align="center">
          Nenhuma tag associada
        </Typography>
      );
    }

    return (
      <TagContainer>
        {ticket.tags.map((tag) => (
          <Tag key={tag.id} bgcolor={tag.color}>
            {tag.name.toUpperCase()}
          </Tag>
        ))}
      </TagContainer>
    );
  };

  return (
    <StyledDialog
      open={open}
      onClose={onClose}
      fullScreen={fullScreen}
      aria-labelledby="ticket-details-dialog-title"
    >
      <DialogTitleStyled id="ticket-details-dialog-title">
        <Typography variant="h6">
          Detalhes do Ticket
        </Typography>
        <CloseButton
          aria-label="close"
          onClick={onClose}
          size="large"
        >
          <CloseIcon />
        </CloseButton>
      </DialogTitleStyled>
      <DialogContentStyled dividers>
        <List disablePadding>
          {/* Informações de Contato */}
          <DetailItem>
            <ListItemIcon sx={{ minWidth: 36 }}>
              {getChannelIcon()}
            </ListItemIcon>
            <ListItemText 
              primary={ticket.contact?.name || "Sem nome"} 
              secondary={ticket.contact?.number || "Sem número"}
              primaryTypographyProps={{ fontWeight: 'medium' }}
            />
          </DetailItem>

          <Divider variant="fullWidth" sx={{ my: 1.5 }} />

          {/* Usuário atendente */}
          {ticketUser && (
            <DetailItem>
              <ListItemIcon sx={{ minWidth: 36 }}>
                <PersonIcon style={{ color: ticket.user?.color || "#111B21" }} />
              </ListItemIcon>
              <ListItemText 
                primary="Atendente" 
                secondary={ticketUser}
                primaryTypographyProps={{ variant: 'caption', color: 'textSecondary' }}
                secondaryTypographyProps={{ fontWeight: 'medium' }}
              />
            </DetailItem>
          )}

          {/* Conexão WhatsApp */}
          {ticket.whatsappId && (
            <DetailItem>
              <ListItemIcon sx={{ minWidth: 36 }}>
                <WhatsAppIcon style={{ color: ticket.whatsapp?.color || "#ae2012" }} />
              </ListItemIcon>
              <ListItemText 
                primary="Conexão" 
                secondary={whatsAppName}
                primaryTypographyProps={{ variant: 'caption', color: 'textSecondary' }}
                secondaryTypographyProps={{ fontWeight: 'medium' }}
              />
            </DetailItem>
          )}

          {/* Fila */}
          <DetailItem>
            <ListItemIcon sx={{ minWidth: 36 }}>
              <FolderIcon style={{ color: ticket.queue?.color || "#7C7C7C" }} />
            </ListItemIcon>
            <ListItemText 
              primary="Setor" 
              secondary={ticket.queue?.name || "Sem fila"}
              primaryTypographyProps={{ variant: 'caption', color: 'textSecondary' }}
              secondaryTypographyProps={{ fontWeight: 'medium' }}
            />
          </DetailItem>

          {/* Chatbot */}
          {ticket.chatbot && (
            <DetailItem>
              <ListItemIcon sx={{ minWidth: 36 }}>
                <AndroidIcon style={{ color: grey[700] }} />
              </ListItemIcon>
              <ListItemText 
                primary="Chatbot" 
                secondary="Atendimento automatizado"
                primaryTypographyProps={{ variant: 'caption', color: 'textSecondary' }}
                secondaryTypographyProps={{ fontWeight: 'medium' }}
              />
            </DetailItem>
          )}

          <Divider variant="fullWidth" sx={{ my: 1.5 }} />

          {/* Seção Kanban */}
          <SectionTitle>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box display="flex" alignItems="center">
                <KanbanIcon sx={{ fontSize: 16, mr: 0.5 }} />
                Kanban
              </Box>
              <ActionButton
                size="small"
                variant="outlined"
                onClick={() => setShowKanbanSection(!showKanbanSection)}
                startIcon={<InfoIcon />}
              >
                {showKanbanSection ? 'Ocultar' : 'Mostrar'}
              </ActionButton>
            </Box>
          </SectionTitle>
          
          {showKanbanSection && (
            <Box sx={{ mt: 1, mb: 2 }}>
              <TicketKanbanIntegration 
                ticket={ticket}
                onUpdate={(updatedTicket) => {
                  // Callback para atualizar dados se necessário
                }}
                showInTicketDetails={true}
              />
            </Box>
          )}

          {/* Tags */}
          <SectionTitle>
            <Box display="flex" alignItems="center">
              <TagIcon sx={{ fontSize: 16, mr: 0.5 }} />
              Tags
            </Box>
          </SectionTitle>
          {renderTagsList()}
        </List>

        {/* Botões de Ação */}
        <ActionButtons>
          {ticket.status === "open" && (
            <Tooltip title="Finalizar Atendimento">
              <ActionButton 
                variant="contained" 
                bgcolor={green[700]}
                startIcon={<CheckCircleOutlineIcon />}
                onClick={handleCloseTicketWithModal}
              >
                Finalizar
              </ActionButton>
            </Tooltip>
          )}
          {ticket.status === "pending" && (
            <>
              <Tooltip title="Iniciar Atendimento">
                <ActionButton 
                  variant="contained" 
                  bgcolor={green[700]}
                  startIcon={<ThumbUpAltOutlinedIcon />}
                  onClick={async () => {
                    await handleAcepptTicket(ticket.id);
                    if (setTabOpen) setTabOpen("open");
                    onClose();
                  }}
                >
                  Aceitar
                </ActionButton>
              </Tooltip>
              <Can
                role={user.profile}
                perform="ticket-options:spy"
                yes={() => (
                  <Tooltip title="Espiar Conversa">
                    <ActionButton 
                      variant="contained" 
                      bgcolor={blue[700]}
                      startIcon={<VisibilityIcon />}
                      onClick={(e) => {
                        handleSpyTicket(e);
                        onClose();
                      }}
                    >
                      Espiar
                    </ActionButton>
                  </Tooltip>
                )}
              />
              <Can
                role={user.profile}
                perform="ticket-options:reject"
                yes={() => (
                  <Tooltip title="Recusar Atendimento">
                    <ActionButton 
                      variant="contained" 
                      bgcolor={orange[700]}
                      startIcon={<ThumbDownAltOutlinedIcon />}
                      onClick={handleCloseTicketWithModal}
                    >
                      Recusar
                    </ActionButton>
                  </Tooltip>
                )}
              />
              <Can
                role={user.profile}
                perform="ticket-options:deleteTicket"
                yes={() => (
                  <Tooltip title="Deletar Entrada">
                    <ActionButton 
                      variant="contained" 
                      bgcolor={red[700]}
                      startIcon={<DeleteOutlineOutlinedIcon />}
                      onClick={() => {
                        handleOpenConfirmationModal(ticket.id);
                        onClose();
                      }}
                    >
                      Deletar
                    </ActionButton>
                  </Tooltip>
                )}
              />
            </>
          )}
        </ActionButtons>
      </DialogContentStyled>
      <DialogActionsStyled>
        <Button onClick={onClose} color="primary" variant="outlined">
          Fechar
        </Button>
      </DialogActionsStyled>

      <ConfirmationModal
        title={`${i18n.t("ticketOptionsMenu.confirmationModal.titleFrom")} ${ticket.contact?.name}?`}
        open={confirmationOpen}
        onClose={() => setConfirmationOpen(false)}
        onConfirm={handleDeleteTicket}
      >
        {i18n.t("ticketOptionsMenu.confirmationModal.message")}
      </ConfirmationModal>
      
      {/* Modais para o fechamento do ticket */}
      {reasonModalOpen && (
        <ReasonSelectionModal
          open={reasonModalOpen}
          onClose={() => setReasonModalOpen(false)}
          onConfirm={async (reasonId) => {
            await handleCloseTicket(ticket.id, reasonId);
            setReasonModalOpen(false);
            if (setTabOpen) setTabOpen("open");
            onClose();
          }}
        />
      )}

      {queueModalOpen && (
        <QueueSelectionModal
          open={queueModalOpen}
          onClose={() => setQueueModalOpen(false)}
          onConfirm={async (queueId) => {
            await handleCloseTicket(ticket.id, null, queueId);
            setQueueModalOpen(false);
            if (setTabOpen) setTabOpen("open");
            onClose();
          }}
        />
      )}

      {tagModalOpen && (
        <TagsSelectionModal
          open={tagModalOpen}
          onClose={() => setTagModalOpen(false)}
          onConfirm={async (tags) => {
            await handleCloseTicket(ticket.id, null, null, tags);
            setTagModalOpen(false);
            if (setTabOpen) setTabOpen("open");
            onClose();
          }}
        />
      )}
    </StyledDialog>
  );
};

export default TicketDetailsModal;