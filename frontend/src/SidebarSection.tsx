import { Box, Button, Stack, TextField, Typography } from "@mui/material";
import React, { useState } from "react";
import SearchIcon from '@mui/icons-material/Search';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';

// onSearch props型を追加
interface SidebarSectionProps {
  onSearch?: (params: { keyword?: string; purchased_from?: string; purchased_to?: string }) => void;
}

const SidebarSection: React.FC<SidebarSectionProps> = ({ onSearch }) => {
  const [searchParams, setSearchParams] = useState({
    keyword: "",
    purchased_from: "",
    purchased_to: "",
  });

  const handleChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchParams({
      ...searchParams,
      [field]: event.target.value,
    });
  };

  const handleSearch = () => {
    if (onSearch) {
      onSearch({
        keyword: searchParams.keyword,
        purchased_from: searchParams.purchased_from,
        purchased_to: searchParams.purchased_to,
      });
    } else {
      console.log("Search with params:", searchParams);
    }
  };

  const handleClear = () => {
    setSearchParams({ keyword: "", purchased_from: "", purchased_to: "" });
    if (onSearch) onSearch({});
  };

  return (
    <Box sx={{ width: "21rem", p: "0.3125rem", mt: "2.75rem", ml: "2.5rem", background: "#f8faf7", borderRadius: "1rem", boxSizing: "border-box" }}>
      <Typography variant="h1" sx={{ fontSize: "1.125rem", mb: "0.75rem", display: 'flex', alignItems: 'center' }}>
        <SearchIcon sx={{ color: '#23651a', fontSize: '1.25rem', mr: 1 }} />
        書籍検索
      </Typography>
      <Stack spacing={"0.75rem"} sx={{ width: "100%", mb: "1.5rem" }}>
        <Box sx={{ width: "100%" }}>
          <Typography sx={{ fontSize: "1rem", mb: "0.25rem", display: 'flex', alignItems: 'center' }}>
            <SearchIcon sx={{ color: '#23651a', fontSize: 18, mr: 0.5 }} />キーワード
          </Typography>
          <TextField
            fullWidth
            variant="outlined"
            value={searchParams.keyword}
            onChange={handleChange("keyword")}
            size="small"
            sx={{
              input: { backgroundColor: "#fff" },
              "& .MuiOutlinedInput-root": {
                "&.Mui-focused fieldset": {
                  borderColor: "#23651a",
                  boxShadow: "0 0 0 1px #23651a",
                },
              },
            }}
          />
        </Box>
        <Box sx={{ width: "100%" }}>
          <Typography sx={{ fontSize: "1rem", mb: "0.25rem", display: 'flex', alignItems: 'center' }}>
            <LibraryBooksIcon sx={{ color: '#23651a', fontSize: 18, mr: 0.5 }} />購入日
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <TextField
              type="date"
              value={searchParams.purchased_from}
              onChange={handleChange("purchased_from")}
              size="small"
              sx={{
                width: "48%",
                input: { backgroundColor: "#fff" },
                "& .MuiOutlinedInput-root": {
                  "&.Mui-focused fieldset": {
                    borderColor: "#23651a",
                    boxShadow: "0 0 0 1px #23651a",
                  },
                },
              }}
              InputLabelProps={{ shrink: true }}
            />
            <Typography sx={{ color: "#888", fontWeight: 600 }}>~</Typography>
            <TextField
              type="date"
              value={searchParams.purchased_to}
              onChange={handleChange("purchased_to")}
              size="small"
              sx={{
                width: "48%",
                input: { backgroundColor: "#fff" },
                "& .MuiOutlinedInput-root": {
                  "&.Mui-focused fieldset": {
                    borderColor: "#23651a",
                    boxShadow: "0 0 0 1px #23651a",
                  },
                },
              }}
              InputLabelProps={{ shrink: true }}
            />
          </Box>
        </Box>
      </Stack>
      <Stack direction="row" spacing={"0.5rem"} sx={{ mt: "1rem", justifyContent: "flex-end" }}>
        <Button
          variant="contained"
          onClick={handleSearch}
          sx={{
            bgcolor: "#23651a",
            borderRadius: "0.375rem",
            textTransform: "none",
            width: "4.0625rem",
            height: "2.125rem",
            minWidth: 0,
            minHeight: 0,
            p: 0,
            '&:hover': { bgcolor: '#1b4e14' },
          }}
        >
          検索
        </Button>
        <Button
          variant="outlined"
          onClick={handleClear}
          sx={{
            color: "black",
            bgcolor: "white",
            borderColor: "#d6d6d6",
            borderRadius: "0.3125rem",
            textTransform: "none",
            width: "4.0625rem",
            height: "2.125rem",
            minWidth: 0,
            minHeight: 0,
            p: 0,
          }}
        >
          クリア
        </Button>
      </Stack>
    </Box>
  );
};

export default SidebarSection;