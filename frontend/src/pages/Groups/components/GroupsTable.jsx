import React, { useContext } from "react";
import {
  Box,
  Typography,
  Chip,
  Avatar,
  Button
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  PeopleAlt as PeopleIcon,
  PersonAdd as PersonAddIcon,
  Info as InfoIcon,
  DeleteForever as DeleteForeverIcon,
  AdminPanelSettings as AdminIcon,
  Group as ParticipantIcon,
  GetApp as ExtractIcon,
  Add as AddIcon
} from "@mui/icons-material";
import { format, parseISO } from "date-fns";
import { i18n } from "../../../translate/i18n";
import { AuthContext } from "../../../context/Auth/AuthContext";
import StandardTable from "../../../components/shared/StandardTable";

const GroupsTable = ({ 
  groups, 
  loading, 
  onEdit, 
  onDelete, 
  onRequests, 
  onForceDelete, 
  onExtractContacts 
}) => {
  const { user } = useContext(AuthContext);

  const getParticipantsCount = (group) => {
    if (!group.participantsJson) return 0;
    return Array.isArray(group.participantsJson) ? group.participantsJson.length : 0;
  };

  const getGroupInitials = (name) => {
    if (!name) return "GP";
    const words = name.split(" ");
    if (words.length === 1) return name.substring(0, 2).toUpperCase();
    return (words[0][0] + words[1][0]).toUpperCase();
  };

  const getUserRole = (group) => {
    try {
      if (group.userRole) {
        return group.userRole;
      }

      if (!group.participantsJson || !Array.isArray(group.participantsJson)) {
        return "unknown";
      }

      const hasAdmins = group.participantsJson.some(p => 
        p.admin === 'admin' || p.admin === 'superadmin' || p.isAdmin === true
      );

      if (!hasAdmins) {
        return "participant";
      }

      const adminParticipants = group.participantsJson.filter(p => 
        p.admin === 'admin' || p.admin === 'superadmin' || p.isAdmin === true
      );

      const adminRatio = adminParticipants.length / group.participantsJson.length;
      
      if (adminRatio > 0.5) {
        return "participant";
      }

      return group.userRole || "participant";
    } catch (error) {
      console.error("Erro ao verificar role do usuário:", error);
      return "unknown";
    }
  };

  // Configuração das colunas
  const columns = [
    {
      id: 'name',
      field: 'subject',
      label: i18n.t("groups.table.name"),
      minWidth: 250,
      render: (group) => (
        <Box display="flex" alignItems="center">
          <Avatar 
            src={group.profilePic ? `${process.env.REACT_APP_BACKEND_URL}${group.profilePic}` : undefined}
            sx={{ 
              width: 40,
              height: 40,
              backgroundColor: typeof group.id === 'string' ? 
                `hsl(${group.id.charCodeAt(0) * 10}, 70%, 50%)` : 
                '#128C7E',
              marginRight: 2,
              border: '1px solid rgba(0, 0, 0, 0.12)'
            }}
          >
            {getGroupInitials(group.subject)}
          </Avatar>
          <Box>
            <Typography variant="body1" sx={{ fontWeight: 500 }}>
              {group.subject || 'Grupo sem nome'}
            </Typography>
            <Typography variant="caption" color="textSecondary">
              {group.jid ? group.jid.split('@')[0] : ''}
            </Typography>
          </Box>
        </Box>
      )
    },
    {
      id: 'permission',
      field: 'userRole',
      label: 'Permissão',
      width: 150,
      render: (group) => {
        const userRole = getUserRole(group);
        
        if (userRole === "admin") {
          return (
            <Chip
              icon={<AdminIcon />}
              label="Administrador"
              size="small"
              color="warning"
              variant="outlined"
            />
          );
        }
        
        if (userRole === "participant") {
          return (
            <Chip
              icon={<ParticipantIcon />}
              label="Participante"
              size="small"
              color="default"
              variant="outlined"
            />
          );
        }
        
        return (
          <Chip
            label="Desconhecido"
            size="small"
            color="error"
            variant="outlined"
          />
        );
      }
    },
    {
      id: 'participants',
      field: 'participantsJson',
      label: i18n.t("groups.table.participants"),
      width: 120,
      align: 'center',
      render: (group) => (
        <Box display="flex" alignItems="center" justifyContent="center">
          <PeopleIcon 
            fontSize="small" 
            color="action" 
            sx={{ mr: 0.5 }}
          />
          <Typography variant="body2">
            {getParticipantsCount(group)}
          </Typography>
        </Box>
      )
    },
    {
      id: 'createdAt',
      field: 'createdAt',
      label: i18n.t("groups.table.createdAt"),
      width: 150,
      render: (group) => (
        group.createdAt
          ? format(parseISO(group.createdAt), "dd/MM/yyyy HH:mm")
          : "-"
      )
    }
  ];

  // Configuração das ações
  const getActions = (group) => {
    const userRole = getUserRole(group);
    const baseActions = [
      {
        label: 'Visualizar/Editar',
        icon: <InfoIcon fontSize="small" />,
        onClick: onEdit
      },
      {
        label: 'Extrair Contatos',
        icon: <ExtractIcon fontSize="small" />,
        onClick: onExtractContacts
      }
    ];

    if (userRole === "admin") {
      return [
        ...baseActions,
        { divider: true },
        {
          label: 'Solicitações',
          icon: <PersonAddIcon fontSize="small" />,
          onClick: onRequests
        },
        {
          label: 'Sair do Grupo',
          icon: <DeleteIcon fontSize="small" />,
          onClick: onDelete,
          color: 'error'
        },
        {
          label: 'Remover do Sistema',
          icon: <DeleteForeverIcon fontSize="small" />,
          onClick: onForceDelete,
          color: 'error',
          primary: true
        }
      ];
    }

    return [
      ...baseActions,
      { divider: true },
      {
        label: 'Remover do Sistema',
        icon: <DeleteForeverIcon fontSize="small" />,
        onClick: onForceDelete,
        color: 'error'
      }
    ];
  };

  // Estado vazio customizado
  const emptyState = (
    <Box p={4} textAlign="center">
      <PeopleIcon style={{ fontSize: 60, color: '#ccc' }} />
      <Typography variant="h6" color="textSecondary" gutterBottom>
        {i18n.t("groups.noGroupsFound")}
      </Typography>
      <Typography variant="body2" color="textSecondary" paragraph>
        Sincronize seus grupos do WhatsApp para começar a gerenciá-los
      </Typography>
      <Button
        variant="outlined"
        startIcon={<AddIcon />}
        onClick={() => {
          // Ação para sincronizar ou criar grupo
        }}
      >
        Sincronizar Grupos
      </Button>
    </Box>
  );

  return (
    <StandardTable
      columns={columns}
      data={groups}
      loading={loading}
      emptyState={emptyState}
      actions={getActions()}
      hover={true}
      pagination={true}
      initialRowsPerPage={10}
      stickyHeader={true}
      containerProps={{
        elevation: 1
      }}
    />
  );
};

export default GroupsTable;