import React, { useState } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    type SxProps,
} from "@mui/material";

interface CreateFamilyGroupDialogProps {
    open: boolean;
    onClose: () => void;
    cardStyle?: SxProps;
}

const CreateFamilyGroupDialog: React.FC<CreateFamilyGroupDialogProps> = ({
    open,
    onClose,
    cardStyle,
}) => {
    const [name, setName] = useState("")
    const [isCreating, setIsCreating] = useState(false)
    const [errorMessage, setErrorMessage] = useState<string | null>(null)

    const apiBaseUrl = import.meta.env.VITE_API_URL ?? "http://localhost:3000"
    const defaultOwnerId = "local-user"

    const handleCreateFamilyGroup = async () => {
        const trimmedName = name.trim()

        if (!trimmedName) {
            setErrorMessage("A csoport neve kötelező.")
            return
        }

        setIsCreating(true)
        setErrorMessage(null)

        try {
            const response = await fetch(`${apiBaseUrl}/family-groups`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: trimmedName,
                    ownerId: defaultOwnerId,
                    members: [defaultOwnerId],
                }),
            })

            if (!response.ok) {
                throw new Error("Nem sikerult letrehozni a csoportot.")
            }

            setName("")
            onClose()
        } catch {
            setErrorMessage("A csoport letrehozasa sikertelen. Probald ujra.")
        } finally {
            setIsCreating(false)
        }
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            fullWidth
            maxWidth="sm"
            slotProps={{
                paper: { sx: cardStyle },
            }}
        >
            <DialogTitle>Create new family group</DialogTitle>

            <DialogContent>
                <TextField
                    placeholder="Name"
                    variant="standard"
                    value={name}
                    onChange={(e) => {
                        setName(e.target.value)
                        if (errorMessage) {
                            setErrorMessage(null)
                        }
                    }}
                    fullWidth
                    error={Boolean(errorMessage)}
                    helperText={errorMessage ?? " "}
                    sx={{
                        "& .MuiInputBase-input": { color: "#f7f7f7" },
                        "& .MuiFormHelperText-root": { color: "#ff8a80" },
                    }}
                />
            </DialogContent>

            <DialogActions>
                <Button onClick={onClose} sx={{ color: "#f7f7f7" }}>
                    Cancel
                </Button>
                <Button onClick={handleCreateFamilyGroup} variant="contained" disabled={isCreating}>
                    Create
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default CreateFamilyGroupDialog;