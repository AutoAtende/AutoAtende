import { styled } from "@mui/material/styles";
import { Box } from "@mui/material";


export const StatusUserContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  width: '185px'
}));

export const StatusUserItem = styled(Box)(() => ({
  display: 'flex',
  gap: '2px'
}));

export const StatusColorContainer = styled(Box)(() => ({
  display: 'flex',
  alignItems: 'center'
}));

export const FilterInputTextContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: '5px',
  width: '100%',
  position: 'relative',
  top: '16px',
  justifyContent: 'flex-end',
  '& > button': {
    width: '200px'
  }
}));