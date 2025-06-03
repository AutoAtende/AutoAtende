import React from 'react';
import { Avatar, Tooltip } from '@mui/material';
import { useTheme } from "@mui/material/styles";

const CardAssigneeAvatar = ({ user, size = 'medium' }) => {
  const theme = useTheme();
  
  if (!user) return null;
  
  const getSize = () => {
    switch (size) {
      case 'small':
        return 24;
      case 'large':
        return 40;
      case 'medium':
      default:
        return 32;
    }
  };
  
  const avatarSize = getSize();
  
  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };
  
  return (
    <Tooltip title={user.name}>
      <Avatar
        src={user.profilePic}
        alt={user.name}
        sx={{
          width: avatarSize,
          height: avatarSize,
          fontSize: avatarSize / 2,
          bgcolor: user.color || theme.palette.primary.main
        }}
      >
        {getInitials(user.name)}
      </Avatar>
    </Tooltip>
  );
};

export default CardAssigneeAvatar;