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

// テーブルのヘッダーとダミーデータ
const headers: string[] = ["タイトル", "著者", "出版社", "ISBN", "購入日"];
const rows: string[][] = [
  ["リーダブルコード", "Dustin Boswell", "オライリー・ジャパン", "9784873115658", "2022-01-10"],
  ["達人に学ぶDB設計 徹底指南書", "ミック", "翔泳社", "9784798142470", "2022-02-15"],
];

const ContentSection: React.FC = () => {
  return (
    <Box sx={{ p: 4, width: "100%" }}>
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
                <TableCell key={index}>{header}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row: string[], rowIndex: number) => (
              <TableRow key={rowIndex}>
                {row.map((cell: string, cellIndex: number) => (
                  <TableCell key={cellIndex}>{cell}</TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default ContentSection;
