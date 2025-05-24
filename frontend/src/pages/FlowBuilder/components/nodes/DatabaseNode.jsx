import React, { memo, useCallback } from 'react';
import { Position, useReactFlow } from '@xyflow/react';
import { Box, Typography, Chip } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { 
    Storage as StorageIcon, 
    Code as CodeIcon,
    Inventory2 as SQLIcon,
    Cloud as CloudIcon
} from '@mui/icons-material';
import BaseFlowNode from './BaseFlowNode';
import { i18n } from "../../../../translate/i18n";

const DatabaseNode = ({ id, data, selected }) => {
    const theme = useTheme();
    const nodeColor = theme.palette.info?.dark || '#0369a1';
    const reactFlowInstance = useReactFlow();
    
    const handleDelete = useCallback((event) => {
        event.stopPropagation();
        reactFlowInstance.deleteElements({ nodes: [{ id }] });
    }, [id, reactFlowInstance]);
    
    const handleDuplicate = useCallback((event) => {
        event.stopPropagation();
        // Clone the current node
        const position = reactFlowInstance.getNode(id).position;
        const newNode = {
            id: `database_${Date.now()}`,
            type: 'databaseNode',
            position: {
                x: position.x + 20,
                y: position.y + 20
            },
            data: { ...data, label: `${data.label || i18n.t('flowBuilder.nodes.database', 'Banco de Dados')} (${i18n.t('flowBuilder.actions.duplicate')})` }
        };

        reactFlowInstance.addNodes(newNode);
    }, [id, data, reactFlowInstance]);
    
    const handleEdit = useCallback((event) => {
        event.stopPropagation();
        // Lógica para abrir o drawer de edição do nó
        if (data.onEdit) {
            data.onEdit(id);
        }
    }, [id, data]);
    
    // Database Node tem um handle de erro à direita (igual ao API Node)
    const getAdditionalHandles = () => {
        return [{
            id: 'error',
            type: 'source',
            position: Position.Right,
            data: { type: 'error' }
        }];
    };
    
    // Obtém o nome amigável da operação
    const getOperationName = (op) => {
        switch (op) {
            case 'get': return 'Listar';
            case 'get_document': return 'Obter';
            case 'add': return 'Adicionar';
            case 'update': return 'Atualizar';
            case 'delete': return 'Excluir';
            default: return op;
        }
    };
    
    // Obtém o nome amigável do banco de dados
    const getDatabaseName = (type) => {
        switch (type) {
            case 'firebase': return 'Firebase';
            case 'realtime': return 'Realtime DB';
            case 'postgresql': return 'PostgreSQL';
            case 'mysql': return 'MySQL/MariaDB';
            case 'firebird': return 'Firebird';
            default: return type;
        }
    };

    // Obtém o ícone do tipo de banco
    const getDatabaseIcon = () => {
        if (['firebase', 'realtime'].includes(data.databaseType)) {
            return <CloudIcon fontSize="small" />;
        } else {
            return <SQLIcon fontSize="small" />;
        }
    };
    
    // Verifica se é banco de dados NoSQL ou relacional
    const isNoSQL = ['firebase', 'realtime'].includes(data.databaseType);
    
    return (
        <BaseFlowNode
            id={id}
            type={i18n.t('flowBuilder.nodes.database', 'Banco de Dados')}
            data={data}
            selected={selected}
            icon={StorageIcon}
            color={nodeColor}
            onDelete={handleDelete}
            onDuplicate={handleDuplicate}
            onEdit={handleEdit}
            additionalHandles={getAdditionalHandles()}
        >
            {data.databaseType && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                    {getDatabaseIcon()}
                    <Chip
                        label={getDatabaseName(data.databaseType)}
                        size="small"
                        sx={{
                            bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.07)',
                            color: theme.palette.text.primary,
                            height: '22px',
                            fontSize: '0.75rem'
                        }}
                    />
                </Box>
            )}
            
            <Box
                sx={{
                    bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
                    borderRadius: 1,
                    p: 1,
                    fontSize: '0.75rem',
                    mb: 1,
                    display: 'flex',
                    gap: 0.5,
                    alignItems: 'center'
                }}
            >
                {isNoSQL ? (
                    // Display para bancos NoSQL
                    <>
                        <Typography variant="caption" fontWeight="bold">
                            {getOperationName(data.operation || 'get')}:
                        </Typography>
                        <Typography variant="caption">
                            {data.collection || 'coleção'}
                            {data.document ? `/${data.document}` : ''}
                        </Typography>
                    </>
                ) : (
                    // Display para bancos relacionais
                    <>
                        <Typography variant="caption" fontWeight="bold">
                            SQL:
                        </Typography>
                        <Typography variant="caption" noWrap sx={{ maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {data.sqlQuery ? data.sqlQuery.split('\n')[0] : 'Consulta SQL'}
                        </Typography>
                    </>
                )}
            </Box>

            {data.responseVariable && (
                <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center', mb: 1 }}>
                    <CodeIcon fontSize="small" sx={{ opacity: 0.7, width: 16, height: 16 }} />
                    <Typography variant="caption">
                        → {data.responseVariable}
                    </Typography>
                </Box>
            )}

            {isNoSQL && data.whereConditions && data.whereConditions.length > 0 && (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
                    <Typography variant="caption" sx={{ width: '100%', color: 'text.secondary' }}>
                        Filtros:
                    </Typography>
                    {data.whereConditions.slice(0, 2).map((condition, index) => (
                        <Chip
                            key={index}
                            label={`${condition.field} ${condition.operator}`}
                            size="small"
                            sx={{
                                height: '20px',
                                fontSize: '0.7rem',
                                bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.07)' : 'rgba(0, 0, 0, 0.05)'
                            }}
                        />
                    ))}
                    {data.whereConditions.length > 2 && (
                        <Chip
                            label={`+${data.whereConditions.length - 2}`}
                            size="small"
                            sx={{
                                height: '20px',
                                fontSize: '0.7rem',
                                bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.07)' : 'rgba(0, 0, 0, 0.05)'
                            }}
                        />
                    )}
                </Box>
            )}

            {!isNoSQL && data.sqlParams && data.sqlParams.length > 0 && (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
                    <Typography variant="caption" sx={{ width: '100%', color: 'text.secondary' }}>
                        Parâmetros:
                    </Typography>
                    {data.sqlParams.slice(0, 2).map((param, index) => (
                        <Chip
                            key={index}
                            label={`:${param.name}`}
                            size="small"
                            sx={{
                                height: '20px',
                                fontSize: '0.7rem',
                                bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.07)' : 'rgba(0, 0, 0, 0.05)'
                            }}
                        />
                    ))}
                    {data.sqlParams.length > 2 && (
                        <Chip
                            label={`+${data.sqlParams.length - 2}`}
                            size="small"
                            sx={{
                                height: '20px',
                                fontSize: '0.7rem',
                                bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.07)' : 'rgba(0, 0, 0, 0.05)'
                            }}
                        />
                    )}
                </Box>
            )}

            <Box sx={{ mt: 2, pt: 1, borderTop: `1px dashed ${theme.palette.divider}` }}>
                <Typography variant="caption" color="text.secondary">
                    ↳ {i18n.t('flowBuilder.outputs.title', 'Saídas')}:
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mt: 0.5 }}>
                    <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center' }}>
                        <Box component="span" sx={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            bgcolor: theme.palette.success.main,
                            mr: 0.5
                        }} />
                        {i18n.t('flowBuilder.outputs.success')} ({i18n.t('flowBuilder.outputs.below')})
                    </Typography>
                    <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center' }}>
                        <Box component="span" sx={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            bgcolor: theme.palette.error.main,
                            mr: 0.5
                        }} />
                        {i18n.t('flowBuilder.outputs.error')} ({i18n.t('flowBuilder.outputs.right')})
                    </Typography>
                </Box>
            </Box>
        </BaseFlowNode>
    );
};

export default memo(DatabaseNode);