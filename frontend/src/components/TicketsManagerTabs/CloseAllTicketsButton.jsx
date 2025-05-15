import React, { useState, useEffect } from 'react';
import { 
  Button, 
  Menu, 
  MenuItem, 
  ListItemText, 
  ListItemIcon,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Divider,
  Tooltip
} from '@mui/material';
import { WhatsApp as WhatsAppIcon, Close as CloseIcon } from '@mui/icons-material';
import { styled, useTheme } from '@mui/material/styles';
import { toast } from '../../helpers/toast';
import api from '../../services/api';
import { i18n } from '../../translate/i18n';

// Usando styled API do MUI 5 em vez de makeStyles
const StyledMenuItem = styled(MenuItem)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
}));

const AllConnectionsMenuItem = styled(MenuItem)(({ theme }) => ({
  fontWeight: 'bold',
}));

const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiPaper-root': {
    minWidth: 300,
  },
}));

const ConnectionName = styled('span')(({ theme }) => ({
  fontWeight: 'bold',
}));

const ConfirmButton = styled(Button)(({ theme }) => ({
  backgroundColor: theme.palette.secondary.main,
  color: 'white',
  '&:hover': {
    backgroundColor: theme.palette.secondary.dark,
  },
}));

const CancelButton = styled(Button)(({ theme }) => ({
  borderColor: theme.palette.secondary.main,
  color: theme.palette.secondary.main,
}));

// Componente para o botão de fechar todos os tickets
export const CloseAllTicketsButton = ({ tabOpen, selectedQueueIds, isShowButtonCloseAll, companyId }) => {
  const theme = useTheme();
  const [connections, setConnections] = useState([]);
  const [selectedConnection, setSelectedConnection] = useState(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  useEffect(() => {
    // Carregar conexões disponíveis quando o componente montar
    if (companyId) {
      fetchConnections();
    }
  }, [companyId]);

  const fetchConnections = async () => {
    try {
      const { data } = await api.get('/whatsapp', { params: { companyId } });
      setConnections(data);
    } catch (err) {
      toast.error('Erro ao carregar conexões WhatsApp');
      console.error(err);
    }
  };

  const handleOpenMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleSelectConnection = (connection = null) => {
    setSelectedConnection(connection);
    handleCloseMenu();
    setConfirmDialogOpen(true);
  };

  const handleConfirmDialogClose = () => {
    setConfirmDialogOpen(false);
    setSelectedConnection(null);
  };

  const closeAllTickets = async () => {
    try {
      const whatsappId = selectedConnection ? selectedConnection.id : null;
      const { data } = await api.post("/tickets/closeAll", {
        status: tabOpen,
        whatsappId,
      });
      
      toast.success(`${data.count} tickets foram fechados com sucesso`);
      setConfirmDialogOpen(false);
      setSelectedConnection(null);
    } catch (err) {
      toast.error('Erro ao fechar tickets');
      console.error(err);
    }
  };

  // Renderize somente se o botão deve ser exibido
  if (!isShowButtonCloseAll) return null;

  return (
    <>
      <Tooltip title={i18n.t("tickets.inbox.closeAll")} arrow>
        <IconButton 
          onClick={handleOpenMenu}
          size="large"
          sx={{
            padding: 1,
            '&:hover': {
              backgroundColor: theme.palette.action.hover,
              borderRadius: '50%',
            },
            transition: 'all 0.2s ease-in-out'
          }}
        >
          <CloseIcon sx={{ color: theme.palette.primary.main }}/>
        </IconButton>
      </Tooltip>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseMenu}
      >
        <AllConnectionsMenuItem 
          onClick={() => handleSelectConnection(null)}
        >
          <ListItemText primary={i18n.t("tickets.connections.allConnections")} />
        </AllConnectionsMenuItem>
        
        <Divider />
        
        {connections.map((connection) => (
          <StyledMenuItem 
            key={connection.id} 
            onClick={() => handleSelectConnection(connection)}
          >
            <ListItemIcon>
              <WhatsAppIcon sx={{ color: connection.status === 'CONNECTED' ? 'green' : 'gray' }} />
            </ListItemIcon>
            <ListItemText primary={connection.name} />
          </StyledMenuItem>
        ))}
      </Menu>

      <StyledDialog
        open={confirmDialogOpen}
        onClose={handleConfirmDialogClose}
      >
        <DialogTitle>
          {i18n.t("tickets.inbox.confirmCloseTitle")}
        </DialogTitle>
        <DialogContent>
          <Typography>
            {selectedConnection 
              ? i18n.t("tickets.inbox.confirmCloseConnectionMessage", { connection: selectedConnection.name })
              : i18n.t("tickets.inbox.confirmCloseAllMessage")
            }
          </Typography>
        </DialogContent>
        <DialogActions>
          <CancelButton 
            onClick={handleConfirmDialogClose} 
            variant="outlined"
          >
            {i18n.t("tickets.inbox.cancel")}
          </CancelButton>
          <ConfirmButton 
            onClick={closeAllTickets} 
            variant="contained"
          >
            {i18n.t("tickets.inbox.confirm")}
          </ConfirmButton>
        </DialogActions>
      </StyledDialog>
    </>
  );
};