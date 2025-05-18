// src/pages/BulkSender/tabs/CampaignsList.jsx
import React, { useMemo } from "react";
import { useHistory } from "react-router-dom";
import { styled, useTheme } from '@mui/material/styles';
import { i18n } from "../../../translate/i18n";

// Material UI
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Tooltip,
  Typography,
} from "@mui/material";

// Icons
import {
  DeleteOutline as DeleteOutlineIcon,
  Edit as EditIcon,
  Description as DescriptionIcon,
  PlayCircleOutline as PlayCircleOutlineIcon,
  PauseCircleOutline as PauseCircleOutlineIcon,
  CheckCircleOutlined as CheckCircleOutlinedIcon,
  CancelOutlined as CancelOutlinedIcon,
  AccessTime as AccessTimeIcon,
  Campaign as CampaignIcon,
  ContentCopy as ContentCopyIcon,
} from "@mui/icons-material";

// Componentes
import TableRowSkeleton from "../../../components/TableRowSkeleton";
import BaseEmptyState from "../../../components/BaseEmptyState";
import BaseButton from "../../../components/BaseButton";

// Componentes estilizados
const MainPaper = styled(Paper)(({ theme }) => ({
  flex: 1,
  padding: theme.spacing(1),
  overflowY: "auto",
  ...theme.scrollbarStyles,
  display: "flex",
  flexDirection: "column",
}));

const ActionButtons = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(1),
  justifyContent: 'flex-end',
}));

const StatusChip = styled(Chip)(({ theme, status }) => {
  let color = theme.palette.primary.main;
  let backgroundColor = theme.palette.primary.lighter;

  switch (status) {
    case "INATIVA":
      color = theme.palette.grey[800];
      backgroundColor = theme.palette.grey[200];
      break;
    case "PROGRAMADA":
      color = theme.palette.warning.dark;
      backgroundColor = theme.palette.warning.lighter;
      break;
    case "EM_ANDAMENTO":
      color = theme.palette.success.dark;
      backgroundColor = theme.palette.success.lighter;
      break;
    case "CANCELADA":
      color = theme.palette.error.dark;
      backgroundColor = theme.palette.error.lighter;
      break;
    case "FINALIZADA":
      color = theme.palette.info.dark;
      backgroundColor = theme.palette.info.lighter;
      break;
    default:
      break;
  }

  return {
    color,
    backgroundColor,
    fontWeight: 600,
    '& .MuiChip-icon': {
      color: 'inherit',
    },
  };
});

const getStatusIcon = (status) => {
  switch (status) {
    case "INATIVA":
      return <CancelOutlinedIcon fontSize="small" />;
    case "PROGRAMADA":
      return <AccessTimeIcon fontSize="small" />;
    case "EM_ANDAMENTO":
      return <CampaignIcon fontSize="small" />;
    case "CANCELADA":
      return <CancelOutlinedIcon fontSize="small" />;
    case "FINALIZADA":
      return <CheckCircleOutlinedIcon fontSize="small" />;
    default:
      return null;
  }
};

// Função auxiliar para formatar data/hora caso não seja fornecida
const defaultDateFormatter = (date) => {
  if (!date) return "";
  return new Date(date).toLocaleString();
};

const CampaignsList = ({
  campaigns = [],
  loading = false,
  onEdit,
  onDelete,
  onDuplicate,
  onAction,
  datetimeToClient = defaultDateFormatter, // Definindo um valor padrão
  hasMore,
  onScroll,
}) => {
  const history = useHistory();
  const theme = useTheme();

  const formatStatus = useMemo(() => {
    return (status) => {
      const statusMap = {
        INATIVA: i18n.t("campaigns.status.inactive"),
        PROGRAMADA: i18n.t("campaigns.status.scheduled"),
        EM_ANDAMENTO: i18n.t("campaigns.status.inProgress"),
        CANCELADA: i18n.t("campaigns.status.cancelled"),
        FINALIZADA: i18n.t("campaigns.status.finished")
      };
      return statusMap[status] || status;
    };
  }, []);

  // Verificar se onScroll existe antes de chamar
  const handleScroll = (e) => {
    if (!hasMore || loading || !onScroll) return;

    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - (scrollTop + 100) < clientHeight) {
      onScroll();
    }
  };

  // Verificar se datetimeToClient é uma função
  const formatDateTime = (date) => {
    if (!date) return "";

    try {
      if (typeof datetimeToClient === 'function') {
        return datetimeToClient(date);
      }
      return defaultDateFormatter(date);
    } catch (error) {
      console.error("Erro ao formatar data:", error);
      return date.toString();
    }
  };

  if (!loading && campaigns.length === 0) {
    return (
      <BaseEmptyState
        icon={<CampaignIcon sx={{ fontSize: 40 }} />}
        title={i18n.t("campaigns.empty.title")}
        message={i18n.t("campaigns.empty.message")}
        buttonText={i18n.t("campaigns.buttons.add")}
        onAction={() => onEdit && onEdit(null)}
        showButton={true}
      />
    );
  }

  return (
    <MainPaper elevation={0} variant="outlined" onScroll={handleScroll}>
      <TableContainer>
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell>{i18n.t("campaigns.table.name")}</TableCell>
              <TableCell align="center">{i18n.t("campaigns.table.status")}</TableCell>
              <TableCell>{i18n.t("campaigns.table.contactList")}</TableCell>
              <TableCell>{i18n.t("campaigns.table.whatsapp")}</TableCell>
              <TableCell>{i18n.t("campaigns.table.scheduledAt")}</TableCell>
              <TableCell align="center">{i18n.t("campaigns.table.confirmation")}</TableCell>
              <TableCell align="center">{i18n.t("campaigns.table.openTicket")}</TableCell>
              <TableCell align="right">{i18n.t("campaigns.table.actions")}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRowSkeleton columns={7} />
            ) : (
              campaigns.map((campaign) => (
                <TableRow key={campaign.id} hover>
                  <TableCell>
                    <Typography fontWeight={500}>{campaign.name}</Typography>
                  </TableCell>
                  <TableCell align="center">
                    <StatusChip
                      size="small"
                      label={formatStatus(campaign.status)}
                      status={campaign.status}
                      icon={getStatusIcon(campaign.status)}
                    />
                  </TableCell>
                  <TableCell>
                    {campaign.contactListId && campaign.contactList ? (
                      campaign.contactList.name
                    ) : (
                      <Typography variant="body2" color="textSecondary">
                        {i18n.t("campaigns.table.noList")}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    {campaign.whatsappId && campaign.whatsapp ? (
                      campaign.whatsapp.name
                    ) : (
                      <Typography variant="body2" color="textSecondary">
                        {i18n.t("campaigns.table.noWhatsapp")}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    {campaign.scheduledAt ? (
                      formatDateTime(campaign.scheduledAt)
                    ) : (
                      <Typography variant="body2" color="textSecondary">
                        {i18n.t("campaigns.table.noSchedule")}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      size="small"
                      color={campaign.confirmation ? "primary" : "default"}
                      variant={campaign.confirmation ? "filled" : "outlined"}
                      label={
                        campaign.confirmation
                          ? i18n.t("campaigns.table.enabled")
                          : i18n.t("campaigns.table.disabled")
                      }
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      size="small"
                      color={campaign.openTicket === "enabled" ? "primary" : "default"}
                      variant={campaign.openTicket === "enabled" ? "filled" : "outlined"}
                      label={
                        campaign.openTicket === "enabled"
                          ? i18n.t("campaigns.table.enabled")
                          : i18n.t("campaigns.table.disabled")
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <ActionButtons>
                      {campaign.status === "EM_ANDAMENTO" && (
                        <Tooltip title={i18n.t("campaigns.buttons.stop")}>
                          <IconButton
                            size="small"
                            onClick={() => onAction && onAction(campaign, 'cancel')}
                            color="error"
                          >
                            <PauseCircleOutlineIcon />
                          </IconButton>
                        </Tooltip>
                      )}

                      {campaign.status === "CANCELADA" && (
                        <Tooltip title={i18n.t("campaigns.buttons.restart")}>
                          <IconButton
                            size="small"
                            onClick={() => onAction && onAction(campaign, 'restart')}
                            color="success"
                          >
                            <PlayCircleOutlineIcon />
                          </IconButton>
                        </Tooltip>
                      )}

                      <Tooltip title={i18n.t("campaigns.buttons.duplicate") || "Duplicar"}>
                        <IconButton
                          size="small"
                          onClick={() => onDuplicate && onDuplicate(campaign)}
                          color="primary"
                        >
                          <ContentCopyIcon />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title={i18n.t("campaigns.buttons.edit")}>
                        <IconButton
                          size="small"
                          onClick={() => onEdit && onEdit(campaign)}
                          color="primary"
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title={i18n.t("campaigns.buttons.delete")}>
                        <IconButton
                          size="small"
                          onClick={() => onDelete && onDelete(campaign)}
                          color="error"
                        >
                          <DeleteOutlineIcon />
                        </IconButton>
                      </Tooltip>
                    </ActionButtons>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </MainPaper>
  );
};

export default CampaignsList;