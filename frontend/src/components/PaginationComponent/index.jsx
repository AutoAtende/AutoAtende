import React from 'react';
import { makeStyles } from '@mui/styles';
import { Select, MenuItem, Pagination, Tooltip } from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { i18n } from "../../translate/i18n";

const useStyles = makeStyles((theme) => ({
  paginationContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing(2),
  },
  selectContainer: {
    display: 'flex',
    alignItems: 'center',
  },
  infoIcon: {
    marginLeft: theme.spacing(1),
    fontSize: '1rem',
    color: theme.palette.text.secondary,
  },
}));

const PaginationComponent = ({
  count,
  page,
  perPage,
  onPageChange,
  onPerPageChange,
}) => {
  const classes = useStyles();

  const handlePerPageChange = (event) => {
    onPerPageChange(parseInt(event.target.value, 10));
  };

  const perPageOptions = [10, 20, 50, 100];

  return (
    <div className={classes.paginationContainer}>
      <div className={classes.selectContainer}>
        <Select
          value={perPage}
          onChange={handlePerPageChange}
          variant="outlined"
          size="small"
        >
          {perPageOptions.map((option) => (
            <MenuItem key={option} value={option}>
              {i18n.t('pagination.itemsPerPage', { count: option })}
            </MenuItem>
          ))}
        </Select>
        <Tooltip title={i18n.t('pagination.itemsPerPageTooltip')} arrow>
          <InfoOutlinedIcon className={classes.infoIcon} />
        </Tooltip>
      </div>
      <Pagination
        count={count}
        page={page}
        onChange={(event, newPage) => onPageChange(newPage)}
        color="primary"
      />
    </div>
  );
};

export default PaginationComponent;