import React, { useState, useEffect, useContext } from 'react';
import { makeStyles } from '@mui/styles';
import { useTheme } from '@mui/material/styles';
import { 
  Paper, 
  Typography, 
  Button, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  IconButton,
  TextField,
  InputAdornment,
  Tooltip,
  Chip,
  Box,
  Tabs,
  Tab,
  Pagination,
  Switch,
  LinearProgress,
  Fade
} from '@mui/material';
import { 
  Add as AddIcon, 
  Search as SearchIcon, 
  Edit as EditIcon, 
  Delete as DeleteIcon,
  CheckCircle as ActiveIcon,
  Cancel as InactiveIcon,
  Rule as RuleIcon,
  FilterAlt as FilterIcon,
  Close as CloseIcon,
  AllInclusive as AllConnectionsIcon,
  ImportExport as PriorityIcon,
  AssignmentInd as UserIcon,
  ForwardToInbox as QueueIcon
} from '@mui/icons-material';
import { useSpring, animated } from 'react-spring';
import { i18n } from '../../translate/i18n';
import MainContainer from '../../components/MainContainer';
import MessageRuleModal from './components/MessageRuleModal';
import ConfirmationModal from '../../components/ConfirmationModal';
import EmptyStateMessageRules from './components/EmptyStateMessageRules';
import useMessageRules from '../../hooks/useMessageRules';
import './MessageRules.css';

const useStyles = makeStyles((theme) => ({
  mainPaper: {
    flex: 1,
    padding: theme.spacing(2),
    margin: theme.spacing(1),
    position: 'relative',
    overflow: 'hidden',
    borderRadius: 16,
    boxShadow: 'rgba(17, 17, 26, 0.05) 0px 1px 0px, rgba(17, 17, 26, 0.1) 0px 0px 8px'
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing(2),
  },
  headerTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    color: theme.palette.primary.main
  },
  tableHeaderCell: {
    fontWeight: 'bold',
    backgroundColor: theme.palette.background.default,
    color: theme.palette.primary.main
  },
  actionButtons: {
    display: 'flex',
    gap: theme.spacing(1)
  },
  tabsContainer: {
    marginBottom: theme.spacing(2),
    borderRadius: 8,
    overflow: 'hidden',
    boxShadow: 'rgba(0, 0, 0, 0.05) 0px 1px 2px 0px'
  },
  tabs: {
    backgroundColor: theme.palette.background.paper,
    borderRadius: 8
  },
  tab: {
    minHeight: 60,
    textTransform: 'none',
    fontWeight: 500,
    fontSize: '1rem'
  },
  paginationContainer: {
    display: 'flex',
    justifyContent: 'center',
    marginTop: theme.spacing(2),
    padding: theme.spacing(2)
  },
  searchContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    marginBottom: theme.spacing(2)
  },
  searchInput: {
    flex: 1,
    backgroundColor: theme.palette.background.paper,
    borderRadius: 8
  },
  addButton: {
    borderRadius: 8,
    textTransform: 'none',
    padding: theme.spacing(1.2, 2),
    fontWeight: 'bold',
    boxShadow: theme.shadows[3]
  },
  addButtonIcon: {
    marginRight: theme.spacing(1)
  },
  noRecords: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing(4),
    color: theme.palette.text.secondary
  },
  tableRowHover: {
    '&:hover': {
      backgroundColor: `${theme.palette.primary.lighter} !important`,
      transition: 'all 0.2s'
    }
  },
  statusColumnHeader: {
    width: 120
  },
  priorityColumnHeader: {
    width: 100
  },
  actionsColumnHeader: {
    width: 100
  },
  progressBarContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1
  },
  priorityChip: {
    fontWeight: 'bold',
    width: 50
  },
  tagChip: {
    margin: 2,
    color: '#FFF',
    fontWeight: 'bold'
  },
  tableContainer: {
    marginBottom: theme.spacing(2),
    boxShadow: 'rgba(0, 0, 0, 0.04) 0px 3px 5px'
  },
  tableCell: {
    padding: theme.spacing(1.5)
  },
  iconText: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(0.5)
  },
  connectionCell: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(0.5)
  },
  breadcrumbsContainer: {
    marginBottom: theme.spacing(2),
    padding: theme.spacing(0.5, 0)
  },
  clearButton: {
    minWidth: 'auto',
    padding: theme.spacing(0.5),
    marginRight: theme.spacing(0.5)
  }
}));

const MessageRulesPage = () => {
  const classes = useStyles();
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

  // Animações
  const fadeIn = useSpring({
    from: { opacity: 0 },
    to: { opacity: 1 },
    config: { tension: 280, friction: 60 }
  });

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
        className={classes.priorityChip}
        style={{ backgroundColor: color }}
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
            className={classes.tagChip}
            style={{ backgroundColor: renderTagColor(tagId, allTags) }}
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

  const handleClearSearch = () => {
    handleSearch('');
  };

  return (
    <MainContainer>
      <animated.div style={fadeIn}>
        <Paper className={classes.mainPaper}>
          {loading && (
            <div className={classes.progressBarContainer}>
              <LinearProgress color="primary" />
            </div>
          )}
          
          <div className={classes.header}>
            <div className={classes.headerTitle}>
              <RuleIcon fontSize="large" />
              <Typography variant="h5" component="h1">
                {i18n.t('messageRules.title')}
              </Typography>
            </div>

            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon className={classes.addButtonIcon} />}
              onClick={handleOpenMessageRuleModal}
              className={classes.addButton}
              size="large"
            >
              {i18n.t('messageRules.buttons.add')}
            </Button>
          </div>

          <div className={classes.searchContainer}>
            <TextField
              className={classes.searchInput}
              placeholder={i18n.t('messageRules.searchPlaceholder')}
              value={searchParam}
              onChange={(e) => handleSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="primary" />
                  </InputAdornment>
                ),
                endAdornment: searchParam ? (
                  <InputAdornment position="end">
                    <IconButton 
                      onClick={handleClearSearch}
                      size="small"
                      className={classes.clearButton}
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ) : null
              }}
              variant="outlined"
              size="small"
            />
          </div>

          <Paper className={classes.tabsContainer}>
            <Tabs
              value={activeFilter === undefined ? 0 : activeFilter ? 1 : 2}
              onChange={(_, newValue) => handleFilterChange(newValue)}
              indicatorColor="primary"
              textColor="primary"
              variant="fullWidth"
              className={classes.tabs}
            >
              <Tab 
                icon={<FilterIcon />} 
                label={i18n.t('messageRules.tabs.all')} 
                className={classes.tab}
              />
              <Tab 
                icon={<ActiveIcon />} 
                label={i18n.t('messageRules.tabs.active')} 
                className={classes.tab}
              />
              <Tab 
                icon={<InactiveIcon />} 
                label={i18n.t('messageRules.tabs.inactive')} 
                className={classes.tab}
              />
            </Tabs>
          </Paper>

          {loading && messageRules.length === 0 ? (
            <Box p={8} display="flex" justifyContent="center">
              <LinearProgress style={{ width: '50%' }} />
            </Box>
          ) : messageRules.length === 0 ? (
            searchParam || activeFilter !== undefined ? (
              <Box className={classes.noRecords}>
                <Typography variant="body1" color="textSecondary">
                  {i18n.t('messageRules.noRecords')}
                </Typography>
              </Box>
            ) : (
              <EmptyStateMessageRules onAddClick={handleOpenMessageRuleModal} />
            )
          ) : (
            <Fade in={true} timeout={500}>
              <div>
                <TableContainer className={classes.tableContainer}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell className={classes.tableHeaderCell}>{i18n.t('messageRules.table.name')}</TableCell>
                        <TableCell className={classes.tableHeaderCell}>{i18n.t('messageRules.table.pattern')}</TableCell>
                        <TableCell className={classes.tableHeaderCell}>
                          <div className={classes.iconText}>
                            <AllConnectionsIcon fontSize="small" />
                            {i18n.t('messageRules.table.connection')}
                          </div>
                        </TableCell>
                        <TableCell className={classes.tableHeaderCell}>
                          <div className={classes.iconText}>
                            <QueueIcon fontSize="small" />
                            {i18n.t('messageRules.table.queue')}
                          </div>
                        </TableCell>
                        <TableCell className={classes.tableHeaderCell}>
                          <div className={classes.iconText}>
                            <UserIcon fontSize="small" />
                            {i18n.t('messageRules.table.user')}
                          </div>
                        </TableCell>
                        <TableCell className={classes.tableHeaderCell}>{i18n.t('messageRules.table.tags')}</TableCell>
                        <TableCell className={`${classes.tableHeaderCell} ${classes.priorityColumnHeader}`}>
                          <div className={classes.iconText}>
                            <PriorityIcon fontSize="small" />
                            {i18n.t('messageRules.table.priority')}
                          </div>
                        </TableCell>
                        <TableCell className={`${classes.tableHeaderCell} ${classes.statusColumnHeader}`}>{i18n.t('messageRules.table.status')}</TableCell>
                        <TableCell className={`${classes.tableHeaderCell} ${classes.actionsColumnHeader}`} align="center">{i18n.t('messageRules.table.actions')}</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {messageRules.map((rule) => (
                        <TableRow 
                          key={rule.id} 
                          hover 
                          className={classes.tableRowHover}
                        >
                          <TableCell className={classes.tableCell}>{rule.name}</TableCell>
                          <TableCell className={classes.tableCell}>
                            <Tooltip 
                              title={<div style={{ whiteSpace: 'pre-wrap' }}>{rule.pattern}</div>}
                              placement="top" 
                              arrow
                            >
                              <Typography noWrap style={{ maxWidth: 150 }}>
                                {rule.pattern}
                              </Typography>
                            </Tooltip>
                          </TableCell>
                          <TableCell className={classes.tableCell}>
                            <div className={classes.connectionCell}>
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
                                <span className={classes.iconText}>
                                  <AllConnectionsIcon fontSize="small" color="action" />
                                  {i18n.t('messageRules.allConnections')}
                                </span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className={classes.tableCell}>
                            {rule.queue ? (
                              <Chip 
                                label={rule.queue.name} 
                                size="small" 
                                style={{ 
                                  backgroundColor: rule.queue.color || theme.palette.primary.light,
                                  color: '#FFF',
                                  fontWeight: 'bold'
                                }} 
                              />
                            ) : (
                              '-'
                            )}
                          </TableCell>
                          <TableCell className={classes.tableCell}>
                            {rule.user ? rule.user.name : '-'}
                          </TableCell>
                          <TableCell className={classes.tableCell}>
                            {renderTags(rule.tags, messageRules.reduce((acc, curr) => [...acc, ...(curr.tags?.split(',').map(id => parseInt(id.trim(), 10)) || [])], []).map(id => ({ id, name: `Tag ${id}`, color: '#888' })))}
                          </TableCell>
                          <TableCell className={classes.tableCell} align="center">
                            {renderPriorityChip(rule.priority)}
                          </TableCell>
                          <TableCell className={classes.tableCell}>
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
                          <TableCell className={classes.tableCell} align="center">
                            <Box className={classes.actionButtons}>
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
                                  color="secondary"
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

                {count > 0 && (
                  <Box className={classes.paginationContainer}>
                    <Pagination 
                      count={Math.ceil(count / 20)} 
                      page={pageNumber} 
                      onChange={(_, page) => handlePageChange(page)} 
                      color="primary" 
                      size="large"
                      showFirstButton
                      showLastButton
                    />
                  </Box>
                )}
              </div>
            </Fade>
          )}
        </Paper>
      </animated.div>

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
    </MainContainer>
  );
};

export default MessageRulesPage;