import React, { useEffect, useReducer, useState, useContext } from "react";
import {
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Box,
  CircularProgress
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { DeleteOutline, Edit, Add as AddIcon } from "@mui/icons-material";

import StandardPageLayout from "../../components/shared/StandardPageLayout";
import ConfirmationModal from "../../components/ConfirmationModal";
import QueueModal from "../../components/QueueModal";
import { i18n } from "../../translate/i18n";
import { toast } from "../../helpers/toast";
import api from "../../services/api";
import { SocketContext } from "../../context/Socket/SocketContext";

const reducer = (state, action) => {
  if (action.type === "LOAD_QUEUES") {
    const queues = action.payload;
    const newQueues = [];

    queues.forEach((queue) => {
      const queueIndex = state.findIndex((q) => q.id === queue.id);
      if (queueIndex !== -1) {
        state[queueIndex] = queue;
      } else {
        newQueues.push(queue);
      }
    });

    return [...state, ...newQueues];
  }

  if (action.type === "UPDATE_QUEUES") {
    const queue = action.payload;
    const queueIndex = state.findIndex((u) => u.id === queue.id);

    if (queueIndex !== -1) {
      state[queueIndex] = queue;
      return [...state];
    } else {
      return [queue, ...state];
    }
  }

  if (action.type === "DELETE_QUEUE") {
    const queueId = action.payload;
    return state.filter((q) => q.id !== queueId);
  }

  if (action.type === "RESET") {
    return [];
  }
};

const Queues = () => {
  const theme = useTheme();
  const [queues, dispatch] = useReducer(reducer, []);
  const [loading, setLoading] = useState(false);
  const [queueModalOpen, setQueueModalOpen] = useState(false);
  const [selectedQueue, setSelectedQueue] = useState(null);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [searchParam, setSearchParam] = useState("");
  const socketManager = useContext(SocketContext);

  const fetchQueues = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/queue");
      dispatch({ type: "LOAD_QUEUES", payload: data });
    } catch (err) {
      toast.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchQueues();
  }, []);

  useEffect(() => {
    const companyId = localStorage.getItem("companyId");
    const socket = socketManager.GetSocket(companyId);

    const onQueue = (data) => {
      if (data.action === "update" || data.action === "create") {
        dispatch({ type: "UPDATE_QUEUES", payload: data.queue });
      }

      if (data.action === "delete") {
        dispatch({ type: "DELETE_QUEUE", payload: data.queueId });
      }
    };

    socket.on(`company-${companyId}-queue`, onQueue);

    return () => {
      socket.off(`company-${companyId}-queue`, onQueue);
    };
  }, [socketManager]);

  const handleOpenQueueModal = () => {
    setQueueModalOpen(true);
    setSelectedQueue(null);
  };

  const handleCloseQueueModal = () => {
    setQueueModalOpen(false);
    setSelectedQueue(null);
    fetchQueues();
  };

  const handleEditQueue = (queue) => {
    setSelectedQueue(queue);
    setQueueModalOpen(true);
  };

  const handleDeleteQueue = async (queueId) => {
    try {
      await api.delete(`/queue/${queueId}`);
      toast.success(i18n.t("queues.toasts.deleted"));
    } catch (err) {
      toast.error(err);
    }
    setSelectedQueue(null);
    setConfirmModalOpen(false);
  };

  const handleSearch = (event) => {
    setSearchParam(event.target.value.toLowerCase());
  };

  // Configuração das ações do cabeçalho
  const pageActions = [
    {
      label: i18n.t("queues.buttons.add"),
      icon: <AddIcon />,
      onClick: handleOpenQueueModal,
      variant: "contained",
      color: "primary",
      tooltip: "Adicionar nova fila"
    }
  ];

  // Filtrar filas baseado na pesquisa
  const getFilteredQueues = () => {
    if (!searchParam) return queues;
    
    return queues.filter(queue =>
      queue.name?.toLowerCase().includes(searchParam) ||
      queue.greetingMessage?.toLowerCase().includes(searchParam) ||
      queue.orderQueue?.toLowerCase().includes(searchParam)
    );
  };

  const filteredQueues = getFilteredQueues();

  return (
    <>
      <StandardPageLayout
        title={i18n.t("queues.title")}
        actions={pageActions}
        searchValue={searchParam}
        onSearchChange={handleSearch}
        searchPlaceholder="Pesquisar filas..."
        showSearch={true}
        loading={loading}
      >
        {loading ? (
          <Box display="flex" justifyContent="center" p={3}>
            <CircularProgress />
          </Box>
        ) : filteredQueues.length === 0 ? (
          <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" p={5}>
            <Typography variant="h6" color="textSecondary" gutterBottom>
              {searchParam ? "Nenhuma fila encontrada" : "Nenhuma fila cadastrada"}
            </Typography>
            <Typography variant="body2" color="textSecondary" paragraph>
              {searchParam ? "Tente ajustar sua pesquisa" : "Crie sua primeira fila para começar"}
            </Typography>
          </Box>
        ) : (
          <TableContainer sx={{ height: '100%', overflow: 'auto' }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell align="center">{i18n.t("queues.table.id")}</TableCell>
                  <TableCell align="center">{i18n.t("queues.table.name")}</TableCell>
                  <TableCell align="center">{i18n.t("queues.table.color")}</TableCell>
                  <TableCell align="center">{i18n.t("queues.table.orderQueue")}</TableCell>
                  <TableCell align="center">{i18n.t("queues.table.greeting")}</TableCell>
                  <TableCell align="center">{i18n.t("queues.table.actions")}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredQueues.map((queue) => (
                  <TableRow key={queue.id} hover>
                    <TableCell align="center">{queue.id}</TableCell>
                    <TableCell align="center">{queue.name}</TableCell>
                    <TableCell align="center">
                      <Box display="flex" alignItems="center" justifyContent="center">
                        <Box
                          sx={{
                            backgroundColor: queue.color,
                            width: 60,
                            height: 20,
                            borderRadius: 1
                          }}
                        />
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <Box display="flex" alignItems="center" justifyContent="center">
                        <Typography
                          style={{ width: 300, textAlign: "center" }}
                          noWrap
                          variant="body2"
                        >
                          {queue.orderQueue}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <Box display="flex" alignItems="center" justifyContent="center">
                        <Typography
                          style={{ width: 300, textAlign: "center" }}
                          noWrap
                          variant="body2"
                        >
                          {queue.greetingMessage}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        size="small"
                        onClick={() => handleEditQueue(queue)}
                        color="primary"
                      >
                        <Edit />
                      </IconButton>

                      <IconButton
                        size="small"
                        onClick={() => {
                          setSelectedQueue(queue);
                          setConfirmModalOpen(true);
                        }}
                        color="error"
                      >
                        <DeleteOutline />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </StandardPageLayout>

      {/* Modais */}
      {confirmModalOpen && (
        <ConfirmationModal
          title={selectedQueue && `${i18n.t("queues.confirmationModal.deleteTitle")} ${selectedQueue.name}?`}
          open={confirmModalOpen}
          onClose={() => setConfirmModalOpen(false)}
          onConfirm={() => handleDeleteQueue(selectedQueue.id)}
        >
          {i18n.t("queues.confirmationModal.deleteMessage")}
        </ConfirmationModal>
      )}

      {queueModalOpen && (
        <QueueModal
          open={queueModalOpen}
          onClose={handleCloseQueueModal}
          queueId={selectedQueue?.id}
        />
      )}
    </>
  );
};

export default Queues;