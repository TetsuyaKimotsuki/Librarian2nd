import React, { useState } from "react";
import {
  Box,
  TableContainer,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Pagination,
  Stack,
  Button,
  Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import LibraryAddIcon from '@mui/icons-material/LibraryBooks';
import EditIcon from '@mui/icons-material/Edit';

const headers: string[] = ["タイトル", "著者", "ISBN", "保管場所", "購入日", "メモ", ""];

// Book型をpropsで受け取るように修正
interface Book {
  id: string;
  title: string;
  author: string;
  isbn?: string;
  location?: string;
  memo?: string;
  purchasedAt?: string;
  registeredBy?: string;
  updatedAt?: string;
}

interface ContentSectionProps {
  books: Book[];
  page: number;
  perPage: number;
  total: number;
  onPageChange: (newPage: number) => void;
}

const ContentSection: React.FC<ContentSectionProps> = ({ books, page, perPage, total, onPageChange }) => {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const pageCount = Math.ceil(total / perPage);
  const navigate = useNavigate();

  // ソート処理
  const handleSort = (key: keyof Book) => {
    if (sortKey === key) {
      if (sortOrder === 'asc') {
        setSortOrder('desc');
      } else if (sortOrder === 'desc') {
        setSortKey(null);
        setSortOrder('asc'); // デフォルト
      }
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
  };
  const sortedBooks = sortKey
    ? [...books].sort((a, b) => {
        const aVal = a[sortKey as keyof Book] || '';
        const bVal = b[sortKey as keyof Book] || '';
        if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      })
    : books;

  // 列幅計算用
  const baseWidth = Math.floor(100 / headers.length);
  const rest = 100 - baseWidth * (headers.length - 1);

  return (
    <Box
      sx={{
        flex: 1,
        width: "100%",
        maxWidth: "100vw",
        minWidth: 0,
        background: "#f8faf7",
        display: "flex",
        flexDirection: "column",
        px: { xs: "0.75rem", sm: "1.5rem", md: "2rem" },
        py: { xs: "0.75rem", sm: "1rem", md: "1.5rem" },
        boxSizing: "border-box",
        overflowX: "hidden",
      }}
    >
      {/* 新規書籍登録ボタンと検索タイトル */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <LibraryBooksIcon sx={{ color: '#23651a', fontSize: 28, mr: 1 }} />
          <Typography variant="h5" sx={{ fontWeight: 700, fontSize: '1.125rem', letterSpacing: '0.03em' }}>
            書籍一覧
          </Typography>
        </Box>
        <Button
          variant="contained"
          color="success"
          sx={{
            bgcolor: "#23651a",
            '&:hover': { bgcolor: '#1b4e14' },
            fontWeight: 600,
            borderRadius: "0.375rem",
            textTransform: "none",
            minWidth: "120px",
          }}
          onClick={() => navigate("/regist-book")}
        >
          <LibraryAddIcon sx={{ mr: 1 }} /> 新規書籍登録
        </Button>
      </Box>
      <TableContainer
        component={Paper}
        sx={{
          borderRadius: "0.375rem", // ボタンと同じ角丸
          overflow: "auto",
          maxWidth: "100%",
          boxShadow: "0 2px 8px 0 rgba(0,0,0,0.04)",
        }}
      >
        <Table stickyHeader sx={{ minWidth: 700, width: "100%", tableLayout: "fixed" }}>
          <TableHead>
            <TableRow sx={{ height: "2.5rem" }}>
              {headers.map((header, index) => {
                const sortable = ["タイトル", "著者", "ISBN", "保管場所", "購入日", "メモ"].includes(header);
                const keyMap: { [k: string]: keyof Book } = {
                  "タイトル": "title",
                  "著者": "author",
                  "ISBN": "isbn",
                  "保管場所": "location",
                  "購入日": "purchasedAt",
                  "メモ": "memo",
                };
                let width;
                if (header === "タイトル") {
                  width = `calc(${baseWidth * 2}% + ${rest}%)`;
                } else if (header === "") {
                  width = 48;
                } else {
                  width = `${baseWidth}%`;
                }
                return (
                  <TableCell
                    key={index}
                    sx={{
                      backgroundColor: "success.main",
                      color: "#fff",
                      fontWeight: 600,
                      fontSize: { xs: "0.95rem", sm: "1rem" },
                      letterSpacing: "0.03em",
                      borderBottom: "2px solid #bdbdbd",
                      height: "2.5rem",
                      py: 0,
                      width,
                      minWidth: header === "タイトル" ? 180 : header === "" ? 48 : 80,
                      maxWidth: header === "タイトル" ? 'none' : header === "" ? 48 : 200,
                      cursor: sortable ? "pointer" : undefined,
                      userSelect: sortable ? "none" : undefined,
                    }}
                    onClick={sortable ? () => handleSort(keyMap[header]) : undefined}
                  >
                    {header}
                    {sortable && sortKey === keyMap[header] && (
                      <span style={{ fontSize: "1rem", marginLeft: 4 }}>{sortOrder === 'asc' ? '▲' : '▼'}</span>
                    )}
                  </TableCell>
                );
              })}
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedBooks.map((book) => (
              <TableRow key={book.id} hover
                sx={{
                  "&:hover": {
                    backgroundColor: "#d0e8d0 !important",
                    transition: "background-color 0.2s",
                  },
                }}>
                <TableCell sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', minWidth: 180, maxWidth: 'none', width: `calc(${baseWidth * 2}% + ${rest}%)` }}>{book.title}</TableCell>
                <TableCell sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', width: `${baseWidth}%`, minWidth: 80, maxWidth: 200 }}>{book.author}</TableCell>
                <TableCell sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', width: `${baseWidth}%`, minWidth: 80, maxWidth: 200 }}>{book.isbn || ""}</TableCell>
                <TableCell sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', width: `${baseWidth}%`, minWidth: 80, maxWidth: 200 }}>{book.location || ""}</TableCell>
                <TableCell sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', width: `${baseWidth}%`, minWidth: 80, maxWidth: 200 }}>{book.purchasedAt ? book.purchasedAt.slice(0, 10) : ""}</TableCell>
                <TableCell sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', width: `${baseWidth}%`, minWidth: 80, maxWidth: 200 }}>{book.memo || ""}</TableCell>
                <TableCell align="center" sx={{ width: 48, minWidth: 48, maxWidth: 48 }}>
                  <Button size="small" onClick={() => {alert("comming soon..."); return; navigate(`/edit-book/${book.id}`)}} sx={{ minWidth: 0, p: 0.5 }}>
                    <EditIcon sx={{ color: '#23651a' }} />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      {pageCount > 1 && (
        <Stack alignItems="flex-end" sx={{ mt: 2 }}>
          <Pagination
            count={pageCount}
            page={page}
            onChange={(_, value) => onPageChange(value)}
            shape="rounded"
            showFirstButton
            showLastButton
            sx={{
              '& .MuiPaginationItem-root': {
                '&.Mui-selected': {
                  bgcolor: '#23651a',
                  color: '#fff',
                },
                '&.Mui-focusVisible': {
                  outline: '2px solid #23651a',
                },
                '&:focus': {
                  outline: '2px solid #23651a',
                },
                '&:hover': {
                  bgcolor: '#b7e2c4',
                  color: '#23651a',
                },
              },
            }}
          />
        </Stack>
      )}
    </Box>
  );
};

export default ContentSection;
