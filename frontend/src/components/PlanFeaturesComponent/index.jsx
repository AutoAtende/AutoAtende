import React, { useEffect, useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  CardHeader,
  LinearProgress,
  Divider,
  Box,
  Chip,
  CircularProgress
} from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import StorageIcon from '@mui/icons-material/Storage';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { green, red, blue, orange } from '@mui/material/colors';
import usePlans from '../../hooks/usePlans';
import { i18n } from "../../translate/i18n";

const useStyles = makeStyles(theme => ({
  root: {
    padding: theme.spacing(2)
  },
  title: {
    marginBottom: theme.spacing(2)
  },
  card: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column'
  },
  cardHeader: {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText
  },
  featuresContainer: {
    marginTop: theme.spacing(3)
  },
  feature: {
    padding: theme.spacing(1),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  featureEnabled: {
    color: green[500]
  },
  featureDisabled: {
    color: red[500]
  },
  storageCard: {
    marginTop: theme.spacing(3)
  },
  storageProgress: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
    height: 10,
    borderRadius: 5
  },
  chip: {
    margin: theme.spacing(0.5)
  },
  loading: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing(4)
  }
}));

const PlanFeaturesComponent = () => {
  const classes = useStyles();
  const { getFeatures, getStorageInfo, getAssistantsContentInfo } = usePlans();
  const [features, setFeatures] = useState(null);
  const [storageInfo, setStorageInfo] = useState(null);
  const [assistantsInfo, setAssistantsInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Carregar recursos do plano
        const featuresData = await getFeatures();
        setFeatures(featuresData);
        
        // Carregar informações de armazenamento
        const storageData = await getStorageInfo();
        setStorageInfo(storageData);
        
        // Carregar informações de conteúdo dos assistentes (se disponível)
        if (featuresData.useOpenAIAssistants) {
          const assistantsData = await getAssistantsContentInfo();
          setAssistantsInfo(assistantsData);
        }
      } catch (error) {
        console.error("Erro ao carregar dados do plano:", error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  if (loading) {
    return (
      <Container className={classes.loading}>
        <CircularProgress />
      </Container>
    );
  }

  if (!features) {
    return (
      <Container>
        <Typography variant="h6" color="error">
          Não foi possível carregar as informações do plano.
        </Typography>
      </Container>
    );
  }

  // Calcular a porcentagem de uso do armazenamento
  const storagePercentage = storageInfo ? Math.min(100, Math.round((storageInfo.used / storageInfo.limit) * 100)) : 0;
  
  // Calcular a porcentagem de uso do conteúdo dos assistentes
  const assistantsPercentage = assistantsInfo ? Math.min(100, Math.round((assistantsInfo.used / assistantsInfo.limit) * 100)) : 0;

  return (
    <Container className={classes.root}>
      <Typography variant="h4" className={classes.title}>
        Recursos do Plano
      </Typography>
      
      <Paper elevation={3} className={classes.root}>
        <Grid container spacing={3}>
          {/* Recursos de Funcionalidades */}
          <Grid item xs={12} md={6}>
            <Card className={classes.card}>
              <CardHeader 
                title="Funcionalidades Disponíveis" 
                className={classes.cardHeader}
              />
              <CardContent>
                <Grid container spacing={1}>
                  <FeatureItem 
                    name="Campanhas" 
                    enabled={features.useCampaigns} 
                  />
                  <FeatureItem 
                    name="Kanban" 
                    enabled={features.useKanban} 
                  />
                  <FeatureItem 
                    name="OpenAI" 
                    enabled={features.useOpenAi} 
                  />
                  <FeatureItem 
                    name="Integrações" 
                    enabled={features.useIntegrations} 
                  />
                  <FeatureItem 
                    name="Agendamentos" 
                    enabled={features.useSchedules} 
                  />
                  <FeatureItem 
                    name="Chat Interno" 
                    enabled={features.useInternalChat} 
                  />
                  <FeatureItem 
                    name="API Externa" 
                    enabled={features.useExternalApi} 
                  />
                  <FeatureItem 
                    name="Email" 
                    enabled={features.useEmail} 
                  />
                  <FeatureItem 
                    name="White Label" 
                    enabled={features.whiteLabel} 
                  />
                </Grid>
              </CardContent>
            </Card>
          </Grid>
          
          {/* Novos Recursos */}
          <Grid item xs={12} md={6}>
            <Card className={classes.card}>
              <CardHeader 
                title="Recursos Avançados" 
                className={classes.cardHeader}
              />
              <CardContent>
                <Grid container spacing={1}>
                  <FeatureItem 
                    name="Agentes OpenAI" 
                    enabled={features.useOpenAIAssistants} 
                  />
                  <FeatureItem 
                    name="Flow Builder" 
                    enabled={features.useFlowBuilder} 
                  />
                  <FeatureItem 
                    name="API Oficial" 
                    enabled={features.useAPIOfficial} 
                  />
                  <FeatureItem 
                    name="Regras de ChatBot" 
                    enabled={features.useChatBotRules} 
                  />
                </Grid>
              </CardContent>
            </Card>
          </Grid>
          
          {/* Informações de Armazenamento */}
          {storageInfo && (
            <Grid item xs={12} md={6}>
              <Card className={classes.storageCard}>
                <CardHeader 
                  title="Armazenamento" 
                  className={classes.cardHeader}
                  avatar={<StorageIcon />}
                />
                <CardContent>
                  <Typography variant="body1">
                    Limite: {Math.round(storageInfo.limit)} MB
                  </Typography>
                  <Typography variant="body1">
                    Utilizado: {Math.round(storageInfo.used)} MB ({storagePercentage}%)
                  </Typography>
                  <Typography variant="body1">
                    Disponível: {Math.round(storageInfo.remaining)} MB
                  </Typography>
                  
                  <LinearProgress 
                    variant="determinate" 
                    value={storagePercentage} 
                    className={classes.storageProgress}
                    color={storagePercentage > 90 ? "error" : storagePercentage > 70 ? "warning" : "primary"}
                  />
                  
                  <Typography variant="caption">
                    O limite de armazenamento se refere ao espaço total disponível para arquivos de mídia, documentos e outros conteúdos enviados pelo sistema.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          )}
          
          {/* Informações de Conteúdo dos Agentes */}
          {features.useOpenAIAssistants && assistantsInfo && (
            <Grid item xs={12} md={6}>
              <Card className={classes.storageCard}>
                <CardHeader 
                  title="Conteúdo de Agentes IA" 
                  className={classes.cardHeader}
                  avatar={<CloudUploadIcon />}
                />
                <CardContent>
                  <Typography variant="body1">
                    Limite: {Math.round(assistantsInfo.limit)} MB
                  </Typography>
                  <Typography variant="body1">
                    Utilizado: {Math.round(assistantsInfo.used)} MB ({assistantsPercentage}%)
                  </Typography>
                  <Typography variant="body1">
                    Disponível: {Math.round(assistantsInfo.remaining)} MB
                  </Typography>
                  
                  <LinearProgress 
                    variant="determinate" 
                    value={assistantsPercentage} 
                    className={classes.storageProgress}
                    color={assistantsPercentage > 90 ? "error" : assistantsPercentage > 70 ? "warning" : "primary"}
                  />
                  
                  <Typography variant="caption">
                    O limite de conteúdo para assistentes refere-se ao espaço total disponível para arquivos e textos usados no treinamento de seus assistentes de IA.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          )}
        </Grid>
      </Paper>
    </Container>
  );
};

// Componente auxiliar para exibir um recurso
const FeatureItem = ({ name, enabled }) => {
  const classes = useStyles();
  
  return (
    <Grid item xs={12}>
      <Box className={classes.feature}>
        <Typography variant="body1">{name}</Typography>
        {enabled ? (
          <Chip
            icon={<CheckCircleIcon />}
            label="Ativo"
            className={classes.chip}
            color="primary"
            size="small"
          />
        ) : (
          <Chip
            icon={<CancelIcon />}
            label="Inativo"
            className={classes.chip}
            color="default"
            size="small"
          />
        )}
      </Box>
      <Divider />
    </Grid>
  );
};

export default PlanFeaturesComponent;