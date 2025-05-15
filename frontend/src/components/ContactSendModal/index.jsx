import React, { useState, useEffect, useContext, useCallback, memo } from "react";
import { 
  styled,
  Grid, 
  TextField, 
  CircularProgress, 
  Checkbox,
  Autocomplete,
  Box,
  Typography,
  Button,
  useMediaQuery,
  useTheme
} from "@mui/material";
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';

import { i18n } from "../../translate/i18n";
import api from "../../services/api";
import { toast } from "../../helpers/toast";
import ButtonWithSpinner from "../ButtonWithSpinner";
import ContactModal from "../ContactModal";
import BaseModal from "../shared/BaseModal";
import { AuthContext } from "../../context/Auth/AuthContext";

const StyledContent = styled(Box)(({ theme }) => ({
  width: '100%',
  padding: theme.spacing(2),
  [theme.breakpoints.up('sm')]: {
    width: 400,
  },
}));

const StyledAutocomplete = styled(Autocomplete)(({ theme }) => ({
  width: '100%',
  '& .MuiAutocomplete-inputRoot': {
    paddingRight: '8px !important',
    '& .MuiAutocomplete-endAdornment': {
      top: 'calc(50% - 14px)',
    }
  }
}));

const ContactItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  width: '100%',
  padding: theme.spacing(1, 0),
  borderBottom: `1px solid ${theme.palette.divider}`,
}));

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;

const ContactSearchAutocomplete = memo(({ 
  options, 
  loading, 
  setSearchParam, 
  setSelectedContacts 
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Box sx={{ width: '100%' }}>
      <StyledAutocomplete
        multiple
        disableCloseOnSelect
        options={options}
        getOptionLabel={(option) => option.name}
        isOptionEqualToValue={(option, value) => option.id === value.id}
        onChange={(event, newValue) => setSelectedContacts(newValue)}
        renderOption={(props, option, { selected }) => (
          <ContactItem {...props}>
            <Checkbox
              icon={icon}
              checkedIcon={checkedIcon}
              sx={{ mr: 1 }}
              checked={selected}
            />
            <Typography variant="body2" noWrap>
              {option.name}
            </Typography>
          </ContactItem>
        )}
        renderInput={(params) => (
          <TextField
            {...params}
            label={i18n.t("SendContactModal.fieldLabel")}
            placeholder={isMobile ? "Buscar..." : "Buscar contatos..."}
            variant="outlined"
            autoFocus
            fullWidth
            onChange={e => setSearchParam(e.target.value)}
            InputProps={{
              ...params.InputProps,
              startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />,
              endAdornment: (
                <>
                  {loading && <CircularProgress color="inherit" size={20} />}
                  {params.InputProps.endAdornment}
                </>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
              }
            }}
          />
        )}
        sx={{
          '& .MuiAutocomplete-listbox': {
            maxHeight: 300,
          }
        }}
      />
    </Box>
  );
});

const ContactSendModal = ({ modalOpen, onClose }) => {
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchParam, setSearchParam] = useState("");
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [newContact, setNewContact] = useState({});
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const { user } = useContext(AuthContext);
  const { companyId } = user;
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    if (!modalOpen || searchParam.length < 3) {
      setLoading(false);
      return;
    }

    const searchContacts = async () => {
      try {
        setLoading(true);
        const { data } = await api.get('/contacts/list', {
          params: { companyId, searchParam }
        });
        setOptions(data);
      } catch (err) {
        toast.error(err);
      } finally {
        setLoading(false);
      }
    };

    const delayDebounceFn = setTimeout(searchContacts, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchParam, modalOpen, companyId]);

  const handleClose = useCallback(() => {
    onClose();
    setSearchParam("");
    setSelectedContacts([]);
  }, [onClose]);

  const handleSendVcard = useCallback(async () => {
    if (selectedContacts.length === 0) return;
    
    try {
      setLoading(true);
      onClose(selectedContacts);
    } catch (err) {
      toast.error(err);
    } finally {
      setLoading(false);
    }
  }, [selectedContacts, onClose]);

  const handleOpenContactModal = useCallback(() => {
    setNewContact({});
    setContactModalOpen(true);
  }, []);

  const handleCloseContactModal = useCallback(() => {
    setContactModalOpen(false);
  }, []);

  const handleAddNewContactTicket = useCallback(contact => {
    handleSendVcard([contact]);
  }, [handleSendVcard]);

  const modalActions = [
    {
      label: i18n.t("SendContactModal.buttons.cancel"),
      onClick: handleClose,
      disabled: loading,
      variant: "outlined",
      color: "secondary"
    },
    {
      label: i18n.t("SendContactModal.buttons.ok"),
      onClick: handleSendVcard,
      disabled: selectedContacts.length === 0,
      variant: "contained",
      color: "primary",
      loading: loading
    }
  ];

  return (
    <>
      {contactModalOpen && (
        <ContactModal
          open={contactModalOpen}
          initialValues={newContact}
          onClose={handleCloseContactModal}
          onSave={handleAddNewContactTicket}
        />
      )}
      
      <BaseModal
        open={modalOpen}
        onClose={handleClose}
        title={i18n.t("SendContactModal.title")}
        actions={modalActions}
        PaperProps={{
          sx: {
            width: isMobile ? '100%' : 'auto',
            maxWidth: 'none',
            m: isMobile ? 0 : 2,
            height: isMobile ? '100%' : 'auto',
            maxHeight: isMobile ? '100%' : '80vh',
          }
        }}
      >
        <StyledContent>
          <Box sx={{ mb: 2 }}>
            <ContactSearchAutocomplete
              options={options}
              loading={loading}
              setSearchParam={setSearchParam}
              setSelectedContacts={setSelectedContacts}
            />
          </Box>

          <Box sx={{ mt: 2 }}>
            <Button
              startIcon={<AddIcon />}
              onClick={handleOpenContactModal}
              variant="outlined"
              color="primary"
              size={isMobile ? 'medium' : 'small'}
              fullWidth={isMobile}
            >
              {i18n.t("SendContactModal.buttons.newContact")}
            </Button>
          </Box>

          {selectedContacts.length > 0 && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                {i18n.t("SendContactModal.selectedContacts")} ({selectedContacts.length})
              </Typography>
              <Box sx={{ 
                maxHeight: 150, 
                overflow: 'auto',
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 1,
                p: 1,
                bgcolor: theme.palette.background.paper
              }}>
                {selectedContacts.map(contact => (
                  <Box key={contact.id} sx={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    p: 0.5
                  }}>
                    <Checkbox
                      icon={icon}
                      checkedIcon={checkedIcon}
                      checked={true}
                      size="small"
                      sx={{ mr: 1 }}
                    />
                    <Typography variant="body2">{contact.name}</Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          )}
        </StyledContent>
      </BaseModal>
    </>
  );
};

export default memo(ContactSendModal);