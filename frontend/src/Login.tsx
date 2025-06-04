import React, { useState } from "react";
import { Box, Container, Typography, TextField, Button, Paper } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { saveToken } from "./utils/tokenStorage";
import axios from "axios";
import MenuBookIcon from '@mui/icons-material/MenuBook';

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
    <>
      <Box
        sx={{
          width: "100vw",
          height: "100vh",
          bgcolor: "#f8faf7",
          position: "relative", 
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          px: { xs: 1.5, sm: 3, md: 4 },
          py: { xs: 1.5, sm: 2, md: 3 },
          boxSizing: "border-box",
          overflowX: "hidden",
        }}
      >
        <MenuBookIcon
          sx={{
            position: "absolute",
            top: "45%",
            left: "20%",
            fontSize: { xs: 640, sm: 840, md: 1120 }, 
            color: "#b7e2c4",
            opacity: 0.5,
            transform: "translate(-50%, -50%)",
            zIndex: 0,
            pointerEvents: "none",
            userSelect: "none",
          }}
        />
        <Typography
          variant="h5"
          align="center"
          gutterBottom
          sx={{ mt: 0, mb: 6, zIndex: 1, position: "relative", fontWeight: 700 }}
        >
          部門購入書籍管理システム
        </Typography>
        <Container maxWidth="sm" sx={{ position: "relative", zIndex: 1 }}>
          <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
            <form onSubmit={handleSubmit}>
              {error && (
                <Typography
                  color="error"
                  variant="body2"
                  sx={{ mb: 2, textAlign: "left", whiteSpace: "pre-line" }}
                >
                  {error}
                </Typography>
              )}
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
                  sx={{
                    mt: 0,
                    '& .MuiOutlinedInput-root': {
                      '&.Mui-focused fieldset': {
                        borderColor: '#23651a',
                        boxShadow: '0 0 0 1px #23651a',
                      },
                    },
                  }}
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
                  sx={{
                    mt: 0,
                    '& .MuiOutlinedInput-root': {
                      '&.Mui-focused fieldset': {
                        borderColor: '#23651a',
                        boxShadow: '0 0 0 1px #23651a',
                      },
                    },
                  }}
                />
              </Box>
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
    </>
  );
};

export default Login;