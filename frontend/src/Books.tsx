import React, { useEffect, useState } from "react";
import { Box } from "@mui/material";
import ContentSection from "./ContentSection";
import HeaderSection from "./HeaderSection";
import SidebarSection from "./SidebarSection";
import { ThemeProvider } from "./ThemeProvider";
import axios from "axios";
import { getToken } from "./utils/tokenStorage";

export type Book = {
  id: string;
  title: string;
  author: string;
  isbn?: string;
  location?: string;
  memo?: string;
  purchasedAt?: string;
  registeredBy?: string;
  updatedAt?: string;
};

const Books = () => {
  const [books, setBooks] = useState<Book[]>([]);
  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const token = getToken();
        const res = await axios.get("/api/books", {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        setBooks(res.data.books || []);
      } catch (e) {
        console.error("書籍一覧の取得に失敗しました", e);
        setBooks([]); // エラー時は空配列
      }
    };
    fetchBooks();
  }, []);

  return (
    <ThemeProvider>
      <Box
        sx={{
          bgcolor: "background.default",
          display: "flex",
          flexDirection: "column",
          width: "100vw",
          height: "100vh",
        }}
      >
        <HeaderSection />
        <Box sx={{ display: "flex", flex: 1, minHeight: 0 }}>
          <SidebarSection />
          <Box sx={{ flex: 1, minWidth: 0, minHeight: 0 }}>
            <ContentSection books={books} />
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default Books;
