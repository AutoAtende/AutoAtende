import React from 'react';
import { Alert, AlertTitle, Box, Typography } from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import { styled } from '@mui/material/styles';
import { i18n } from "../../../translate/i18n";

const StyledAlert = styled(Alert)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  '& .MuiAlert-message': {
    width: '100%'
  },
  backgroundColor: 'rgba(255, 244, 229, 1)',
  border: '2px solid rgba(255, 167, 38, 0.5)'
}));

const StyledTitle = styled(AlertTitle)(({ theme }) => ({
  fontSize: '1.1rem',
  fontWeight: 600,
  marginBottom: theme.spacing(1)
}));

const ContentBox = styled(Box)(({ theme }) => ({
  '& > div': {
    marginBottom: theme.spacing(1.5)
  }
}));

const Observation = styled(Box)(({ theme }) => ({
  backgroundColor: 'rgba(255, 244, 229, 0.5)',
  padding: theme.spacing(1.5),
  borderRadius: theme.spacing(1),
  marginTop: theme.spacing(1),
  fontSize: '0.875rem'
}));

const CampaignWarning = () => {
  return (
    <StyledAlert 
      severity="warning"
      icon={<InfoIcon fontSize="medium" />}
    >
      <StyledTitle>
        {i18n.t("campaigns.warning.title")}
      </StyledTitle>
      
      <ContentBox>
        <div>
          <Box fontWeight="600" component="span" mr={1}>
            {i18n.t("campaigns.warning.contactLimit.title")}
          </Box>
          {i18n.t("campaigns.warning.contactLimit.description")}
        </div>

        <div>
          <Box fontWeight="600" component="span" mr={1}>
            {i18n.t("campaigns.warning.interval.title")}
          </Box>
          {i18n.t("campaigns.warning.interval.description")}
        </div>
        <Observation>
          <Box fontWeight="600" component="span">
            {i18n.t("campaigns.warning.observation.title")}
          </Box>
          {' '}{i18n.t("campaigns.warning.observation.description")}
        </Observation>
      </ContentBox>
    </StyledAlert>
  );
};

export default CampaignWarning;