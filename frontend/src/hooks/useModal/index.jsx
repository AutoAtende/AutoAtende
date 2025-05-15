import React, { createContext, useContext, useState } from 'react';
import { MODAL_TYPES, SimpleModal } from '../../components/Modal/SimpleModal';

const ModalContext = createContext({});

const ModalProvider = ({ children }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [closeable, setCloseable] = useState(false);
  const [closeableOnlyWithCloseIcon, setCloseableOnlyWithCloseIcon] = useState(false);
  const [message, setMessage] = useState(null);
  const [isFull, setIsFull] = useState(false);

  const showMessage = (MessageComponent, props = {}, isCloseable = false, closeableOnlyWithCloseIcon = false, _isFull = false) => {
    setCloseable(isCloseable);
    setCloseableOnlyWithCloseIcon(closeableOnlyWithCloseIcon);
    setMessage(React.createElement(MessageComponent, { ...props }));
    setModalVisible(true);
    setIsFull(_isFull)
  };

  const closeModal = () => {
    setModalVisible(false);

    const removeContentToAnimation = () => {
      setMessage(null);
    };

    setTimeout(removeContentToAnimation, 300);
  };

  const error = (message, styles, color) => {
    showMessage(SimpleModal, {
      type: MODAL_TYPES.ERROR,
      message,
      styles,
      color,
    });
  };

  const warning = (message, styles) => {
    showMessage(SimpleModal, {
      type: MODAL_TYPES.WARNING,
      message,
      styles,
    });
  };

  const success = (message, styles) => {
    showMessage(SimpleModal, {
      type: MODAL_TYPES.SUCCESS,
      message,
      styles,
    });
  };

  const showSimple = {
    error,
    warning,
    success,
  };

  return (
    <ModalContext.Provider
      value={{
        modalVisible,
        message,
        closeable,
        closeableOnlyWithCloseIcon,
        showMessage,
        closeModal,
        showSimple,
        setIsFull,
        isFull
      }}
    >
      {children}
    </ModalContext.Provider>
  );
};

const useModal = () => {
  const context = useContext(ModalContext);
  return context;
};

export { ModalProvider, useModal, ModalContext };
