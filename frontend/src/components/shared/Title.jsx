import React from "react";
import Typography from "@mui/material/Typography";

export default function Title({ children, variant = "h5", isCenter = false }) {
  return (
    <Typography
      variant={variant}
      color="primary"
      gutterBottom
      sx={{
        ...(isCenter && { 
          display: "flex", 
          justifyContent: "center" 
        })
      }}
    >
      {children}
    </Typography>
  );
}