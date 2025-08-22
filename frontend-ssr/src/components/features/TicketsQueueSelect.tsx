'use client';

import React, { useState } from 'react';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  ListItemText,
  Chip,
  Box,
  SelectChangeEvent,
  styled
} from '@mui/material';

const StyledFormControl = styled(FormControl)(({ theme }) => ({
  minWidth: 200,
  '& .MuiOutlinedInput-root': {
    borderRadius: theme.spacing(1),
  },
}));

const ChipsContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexWrap: 'wrap',
  gap: theme.spacing(0.5),
  maxWidth: 300,
}));

interface Queue {
  id: number;
  name: string;
  color: string;
}

interface TicketsQueueSelectProps {
  selectedQueueIds: number[];
  userQueues: Queue[];
  onChange: (queueIds: number[]) => void;
  style?: React.CSSProperties;
}

const TicketsQueueSelect: React.FC<TicketsQueueSelectProps> = ({
  selectedQueueIds,
  userQueues,
  onChange,
  style
}) => {
  const handleChange = (event: SelectChangeEvent<number[]>) => {
    const value = event.target.value;
    onChange(typeof value === 'string' ? [] : value);
  };

  const renderValue = (selected: number[]) => {
    if (selected.length === 0) {
      return 'Todas as filas';
    }

    const selectedQueues = userQueues.filter(queue => selected.includes(queue.id));
    
    return (
      <ChipsContainer>
        {selectedQueues.slice(0, 2).map((queue) => (
          <Chip
            key={queue.id}
            label={queue.name}
            size="small"
            sx={{
              backgroundColor: queue.color + '20',
              color: queue.color,
              height: 24,
            }}
          />
        ))}
        {selectedQueues.length > 2 && (
          <Chip
            label={`+${selectedQueues.length - 2}`}
            size="small"
            variant="outlined"
            sx={{ height: 24 }}
          />
        )}
      </ChipsContainer>
    );
  };

  return (
    <StyledFormControl size="small" style={style}>
      <InputLabel>Filas</InputLabel>
      <Select
        multiple
        value={selectedQueueIds}
        onChange={handleChange}
        label="Filas"
        renderValue={renderValue}
        MenuProps={{
          PaperProps: {
            style: {
              maxHeight: 300,
            },
          },
        }}
      >
        <MenuItem value="">
          <Checkbox checked={selectedQueueIds.length === 0} />
          <ListItemText primary="Todas as filas" />
        </MenuItem>
        
        {userQueues.map((queue) => (
          <MenuItem key={queue.id} value={queue.id}>
            <Checkbox checked={selectedQueueIds.includes(queue.id)} />
            <ListItemText 
              primary={
                <Box display="flex" alignItems="center" gap={1}>
                  <Box
                    width={12}
                    height={12}
                    borderRadius="50%"
                    bgcolor={queue.color}
                  />
                  {queue.name}
                </Box>
              }
            />
          </MenuItem>
        ))}
      </Select>
    </StyledFormControl>
  );
};

export default TicketsQueueSelect;