import React, { useState, useEffect, useContext, useRef } from "react";
import { SketchPicker } from "react-color";
import { 
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  CircularProgress,
  TextField,
  InputAdornment,
  Popover
} from "@mui/material";
import { Field } from "formik";
import { i18n } from "../../translate/i18n";

const ColorPickerField = ({ field, form }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [displayColorPicker, setDisplayColorPicker] = useState(false);
  const [color, setColor] = useState(field.value || "#7367F0");

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
    setDisplayColorPicker(true);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setDisplayColorPicker(false);
  };

  const handleChange = (newColor) => {
    setColor(newColor.hex);
    form.setFieldValue(field.name, newColor.hex);
  };

  return (
    <>
      <TextField
        label={i18n.t("userModal.form.color")}
        variant="outlined"
        margin="dense"
        fullWidth
        value={color}
        onClick={handleClick}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <div
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: 4,
                  backgroundColor: color,
                  cursor: "pointer",
                  border: "1px solid rgba(0, 0, 0, 0.23)"
                }}
              />
            </InputAdornment>
          ),
          readOnly: true,
          style: { cursor: "pointer" }
        }}
      />
      <Popover
        open={displayColorPicker}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
      >
        <div style={{ padding: "8px" }}>
          <SketchPicker
            color={color}
            onChange={handleChange}
            disableAlpha
          />
        </div>
      </Popover>
    </>
  );
};

export default ColorPickerField;