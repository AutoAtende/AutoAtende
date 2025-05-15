import React from 'react';
import PropTypes from 'prop-types';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Slide,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const DeleteConfirmationModal = ({ open, onClose, onConfirm, passwordData }) => {
  // Função para formatar a mensagem de confirmação com validação de dados
  const getMessage = () => {
    // Verificação de nulidade do passwordData
    if (!passwordData) {
      return 'Tem certeza que deseja excluir esta senha?';
    }

    // Verificação segura para application
    const hasApplication = passwordData.application && typeof passwordData.application === 'string' && passwordData.application.trim() !== '';
    
    // Verificação segura para employer
    const hasEmployer = passwordData.employer && 
                        typeof passwordData.employer === 'object' && 
                        passwordData.employer.name && 
                        typeof passwordData.employer.name === 'string' && 
                        passwordData.employer.name.trim() !== '';

    // Caso tenha aplicação mas não empregador
    if (hasApplication && !hasEmployer) {
      return `Tem certeza que deseja excluir a senha da aplicação <strong>${passwordData.application}</strong>?`;
    }

    // Caso tenha empregador mas não aplicação
    if (!hasApplication && hasEmployer) {
      return `Tem certeza que deseja excluir esta senha do empregador <strong>${passwordData.employer.name}</strong>?`;
    }

    // Caso tenha ambos
    if (hasApplication && hasEmployer) {
      return `Tem certeza que deseja excluir a senha da aplicação <strong>${passwordData.application}</strong> do empregador <strong>${passwordData.employer.name}</strong>?`;
    }

    // Caso não tenha nenhum dos dois
    return 'Tem certeza que deseja excluir esta senha?';
  };

  // Handler seguro para confirmação
  const handleConfirm = () => {
    if (typeof onConfirm === 'function') {
      onConfirm();
    }
  };

  // Handler seguro para fechar
  const handleClose = () => {
    if (typeof onClose === 'function') {
      onClose();
    }
  };

  return (
    <Dialog
      open={!!open}
      onClose={handleClose}
      TransitionComponent={Transition}
      keepMounted
    >
      <DialogTitle>Confirmar Exclusão</DialogTitle>
      <DialogContent>
        <DialogContentText dangerouslySetInnerHTML={{ __html: getMessage() }}>
        </DialogContentText>
        <DialogContentText sx={{ mt: 2 }}>
          Esta ação não poderá ser desfeita.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} startIcon={<CancelIcon />}>
          Cancelar
        </Button>
        <Button
          onClick={handleConfirm}
          color="error"
          variant="contained"
          startIcon={<DeleteIcon />}
        >
          Excluir
        </Button>
      </DialogActions>
    </Dialog>
  );
};

DeleteConfirmationModal.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  onConfirm: PropTypes.func,
  passwordData: PropTypes.shape({
    application: PropTypes.string,
    employer: PropTypes.shape({
      name: PropTypes.string,
    }),
  }),
};

DeleteConfirmationModal.defaultProps = {
  open: false,
  onClose: () => {},
  onConfirm: () => {},
  passwordData: null
};

export default DeleteConfirmationModal;