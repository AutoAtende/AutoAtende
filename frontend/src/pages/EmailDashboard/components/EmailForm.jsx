// src/pages/EmailDashboard/components/EmailForm.jsx
import React, { useState, useCallback } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { 
  Typography, 
  TextField, 
  Button, 
  CircularProgress, 
  Tooltip, 
  Box, 
  Paper, 
  IconButton,
  FormHelperText,
  Zoom,
  Collapse,
  Divider
} from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { styled } from '@mui/material/styles';
import SendIcon from '@mui/icons-material/Send';
import ScheduleIcon from '@mui/icons-material/Schedule';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { i18n } from "../../../translate/i18n";
import { debounce } from '../../../utils/helpers';

// Styled components
const StyledForm = styled('form')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(3),
  width: '100%',
}));

// Component
const EmailForm = ({ title, variant = 'send', onSubmit, isLoading, isMobile }) => {
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [recipientCount, setRecipientCount] = useState(0);

  // Validação do formulário
  const validationSchema = Yup.object().shape({
    sender: Yup.string()
      .required(i18n.t('email.validations.senderRequired'))
      .test('valid-emails', i18n.t('email.validations.invalidEmails'), (value) => {
        if (!value) return false;
        const emails = value.split(',').map(email => email.trim());
        return emails.every(email => Yup.string().email().isValidSync(email));
      }),
    subject: Yup.string().required(i18n.t('email.validations.subjectRequired')),
    message: Yup.string().required(i18n.t('email.validations.messageRequired')),
    sendAt: variant === 'schedule' 
      ? Yup.date().min(new Date(), i18n.t('email.validations.dateInPast'))
      : Yup.date()
  });

  // Configuração do formik
  const formik = useFormik({
    initialValues: {
      sender: '',
      subject: '',
      message: '',
      sendAt: variant === 'schedule' ? '' : undefined,
      attachments: [],
    },
    validationSchema,
    validateOnChange: false,
    validateOnBlur: true,
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      const success = await onSubmit(values);
      
      if (success) {
        resetForm();
        setIsAdvancedOpen(false);
      }
      
      setSubmitting(false);
    },
  });

  // Contagem de destinatários
  const updateRecipientCount = useCallback(
    debounce((value) => {
      if (!value) {
        setRecipientCount(0);
        return;
      }
      
      const emails = value.split(',').map(email => email.trim()).filter(email => email);
      setRecipientCount(emails.length);
    }, 300),
    []
  );

  // Gerenciamento de anexos (simulado)
  const handleAttachmentChange = (e) => {
    // Esta função seria implementada com real upload de arquivos
    console.log('Arquivos selecionados:', e.target.files);
    formik.setFieldValue('attachments', Array.from(e.target.files));
  };

  const toggleAdvancedOptions = () => {
    setIsAdvancedOpen(!isAdvancedOpen);
  };

  // Renderização do formulário
  return (
    <Box>
      <Typography 
        variant={isMobile ? "h6" : "h5"} 
        component="h2" 
        gutterBottom
        sx={{ fontWeight: 500, mb: 3 }}
      >
        {title}
      </Typography>
      
      <StyledForm onSubmit={formik.handleSubmit}>
        <TextField
          name="sender"
          label={i18n.t('email.fields.sender')}
          placeholder={i18n.t('email.placeholders.sender')}
          value={formik.values.sender}
          onChange={(e) => {
            formik.handleChange(e);
            updateRecipientCount(e.target.value);
          }}
          onBlur={formik.handleBlur}
          error={formik.touched.sender && Boolean(formik.errors.sender)}
          helperText={
            formik.touched.sender && formik.errors.sender ? 
              formik.errors.sender : 
              recipientCount > 0 ? 
                i18n.t('email.helperTexts.recipientCount', { count: recipientCount }) : 
                ''
          }
          fullWidth
          variant="outlined"
          InputProps={{
            endAdornment: (
              <Tooltip 
                title={i18n.t('email.tooltips.sender')} 
                arrow
                TransitionComponent={Zoom}
              >
                <HelpOutlineIcon color="action" fontSize="small" sx={{ ml: 1 }} />
              </Tooltip>
            )
          }}
          aria-describedby="sender-helper-text"
          inputProps={{
            'aria-label': i18n.t('email.ariaLabels.sender'),
          }}
        />
        
        <TextField
          name="subject"
          label={i18n.t('email.fields.subject')}
          placeholder={i18n.t('email.placeholders.subject')}
          value={formik.values.subject}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.subject && Boolean(formik.errors.subject)}
          helperText={formik.touched.subject && formik.errors.subject}
          fullWidth
          variant="outlined"
          InputProps={{
            endAdornment: (
              <Tooltip 
                title={i18n.t('email.tooltips.subject')} 
                arrow
                TransitionComponent={Zoom}
              >
                <HelpOutlineIcon color="action" fontSize="small" sx={{ ml: 1 }} />
              </Tooltip>
            )
          }}
          aria-describedby="subject-helper-text"
          inputProps={{
            'aria-label': i18n.t('email.ariaLabels.subject'),
          }}
        />
        
        <TextField
          name="message"
          label={i18n.t('email.fields.message')}
          placeholder={i18n.t('email.placeholders.message')}
          multiline
          rows={6}
          value={formik.values.message}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.message && Boolean(formik.errors.message)}
          helperText={formik.touched.message && formik.errors.message}
          fullWidth
          variant="outlined"
          InputProps={{
            endAdornment: (
              <Tooltip 
                title={i18n.t('email.tooltips.message')} 
                arrow
                TransitionComponent={Zoom}
              >
                <HelpOutlineIcon color="action" fontSize="small" sx={{ ml: 1 }} />
              </Tooltip>
            ),
          }}
          aria-describedby="message-helper-text"
          inputProps={{
            'aria-label': i18n.t('email.ariaLabels.message'),
          }}
        />
        
        {variant === 'schedule' && (
          <TextField
            name="sendAt"
            label={i18n.t('email.fields.sendAt')}
            type="datetime-local"
            value={formik.values.sendAt}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.sendAt && Boolean(formik.errors.sendAt)}
            helperText={
              formik.touched.sendAt && formik.errors.sendAt ? 
                formik.errors.sendAt : 
                i18n.t('email.helperTexts.sendAt')
            }
            fullWidth
            variant="outlined"
            InputLabelProps={{
              shrink: true,
            }}
            InputProps={{
              endAdornment: (
                <Tooltip 
                  title={i18n.t('email.tooltips.sendAt')} 
                  arrow
                  TransitionComponent={Zoom}
                >
                  <HelpOutlineIcon color="action" fontSize="small" sx={{ ml: 1 }} />
                </Tooltip>
              ),
            }}
            aria-describedby="sendAt-helper-text"
            inputProps={{
              'aria-label': i18n.t('email.ariaLabels.sendAt'),
              min: new Date().toISOString().slice(0, 16) // Impede datas no passado
            }}
          />
        )}
        
        {/* Opções avançadas - anexos, etc */}
        <Box>
          <Button
            type="button"
            color="secondary"
            size="small"
            onClick={toggleAdvancedOptions}
            sx={{ mb: 2 }}
          >
            {isAdvancedOpen ? i18n.t('email.buttons.hideAdvanced') : i18n.t('email.buttons.showAdvanced')}
          </Button>
          
          <Collapse in={isAdvancedOpen}>
            <Paper 
              variant="outlined" 
              sx={{ p: 2, mb: 2, bgcolor: theme => theme.palette.background.default }}
            >
              <Box 
                sx={{ 
                  display: 'flex', 
                  flexDirection: isMobile ? 'column' : 'row',
                  alignItems: 'center',
                  gap: 2,
                  mb: 2 
                }}
              >
                <Typography variant="subtitle2">
                  {i18n.t('email.fields.attachments')}
                </Typography>
                
                <Button
                  component="label"
                  variant="outlined"
                  startIcon={<AttachFileIcon />}
                  size="small"
                >
                  {i18n.t('email.buttons.attachFile')}
                  <input
                    type="file"
                    hidden
                    multiple
                    onChange={handleAttachmentChange}
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  />
                </Button>
                
                {formik.values.attachments.length > 0 && (
                  <Typography variant="caption" color="textSecondary">
                    {i18n.t('email.helperTexts.attachmentCount', { count: formik.values.attachments.length })}
                  </Typography>
                )}
              </Box>
              
              {/* Lista de anexos selecionados */}
              {formik.values.attachments.length > 0 && (
  <Box sx={{ mb: 2, maxHeight: '150px', overflowY: 'auto' }}>
    {formik.values.attachments.map((file, index) => (
      <Box 
        key={index}
        sx={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center',
          p: 1,
          borderBottom: '1px solid',
          borderColor: 'divider'
        }}
      >
        <Typography variant="body2" noWrap sx={{ maxWidth: '70%' }}>
          {file.name}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography variant="caption" color="textSecondary" sx={{ mr: 1 }}>
            {(file.size / 1024).toFixed(0)} KB
          </Typography>
          <IconButton 
            size="small" 
            color="error" 
            onClick={() => {
              // Remover o arquivo do array de anexos
              const newAttachments = [...formik.values.attachments];
              newAttachments.splice(index, 1);
              formik.setFieldValue('attachments', newAttachments);
            }}
            aria-label={i18n.t('email.ariaLabels.removeAttachment')}
          >
            <DeleteOutlineIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>
    ))}
  </Box>
)}
            </Paper>
          </Collapse>
        </Box>
        
        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          disabled={formik.isSubmitting || isLoading}
          startIcon={variant === 'schedule' ? <ScheduleIcon /> : <SendIcon />}
          size={isMobile ? "medium" : "large"}
          sx={{ 
            py: 1.5, 
            mt: 2,
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {isLoading ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            variant === 'schedule' 
              ? i18n.t('email.buttons.schedule')
              : i18n.t('email.buttons.send')
          )}
        </Button>
      </StyledForm>
    </Box>
  );
};

export default React.memo(EmailForm);