import {
    Box,
    Button,
    CircularProgress,
    Container,
    Paper,
    Stack,
    TextField,
    Typography,
    MenuItem
} from "@mui/material";
import React, { useEffect, useState } from "react";
import HeaderSection from "./HeaderSection";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { getToken } from "./utils/tokenStorage";
import LibraryAddIcon from "@mui/icons-material/LibraryAdd";
import PersonIcon from "@mui/icons-material/Person";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import PlaceIcon from "@mui/icons-material/Place";
import NotesIcon from "@mui/icons-material/Notes";
import DialogFrame from "./Dialog";

const RegistOrEditBook: React.FC = () => {
    const { id } = useParams<{ id?: string }>();
    const isEdit = !!id;
    const [form, setForm] = useState({
        title: "",
        author: "",
        isbn: "",
        location: "",
        memo: "",
        purchasedAt: "",
    });
    const [errors, setErrors] = useState<{ title?: string; author?: string }>({});
    const [loading, setLoading] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (id) {
            fetchBook();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchBook = async () => {
        try {
            const token = getToken();
            const res = await axios.put(`/api/books/${id}`, {
                headers: token ? { Authorization: `Bearer ${token}` } : {},
            });
            setForm({
                title: res.data.book.title || "",
                author: res.data.book.author || "",
                isbn: res.data.book.isbn || "",
                location: res.data.book.location || "",
                memo: res.data.book.memo || "",
                purchasedAt: res.data.book.purchasedAt || "",
            });
        } catch {
            console.log("書籍情報の取得に失敗しました");
            navigate("/books");
            return;
        }
    };

    const validate = () => {
        const newErrors: { title?: string; author?: string } = {};
        if (!form.title) newErrors.title = "タイトルは必須です";
        else if (form.title.length > 255) newErrors.title = "255文字以内で入力してください";
        if (!form.author) newErrors.author = "著者は必須です";
        else if (form.author.length > 255) newErrors.author = "255文字以内で入力してください";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;
        setLoading(true);
        try {
            const token = getToken();
            if (isEdit && id) {
                await axios.put(
                    `/api/books/${id}`,
                    {
                        title: form.title,
                        author: form.author,
                        isbn: form.isbn,
                        location: form.location,
                        memo: form.memo,
                        purchasedAt: form.purchasedAt,
                    },
                    { headers: token ? { Authorization: `Bearer ${token}` } : {} }
                );
            } else {
                await axios.post(
                    "/api/books",
                    {
                        title: form.title,
                        author: form.author,
                        isbn: form.isbn,
                        location: form.location,
                        memo: form.memo,
                        purchasedAt: form.purchasedAt,
                    },
                    { headers: token ? { Authorization: `Bearer ${token}` } : {} }
                );
            }
            setDialogOpen(true);
        } catch {
            alert(isEdit ? "更新に失敗しました" : "登録に失敗しました");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ bgcolor: "#f5f5f5", minHeight: "100vh", width: "100%" }}>
            <Container maxWidth={false} disableGutters sx={{ position: "relative", height: "1020px" }}>
                <HeaderSection />
                <Box sx={{ mt: 8, ml: 16 }}>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 4 }}>
                        <LibraryAddIcon sx={{ color: "#23651a", fontSize: 32, mr: 1 }} />
                        <Typography variant="h1" sx={{ fontWeight: 700, fontSize: "1.125rem", letterSpacing: "0.03em" }}>
                            {isEdit ? "書籍情報編集" : "新規書籍登録"}
                        </Typography>
                    </Box>
                    <Paper elevation={0} sx={{ width: "640px", bgcolor: "transparent" }}>
                        <form onSubmit={handleSubmit}>
                            <Stack spacing={3}>
                                {/* タイトル */}
                                <Box>
                                    <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                                        <MenuBookIcon sx={{ color: "#23651a", fontSize: 20, mr: 0.5 }} />
                                        <Typography variant="subtitle1" sx={{ fontWeight: 600, fontSize: "1rem", letterSpacing: "0.03em" }}>
                                            タイトル <span style={{ color: "red" }}>*</span>
                                        </Typography>
                                    </Box>
                                    <TextField
                                        fullWidth
                                        variant="outlined"
                                        size="small"
                                        name="title"
                                        value={form.title}
                                        onChange={handleChange}
                                        error={!!errors.title}
                                        helperText={errors.title}
                                        inputProps={{ maxLength: 255 }}
                                        sx={{
                                            "& .MuiOutlinedInput-root": {
                                                borderRadius: "7px",
                                                bgcolor: "white",
                                                "&.Mui-focused fieldset": {
                                                    borderColor: "#23651a",
                                                    boxShadow: "0 0 0 1px #23651a",
                                                },
                                            },
                                        }}
                                    />
                                </Box>
                                {/* 著者 */}
                                <Box>
                                    <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                                        <PersonIcon sx={{ color: "#23651a", fontSize: 20, mr: 0.5 }} />
                                        <Typography variant="subtitle1" sx={{ fontWeight: 600, fontSize: "1rem", letterSpacing: "0.03em" }}>
                                            著者 <span style={{ color: "red" }}>*</span>
                                        </Typography>
                                    </Box>
                                    <TextField
                                        fullWidth
                                        variant="outlined"
                                        size="small"
                                        name="author"
                                        value={form.author}
                                        onChange={handleChange}
                                        error={!!errors.author}
                                        helperText={errors.author}
                                        inputProps={{ maxLength: 255 }}
                                        sx={{
                                            "& .MuiOutlinedInput-root": {
                                                borderRadius: "7px",
                                                bgcolor: "white",
                                                "&.Mui-focused fieldset": {
                                                    borderColor: "#23651a",
                                                    boxShadow: "0 0 0 1px #23651a",
                                                },
                                            },
                                        }}
                                    />
                                </Box>
                                {/* ISBN */}
                                <Box>
                                    <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                                        <MenuBookIcon sx={{ color: "#23651a", fontSize: 20, mr: 0.5 }} />
                                        <Typography variant="subtitle1" sx={{ fontWeight: 600, fontSize: "1rem", letterSpacing: "0.03em" }}>
                                            ISBN
                                        </Typography>
                                    </Box>
                                    <TextField
                                        fullWidth
                                        variant="outlined"
                                        size="small"
                                        name="isbn"
                                        value={form.isbn}
                                        onChange={handleChange}
                                        sx={{
                                            "& .MuiOutlinedInput-root": {
                                                borderRadius: "7px",
                                                bgcolor: "white",
                                                "&.Mui-focused fieldset": {
                                                    borderColor: "#23651a",
                                                    boxShadow: "0 0 0 1px #23651a",
                                                },
                                            },
                                        }}
                                    />
                                </Box>
                                {/* 保管場所 */}
                                <Box>
                                    <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                                        <PlaceIcon sx={{ color: "#23651a", fontSize: 20, mr: 0.5 }} />
                                        <Typography variant="subtitle1" sx={{ fontWeight: 600, fontSize: "1rem", letterSpacing: "0.03em" }}>
                                            保管場所
                                        </Typography>
                                    </Box>
                                    <TextField
                                        select
                                        fullWidth
                                        variant="outlined"
                                        size="small"
                                        name="location"
                                        value={form.location}
                                        onChange={handleChange}
                                        sx={{
                                            "& .MuiOutlinedInput-root": {
                                                borderRadius: "7px",
                                                bgcolor: "white",
                                                "&.Mui-focused fieldset": {
                                                    borderColor: "#23651a",
                                                    boxShadow: "0 0 0 1px #23651a",
                                                },
                                            },
                                        }}
                                    >
                                        <MenuItem value="">未選択</MenuItem>
                                        <MenuItem value="2F 一般書棚">2F 一般書棚</MenuItem>
                                        <MenuItem value="2F ビジネス書棚">2F ビジネス書棚</MenuItem>
                                        <MenuItem value="3F DB棚">3F DB棚</MenuItem>
                                        <MenuItem value="3F Web棚">3F Web棚</MenuItem>
                                        <MenuItem value="3F 技術書棚">3F 技術書棚</MenuItem>
                                        <MenuItem value="4F 新刊棚">4F 新刊棚</MenuItem>
                                    </TextField>
                                </Box>
                                {/* 購入日 */}
                                <Box>
                                    <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                                        <MenuBookIcon sx={{ color: "#23651a", fontSize: 20, mr: 0.5 }} />
                                        <Typography variant="subtitle1" sx={{ fontWeight: 600, fontSize: "1rem", letterSpacing: "0.03em" }}>
                                            購入日
                                        </Typography>
                                    </Box>
                                    <TextField
                                        fullWidth
                                        variant="outlined"
                                        size="small"
                                        name="purchasedAt"
                                        type="date"
                                        value={form.purchasedAt}
                                        onChange={handleChange}
                                        sx={{
                                            "& .MuiOutlinedInput-root": {
                                                borderRadius: "7px",
                                                bgcolor: "white",
                                                "&.Mui-focused fieldset": {
                                                    borderColor: "#23651a",
                                                    boxShadow: "0 0 0 1px #23651a",
                                                },
                                            },
                                        }}
                                        InputLabelProps={{ shrink: true }}
                                    />
                                </Box>
                                {/* メモ */}
                                <Box>
                                    <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                                        <NotesIcon sx={{ color: "#23651a", fontSize: 20, mr: 0.5 }} />
                                        <Typography variant="subtitle1" sx={{ fontWeight: 600, fontSize: "1rem", letterSpacing: "0.03em" }}>
                                            メモ
                                        </Typography>
                                    </Box>
                                    <TextField
                                        fullWidth
                                        variant="outlined"
                                        size="small"
                                        name="memo"
                                        value={form.memo}
                                        onChange={handleChange}
                                        multiline
                                        minRows={2}
                                        sx={{
                                            "& .MuiOutlinedInput-root": {
                                                borderRadius: "7px",
                                                bgcolor: "white",
                                                "&.Mui-focused fieldset": {
                                                    borderColor: "#23651a",
                                                    boxShadow: "0 0 0 1px #23651a",
                                                },
                                            },
                                        }}
                                    />
                                </Box>
                            </Stack>
                            <Box sx={{ mt: 4, display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 2 }}>
                                <Button
                                    type="button"
                                    variant="outlined"
                                    disabled={loading}
                                    onClick={() => navigate("/books")}
                                    sx={{
                                        borderColor: "#23651a",
                                        color: "#23651a",
                                        fontWeight: 600,
                                        borderRadius: "0.375rem",
                                        textTransform: "none",
                                        minWidth: "100px",
                                    }}
                                >
                                    キャンセル
                                </Button>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    disabled={loading}
                                    startIcon={isEdit ? <LibraryAddIcon /> : <LibraryAddIcon />}
                                    sx={{
                                        backgroundColor: "#23651a",
                                        "&:hover": { backgroundColor: "#1b4e14" },
                                        minWidth: "120px",
                                        fontWeight: 600,
                                        borderRadius: "0.375rem",
                                        textTransform: "none",
                                    }}
                                >
                                    {loading ? <CircularProgress size={22} color="inherit" sx={{ mr: 1 }} /> : null}
                                    {loading ? (isEdit ? "更新中..." : "登録中...") : (isEdit ? "更新" : "登録")}
                                </Button>
                            </Box>
                        </form>
                    </Paper>
                    {dialogOpen && (
                        <DialogFrame
                            open={dialogOpen}
                            onClose={() => {
                                setDialogOpen(false);
                                navigate("/books");
                            }}
                            title={isEdit ? "更新完了" : "登録完了"}
                            message={isEdit ? "書籍の更新が完了しました。" : "書籍の登録が完了しました。"}
                        />
                    )}
                </Box>
            </Container>
        </Box>
    );
};

export default RegistOrEditBook;