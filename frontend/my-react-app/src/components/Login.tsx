import { Box, Button, TextField, Typography, Alert, CircularProgress } from '@mui/material'
import { useState } from 'react';
import { supabase } from '../services/supabaseClient';

const LoginPage: React.FC = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isRegistering, setIsRegistering] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleLogin = async () => {
        setError(null);
        setLoading(true);
        try {
            const { error: signInError } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (signInError) throw signInError;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async () => {
        setError(null);
        setLoading(true);
        try {
            const { error: signUpError } = await supabase.auth.signUp({
                email,
                password,
            });

            if (signUpError) throw signUpError;
            setError(null);
            alert('Registration successful! Please sign in.');
            setIsRegistering(false);
            setEmail('');
            setPassword('');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isRegistering) {
            handleRegister();
        } else {
            handleLogin();
        }
    };

    return (
        <Box
            sx={{
                minHeight: "100vh",
                backgroundColor: '#1e2232',
                justifyContent: "center",
                alignItems: "center",
                display: "flex",
            }}
        >
            <Box
                sx={{
                    minHeight: "60vh",
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
                    component="form"
                    onSubmit={handleSubmit}
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
                        {isRegistering ? 'Register' : 'Login'}
                    </Typography>

                    {error && (
                        <Alert severity="error" sx={{ backgroundColor: '#562b2b', color: '#f7f7f7' }}>
                            {error}
                        </Alert>
                    )}

                    <Typography variant="body2" color='#f7f7f7'>
                        Email
                    </Typography>
                    <TextField
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={loading}
                        required
                        sx={{
                            backgroundColor: "#1f222f",
                            borderRadius: 2,
                            "& .MuiOutlinedInput-notchedOutline": { border: "none" },
                            "& .MuiInputBase-input": {
                                color: "#f7f7f7",
                            },
                        }}
                    />

                    <Typography variant="body2" color='#f7f7f7'>
                        Password
                    </Typography>
                    <TextField
                        placeholder="Enter your password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={loading}
                        required
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
                        type="submit"
                        variant="contained"
                        disabled={loading}
                        sx={{
                            mt: 2,
                            borderRadius: 2,
                            py: 1.5,
                            textTransform: "none",
                            fontWeight: "bold",
                            '&:hover': { backgroundColor: "#305abf" },
                        }}
                    >
                        {loading ? <CircularProgress size={24} /> : (isRegistering ? 'Register' : 'Login')}
                    </Button>

                    <Button
                        type="button"
                        variant="text"
                        onClick={() => {
                            setIsRegistering(!isRegistering);
                            setError(null);
                        }}
                        disabled={loading}
                        sx={{
                            color: "#f7f7f7",
                            textTransform: "none",
                            '&:hover': { backgroundColor: "#24283b" },
                        }}
                    >
                        {isRegistering ? 'Already have an account? Login' : "Don't have an account? Register"}
                    </Button>
                </Box>
            </Box>
        </Box>
    )
}

export default LoginPage