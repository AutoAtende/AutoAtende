// announcementsStyles.js
import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme) => ({
  mainContainer: {
    display: 'flex',
    flexDirection: 'column',
    padding: theme.spacing(2),
    height: '100%'
  },
  searchContainer: {
    display: 'flex',
    gap: theme.spacing(2),
    marginBottom: theme.spacing(3),
    [theme.breakpoints.down('sm')]: {
      flexDirection: 'column'
    }
  },
  actionsContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1)
  },
  cardGrid: {
    padding: theme.spacing(2)
  },
  card: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    transition: 'all 0.3s ease',
    '&:hover': {
      transform: 'translateY(-4px)',
      boxShadow: theme.shadows[4]
    }
  },
  cardMedia: {
    paddingTop: '56.25%', // 16:9
    position: 'relative'
  },
  cardContent: {
    flexGrow: 1
  },
  cardActions: {
    padding: theme.spacing(2),
    justifyContent: 'space-between',
    borderTop: `1px solid ${theme.palette.divider}`
  },
  priorityChip: {
    position: 'absolute',
    top: theme.spacing(1),
    right: theme.spacing(1)
  },
  htmlContent: {
    '& img': {
      maxWidth: '100%',
      height: 'auto'
    },
    '& ul, & ol': {
      paddingLeft: theme.spacing(2)
    },
    '& blockquote': {
      borderLeft: `4px solid ${theme.palette.primary.main}`,
      paddingLeft: theme.spacing(2),
      margin: theme.spacing(2, 0),
      fontStyle: 'italic'
    }
  },
  paginationContainer: {
    padding: theme.spacing(3),
    display: 'flex',
    justifyContent: 'center'
  }
}));