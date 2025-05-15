import { Box, Chip, TextField } from "@mui/material";
import Autocomplete from '@mui/material/Autocomplete';
import React, { useEffect, useState } from "react";
import { i18n } from "../../translate/i18n";

export function StatusFilter({ onFiltered }) {
  const [selecteds, setSelecteds] = useState([]);

  const onChange = (value) => {
    // Extrai apenas o campo "status" dos objetos selecionados
    const statusValues = value.map((option) => option.status);
    setSelecteds(statusValues);
    onFiltered(statusValues);
  };

  const status = [
    { status: 'open', name: i18n.t("tickets.search.filterConectionsOptions.open") },
    { status: 'closed', name: i18n.t("tickets.search.filterConectionsOptions.closed") },
    { status: 'pending', name: i18n.t("tickets.search.filterConectionsOptions.pending") },
  ];

  return (
    <Box>
      <Autocomplete
        multiple
        size="small"
        options={status}
        value={status.filter(option => selecteds.includes(option.status))}
        onChange={(e, v) => onChange(v)}
        getOptionLabel={(option) => option.name}
        renderTags={(value, getTagProps) =>
          value.map((option, index) => (
            <Chip
              variant="outlined"
              style={{
                backgroundColor: option.color || "#eee",
                textShadow: "1px 1px 1px #000",
                color: "white",
              }}
              label={option.name}
              {...getTagProps({ index })}
              size="small"
            />
          ))
        }
        renderInput={(params) => (
          <TextField
            {...params}
            variant="outlined"
            placeholder="Filtro por Status"
          />
        )}
      />
    </Box>
  );
}
