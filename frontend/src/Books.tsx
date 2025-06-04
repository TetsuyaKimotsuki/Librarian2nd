import { Box } from "@mui/material";
import React from "react";
import ContentSection from "./ContentSection";
import HeaderSection from "./HeaderSection";
import SidebarSection from "./SidebarSection";
import { ThemeProvider } from "./ThemeProvider";


const Books = () => {
  return (
    <ThemeProvider>
      <Box
        sx={{
          bgcolor: "background.default",
          display: "flex",
          flexDirection: "column",
          width: "100%",
        }}
      >
        <HeaderSection />
        <Box sx={{ display: "flex", width: "100%", height: "93%" }}>
          <SidebarSection />
          <ContentSection />
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default Books;
