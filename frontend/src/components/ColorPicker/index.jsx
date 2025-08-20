import React, { memo } from "react";
import { TextField, InputAdornment, Box } from "@mui/material";
import { styled } from "@mui/material/styles";

const ColorInput = styled('input')({
  opacity: 0,
  position: 'absolute',
  width: '100%',
  height: '100%',
  cursor: 'pointer',
});

const ColorDisplay = styled(Box)(({ color }) => ({
  width: 24,
  height: 24,
  borderRadius: 4,
  backgroundColor: color,
  border: '1px solid rgba(0, 0, 0, 0.23)',
  cursor: 'pointer',
  position: 'relative',
}));

const ColorPicker = memo(({ value = "#000000", onChange, label = "Cor", fullWidth = true, ...props }) => {
  const handleColorChange = (event) => {
    const newColor = event.target.value;
    if (onChange) {
      onChange(newColor);
    }
  };

  return (
    <TextField
      label={label}
      variant="outlined"
      margin="dense"
      fullWidth={fullWidth}
      value={value}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <ColorDisplay color={value}>
              <ColorInput
                type="color"
                value={value}
                onChange={handleColorChange}
              />
            </ColorDisplay>
          </InputAdornment>
        ),
        readOnly: true,
        style: { cursor: "pointer" }
      }}
      onClick={(e) => {
        const colorInput = e.currentTarget.querySelector('input[type="color"]');
        if (colorInput) {
          colorInput.click();
        }
      }}
      {...props}
    />
  );
});

ColorPicker.displayName = 'ColorPicker';

export default ColorPicker;