import React, { useState, useEffect, useCallback, useRef } from "react";
import { 
  Paper, 
  Typography, 
  Modal, 
  Tabs,
  Tab,
  Box,
  CircularProgress,
  IconButton,
  useTheme,
  useMediaQuery,
  Backdrop,
  Fade,
  Grid
} from "@mui/material";
import { styled } from "@mui/material/styles";
import CloseIcon from "@mui/icons-material/Close";
import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import Title from "../../components/Title";
import { i18n } from "../../translate/i18n";
import useHelps from "../../hooks/useHelps";
import EmptyState from "../../components/EmptyState";
import SwaggerUIBundle from "swagger-ui-dist/swagger-ui-bundle";
import "swagger-ui-dist/swagger-ui.css";
import apiSpec from './apiSpec.json';

// Componentes estilizados com MUI 5
const StyledMainPaperContainer = styled(Box)(({ theme }) => ({
  overflowY: 'auto',
  maxHeight: 'calc(100vh - 200px)',
  width: '100%',
  padding: theme.spacing(1),
  [theme.breakpoints.down('sm')]: {
    maxHeight: 'calc(100vh - 160px)',
  }
}));

const StyledGridContainer = styled(Grid)(({ theme }) => ({
  width: '100%',
  margin: 0,
}));

const StyledHelpCard = styled(Paper)(({ theme }) => ({
  position: 'relative',
  width: '100%',
  height: '100%',
  minHeight: '320px',
  padding: theme.spacing(2),
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[3],
  cursor: 'pointer',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  transition: 'transform 0.3s, box-shadow 0.3s',
  '&:hover': {
    transform: 'scale(1.02)',
    boxShadow: theme.shadows[6],
    '& .MuiTypography-button': {
      color: theme.palette.primary.main,
    }
  },
  [theme.breakpoints.down('sm')]: {
    minHeight: '280px',
  }
}));

const StyledVideoThumbnail = styled('img')(({ theme }) => ({
  width: '100%',
  height: 'calc(100% - 56px)',
  objectFit: 'cover',
  borderRadius: `${theme.shape.borderRadius}px ${theme.shape.borderRadius}px 0 0`,
  marginBottom: theme.spacing(1),
}));

const StyledVideoTitle = styled(Typography)(({ theme }) => ({
  marginTop: theme.spacing(1),
  fontWeight: 500,
  flex: 1,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  display: '-webkit-box',
  WebkitLineClamp: 2,
  WebkitBoxOrient: 'vertical',
}));

const StyledVideoDescription = styled(Typography)(({ theme }) => ({
  maxHeight: '80px',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  display: '-webkit-box',
  WebkitLineClamp: 3,
  WebkitBoxOrient: 'vertical',
}));

const StyledModalContent = styled(Box)(({ theme }) => ({
  position: 'relative',
  width: '90%',
  maxWidth: '1024px',
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[5],
  outline: 'none',
  overflow: 'hidden',
  [theme.breakpoints.down('md')]: {
    width: '95%',
  },
}));

const StyledIframeContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  width: '100%',
  paddingTop: '56.25%', // Proporção 16:9
}));

const StyledIframe = styled('iframe')(({ theme }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  border: 'none',
}));

const StyledCloseButton = styled(IconButton)(({ theme }) => ({
  position: 'absolute',
  top: theme.spacing(1),
  right: theme.spacing(1),
  zIndex: 10,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  color: '#fff',
  '&:hover': {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
}));

const StyledTabsContainer = styled(Paper)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  position: 'sticky',
  top: 0,
  zIndex: 1,
  [theme.breakpoints.down('sm')]: {
    marginBottom: theme.spacing(1),
  }
}));

const StyledSwaggerContainer = styled(Box)(({ theme }) => ({
  height: 'calc(100vh - 280px)',
  overflow: 'auto',
  '& .swagger-ui .topbar': {
    display: 'none'
  },
  '& .swagger-ui .info .title small': {
    display: 'none'
  },
  '& .swagger-ui .scheme-container': {
    position: 'sticky',
    top: 0,
    zIndex: 1
  },
  '& .swagger-ui .opblock-tag': {
    fontFamily: theme.typography.fontFamily,
    fontSize: '1.1rem',
  },
  '& .swagger-ui .opblock .opblock-summary-operation-id, .swagger-ui .opblock .opblock-summary-path, .swagger-ui .opblock .opblock-summary-path__deprecated': {
    fontFamily: theme.typography.fontFamily,
    fontSize: '0.9rem',
  },
  '& .swagger-ui .btn': {
    fontFamily: theme.typography.fontFamily,
  },
  '& .swagger-ui select': {
    fontFamily: theme.typography.fontFamily,
  },
  '& .swagger-ui .opblock-description-wrapper p, .swagger-ui .opblock-external-docs-wrapper p, .swagger-ui .opblock-title_normal p': {
    fontFamily: theme.typography.fontFamily,
    fontSize: '0.9rem',
  },
  [theme.breakpoints.down('sm')]: {
    height: 'calc(100vh - 240px)',
  }
}));

const StyledLoadingContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  padding: theme.spacing(4),
  height: '200px',
}));

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`help-tabpanel-${index}`}
      aria-labelledby={`help-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box>{children}</Box>
      )}
    </div>
  );
}

const SwaggerUIComponent = () => {
  const swaggerRef = useRef(null);
  const theme = useTheme();

  useEffect(() => {
    if (swaggerRef.current) {
      // Configuração do Swagger UI com suporte para português
      SwaggerUIBundle({
        spec: apiSpec,
        dom_id: '#swagger-ui',
        deepLinking: true,
        presets: [
          SwaggerUIBundle.presets.apis,
          SwaggerUIBundle.SwaggerUIStandalonePreset
        ],
        layout: "BaseLayout",
        docExpansion: "list",
        defaultModelsExpandDepth: -1,
        displayRequestDuration: true,
        filter: true,
        withCredentials: true,
        // Configurações para português
        defaultModelRendering: 'model',
        supportedSubmitMethods: ['get', 'post', 'put', 'delete', 'patch'],
        // Personalização de texto em português
        responseInterceptor: (response) => {
          return response;
        },
        translations: {
          modelExample: 'Exemplo',
          requestBody: 'Corpo da Requisição',
          responseBody: 'Corpo da Resposta',
          noContentDescription: 'Sem conteúdo',
          parameters: 'Parâmetros',
          tryItOutButton: 'Testar',
          tryIt: 'Testar',
          cancel: 'Cancelar',
          clear: 'Limpar',
          authorizeButton: 'Autorizar',
          authorize: 'Autorizar',
          done: 'Concluído',
          name: 'Nome',
          description: 'Descrição',
          parameterType: 'Tipo de parâmetro',
          required: 'Obrigatório',
          value: 'Valor',
          response: 'Resposta',
          responses: 'Respostas',
          // Títulos do menu de requisições
          requestBody: 'Corpo da Requisição'
        }
      });
    }
  }, []);

  return <div id="swagger-ui" ref={swaggerRef} />;
};

const Helps = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [records, setRecords] = useState([]);
  const { list } = useHelps();
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const fetchedRef = useRef(false);
  
  // Função principal de carregamento de dados que só será executada uma vez
  useEffect(() => {
    // Se já buscou os dados, não busca novamente
    if (fetchedRef.current) return;
    
    const loadHelps = async () => {
      try {
        setIsLoading(true);
        // Marca que já realizou a busca para evitar múltiplas chamadas
        fetchedRef.current = true;
        
        const data = await list();
        setRecords(data);
      } catch (error) {
        console.error("Erro ao carregar dados de ajuda:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadHelps();
    
    // Função de limpeza quando o componente for desmontado
    return () => {
      // Se necessário, cancelar requisições pendentes aqui
    };
  }, []); // Dependência vazia para executar apenas uma vez

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const openVideoModal = (video) => {
    setSelectedVideo(video);
  };

  const closeVideoModal = () => {
    setSelectedVideo(null);
  };

  const handleModalClose = useCallback((event) => {
    if (event.key === "Escape") {
      closeVideoModal();
    }
  }, []);

  useEffect(() => {
    document.addEventListener("keydown", handleModalClose);
    return () => {
      document.removeEventListener("keydown", handleModalClose);
    };
  }, [handleModalClose]);

  const renderVideoModal = () => {
    return (
      <Modal
        open={Boolean(selectedVideo)}
        onClose={closeVideoModal}
        closeAfterTransition
        slots={{
          backdrop: Backdrop
        }}
        slotProps={{
          backdrop: {
            timeout: 500,
          }
        }}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Fade in={Boolean(selectedVideo)}>
          <StyledModalContent>
            <StyledCloseButton
              onClick={closeVideoModal}
              aria-label="fechar"
              size="large"
            >
              <CloseIcon />
            </StyledCloseButton>
            <StyledIframeContainer>
              {selectedVideo && (
                <StyledIframe
                  src={`https://www.youtube.com/embed/${selectedVideo}`}
                  title="YouTube video player"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              )}
            </StyledIframeContainer>
          </StyledModalContent>
        </Fade>
      </Modal>
    );
  };

  const renderHelps = () => {
    if (isLoading) {
      return (
        <StyledLoadingContainer>
          <CircularProgress color="primary" />
        </StyledLoadingContainer>
      );
    }

    if (!records || !records.length) {
      return (
        <EmptyState
          type="helps"
          showButton={false}
        />
      );
    }

    return (
      <StyledMainPaperContainer>
        <StyledGridContainer container spacing={isMobile ? 1 : 3}>
          {records.map((record, key) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={key}>
              <StyledHelpCard onClick={() => openVideoModal(record.video)}>
                <StyledVideoThumbnail
                  src={`https://img.youtube.com/vi/${record.video}/mqdefault.jpg`}
                  alt={record.title || 'Thumbnail do vídeo'}
                  loading="lazy"
                />
                <Box>
                  <StyledVideoTitle variant="button">
                    {record.title}
                  </StyledVideoTitle>
                  <StyledVideoDescription variant="caption">
                    {record.description}
                  </StyledVideoDescription>
                </Box>
              </StyledHelpCard>
            </Grid>
          ))}
        </StyledGridContainer>
      </StyledMainPaperContainer>
    );
  };

  return (
    <MainContainer>
      <MainHeader>
        <Title>{i18n.t("helps.title")}</Title>
        <MainHeaderButtonsWrapper></MainHeaderButtonsWrapper>
      </MainHeader>

      <StyledTabsContainer elevation={2}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant={isMobile ? "fullWidth" : "standard"}
          centered={!isMobile}
        >
          <Tab label={i18n.t("helps.videoTab")} />
          <Tab label={i18n.t("helps.apiTab")} />
        </Tabs>
      </StyledTabsContainer>

      <TabPanel value={tabValue} index={0}>
        {renderHelps()}
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <StyledSwaggerContainer>
          <SwaggerUIComponent />
        </StyledSwaggerContainer>
      </TabPanel>

      {renderVideoModal()}
    </MainContainer>
  );
};

export default Helps;