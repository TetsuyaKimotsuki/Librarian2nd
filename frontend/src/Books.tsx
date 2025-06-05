import React, { useEffect, useState } from "react";
import { Box } from "@mui/material";
import ContentSection from "./ContentSection";
import HeaderSection from "./HeaderSection";
import SidebarSection from "./SidebarSection";
import { ThemeProvider } from "./ThemeProvider";
import axios from "axios";
import { getToken } from "./utils/tokenStorage";
import { useNavigate } from "react-router-dom";

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
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const navigate = useNavigate();

  // 検索API呼び出し
  const handleSearch = async (params: { keyword?: string; purchased_from?: string; purchased_to?: string; page?: number; per_page?: number }) => {
    try {
      const token = getToken();
      // クエリパラメータ生成
      const query = new URLSearchParams();
      if (params.keyword) query.append("keyword", params.keyword);
      if (params.purchased_from) query.append("purchased_from", params.purchased_from);
      if (params.purchased_to) query.append("purchased_to", params.purchased_to);
      query.append("page", String(params.page ?? page));
      query.append("per_page", String(params.per_page ?? perPage));
      const res = await axios.get(`/api/books?${query.toString()}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      setBooks(res.data.books || []);
      setTotal(res.data.total || 0);
      setPage(res.data.page || 1);
      setPerPage(res.data.per_page || 10);
    } catch (e) {
      if (axios.isAxiosError(e) && e?.response?.status === 401) {
        alert("セッションが切れました。再度ログインしてください。");
        navigate("/login");
      } else {
        console.error("書籍検索の取得に失敗しました", e);
      }
      setBooks([]);
      setTotal(0);
    }
  };

  // ページ変更時
  const handlePageChange = (newPage: number) => {
    handleSearch({ page: newPage, per_page: perPage });
  };

  // 初期取得
  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const token = getToken();
        const res = await axios.get(`/api/books?page=${page}&per_page=${perPage}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        setBooks(res.data.books || []);
        setTotal(res.data.total || 0);
        setPage(res.data.page || 1);
        setPerPage(res.data.per_page || 10);
      } catch (e) {
        if (axios.isAxiosError(e) && e?.response?.status === 401) {
          alert("セッションが切れました。再度ログインしてください。");
          navigate("/login");
        } else {
          console.error("書籍一覧の取得に失敗しました", e);
        }
        setBooks([]);
        setTotal(0);
      }
    };
    fetchBooks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <ThemeProvider>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          width: "100vw",
          height: "100vh",
          boxSizing: "border-box",
          overflowX: "hidden",
          background: "#f8faf7",
        }}
      >
        <HeaderSection />
        <Box sx={{ display: "flex", flex: 1, minHeight: 0 }}>
          <SidebarSection onSearch={handleSearch} />
          <Box
            sx={{
              flex: 1,
              minWidth: 0,
              minHeight: 0,
              display: "flex",
              flexDirection: "column",
              boxSizing: "border-box",
              width: "100%",
              px: { xs: "0.5rem", sm: "1rem", md: "1.5rem" },
              py: { xs: "0.25rem", sm: "0.5rem", md: "1rem" },
            }}
          >
            <ContentSection books={books} page={page} perPage={perPage} total={total} onPageChange={handlePageChange} />
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default Books;
