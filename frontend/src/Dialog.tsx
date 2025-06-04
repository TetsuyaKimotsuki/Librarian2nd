import {
    Backdrop,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Typography,
} from "@mui/material";
import React from "react";

interface DialogFrameProps {
    open: boolean;
    onClose: () => void;
    title: string;
    message: React.ReactNode;
}

const Frame: React.FC<DialogFrameProps> = ({
    open,
    onClose,
    title,
    message,
}) => {
    return (
        <>
            <Backdrop
                sx={(theme) => ({ color: '#fff', zIndex: theme.zIndex.drawer + 1 })}
                open={open}
            ></Backdrop>
            <Dialog
                open={open}
                onClose={onClose}
                maxWidth="sm"
                sx={{
                    '& .MuiDialog-paper': {
                        width: 420,
                        minHeight: 220,
                        borderRadius: '18px',
                        boxShadow: '0 2px 8px 0 rgba(0,0,0,0.08)',
                        m: 0,
                        display: 'flex',
                        flexDirection: 'column',
                        px: 0,
                        py: 0,
                    },
                    '& .MuiBackdrop-root': {
                        backgroundColor: 'rgba(0,0,0,0.45)',
                    },
                }}
            >
                <DialogTitle
                    sx={{
                        bgcolor: "#64a35b",
                        color: "white",
                        fontSize: "1.1rem",
                        fontWeight: 600,
                        fontFamily: "Inter-Regular, Helvetica",
                        letterSpacing: "0.03em",
                        p: 1.2,
                        pl: 3,
                        borderTopLeftRadius: "18px",
                        borderTopRightRadius: "18px",
                    }}
                >
                    {title}
                </DialogTitle>
                <DialogContent sx={{ p: 0, position: "relative", minHeight: 90, display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-start' }}>
                    <Typography
                        sx={{
                            fontSize: 17,
                            fontFamily: "Inter-Regular, Helvetica",
                            px: '2.2rem',
                            py: '1.2rem',
                            textAlign: 'left',
                        }}
                    >
                        {message}
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ justifyContent: "center", pb: 3, pt: 0, borderBottomLeftRadius: "18px", borderBottomRightRadius: "18px", background: "transparent", px: 0 }}>
                    <Button
                        variant="contained"
                        onClick={onClose}
                        sx={{
                            bgcolor: "#23651a",
                            border: "1px solid #6a6a6a",
                            borderRadius: "0.375rem",
                            px: 5,
                            py: 1.1,
                            fontSize: 16,
                            fontFamily: "Inter-Regular, Helvetica",
                            textTransform: "none",
                            minWidth: "100px",
                            height: "2.125rem",
                            boxShadow: 'none',
                            '&:hover': {
                                bgcolor: "#1b5015",
                            },
                        }}
                    >
                        閉じる
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default Frame;