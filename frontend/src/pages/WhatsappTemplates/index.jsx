import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  IconButton,
  Stack,
  Tooltip,
  Typography
} from "@mui/material";
import { 
  Add as AddIcon, 
  Edit as EditIcon, 
  Delete as DeleteIcon, 
  Visibility as VisibilityIcon,
  WhatsApp as WhatsAppIcon 
} from "@mui/icons-material";
import { DataGrid } from "@mui/x-data-grid";
import { useSpring, animated } from "react-spring";
import { toast } from "../../helpers/toast";

import api from "../../services/api";
import { i18n } from "../../translate/i18n";
import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import Title from "../../components/Title";
import TemplateEditor from "./components/TemplateEditor";
import DeleteConfirmationDialog from "../../components/DeleteConfirmationDialog";
import TableRowSkeleton from "../../components/TableRowSkeleton";

const AnimatedBox = animated(Box);

function WhatsappTemplates() {
  const [loading, setLoading] = useState(true);
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [showEditor, setShowEditor] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editorMode, setEditorMode] = useState("add");
  const [pageSize, setPageSize] = useState(10);
  
  const fadeIn = useSpring({
    from: { opacity: 0 },
    to: { opacity: 1 },
    config: { duration: 400 }
  });

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const { data } = await api.get("/templates");
      setTemplates(data);
    } catch (err) {
      toast.error("Erro ao carregar templates");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenEditor = (template = null, mode = "add") => {
    setSelectedTemplate(template);
    setEditorMode(mode);
    setShowEditor(true);
  };

  const handleCloseEditor = () => {
    setSelectedTemplate(null);
    setShowEditor(false);
    fetchTemplates();
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/templates/${selectedTemplate.id}`);
      toast.success("Template excluído com sucesso!");
      fetchTemplates();
    } catch (err) {
      toast.error("Erro ao excluir template");
    } finally {
      setShowDeleteDialog(false);
      setSelectedTemplate(null);
    }
  };

  const getStatusChip = (status) => {
    const statusMap = {
      APPROVED: { color: "success", label: "Aprovado" },
      PENDING: { color: "warning", label: "Pendente" },
      REJECTED: { color: "error", label: "Rejeitado" }
    };

    const { color, label } = statusMap[status] || { color: "default", label: status };

    return (
      <Chip
        label={label}
        color={color}
        size="small"
        variant="outlined"
        icon={<WhatsAppIcon fontSize="small" />}
      />
    );
  };

  const columns = [
    { 
      field: "name",
      headerName: "Nome",
      flex: 1,
      renderCell: (params) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography variant="body2">{params.value}</Typography>
        </Box>
      )
    },
    {
      field: "status",
      headerName: "Status",
      width: 150,
      renderCell: (params) => getStatusChip(params.value)
    },
    { 
      field: "language",
      headerName: "Idioma",
      width: 130,
      renderCell: (params) => (
        <Typography variant="body2">
          {params.value.toUpperCase()}
        </Typography>
      )
    },
    { 
      field: "category",
      headerName: "Categoria",
      width: 150,
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          color="primary"
          variant="outlined"
        />
      )
    },
    {
      field: "actions",
      headerName: "Ações",
      width: 150,
      sortable: false,
      renderCell: (params) => (
        <Stack direction="row" spacing={1}>
          <Tooltip title="Visualizar">
            <IconButton
              size="small"
              onClick={() => handleOpenEditor(params.row, "view")}
            >
              <VisibilityIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Editar">
            <IconButton
              size="small"
              onClick={() => handleOpenEditor(params.row, "edit")}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Excluir">
            <IconButton
              size="small"
              onClick={() => {
                setSelectedTemplate(params.row);
                setShowDeleteDialog(true);
              }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      )
    }
  ];

  return (
    <MainContainer>
      <MainHeader>
        <Title>Templates do WhatsApp</Title>
        <MainHeaderButtonsWrapper>
          <Button
            variant="contained"
            color="primary"
            onClick={() => handleOpenEditor(null, "add")}
            startIcon={<AddIcon />}
          >
            Novo Template
          </Button>
        </MainHeaderButtonsWrapper>
      </MainHeader>

      <AnimatedBox style={fadeIn}>
        <Card>
          <CardContent>
            <Box sx={{ height: 600, width: "100%" }}>
              <DataGrid
                rows={templates}
                columns={columns}
                pageSize={pageSize}
                rowsPerPageOptions={[5, 10, 25, 50]}
                onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
                disableSelectionOnClick
                loading={loading}
                components={{
                  LoadingOverlay: TableRowSkeleton
                }}
              />
            </Box>
          </CardContent>
        </Card>
      </AnimatedBox>

      {showEditor && (
        <TemplateEditor
          open={showEditor}
          onClose={handleCloseEditor}
          template={selectedTemplate}
          mode={editorMode}
        />
      )}

      <DeleteConfirmationDialog
        open={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        title="Excluir Template"
        message="Tem certeza que deseja excluir este template?"
        onConfirm={handleDelete}
      />
    </MainContainer>
  );
}

export default WhatsappTemplates;