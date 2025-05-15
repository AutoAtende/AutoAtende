import React, { useState, useCallback } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  List,
  ListItem,
  Switch,
  FormControlLabel,
  Divider,
  Alert,
  Popover
} from '@mui/material';
import { 
  Add as AddIcon,
  Delete as DeleteIcon,
  DragIndicator as DragIndicatorIcon,
  Code as CodeIcon,
  InsertEmoticon
} from '@mui/icons-material';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import EmojiPicker from 'emoji-picker-react';
import { i18n } from '../../../translate/i18n';
import { VariablesReferencePanel } from './VariablesReferencePanel';

// Componente memoizado para melhor performance
const MemoizedEmojiPicker = React.memo(EmojiPicker);

// Função para conversão de números para algarismos romanos
const toRoman = (num) => {
  const romanNumerals = [
    { value: 1000, symbol: 'M' },
    { value: 900, symbol: 'CM' },
    { value: 500, symbol: 'D' },
    { value: 400, symbol: 'CD' },
    { value: 100, symbol: 'C' },
    { value: 90, symbol: 'XC' },
    { value: 50, symbol: 'L' },
    { value: 40, symbol: 'XL' },
    { value: 10, symbol: 'X' },
    { value: 9, symbol: 'IX' },
    { value: 5, symbol: 'V' },
    { value: 4, symbol: 'IV' },
    { value: 1, symbol: 'I' },
  ];
  
  let result = '';
  for (const { value, symbol } of romanNumerals) {
    while (num >= value) {
      result += symbol;
      num -= value;
    }
  }
  return result;
};

const MenuNodeDrawer = ({ nodeData, onChange }) => {
  const [newOption, setNewOption] = useState('');
  const [validationErrors, setValidationErrors] = useState({});
  const [numberingFormat, setNumberingFormat] = useState('numbers');
  const [emojiAnchor, setEmojiAnchor] = useState(null);
  const [editingOptionId, setEditingOptionId] = useState(null);

  const validateData = () => {
    let errors = {};
    
    if (!nodeData.menuTitle?.trim()) {
      errors.menuTitle = "O título do menu é obrigatório";
    }
    
    if (!nodeData.menuOptions?.length) {
      errors.menuOptions = "É necessário adicionar pelo menos uma opção ao menu";
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const generateNumberingPrefix = useCallback((index) => {
    switch(numberingFormat) {
      case 'numbers':
        return `${index + 1}. `;
      case 'uppercase-letters':
        return `${String.fromCharCode(65 + index)}. `;
      case 'lowercase-letters':
        return `${String.fromCharCode(97 + index)}. `;
      case 'roman-uppercase':
        return `${toRoman(index + 1)}. `;
      case 'roman-lowercase':
        return `${toRoman(index + 1).toLowerCase()}. `;
      default:
        return '';
    }
  }, [numberingFormat]);

  const handleAddOption = () => {
    if (!newOption.trim()) return;
    
    const newOptionObj = {
      id: Date.now(),
      text: newOption,
      value: newOption
    };

    onChange({
      ...nodeData,
      menuOptions: [...(nodeData.menuOptions || []), newOptionObj]
    });
    
    setNewOption('');
    setValidationErrors(prev => ({ ...prev, menuOptions: undefined }));
  };

  const handleNumberingFormatChange = (format) => {
    setNumberingFormat(format);
    const updatedOptions = (nodeData.menuOptions || []).map((option, index) => ({
      ...option,
      text: option.text.replace(/^[\dA-Za-z]+\.\s*/, '')
                      .replace(/^[\u2190-\u21FF]+\s*/, '')
                      .trim()
    }));
    
    onChange({
      ...nodeData,
      menuOptions: updatedOptions.map((option, index) => ({
        ...option,
        text: `${generateNumberingPrefix(index)}${option.text}`
      }))
    });
  };

  const handleEmojiClick = useCallback((event, optionId) => {
    setEmojiAnchor(event.currentTarget);
    setEditingOptionId(optionId);
  }, []);

  const handleEmojiSelect = useCallback((emojiData) => {
    const updatedOptions = nodeData.menuOptions.map(option => 
      option.id === editingOptionId 
        ? { ...option, text: `${emojiData.emoji} ${option.text}` } 
        : option
    );
    
    onChange({ ...nodeData, menuOptions: updatedOptions });
    setEmojiAnchor(null);
    setEditingOptionId(null);
  }, [editingOptionId, nodeData, onChange]);

  const handleDragEnd = useCallback((result) => {
    if (!result.destination) return;
    
    const reorderedOptions = Array.from(nodeData.menuOptions || []);
    const [removed] = reorderedOptions.splice(result.source.index, 1);
    reorderedOptions.splice(result.destination.index, 0, removed);
    
    onChange({ ...nodeData, menuOptions: reorderedOptions });
  }, [nodeData, onChange]);

  return (
    <Box sx={{ p: 2, maxWidth: 600, margin: '0 auto' }}>
      <TextField
        fullWidth
        label="Nome do Nó"
        value={nodeData.label || ''}
        onChange={(e) => onChange({ ...nodeData, label: e.target.value })}
        margin="normal"
        variant="outlined"
        InputLabelProps={{
          shrink: true,
      }}
      />

      <TextField
        fullWidth
        label="Título do Menu"
        value={nodeData.menuTitle || ''}
        onChange={(e) => {
          const value = e.target.value;
          onChange({ ...nodeData, menuTitle: value });
          setValidationErrors(prev => ({ ...prev, menuTitle: undefined }));
        }}
        error={!!validationErrors.menuTitle}
        helperText={validationErrors.menuTitle}
        margin="normal"
        multiline
        rows={2}
        variant="outlined"
        InputLabelProps={{
          shrink: true,
      }}
      />

      <Box sx={{ mt: 2, mb: 3 }}>
        <FormControlLabel
          control={
            <Switch
              checked={nodeData.useEmoji || false}
              onChange={(e) => onChange({ ...nodeData, useEmoji: e.target.checked })}
              color="primary"
            />
          }
          label="Habilitar Emojis nas Opções"
        />
        
        <VariablesReferencePanel>
          <Button 
            variant="outlined" 
            size="small" 
            startIcon={<CodeIcon />}
            sx={{ ml: 2 }}
          >
            Inserir Variável
          </Button>
        </VariablesReferencePanel>
      </Box>

      <Divider sx={{ my: 2 }} />

      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" gutterBottom>
          Opções do Menu
        </Typography>

        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <TextField
            fullWidth
            variant="outlined"
            size="small"
            placeholder="Nova opção..."
            value={newOption}
            onChange={(e) => setNewOption(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddOption()}
            error={!!validationErrors.menuOptions}
            helperText={validationErrors.menuOptions}
            InputLabelProps={{
              shrink: true,
          }}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleAddOption}
            disabled={!newOption.trim()}
            sx={{ minWidth: 100 }}
          >
            Adicionar
          </Button>
        </Box>

        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel>Formato de Numeração</InputLabel>
            <Select
              value={numberingFormat}
              onChange={(e) => handleNumberingFormatChange(e.target.value)}
              label="Formato de Numeração"
              InputLabelProps={{
                shrink: true,
            }}
            >
              <MenuItem value="numbers">Números (1, 2, 3)</MenuItem>
              <MenuItem value="uppercase-letters">Letras Maiúsculas (A, B, C)</MenuItem>
              <MenuItem value="lowercase-letters">Letras Minúsculas (a, b, c)</MenuItem>
              <MenuItem value="roman-uppercase">Romanos Maiúsculos (I, II, III)</MenuItem>
              <MenuItem value="roman-lowercase">Romanos Minúsculos (i, ii, iii)</MenuItem>
            </Select>
          </FormControl>

          <Button
            variant="outlined"
            onClick={() => {
              const updatedOptions = (nodeData.menuOptions || []).map((option, index) => ({
                ...option,
                text: `${generateNumberingPrefix(index)}${option.text.replace(/^[\dA-Za-z]+\.\s*/, '')}`
              }));
              onChange({ ...nodeData, menuOptions: updatedOptions });
            }}
            disabled={!nodeData.menuOptions?.length}
          >
            Aplicar Numeração
          </Button>
        </Box>

        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="options">
            {(provided) => (
              <List
                {...provided.droppableProps}
                ref={provided.innerRef}
                sx={{ bgcolor: 'background.paper' }}
              >
                {nodeData.menuOptions?.map((option, index) => (
                  <Draggable key={option.id} draggableId={String(option.id)} index={index}>
                    {(provided) => (
                      <ListItem
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        sx={{ p: 0.5 }}
                      >
                        <Paper
                          variant="outlined"
                          sx={{
                            p: 1,
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1
                          }}
                        >
                          <Box {...provided.dragHandleProps} sx={{ cursor: 'grab' }}>
                            <DragIndicatorIcon color="action" />
                          </Box>

                          {nodeData.useEmoji && (
                            <IconButton
                              size="small"
                              onClick={(e) => handleEmojiClick(e, option.id)}
                            >
                              <InsertEmoticon fontSize="small" />
                            </IconButton>
                          )}

                          <TextField
                            fullWidth
                            variant="outlined"
                            size="small"
                            value={option.text}
                            onChange={(e) => {
                              const updatedOptions = nodeData.menuOptions.map(opt => 
                                opt.id === option.id 
                                  ? { ...opt, text: e.target.value, value: e.target.value } 
                                  : opt
                              );
                              onChange({ ...nodeData, menuOptions: updatedOptions });
                            }}
                          />

                          <IconButton
                            size="small"
                            onClick={() => {
                              const updatedOptions = nodeData.menuOptions.filter(
                                opt => opt.id !== option.id
                              );
                              onChange({ ...nodeData, menuOptions: updatedOptions });
                            }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Paper>
                      </ListItem>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </List>
            )}
          </Droppable>
        </DragDropContext>

        <Popover
          open={Boolean(emojiAnchor)}
          anchorEl={emojiAnchor}
          onClose={() => setEmojiAnchor(null)}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'left',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'left',
          }}
        >
          <MemoizedEmojiPicker
            onEmojiClick={handleEmojiSelect}
            searchDisabled={false}
            skinTonesDisabled
            previewConfig={{ showPreview: false }}
            categories={['smileys_people', 'animals_nature', 'food_drink']}
            width={300}
            height={400}
          />
        </Popover>
      </Box>

      {Object.keys(validationErrors).length > 0 && (
        <Alert severity="error" sx={{ mt: 2 }}>
          Verifique os campos obrigatórios antes de salvar
        </Alert>
      )}

      <Box sx={{ mt: 3, p: 2, bgcolor: 'background.default', borderRadius: 2 }}>
        <Typography variant="body2" color="textSecondary">
          Dica: Use a numeração automática para manter a consistência visual e o seletor de emojis
          para aumentar engajamento. Arraste as opções para reorganizar a ordem.
        </Typography>
      </Box>
    </Box>
  );
};

export default React.memo(MenuNodeDrawer);