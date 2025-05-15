import React from 'react';
import {
  Dialog,
  DialogContent,
  Typography,
  IconButton,
  Box,
  Button,
  useTheme
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DownloadIcon from '@mui/icons-material/Download';
import { styled } from '@mui/material/styles';

const DialogPaper = styled('div')(({ theme }) => ({
  borderRadius: 16,
  maxWidth: 600,
}));

const CloseButton = styled(IconButton)(({ theme }) => ({
  position: 'absolute',
  right: theme.spacing(2),
  top: theme.spacing(2),
  color: theme.palette.grey[500],
}));

const Title = styled(Typography)(({ theme }) => ({
  padding: theme.spacing(3, 3, 2),
  color: theme.palette.primary.main,
  fontWeight: 600,
}));

const Content = styled(DialogContent)(({ theme }) => ({
  padding: theme.spacing(2, 3, 3),
}));

const InstructionList = styled('ol')(({ theme }) => ({
  paddingLeft: theme.spacing(2),
  '& li': {
    marginBottom: theme.spacing(1),
  },
}));

const CodeBox = styled(Box)(({ theme }) => ({
  margin: theme.spacing(2, 0),
  borderRadius: theme.shape.borderRadius,
  overflow: 'hidden',
  backgroundColor: '#282c34',
  padding: theme.spacing(2),
  color: '#fff',
  fontFamily: 'monospace',
  whiteSpace: 'pre-wrap',
}));

const ImportantNote = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.warning.light,
  color: theme.palette.warning.dark,
  padding: theme.spacing(2),
  borderRadius: theme.shape.borderRadius,
  marginTop: theme.spacing(2),
}));

const DownloadButton = styled(Button)(({ theme }) => ({
  marginTop: theme.spacing(3),
}));

const BackupModal = ({ open, onClose, backupUrl }) => {
  const theme = useTheme();

  const handleDownload = () => {
    if (backupUrl) {
      const link = document.createElement('a');
      link.href = backupUrl.url;
      link.setAttribute('download', backupUrl.fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const restoreCommand = `pg_restore -U seu_usuario -d nome_do_banco -v caminho/para/arquivo_backup.sql`;

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      fullWidth 
      maxWidth="sm"
      PaperProps={{ sx: { borderRadius: 4 } }}
    >
      <CloseButton aria-label="close" onClick={onClose} size="large">
        <CloseIcon />
      </CloseButton>
      <Title variant="h5">
        Database Backup
      </Title>
      <Content>
        <Typography variant="body1" paragraph>
          O arquivo SQL gerado é para ser utilizado com o comando pg_restore do PostgreSQL. Siga as instruções abaixo para restaurar o backup:
        </Typography>
        <InstructionList>
          <li>Abra um terminal ou prompt de comando.</li>
          <li>Certifique-se de que o PostgreSQL está instalado e configurado corretamente.</li>
          <li>Use o seguinte comando para restaurar o backup:</li>
        </InstructionList>
        <CodeBox>
          {restoreCommand}
        </CodeBox>
        <Typography variant="body2" component="div">
          <InstructionList start="4">
            <li>Substitua "seu_usuario", "nome_do_banco" e "caminho/para/arquivo_backup.sql" com os valores apropriados.</li>
            <li>Digite a senha do PostgreSQL quando solicitado.</li>
            <li>Aguarde a conclusão do processo de restauração.</li>
          </InstructionList>
        </Typography>
        <ImportantNote>
          <Typography variant="body2" component="p">
            <strong>Importante:</strong> Certifique-se de ter permissões adequadas e faça um backup do banco de dados atual antes de realizar a restauração.
          </Typography>
        </ImportantNote>
        <DownloadButton
          onClick={handleDownload}
          color="primary"
          variant="contained"
          disabled={!backupUrl}
          startIcon={<DownloadIcon />}
          fullWidth
        >
          Download Backup
        </DownloadButton>
      </Content>
    </Dialog>
  );
};

export default BackupModal;