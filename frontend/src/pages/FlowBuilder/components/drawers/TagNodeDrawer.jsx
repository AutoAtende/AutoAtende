import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  FormControl,
  FormLabel,
  Chip,
  Button,
  FormControlLabel,
  Radio,
  RadioGroup,
  Divider,
  Alert,
  CircularProgress,
  Paper
} from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';
import {
  LocalOffer as LocalOfferIcon,
  Add as AddIcon,
  Code as CodeIcon
} from '@mui/icons-material';
import { i18n } from '../../../../translate/i18n';
import api from '../../../../services/api';

const TagNodeDrawer = ({ nodeData, onChange, flowVariables }) => {
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Garante que as tags sempre são inicializadas como arrays vazios se não forem válidas
  const initialTags = Array.isArray(nodeData?.tags) ?
    nodeData.tags.map(tag => ({ ...tag, id: tag.id || `temp-${Math.random().toString(36).substr(2, 9)}` })) :
    [];

  const [selectedTags, setSelectedTags] = useState(initialTags);
  const [selectionMode, setSelectionMode] = useState(nodeData?.selectionMode || 'multiple');
  const [operation, setOperation] = useState(nodeData?.operation || 'add');
  const [searchQuery, setSearchQuery] = useState('');

  // Carrega as tags da API quando o componente é montado
  useEffect(() => {
    loadTags();
  }, []);

  // Atualiza o estado local quando nodeData muda externamente
  useEffect(() => {
    if (nodeData) {
      // Garante que as tags sempre são arrays e que cada tag tem um ID válido
      if (Array.isArray(nodeData.tags)) {
        const validTags = nodeData.tags.map(tag => ({
          ...tag,
          id: tag.id || `temp-${Math.random().toString(36).substr(2, 9)}`
        }));
        setSelectedTags(validTags);
      }

      if (nodeData.selectionMode) {
        setSelectionMode(nodeData.selectionMode);
      }

      if (nodeData.operation) {
        setOperation(nodeData.operation);
      }
    }
  }, [nodeData]);

  const loadTags = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get('/tags');

      // Garante que cada tag tem um ID válido
      const tagsData = Array.isArray(response.data?.tags) ?
        response.data.tags.map(tag => ({
          ...tag,
          id: tag.id || `temp-${Math.random().toString(36).substr(2, 9)}`
        })) :
        [];

      setTags(tagsData);
      console.log('Tags carregadas:', tagsData);
    } catch (err) {
      console.error("Erro ao carregar tags:", err);
      const errorMessage = err?.response?.data?.message || 'Erro ao carregar tags';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Função para tratar a mudança de tags selecionadas
  const handleTagChange = (event, newValue) => {
    console.log('handleTagChange - newValue:', newValue);

    let validNewValue = [];

    if (selectionMode === 'single') {
      // Para modo single, garantir que newValue seja um array com um único item
      if (newValue) {
        validNewValue = [{
          ...newValue,
          id: newValue.id || `temp-${Math.random().toString(36).substr(2, 9)}`
        }];
      }
    } else {
      // Para modo multiple, garantir que newValue seja sempre um array válido
      validNewValue = Array.isArray(newValue) ?
        newValue.map(tag => ({
          ...tag,
          id: tag.id || `temp-${Math.random().toString(36).substr(2, 9)}`
        })) : [];
    }

    setSelectedTags(validNewValue);

    // Atualizar o nodeData com as tags selecionadas
    if (onChange) {
      console.log('Atualizando nodeData com tags:', validNewValue);
      onChange({
        ...nodeData,
        tags: validNewValue
      });
    }
  };

  const handleModeChange = (event) => {
    const mode = event.target.value;
    setSelectionMode(mode);

    // Se mudar para único e tiver múltiplas tags selecionadas, manter apenas a primeira
    let updatedTags = selectedTags;
    if (mode === 'single' && selectedTags.length > 1) {
      updatedTags = [selectedTags[0]];
      setSelectedTags(updatedTags);
    }

    if (onChange) {
      onChange({
        ...nodeData,
        selectionMode: mode,
        tags: updatedTags
      });
    }
  };

  const handleOperationChange = (event) => {
    const newOperation = event.target.value;
    setOperation(newOperation);

    if (onChange) {
      onChange({
        ...nodeData,
        operation: newOperation
      });
    }
  };

  const handleCreateTag = async () => {
    if (!searchQuery.trim()) return;

    try {
      setLoading(true);
      setError(null);

      const response = await api.post('/tags', {
        name: searchQuery.trim()
      });

      // Garante que a nova tag tem um ID
      const newTag = response.data ? {
        ...response.data,
        id: response.data.id || `temp-${Math.random().toString(36).substr(2, 9)}`
      } : null;

      if (!newTag) {
        throw new Error('A tag criada não retornou dados válidos');
      }

      console.log('Nova tag criada:', newTag);
      setTags(prevTags => [...prevTags, newTag]);

      // Adicionar a nova tag às selecionadas
      let updatedTags;
      if (selectionMode === 'single') {
        updatedTags = [newTag];
      } else {
        updatedTags = [...selectedTags, newTag];
      }

      setSelectedTags(updatedTags);

      if (onChange) {
        onChange({
          ...nodeData,
          tags: updatedTags
        });
      }

      // Limpar a busca
      setSearchQuery('');
    } catch (err) {
      console.error("Erro ao criar tag:", err);
      const errorMessage = err?.response?.data?.message || 'Erro ao criar tag';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      <TextField
        fullWidth
        label={i18n.t('flowBuilder.properties.label')}
        value={nodeData?.label || ''}
        onChange={(e) => onChange({ ...nodeData, label: e.target.value })}
        margin="normal"
        InputLabelProps={{
          shrink: true,
        }}
      />

      <Box sx={{ mt: 3 }}>
        <FormControl fullWidth component="fieldset" sx={{ mb: 2 }}>
          <FormLabel component="legend">
            {i18n.t('flowBuilder.nodes.tag.operation')}
          </FormLabel>
          <RadioGroup
            row
            name="operation"
            value={operation}
            onChange={handleOperationChange}
          >
            <FormControlLabel
              value="add"
              control={<Radio />}
              label={i18n.t('flowBuilder.nodes.tag.addOperation')}
            />
            <FormControlLabel
              value="remove"
              control={<Radio />}
              label={i18n.t('flowBuilder.nodes.tag.removeOperation')}
            />
          </RadioGroup>
        </FormControl>

        <FormControl fullWidth component="fieldset" sx={{ mb: 3 }}>
          <FormLabel component="legend">
            {i18n.t('flowBuilder.nodes.tag.selectionMode')}
          </FormLabel>
          <RadioGroup
            row
            name="selectionMode"
            value={selectionMode}
            onChange={handleModeChange}
          >
            <FormControlLabel
              value="single"
              control={<Radio />}
              label={i18n.t('flowBuilder.nodes.tag.singleMode')}
            />
            <FormControlLabel
              value="multiple"
              control={<Radio />}
              label={i18n.t('flowBuilder.nodes.tag.multipleMode')}
            />
          </RadioGroup>
        </FormControl>

        <Typography variant="subtitle2" gutterBottom>
          {i18n.t('flowBuilder.nodes.tag.selectTags')}
        </Typography>

        {/* Versão simplificada do Autocomplete para evitar o erro .some */}
        <Autocomplete
          multiple={selectionMode === 'multiple'}
          disableCloseOnSelect={selectionMode === 'multiple'}
          value={selectionMode === 'single' ? (selectedTags[0] || null) : selectedTags}
          onChange={handleTagChange}
          options={tags}
          getOptionLabel={(option) => option?.name || ''}
          isOptionEqualToValue={(option, value) => option.id === value.id}
          renderInput={(params) => (
            <TextField
              {...params}
              label={i18n.t('flowBuilder.nodes.tag.searchTags')}
              placeholder={selectionMode === 'multiple'
                ? i18n.t('flowBuilder.nodes.tag.selectMultiple')
                : i18n.t('flowBuilder.nodes.tag.selectOne')}
              fullWidth
              variant="outlined"
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                ...params.InputProps,
                endAdornment: (
                  <>
                    {loading ? <CircularProgress color="inherit" size={20} /> : null}
                    {params.InputProps.endAdornment}
                  </>
                ),
              }}
              InputLabelProps={{
                shrink: true,
              }}
            />
          )}
          renderOption={(props, option) => (
            <li {...props} key={option.id}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LocalOfferIcon fontSize="small" />
                <Typography variant="body2">{option.name}</Typography>
              </Box>
            </li>
          )}
          noOptionsText={
            searchQuery ? (
              <Box sx={{ p: 1 }}>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  {i18n.t('flowBuilder.nodes.tag.noResults')}
                </Typography>
                <Button
                  size="small"
                  startIcon={<AddIcon />}
                  variant="outlined"
                  onClick={handleCreateTag}
                  fullWidth
                >
                  {i18n.t('flowBuilder.nodes.tag.createTag')} "{searchQuery}"
                </Button>
              </Box>
            ) : (
              i18n.t('flowBuilder.nodes.tag.noTags')
            )
          }
        />

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
      </Box>

      <Divider sx={{ my: 3 }} />

      <Box sx={{ mt: 2 }}>
        <Typography variant="subtitle2" gutterBottom>
          {i18n.t('flowBuilder.nodes.tag.preview')}
        </Typography>

        <Paper
          variant="outlined"
          sx={{
            p: 2,
            borderRadius: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: 1
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <LocalOfferIcon
              fontSize="small"
              color={operation === 'add' ? 'success' : 'error'}
            />
            <Typography variant="body2">
              {operation === 'add'
                ? i18n.t('flowBuilder.nodes.tag.willAdd')
                : i18n.t('flowBuilder.nodes.tag.willRemove')}
            </Typography>
          </Box>

          {selectedTags && selectedTags.length > 0 ? (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {selectedTags.map(tag => (
                <Chip
                  key={tag.id}
                  label={tag.name}
                  size="small"
                  icon={<LocalOfferIcon fontSize="small" />}
                  color={operation === 'add' ? 'success' : 'error'}
                  variant="outlined"
                />
              ))}
            </Box>
          ) : (
            <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
              {i18n.t('flowBuilder.nodes.tag.noTagsSelected')}
            </Typography>
          )}
        </Paper>
      </Box>

      <Box sx={{ mt: 3, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
        <Typography variant="caption" color="text.secondary">
          {i18n.t('flowBuilder.nodes.tag.helpText')}
        </Typography>
      </Box>
    </Box>
  );
};

export default TagNodeDrawer;