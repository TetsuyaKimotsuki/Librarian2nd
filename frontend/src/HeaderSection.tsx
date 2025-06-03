import React from "react";
import { AppBar, Toolbar, Typography } from "@mui/material";

const HeaderSection: React.FC = () => {
  return (
    <AppBar
      position="static"
      color="primary"
      elevation={0}
      sx={{
        bgcolor: "#64a35b",
        height: "2.75rem", // 44px→2.75rem
        minHeight: "2.75rem",
        justifyContent: "center",
      }}
    >
      <Toolbar sx={{ height: "100%", minHeight: "0 !important", px: "1.25rem" }}>
        <Typography
          variant="h6"
          sx={{
            flexGrow: 1,
            fontSize: "1.1rem",
            fontWeight: 600,
            letterSpacing: "0.03em",
          }}
        >
          部門購入書籍管理システム
        </Typography>
      </Toolbar>
    </AppBar>
  );
};

export default HeaderSection;