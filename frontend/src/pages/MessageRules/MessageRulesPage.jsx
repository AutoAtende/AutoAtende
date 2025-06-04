import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  Chip,
  Box,
  Switch,
  LinearProgress,
  Typography,
  Button
} from '@mui/material';
import { 
  Add as AddIcon, 
  Edit as EditIcon, 
  Delete as DeleteIcon,
  CheckCircle as ActiveIcon,
  Cancel as InactiveIcon,
  Rule as RuleIcon,
  DeleteSweep as DeleteSweepIcon,
  AllInclusive as AllConnectionsIcon,
  ImportExport as PriorityIcon,
  AssignmentInd as UserIcon,
  ForwardToInbox as QueueIcon
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';

// Componentes
import StandardPageLayout from '../../components/shared/StandardPageLayout';
import { i18n } from '../../translate/i18n';
import MessageRuleModal from './components/MessageRuleModal';
import ConfirmationModal from '../../components/ConfirmationModal';
import EmptyStateMessageRules from './components/EmptyStateMessageRules';
import useMessageRules from '../../hooks/useMessageRules';

const MessageRulesPage = () => {
  const theme = useTheme();
  
  const {
    messageRules,
    loading,
    hasMore,
    count,
    searchParam,
    pageNumber,
    activeFilter,
    handleSearch,
    handlePageChange,
    handleFilterChange,
    handleToggleActive,
    handleDelete,
    refresh
  } = useMessageRules();

  const [selectedMessageRule, setSelectedMessageRule] = useState(null);
  const [messageRuleModalOpen, setMessageRuleModalOpen] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [confirmationMessageRuleId, setConfirmationMessageRuleId] = useState(null);
  const [selectedRules, setSelectedRules] = useState([]);
  const [activeTab, setActiveTab] = useState(0);

  // Formatadores
  const renderPriorityChip = (priority) => {
    let color;
    if (priority >= 70) {
      color = theme.palette.error.main;
    } else if (priority >= 40) {
      color = theme.palette.warning.main;
    } else {
      color = theme.palette.success.main;
    }

    return (
      <Chip 
        label={priority} 
        size="small" 
        sx={{
          backgroundColor: color,
          color: 'white',
          fontWeight: 'bold',
          width: 50
        }}
      />
    );
  };

  const renderTagName = (tagId, allTags) => {
    const tag = allTags.find(t => t.id === parseInt(tagId));
    return tag?.name || `Tag ${tagId}`;
  };

  const renderTagColor = (tagId, allTags) => {
    const tag = allTags.find(t => t.id === parseInt(tagId));
    return tag?.color || '#888';
  };

  const renderTags = (tagsString, allTags) => {
    if (!tagsString || !allTags?.length) return null;
    
    const tagIds = tagsString.split(',');
    return (
      <Box display="flex" flexWrap="wrap" gap={0.5}>
        {tagIds.map((tagId) => (
          <Chip 
            key={tagId} 
            label={renderTagName(tagId, allTags)} 
            size="small" 
            sx={{
              backgroundColor: renderTagColor(tagId, allTags),
              color: '#FFF',
              fontWeight: 'bold',
              margin: '2px'
            }}
          />
        ))}
      </Box>
    );
  };

  // Handlers
  const handleOpenMessageRuleModal = () => {
    setSelectedMessageRule(null);
    setMessageRuleModalOpen(true);
  };

  const handleEditMessageRule = (messageRule) => {
    setSelectedMessageRule(messageRule);
    setMessageRuleModalOpen(true);
  };

  const handleCloseMessageRuleModal = () => {
    setMessageRuleModalOpen(false);
    setSelectedMessageRule(null);
  };

  const handleOpenConfirmModal = (id) => {
    setConfirmationMessageRuleId(id);
    setConfirmModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    await handleDelete(confirmationMessageRuleId);
    setConfirmModalOpen(false);
  };

  const handleBulkDelete = async () => {
    // Implementar exclusão em massa se necessário
    console.log('Bulk delete:', selectedRules);
  };

  // Filtrar regras baseado na aba ativa
  const getFilteredRules = () => {
    switch (activeTab) {
      case 1: // Ativas
        return messageRules.filter(rule => rule.active);
      case 2: // Inativas
        return messageRules.filter(rule => !rule.active);
      default: // Todas
        return messageRules;
    }
  };

  const filteredRules = getFilteredRules();

  // Configuração das ações do cabeçalho
  const pageActions = [
    ...(selectedRules.length > 0 ? [
      {
        label: i18n.t("messageRules.deleteSelected"),
        icon: <DeleteSweepIcon />,
        onClick: handleBulkDelete,
        variant: "contained",
        color: "error",
        tooltip: "Excluir regras selecionadas"
      }
    ] : []),
    {
      label: i18n.t('messageRules.buttons.add'),
      icon: <AddIcon />,
      onClick: handleOpenMessageRuleModal,
      variant: "contained",
      color: "primary",
      tooltip: "Adicionar nova regra"
    }
  ];

  // Configuração das abas
  const tabs = [
    {
      label: `${i18n.t('messageRules.tabs.all')} (${messageRules.length})`,
      icon: <RuleIcon />
    },
    {
      label: `${i18n.t('messageRules.tabs.active')} (${messageRules.filter(r => r.active).length})`,
      icon: <ActiveIcon />
    },
    {
      label: `${i18n.t('messageRules.tabs.inactive')} (${messageRules.filter(r => !r.active).length})`,
      icon: <InactiveIcon />
    }
  ];

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    // Mapear aba para filtro
    const filterMap = [undefined, true, false];
    handleFilterChange(filterMap[newValue]);
  };

  return (
    <>
      <StandardPageLayout
        title={i18n.t('messageRules.title')}
        actions={pageActions}
        searchValue={searchParam}
        onSearchChange={(e) => handleSearch(e.target.value)}
        searchPlaceholder={i18n.t('messageRules.searchPlaceholder')}
        showSearch={true}
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        loading={loading}
      >
        {loading && messageRules.length === 0 ? (
          <Box sx={{ width: '100%' }}>
            <LinearProgress />
          </Box>
        ) : filteredRules.length === 0 ? (
          searchParam || activeFilter !== undefined ? (
            <Box 
              display="flex" 
              justifyContent="center" 
              alignItems="center" 
              sx={{ height: '100%', p: 4 }}
            >
              <Typography variant="body1" color="textSecondary">
                {i18n.t('messageRules.noRecords')}
              </Typography>
            </Box>
          ) : (
            <EmptyStateMessageRules onAddClick={handleOpenMessageRuleModal} />
          )
        ) : (
          <TableContainer sx={{ height: '100%', overflow: 'auto' }}>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  <TableCell>{i18n.t('messageRules.table.name')}</TableCell>
                  <TableCell>{i18n.t('messageRules.table.pattern')}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <AllConnectionsIcon fontSize="small" />
                      {i18n.t('messageRules.table.connection')}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <QueueIcon fontSize="small" />
                      {i18n.t('messageRules.table.queue')}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <UserIcon fontSize="small" />
                      {i18n.t('messageRules.table.user')}
                    </Box>
                  </TableCell>
                  <TableCell>{i18n.t('messageRules.table.tags')}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <PriorityIcon fontSize="small" />
                      {i18n.t('messageRules.table.priority')}
                    </Box>
                  </TableCell>
                  <TableCell>{i18n.t('messageRules.table.status')}</TableCell>
                  <TableCell align="center">{i18n.t('messageRules.table.actions')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredRules.map((rule) => (
                  <TableRow key={rule.id} hover>
                    <TableCell>{rule.name}</TableCell>
                    <TableCell>
                      <Tooltip 
                        title={<div style={{ whiteSpace: 'pre-wrap' }}>{rule.pattern}</div>}
                        placement="top" 
                        arrow
                      >
                        <Typography 
                          noWrap 
                          sx={{ 
                            maxWidth: 150,
                            cursor: 'help'
                          }}
                        >
                          {rule.pattern}
                        </Typography>
                      </Tooltip>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {rule.whatsapp ? (
                          <>
                            <Box 
                              sx={{ 
                                width: 8, 
                                height: 8, 
                                borderRadius: '50%', 
                                backgroundColor: rule.whatsapp.color || theme.palette.primary.main, 
                                marginRight: 1 
                              }} 
                            />
                            {rule.whatsapp.name}
                          </>
                        ) : (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <AllConnectionsIcon fontSize="small" color="action" />
                            {i18n.t('messageRules.allConnections')}
                          </Box>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      {rule.queue ? (
                        <Chip 
                          label={rule.queue.name} 
                          size="small" 
                          sx={{ 
                            backgroundColor: rule.queue.color || theme.palette.primary.light,
                            color: '#FFF',
                            fontWeight: 'bold'
                          }} 
                        />
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell>
                      {rule.user ? rule.user.name : '-'}
                    </TableCell>
                    <TableCell>
                      {renderTags(rule.tags, messageRules.reduce((acc, curr) => [...acc, ...(curr.tags?.split(',').map(id => parseInt(id.trim(), 10)) || [])], []).map(id => ({ id, name: `Tag ${id}`, color: '#888' })))}
                    </TableCell>
                    <TableCell align="center">
                      {renderPriorityChip(rule.priority)}
                    </TableCell>
                    <TableCell>
                      {rule.active ? (
                        <Chip 
                          icon={<ActiveIcon fontSize="small" />} 
                          label={i18n.t('messageRules.active')} 
                          color="success" 
                          size="small" 
                          variant="outlined"
                        />
                      ) : (
                        <Chip 
                          icon={<InactiveIcon fontSize="small" />} 
                          label={i18n.t('messageRules.inactive')} 
                          color="error" 
                          size="small" 
                          variant="outlined"
                        />
                      )}
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                        <Tooltip title={i18n.t('messageRules.buttons.edit')} arrow>
                          <IconButton 
                            size="small" 
                            onClick={() => handleEditMessageRule(rule)}
                            color="primary"
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={i18n.t('messageRules.buttons.delete')} arrow>
                          <IconButton 
                            size="small" 
                            onClick={() => handleOpenConfirmModal(rule.id)}
                            color="error"
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip 
                          title={
                            rule.active 
                              ? i18n.t('messageRules.buttons.deactivate') 
                              : i18n.t('messageRules.buttons.activate')
                          }
                          arrow
                        >
                          <Switch
                            checked={rule.active}
                            onChange={() => handleToggleActive(rule.id, rule.active)}
                            color="primary"
                            size="small"
                          />
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </StandardPageLayout>

      {/* Modais */}
      <MessageRuleModal
        open={messageRuleModalOpen}
        onClose={handleCloseMessageRuleModal}
        messageRule={selectedMessageRule}
        onSave={refresh}
      />

      <ConfirmationModal
        title={i18n.t('messageRules.confirmModal.title')}
        open={confirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        onConfirm={handleConfirmDelete}
      >
        {i18n.t('messageRules.confirmModal.message')}
      </ConfirmationModal>
    </>
  );
};

export default MessageRulesPage;