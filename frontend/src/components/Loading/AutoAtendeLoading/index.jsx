import { Backdrop } from "@mui/material";
import { useLoading } from "../../../hooks/useLoading";
import CircularProgress from '@mui/material/CircularProgress';
import React from "react";

export const AutoAtendeLoading = () => {
  const { isLoading } = useLoading();

  return isLoading ? (
    <Backdrop
      sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
      open={isLoading}
    >
      <CircularProgress color="inherit" />
    </Backdrop>
  ) : null;
};
