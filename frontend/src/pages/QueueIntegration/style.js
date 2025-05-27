import { Avatar } from '@mui/material'
import { styled } from '@mui/material/styles';

export const AvatarStyled = styled(Avatar)(({ theme }) => ({
  width: 64,
  height: 64,
  border: `2px solid ${theme.palette.primary.main}`,
  "& > img": {
    width: "90%",
    height: "85%"
  }
}));