import React from "react";
import Tickets from "../Tickets";
import TicketAdvanced from "../TicketsAdvanced";
import { useTheme } from "@mui/material/styles";
import { useMediaQuery } from "@mui/material";

function useIsWidthUp(breakpoint) {
  const theme = useTheme();
  return useMediaQuery(theme.breakpoints.up(breakpoint));
}

function TicketResponsiveContainer() {
  return useIsWidthUp("md") ? <Tickets /> : <TicketAdvanced />;
}

export default TicketResponsiveContainer;
