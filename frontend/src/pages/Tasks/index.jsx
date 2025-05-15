import React from 'react';
import { Route, Switch, useRouteMatch } from 'react-router-dom';
import { Box } from '@mui/material';
import { i18n } from '../../translate/i18n';

// Componentes principais
import TasksPage from './components/TasksPage';

/**
 * Ponto de entrada para o módulo de Tarefas
 * Esta implementação mantém todas as funcionalidades originais,
 * apenas modernizando a interface e a experiência do usuário.
 * A página de relatórios agora está integrada diretamente na página principal.
 */
const Tasks = () => {
  const { path } = useRouteMatch();
  
  return (
    <Box sx={{ height: '100%' }}>
      <Switch>
        {/* Rota principal - página modernizada que agora inclui os relatórios */}
        <Route path={path}>
          <TasksPage />
        </Route>
      </Switch>
    </Box>
  );
};

export default Tasks;