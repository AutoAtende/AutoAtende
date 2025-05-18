import React, { useState, useEffect } from "react";
import { 
  CardHeader, 
  Chip, 
  Stack, 
  Typography,
  Box,
  Tooltip,
  styled
} from "@mui/material";
import { useSpring, animated } from 'react-spring';
import PersonIcon from "@mui/icons-material/Person";
import WorkIcon from "@mui/icons-material/Work";
import BusinessIcon from "@mui/icons-material/Business";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import InventoryIcon from "@mui/icons-material/Inventory";
import { getInitials } from "../../helpers/getInitials";
import { generateColor } from "../../helpers/colorGenerator";
import useSettings from "../../hooks/useSettings";
import ProfileImageModal from '../ProfileImageModal';

const StyledCardHeader = styled(CardHeader)(({ theme }) => ({
  cursor: "pointer",
  alignItems: 'flex-start',
  padding: theme.spacing(1),
  '& .MuiCardHeader-content': {
    overflow: 'hidden',
    marginTop: theme.spacing(0.5)
  },
  [theme.breakpoints.up('sm')]: {
    padding: theme.spacing(2)
  }
}));

const HeaderTitle = styled(Box)({
  display: 'flex',
  alignItems: 'baseline',
  gap: 4,
  lineHeight: 1.2
});

const InfoContainer = styled(Stack)(({ theme }) => ({
  gap: theme.spacing(0.5),
  marginTop: theme.spacing(0.5)
}));

const AnimatedChip = animated(Chip);

const validColors = [
  'default', 'primary', 'secondary', 'error', 'warning', 'info', 'success'
];

const CollapsibleBadge = ({ icon, label, color, variant = 'filled' }) => {
  const [hovered, setHovered] = useState(false);
  
  const validatedColor = validColors.includes(color) ? color : 'default';
  
  const styles = useSpring({
    width: hovered ? 'auto' : 32,
    config: { tension: 300, friction: 20 }
  });

  return (
    <Tooltip title={label} arrow>
      <Box 
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        sx={{ display: 'inline-flex', overflow: 'hidden' }}
      >
        <AnimatedChip
          style={styles}
          icon={icon}
          label={hovered ? label : ''}
          color={validatedColor}
          variant={variant}
          size="small"
          sx={{
            height: 24,
            '& .MuiChip-icon': {
              fontSize: 14,
              marginLeft: hovered ? 2 : 0,
              marginRight: hovered ? -2 : 0
            },
            '& .MuiChip-label': {
              paddingLeft: hovered ? 4 : 0,
              paddingRight: hovered ? 4 : 0,
              display: hovered ? 'inline-flex' : 'none'
            },
            ...(!validColors.includes(color) && color && {
              backgroundColor: color,
              color: '#fff'
            })
          }}
        />
      </Box>
    </Tooltip>
  );
};

const TicketInfo = ({ contact, ticket, onClick }) => {
    const [userName, setUserName] = useState('');
    const [contactName, setContactName] = useState('');
 
    const { settings } = useSettings();
    const enableTicketValueAndSku = settings?.enableTicketValueAndSku;

    useEffect(() => {
        setContactName(contact?.name || '');
        if (ticket.user && contact) setUserName(ticket.user.name);
    }, [contact, ticket.user]);


    const renderBusinessInfo = () => (
        <Stack direction="row" gap={0.5} flexWrap="wrap">
            {contact?.employer?.name && (
                <CollapsibleBadge
                    icon={<WorkIcon fontSize="small" />}
                    label={contact.employer.name}
                    variant="outlined"
                />
            )}
            {contact?.position?.name && (
                <CollapsibleBadge
                    icon={<BusinessIcon fontSize="small" />}
                    label={contact.position.name}
                    variant="outlined"
                />
            )}
        </Stack>
    );

    const renderSubheader = () => (
        <InfoContainer>
            {renderBusinessInfo()}
            
            <Stack direction="row" gap={0.5} flexWrap="wrap">
                {userName && (
                    <CollapsibleBadge
                        icon={<PersonIcon fontSize="small" />}
                        label={userName}
                        color={validColors.includes(ticket.user?.color) ? ticket.user?.color : 'default'}
                    />
                )}
                {ticket.queue && (
                    <CollapsibleBadge
                        icon={<BusinessIcon fontSize="small" />}
                        label={ticket.queue.name}
                        color={validColors.includes(ticket.queue?.color) ? ticket.queue?.color : 'default'}
                    />
                )}
            </Stack>

            {enableTicketValueAndSku && !ticket.isGroup && (
                <Stack direction="row" gap={0.5} flexWrap="wrap">
                    <CollapsibleBadge
                        icon={<AttachMoneyIcon fontSize="small" />}
                        label={ticket.value ? `R$${Number(ticket.value).toFixed(2).replace('.', ',')}` : 'R$0,00'}
                        color="success"
                    />
                    {ticket.sku && (
                        <CollapsibleBadge
                            icon={<InventoryIcon fontSize="small" />}
                            label={ticket.sku}
                            color="info"
                        />
                    )}
                </Stack>
            )}
        </InfoContainer>
    );

    return (
        <StyledCardHeader
            onClick={onClick}
            avatar={
                <ProfileImageModal
                    contact={contact}
                    generateColor={generateColor}
                    getInitials={getInitials}
                />
            }
            title={
                <HeaderTitle>
                    <Typography variant="subtitle1" noWrap component="div">
                        {contactName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" noWrap>
                        #{ticket.id}
                    </Typography>
                </HeaderTitle>
            }
            subheader={renderSubheader()}
        />
    );
};

export default TicketInfo;