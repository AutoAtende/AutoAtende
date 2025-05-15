import React, { useState } from "react";
import { 
  IconButton, 
  Typography, 
  Box,
  Tooltip,
  useMediaQuery,
  useTheme
} from "@mui/material";
import {
  Info as InfoIcon,
  AccessTime as TimeIcon,
  Autorenew as RecurringIcon,
  FormatListBulleted as ListIcon,
  Rocket as RocketIcon,
  SwapHoriz as MoveIcon
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import BaseModal from "../../../components/shared/BaseModal";
import { i18n } from "../../../translate/i18n";

const InfoSection = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  '&:last-child': {
    marginBottom: 0
  }
}));

const IconContainer = styled(Box)(({ theme }) => ({
  display: 'inline-flex',
  marginRight: theme.spacing(1),
  color: theme.palette.primary.main
}));

const StrongText = styled('strong')(({ theme }) => ({
  color: theme.palette.primary.main,
  fontWeight: 600
}));

const InfoModal = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [open, setOpen] = useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const modalActions = [
    {
      label: i18n.t('kanban.infoModal.closeButton'),
      onClick: handleClose,
      variant: "outlined",
      color: "primary"
    }
  ];

  return (
    <>
      <Tooltip title={i18n.t('kanban.infoModal.tooltipInfo')}>
        <IconButton onClick={handleOpen} size={isMobile ? "medium" : "large"}>
          <InfoIcon sx={{ color: theme.palette.text.primary }} />
        </IconButton>
      </Tooltip>
      
      <BaseModal
        open={open}
        onClose={handleClose}
        title={i18n.t('kanban.infoModal.title')}
        actions={modalActions}
        maxWidth="md"
      >
        <Box sx={{ py: 1 }}>
          <InfoSection>
            <Typography variant="body1" sx={{ display: 'flex', alignItems: 'flex-start' }}>
              <IconContainer>
                <TimeIcon />
              </IconContainer>
              <Box>
                <StrongText>{i18n.t('kanban.infoModal.scheduleTimeTitle')}</StrongText> {i18n.t('kanban.infoModal.scheduleTimeDescription')}
              </Box>
            </Typography>
          </InfoSection>
          
          <InfoSection>
            <Typography variant="body1" sx={{ display: 'flex', alignItems: 'flex-start' }}>
              <IconContainer>
                <RecurringIcon />
              </IconContainer>
              <Box>
                <StrongText>{i18n.t('kanban.infoModal.recurringScheduleTitle')}</StrongText>
                <Box component="ol" sx={{ pl: 2, mt: 1 }}>
                  <li>{i18n.t('kanban.infoModal.recurringStep1')}</li>
                  <li>{i18n.t('kanban.infoModal.recurringStep2')}</li>
                  <li>
                    {i18n.t('kanban.infoModal.recurringStep3')}
                    <Box component="ul" sx={{ pl: 2, mt: 0.5 }}>
                      <li>{i18n.t('kanban.infoModal.subStep1')}</li>
                      <li>{i18n.t('kanban.infoModal.subStep2')}</li>
                      <li>{i18n.t('kanban.infoModal.subStep3')}</li>
                      <li>{i18n.t('kanban.infoModal.subStep4')}</li>
                      <li>{i18n.t('kanban.infoModal.subStep5')}</li>
                      <li>{i18n.t('kanban.infoModal.subStep6')}</li>
                    </Box>
                  </li>
                </Box>
              </Box>
            </Typography>
          </InfoSection>
          
          <InfoSection>
            <Typography variant="body1" sx={{ display: 'flex', alignItems: 'flex-start' }}>
              <IconContainer>
                <ListIcon />
              </IconContainer>
              <Box>
                <StrongText>{i18n.t('kanban.infoModal.noActiveCampaignsTitle')}</StrongText>
                <Box component="ul" sx={{ pl: 2, mt: 0.5 }}>
                  <li>{i18n.t('kanban.infoModal.noActiveCampaignsDescription')}</li>
                </Box>
              </Box>
            </Typography>
          </InfoSection>
          
          <InfoSection>
            <Typography variant="body1" sx={{ display: 'flex', alignItems: 'flex-start' }}>
              <IconContainer>
                <RocketIcon />
              </IconContainer>
              <Box>
                <StrongText>{i18n.t('kanban.infoModal.createCampaignTitle')}</StrongText>
                <Box component="ul" sx={{ pl: 2, mt: 0.5 }}>
                  <li>{i18n.t('kanban.infoModal.createCampaignDescription')}</li>
                </Box>
              </Box>
            </Typography>
          </InfoSection>
          
          <InfoSection>
            <Typography variant="body1" sx={{ display: 'flex', alignItems: 'flex-start' }}>
              <IconContainer>
                <MoveIcon />
              </IconContainer>
              <Box>
                <StrongText>{i18n.t('kanban.infoModal.moveTicketsTitle')}</StrongText>
                <Box component="ul" sx={{ pl: 2, mt: 0.5 }}>
                  <li>{i18n.t('kanban.infoModal.moveTicketsStep1')}</li>
                  <li>{i18n.t('kanban.infoModal.moveTicketsStep2')}</li>
                  <li>{i18n.t('kanban.infoModal.moveTicketsStep3')}</li>
                </Box>
              </Box>
            </Typography>
          </InfoSection>
        </Box>
      </BaseModal>
    </>
  );
};

export default InfoModal;