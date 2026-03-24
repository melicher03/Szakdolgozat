import { Box, Button, TextField, Typography } from '@mui/material'
import { useState } from 'react';

const LoginPage: React.FC = () => {
    const [, setEmail] = useState("");
    const [, setPassword] = useState("");

    return (
        <Box
            sx={{
                height: "100vh",
                backgroundColor: '#1e2232',
                justifyContent: "center",
                alignItems: "center",
                display: "flex",
            }}
        >
            <Box
                sx={{
                    height: "60vh",
                    width: "50vh",
                    backgroundColor: '#1a1d29',
                    borderRadius: 5,
                    border: 2,
                    borderColor: "#292d3b",
                    justifyContent: "center",
                    display: "flex",
                    alignItems: "center",
                    flexDirection: "column",
                    gap: 5,
                }}
            >
                <Typography variant="h4" fontWeight={"bold"} color='#f7f7f7'>
                    FamilyHub
                </Typography>
                <Box
                    sx={{
                        minHeight: "40vh",
                        width: "40vh",
                        backgroundColor: '#141620',
                        borderRadius: 5,
                        border: 3,
                        borderColor: "#1f222c",
                        display: "flex",
                        flexDirection: "column",
                        p: 3,
                        gap: 1.5,
                    }}
                >
                    <Typography variant="h6" color='#f7f7f7'>
                        Email
                    </Typography>
                    <TextField
                        placeholder="Enter your email"
                        onChange={(e) => setEmail(e.target.value)}
                        sx={{
                            backgroundColor: "#1f222f",
                            borderRadius: 2,
                            "& .MuiOutlinedInput-notchedOutline": { border: "none" },
                            "& .MuiInputBase-input": {
                                color: "#f7f7f7",
                            },
                        }}
                    />

                    <Typography variant="h6" color='#f7f7f7'>
                        Password
                    </Typography>
                    <TextField
                        placeholder="Enter your password"
                        type="password"
                        onChange={(e) => setPassword(e.target.value)}
                        sx={{
                            backgroundColor: "#1f222f",
                            borderRadius: 2,
                            "& .MuiOutlinedInput-notchedOutline": { border: "none" },
                            "& .MuiInputBase-input": {
                                color: "#f7f7f7",
                            },
                        }}
                    />

                    <Button
                        variant="contained"
                        //onClick={() => onLogin(email, password)}
                        sx={{
                            mt: 2,
                            borderRadius: 2,
                            py: 1.5,
                            textTransform: "none",
                            fontWeight: "bold",
                            '&:hover': { backgroundColor: "#305abf" },
                        }}
                    >
                        Login
                    </Button>

                    <Button
                        variant="text"
                        //onClick={() => onRegister(email, password)}
                        sx={{
                            color: "#f7f7f7",
                            textTransform: "none",
                            '&:hover': { backgroundColor: "#24283b" },
                        }}
                    >
                        Register
                    </Button>
                </Box>
            </Box>
        </Box>
    )
}


export default LoginPage