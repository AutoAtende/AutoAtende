import React, { useContext, useEffect, useRef } from "react";

import closeIcon from "../../assets/icons/close.svg";

import { Container } from "./styles";

import { ModalContext, useModal } from "../../hooks/useModal";

export const ModalGlobalComponent = () => {
  const modalRef = useRef(null);
  const body = document.querySelector("body");
  const { isFull } = useContext(ModalContext);

  const {
    message,
    modalVisible,
    closeable,
    closeableOnlyWithCloseIcon,
    closeModal,
  } = useModal();

  useEffect(() => {
    if (body) {
      body.style.overflow = modalVisible ? "hidden" : "auto";
    }
  }, [modalVisible, body?.style.overflow]);

  useEffect(() => {
    const closeModalEvent = (event) => {
      if (closeable && !closeableOnlyWithCloseIcon && event.key === "Escape") {
        closeModal();
      }
    };

    window.addEventListener("keydown", closeModalEvent);

    return () => window.removeEventListener("keydown", closeModalEvent);
  }, [closeable, closeableOnlyWithCloseIcon]);

  const onClickOutModal = (event) => {
    if (
      closeable &&
      !closeableOnlyWithCloseIcon &&
      event.target === modalRef.current
    ) {
      closeModal();
    }
  };

  return (
    <Container
      show={modalVisible}
      onClick={onClickOutModal}
      ref={modalRef}
      isFull={isFull}
    >
      <div>
        {closeable && (
          <span data-test="fechar-modal" onClick={closeModal}>
            <img src={closeIcon} alt="Close icon" />
          </span>
        )}
        {message}
      </div>
    </Container>
  );
};
