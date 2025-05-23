import React from "react";
import Box from "@mui/material/Box";

const MainHeader = ({ children }) => {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        padding: "0px 6px 6px 6px",
      }}
    >
      {children}
    </Box>
  );
};

export default MainHeader;