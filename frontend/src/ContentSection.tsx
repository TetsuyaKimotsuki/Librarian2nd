import React from "react";
import {
  Box,
  TableContainer,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from "@mui/material";

const headers: string[] = ["タイトル", "著者", "出版社", "ISBN", "購入日"];

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
}

const ContentSection: React.FC<ContentSectionProps> = ({ books }) => {
  return (
    <Box
      sx={{
        width: "100vw",
        height: "100vh",
        p: 0,
        m: 0,
        boxSizing: "border-box",
        background: "#f8faf7",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <TableContainer
        component={Paper}
        sx={{
          maxHeight: 512,
          borderRadius: "5px",
          overflow: "auto",
        }}
      >
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              {headers.map((header, index) => (
                <TableCell
                  key={index}
                  sx={{
                    backgroundColor: "#9CD295",
                    color: "#fff",
                    fontWeight: "bold",
                    fontSize: "1rem",
                  }}
                >
                  {header}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {books.map((book) => (
              <TableRow key={book.id}>
                <TableCell>{book.title}</TableCell>
                <TableCell>{book.author}</TableCell>
                <TableCell>{book.memo || ""}</TableCell>
                <TableCell>{book.isbn || ""}</TableCell>
                <TableCell>{book.purchasedAt ? book.purchasedAt.slice(0, 10) : ""}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default ContentSection;
