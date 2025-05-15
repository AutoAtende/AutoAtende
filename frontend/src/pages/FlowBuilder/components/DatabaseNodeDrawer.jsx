import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Button,
    IconButton,
    CircularProgress,
    Paper,
    Alert,
    Tab,
    Tabs,
    Switch,
    FormControlLabel,
    Divider,
    InputAdornment,
    Tooltip,
    Chip
} from '@mui/material';
import {
    Add as AddIcon,
    Delete as DeleteIcon,
    Code as CodeIcon,
    Storage as StorageIcon,
    ExpandMore as ExpandMoreIcon,
    Visibility as VisibilityIcon,
    VisibilityOff as VisibilityOffIcon,
    PlayArrow as TestIcon,
    InfoOutlined as InfoIcon
} from '@mui/icons-material';
import { i18n } from '../../../translate/i18n';
import api from '../../../services/api';
import { VariablesReferencePanel } from './VariablesReferencePanel';
const TabPanel = (props) => {
    const { children, value, index, ...other } = props;
    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`database-tabpanel-${index}`}
            aria-labelledby={`database-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box sx={{ p: 1 }}>
                    {children}
                </Box>
            )}
        </div>
    );
};

const DatabaseNodeDrawer = ({ nodeData, onChange, flowVariables }) => {
    const [tabValue, setTabValue] = useState(0);
    const [databaseType, setDatabaseType] = useState(nodeData.databaseType || 'firebase');
    const [operation, setOperation] = useState(nodeData.operation || 'get');
    const [collection, setCollection] = useState(nodeData.collection || '');
    const [document, setDocument] = useState(nodeData.document || '');
    const [whereConditions, setWhereConditions] = useState(nodeData.whereConditions || []);
    const [newWhereField, setNewWhereField] = useState('');
    const [newWhereOperator, setNewWhereOperator] = useState('==');
    const [newWhereValue, setNewWhereValue] = useState('');
    const [orderBy, setOrderBy] = useState(nodeData.orderBy || { field: '', direction: 'asc' });
    const [limit, setLimit] = useState(nodeData.limit || 10);
    const [responseVariable, setResponseVariable] = useState(nodeData.responseVariable || '');
    const [credentials, setCredentials] = useState(nodeData.credentials || '');
    const [showCredentials, setShowCredentials] = useState(false);
    const [validationErrors, setValidationErrors] = useState({});
    const [testResult, setTestResult] = useState(null);
    const [testLoading, setTestLoading] = useState(false);
    const [dataToWrite, setDataToWrite] = useState(nodeData.dataToWrite || '');
    const [useVariableForData, setUseVariableForData] = useState(nodeData.useVariableForData || false);
    const [dataVariable, setDataVariable] = useState(nodeData.dataVariable || '');

    // Novos estados para bancos relacionais
    const [host, setHost] = useState(nodeData.host || '');
    const [port, setPort] = useState(nodeData.port || '');
    const [database, setDatabase] = useState(nodeData.database || '');
    const [username, setUsername] = useState(nodeData.username || '');
    const [password, setPassword] = useState(nodeData.password || '');
    const [showPassword, setShowPassword] = useState(false);
    const [sqlQuery, setSqlQuery] = useState(nodeData.sqlQuery || '');
    const [sqlParams, setSqlParams] = useState(nodeData.sqlParams || []);
    const [newSqlParamName, setNewSqlParamName] = useState('');
    const [newSqlParamValue, setNewSqlParamValue] = useState('');

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    const handleDatabaseTypeChange = (e) => {
        const type = e.target.value;
        setDatabaseType(type);
        onChange({
            ...nodeData,
            databaseType: type
        });
    };

    const handleOperationChange = (e) => {
        const op = e.target.value;
        setOperation(op);
        onChange({
            ...nodeData,
            operation: op
        });
    };

    const handleCollectionChange = (e) => {
        const col = e.target.value;
        setCollection(col);
        if (!col || col.trim() === '') {
            setValidationErrors({
                ...validationErrors,
                collection: "A coleção é obrigatória"
            });
        } else {
            const { collection: _, ...restErrors } = validationErrors;
            setValidationErrors(restErrors);
        }
        onChange({
            ...nodeData,
            collection: col
        });
    };

    const handleDocumentChange = (e) => {
        const doc = e.target.value;
        setDocument(doc);
        if (['get_document', 'update', 'delete'].includes(operation) && (!doc || doc.trim() === '')) {
            setValidationErrors({
                ...validationErrors,
                document: "O ID do documento é obrigatório para esta operação"
            });
        } else {
            const { document: _, ...restErrors } = validationErrors;
            setValidationErrors(restErrors);
        }
        onChange({
            ...nodeData,
            document: doc
        });
    };

    const handleCredentialsChange = (e) => {
        const creds = e.target.value;
        setCredentials(creds);
        try {
            if (creds && creds.trim() !== '') {
                JSON.parse(creds);
                const { credentials: _, ...restErrors } = validationErrors;
                setValidationErrors(restErrors);
            }
        } catch (e) {
            setValidationErrors({
                ...validationErrors,
                credentials: "Credenciais inválidas. Deve ser um JSON válido."
            });
        }
        onChange({
            ...nodeData,
            credentials: creds
        });
    };

    const handleResponseVariableChange = (e) => {
        const variable = e.target.value;
        setResponseVariable(variable);
        if (!variable || variable.trim() === '') {
            setValidationErrors({
                ...validationErrors,
                responseVariable: "O nome da variável é obrigatório"
            });
        } else if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(variable)) {
            setValidationErrors({
                ...validationErrors,
                responseVariable: "Nome de variável inválido. Use letras, números e _ (começando com letra)"
            });
        } else {
            const { responseVariable: _, ...restErrors } = validationErrors;
            setValidationErrors(restErrors);
        }
        onChange({
            ...nodeData,
            responseVariable: variable
        });
    };

    const handleAddWhereCondition = () => {
        if (!newWhereField.trim()) return;
        const newCondition = {
            field: newWhereField,
            operator: newWhereOperator,
            value: newWhereValue
        };
        const updatedConditions = [...whereConditions, newCondition];
        setWhereConditions(updatedConditions);
        onChange({
            ...nodeData,
            whereConditions: updatedConditions
        });
        setNewWhereField('');
        setNewWhereOperator('==');
        setNewWhereValue('');
    };

    const handleRemoveWhereCondition = (index) => {
        const updatedConditions = whereConditions.filter((_, i) => i !== index);
        setWhereConditions(updatedConditions);
        onChange({
            ...nodeData,
            whereConditions: updatedConditions
        });
    };

    const handleOrderByChange = (field, value) => {
        const updatedOrderBy = { ...orderBy, [field]: value };
        setOrderBy(updatedOrderBy);
        onChange({
            ...nodeData,
            orderBy: updatedOrderBy
        });
    };

    const handleLimitChange = (e) => {
        const value = parseInt(e.target.value) || 10;
        setLimit(value);
        onChange({
            ...nodeData,
            limit: value
        });
    };

    const handleDataToWriteChange = (e) => {
        const data = e.target.value;
        setDataToWrite(data);
        if (['add', 'update'].includes(operation) && !useVariableForData) {
            try {
                if (data && data.trim() !== '') {
                    JSON.parse(data);
                    const { dataToWrite: _, ...restErrors } = validationErrors;
                    setValidationErrors(restErrors);
                } else {
                    setValidationErrors({
                        ...validationErrors,
                        dataToWrite: "Os dados são obrigatórios para esta operação"
                    });
                }
            } catch (e) {
                setValidationErrors({
                    ...validationErrors,
                    dataToWrite: "Dados inválidos. Deve ser um JSON válido."
                });
            }
        } else {
            const { dataToWrite: _, ...restErrors } = validationErrors;
            setValidationErrors(restErrors);
        }
        onChange({
            ...nodeData,
            dataToWrite: data
        });
    };

    const handleUseVariableForDataChange = (e) => {
        const useVariable = e.target.checked;
        setUseVariableForData(useVariable);
        onChange({
            ...nodeData,
            useVariableForData: useVariable
        });
        if (!useVariable) {
            handleDataToWriteChange({ target: { value: dataToWrite } });
        }
    };

    const handleDataVariableChange = (e) => {
        const variable = e.target.value;
        setDataVariable(variable);
        if (useVariableForData && (!variable || variable.trim() === '')) {
            setValidationErrors({
                ...validationErrors,
                dataVariable: "O nome da variável é obrigatório quando se usa variável para dados"
            });
        } else {
            const { dataVariable: _, ...restErrors } = validationErrors;
            setValidationErrors(restErrors);
        }
        onChange({
            ...nodeData,
            dataVariable: variable
        });
    };

    // Funções para lidar com bancos relacionais
    const handleHostChange = (e) => {
        const hostValue = e.target.value;
        setHost(hostValue);
        onChange({
            ...nodeData,
            host: hostValue
        });
        if (!hostValue && ['postgresql', 'mysql', 'firebird'].includes(databaseType)) {
            setValidationErrors({
                ...validationErrors,
                host: "O host é obrigatório"
            });
        } else {
            const { host: _, ...restErrors } = validationErrors;
            setValidationErrors(restErrors);
        }
    };

    const handlePortChange = (e) => {
        const portValue = e.target.value;
        setPort(portValue);
        onChange({
            ...nodeData,
            port: portValue
        });
    };

    const handleDatabaseChange = (e) => {
        const dbValue = e.target.value;
        setDatabase(dbValue);
        onChange({
            ...nodeData,
            database: dbValue
        });
        if (!dbValue && ['postgresql', 'mysql', 'firebird'].includes(databaseType)) {
            setValidationErrors({
                ...validationErrors,
                database: "O nome do banco de dados é obrigatório"
            });
        } else {
            const { database: _, ...restErrors } = validationErrors;
            setValidationErrors(restErrors);
        }
    };

    const handleUsernameChange = (e) => {
        const user = e.target.value;
        setUsername(user);
        onChange({
            ...nodeData,
            username: user
        });
    };

    const handlePasswordChange = (e) => {
        const pass = e.target.value;
        setPassword(pass);
        onChange({
            ...nodeData,
            password: pass
        });
    };

    const handleSqlQueryChange = (e) => {
        const query = e.target.value;
        setSqlQuery(query);
        onChange({
            ...nodeData,
            sqlQuery: query
        });
        if (!query && ['postgresql', 'mysql', 'firebird'].includes(databaseType)) {
            setValidationErrors({
                ...validationErrors,
                sqlQuery: "A consulta SQL é obrigatória"
            });
        } else {
            const { sqlQuery: _, ...restErrors } = validationErrors;
            setValidationErrors(restErrors);
        }
    };

    const handleAddSqlParam = () => {
        if (!newSqlParamName.trim()) return;

        const newParam = {
            name: newSqlParamName,
            value: newSqlParamValue
        };

        const updatedParams = [...sqlParams, newParam];
        setSqlParams(updatedParams);
        onChange({
            ...nodeData,
            sqlParams: updatedParams
        });

        setNewSqlParamName('');
        setNewSqlParamValue('');
    };

    const handleRemoveSqlParam = (index) => {
        const updatedParams = sqlParams.filter((_, i) => i !== index);
        setSqlParams(updatedParams);
        onChange({
            ...nodeData,
            sqlParams: updatedParams
        });
    };

    const handleTestDatabase = async () => {
        if (Object.keys(validationErrors).length > 0) {
            setTestResult({
                success: false,
                message: "Corrija os erros de configuração antes de testar"
            });
            return;
        }
        setTestLoading(true);
        setTestResult(null);
        try {
            let testData;

            if (['firebase', 'realtime'].includes(databaseType)) {
                testData = {
                    databaseType,
                    operation,
                    collection,
                    document,
                    whereConditions,
                    orderBy,
                    limit,
                    credentials,
                    dataToWrite: useVariableForData ? null : dataToWrite
                };
            } else {
                // Dados para bancos relacionais
                testData = {
                    databaseType,
                    host,
                    port,
                    database,
                    username,
                    password,
                    sqlQuery,
                    sqlParams
                };
            }

            const { data } = await api.post('/flow-builder/nodes/database/test', testData);
            setTestResult({
                success: data.success,
                status: data.status,
                data: data.data
            });
        } catch (error) {
            console.error("Erro ao testar conexão com banco de dados:", error);
            setTestResult({
                success: false,
                message: error.response ? `Erro ${error.response.status}: ${error.response.statusText}` : error.message,
                error: error.message
            });
        } finally {
            setTestLoading(false);
        }
    };

    const validateForm = () => {
        let errors = {};

        if (['firebase', 'realtime'].includes(databaseType)) {
            // Validações para bancos NoSQL
            if (!collection || collection.trim() === '') {
                errors.collection = "A coleção é obrigatória";
            }

            if (['get_document', 'update', 'delete'].includes(operation) && (!document || document.trim() === '')) {
                errors.document = "O ID do documento é obrigatório para esta operação";
            }

            if (['add', 'update'].includes(operation)) {
                if (useVariableForData) {
                    if (!dataVariable || dataVariable.trim() === '') {
                        errors.dataVariable = "O nome da variável é obrigatório quando se usa variável para dados";
                    }
                } else {
                    if (!dataToWrite || dataToWrite.trim() === '') {
                        errors.dataToWrite = "Os dados são obrigatórios para esta operação";
                    } else {
                        try {
                            JSON.parse(dataToWrite);
                        } catch (e) {
                            errors.dataToWrite = "Dados inválidos. Deve ser um JSON válido.";
                        }
                    }
                }
            }

            if (databaseType === 'firebase') {
                if (!credentials || credentials.trim() === '') {
                    errors.credentials = "As credenciais são obrigatórias para o Firebase";
                } else {
                    try {
                        JSON.parse(credentials);
                    } catch (e) {
                        errors.credentials = "Credenciais inválidas. Deve ser um JSON válido.";
                    }
                }
            }
        } else {
            // Validações para bancos relacionais
            if (!host || host.trim() === '') {
                errors.host = "O host é obrigatório";
            }

            if (!database || database.trim() === '') {
                errors.database = "O nome do banco de dados é obrigatório";
            }

            if (!username || username.trim() === '') {
                errors.username = "O nome de usuário é obrigatório";
            }

            if (!sqlQuery || sqlQuery.trim() === '') {
                errors.sqlQuery = "A consulta SQL é obrigatória";
            }
        }

        // Validações comuns a todos os tipos de banco
        if (!responseVariable || responseVariable.trim() === '') {
            errors.responseVariable = "O nome da variável de resposta é obrigatório";
        } else if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(responseVariable)) {
            errors.responseVariable = "Nome de variável inválido. Use letras, números e _ (começando com letra)";
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    useEffect(() => {
        validateForm();
    }, [
        operation, collection, document, responseVariable,
        dataToWrite, useVariableForData, dataVariable,
        credentials, databaseType, host, port, database,
        username, password, sqlQuery
    ]);

    // Obter a porta padrão com base no tipo de banco de dados
    const getDefaultPort = () => {
        switch (databaseType) {
            case 'postgresql': return '5432';
            case 'mysql': return '3306';
            case 'firebird': return '3050';
            default: return '';
        }
    };

    return (
        <Box sx={{ p: 2, width: '450px', maxWidth: '100%' }}>
            <TextField
                fullWidth
                label={i18n.t('flowBuilder.properties.label', 'Rótulo')}
                value={nodeData.label || ''}
                onChange={(e) => onChange({ ...nodeData, label: e.target.value })}
                margin="normal"
                InputLabelProps={{
                    shrink: true,
                }}
            />

            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2, mt: 2 }}>
                <Tabs value={tabValue} onChange={handleTabChange} variant="scrollable" scrollButtons="auto">
                    <Tab label="Básico" id="database-tab-0" aria-controls="database-tabpanel-0" />
                    {['firebase', 'realtime'].includes(databaseType) ? (
                        <>
                            <Tab label="Consulta" id="database-tab-1" aria-controls="database-tabpanel-1" />
                            <Tab label="Dados" id="database-tab-2" aria-controls="database-tabpanel-2" />
                        </>
                    ) : (
                        <Tab label="Consulta SQL" id="database-tab-1" aria-controls="database-tabpanel-1" />
                    )}
                    <Tab label="Conexão" id="database-tab-3" aria-controls="database-tabpanel-3" />
                    <Tab label="Avançado" id="database-tab-4" aria-controls="database-tabpanel-4" />
                </Tabs>
            </Box>

            {/* Aba Básico */}
            <TabPanel value={tabValue} index={0}>
                <FormControl fullWidth margin="normal">
                    <InputLabel>Tipo de Banco de Dados</InputLabel>
                    <Select
                        value={databaseType}
                        onChange={handleDatabaseTypeChange}
                        label="Tipo de Banco de Dados"
                        InputLabelProps={{
                            shrink: true,
                        }}
                    >
                        <MenuItem value="firebase">Firebase Firestore</MenuItem>
                        <MenuItem value="realtime">Firebase Realtime Database</MenuItem>
                        <MenuItem value="postgresql">PostgreSQL</MenuItem>
                        <MenuItem value="mysql">MySQL / MariaDB</MenuItem>
                        <MenuItem value="firebird">Firebird</MenuItem>
                    </Select>
                </FormControl>

                {['firebase', 'realtime'].includes(databaseType) ? (
                    // Campos específicos para bancos NoSQL
                    <>
                        <FormControl fullWidth margin="normal">
                            <InputLabel>Operação</InputLabel>
                            <Select
                                value={operation}
                                onChange={handleOperationChange}
                                label="Operação"
                                InputLabelProps={{
                                    shrink: true,
                                }}
                            >
                                <MenuItem value="get">Listar documentos</MenuItem>
                                <MenuItem value="get_document">Obter documento único</MenuItem>
                                <MenuItem value="add">Adicionar documento</MenuItem>
                                <MenuItem value="update">Atualizar documento</MenuItem>
                                <MenuItem value="delete">Excluir documento</MenuItem>
                            </Select>
                        </FormControl>

                        <TextField
                            fullWidth
                            label="Coleção"
                            value={collection}
                            onChange={handleCollectionChange}
                            margin="normal"
                            placeholder="Ex: usuarios, produtos, pedidos"
                            required
                            error={!!validationErrors.collection}
                            helperText={validationErrors.collection || "Nome da coleção no banco de dados"}
                            InputLabelProps={{
                                shrink: true,
                            }}
                        />

                        {['get_document', 'update', 'delete'].includes(operation) && (
                            <TextField
                                fullWidth
                                label="ID do Documento"
                                value={document}
                                onChange={handleDocumentChange}
                                margin="normal"
                                placeholder="Ex: abc123, user_42"
                                required
                                error={!!validationErrors.document}
                                helperText={validationErrors.document || "Identificador único do documento"}
                                InputLabelProps={{
                                    shrink: true,
                                }}
                            />
                        )}
                    </>
                ) : (
                    // Campos específicos para bancos relacionais
                    <Alert severity="info" sx={{ mt: 2 }}>
                        <Typography variant="body2">
                            Você está configurando um banco de dados relacional.
                            Configure os parâmetros de conexão na aba "Conexão" e
                            sua consulta SQL na aba "Consulta SQL".
                        </Typography>
                    </Alert>
                )}

                <TextField
                    fullWidth
                    label="Nome da variável para resposta"
                    value={responseVariable}
                    onChange={handleResponseVariableChange}
                    margin="normal"
                    placeholder="resposta_db"
                    required
                    error={!!validationErrors.responseVariable}
                    helperText={validationErrors.responseVariable || "Nome da variável onde o resultado será armazenado"}
                    InputLabelProps={{
                        shrink: true,
                    }}
                />
            </TabPanel>

            {/* Aba Consulta (apenas para NoSQL) */}
            <TabPanel value={tabValue} index={1}>
                {['firebase', 'realtime'].includes(databaseType) ? (
                    ['get'].includes(operation) ? (
                        // Condições para operações de leitura em bancos NoSQL
                        <>
                            <Typography variant="subtitle2" gutterBottom>
                                Condições de Consulta (WHERE)
                            </Typography>

                            <Box sx={{ mb: 2, display: 'flex', gap: 1 }}>
                                <TextField
                                    label="Campo"
                                    size="small"
                                    value={newWhereField}
                                    onChange={(e) => setNewWhereField(e.target.value)}
                                    sx={{ flex: 1 }}
                                    placeholder="Ex: nome, idade, status"
                                    InputLabelProps={{
                                        shrink: true,
                                    }}
                                />

                                <FormControl size="small" sx={{ minWidth: 120 }}>
                                    <InputLabel>Operador</InputLabel>
                                    <Select
                                        value={newWhereOperator}
                                        onChange={(e) => setNewWhereOperator(e.target.value)}
                                        label="Operador"
                                        InputLabelProps={{
                                            shrink: true,
                                        }}
                                    >
                                        <MenuItem value="==">==(igual)</MenuItem>
                                        <MenuItem value="!=">{`!=(diferente)`}</MenuItem>
                                        <MenuItem value="<">{`<(menor)`}</MenuItem>
                                        <MenuItem value="<=">{`<=(menor ou igual)`}</MenuItem>
                                        <MenuItem value=">">{`>(maior)`}</MenuItem>
                                        <MenuItem value=">=">{`>=(maior ou igual)`}</MenuItem>
                                        <MenuItem value="array-contains">array-contains</MenuItem>
                                        <MenuItem value="in">in</MenuItem>
                                    </Select>
                                </FormControl>

                                <TextField
                                    label="Valor"
                                    size="small"
                                    value={newWhereValue}
                                    onChange={(e) => setNewWhereValue(e.target.value)}
                                    sx={{ flex: 1 }}
                                    placeholder="Ex: João, 18, ativo"
                                    InputLabelProps={{
                                        shrink: true,
                                    }}
                                />

                                <Button
                                    variant="contained"
                                    onClick={handleAddWhereCondition}
                                    disabled={!newWhereField.trim()}
                                    size="small"
                                >
                                    <AddIcon />
                                </Button>
                            </Box>

                            {whereConditions.length > 0 ? (
                                <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
                                    {whereConditions.map((condition, index) => (
                                        <Box key={index} sx={{ display: 'flex', gap: 1, mb: 1, alignItems: 'center' }}>
                                            <Chip
                                                label={condition.field}
                                                size="small"
                                                color="primary"
                                                variant="outlined"
                                            />
                                            <Typography variant="body2">
                                                {condition.operator}
                                            </Typography>
                                            <Chip
                                                label={condition.value}
                                                size="small"
                                                color="secondary"
                                                variant="outlined"
                                            />
                                            <IconButton size="small" onClick={() => handleRemoveWhereCondition(index)}>
                                                <DeleteIcon fontSize="small" />
                                            </IconButton>
                                        </Box>
                                    ))}
                                </Paper>
                            ) : (
                                <Alert severity="info" sx={{ mb: 3 }}>
                                    Nenhuma condição adicionada. Se não definir condições, todos os documentos da coleção serão retornados.
                                </Alert>
                            )}

                            <Typography variant="subtitle2" gutterBottom>
                                Ordenação e Limite
                            </Typography>

                            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                                <TextField
                                    label="Ordenar por campo"
                                    size="small"
                                    value={orderBy.field}
                                    onChange={(e) => handleOrderByChange('field', e.target.value)}
                                    sx={{ flex: 2 }}
                                    placeholder="Ex: nome, data, preco"
                                    InputLabelProps={{
                                        shrink: true,
                                    }}
                                />

                                <FormControl size="small" sx={{ flex: 1 }}>
                                    <InputLabel>Direção</InputLabel>
                                    <Select
                                        value={orderBy.direction}
                                        onChange={(e) => handleOrderByChange('direction', e.target.value)}
                                        label="Direção"
                                        InputLabelProps={{
                                            shrink: true,
                                        }}
                                    >
                                        <MenuItem value="asc">Crescente</MenuItem>
                                        <MenuItem value="desc">Decrescente</MenuItem>
                                    </Select>
                                </FormControl>

                                <TextField
                                    label="Limite"
                                    type="number"
                                    size="small"
                                    value={limit}
                                    onChange={handleLimitChange}
                                    sx={{ flex: 1 }}
                                    InputProps={{ inputProps: { min: 1, max: 1000 } }}
                                    InputLabelProps={{
                                        shrink: true,
                                    }}
                                />
                            </Box>
                        </>
                    ) : (
                        <Alert severity="info">
                            As opções de consulta estão disponíveis apenas para a operação de listagem de documentos.
                        </Alert>
                    )
                ) : (
                    // Consulta SQL para bancos relacionais
                    <>
                        <Typography variant="subtitle2" gutterBottom>
                            Consulta SQL
                        </Typography>

                        <TextField
                            fullWidth
                            label="SQL Query"
                            multiline
                            rows={6}
                            value={sqlQuery}
                            onChange={handleSqlQueryChange}
                            margin="normal"
                            placeholder={`SELECT * FROM usuarios\nWHERE status = :status\nLIMIT 10`}
                            required
                            error={!!validationErrors.sqlQuery}
                            helperText={validationErrors.sqlQuery || "Insira sua consulta SQL com parâmetros usando :nome"}
                            InputProps={{
                                style: { fontFamily: 'monospace', fontSize: '0.9rem' }
                            }}
                            InputLabelProps={{
                                shrink: true,
                            }}
                        />

                        <Typography variant="subtitle2" sx={{ mt: 3, mb: 1 }}>
                            Parâmetros SQL
                        </Typography>

                        <Box sx={{ mb: 2, display: 'flex', gap: 1 }}>
                            <TextField
                                label="Nome do parâmetro"
                                size="small"
                                value={newSqlParamName}
                                onChange={(e) => setNewSqlParamName(e.target.value)}
                                sx={{ flex: 1 }}
                                placeholder="Ex: status, id, limite"
                                InputLabelProps={{
                                    shrink: true,
                                }}
                            />

                            <TextField
                                label="Valor"
                                size="small"
                                value={newSqlParamValue}
                                onChange={(e) => setNewSqlParamValue(e.target.value)}
                                sx={{ flex: 1 }}
                                placeholder="Ex: ativo, 42, 10"
                                InputLabelProps={{
                                    shrink: true,
                                }}
                            />

                            <Button
                                variant="contained"
                                onClick={handleAddSqlParam}
                                disabled={!newSqlParamName.trim()}
                                size="small"
                            >
                                <AddIcon />
                            </Button>
                        </Box>

                        {sqlParams.length > 0 ? (
                            <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
                                {sqlParams.map((param, index) => (
                                    <Box key={index} sx={{ display: 'flex', gap: 1, mb: 1, alignItems: 'center' }}>
                                        <Chip
                                            label={`:${param.name}`}
                                            size="small"
                                            color="primary"
                                            variant="outlined"
                                        />
                                        <Typography variant="body2">
                                            =
                                        </Typography>
                                        <Chip
                                            label={param.value}
                                            size="small"
                                            color="secondary"
                                            variant="outlined"
                                        />
                                        <IconButton size="small" onClick={() => handleRemoveSqlParam(index)}>
                                            <DeleteIcon fontSize="small" />
                                        </IconButton>
                                    </Box>
                                ))}
                            </Paper>
                        ) : (
                            <Alert severity="info" sx={{ mb: 3 }}>
                                Nenhum parâmetro adicionado. Os parâmetros SQL são valores que serão substituídos na consulta.
                                Use a sintaxe :nome_parametro em sua consulta SQL e adicione os parâmetros aqui.
                            </Alert>
                        )}
                    </>
                )}
            </TabPanel>

            {/* Aba Dados (apenas para NoSQL quando a operação é add/update) */}
            <TabPanel value={tabValue} index={2}>
                {['firebase', 'realtime'].includes(databaseType) && ['add', 'update'].includes(operation) ? (
                    <>
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={useVariableForData}
                                    onChange={handleUseVariableForDataChange}
                                    color="primary"
                                />
                            }
                            label="Usar dados de uma variável"
                            sx={{ mb: 2 }}
                        />

                        {useVariableForData ? (
                            <TextField
                                fullWidth
                                label="Nome da variável com dados"
                                value={dataVariable}
                                onChange={handleDataVariableChange}
                                margin="normal"
                                placeholder="Ex: dados_usuario, produto_novo"
                                required
                                error={!!validationErrors.dataVariable}
                                helperText={validationErrors.dataVariable || "Nome da variável que contém os dados a serem enviados"}
                                InputLabelProps={{
                                    shrink: true,
                                }}
                            />
                        ) : (
                            <TextField
                                fullWidth
                                label="Dados para enviar"
                                multiline
                                rows={6}
                                value={dataToWrite}
                                onChange={handleDataToWriteChange}
                                margin="normal"
                                placeholder={'{\n  "campo1": "valor1",\n  "campo2": 42,\n  "campo3": true\n}'}
                                required
                                error={!!validationErrors.dataToWrite}
                                helperText={validationErrors.dataToWrite || "Dados em formato JSON"}
                                InputProps={{
                                    style: { fontFamily: 'monospace', fontSize: '0.9rem' }
                                }}
                                InputLabelProps={{
                                    shrink: true,
                                }}
                            />
                        )}

                        <Alert severity="info" sx={{ mt: 2 }}>
                            <Typography variant="body2">
                                {useVariableForData ?
                                    "A variável deve conter um objeto válido que possa ser convertido para JSON." :
                                    "Os dados devem estar em formato JSON válido. Campos e valores serão enviados exatamente como especificados."}
                            </Typography>
                        </Alert>
                    </>
                ) : (
                    <Alert severity="info">
                        As opções de dados estão disponíveis apenas para operações de adição ou atualização de documentos.
                    </Alert>
                )}
            </TabPanel>

            {/* Aba Conexão */}
            <TabPanel value={tabValue} index={3}>
                {['firebase', 'realtime'].includes(databaseType) ? (
                    // Configurações para bancos NoSQL
                    <>
                        <Typography variant="subtitle2" gutterBottom>
                            Credenciais do {databaseType === 'firebase' ? 'Firebase Firestore' : 'Firebase Realtime Database'}
                        </Typography>

                        <TextField
                            fullWidth
                            label="Credenciais"
                            multiline
                            rows={8}
                            value={credentials}
                            onChange={handleCredentialsChange}
                            margin="normal"
                            placeholder={'{\n  "apiKey": "...",\n  "authDomain": "...",\n  "projectId": "...",\n  // ...\n}'}
                            required={databaseType === 'firebase' || databaseType === 'realtime'}
                            error={!!validationErrors.credentials}
                            helperText={validationErrors.credentials || "Credenciais em formato JSON"}
                            InputProps={{
                                style: { fontFamily: 'monospace', fontSize: '0.9rem' },
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            aria-label="toggle credentials visibility"
                                            onClick={() => setShowCredentials(!showCredentials)}
                                        >
                                            {showCredentials ? <VisibilityOffIcon /> : <VisibilityIcon />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                                type: showCredentials ? 'text' : 'password'
                            }}
                            InputLabelProps={{
                                shrink: true,
                            }}
                        />

                        <Alert severity="info" sx={{ mt: 2 }}>
                            <Typography variant="body2">
                                Para o Firebase, você precisa fornecer as credenciais do seu projeto Firebase. 
Você pode obtê-las na seção 'Configurações do Projeto - Contas de serviço' no console do Firebase.
                            </Typography>
                        </Alert>
                    </>
                ) : (
                    // Configurações para bancos relacionais
                    <>
                        <Typography variant="subtitle2" gutterBottom>
                            Configuração de Conexão para {databaseType === 'postgresql' ? 'PostgreSQL' :
                                databaseType === 'mysql' ? 'MySQL/MariaDB' :
                                    'Firebird'}
                        </Typography>

                        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                            <TextField
                                label="Host/Servidor"
                                value={host}
                                onChange={handleHostChange}
                                sx={{ flex: 2 }}
                                placeholder="Ex: localhost, 192.168.1.100"
                                required
                                error={!!validationErrors.host}
                                helperText={validationErrors.host}
                                InputLabelProps={{
                                    shrink: true,
                                }}
                            />

                            <TextField
                                label="Porta"
                                value={port || getDefaultPort()}
                                onChange={handlePortChange}
                                sx={{ flex: 1 }}
                                placeholder={getDefaultPort()}
                                InputProps={{
                                    inputProps: { min: 1, max: 65535 }
                                }}
                                InputLabelProps={{
                                    shrink: true,
                                }}
                            />
                        </Box>

                        <TextField
                            fullWidth
                            label="Nome do Banco de Dados"
                            value={database}
                            onChange={handleDatabaseChange}
                            margin="normal"
                            placeholder="Ex: minha_empresa, sistema_vendas"
                            required
                            error={!!validationErrors.database}
                            helperText={validationErrors.database}
                            InputLabelProps={{
                                shrink: true,
                            }}
                        />

                        <TextField
                            fullWidth
                            label="Usuário"
                            value={username}
                            onChange={handleUsernameChange}
                            margin="normal"
                            placeholder="Ex: root, postgres, admin"
                            required
                            error={!!validationErrors.username}
                            helperText={validationErrors.username}
                            InputLabelProps={{
                                shrink: true,
                            }}
                        />

                        <TextField
                            fullWidth
                            label="Senha"
                            value={password}
                            onChange={handlePasswordChange}
                            margin="normal"
                            type={showPassword ? 'text' : 'password'}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            onClick={() => setShowPassword(!showPassword)}
                                            edge="end"
                                        >
                                            {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                                        </IconButton>
                                    </InputAdornment>
                                )
                            }}
                            InputLabelProps={{
                                shrink: true,
                            }}
                        />

                        <Alert severity="info" sx={{ mt: 2 }}>
                            <Typography variant="body2">
                                {databaseType === 'postgresql' ?
                                    "Para PostgreSQL, certifique-se de que o usuário tenha permissões adequadas na base de dados especificada." :
                                    databaseType === 'mysql' ?
                                        "Para MySQL/MariaDB, assegure-se de que o usuário tenha privilégios necessários para executar as operações desejadas." :
                                        "Para Firebird, verifique se o caminho do arquivo está correto e se o usuário tem acesso ao mesmo."}
                            </Typography>
                        </Alert>
                    </>
                )}

                <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                        variant="outlined"
                        color="primary"
                        onClick={handleTestDatabase}
                        startIcon={testLoading ? <CircularProgress size={20} /> : <TestIcon />}
                        disabled={testLoading}
                    >
                        Testar Conexão
                    </Button>
                </Box>

                {testResult && (
                    <Paper
                        variant="outlined"
                        sx={{
                            p: 2,
                            mt: 2,
                            bgcolor: testResult.success ? 'success.light' : 'error.light',
                            color: testResult.success ? 'success.contrastText' : 'error.contrastText',
                        }}
                    >
                        <Typography variant="subtitle2">
                            {testResult.success ? 'Conexão bem-sucedida!' : `Erro: ${testResult.message}`}
                        </Typography>

                        {testResult.data && (
                            <Box
                                sx={{
                                    mt: 1,
                                    p: 1,
                                    bgcolor: 'rgba(0,0,0,0.1)',
                                    borderRadius: 1,
                                    maxHeight: 200,
                                    overflow: 'auto',
                                    fontFamily: 'monospace',
                                    fontSize: '0.75rem'
                                }}
                            >
                                <pre>{JSON.stringify(testResult.data, null, 2)}</pre>
                            </Box>
                        )}
                    </Paper>
                )}
            </TabPanel>

            {/* Aba Avançado */}
            <TabPanel value={tabValue} index={4}>
                <Typography variant="subtitle2" gutterBottom>
                    Mapeamento de Saídas
                </Typography>

                <Box sx={{ mt: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                        Este nó possui duas saídas possíveis:
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mt: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Chip
                                label="Sucesso"
                                size="small"
                                color="success"
                                variant="outlined"
                            />
                            <Typography variant="body2">
                                Quando a operação for concluída com êxito
                            </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                            <Chip
                                label="Erro"
                                size="small"
                                color="error"
                                variant="outlined"
                            />
                            <Typography variant="body2">
                                Quando ocorrer algum erro na operação
                            </Typography>
                        </Box>
                    </Box>
                </Box>

                <Typography sx={{ mt: 2 }} variant="body2" color="text.secondary">
                    <InfoIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                    As variáveis de saída incluirão detalhes sobre a operação, incluindo código de status, mensagem e dados retornados.
                </Typography>

                <FormControlLabel
                    control={
                        <Switch
                            checked={nodeData.storeErrorResponse || false}
                            onChange={(e) => onChange({ ...nodeData, storeErrorResponse: e.target.checked })}
                            color="primary"
                        />
                    }
                    label="Armazenar resposta mesmo em caso de erro"
                    sx={{ mt: 2, display: 'block' }}
                />

                <TextField
                    fullWidth
                    label="Variável para código de status"
                    value={nodeData.statusVariable || ''}
                    onChange={(e) => onChange({ ...nodeData, statusVariable: e.target.value })}
                    margin="normal"
                    placeholder="status_db"
                    helperText="Nome da variável onde o código de status da resposta será armazenado (opcional)"
                    InputLabelProps={{
                        shrink: true,
                    }}
                />

                <Divider sx={{ my: 2 }} />

                <Typography variant="subtitle2" gutterBottom>
                    Tratamento de Timeout e Retry
                </Typography>

                <Box sx={{ display: 'flex', gap: 2 }}>
                    <TextField
                        type="number"
                        label="Timeout (ms)"
                        value={nodeData.timeout || 30000}
                        onChange={(e) => onChange({ ...nodeData, timeout: parseInt(e.target.value) || 30000 })}
                        InputProps={{
                            inputProps: { min: 1000, max: 60000 }
                        }}
                        sx={{ flex: 1 }}
                        InputLabelProps={{
                            shrink: true,
                        }}
                    />
                    <TextField
                        type="number"
                        label="Tentativas"
                        value={nodeData.retries || 1}
                        onChange={(e) => onChange({ ...nodeData, retries: parseInt(e.target.value) || 1 })}
                        InputProps={{
                            inputProps: { min: 1, max: 5 }
                        }}
                        sx={{ flex: 1 }}
                        InputLabelProps={{
                            shrink: true,
                        }}
                    />
                </Box>

                {Object.keys(validationErrors).length > 0 && (
                    <Alert severity="warning" sx={{ mt: 3 }}>
                        Por favor, corrija os erros no formulário antes de salvar.
                    </Alert>
                )}

                <Box sx={{ mt: 3, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                    <Typography variant="caption" color="text.secondary">
                        Este nó estabelece uma conexão com um banco de dados
                        {['firebase', 'realtime'].includes(databaseType) ? ' NoSQL' : ' relacional'}
                        e realiza a operação selecionada. Os resultados são armazenados na variável especificada e podem
                        ser utilizados por outros nós no fluxo. Saídas diferentes são acionadas dependendo do sucesso ou
                        falha da operação.
                    </Typography>
                </Box>
            </TabPanel>
        </Box>
    );
};

export default DatabaseNodeDrawer;