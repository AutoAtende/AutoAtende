import React, { useState } from "react";
import {
  FormControl,
  Select,
  Checkbox,
  ListItemText,
  Chip,
  Box,
  Stack,
  Typography,
  useTheme,
  MenuItem,
  InputLabel,
  OutlinedInput
} from "@mui/material";
import { i18n } from "../../translate/i18n";
import { useSpring, animated } from "@react-spring/web";
import { Check, ExpandMore } from "@mui/icons-material";

const AnimatedBox = animated(Box);

const TicketsQueueSelect = ({
  userQueues,
  selectedQueueIds = [],
  onChange,
}) => {
  const theme = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleChange = (e) => {
    onChange(e.target.value);
  };

  const fadeIn = useSpring({
    from: { opacity: 0, transform: 'translateY(-10px)' },
    to: { opacity: 1, transform: 'translateY(0)' },
    config: { tension: 300, friction: 20 }
  });

  const renderSelected = (selected) => {
    if (selected.length === 0) {
      return (
        <Typography color="textSecondary" variant="body2">
          {i18n.t("ticketsQueueSelect.placeholder")}
        </Typography>
      );
    }

    if (isMenuOpen) {
      return (
        <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 0.5 }}>
          {selected.map((value) => {
            const queue = userQueues?.find(q => q.id === value);
            if (!queue) return null;
            
            return (
              <Chip
                key={value}
                label={queue.name}
                size="small"
                sx={{ 
                  backgroundColor: queue.color || theme.palette.primary.main,
                  color: theme.palette.getContrastText(queue.color || theme.palette.primary.main),
                  '& .MuiChip-deleteIcon': {
                    color: theme.palette.getContrastText(queue.color || theme.palette.primary.main),
                    opacity: 0.8,
                    '&:hover': {
                      opacity: 1
                    }
                  }
                }}
                onDelete={() => {
                  onChange(selected.filter(id => id !== value));
                }}
              />
            );
          })}
        </Stack>
      );
    }

    return (
      <Typography variant="body2" color="textPrimary">
        {i18n.t("ticketsQueueSelect.selectedCount", { count: selected.length })}
      </Typography>
    );
  };

  return (
    <AnimatedBox style={fadeIn}>
      <FormControl fullWidth size="small" margin="dense">
        <InputLabel id="queue-select-label">
          {i18n.t("ticketsQueueSelect.placeholder")}
        </InputLabel>
        <Select
          labelId="queue-select-label"
          multiple
          variant="outlined"
          value={selectedQueueIds}
          onChange={handleChange}
          input={<OutlinedInput label={i18n.t("ticketsQueueSelect.placeholder")} />}
          renderValue={renderSelected}
          MenuProps={{
            PaperProps: {
              sx: {
                maxHeight: 300,
                '&::-webkit-scrollbar': {
                  width: '6px',
                },
                '&::-webkit-scrollbar-thumb': {
                  backgroundColor: theme.palette.divider,
                  borderRadius: '3px',
                },
              }
            },
            transitionDuration: 150,
            anchorOrigin: {
              vertical: "bottom",
              horizontal: "left",
            },
            transformOrigin: {
              vertical: "top",
              horizontal: "left",
            },
          }}
          IconComponent={ExpandMore}
          onOpen={() => setIsMenuOpen(true)}
          onClose={() => setIsMenuOpen(false)}
          sx={{
            '& .MuiSelect-select': {
              minHeight: '40px',
              py: 1,
              display: 'flex',
              alignItems: 'center'
            }
          }}
        >
          <MenuItem dense value={null}>
            <Checkbox
              size="small"
              checked={selectedQueueIds.indexOf(null) > -1}
              checkedIcon={<Check sx={{ fontSize: 18 }} />}
            />
            <ListItemText primary="Nenhuma fila" />
          </MenuItem>
          
          {userQueues?.length > 0 &&
            userQueues.map((queue) => (
              <MenuItem dense key={queue.id} value={queue.id}>
                <Checkbox
                  size="small"
                  checked={selectedQueueIds.indexOf(queue.id) > -1}
                  checkedIcon={<Check sx={{ fontSize: 18 }} />}
                  sx={{
                    color: queue.color,
                    '&.Mui-checked': {
                      color: queue.color,
                    }
                  }}
                />
                <ListItemText 
                  primary={queue.name} 
                  sx={{
                    '& span': {
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }
                  }} 
                />
              </MenuItem>
            ))}
        </Select>
      </FormControl>
    </AnimatedBox>
  );
};

export default TicketsQueueSelect;