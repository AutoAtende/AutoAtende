import React, { useState, useEffect, useContext } from 'react';
import { 
  TextField, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  FormControlLabel, 
  Switch, 
  Typography, 
  Grid, 
  Chip,
  Box,
  Tooltip,
  IconButton,
  InputAdornment,
  Autocomplete,
  CircularProgress,
  Button
} from '@mui/material';
import {
  Help as HelpIcon,
  InfoOutlined as InfoOutlinedIcon,
  Rule as RuleIcon,
  Cancel as CancelIcon,
  Save as SaveIcon
} from '@mui/icons-material';
import { makeStyles } from '@mui/styles';
import { useSpring, animated } from 'react-spring';
import { toast } from '../../../helpers/toast';
import { i18n } from '../../../translate/i18n';
import { AuthContext } from '../../../context/Auth/AuthContext';
import api from '../../../services/api';
import BaseModal from "../../../components/shared/BaseModal";

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  formControl: {
    width: '100%',
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
  },
  infoTooltip: {
    marginLeft: theme.spacing(1)
  },
  chips: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  chip: {
    margin: 2,
  },
  modalContent: {
    padding: theme.spacing(3, 2, 2),
    marginTop: theme.spacing(2)
  },
  modalTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1)
  },
  titleIcon: {
    color: theme.palette.primary.main
  },
  // Estilo para os botões no rodapé do modal
  actionButtons: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: theme.spacing(1),
    marginTop: theme.spacing(3),
    padding: theme.spacing(0, 2, 2)
  },
  cancelButton: {
    borderRadius: 8
  },
  saveButton: {
    borderRadius: 8,
    fontWeight: 'bold'
  },
  buttonProgress: {
    color: theme.palette.primary.main,
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -12,
    marginLeft: -12,
  },
  patternField: {
    "& .MuiOutlinedInput-root": {
      "&:hover fieldset": {
        borderColor: theme.palette.primary.main
      }
    }
  }
}));

const MessageRuleModal = ({ open, onClose, messageRule, onSave }) => {
  const classes = useStyles();
  const { user } = useContext(AuthContext);
  const { companyId } = user;

  const [formData, setFormData] = useState({
    name: '',
    pattern: '',
    description: '',
    isRegex: false,
    active: true,
    priority: 0,
    tags: '',
    userId: '',
    queueId: '',
    whatsappId: ''
  });

  const [queues, setQueues] = useState([]);
  const [whatsapps, setWhatsapps] = useState([]);
  const [users, setUsers] = useState([]);
  const [tags, setTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);

  // Animações
  const fadeIn = useSpring({
    from: { opacity: 0 },
    to: { opacity: 1 },
    config: { tension: 220, friction: 18 }
  });

  useEffect(() => {
    if (messageRule) {
      setFormData({
        name: messageRule.name || '',
        pattern: messageRule.pattern || '',
        description: messageRule.description || '',
        isRegex: messageRule.isRegex || false,
        active: messageRule.active === undefined ? true : messageRule.active,
        priority: messageRule.priority || 0,
        tags: messageRule.tags || '',
        userId: messageRule.userId || '',
        queueId: messageRule.queueId || '',
        whatsappId: messageRule.whatsappId || ''
      });

      if (messageRule.tags) {
        const tagsArray = messageRule.tags.split(',').map(id => parseInt(id.trim(), 10));
        setSelectedTags(tagsArray);
      } else {
        setSelectedTags([]);
      }
    } else {
      resetForm();
    }
  }, [messageRule, open]);

  useEffect(() => {
    const fetchData = async () => {
      if (open) {
        setLoadingData(true);
        try {
          // Rotas corrigidas com base nos controladores
          const [queuesRes, whatsappsRes, usersRes, tagsRes] = await Promise.all([
            api.get('/queue'),
            api.get('/whatsapp'),
            api.get('/users/list'),
            api.get('/tags/list')
          ]);
          
          setQueues(queuesRes.data);
          setWhatsapps(whatsappsRes.data);
          setUsers(usersRes.data || []);
          setTags(tagsRes.data);
        } catch (err) {
          console.error("Erro ao carregar dados:", err);
          toast.error("Erro ao carregar dados. Por favor, tente novamente.");
        } finally {
          setLoadingData(false);
        }
      }
    };
    
    fetchData();
  }, [open]);

  const resetForm = () => {
    setFormData({
      name: '',
      pattern: '',
      description: '',
      isRegex: false,
      active: true,
      priority: 0,
      tags: '',
      userId: '',
      queueId: '',
      whatsappId: ''
    });
    setSelectedTags([]);
    setErrors({});
  };

  const handleTagChange = (_, newValue) => {
    setSelectedTags(newValue);
    const tagsString = newValue.join(',');
    setFormData(prev => ({ ...prev, tags: tagsString }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Limpar erro específico quando o campo é preenchido
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleNumberInputChange = (e) => {
    const { name, value } = e.target;
    const numValue = parseInt(value, 10);
    
    if (!isNaN(numValue) || value === '') {
      setFormData(prev => ({ 
        ...prev, 
        [name]: value === '' ? 0 : Math.max(0, Math.min(100, numValue)) 
      }));
    }
  };

  const handleSwitchChange = (e) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = i18n.t('messageRules.form.errors.requiredName');
    }
    
    if (!formData.pattern.trim()) {
      newErrors.pattern = i18n.t('messageRules.form.errors.requiredPattern');
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      if (messageRule) {
        await api.put(`/message-rules/${messageRule.id}`, formData);
        toast.success(i18n.t('messageRules.toasts.updated'));
      } else {
        await api.post('/message-rules', formData);
        toast.success(i18n.t('messageRules.toasts.created'));
      }
      
      // Chamamos onSave para garantir que os dados sejam atualizados
      if (onSave) onSave();
      
      onClose();
    } catch (err) {
      console.error("Erro ao salvar regra:", err);
      toast.error("Erro ao salvar. Por favor, tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const getTagById = (id) => {
    return tags.find(tag => tag.id === id);
  };

  const modalTitle = messageRule
    ? i18n.t('messageRules.modal.editTitle')
    : i18n.t('messageRules.modal.addTitle');

  return (
    <BaseModal
      open={open}
      onClose={onClose}
      title={
        <div className={classes.modalTitle}>
          <RuleIcon className={classes.titleIcon} />
          <Typography variant="h6">{modalTitle}</Typography>
        </div>
      }
      maxWidth="md"
      loading={loadingData}
    >
      <animated.div style={fadeIn} className={classes.modalContent}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={8}>
            <TextField
              label={i18n.t('messageRules.form.name')}
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              error={!!errors.name}
              helperText={errors.name}
              variant="outlined"
              fullWidth
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <RuleIcon fontSize="small" color="primary" />
                  </InputAdornment>
                )
              }}
            />
          </Grid>
          
          <Grid item xs={12} md={4}>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.active}
                  onChange={handleSwitchChange}
                  name="active"
                  color="primary"
                />
              }
              label={i18n.t('messageRules.form.active')}
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              label={i18n.t('messageRules.form.pattern')}
              name="pattern"
              value={formData.pattern}
              onChange={handleInputChange}
              error={!!errors.pattern}
              helperText={errors.pattern}
              variant="outlined"
              fullWidth
              required
              className={classes.patternField}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <Tooltip title={i18n.t('messageRules.form.patternHint')} arrow>
                      <IconButton size="small" className={classes.infoTooltip} edge="end">
                        <HelpIcon fontSize="small" color="primary" />
                      </IconButton>
                    </Tooltip>
                  </InputAdornment>
                )
              }}
            />
          </Grid>
          
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.isRegex}
                  onChange={handleSwitchChange}
                  name="isRegex"
                  color="primary"
                />
              }
              label={
                <Box display="flex" alignItems="center">
                  {i18n.t('messageRules.form.isRegex')}
                  <Tooltip title={i18n.t('messageRules.form.isRegexHint')} arrow>
                    <IconButton size="small" className={classes.infoTooltip}>
                      <InfoOutlinedIcon fontSize="small" color="primary" />
                    </IconButton>
                  </Tooltip>
                </Box>
              }
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              label={i18n.t('messageRules.form.description')}
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              variant="outlined"
              fullWidth
              multiline
              rows={2}
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <FormControl variant="outlined" fullWidth>
              <InputLabel>{i18n.t('messageRules.form.connection')}</InputLabel>
              <Select
                name="whatsappId"
                value={formData.whatsappId}
                onChange={handleInputChange}
                label={i18n.t('messageRules.form.connection')}
              >
                <MenuItem value="">
                  {i18n.t('messageRules.form.allConnections')}
                </MenuItem>
                {whatsapps.map((whatsapp) => (
                  <MenuItem key={whatsapp.id} value={whatsapp.id}>
                    {whatsapp.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <FormControl variant="outlined" fullWidth>
              <InputLabel>{i18n.t('messageRules.form.queue')}</InputLabel>
              <Select
                name="queueId"
                value={formData.queueId}
                onChange={handleInputChange}
                label={i18n.t('messageRules.form.queue')}
              >
                <MenuItem value="">
                  {i18n.t('messageRules.form.noQueue')}
                </MenuItem>
                {queues.map((queue) => (
                  <MenuItem key={queue.id} value={queue.id}>
                    {queue.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <FormControl variant="outlined" fullWidth>
              <InputLabel>{i18n.t('messageRules.form.user')}</InputLabel>
              <Select
                name="userId"
                value={formData.userId}
                onChange={handleInputChange}
                label={i18n.t('messageRules.form.user')}
              >
                <MenuItem value="">
                  {i18n.t('messageRules.form.noUser')}
                </MenuItem>
                {users.map((user) => (
                  <MenuItem key={user.id} value={user.id}>
                    {user.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              label={i18n.t('messageRules.form.priority')}
              name="priority"
              type="number"
              value={formData.priority}
              onChange={handleNumberInputChange}
              variant="outlined"
              fullWidth
              InputProps={{
                inputProps: { min: 0, max: 100 },
                endAdornment: (
                  <InputAdornment position="end">
                    <Tooltip title={i18n.t('messageRules.form.priorityHint')} arrow>
                      <IconButton size="small" className={classes.infoTooltip} edge="end">
                        <HelpIcon fontSize="small" color="primary" />
                      </IconButton>
                    </Tooltip>
                  </InputAdornment>
                )
              }}
            />
          </Grid>
          
          <Grid item xs={12}>
            <Autocomplete
              multiple
              id="tags"
              options={tags.map(tag => tag.id)}
              value={selectedTags}
              onChange={handleTagChange}
              getOptionLabel={(tagId) => {
                const tag = getTagById(tagId);
                return tag ? tag.name : '';
              }}
              renderTags={(value, getTagProps) =>
                value.map((tagId, index) => {
                  const tag = getTagById(tagId);
                  return (
                    <Chip
                      key={tagId}
                      label={tag ? tag.name : tagId}
                      {...getTagProps({ index })}
                      style={{ 
                        backgroundColor: tag?.color, 
                        margin: '2px',
                        color: '#FFF',
                        fontWeight: 'bold'
                      }}
                    />
                  );
                })
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  variant="outlined"
                  label={i18n.t('messageRules.form.tags')}
                  placeholder={i18n.t('messageRules.form.selectTags')}
                  fullWidth
                />
              )}
            />
          </Grid>
        </Grid>
        
        {/* Adicionando os botões diretamente no conteúdo do modal */}
        <div className={classes.actionButtons}>
          <Button
            variant="outlined"
            color="secondary"
            onClick={onClose}
            className={classes.cancelButton}
            startIcon={<CancelIcon />}
            disabled={loading}
          >
            {i18n.t('messageRules.buttons.cancel')}
          </Button>
          
          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmit}
            className={classes.saveButton}
            startIcon={loading ? <CircularProgress size={24} className={classes.buttonProgress} /> : <SaveIcon />}
            disabled={loading}
          >
            {i18n.t('messageRules.buttons.save')}
          </Button>
        </div>
      </animated.div>
    </BaseModal>
  );
};

export default MessageRuleModal;