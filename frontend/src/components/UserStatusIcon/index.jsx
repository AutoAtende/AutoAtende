import React from "react";
import { styled } from '@mui/material/styles';
import { green, red } from '@mui/material/colors';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';

const OnlineIcon = styled(CheckCircleIcon)(({ theme }) => ({
  color: green[600],
  fontSize: '20px',
  '&:hover': {
    color: green[800],
  },
}));

const OfflineIcon = styled(ErrorIcon)(({ theme }) => ({
  color: red[600],
  fontSize: '20px',
  '&:hover': {
    color: red[800],
  },
}));

const UserStatusIcon = ({ user }) => {
  return user.online ? (
    <OnlineIcon data-testid="online-status" />
  ) : (
    <OfflineIcon data-testid="offline-status" />
  );
};

export default UserStatusIcon;