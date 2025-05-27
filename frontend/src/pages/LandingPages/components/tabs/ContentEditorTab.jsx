import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useTheme } from '@mui/material/styles';
import {
  Box,
  Button,
  Typography,
  Paper,
  Tabs,
  Tab,
  IconButton,
  InputAdornment,
  Tooltip,
  Divider,
  Alert,
  useMediaQuery,
  Switch,
  FormControlLabel
} from '@mui/material';
import { 
  Code as CodeIcon, 
  Visibility as VisibilityIcon,
  Image as ImageIcon,
  Close as CloseIcon,
  Edit as EditIcon,
  FormatBold as BoldIcon,
  FormatItalic as ItalicIcon,
  FormatUnderlined as UnderlinedIcon,
  FormatListBulleted as ListIcon,
  Link as LinkIcon,
  Description as DescriptionIcon,
  Info as InfoIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import ReactQuill, { Quill } from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { useSpring, animated } from 'react-spring';
import FileManager from '../FileManager';
import BaseModal from '../../../../components/BaseModal';

const BlockEmbed = Quill.import('blots/block/embed');
const Inline = Quill.import('blots/inline');

// Registrar blot personalizado para <link> stylesheet
class StyleLink extends BlockEmbed {
  static create(value) {
    const node = super.create();
    node.setAttribute('href', value.href);
    node.setAttribute('rel', 'stylesheet');
    node.setAttribute('integrity', value.integrity);
    node.setAttribute('crossorigin', value.crossorigin);
    node.tagName = 'link';
    return node;
  }

  static value(node) {
    return {
      href: node.getAttribute('href'),
      integrity: node.getAttribute('integrity'),
      crossorigin: node.getAttribute('crossorigin')
    };
  }
}
StyleLink.blotName = 'style-link';
StyleLink.tagName = 'link';
Quill.register(StyleLink);

// Registrar blot personalizado para <script>
class ScriptTag extends BlockEmbed {
  static create(value) {
    const node = super.create();
    node.setAttribute('src', value.src);
    node.setAttribute('integrity', value.integrity);
    node.setAttribute('crossorigin', value.crossorigin);
    node.tagName = 'script';
    return node;
  }

  static value(node) {
    return {
      src: node.getAttribute('src'),
      integrity: node.getAttribute('integrity'),
      crossorigin: node.getAttribute('crossorigin')
    };
  }
}
ScriptTag.blotName = 'script-tag';
ScriptTag.tagName = 'script';
Quill.register(ScriptTag);

const AnimatedPaper = animated(Paper);
const AnimatedBox = animated(Box);

// Configurações do editor WYSIWYG
const modules = {
  toolbar: {
    container: [
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'indent': '-1'}, { 'indent': '+1' }],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'align': [] }],
      ['link', 'image', 'video'],
      ['clean'],
      ['bootstrap']
    ]
  },
  clipboard: {
    matchVisual: false
  },
  keyboard: {
    bindings: {
      'tab': null, // Desabilitar o comportamento padrão do tab
    }
  }
};

// Formatos permitidos expandidos
const formats = [
  'header',
  'bold', 'italic', 'underline', 'strike',
  'list', 'bullet', 'indent',
  'color', 'background',
  'align',
  'link', 'image', 'video',
  'style-link', 'script-tag'
];

const ContentEditorTab = ({ landingPage, setLandingPage }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [htmlCode, setHtmlCode] = useState(landingPage.content || '');
  const [originalHtmlCode, setOriginalHtmlCode] = useState(landingPage.content || '');
  const [previewOpen, setPreviewOpen] = useState(false);
  const [mediaManagerOpen, setMediaManagerOpen] = useState(false);
  const [preserveHtml, setPreserveHtml] = useState(true);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const quillRef = useRef(null);
  
  // Atualizar o conteúdo quando a landing page mudar
  useEffect(() => {
    if (landingPage && landingPage.content) {
      setHtmlCode(landingPage.content);
      setOriginalHtmlCode(landingPage.content);
    }
  }, [landingPage?.id, landingPage?.content]); // Atualizar apenas quando o ID ou conteúdo mudar
  
  // Animações
  const fadeIn = useSpring({
    from: { opacity: 0, transform: 'translateY(20px)' },
    to: { opacity: 1, transform: 'translateY(0)' },
    config: { tension: 280, friction: 60 }
  });

  const editorAnimation = useSpring({
    from: { opacity: 0, transform: 'scale(0.98)' },
    to: { opacity: 1, transform: 'scale(1)' },
    config: { tension: 220, friction: 40 }
  });
  
  // Função para atualizar o conteúdo
  const handleContentChange = useCallback((content) => {
    // Se estamos no editor HTML, atualizamos tanto o htmlCode quanto o originalHtmlCode
    if (activeTab === 1) {
      setHtmlCode(content);
      setOriginalHtmlCode(content);
      
      // Atualizar o estado da landing page
      setLandingPage(prev => ({
        ...prev,
        content: content
      }));
    } 
    // Se estamos no editor visual, apenas atualizamos o htmlCode
    else {
      setHtmlCode(content);
      
      if (!preserveHtml) {
        // Se não estamos preservando o HTML original, também atualizamos o estado
        setLandingPage(prev => ({
          ...prev,
          content: content
        }));
      }
    }
  }, [activeTab, preserveHtml, setLandingPage]);
  
  // Função para alternar entre as abas
  const handleTabChange = (event, newValue) => {
    // Se estamos mudando do HTML para o visual
    if (activeTab === 1 && newValue === 0) {
      if (preserveHtml) {
        // No próximo ciclo de renderização, o editor visual tentará renderizar o HTML original
        // mas pode falhar em preservar partes complexas. Por isso, guardamos o HTML original.
        setHtmlCode(originalHtmlCode);
      }
    } 
    // Se estamos mudando do visual para o HTML e queremos preservar o HTML original
    else if (activeTab === 0 && newValue === 1 && preserveHtml) {
      // Restauramos o HTML original
      setHtmlCode(originalHtmlCode);
    }
    
    setActiveTab(newValue);
  };
  
  // Handler para alternar a preservação de HTML
  const handleTogglePreserveHtml = (event) => {
    const preserve = event.target.checked;
    setPreserveHtml(preserve);
    
    // Se acabamos de ativar a preservação e estamos no modo visual, guardamos o HTML atual
    if (preserve && activeTab === 0) {
      setOriginalHtmlCode(htmlCode);
    }
    // Se estamos desativando a preservação, atualizamos tudo para o conteúdo atual
    else if (!preserve) {
      setOriginalHtmlCode(htmlCode);
      setLandingPage(prev => ({
        ...prev,
        content: htmlCode
      }));
    }
  };
  
  // Abrir/fechar diálogo de pré-visualização
  const handleOpenPreview = () => setPreviewOpen(true);
  const handleClosePreview = () => setPreviewOpen(false);
  
  // Abrir/fechar gerenciador de mídia
  const handleOpenMediaManager = () => setMediaManagerOpen(true);
  const handleCloseMediaManager = () => setMediaManagerOpen(false);
  
  // Handler para selecionar um arquivo do gerenciador
  const handleFileSelect = (file) => {
    if (activeTab === 0) {
      // Para o editor visual (React-Quill)
      if (quillRef.current) {
        const quill = quillRef.current.getEditor();
        if (!quill) {
          console.error('Quill editor not initialized');
          return;
        }
        
        const range = quill.getSelection() || { index: quill.getLength(), length: 0 };
        
        if (file.mimeType.startsWith('image/')) {
          const insertHtml = `<img src="${file.url}" alt="${file.name}" style="max-width: 100%; height: auto;" />`;
          quill.clipboard.dangerouslyPasteHTML(range.index, insertHtml);
          
          // Também atualizar o HTML original se estamos preservando
          if (preserveHtml) {
            const insertPoint = originalHtmlCode.length; // Inserir no final se não tivermos como determinar a posição
            const newHtmlCode = originalHtmlCode.substring(0, insertPoint) + 
                              insertHtml + 
                              originalHtmlCode.substring(insertPoint);
            setOriginalHtmlCode(newHtmlCode);
            
            // Atualizar o estado da landing page com o HTML original
            setLandingPage(prev => ({
              ...prev,
              content: newHtmlCode
            }));
          }
        } else {
          const insertHtml = `<a href="${file.url}" target="_blank">${file.name}</a>`;
          quill.clipboard.dangerouslyPasteHTML(range.index, insertHtml);
          
          // Também atualizar o HTML original se estamos preservando
          if (preserveHtml) {
            const insertPoint = originalHtmlCode.length;
            const newHtmlCode = originalHtmlCode.substring(0, insertPoint) + 
                              insertHtml + 
                              originalHtmlCode.substring(insertPoint);
            setOriginalHtmlCode(newHtmlCode);
            
            // Atualizar o estado da landing page com o HTML original
            setLandingPage(prev => ({
              ...prev,
              content: newHtmlCode
            }));
          }
        }
      }
    } else {
      // Para o editor HTML
      let insertCode = '';
      if (file.mimeType.startsWith('image/')) {
        insertCode = `<img src="${file.url}" alt="${file.name}" style="max-width: 100%; height: auto;" />`;
      } else {
        insertCode = `<a href="${file.url}" target="_blank">${file.name}</a>`;
      }
      
      // Inserir no cursor ou no final
      const textArea = document.getElementById('html-code-editor');
      if (textArea) {
        const start = textArea.selectionStart;
        const end = textArea.selectionEnd;
        const text = textArea.value;
        const newText = text.substring(0, start) + insertCode + text.substring(end);
        
        setHtmlCode(newText);
        setOriginalHtmlCode(newText);
        
        // Atualizar também o estado da landing page
        setLandingPage(prev => ({
          ...prev,
          content: newText
        }));
        
        // Reposicionar cursor após o código inserido
        setTimeout(() => {
          textArea.focus();
          textArea.setSelectionRange(start + insertCode.length, start + insertCode.length);
        }, 50);
      }
    }
    
    // Fechar o gerenciador de mídia
    handleCloseMediaManager();
  };
  
  // Configurar handler do Bootstrap
  const quillModules = useMemo(() => ({
    ...modules,
    toolbar: {
      ...modules.toolbar,
      handlers: {
        'bootstrap': function() {
          if (quillRef.current) {
            const quill = quillRef.current.getEditor();
            if (!quill) return;
            
            const range = quill.getSelection() || { index: quill.getLength(), length: 0 };
            
            const bootstrapHtml = `
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-9ndCyUaIbzAi2FUVXJi0CjmCapSmO7SnpJef0486qhLnuZ2cdeRhO02iuK6FUUVM" crossorigin="anonymous">
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js" integrity="sha384-geWF76RCwLtnZ8qwWowPQNguL3RmwHVBC9FhGdlKrxdiJJigb/j/68SIy3Te4Bkz" crossorigin="anonymous"></script>
`;
            quill.clipboard.dangerouslyPasteHTML(range.index, bootstrapHtml);
            
            // Atualizar o HTML original se estamos preservando
            if (preserveHtml) {
              setOriginalHtmlCode(originalHtmlCode + bootstrapHtml);
              
              // Atualizar o estado da landing page
              setLandingPage(prev => ({
                ...prev,
                content: originalHtmlCode + bootstrapHtml
              }));
            }
          }
        }
      }
    }
  }), [modules, preserveHtml, originalHtmlCode, setLandingPage]);

  // Para salvar modificações do editor visual no HTML original
  const handleVisualEditorSave = () => {
    if (preserveHtml && activeTab === 0) {
      // Obter HTML atual do editor
      let currentContent = htmlCode;
      if (quillRef.current) {
        const quill = quillRef.current.getEditor();
        if (quill && quill.root) {
          currentContent = quill.root.innerHTML;
        }
      }
      
      // Perguntar ao usuário se deseja substituir o HTML original
      const confirmed = window.confirm("Deseja substituir o HTML original com o conteúdo atual do editor visual? Isso pode afetar elementos HTML complexos.");
      
      if (confirmed) {
        setOriginalHtmlCode(currentContent);
        setLandingPage(prev => ({
          ...prev,
          content: currentContent
        }));
      }
    }
  };

  const previewActions = [
    {
      label: "Fechar",
      onClick: handleClosePreview,
      variant: "outlined",
      color: "primary"
    }
  ];
  
  return (
    <AnimatedPaper 
      elevation={0} 
      variant="outlined" 
      sx={{ 
        p: 3, 
        borderRadius: 2,
        height: '100%', // Usar altura total do container
        overflow: 'auto', // Habilitar scroll
        display: 'flex',
        flexDirection: 'column'
      }}
      style={fadeIn}
    >
      <Typography variant="h6" gutterBottom sx={{ 
        display: 'flex', 
        alignItems: 'center',
        mb: 3,
        color: 'primary.main',
        fontWeight: 600
      }}>
        <DescriptionIcon sx={{ mr: 1 }} />
        Editor de Conteúdo
      </Typography>
      
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Box display="flex" alignItems="center">
          <Paper 
            square
            elevation={0}
            sx={{ 
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 2,
              overflow: 'hidden'
            }}
          >
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              indicatorColor="primary"
              textColor="primary"
              variant={isMobile ? "scrollable" : "standard"}
              scrollButtons={isMobile ? "auto" : false}
            >
              <Tab 
                label="Editor Visual" 
                icon={<EditIcon />} 
                iconPosition="start"
              />
              <Tab 
                label="Código HTML" 
                icon={<CodeIcon />} 
                iconPosition="start"
              />
            </Tabs>
          </Paper>
          
          <FormControlLabel 
            control={
              <Switch 
                checked={preserveHtml} 
                onChange={handleTogglePreserveHtml} 
                color="primary"
              />
            }
            label={
              <Tooltip title="Quando ativado, preserva todo o HTML original ao alternar entre os editores. Recomendado para HTML complexo como componentes Bootstrap.">
                <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
                  Preservar HTML
                  <InfoIcon fontSize="small" sx={{ ml: 0.5, fontSize: '1rem' }} />
                </Typography>
              </Tooltip>
            }
            sx={{ ml: 2 }}
          />
        </Box>
        
        <Box>
          {preserveHtml && activeTab === 0 && (
            <Button
              variant="contained"
              color="primary"
              onClick={handleVisualEditorSave}
              sx={{ mr: 1 }}
            >
              Aplicar Alterações
            </Button>
          )}
          
          <Button
            variant="outlined"
            color="primary"
            startIcon={<ImageIcon />}
            onClick={handleOpenMediaManager}
            sx={{ mr: 1 }}
          >
            Mídia
          </Button>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<VisibilityIcon />}
            onClick={handleOpenPreview}
          >
            Visualizar
          </Button>
        </Box>
      </Box>
      
      {preserveHtml && activeTab === 0 && (
        <Alert 
          severity="warning" 
          variant="outlined" 
          sx={{ mb: 2, borderRadius: 2 }}
          icon={<WarningIcon />}
        >
          <Typography variant="body2">
            <strong>Modo de Preservação de HTML:</strong> O editor visual pode não exibir corretamente todos os elementos HTML complexos (como acordeões e carrosséis). 
            Para aplicar alterações feitas no editor visual ao HTML original, clique em <strong>Aplicar Alterações</strong>.
          </Typography>
        </Alert>
      )}
      
      <AnimatedBox 
        style={editorAnimation}
        sx={{ 
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          minHeight: '500px'
        }}
      >
        {activeTab === 0 ? (
          // Editor Visual (WYSIWYG)
          <Box sx={{ 
            border: `1px solid ${theme.palette.divider}`, 
            borderRadius: 1, 
            overflow: 'hidden',
            height: '100%',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <Box 
              sx={{ 
                height: 'calc(100% - 30px)', 
                '.ql-editor': {
                  minHeight: '450px'
                }
              }}
            >
              <ReactQuill
                ref={quillRef}
                theme="snow"
                value={htmlCode || ''}
                onChange={handleContentChange}
                modules={quillModules}
                formats={formats}
                style={{ height: '100%' }}
                preserveWhitespace={true}
              />
            </Box>
            <Box 
              sx={{ 
                p: 1, 
                borderTop: `1px solid ${theme.palette.divider}`,
                bgcolor: 'background.paper'
              }}
            >
              <Typography variant="caption" color="textSecondary" sx={{ display: 'flex', alignItems: 'center' }}>
                <InfoIcon fontSize="small" sx={{ mr: .5 }} />
                {preserveHtml 
                  ? "Modo de preservação HTML ativado: as alterações não afetam o HTML original até que você clique em 'Aplicar Alterações'"
                  : "Clique no botão Mídia para inserir imagens e arquivos"}
              </Typography>
            </Box>
          </Box>
        ) : (
          // Editor de código HTML
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              height: '100%'
            }}
          >
            <Box 
              component="textarea"
              id="html-code-editor"
              value={htmlCode}
              onChange={(e) => handleContentChange(e.target.value)}
              sx={{
                width: '100%',
                height: '100%',
                minHeight: '450px', // Altura mínima maior
                padding: '15px',
                fontFamily: 'monospace',
                fontSize: '14px',
                lineHeight: 1.5,
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 1,
                resize: 'vertical', // Permitir redimensionamento vertical
                outline: 'none',
                '&:focus': {
                  borderColor: theme.palette.primary.main,
                }
              }}
            />
            <Box 
              sx={{ 
                p: 1, 
                borderTop: 0,
                bgcolor: 'background.paper'
              }}
            >
              <Typography variant="caption" color="textSecondary" sx={{ display: 'flex', alignItems: 'center' }}>
                <InfoIcon fontSize="small" sx={{ mr: .5 }} />
                Editor HTML para usuários avançados - Preserva todas as tags HTML válidas
              </Typography>
            </Box>
          </Box>
        )}
      </AnimatedBox>
      
      {/* Dicas de Edição */}
      <Alert 
        severity="info" 
        variant="outlined" 
        sx={{ mt: 3, borderRadius: 2 }}
      >
        <Typography variant="body2">
          <strong>Dicas de edição:</strong> Use os controles acima para formatar seu texto. 
          O conteúdo será renderizado utilizando Bootstrap 5, permitindo utilizar classes como 
          <code> container, row, col, alert, btn</code>, etc.
          {preserveHtml && (
            <>
              <br /><br />
              <strong>Modo de preservação HTML ativado:</strong> Para elementos complexos como acordeões, carrosséis e componentes interativos do Bootstrap, 
              é recomendado usar o editor HTML diretamente para garantir a preservação de todas as estruturas e atributos necessários.
            </>
          )}
        </Typography>
      </Alert>
      
      {/* Diálogo de pré-visualização */}
      <BaseModal
        open={previewOpen}
        onClose={handleClosePreview}
        title="Pré-visualização do Conteúdo"
        actions={previewActions}
        maxWidth="lg"
      >
        <Box 
          sx={{ 
            p: 3,
            bgcolor: landingPage.appearance?.backgroundColor || '#ffffff',
            color: landingPage.appearance?.textColor || '#000000',
            minHeight: '400px',
            maxHeight: '600px',
            borderRadius: 1,
            overflowY: 'auto',
            border: `1px solid ${theme.palette.divider}`
          }}
        >
          {/* Incluir Bootstrap para preview */}
          <Box 
            component="iframe"
            srcDoc={`
              <!DOCTYPE html>
              <html>
                <head>
                  <meta charset="utf-8">
                  <meta name="viewport" content="width=device-width, initial-scale=1">
                  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
                  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
                  <style>
                    body {
                      color: ${landingPage.appearance?.textColor || '#000000'};
                      background-color: ${landingPage.appearance?.backgroundColor || '#ffffff'};
                      padding: 15px;
                    }
                    img { max-width: 100%; height: auto; }
                  </style>
                </head>
                <body>
                  ${preserveHtml ? originalHtmlCode : htmlCode}
                </body>
              </html>
            `}
            sx={{
              width: '100%',
              height: '600px',
              border: 'none',
              borderRadius: 1
            }}
          />
        </Box>
      </BaseModal>
      
      {/* Diálogo do gerenciador de mídia */}
      <BaseModal
        open={mediaManagerOpen}
        onClose={handleCloseMediaManager}
        title="Gerenciador de Mídia"
        maxWidth="lg"
      >
        {landingPage && landingPage.id && (
          <FileManager
            landingPageId={landingPage.id}
            allowedTypes={['image/*', 'application/pdf', 'video/*']}
            maxFileSize={5 * 1024 * 1024} // 5MB
            multipleSelection={false}
            onFileSelect={handleFileSelect}
          />
        )}
      </BaseModal>
    </AnimatedPaper>
  );
};

export default ContentEditorTab;