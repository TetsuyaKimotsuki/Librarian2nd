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
    message: string;
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
                maxWidth="md"
                BackdropProps={{
                    sx: {
                        backgroundColor: "rgba(0,0,0,0.45)",
                        zIndex: 1200,
                    },
                }}
                PaperProps={{
                    sx: {
                        width: 838,
                        height: 442,
                        borderRadius: "28px",
                        boxShadow: "none",
                        m: 0,
                        display: "flex",
                        flexDirection: "column",
                    },
                }}
            >
                <DialogTitle
                    sx={{
                        bgcolor: "#64a35b",
                        color: "white",
                        fontSize: 28,
                        fontFamily: "Inter-Regular, Helvetica",
                        height: 76,
                        p: 2.5,
                        pl: 3.5,
                        borderTopLeftRadius: "28px",
                        borderTopRightRadius: "28px",
                    }}
                >
                    {title}
                </DialogTitle>
                <DialogContent sx={{ p: 0, position: "relative", height: "100%" }}>
                    <Typography
                        sx={{
                            fontSize: 18,
                            fontFamily: "Inter-Regular, Helvetica",
                            position: "absolute",
                            top: 23,
                            left: 115,
                            width: 608,
                        }}
                    >
                        {message}
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ justifyContent: "center", pb: 4, pt: 0, borderBottomLeftRadius: "28px", borderBottomRightRadius: "28px", background: "transparent" }}>
                    <Button
                        variant="contained"
                        onClick={onClose}
                        sx={{
                            bgcolor: "#23651a",
                            border: "1px solid #6a6a6a",
                            borderRadius: "5px",
                            px: 8.5,
                            py: 1.25,
                            fontSize: 16,
                            fontFamily: "Inter-Regular, Helvetica",
                            textTransform: "none",
                            "&:hover": {
                                bgcolor: "#1b5015",
                            },
                        }}
                    >
                        OK
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default Frame;