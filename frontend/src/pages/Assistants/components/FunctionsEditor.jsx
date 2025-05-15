import React, { useState } from "react";
import {
  Box,
  Button,
  IconButton,
  Typography,
  TextField,
  Card,
  CardContent,
  CardActions,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
  Checkbox
} from "@mui/material";
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  ExpandMore as ExpandMoreIcon,
  Code as CodeIcon
} from "@mui/icons-material";
import { CodeEditor } from "./CodeEditor";
import { toast } from "../../../helpers/toast";

// Modelo padrão para uma nova função
const defaultFunction = {
  name: "",
  description: "",
  parameters: {
    type: "object",
    properties: {},
    required: []
  }
};

// Modelo padrão para um novo parâmetro
const defaultParameter = {
  name: "",
  description: "",
  type: "string",
  required: false
};

const FunctionsEditor = ({ functions, setFunctions, disabled = false }) => {
  const [open, setOpen] = useState(false);
  const [currentFunction, setCurrentFunction] = useState({ ...defaultFunction });
  const [editIndex, setEditIndex] = useState(null);
  const [jsonMode, setJsonMode] = useState(false);
  const [jsonValue, setJsonValue] = useState("");
  const [jsonError, setJsonError] = useState("");
  const [parameters, setParameters] = useState([]);
  
  // Abrir modal para adicionar nova função
  const handleAddFunction = () => {
    setCurrentFunction({ ...defaultFunction });
    setParameters([]);
    setEditIndex(null);
    setJsonMode(false);
    setJsonValue("");
    setJsonError("");
    setOpen(true);
  };
  
  // Abrir modal para editar função existente
  const handleEditFunction = (index) => {
    const func = functions[index];
    setCurrentFunction({ ...func });
    
    // Extrair parâmetros do objeto parameters
    const extractedParams = [];
    if (func.parameters && func.parameters.properties) {
      Object.entries(func.parameters.properties).forEach(([name, param]) => {
        extractedParams.push({
          name,
          description: param.description || "",
          type: param.type || "string",
          required: (func.parameters.required || []).includes(name)
        });
      });
    }
    
    setParameters(extractedParams);
    setEditIndex(index);
    setJsonMode(false);
    setJsonValue(JSON.stringify(func, null, 2));
    setJsonError("");
    setOpen(true);
  };
  
  // Remover função
  const handleDeleteFunction = (index) => {
    const newFunctions = [...functions];
    newFunctions.splice(index, 1);
    setFunctions(newFunctions);
    toast.success("Função removida com sucesso");
  };
  
  // Fechar modal
  const handleClose = () => {
    setOpen(false);
  };
  
  // Alternar entre modo visual e modo JSON
  const toggleJsonMode = () => {
    if (jsonMode) {
      // Voltando do modo JSON para o modo visual
      try {
        const parsed = JSON.parse(jsonValue);
        setCurrentFunction(parsed);
        
        // Extrair parâmetros
        const extractedParams = [];
        if (parsed.parameters && parsed.parameters.properties) {
          Object.entries(parsed.parameters.properties).forEach(([name, param]) => {
            extractedParams.push({
              name,
              description: param.description || "",
              type: param.type || "string",
              required: (parsed.parameters.required || []).includes(name)
            });
          });
        }
        
        setParameters(extractedParams);
        setJsonError("");
      } catch (error) {
        setJsonError("JSON inválido: " + error.message);
        return;
      }
    } else {
      // Indo do modo visual para o modo JSON
      const currentJson = {
        ...currentFunction,
        parameters: { 
          type: "object",
          properties: {},
          required: []
        }
      };
      
      // Construir objetos de propriedades a partir dos parâmetros
      parameters.forEach(param => {
        currentJson.parameters.properties[param.name] = {
          type: param.type,
          description: param.description
        };
        
        if (param.required) {
          currentJson.parameters.required.push(param.name);
        }
      });
      
      setJsonValue(JSON.stringify(currentJson, null, 2));
    }
    
    setJsonMode(!jsonMode);
  };
  
  // Adicionar parâmetro
  const handleAddParameter = () => {
    setParameters([...parameters, { ...defaultParameter }]);
  };
  
  // Atualizar parâmetro
  const handleParameterChange = (index, field, value) => {
    const newParameters = [...parameters];
    newParameters[index] = { ...newParameters[index], [field]: value };
    setParameters(newParameters);
  };
  
  // Remover parâmetro
  const handleDeleteParameter = (index) => {
    const newParameters = [...parameters];
    newParameters.splice(index, 1);
    setParameters(newParameters);
  };
  
  // Salvar função
  const handleSave = () => {
    if (jsonMode) {
      try {
        const func = JSON.parse(jsonValue);
        
        // Validação básica
        if (!func.name || !func.description || !func.parameters) {
          setJsonError("A função deve ter nome, descrição e parâmetros");
          return;
        }
        
        if (editIndex !== null) {
          const newFunctions = [...functions];
          newFunctions[editIndex] = func;
          setFunctions(newFunctions);
        } else {
          setFunctions([...functions, func]);
        }
        
        handleClose();
        toast.success("Função salva com sucesso");
      } catch (error) {
        setJsonError("JSON inválido: " + error.message);
      }
    } else {
      // Validação básica
      if (!currentFunction.name) {
        toast.error("O nome da função é obrigatório");
        return;
      }
      
      if (!currentFunction.description) {
        toast.error("A descrição da função é obrigatória");
        return;
      }
      
      // Construir objeto de função
      const func = {
        ...currentFunction,
        parameters: {
          type: "object",
          properties: {},
          required: []
        }
      };
      
      // Validar nomes de parâmetros
      const paramNames = parameters.map(p => p.name);
      if (new Set(paramNames).size !== paramNames.length) {
        toast.error("Nomes de parâmetros devem ser únicos");
        return;
      }
      
      // Adicionar parâmetros
      parameters.forEach(param => {
        if (!param.name) {
          toast.error("Todos os parâmetros devem ter um nome");
          return;
        }
        
        func.parameters.properties[param.name] = {
          type: param.type,
          description: param.description
        };
        
        if (param.required) {
          func.parameters.required.push(param.name);
        }
      });
      
      if (editIndex !== null) {
        const newFunctions = [...functions];
        newFunctions[editIndex] = func;
        setFunctions(newFunctions);
      } else {
        setFunctions([...functions, func]);
      }
      
      handleClose();
      toast.success("Função salva com sucesso");
    }
  };
  
  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">Funções Personalizadas</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleAddFunction}
          disabled={disabled}
        >
          Adicionar Função
        </Button>
      </Box>
      
      {/* Lista de funções */}
      {functions.length === 0 ? (
        <Typography color="textSecondary" align="center" sx={{ py: 4 }}>
          Nenhuma função personalizada definida
        </Typography>
      ) : (
        <Box>
          {functions.map((func, index) => (
            <Card key={index} variant="outlined" sx={{ mb: 2 }}>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                  <Box>
                    <Typography variant="h6">{func.name}</Typography>
                    <Typography variant="body2" color="textSecondary">
                      {func.description}
                    </Typography>
                  </Box>
                  <Box>
                    <Tooltip title="Editar função">
                      <IconButton 
                        onClick={() => handleEditFunction(index)}
                        disabled={disabled}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Remover função">
                      <IconButton 
                        onClick={() => handleDeleteFunction(index)}
                        color="secondary"
                        disabled={disabled}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>
                
                <Accordion sx={{ mt: 2 }}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography>
                      {Object.keys(func.parameters?.properties || {}).length} Parâmetros
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    {Object.entries(func.parameters?.properties || {}).map(([name, param]) => (
                      <Box key={name} p={1} mb={1} borderRadius={1} bgcolor="action.hover">
                        <Typography variant="subtitle2">
                          {name}
                          {func.parameters?.required?.includes(name) && 
                            <Typography component="span" color="error" variant="caption"> (obrigatório)</Typography>
                          }
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          {param.description || "Sem descrição"}
                        </Typography>
                        <Typography variant="caption">
                          Tipo: {param.type}
                        </Typography>
                      </Box>
                    ))}
                  </AccordionDetails>
                </Accordion>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}
      
      {/* Modal para adicionar/editar função */}
      <Dialog 
        open={open} 
        onClose={handleClose} 
        maxWidth="md" 
        fullWidth
      >
        <DialogTitle>
          {editIndex !== null ? "Editar Função" : "Nova Função"}
          <IconButton
            onClick={toggleJsonMode}
            color={jsonMode ? "primary" : "default"}
            sx={{ position: "absolute", right: 8, top: 8 }}
          >
            <CodeIcon />
          </IconButton>
        </DialogTitle>
        
        <DialogContent>
          {jsonMode ? (
            <Box mt={2}>
              <CodeEditor
                value={jsonValue}
                onChange={setJsonValue}
                language="json"
                height="400px"
              />
              {jsonError && (
                <Typography color="error" variant="body2" mt={1}>
                  {jsonError}
                </Typography>
              )}
            </Box>
          ) : (
            <Box>
              <Box mb={3}>
                <TextField
                  label="Nome da Função"
                  value={currentFunction.name}
                  onChange={(e) => setCurrentFunction({ ...currentFunction, name: e.target.value })}
                  fullWidth
                  margin="normal"
                  required
                  helperText="Nome da função a ser chamada pelo assistente"
                />
                
                <TextField
                  label="Descrição"
                  value={currentFunction.description}
                  onChange={(e) => setCurrentFunction({ ...currentFunction, description: e.target.value })}
                  fullWidth
                  margin="normal"
                  multiline
                  rows={2}
                  required
                  helperText="Descrição do que a função faz e quando deve ser chamada"
                />
              </Box>
              
              <Box mb={2}>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="h6">Parâmetros</Typography>
                  <Button
                    startIcon={<AddIcon />}
                    onClick={handleAddParameter}
                    color="primary"
                  >
                    Adicionar Parâmetro
                  </Button>
                </Box>
                
                {parameters.map((param, index) => (
                  <Card key={index} variant="outlined" sx={{ mb: 2, mt: 2 }}>
                    <CardContent>
                      <Box display="flex" flexDirection="column" gap={2}>
                        <TextField
                          label="Nome do Parâmetro"
                          value={param.name}
                          onChange={(e) => handleParameterChange(index, "name", e.target.value)}
                          fullWidth
                          required
                          size="small"
                        />
                        
                        <TextField
                          label="Descrição"
                          value={param.description}
                          onChange={(e) => handleParameterChange(index, "description", e.target.value)}
                          fullWidth
                          multiline
                          rows={2}
                          size="small"
                        />
                        
                        <Box display="flex" gap={2}>
                          <TextField
                            select
                            label="Tipo"
                            value={param.type}
                            onChange={(e) => handleParameterChange(index, "type", e.target.value)}
                            fullWidth
                            SelectProps={{
                              native: true,
                            }}
                            size="small"
                          >
                            <option value="string">String</option>
                            <option value="number">Number</option>
                            <option value="boolean">Boolean</option>
                            <option value="object">Object</option>
                            <option value="array">Array</option>
                          </TextField>
                          
                          <Box display="flex" alignItems="center">
                            <Checkbox
                              checked={param.required}
                              onChange={(e) => handleParameterChange(index, "required", e.target.checked)}
                            />
                            <Typography>Obrigatório</Typography>
                          </Box>
                        </Box>
                      </Box>
                    </CardContent>
                    
                    <CardActions sx={{ justifyContent: "flex-end" }}>
                      <IconButton
                        color="secondary"
                        onClick={() => handleDeleteParameter(index)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </CardActions>
                  </Card>
                ))}
                
                {parameters.length === 0 && (
                  <Typography color="textSecondary" align="center" py={4}>
                    Nenhum parâmetro definido
                  </Typography>
                )}
              </Box>
            </Box>
          )}
        </DialogContent>
        
        <DialogActions>
          <Button onClick={handleClose} color="secondary">
            Cancelar
          </Button>
          <Button onClick={handleSave} color="primary" variant="contained">
            Salvar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FunctionsEditor;