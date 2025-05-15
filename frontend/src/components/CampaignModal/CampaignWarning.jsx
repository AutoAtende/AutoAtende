import { Alert, AlertTitle } from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import { Box } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { i18n } from "../../translate/i18n";

const useStyles = makeStyles((theme) => ({
  alert: {
    marginBottom: theme.spacing(2),
    '& .MuiAlert-message': {
      width: '100%'
    },
    backgroundColor: 'rgba(255, 244, 229, 1)',
    border: '2px solid rgba(255, 167, 38, 0.5)'
  },
  title: {
    fontSize: '1.1rem',
    fontWeight: 600,
    marginBottom: theme.spacing(1)
  },
  content: {
    '& > div': {
      marginBottom: theme.spacing(1.5)
    }
  },
  listContainer: {
    marginLeft: theme.spacing(3),
    '& li': {
      marginBottom: theme.spacing(0.5)
    }
  },
  observation: {
    backgroundColor: 'rgba(255, 244, 229, 0.5)',
    padding: theme.spacing(1.5),
    borderRadius: theme.spacing(1),
    marginTop: theme.spacing(1),
    fontSize: '0.875rem'
  }
}));

const CampaignWarning = () => {
  const classes = useStyles();

  return (
    <Alert 
      severity="warning"
      icon={<InfoIcon fontSize="medium" />}
      className={classes.alert}
    >
      <AlertTitle className={classes.title}>
        {i18n.t("campaigns.warning.title")}
      </AlertTitle>
      
      <Box className={classes.content}>
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
        <Box className={classes.observation}>
          <Box fontWeight="600" component="span">
            {i18n.t("campaigns.warning.observation.title")}
          </Box>
          {' '}{i18n.t("campaigns.warning.observation.description")}
        </Box>
      </Box>
    </Alert>
  );
};

export default CampaignWarning;