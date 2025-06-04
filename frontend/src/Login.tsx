import React, { useState } from "react";
import { Box, Container, Typography, TextField, Button, Paper } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { saveToken } from "./utils/tokenStorage";
import axios from "axios";

const Login: React.FC = () => {
  const [credentials, setCredentials] = useState({
    id: "",
    password: "",
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setCredentials((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    if (!credentials.id || !credentials.password) {
      setError("メールアドレスとパスワードを入力してください");
      return;
    }
    try {
      const res = await axios.post("/api/auth/login", {
        email: credentials.id,
        password: credentials.password,
      });
      saveToken(res.data.token);
      navigate("/books");
    } catch (e) {
      if (axios.isAxiosError(e)) {
        setError("ログインに失敗しました。\nメールアドレスとパスワードを確認してください。");
      } else {
        alert("予期しないエラーが発生しました。");
      }
    }
  };

  return (
    <Box
      sx={{
        position: "fixed",
        inset: 0,
        bgcolor: "#f5f5f5",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start",
        alignItems: "center",
        zIndex: 0,
      }}
    >
      {/* システム名は枠の外に、さらに下に表示（mt: 20, mb: 6） */}
      <Typography
        variant="h5"
        align="center"
        gutterBottom
        sx={{ mt: 20, mb: 6 }}
      >
        部門購入書籍管理システム
      </Typography>
      <Container maxWidth="sm">
        <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
          <form onSubmit={handleSubmit}>
            <Box sx={{ mb: 2 }}>
              <Typography
                variant="subtitle1"
                sx={{ fontWeight: 500, textAlign: "left", mb: 0.5 }}
              >
                メールアドレス
              </Typography>
              <TextField
                name="id"
                value={credentials.id}
                onChange={handleChange}
                fullWidth
                margin="dense"
                autoComplete="username"
                variant="outlined"
                size="small"
                label=""
                placeholder=""
                error={!!error}
                sx={{ mt: 0 }}
              />
            </Box>
            <Box sx={{ mb: 2 }}>
              <Typography
                variant="subtitle1"
                sx={{ fontWeight: 500, textAlign: "left", mb: 0.5 }}
              >
                パスワード
              </Typography>
              <TextField
                name="password"
                type="password"
                value={credentials.password}
                onChange={handleChange}
                fullWidth
                margin="dense"
                autoComplete="current-password"
                variant="outlined"
                size="small"
                label=""
                placeholder=""
                error={!!error}
                sx={{ mt: 0 }}
              />
            </Box>
            {error && (
              <Typography
                color="error"
                variant="body2"
                sx={{ mt: 1, textAlign: "left", whiteSpace: "pre-line" }}
              >
                {error}
              </Typography>
            )}
            <Button
              type="submit"
              variant="contained"
              fullWidth
              sx={{
                mt: 2,
                backgroundColor: "#23651a",
                "&:hover": { backgroundColor: "#1b4e14" },
              }}
            >
              ログイン
            </Button>
          </form>
        </Paper>
      </Container>
    </Box>
  );
};

export default Login;