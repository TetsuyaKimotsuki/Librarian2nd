import React from "react";
import { AppBar, Button, Toolbar, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";

const HeaderSection: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // 必要ならトークン削除処理も追加
    navigate("/login");
  };

  return (
    <AppBar
      position="static"
      color="primary"
      elevation={0} sx={{ bgcolor: "#64a35b", height: "80px" }}>
      <Toolbar sx={{ height: "100%" }}>
        <Typography
          variant="h1"
          color="text.secondary"
          sx={{
            flexGrow: 1,
            fontSize: "24px",
          }}
        >
          部門購入書籍管理システム
        </Typography>
        <Button
          variant="contained"
          onClick={handleLogout}
          sx={{
            bgcolor: "#23651a",
            borderRadius: "5px",
            textTransform: "none",
            "&:hover": {
              bgcolor: "#1b5015",
            },
          }}
        >
          ログアウト
        </Button>
      </Toolbar>
    </AppBar>
  );
};

export default HeaderSection;