import React, { useState, useEffect } from "react";
import ArrowForwardIosSharpIcon from '@mui/icons-material/ArrowForwardIosSharp';
import { Paper } from '@mui/material';
import MuiAccordion from '@mui/material/Accordion';
import MuiAccordionDetails from '@mui/material/AccordionDetails';
import MuiAccordionSummary from '@mui/material/AccordionSummary';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import { makeStyles } from '@mui/styles';
import useSettings from "../../hooks/useSettings";

const useStyles = makeStyles((theme) => ({
  infoBox: {
    marginTop: theme.spacing(2),
    padding: theme.spacing(2),
    backgroundColor: theme.palette.background.default,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: theme.spacing(1),
  },
}));

const Accordion = styled((props) => (
  <MuiAccordion disableGutters elevation={0} square {...props} />
))(({ theme }) => ({
  border: `1px solid ${theme.palette.divider}`,
  '&:not(:last-child)': {
    borderBottom: 0,
  },
  '&::before': {
    display: 'none',
  },
}));

const AccordionSummary = styled((props) => (
  <MuiAccordionSummary
    expandIcon={<ArrowForwardIosSharpIcon sx={{ fontSize: '0.9rem' }} />}
    {...props}
  />
))(({ theme }) => ({
  backgroundColor: 'rgba(0, 0, 0, .03)',
  flexDirection: 'row-reverse',
  '& .MuiAccordionSummary-expandIconWrapper.Mui-expanded': {
    transform: 'rotate(90deg)',
  },
  '& .MuiAccordionSummary-content': {
    marginLeft: theme.spacing(1),
  },
  ...theme.applyStyles('dark', {
    backgroundColor: 'rgba(255, 255, 255, .05)',
  }),
}));

const AccordionDetails = styled(MuiAccordionDetails)(({ theme }) => ({
  padding: theme.spacing(2),
  borderTop: '1px solid rgba(0, 0, 0, .125)',
  display: 'flex',
  flexDirection: 'column',
}));

export default function WhiteLabelHelp() {
  const classes = useStyles();
  const { getPublicSetting } = useSettings();
  const [expanded, setExpanded] = useState();
  const [appName, setAppName] = useState("");
  useEffect(() => {
    getPublicSetting("appName").then((data) => setAppName(data));
  }, [getPublicSetting]);

  const handleChange = (panel) => (event, newExpanded) => {
    setExpanded(newExpanded ? panel : false);
  };
//
  return (
    <Paper className={classes.infoBox}>
      <Typography variant="h6" className={classes.title}>
        Guia de Customização:
      </Typography>
      <Typography variant="body2" paragraph>
        Esta tela permite personalizar vários aspectos do seu sistema. Abaixo, explicamos cada item que pode ser customizado:
      </Typography>

      <Accordion expanded={expanded === 'panel1'} onChange={handleChange('panel1')}>
        <AccordionSummary aria-controls="panel1d-content" id="panel1d-header">
          <Typography><strong>Informações Básicas</strong></Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography><strong>Nome do sistema:</strong> Este é o nome que aparecerá no topo da página e em outros lugares relevantes do sistema.</Typography>
          <Typography><strong>Copyright:</strong> O texto de direitos autorais que aparecerá no rodapé do site.</Typography>
          <Typography><strong>Link da Política de Privacidade:</strong> O endereço web onde os usuários podem ler sua política de privacidade.</Typography>
          <Typography><strong>Link dos Termos de Uso:</strong> O endereço web onde os usuários podem ler os termos de uso do seu serviço.</Typography>
        </AccordionDetails>
      </Accordion>
      <Accordion expanded={expanded === 'panel2'} onChange={handleChange('panel2')}>
        <AccordionSummary aria-controls="panel2d-content" id="panel2d-header">
          <Typography><strong>Cores do Tema</strong></Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography paragraph>Você pode personalizar várias cores para os modos claro e escuro:</Typography>
          <Typography><strong>Cor Primária:</strong> A cor principal do seu tema, usada em botões e elementos de destaque.</Typography>
          <Typography><strong>Cor Secundária:</strong> Uma cor complementar usada para acentuar certos elementos.</Typography>
          <Typography><strong>Cor do Ícone:</strong> A cor dos ícones na interface.</Typography>
          <Typography><strong>Fundo Chat Interno:</strong> A cor de fundo da área de chat.</Typography>
          <Typography><strong>Mensagens de Outros:</strong> A cor de fundo para mensagens recebidas.</Typography>
          <Typography><strong>Mensagens do Usuário:</strong> A cor de fundo para mensagens enviadas pelo usuário.</Typography>
          <Typography paragraph>Cada uma dessas cores pode ser definida separadamente para o modo claro e escuro.</Typography>
        </AccordionDetails>
      </Accordion>
      <Accordion expanded={expanded === 'panel3'} onChange={handleChange('panel3')}>
        <AccordionSummary aria-controls="panel3d-content" id="panel3d-header">
          <Typography><strong>Logotipos e Ícones</strong></Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography><strong>Logotipo Claro:</strong> O logotipo que será exibido quando o site estiver no modo claro.</Typography>
          <Typography><strong>Logotipo Escuro:</strong> O logotipo que será exibido quando o site estiver no modo escuro.</Typography>
          <Typography><strong>Favicon:</strong> O pequeno ícone que aparece na aba do navegador. É importante para a identidade visual do seu site.</Typography>
          <Typography><strong>Ícone PWA:</strong> PWA significa "Progressive Web App". Este ícone é usado quando um usuário adiciona seu site à tela inicial de um dispositivo móvel, fazendo-o parecer um aplicativo nativo.</Typography>
        </AccordionDetails>
      </Accordion>
      <Typography variant="body2" style={{ marginTop: '16px' }}>
        Para customizar, use os controles na coluna esquerda. As alterações serão exibidas em tempo real nas pré-visualizações acima.
      </Typography>
    </Paper>
  );
}