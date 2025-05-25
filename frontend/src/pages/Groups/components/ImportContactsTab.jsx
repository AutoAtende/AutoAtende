import React, { useState, useEffect } from "react";
import {
  Box,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  FormHelperText,
  Grid,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Stepper,
  Step,
  StepLabel,
  StepContent
} from "@mui/material";
import {
  CloudUpload as UploadIcon,
  FilePresent as FileIcon,
  Help as HelpIcon,
  Download as DownloadIcon,
  Group as GroupIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  Info as InfoIcon
} from "@mui/icons-material";
import { toast } from "../../../helpers/toast";
import { i18n } from "../../../translate/i18n";
import api from "../../../services/api";
import BaseButton from "../../../components/shared/BaseButton";
import StandardTabContent from "../../../components/shared/StandardTabContent";

const ImportContactsTab = () => {
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingGroups, setLoadingGroups] = useState(false);
  const [result, setResult] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(null);
  const [activeStep, setActiveStep] = useState(0);
  
  useEffect(() => {
    fetchGroups();
  }, []);
  
  const fetchGroups = async () => {
    setLoadingGroups(true);
    try {
      const { data } = await api.get("/groups", {
        params: { searchParam: "", pageNumber: 1 }
      });
      setGroups(data.groups);
    } catch (err) {
      toast.error(err);
    } finally {
      setLoadingGroups(false);
    }
  };
  
  const handleGroupChange = (e) => {
    setSelectedGroup(e.target.value);
    if (e.target.value) {
      setActiveStep(1);
    }
  };
  
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      if (selectedGroup) {
        setActiveStep(2);
      }
    }
  };
  
  const handleImportContacts = async () => {
    if (!selectedGroup) {
      toast.error(i18n.t("groups.errors.selectGroup"));
      return;
    }
    
    if (!selectedFile) {
      toast.error(i18n.t("groups.errors.selectFile"));
      return;
    }
    
    const fileExtension = selectedFile.name.split('.').pop().toLowerCase();
    if (fileExtension !== 'csv' && fileExtension !== 'xlsx' && fileExtension !== 'xls') {
      toast.error(i18n.t("groups.errors.invalidFileFormat"));
      return;
    }
    
    setLoading(true);
    setActiveStep(3);
    
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      
      const companyId = localStorage.getItem('companyId');
      const socket = window.socket;
      
      const handleImportProgress = (data) => {
        if (data.action === "running") {
          setUploadProgress(data.result.message);
        } else if (data.action === "complete") {
          setResult({
            status: "success",
            message: i18n.t("groups.importSuccess", { 
              valid: data.result.whatsappValids,
              invalid: data.result.whatsappInValids.length
            }),
            validCount: data.result.whatsappValids,
            invalidNumbers: data.result.whatsappInValids
          });
          setUploadProgress(null);
          setActiveStep(4);
        }
      };
      
      socket.on(`company-${companyId}-upload-contact-${selectedGroup}`, handleImportProgress);
      
      await api.post(`/groups/${selectedGroup}/upload-contacts`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      return () => {
        socket.off(`company-${companyId}-upload-contact-${selectedGroup}`, handleImportProgress);
      };
      
    } catch (err) {
      toast.error(err);
      setResult({
        status: "error",
        message: i18n.t("groups.errors.importFailed")
      });
      setActiveStep(4);
    } finally {
      setLoading(false);
    }
  };
  
  const handleDownloadTemplate = () => {
    const csvContent = "numero\n5511999999999\n5511888888888";
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'contatos_modelo.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleReset = () => {
    setSelectedGroup("");
    setSelectedFile(null);
    setResult(null);
    setUploadProgress(null);
    setActiveStep(0);
  };

  // Configuração dos alertas
  const alerts = [];

  if (uploadProgress) {
    alerts.push({
      severity: "info",
      title: "Processando Importação",
      message: uploadProgress
    });
  }

  if (result) {
    alerts.push({
      severity: result.status === "success" ? "success" : "error",
      title: result.status === "success" ? "Importação Concluída" : "Erro na Importação",
      message: result.message,
      action: result.status === "success" ? (
        <BaseButton
          variant="outlined"
          size="small"
          onClick={handleReset}
        >
          Nova Importação
        </BaseButton>
      ) : null
    });
  }

  // Estatísticas
  const stats = [];
  if (groups.length > 0) {
    stats.push({
      label: `${groups.length} grupos disponíveis`,
      icon: <GroupIcon />,
      color: 'primary'
    });
  }

  if (result?.status === "success") {
    stats.push(
      {
        label: `${result.validCount} contatos válidos`,
        icon: <CheckIcon />,
        color: 'success'
      },
      {
        label: `${result.invalidNumbers?.length || 0} inválidos`,
        icon: <ErrorIcon />,
        color: 'error'
      }
    );
  }

  // Ações do cabeçalho
  const actions = (
    <BaseButton
      variant="outlined"
      startIcon={<DownloadIcon />}
      onClick={handleDownloadTemplate}
    >
      {i18n.t("groups.template")}
    </BaseButton>
  );

  // Steps do processo
  const steps = [
    {
      label: 'Selecionar Grupo',
      description: 'Escolha o grupo onde os contatos serão importados'
    },
    {
      label: 'Carregar Arquivo',
      description: 'Faça upload do arquivo CSV ou Excel com os contatos'
    },
    {
      label: 'Confirmar Importação',
      description: 'Revise as informações e inicie o processo'
    },
    {
      label: 'Processamento',
      description: 'Aguarde o processamento dos contatos'
    },
    {
      label: 'Concluído',
      description: 'Importação finalizada com sucesso'
    }
  ];

  return (
    <StandardTabContent
      title={i18n.t("groups.importContacts")}
      description={i18n.t("groups.importContactsDescription")}
      icon={<UploadIcon />}
      stats={stats}
      alerts={alerts}
      actions={actions}
      variant="default"
    >
      <Grid container spacing={3}>
        {/* Formulário Principal */}
        <Grid item xs={12} md={8}>
          <Card variant="outlined" sx={{ height: 'fit-content' }}>
            <CardContent sx={{ p: 3 }}>
              <Stepper activeStep={activeStep} orientation="vertical">
                {steps.map((step, index) => (
                  <Step key={step.label}>
                    <StepLabel>
                      {step.label}
                    </StepLabel>
                    <StepContent>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="textSecondary">
                          {step.description}
                        </Typography>
                      </Box>

                      {/* Step 0: Seleção do Grupo */}
                      {index === 0 && (
                        <FormControl fullWidth sx={{ mb: 2 }}>
                          <InputLabel>{i18n.t("groups.selectGroup")}</InputLabel>
                          <Select
                            value={selectedGroup}
                            onChange={handleGroupChange}
                            label={i18n.t("groups.selectGroup")}
                            disabled={loading || loadingGroups}
                          >
                            {loadingGroups ? (
                              <MenuItem value="" disabled>
                                <CircularProgress size={20} /> {i18n.t("loading")}
                              </MenuItem>
                            ) : (
                              groups.map((group) => (
                                <MenuItem key={group.id} value={group.id}>
                                  <Box display="flex" alignItems="center" gap={1}>
                                    <GroupIcon fontSize="small" />
                                    {group.subject || group.name}
                                  </Box>
                                </MenuItem>
                              ))
                            )}
                          </Select>
                          <FormHelperText>
                            {i18n.t("groups.selectGroupHelp")}
                          </FormHelperText>
                        </FormControl>
                      )}

                      {/* Step 1: Upload do Arquivo */}
                      {index === 1 && selectedGroup && (
                        <Box sx={{ mb: 2 }}>
                          <BaseButton
                            variant="outlined"
                            component="label"
                            fullWidth
                            startIcon={selectedFile ? <FileIcon /> : <UploadIcon />}
                            disabled={loading}
                            sx={{ 
                              py: 2,
                              borderStyle: 'dashed',
                              borderWidth: 2
                            }}
                          >
                            {selectedFile ? selectedFile.name : i18n.t("groups.selectFile")}
                            <input
                              type="file"
                              hidden
                              accept=".csv,.xlsx,.xls"
                              onChange={handleFileChange}
                            />
                          </BaseButton>
                          <FormHelperText sx={{ mt: 1 }}>
                            Formatos aceitos: CSV, XLSX, XLS
                          </FormHelperText>
                        </Box>
                      )}

                      {/* Step 2: Confirmação */}
                      {index === 2 && selectedGroup && selectedFile && (
                        <Box sx={{ mb: 2 }}>
                          <BaseButton
                            variant="contained"
                            color="primary"
                            size="large"
                            fullWidth
                            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <UploadIcon />}
                            onClick={handleImportContacts}
                            disabled={loading}
                            sx={{ py: 1.5 }}
                          >
                            {loading ? i18n.t("loading") : i18n.t("groups.importContacts")}
                          </BaseButton>
                        </Box>
                      )}
                    </StepContent>
                  </Step>
                ))}
              </Stepper>
            </CardContent>
          </Card>
        </Grid>

        {/* Painel Lateral */}
        <Grid item xs={12} md={4}>
          <Card variant="outlined">
            <CardContent>
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <InfoIcon color="primary" />
                <Typography variant="h6">
                  Dicas de Importação
                </Typography>
              </Box>

              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <CheckIcon fontSize="small" color="success" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Formato correto"
                    secondary="Use números com código do país (5511999999999)"
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemIcon>
                    <CheckIcon fontSize="small" color="success" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Arquivo organizado"
                    secondary="Coluna 'numero' no cabeçalho do CSV/Excel"
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemIcon>
                    <CheckIcon fontSize="small" color="success" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Validação automática"
                    secondary="O sistema valida automaticamente os números"
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>

          {/* Números Inválidos */}
          {result?.invalidNumbers && result.invalidNumbers.length > 0 && (
            <Card variant="outlined" sx={{ mt: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom color="error">
                  Números Inválidos ({result.invalidNumbers.length})
                </Typography>
                <Box 
                  sx={{ 
                    maxHeight: 200, 
                    overflow: 'auto',
                    bgcolor: 'grey.50',
                    p: 1,
                    borderRadius: 1
                  }}
                >
                  {result.invalidNumbers.map((number, index) => (
                    <Typography 
                      key={index} 
                      variant="body2" 
                      component="div"
                      color="error"
                      sx={{ fontFamily: 'monospace' }}
                    >
                      {number}
                    </Typography>
                  ))}
                </Box>
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>
    </StandardTabContent>
  );
};

export default ImportContactsTab;