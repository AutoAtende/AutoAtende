import { hexToRgba } from "../../helpers/hexToRgba";
import styled, { css } from "styled-components";

export const Container = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  display: flex;
  align-items: center;
  justify-content: center;

  width: 100vw;
  height: 113vh;

  background: ${hexToRgba("#303030", 0.5)};
  opacity: 0;
  z-index: 0;
  visibility: hidden;
  transition: 0.3s;

  ${({ show }) =>
    show &&
    css`
      z-index: 99999;
      opacity: 1;
      visibility: visible;
    `}

  > div {
    background: #ffffff;
    box-shadow: 0px 2px 8px rgba(48, 48, 48, 0.5);
    border-radius: 8px;

    display: flex;
    flex-direction: column;
    align-items: center;

    height: fit-content;

    padding: 32px;
    max-width: 90%;
    min-width: 33%;
    opacity: 1;
    /* z-index: 99999999999; */
    /* z-index: ${(theme) => theme?.zIndex?.drawer + 1} */

    position: relative;
    overflow-y: auto;
    ${({ isFull }) =>
      isFull &&
      css`
        overflow-y: hidden !important;
        padding: 0;
      `}
    max-height: 90%;
    transition: 0.3s;
    transform: translate3d(0, -15px, 0);
    ${({ show }) =>
      show &&
      css`
        transform: translate3d(0, 0, 0);
      `}

    > span {
      position: fixed;
      top: 0px;
      right: 0px;
      padding: 16px;
      cursor: pointer;
    }
  }

  @media (max-width: 767px) {
    > div {
      margin: 0 24px;
    }
  }
`;
