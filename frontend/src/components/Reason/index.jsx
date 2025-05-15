import React, { useState, useEffect } from 'react';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
  CircularProgress
} from '@mui/material';
import { toast } from "../../helpers/toast";
import { makeStyles } from '@mui/styles';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import api from '../../services/api';

const useStyles = makeStyles((theme) => ({
  paper: {
    padding: theme.spacing(2),
    display: 'flex',
    flexDirection: 'column',
  },
  addButtonContainer: {
    display: 'flex',
    justifyContent: 'flex-start',  // Alinha o botão à esquerda
    marginBottom: theme.spacing(2),
  },
  tableContainer: {
    maxHeight: '60vh',
  },
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '200px',
  },
}));

const Reason = () => {
  const classes = useStyles();
  const [reasons, setReasons] = useState([]);
  const [open, setOpen] = useState(false);
  const [currentReason, setCurrentReason] = useState({name: '', message: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadReasons();
  }, []);

  const loadReasons = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/reasons');
      setReasons(response.data);
    } catch (err) {
      console.error('Erro ao carregar motivos de encerramento:', err);
      setError('Erro ao carregar motivos de encerramento. Por favor, tente novamente.');
      toast.error('Erro ao carregar motivos de encerramento');
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = (reason = { id: null, name: '', message: '' }) => {
    setCurrentReason(reason);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setCurrentReason({ id: null, name: '', message: '' });
  };

  const handleSave = async () => {
    try {
      if (currentReason.id) {
        await api.put(`/reasons/${currentReason.id}`, currentReason);
        toast.success('Motivo de encerramento atualizado com sucesso');
      } else {
        const { name, message } = currentReason;
        await api.post('/reasons', { name, message });
      }
      await loadReasons();
      handleClose();
    } catch (err) {
      console.error('Erro ao salvar motivo de encerramento:', err);
      toast.error('Erro ao salvar motivo de encerramento');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este motivo de encerramento?')) {
      try {
        await api.delete(`/reasons/${id}`);
        toast.success('Motivo de encerramento excluído com sucesso');
        await loadReasons();
      } catch (err) {
        console.error('Erro ao excluir motivo de encerramento:', err);
        toast.error('Erro ao excluir motivo de encerramento');
      }
    }
  };

  console.log('Rendering Reason component');
  console.log('Reasons:', reasons);
  console.log('Loading:', loading);
  console.log('Error:', error);

  return (
      <Paper className={classes.paper} elevation={0}>
        <div className={classes.addButtonContainer}>
          <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => handleOpen()}
          >
            Adicionar Novo Motivo
          </Button>
        </div>
        {loading ? (
            <div className={classes.loadingContainer}>
              <CircularProgress />
            </div>
        ) : error ? (
            <Typography color="error" align="center">{error}</Typography>
        ) : reasons.length === 0 ? (
            <Typography align="center">Nenhum motivo de encerramento encontrado.</Typography>
        ) : (
            <TableContainer className={classes.tableContainer}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>Nome</TableCell>
                    <TableCell>Mensagem</TableCell>
                    <TableCell align="right">Ações</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {reasons.map((reason) => (
                      <TableRow key={reason.id}>
                        <TableCell>{reason.name}</TableCell>
                        <TableCell>{reason.message}</TableCell>
                        <TableCell align="right">
                          <IconButton onClick={() => handleOpen(reason)} size="small">
                            <EditIcon />
                          </IconButton>
                          <IconButton onClick={() => handleDelete(reason.id)} size="small">
                            <DeleteOutlineIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
        )}
        <Dialog open={open} onClose={handleClose}>
          <DialogTitle>{currentReason.id ? 'Editar Motivo' : 'Adicionar Novo Motivo'}</DialogTitle>
          <DialogContent>
            <TextField
                autoFocus
                margin="dense"
                label="Nome"
                type="text"
                fullWidth
                value={currentReason.name}
                onChange={(e) => setCurrentReason({ ...currentReason, name: e.target.value })}
            />
            <TextField
                margin="dense"
                label="Mensagem"
                type="text"
                fullWidth
                value={currentReason.message}
                onChange={(e) => setCurrentReason({ ...currentReason, message: e.target.value })}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancelar</Button>
            <Button onClick={handleSave} color="primary">
              Salvar
            </Button>
          </DialogActions>
        </Dialog>
      </Paper>
  );
};

export default Reason;
