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

    const defaultOwnerId = "local-user"

    const handleCreateFamilyGroup = async () => {
        const trimmedName = name.trim()

        if (!trimmedName) {
            setErrorMessage("The family group name is required.")
            return
        }

        setIsCreating(true)
        setErrorMessage(null)

        try {
            const response = await fetch('http://localhost:3000/family-groups', {
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
                throw new Error("Could not create family group. Please try again.")
            }

            setName("")
            onClose()
        } catch {
            setErrorMessage("Could not create family group. Please try again.")
        } finally {
            setIsCreating(false)
        }
    };

    return (
        <Dialog
            open={open}
            onClose={() => { onClose(); setName("") }}
            fullWidth
            maxWidth="sm"
            slotProps={{
                paper: { sx: cardStyle },
            }}
        >
            <DialogTitle sx={{color: '#f7f7f7'}}>Create new family group</DialogTitle>

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
                <Button onClick={() => { onClose(); setName("") }} sx={{ color: "#f7f7f7" }}>
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