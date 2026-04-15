import React, { useState } from "react"
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    MenuItem,
    Stack,
    Typography,
    type SxProps,
} from "@mui/material"
import type { User } from "@supabase/supabase-js"
import { useEffect } from "react"

interface CreateFamilyGroupDialogProps {
    open: boolean
    onClose: () => void
    cardStyle?: SxProps
    currentUser: User
}

const CreateFamilyGroupDialog: React.FC<CreateFamilyGroupDialogProps> = ({
    open,
    onClose,
    cardStyle,
    currentUser,
}) => {
    const [name, setName] = useState("")
    const [members, setMembers] = useState<string[]>([])
    const [userOptions, setUserOptions] = useState<string[]>([])
    const [isCreating, setIsCreating] = useState(false)
    const [isLoadingUsers, setIsLoadingUsers] = useState(false)
    const [errorMessage, setErrorMessage] = useState<string | null>(null)

    const resetForm = () => {
        setName("")
        setMembers([])
        setUserOptions([])
        setErrorMessage(null)
    }

    useEffect(() => {
        let isActive = true

        const loadUsers = async () => {
            if (!open) {
                setUserOptions([])
                return
            }

            setIsLoadingUsers(true)
            const response = await fetch("http://localhost:3000/users")
            if (!response.ok) {
                throw new Error("Failed to load users")
            }

            const data = (await response.json()) as Array<{ id: string; email: string }>
            const ownerId = (currentUser.email ?? currentUser.id).trim().toLowerCase()
            const users = Array.from(
                new Set(
                    data
                        .map((user) => user.email?.trim().toLowerCase())
                        .filter((email) => email !== ownerId),
                ),
            )

            if (isActive) {
                setUserOptions(users)
                setIsLoadingUsers(false)
            }
        }

        void loadUsers()

        return () => {
            isActive = false
        }
    }, [currentUser.email, currentUser.id, open])

    const handleCreateFamilyGroup = async () => {
        const trimmedName = name.trim()

        if (!trimmedName) {
            setErrorMessage("The family group name is required.")
            return
        }

        const ownerId = (currentUser.email ?? currentUser.id).trim().toLowerCase()

        if (!ownerId) {
            setErrorMessage("You need to be logged in to create a family group.")
            return
        }

        const trimedMembers = Array.from(
            new Set(
                [ownerId, ...members.map((member) => member.trim().toLowerCase())].filter(
                    (member) => member.length > 0,
                ),
            ),
        )

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
                    ownerId: ownerId,
                    members: trimedMembers,
                }),
            })

            if (!response.ok) {
                throw new Error("Could not create family group. Please try again.")
            }

            resetForm()
            onClose()
        } catch {
            setErrorMessage("Could not create family group. Please try again.")
        } finally {
            setIsCreating(false)
        }
    }

    return (
        <Dialog
            open={open}
            onClose={() => {
                onClose()
                resetForm()
            }}
            fullWidth
            maxWidth="sm"
            slotProps={{
                paper: { sx: cardStyle },
            }}
        >
            <DialogTitle sx={{color: '#f7f7f7'}}>Create new family group</DialogTitle>

            <DialogContent>
                <Stack spacing={2} sx={{ mt: 1 }}>
                    <TextField
                        placeholder="Group name"
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

                    <TextField
                        select
                        fullWidth
                        size="small"
                        label="Members"
                        value={members}
                        onChange={(e) => {
                            const value = e.target.value
                            setMembers(typeof value === "string" ? value.split(",") : value)
                        }}
                        slotProps={{
                            select: {
                            multiple: true,
                            },
                        }}
                        helperText={isLoadingUsers ? "Loading users..." : " "}
                        sx={{
                            "& .MuiInputBase-input": { color: "#f7f7f7" },
                            "& .MuiOutlinedInput-root": {
                                "& fieldset": { borderColor: "#292d3b" },
                            },
                            "& .MuiFormHelperText-root": { color: "#9fa6c2" },
                        }}
                    >
                        {userOptions.map((email) => (
                            <MenuItem key={email} value={email}>
                                {email}
                            </MenuItem>
                        ))}
                    </TextField>

                    <Typography variant="caption" sx={{ color: "#9fa6c2" }}>
                        Choose members from the list of registered users.
                    </Typography>

                    <Typography variant="caption" sx={{ color: "#9fa6c2" }}>
                        The logged-in user is always included automatically as the owner.
                    </Typography>
                </Stack>
            </DialogContent>

            <DialogActions>
                <Button
                    onClick={() => {
                        onClose()
                        resetForm()
                    }}
                    sx={{ color: "#f7f7f7" }}
                >
                    Cancel
                </Button>
                <Button onClick={handleCreateFamilyGroup} variant="contained" disabled={isCreating}>
                    Create
                </Button>
            </DialogActions>
        </Dialog>
    )
}

export default CreateFamilyGroupDialog