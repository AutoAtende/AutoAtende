import React, { useState } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  TextField, 
  Stepper, 
  Step, 
  StepLabel, 
  List, 
  ListItem, 
  ListItemText, 
  Checkbox,
  Typography, 
  Box, 
  CircularProgress, 
  Tooltip,
  IconButton,
  InputAdornment
} from '@mui/material';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { useSpring, animated } from 'react-spring';
import { Info as InfoIcon } from '@mui/icons-material';
import api from '../../../services/api';
import { toast } from '../../../helpers/toast';

const steps = ['Inserir Chave da API', 'Selecionar Agentes', 'Resultado da Importação'];

const AnimatedListItem = animated(ListItem);

const ImportAssistantsModal = ({ open, onClose, onImportComplete }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [openAIAssistants, setOpenAIAssistants] = useState([]);
  const [selectedAssistants, setSelectedAssistants] = useState([]);
  const [importResults, setImportResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [apiKey, setApiKey] = useState('');

  // Animação para os itens da lista
  const listItemAnimation = useSpring({
    from: { opacity: 0, transform: 'translateY(20px)' },
    to: { opacity: 1, transform: 'translateY(0px)' },
    config: { tension: 300, friction: 20 }
  });

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleReset = () => {
    setActiveStep(0);
    setOpenAIAssistants([]);
    setSelectedAssistants([]);
    setImportResults([]);
    setApiKey('');
  };

  const handleFetchAssistants = async (values, { setSubmitting }) => {
    setLoading(true);
    try {
      const response = await api.post('/assistants/fetch-openai', { apiKey: values.apiKey });
      
      if (response.data && Array.isArray(response.data)) {
        setOpenAIAssistants(response.data);
        setApiKey(values.apiKey); // Salvar a chave API para uso posterior
        toast.success(`${response.data.length} assistentes encontrados`);
        handleNext();
      } else {
        toast.warn('Nenhum assistente encontrado para esta chave API');
      }
    } catch (error) {
      console.error('Erro ao buscar assistentes:', error);
      toast.error(error.response?.data?.message || 'Erro ao buscar assistentes da OpenAI');
    } finally {
      setLoading(false);
      setSubmitting(false);
    }
  };

  const handleImportAssistants = async () => {
    setLoading(true);
    try {
      const response = await api.post('/assistants/import', {
        assistantIds: selectedAssistants,
        apiKey: apiKey
      });
      
      if (response.data && Array.isArray(response.data)) {
        setImportResults(response.data);
        toast.success(`${response.data.length} assistentes importados com sucesso`);
      } else {
        toast.warn('Nenhum assistente foi importado');
      }
      handleNext();
      onImportComplete();
    } catch (error) {
      console.error('Erro na importação:', error);
      toast.error(error.response?.data?.message || 'Erro ao importar assistentes');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Formik
            initialValues={{ apiKey: '' }}
            validationSchema={Yup.object().shape({
              apiKey: Yup.string().required('Chave da API é obrigatória'),
            })}
            onSubmit={handleFetchAssistants}
          >
            {({ errors, touched, isSubmitting }) => (
              <Form>
                <Box sx={{ mb: 3 }}>
                  <Field
                    as={TextField}
                    name="apiKey"
                    label="Chave da API OpenAI"
                    fullWidth
                    margin="normal"
                    error={touched.apiKey && errors.apiKey}
                    helperText={touched.apiKey && errors.apiKey}
                    disabled={loading}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <Tooltip title="Insira sua chave da API OpenAI para buscar seus assistentes">
                            <InfoIcon color="primary" />
                          </Tooltip>
                        </InputAdornment>
                      ),
                    }}
                  />
                  <Typography variant="caption" color="textSecondary" display="block" mt={1}>
                    A chave API será usada apenas para importar seus assistentes e não será compartilhada
                  </Typography>
                </Box>
                <Button 
                  type="submit" 
                  variant="contained" 
                  color="primary"
                  disabled={loading || isSubmitting}
                  startIcon={loading ? <CircularProgress size={20} /> : null}
                >
                  {loading ? 'Buscando...' : 'Buscar Agentes'}
                </Button>
              </Form>
            )}
          </Formik>
        );

      case 1:
        return openAIAssistants.length > 0 ? (
          <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Selecione os assistentes para importar
            </Typography>
            
            <Box sx={{ flexGrow: 1, overflow: 'auto', maxHeight: '400px', mb: 2 }}>
              <List>
                {openAIAssistants.map((assistant, index) => (
                  <AnimatedListItem
                    key={assistant.id}
                    style={{
                      ...listItemAnimation,
                      delay: index * 50,
                    }}
                    sx={{
                      borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
                      '&:hover': {
                        backgroundColor: 'rgba(0, 0, 0, 0.04)',
                      },
                    }}
                  >
                    <Checkbox
                      edge="start"
                      checked={selectedAssistants.includes(assistant.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedAssistants([...selectedAssistants, assistant.id]);
                        } else {
                          setSelectedAssistants(selectedAssistants.filter(id => id !== assistant.id));
                        }
                      }}
                    />
                    <ListItemText 
                      primary={assistant.name} 
                      secondary={
                        <Typography variant="body2" color="textSecondary">
                          Modelo: {assistant.model}
                        </Typography>
                      }
                    />
                  </AnimatedListItem>
                ))}
              </List>
            </Box>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
              <Typography variant="body2">
                {selectedAssistants.length} assistente(s) selecionado(s)
              </Typography>
              <Button 
                onClick={handleImportAssistants} 
                variant="contained" 
                color="primary" 
                disabled={selectedAssistants.length === 0 || loading}
                startIcon={loading ? <CircularProgress size={20} /> : null}
              >
                {loading ? 'Importando...' : 'Importar Selecionados'}
              </Button>
            </Box>
          </Box>
        ) : (
          <Box sx={{ textAlign: 'center', py: 3 }}>
            <Typography variant="h6" color="error" gutterBottom>
              Nenhum assistente encontrado
            </Typography>
            <Button 
              onClick={handleReset}
              variant="contained" 
              color="primary"
              sx={{ mt: 2 }}
            >
              Tentar Novamente
            </Button>
          </Box>
        );

      case 2:
        return importResults.length > 0 ? (
          <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Agentes importados com sucesso
            </Typography>
            
            <Box sx={{ flexGrow: 1, overflow: 'auto', maxHeight: '400px', mb: 2 }}>
              <List>
                {importResults.map((result, index) => (
                  <AnimatedListItem
                    key={result.id}
                    style={{
                      ...listItemAnimation,
                      delay: index * 50,
                    }}
                    sx={{
                      borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
                    }}
                  >
                    <ListItemText 
                      primary={result.name} 
                      secondary={`ID: ${result.id}`}
                    />
                  </AnimatedListItem>
                ))}
              </List>
            </Box>
            
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
              <Typography variant="body2" color="success.main">
                {importResults.length} assistente(s) importado(s) com sucesso
              </Typography>
            </Box>
          </Box>
        ) : (
          <Box sx={{ textAlign: 'center', py: 3 }}>
            <Typography variant="h6" color="error" gutterBottom>
              Nenhum assistente foi importado
            </Typography>
            <Button 
              onClick={handleReset}
              variant="contained" 
              color="primary"
              sx={{ mt: 2 }}
            >
              Tentar Novamente
            </Button>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose} 
      fullWidth 
      maxWidth="md"
      PaperProps={{
        sx: {
          height: 'auto',
          maxHeight: '80vh',
          display: 'flex',
          flexDirection: 'column',
        }
      }}
    >
      <DialogTitle sx={{ borderBottom: '1px solid rgba(0, 0, 0, 0.12)', padding: 2 }}>
        <Typography variant="h5" component="div">
          Importar Agentes da OpenAI
        </Typography>
      </DialogTitle>
      
      <Box sx={{ p: 2, borderBottom: '1px solid rgba(0, 0, 0, 0.12)' }}>
        <Stepper activeStep={activeStep} alternativeLabel>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Box>
      
      <DialogContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Box sx={{ flexGrow: 1, overflow: 'auto', py: 1 }}>
          {renderStepContent()}
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ borderTop: '1px solid rgba(0, 0, 0, 0.12)', p: 2 }}>
        <Button onClick={handleClose} color="secondary">
          Fechar
        </Button>
        {activeStep > 0 && activeStep < steps.length - 1 && (
          <Button onClick={handleBack} disabled={loading} variant="outlined">
            Voltar
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default ImportAssistantsModal;