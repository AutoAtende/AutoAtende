import React from 'react';
import { makeStyles } from '@mui/styles';
import { 
  InputAdornment, 
  TextField, 
  Button, 
  IconButton,
  Tooltip,
  Box,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { Search, Table2, LayoutGrid } from 'lucide-react';

const useStyles = makeStyles(theme => ({
  root: {
    width: '100%',
    display: 'flex',
    justifyContent: 'flex-end',
    gap: theme.spacing(2),
    [theme.breakpoints.down('sm')]: {
      flexDirection: 'column',
      alignItems: 'flex-end'
    }
  },
  searchContainer: {
    width: 'auto',
    minWidth: 280,
    maxWidth: 400,
    [theme.breakpoints.down('sm')]: {
      width: '100%'
    }
  },
  actionsContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    flexWrap: 'nowrap'
  },
  viewControls: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: theme.palette.grey[100],
    borderRadius: theme.shape.borderRadius,
    padding: theme.spacing(0.5),
    marginRight: theme.spacing(1)
  },
  viewButton: {
    padding: theme.spacing(1),
    borderRadius: theme.shape.borderRadius,
    '&.active': {
      backgroundColor: theme.palette.common.white,
      boxShadow: theme.shadows[1]
    }
  },
  actionButton: {
    minWidth: 'auto',
    [theme.breakpoints.down('sm')]: {
      padding: theme.spacing(1),
      '& .MuiButton-startIcon': {
        margin: 0
      }
    }
  },
  actionButtonLabel: {
    [theme.breakpoints.down('sm')]: {
      display: 'none'
    }
  }
}));

const SearchActionBar = ({
  searchValue = "",
  onSearchChange = () => {},
  viewMode = "table",
  onViewModeChange = () => {},
  actions = [],
}) => {
  const classes = useStyles();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleSearchChange = (e) => {
    onSearchChange(e.target.value);
  };

  return (
    <Box className={classes.root}>
      {/* Search Field */}
      <Box className={classes.searchContainer}>
        <Tooltip title="Digite para pesquisar">
          <TextField
            fullWidth
            placeholder="Digite para pesquisar"
            value={searchValue}
            onChange={handleSearchChange}
            variant="outlined"
            size="small"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search size={20} />
                </InputAdornment>
              ),
            }}
          />
        </Tooltip>
      </Box>

      <Box className={classes.actionsContainer}>
        {/* View Mode Toggle */}
        <Box className={classes.viewControls}>
          <Tooltip title="Visualização em tabela">
            <IconButton
              onClick={() => onViewModeChange("table")}
              className={`${classes.viewButton} ${viewMode === "table" ? 'active' : ''}`}
              size="small"
            >
              <Table2 size={20} />
            </IconButton>
          </Tooltip>

          <Tooltip title="Visualização em cards">
            <IconButton
              onClick={() => onViewModeChange("grid")}
              className={`${classes.viewButton} ${viewMode === "grid" ? 'active' : ''}`}
              size="small"
            >
              <LayoutGrid size={20} />
            </IconButton>
          </Tooltip>
        </Box>

        {/* Action Buttons */}
        {actions.map((action, index) => (
          <Tooltip key={index} title={isMobile ? action.label : action.tooltip || ''}>
            <Button
              variant={action.variant === "primary" ? "contained" : "outlined"}
              color="primary"
              onClick={action.onClick}
              className={classes.actionButton}
              size="medium"
              startIcon={action.icon}
            >
              <span className={classes.actionButtonLabel}>
                {action.label}
              </span>
            </Button>
          </Tooltip>
        ))}
      </Box>
    </Box>
  );
};

export default SearchActionBar;