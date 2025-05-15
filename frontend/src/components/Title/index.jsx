import React from "react";
import Typography from "@mui/material/Typography";

export default function Title({ children, variant = "h5", isCenter = false }) {
  const center = { display: "flex", justifyContent: "center" };
  return (
    <Typography
      variant="h5"
      color="primary"
      gutterBottom
      style={isCenter ? center : null}
    >
      {children}
    </Typography>
  );
}
