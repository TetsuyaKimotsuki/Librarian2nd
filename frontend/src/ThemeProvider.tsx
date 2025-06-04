import React from "react";
import type { ReactNode } from "react";
import { ThemeProvider as MuiThemeProvider, createTheme, CssBaseline } from "@mui/material";

const theme = createTheme({
  palette: {
    primary: {
      main: "#1976d2",
      dark: "#115293",
    },
    background: {
      default: "#f5f7fa",
      paper: "#fff",
    },
    text: {
      primary: "#222",
      secondary: "#fff",
    },
  },
  typography: {
    fontFamily: [
      '"Noto Sans JP"',
      "Roboto",
      "Arial",
      "sans-serif",
    ].join(","),
    h1: {
      fontSize: 24,
      fontWeight: 700,
    },
    h6: {
      fontSize: 18,
      fontWeight: 500,
    },
  },
});

type Props = {
  children: ReactNode;
};

export const ThemeProvider: React.FC<Props> = ({ children }) => (
  <MuiThemeProvider theme={theme}>
    <CssBaseline />
    {children}
  </MuiThemeProvider>
);
