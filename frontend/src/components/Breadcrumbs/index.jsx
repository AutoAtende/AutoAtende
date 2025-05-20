import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Breadcrumbs as MuiBreadcrumbs,
  Link,
  Typography,
  Box
} from '@mui/material';
import { NavigateNext as NavigateNextIcon } from '@mui/icons-material';

const Breadcrumbs = ({ items = [] }) => {
  return (
    <Box mb={3}>
      <MuiBreadcrumbs
        separator={<NavigateNextIcon fontSize="small" />}
        aria-label="breadcrumb"
      >
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          
          return isLast ? (
            <Typography key={index} color="textPrimary">
              {item.label}
            </Typography>
          ) : (
            <Link
              key={index}
              component={RouterLink}
              to={item.link}
              color="inherit"
              underline="hover"
            >
              {item.label}
            </Link>
          );
        })}
      </MuiBreadcrumbs>
    </Box>
  );
};

export default Breadcrumbs;