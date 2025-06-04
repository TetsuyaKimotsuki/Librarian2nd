import React, { useState, useEffect } from "react";
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
import DeleteIcon from '@mui/icons-material/Delete';
import axios from "axios";
import { getToken } from "./utils/tokenStorage";
import DialogFrame from "./Dialog";

const headers: string[] = ["タイトル", "著者", "ISBN", "保管場所", "購入日", "メモ", "", ""];

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

// 書籍詳細用型
// interface BookDetail extends Book {
//   // 必要に応じて追加
// }

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
  const [localBooks, setLocalBooks] = useState<Book[]>(books);
  const pageCount = Math.ceil(total / perPage);
  const navigate = useNavigate();

  // 詳細ダイアログ用state
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [detailBook, setDetailBook] = useState<Book | null>(null);

  useEffect(() => { setLocalBooks(books); }, [books]);

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
    ? [...localBooks].sort((a, b) => {
        const aVal = a[sortKey as keyof Book] || '';
        const bVal = b[sortKey as keyof Book] || '';
        if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      })
    : localBooks;

  // 削除処理
  const handleDelete = async (id: string) => {
    if (!window.confirm('本当にこの書籍を削除しますか？')) return;
    try {
      const token = getToken();
      await axios.delete(`/api/books/${id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      setLocalBooks(prev => prev.filter(b => b.id !== id));
    } catch {
      alert('削除に失敗しました');
    }
  };

  // 列幅計算用
  const baseWidth = Math.floor(100 / headers.length);
  const rest = 100 - baseWidth * (headers.length - 1);

  // 行クリック時の詳細取得
  const handleRowClick = async (id: string) => {
    setDetailOpen(true);
    setDetailLoading(true);
    setDetailError(null);
    setDetailBook(null);
    try {
      const token = getToken();
      const res = await axios.get(`/api/books/${id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      setDetailBook(res.data.book);
    } catch {
      setDetailError("詳細の取得に失敗しました");
    } finally {
      setDetailLoading(false);
    }
  };

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
                const sortableHeaders = ["タイトル", "著者", "ISBN", "保管場所", "購入日", "メモ"];
                const keyMap: { [key: string]: keyof Book } = {
                  "タイトル": "title",
                  "著者": "author",
                  "ISBN": "isbn",
                  "保管場所": "location",
                  "購入日": "purchasedAt",
                  "メモ": "memo",
                };
                const sortable = sortableHeaders.includes(header);
                // 編集・削除ボタン列は極狭に
                const isAction = index === headers.length - 1 || index === headers.length - 2;
                const isTitle = header === "タイトル";
                const width = isAction ? 32 : isTitle ? `calc(${baseWidth * 2}% + ${rest}%)` : `${baseWidth}%`;
                return (
                  <TableCell
                    key={header + index}
                    sx={{
                      fontWeight: isTitle ? 800 : 700,
                      fontSize: '1rem',
                      bgcolor: 'success.main',
                      color: '#fff',
                      userSelect: sortable ? "none" : undefined,
                      cursor: sortable ? 'pointer' : undefined,
                      minWidth: isAction ? 32 : isTitle ? 180 : 80,
                      maxWidth: isAction ? 32 : isTitle ? 'none' : 200,
                      width,
                      textAlign: isAction ? 'center' : 'left',
                      px: isAction ? 0 : 2,
                      py: 1,
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
                  cursor: 'pointer',
                }}
                onClick={() => handleRowClick(book.id)}
              >
                <TableCell sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', minWidth: 180, maxWidth: 'none', width: `calc(${baseWidth * 2}% + ${rest}%)`, color: '#222' }}>{book.title}</TableCell>
                <TableCell sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', width: `${baseWidth}%`, minWidth: 80, maxWidth: 200 }}>{book.author}</TableCell>
                <TableCell sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', width: `${baseWidth}%`, minWidth: 80, maxWidth: 200 }}>{book.isbn || ""}</TableCell>
                <TableCell sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', width: `${baseWidth}%`, minWidth: 80, maxWidth: 200 }}>{book.location || ""}</TableCell>
                <TableCell sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', width: `${baseWidth}%`, minWidth: 80, maxWidth: 200 }}>{book.purchasedAt ? book.purchasedAt.slice(0, 10) : ""}</TableCell>
                <TableCell sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', width: `${baseWidth}%`, minWidth: 80, maxWidth: 200 }}>{book.memo || ""}</TableCell>
                <TableCell
                  sx={{ width: 32, minWidth: 32, maxWidth: 32, p: 0, textAlign: 'center' }}
                  onClick={e => { e.stopPropagation(); navigate(`/edit-book/${book.id}`); }}
                >
                  <Button size="small" sx={{ minWidth: 0, px: 0, py: 0, height: 28 }}>
                    <EditIcon sx={{ color: '#23651a', fontSize: 20 }} />
                  </Button>
                </TableCell>
                <TableCell
                  sx={{ width: 32, minWidth: 32, maxWidth: 32, p: 0, textAlign: 'center' }}
                  onClick={e => { e.stopPropagation(); handleDelete(book.id); }}
                >
                  <Button size="small" sx={{ minWidth: 0, px: 0, py: 0, height: 28 }}>
                    <DeleteIcon sx={{ color: '#d32f2f', fontSize: 20 }} />
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
      {/* 詳細ダイアログ */}
      <DialogFrame
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        title={detailBook ? detailBook.title : detailLoading ? "読み込み中..." : detailError ? "エラー" : "書籍詳細"}
        message={
          detailLoading ? (
            "読み込み中..."
          ) : detailError ? (
            detailError
          ) : detailBook ? (
            (() => {
              const {
                author,
                isbn,
                location,
                purchasedAt,
                memo,
                registeredBy,
                updatedAt,
              } = detailBook;
              return (
                <Box sx={{ width: '100%', px: 2, py: 1 }}>
                  <Box sx={{ mb: 1 }}>
                    <Typography variant="body2" sx={{ textAlign: 'right', mr:'0.5rem', fontWeight: 600, display: 'inline-block', minWidth: 70 }}>著者:</Typography>
                    <Typography variant="body2" sx={{ display: 'inline-block', ml: 1 }}>{author}</Typography>
                  </Box>
                  <Box sx={{ mb: 1 }}>
                    <Typography variant="body2" sx={{ textAlign: 'right', mr:'0.5rem', fontWeight: 600, display: 'inline-block', minWidth: 70 }}>ISBN:</Typography>
                    <Typography variant="body2" sx={{ display: 'inline-block', ml: 1 }}>{isbn || '-'}</Typography>
                  </Box>
                  <Box sx={{ mb: 1 }}>
                    <Typography variant="body2" sx={{ textAlign: 'right', mr:'0.5rem', fontWeight: 600, display: 'inline-block', minWidth: 70 }}>保管場所:</Typography>
                    <Typography variant="body2" sx={{ display: 'inline-block', ml: 1 }}>{location || '-'}</Typography>
                  </Box>
                  <Box sx={{ mb: 1 }}>
                    <Typography variant="body2" sx={{ textAlign: 'right', mr:'0.5rem', fontWeight: 600, display: 'inline-block', minWidth: 70 }}>購入日:</Typography>
                    <Typography variant="body2" sx={{ display: 'inline-block', ml: 1 }}>{purchasedAt || '-'}</Typography>
                  </Box>
                  <Box sx={{ mb: 1 }}>
                    <Typography variant="body2" sx={{ textAlign: 'right', mr:'0.5rem', fontWeight: 600, display: 'inline-block', minWidth: 70 }}>メモ:</Typography>
                    <Typography variant="body2" sx={{ display: 'inline-block', ml: 1, whiteSpace: 'pre-wrap' }}>{memo || '-'}</Typography>
                  </Box>
                  <Box sx={{ mb: 1 }}>
                    <Typography variant="body2" sx={{ textAlign: 'right', mr:'0.5rem', fontWeight: 600, display: 'inline-block', minWidth: 70 }}>登録者:</Typography>
                    <Typography variant="body2" sx={{ display: 'inline-block', ml: 1 }}>{registeredBy || '-'}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" sx={{ textAlign: 'right', mr:'0.5rem', fontWeight: 600, display: 'inline-block', minWidth: 70 }}>更新日:</Typography>
                    <Typography variant="body2" sx={{ display: 'inline-block', ml: 1 }}>{updatedAt ? String(updatedAt).replace('T', ' ').replace('Z', '') : '-'}</Typography>
                  </Box>
                </Box>
              );
            })()
          ) : (
            "書籍情報がありません"
          )
        }
      />
    </Box>
  );
};

export default ContentSection;
