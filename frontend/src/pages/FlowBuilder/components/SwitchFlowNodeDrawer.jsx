import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  FormControlLabel,
  Switch,
  Divider,
  Autocomplete,
  Alert,
  CircularProgress
} from '@mui/material';
import { i18n } from '../../../translate/i18n';
import api from '../../../services/api';

const SwitchFlowNodeDrawer = ({ nodeData, onChange, companyId, flowVariables }) => {
  const [flows, setFlows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedFlow, setSelectedFlow] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  
  useEffect(() => {
    // Carregar fluxos disponíveis
    const fetchFlows = async () => {
      // Verificar se há companyId
      if (!companyId) {
        setValidationErrors(prev => ({
          ...prev,
          general: "ID da empresa não fornecido"
        }));
        return;
      }

      try {
        setLoading(true);
        
        const response = await api.get('/flow-builder', {
          params: { companyId }
        });
        
        if (response.data && Array.isArray(response.data.flows)) {
          // Filtrar para não incluir o fluxo atual
          const availableFlows = response.data.flows.filter(
            flow => flow.id !== nodeData.currentFlowId
          );
          
          setFlows(availableFlows);
          
          // Se já houver um fluxo selecionado, encontrá-lo na lista
          if (nodeData.targetFlowId) {
            const flow = availableFlows.find(f => f.id === nodeData.targetFlowId);
            if (flow) {
              setSelectedFlow(flow);
            }
          }
        }
      } catch (error) {
        console.error("Erro ao carregar fluxos:", error);
        setValidationErrors(prev => ({
          ...prev,
          general: "Erro ao carregar lista de fluxos."
        }));
      } finally {
        setLoading(false);
      }
    };
    
    fetchFlows();
    // Removi validationErrors da lista de dependências para evitar loop
  }, [nodeData.targetFlowId, nodeData.currentFlowId, companyId]);
  
  const validateData = () => {
    let errors = {};
    
    if (!nodeData.targetFlowId) {
      errors.targetFlowId = "É necessário selecionar um fluxo de destino";
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const handleFlowChange = (event, newValue) => {
    setSelectedFlow(newValue);
    
    // Validação
    if (!newValue) {
      setValidationErrors(prev => ({
        ...prev,
        targetFlowId: "É necessário selecionar um fluxo de destino"
      }));
    } else {
      // Remover erro se existir
      setValidationErrors(prev => {
        const { targetFlowId, ...restErrors } = prev;
        return restErrors;
      });
    }
    
    onChange({
      ...nodeData,
      targetFlowId: newValue ? newValue.id : null,
      targetFlowName: newValue ? newValue.name : null
    });
  };
  
  const handleTransferVariablesToggle = (event) => {
    onChange({
      ...nodeData,
      transferVariables: event.target.checked
    });
  };
  
  // Para garantir a validação antes de salvar
  const isFormValid = () => {
    return validateData();
  };
  
  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Configuração de Troca de Fluxo
      </Typography>
      
      <TextField
        fullWidth
        label={i18n.t('flowBuilder.properties.label', 'Rótulo')}
        value={nodeData.label || ''}
        onChange={(e) => onChange({ ...nodeData, label: e.target.value })}
        margin="normal"
      />
      
      <Autocomplete
        fullWidth
        options={flows}
        loading={loading}
        value={selectedFlow}
        onChange={handleFlowChange}
        getOptionLabel={(option) => option.name}
        renderInput={(params) => (
          <TextField 
            {...params} 
            label="Selecione o Fluxo Destino" 
            margin="normal"
            variant="outlined"
            required
            error={!!validationErrors.targetFlowId}
            helperText={validationErrors.targetFlowId || ""}
            InputProps={{
              ...params.InputProps,
              endAdornment: (
                <>
                  {loading ? <CircularProgress color="inherit" size={20} /> : null}
                  {params.InputProps.endAdornment}
                </>
              ),
            }}
          />
        )}
        renderOption={(props, option) => (
          <Box component="li" {...props}>
            <Box>
              <Typography variant="body2">{option.name}</Typography>
              <Typography variant="caption" color="text.secondary">
                {option.description || 'Sem descrição'}
              </Typography>
            </Box>
          </Box>
        )}
        noOptionsText="Nenhum fluxo disponível"
      />
      
      <FormControlLabel
        control={
          <Switch
            checked={nodeData.transferVariables || false}
            onChange={handleTransferVariablesToggle}
            color="primary"
          />
        }
        label="Transferir variáveis para o novo fluxo"
        sx={{ mt: 2 }}
      />
      
      <Divider sx={{ my: 3 }} />
      
      {validationErrors.general && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {validationErrors.general}
        </Alert>
      )}
      
      <Box sx={{ mt: 3, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Importante:
        </Typography>
        <Typography variant="caption" color="text.secondary">
          O nó de troca de fluxo encerra o fluxo atual e inicia um novo fluxo.
          {nodeData.transferVariables 
            ? ' Todas as variáveis do fluxo atual serão transferidas para o novo.' 
            : ' As variáveis do fluxo atual NÃO serão transferidas para o novo.'}
        </Typography>
      </Box>
    </Box>
  );
};

export default SwitchFlowNodeDrawer;