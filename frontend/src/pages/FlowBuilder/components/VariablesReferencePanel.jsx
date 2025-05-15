import React from 'react';
import { Box, Typography, Paper, Chip } from '@mui/material';
import CodeIcon from '@mui/icons-material/Code';
import { useTheme } from '@mui/material/styles';

// Componente VariablesReferencePanel para ser usado nos drawers
export const VariablesReferencePanel = ({ variables }) => {
    const theme = useTheme();
    
    if (!variables || variables.length === 0) {
      return (
        <Box sx={{ mt: 2, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
          <Typography variant="caption" color="text.secondary">
            Não há variáveis definidas no fluxo. Adicione nós de pergunta para definir variáveis.
          </Typography>
        </Box>
      );
    }
    
    return (
      <Box sx={{ mt: 2 }}>
        <Typography variant="subtitle2" gutterBottom>
          <CodeIcon fontSize="small" sx={{ mr: 0.5, verticalAlign: 'text-bottom' }} />
          Variáveis Disponíveis
        </Typography>
        <Paper variant="outlined" sx={{ p: 1, maxHeight: 200, overflow: 'auto' }}>
          {variables.map((variable) => (
            <Chip
              key={variable.name}
              label={`\${${variable.name}}`}
              size="small"
              variant="outlined"
              color="primary"
              icon={<CodeIcon fontSize="small" />}
              onClick={() => navigator.clipboard.writeText(`\${${variable.name}}`)}
              sx={{ m: 0.5, cursor: 'pointer' }}
            />
          ))}
        </Paper>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
          Clique em uma variável para copiá-la. Use o formato ${'{'}variavel{'}'} nos textos para substituir pelo valor da variável.
        </Typography>
      </Box>
    );
  };