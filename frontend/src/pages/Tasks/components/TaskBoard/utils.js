/**
 * Reordena uma lista de tarefas dentro da mesma coluna
 * @param {Array} taskIds - Lista de IDs de tarefas
 * @param {Number} startIndex - Índice de origem
 * @param {Number} endIndex - Índice de destino
 * @returns {Array} - Nova lista de IDs reordenada
 */
export const reorderTasks = (taskIds, startIndex, endIndex) => {
  if (!Array.isArray(taskIds)) {
    console.warn('taskIds não é um array válido:', taskIds);
    return [];
  }
  
  const result = Array.from(taskIds);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
};

/**
 * Move uma tarefa entre colunas
 * @param {Object} columns - Objeto com todas as colunas
 * @param {Object} source - Objeto com informações da coluna de origem
 * @param {Object} destination - Objeto com informações da coluna de destino
 * @param {String} draggableId - ID da tarefa que está sendo movida
 * @returns {Object} - Novo objeto de colunas com a tarefa movida
 */
export const moveBetweenColumns = (columns, source, destination, draggableId) => {
  // Verificar se os parâmetros são válidos
  if (!columns || !source || !destination || !draggableId) {
    console.warn('Parâmetros inválidos para moveBetweenColumns');
    return columns;
  }
  
  // Criar cópias das colunas de origem e destino
  const sourceColumn = columns[source.droppableId];
  const destColumn = columns[destination.droppableId];
  
  // Verificar se as colunas são válidas
  if (!sourceColumn || !destColumn) {
    console.warn('Colunas de origem ou destino inválidas');
    return columns;
  }
  
  // Criar cópias das listas de IDs
  const sourceTaskIds = Array.isArray(sourceColumn.taskIds) ? Array.from(sourceColumn.taskIds) : [];
  const destTaskIds = Array.isArray(destColumn.taskIds) ? Array.from(destColumn.taskIds) : [];
  
  // Encontrar a tarefa sendo movida
  const task = sourceColumn.tasks?.find(t => t && t.id && t.id.toString() === draggableId);
  if (!task) return columns;
  
  // Remover a tarefa da coluna de origem
  sourceTaskIds.splice(source.index, 1);
  
  // Adicionar a tarefa na coluna de destino
  destTaskIds.splice(destination.index, 0, draggableId);
  
  // Atualizar as listas de tarefas das colunas
  const sourceTasksUpdated = Array.isArray(sourceColumn.tasks) ? 
    sourceColumn.tasks.filter(t => t && t.id && t.id.toString() !== draggableId) : [];
    
  const destTasksUpdated = Array.isArray(destColumn.tasks) ? [...destColumn.tasks] : [];
  
  // Inserir a tarefa na posição correta da lista de tarefas de destino
  if (Array.isArray(destTasksUpdated)) {
    destTasksUpdated.splice(destination.index, 0, task);
  }
  
  // Criar o novo objeto de colunas
  const newColumns = {
    ...columns,
    [source.droppableId]: {
      ...sourceColumn,
      taskIds: sourceTaskIds,
      tasks: sourceTasksUpdated
    },
    [destination.droppableId]: {
      ...destColumn,
      taskIds: destTaskIds,
      tasks: destTasksUpdated
    }
  };
  
  return newColumns;
};

/**
 * Formata a data de vencimento para exibição
 * @param {Date} dueDate - Data de vencimento
 * @param {Object} i18n - Objeto de internacionalização
 * @returns {String} - String formatada para exibição
 */
export const formatDueDate = (dueDate, i18n) => {
  if (!dueDate) return '';
  
  try {
    const today = new Date();
    const dueDateObj = new Date(dueDate);
    
    // Removendo informações de hora para comparar apenas as datas
    today.setHours(0, 0, 0, 0);
    dueDateObj.setHours(0, 0, 0, 0);
    
    // Calcular a diferença em dias
    const diffTime = dueDateObj.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return i18n.t('tasks.dueToday');
    } else if (diffDays === 1) {
      return i18n.t('tasks.dueTomorrow');
    } else if (diffDays === -1) {
      return i18n.t('tasks.dueYesterday');
    } else if (diffDays < 0) {
      return i18n.t('tasks.overdueDays', { days: Math.abs(diffDays) });
    } else if (diffDays <= 7) {
      return i18n.t('tasks.dueInDays', { days: diffDays });
    } else {
      // Formatar a data no padrão DD/MM/YYYY
      return dueDateObj.toLocaleDateString('pt-BR');
    }
  } catch (error) {
    console.error('Erro ao formatar data:', error);
    return '';
  }
};

/**
 * Verifica se uma tarefa está atrasada
 * @param {Object} task - Objeto da tarefa
 * @returns {Boolean} - Verdadeiro se a tarefa estiver atrasada
 */
export const isTaskOverdue = (task) => {
  if (!task || !task.dueDate || task.done) return false;
  
  try {
    const today = new Date();
    const dueDate = new Date(task.dueDate);
    
    // Removendo informações de hora para comparar apenas as datas
    today.setHours(0, 0, 0, 0);
    dueDate.setHours(0, 0, 0, 0);
    
    return dueDate < today;
  } catch (error) {
    console.error('Erro ao verificar data:', error);
    return false;
  }
};

/**
 * Obtém as iniciais de um nome
 * @param {String} name - Nome completo
 * @returns {String} - Iniciais (até 2 caracteres)
 */
export const getInitials = (name) => {
  if (!name) return '?';
  
  try {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  } catch (error) {
    console.error('Erro ao obter iniciais:', error);
    return '?';
  }
};

export const isSafeTask = (task) => {
  return task && 
         typeof task === 'object' && 
         task.id !== undefined && 
         task.id !== null;
};

/**
 * Ordena tarefas com base em um critério
 * @param {Array} tasks - Lista de tarefas
 * @param {String} criterion - Critério de ordenação ('dueDate', 'title', 'priority')
 * @param {Boolean} ascending - Ordem ascendente (true) ou descendente (false)
 * @returns {Array} - Lista de tarefas ordenada
 */
export const sortTasks = (tasks, criterion, ascending = true) => {
  if (!Array.isArray(tasks)) {
    return [];
  }
  
  const sortedTasks = [...tasks];
  
  try {
    switch (criterion) {
      case 'dueDate':
        sortedTasks.sort((a, b) => {
          if (!a || !a.dueDate) return ascending ? 1 : -1;
          if (!b || !b.dueDate) return ascending ? -1 : 1;
          
          const dateA = new Date(a.dueDate).getTime();
          const dateB = new Date(b.dueDate).getTime();
          
          return ascending ? dateA - dateB : dateB - dateA;
        });
        break;
        
      case 'title':
        sortedTasks.sort((a, b) => {
          if (!a || !a.title) return ascending ? 1 : -1;
          if (!b || !b.title) return ascending ? -1 : 1;
          
          const titleA = a.title.toLowerCase();
          const titleB = b.title.toLowerCase();
          
          return ascending
            ? titleA.localeCompare(titleB)
            : titleB.localeCompare(titleA);
        });
        break;
        
      case 'priority':
        sortedTasks.sort((a, b) => {
          const priorityOrder = { high: 3, medium: 2, low: 1, none: 0 };
          const priorityA = priorityOrder[a?.priority || 'none'];
          const priorityB = priorityOrder[b?.priority || 'none'];
          
          return ascending
            ? priorityB - priorityA
            : priorityA - priorityB;
        });
        break;
        
      default:
        // Por padrão, ordenar por data de criação
        sortedTasks.sort((a, b) => {
          if (!a || !a.createdAt) return ascending ? 1 : -1;
          if (!b || !b.createdAt) return ascending ? -1 : 1;
          
          const dateA = new Date(a.createdAt).getTime();
          const dateB = new Date(b.createdAt).getTime();
          
          return ascending ? dateA - dateB : dateB - dateA;
        });
    }
  } catch (error) {
    console.error('Erro ao ordenar tarefas:', error);
  }
  
  return sortedTasks;
};