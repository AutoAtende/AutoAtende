import React, { useState, useEffect, useContext } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Button,
  IconButton,
  Box,
  Typography,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  CircularProgress,
  Chip
} from '@mui/material';
import {
  Close as CloseIcon,
  Add as AddIcon,
  SupervisorAccount as AdminIcon,
  Person as UserIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import { useFormik } from 'formik';
import { format } from 'date-fns';
import * as Yup from 'yup';
import { toast } from '../../../helpers/toast';
import { AuthContext } from '../../../context/Auth/AuthContext';
import api from '../../../services/api';
import ConfirmationModal from '../../../components/ConfirmationModal';

const validationSchema = Yup.object().shape({
  name: Yup.string()
    .required('Nome é obrigatório'),
  email: Yup.string()
    .email('Email inválido')
    .required('Email é obrigatório'),
  profile: Yup.string()
    .required('Perfil é obrigatório')
});

const CellContent = ({ children }) => (
  <div style={{ 
    fontSize: '0.875rem',
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center'
  }}>
    {children}
  </div>
);

const CompanyUsers = ({ open, onClose, companyId }) => {
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  const loadUsers = async () => {
    if (!companyId || !user) return;

    setLoading(true);
    try {
      const { data } = await api.get(`/companies/${companyId}/users`);
      setUsers(data.users || []);
    } catch (error) {
      toast.error('Erro ao carregar usuários');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      loadUsers();
    }
  }, [open, companyId]);

  const formik = useFormik({
    initialValues: {
      name: '',
      email: '',
      profile: 'user',
      password: '',
      super: false,
      isNew: true
    },
    validationSchema,
    onSubmit: async (values, { resetForm, setSubmitting }) => {
      try {
        if (selectedUser) {
          await api.put(`/users/${selectedUser.id}`, {
            ...values,
            companyId
          });
          toast.success('Usuário atualizado com sucesso');
        } else {
          await api.post('/users/fromCompany', {
            ...values,
            companyId
          });
          toast.success('Usuário criado com sucesso');
        }
        resetForm();
        setShowForm(false);
        loadUsers();
      } catch (error) {
        console.error('Erro ao salvar usuário:', error);
        toast.error(error.response?.data?.error || 'Erro ao salvar usuário');
      } finally {
        setSubmitting(false);
      }
    }
  });

  const handleEdit = (user) => {
    setSelectedUser(user);
    formik.setValues({
      name: user.name,
      email: user.email,
      profile: user.profile,
      super: user.super,
      isNew: false,
      password: ''
    });
    setShowForm(true);
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/users/${userToDelete.id}`);
      toast.success('Usuário excluído com sucesso');
      loadUsers();
    } catch (error) {
      toast.error('Erro ao excluir usuário');
      console.error(error);
    } finally {
      setShowConfirmDelete(false);
      setUserToDelete(null);
    }
  };

  const columns = [
    {
      field: 'name',
      headerName: 'Nome',
      flex: 1,
      renderCell: (params) => (
        <CellContent>
          {params.row.profile === 'admin' ? (
            <AdminIcon fontSize="small" color="primary" style={{ marginRight: '8px' }} />
          ) : (
            <UserIcon fontSize="small" style={{ marginRight: '8px' }} />
          )}
          {params.value}
        </CellContent>
      )
    },
    {
      field: 'email',
      headerName: 'Email',
      flex: 1,
      renderCell: (params) => (
        <CellContent>
          {params.value}
        </CellContent>
      )
    },
    {
      field: 'profile',
      headerName: 'Perfil',
      width: 150,
      renderCell: (params) => (
        <Chip
          label={params.value === 'admin' ? 'Administrador' : 'Usuário'}
          color={params.value === 'admin' ? 'primary' : 'default'}
          size="small"
        />
      )
    },
    {
      field: 'actions',
      headerName: 'Ações',
      width: 120,
      sortable: false,
      renderCell: (params) => (
        <CellContent>
          <Box display="flex" gap={1}>
            <IconButton
              size="small"
              onClick={() => handleEdit(params.row)}
            >
              <EditIcon />
            </IconButton>
            <IconButton
              size="small"
              onClick={() => {
                setUserToDelete(params.row);
                setShowConfirmDelete(true);
              }}
            >
              <DeleteIcon />
            </IconButton>
          </Box>
        </CellContent>
      )
    }
  ];

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Usuários da Empresa</Typography>
            <Box>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => {
                  setSelectedUser(null);
                  formik.resetForm();
                  setShowForm(true);
                }}
              >
                Novo Usuário
              </Button>
              <IconButton
                onClick={onClose}
                size="small"
                sx={{ ml: 2 }}
              >
                <CloseIcon />
              </IconButton>
            </Box>
          </Box>
        </DialogTitle>

        <DialogContent>
          <DataGrid
            rows={users}
            columns={columns}
            loading={loading}
            autoHeight
            disableSelectionOnClick
            pageSize={5}
            rowsPerPageOptions={[5]}
            getRowId={(row) => row.id}
          />
        </DialogContent>
      </Dialog>

      <Dialog
        open={showForm}
        onClose={() => setShowForm(false)}
        maxWidth="sm"
        fullWidth
      >
        <form onSubmit={formik.handleSubmit}>
          <DialogTitle>
            {selectedUser ? 'Editar Usuário' : 'Novo Usuário'}
          </DialogTitle>

          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  name="name"
                  label="Nome"
                  value={formik.values.name}
                  onChange={formik.handleChange}
                  error={formik.touched.name && Boolean(formik.errors.name)}
                  helperText={formik.touched.name && formik.errors.name}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  name="email"
                  label="Email"
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  error={formik.touched.email && Boolean(formik.errors.email)}
                  helperText={formik.touched.email && formik.errors.email}
                />
              </Grid>

              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Perfil</InputLabel>
                  <Select
                    name="profile"
                    value={formik.values.profile}
                    onChange={formik.handleChange}
                  >
                    <MenuItem value="user">Usuário</MenuItem>
                    <MenuItem value="admin">Administrador</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  name="password"
                  label="Senha"
                  type="password"
                  value={formik.values.password}
                  onChange={formik.handleChange}
                  error={formik.touched.password && Boolean(formik.errors.password)}
                  helperText={formik.touched.password && formik.errors.password}
                />
              </Grid>

              {companyId === 1 && (
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        name="super"
                        checked={formik.values.super}
                        onChange={formik.handleChange}
                      />
                    }
                    label="Super Usuário"
                  />
                </Grid>
              )}
            </Grid>
          </DialogContent>

          <Box sx={{ p: 2, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
            <Button onClick={() => setShowForm(false)}>
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={formik.isSubmitting}
            >
              {formik.isSubmitting ? (
                <CircularProgress size={24} />
              ) : selectedUser ? (
                'Atualizar'
              ) : (
                'Criar'
              )}
            </Button>
          </Box>
        </form>
      </Dialog>

      <ConfirmationModal
        open={showConfirmDelete}
        onClose={() => setShowConfirmDelete(false)}
        onConfirm={handleDelete}
        title="Excluir Usuário"
      >
        Tem certeza que deseja excluir este usuário? Esta ação não poderá ser desfeita.
      </ConfirmationModal>
    </>
  );
};

export default CompanyUsers;