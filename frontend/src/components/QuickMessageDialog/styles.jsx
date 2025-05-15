import { Paper } from "@mui/material";
import styled from "styled-components";

export const PaperContainer = styled(Paper)`
  width: 100%;
  padding: 5px;
  justify-content: center;
  align-items: center;
  align-self: center;
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr 1fr;
  gap: 5px;
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

export const VariableContainer = styled.section`
  width: 100%;
  margin-top: 6px;
`;
export const MessageInfoContainer = styled.section`
  position: relative;
  top: 5px;
  margin-bottom: 17px;
`;
