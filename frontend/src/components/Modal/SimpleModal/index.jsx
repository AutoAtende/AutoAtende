import React from 'react';

import errorIcon from '../../../assets/icons/alerts/error.svg';
import warningIcon from '../../../assets/icons/alerts/warning.svg';
import successIcon from '../../../assets/icons/alerts/success.svg';
import ButtonPrimary from "@mui/material/Button";
import { useModal } from '../../../hooks/useModal';

import { Container } from './styles';

export const MODAL_TYPES = {
  ERROR: 'error',
  WARNING: 'warning',
  SUCCESS: 'success',
};

const icons = {
  [MODAL_TYPES.ERROR]: errorIcon,
  [MODAL_TYPES.WARNING]: warningIcon,
  [MODAL_TYPES.SUCCESS]: successIcon,
};

export const SimpleModal = ({ type, message, styles, color = 'primary' }) => {
  const { closeModal } = useModal();

  const onOk = () => {
    closeModal();
  };

  return (
    <Container style={styles}>
      <img src={icons[type]} alt={`${type} icon`} />
      <p>{message}</p>
      <ButtonPrimary onClick={onOk} color={color} variant='contained'>
        OK
      </ButtonPrimary>
    </Container>
  );
};
