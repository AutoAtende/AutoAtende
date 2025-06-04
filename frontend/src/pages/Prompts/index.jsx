import React, { useContext, useEffect, useReducer, useState } from "react";
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
import { DeleteOutline, Edit, Add as AddIcon } from "@mui/icons-material";
import { toast } from "../../helpers/toast";

import StandardPageLayout from "../../components/shared/StandardPageLayout";
import ConfirmationModal from "../../components/ConfirmationModal";
import PromptModal from "../../components/PromptModal";

import { i18n } from "../../translate/i18n";
import api from "../../services/api";
import { SocketContext } from "../../context/Socket/SocketContext";
import { AuthContext } from "../../context/Auth/AuthContext";

const reducer = (state, action) => {
  if (action.type === "LOAD_PROMPTS") {
    const prompts = action.payload;
    const newPrompts = [];

    prompts.forEach((prompt) => {
      const promptIndex = state.findIndex((p) => p.id === prompt.id);
      if (promptIndex !== -1) {
        state[promptIndex] = prompt;
      } else {
        newPrompts.push(prompt);
      }
    });

    return [...state, ...newPrompts];
  }

  if (action.type === "UPDATE_PROMPTS") {
    const prompt = action.payload;
    const promptIndex = state.findIndex((p) => p.id === prompt.id);

    if (promptIndex !== -1) {
      state[promptIndex] = prompt;
      return [...state];
    } else {
      return [prompt, ...state];
    }
  }

  if (action.type === "DELETE_PROMPT") {
    const promptId = action.payload;
    const promptIndex = state.findIndex((p) => p.id === promptId);
    if (promptIndex !== -1) {
      state.splice(promptIndex, 1);
    }
    return [...state];
  }

  if (action.type === "RESET") {
    return [];
  }
};

const Prompts = () => {
  const { user } = useContext(AuthContext);
  const socketManager = useContext(SocketContext);
  const [prompts, dispatch] = useReducer(reducer, []);
  const [loading, setLoading] = useState(false);
  const [searchParam, setSearchParam] = useState("");

  const [promptModalOpen, setPromptModalOpen] = useState(false);
  const [selectedPrompt, setSelectedPrompt] = useState(null);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);

  const fetchPrompts = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/prompt");
      dispatch({ type: "LOAD_PROMPTS", payload: data.prompts });
    } catch (err) {
      toast.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrompts();
  }, []);

  useEffect(() => {
    const companyId = localStorage.getItem("companyId");
    const socket = socketManager.GetSocket(companyId);

    socket.on("prompt", (data) => {
      if (data.action === "update" || data.action === "create") {
        dispatch({ type: "UPDATE_PROMPTS", payload: data.prompt });
      }

      if (data.action === "delete") {
        dispatch({ type: "DELETE_PROMPT", payload: data.promptId });
      }
    });

    return () => {
      socket.off("prompt");
    };
  }, [socketManager]);

  const handleOpenPromptModal = () => {
    setPromptModalOpen(true);
    setSelectedPrompt(null);
  };

  const handleClosePromptModal = () => {
    setPromptModalOpen(false);
    setSelectedPrompt(null);
  };

  const handleEditPrompt = (prompt) => {
    setSelectedPrompt(prompt);
    setPromptModalOpen(true);
  };

  const handleDeletePrompt = async () => {
    try {
      await api.delete(`/prompt/${selectedPrompt.id}`);
      toast.success(i18n.t("prompts.toasts.deleted"));
    } catch (err) {
      toast.error(i18n.t("prompts.toasts.deleteError"));
    }
    setSelectedPrompt(null);
    setConfirmModalOpen(false);
  };

  const handleSearch = (event) => {
    setSearchParam(event.target.value.toLowerCase());
  };

  // Configuração das ações do cabeçalho
  const pageActions = [
    {
      label: i18n.t("prompts.buttons.add"),
      icon: <AddIcon />,
      onClick: handleOpenPromptModal,
      variant: "contained",
      color: "primary",
      tooltip: "Adicionar novo prompt"
    }
  ];

  // Filtrar prompts baseado na pesquisa
  const getFilteredPrompts = () => {
    if (!searchParam) return prompts;
    
    return prompts.filter(prompt =>
      prompt.name?.toLowerCase().includes(searchParam) ||
      prompt.queue?.name?.toLowerCase().includes(searchParam)
    );
  };

  const filteredPrompts = getFilteredPrompts();

  return (
    <>
      <StandardPageLayout
        title={i18n.t("prompts.title")}
        actions={pageActions}
        searchValue={searchParam}
        onSearchChange={handleSearch}
        searchPlaceholder="Pesquisar prompts..."
        showSearch={true}
        loading={loading}
      >
        {loading ? (
          <Box display="flex" justifyContent="center" p={3}>
            <CircularProgress />
          </Box>
        ) : filteredPrompts.length === 0 ? (
          <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" p={5}>
            <Typography variant="h6" color="textSecondary" gutterBottom>
              {searchParam ? "Nenhum prompt encontrado" : "Nenhum prompt cadastrado"}
            </Typography>
            <Typography variant="body2" color="textSecondary" paragraph>
              {searchParam ? "Tente ajustar sua pesquisa" : "Crie seu primeiro prompt para começar"}
            </Typography>
          </Box>
        ) : (
          <TableContainer sx={{ height: '100%', overflow: 'auto' }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell align="left">
                    {i18n.t("prompts.table.name")}
                  </TableCell>
                  <TableCell align="left">
                    {i18n.t("prompts.table.queue")}
                  </TableCell>
                  <TableCell align="left">
                    {i18n.t("prompts.table.max_tokens")}
                  </TableCell>
                  <TableCell align="center">
                    {i18n.t("prompts.table.actions")}
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredPrompts.map((prompt) => (
                  <TableRow key={prompt.id} hover>
                    <TableCell align="left">{prompt.name}</TableCell>
                    <TableCell align="left">{prompt.queue?.name}</TableCell>
                    <TableCell align="left">{prompt.maxTokens}</TableCell>
                    <TableCell align="center">
                      <IconButton
                        size="small"
                        onClick={() => handleEditPrompt(prompt)}
                        color="primary"
                      >
                        <Edit />
                      </IconButton>

                      <IconButton
                        size="small"
                        onClick={() => {
                          setSelectedPrompt(prompt);
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
          title={
            selectedPrompt &&
            `${i18n.t("prompts.confirmationModal.deleteTitle")} ${selectedPrompt.name}?`
          }
          open={confirmModalOpen}
          onClose={() => setConfirmModalOpen(false)}
          onConfirm={handleDeletePrompt}
        >
          {i18n.t("prompts.confirmationModal.deleteMessage")}
        </ConfirmationModal>
      )}

      {promptModalOpen && (
        <PromptModal
          open={promptModalOpen}
          onClose={handleClosePromptModal}
          promptId={selectedPrompt?.id}
        />
      )}
    </>
  );
};

export default Prompts;