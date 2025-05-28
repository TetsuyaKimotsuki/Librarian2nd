import { Box, Button, Stack, TextField, Typography } from "@mui/material";
import React, { useState } from "react";

const SidebarSection: React.FC = () => {
  const [searchParams, setSearchParams] = useState({
    title: "",
    author: "",
    isbn: "",
    keyword: "",
  });

  const handleChange =
    (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
      setSearchParams({
        ...searchParams,
        [field]: event.target.value,
      });
    };

  const handleSearch = () => {
    // Search functionality would be implemented here
    console.log("Search with params:", searchParams);
  };

  const handleClear = () => {
    setSearchParams({
      title: "",
      author: "",
      isbn: "",
      keyword: "",
    });
  };

  const searchFields = [
    { id: "title", label: "タイトル" },
    { id: "author", label: "著者" },
    { id: "isbn", label: "ISBN" },
    { id: "keyword", label: "キーワード" },
  ];

  return (
    <Box sx={{ width: 278, p: "5px", mt: 15.5, ml: 7.5 }}>
      <Typography variant="h1" sx={{ fontSize: "24px", mb: 2 }}>
        書籍検索
      </Typography>

      <Stack spacing={2} sx={{ width: "100%", mb: 2 }}>
        {searchFields.map((field) => (
          <Box key={field.id} sx={{ width: "100%", height: 65 }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                height: 24,
                pl: 0.5,
                pt: 3,
                pb: 1,
              }}
            >
              <Typography sx={{ fontSize: "18px" }}>{field.label}</Typography>
            </Box>
            <TextField
              fullWidth
              variant="outlined"
              value={searchParams[field.id as keyof typeof searchParams]}
              onChange={handleChange(field.id)}
              InputProps={{
                sx: {
                  height: 26,
                  mt: 1,
                  ml: 0.5,
                },
              }}
            />
          </Box>
        ))}
      </Stack>

      <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
        <Button
          variant="contained"
          onClick={handleSearch}
          sx={{
            bgcolor: "#23651a",
            borderRadius: "5px",
            textTransform: "none",
            width: "65px",
            height: "34px",
            "&:hover": {
              bgcolor: "#1b4e14",
            },
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
            borderRadius: "5px",
            textTransform: "none",
            width: "65px",
            height: "34px",
          }}
        >
          クリア
        </Button>
      </Stack>
    </Box>
  );
};

export default SidebarSection;