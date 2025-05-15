import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Chip,
  Autocomplete,
  TextField,
  CircularProgress,
  Divider,
  Paper,
  Stack,
  useTheme
} from '@mui/material';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import { toast } from "../../helpers/toast";
import { i18n } from "../../translate/i18n";
import api from "../../services/api";

const ContactTagsManager = ({ contactId, readOnly = false, onChange }) => {
  const theme = useTheme();
  const [loading, setLoading] = useState(false);
  const [loadingTags, setLoadingTags] = useState(false);
  const [selectedTags, setSelectedTags] = useState([]);
  const [availableTags, setAvailableTags] = useState([]);

  const fetchTags = async () => {
    try {
      setLoadingTags(true);
      const { data } = await api.get('/tags/list');
      setAvailableTags(data);
    } catch (err) {
      toast.error(err.message || i18n.t("contactTagsManager.errors.loadTags"));
    } finally {
      setLoadingTags(false);
    }
  };

  const fetchContactTags = async () => {
    if (!contactId) return;
    
    try {
      setLoading(true);
      const { data } = await api.get(`/contacts/${contactId}/tags`);
      setSelectedTags(data || []);
      if (onChange) {
        onChange(data || []);
      }
    } catch (err) {
      toast.error(err.message || i18n.t("contactTagsManager.errors.loadContactTags"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTags();
  }, []);

  useEffect(() => {
    fetchContactTags();
  }, [contactId]);

  const handleTagsChange = async (_, newTags) => {
    try {
      setLoading(true);
      const tagIds = newTags.map(tag => tag.id);
      
      const { data } = await api.post(`/contacts/${contactId}/tags`, {
        tagIds
      });
      
      setSelectedTags(data.tags || []);
      if (onChange) {
        onChange(data.tags || []);
      }
      
      toast.success(i18n.t("contactTagsManager.success.updated"));
    } catch (err) {
      toast.error(err.message || i18n.t("contactTagsManager.errors.updateTags"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper 
      variant="outlined" 
      sx={{ 
        p: 2, 
        backgroundColor: theme.palette.mode === 'dark' ? theme.palette.background.paper : theme.palette.background.paper,
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: theme.shape.borderRadius,
      }}
    >
      {loading ? (
        <Box display="flex" justifyContent="center" p={2}>
          <CircularProgress size={24} />
        </Box>
      ) : (
        <Box>
          <Autocomplete
            multiple
            id="contact-tags"
            options={availableTags}
            getOptionLabel={(option) => option.name}
            value={selectedTags}
            onChange={handleTagsChange}
            loading={loadingTags}
            disabled={readOnly}
            renderInput={(params) => (
              <TextField
                {...params}
                variant="outlined"
                placeholder={selectedTags.length === 0 ? i18n.t("contactTagsManager.selectTags") : ""}
                InputProps={{
                  ...params.InputProps,
                  startAdornment: (
                    <>
                      <LocalOfferIcon color="primary" sx={{ mr: 1 }} />
                      {params.InputProps.startAdornment}
                    </>
                  ),
                  endAdornment: (
                    <>
                      {loadingTags ? <CircularProgress color="inherit" size={20} /> : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip
                  label={option.name}
                  {...getTagProps({ index })}
                  style={{
                    backgroundColor: option.color || theme.palette.grey[600],
                    color: '#fff',
                    margin: '2px'
                  }}
                />
              ))
            }
          />
          
          {selectedTags.length === 0 && !loading && (
            <Typography 
              variant="body2" 
              color="textSecondary" 
              align="center" 
              sx={{ 
                mt: 1,
                color: theme.palette.mode === 'dark' ? theme.palette.grey[400] : theme.palette.grey[600]
              }}
            >
              {i18n.t("contactTagsManager.noTags")}
            </Typography>
          )}
        </Box>
      )}
    </Paper>
  );
};

export default ContactTagsManager;