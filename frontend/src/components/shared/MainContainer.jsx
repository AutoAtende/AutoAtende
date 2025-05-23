import React from "react";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";

const MainContainer = ({ children, overflowYShow }) => {
  return (
    <Container
      sx={{
        flex: 1,
        p: 2,
        height: "calc(100% - 48px)",
        lg: { maxWidth: "100%" },
      }}
    >
      <Box
        sx={{
          height: "100%",
          overflowY: overflowYShow ? "visible" : "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {children}
      </Box>
    </Container>
  );
};

export default MainContainer;