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

interface CreateCalendarEventDialogProps {
    open: boolean;
    onClose: () => void;
    cardStyle?: SxProps;
}

type FieldErrors = {
    title: string | null;
    familyGroupId: string | null;
    startAt: string | null;
    endAt: string | null;
    submit: string | null;
}

const CreateCalendarEventDialog: React.FC<CreateCalendarEventDialogProps> = ({
    open,
    onClose,
    cardStyle,
}) => {
    const [title, setTitle] = useState("")
    const [description, setDescription] = useState("")
    const [familyGroupId, setFamilyGroupId] = useState("")
    const [startAt, setStartAt] = useState("")
    const [endAt, setEndAt] = useState("")
    const [isCreating, setIsCreating] = useState(false)
    const [errors, setErrors] = useState<FieldErrors>({
        title: null,
        familyGroupId: null,
        startAt: null,
        endAt: null,
        submit: null,
    })

    const handleClose = () => {
        setTitle("")
        setDescription("")
        setFamilyGroupId("")
        setStartAt("")
        setEndAt("")
        setErrors({
            title: null,
            familyGroupId: null,
            startAt: null,
            endAt: null,
            submit: null,
        })
        onClose()
    }

    const handleCreateCalendarEvent = async () => {
        const trimmedTitle = title.trim()
        const nextErrors: FieldErrors = {
            title: null,
            familyGroupId: null,
            startAt: null,
            endAt: null,
            submit: null,
        }
        let hasError = false

        if (!trimmedTitle) {
            nextErrors.title = "The calendar event title is required."
            hasError = true
        }
        
        if (!familyGroupId.trim()) {
            nextErrors.familyGroupId = "The family group ID is required."
            hasError = true
        }

        if (!startAt) {
            nextErrors.startAt = "Start time is required."
            hasError = true
        }

        if (!endAt) {
            nextErrors.endAt = "End time is required."
            hasError = true
        }

        if (hasError) {
            setErrors(nextErrors)
            return
        }

        const startDate = new Date(startAt)
        const endDate = new Date(endAt)

        if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
            setErrors({
                ...nextErrors,
                startAt: "Please provide valid start and end times.",
                endAt: "Please provide valid start and end times.",
            })
            return
        }

        if (endDate <= startDate) {
            setErrors({
                ...nextErrors,
                endAt: "End time must be after start time.",
            })
            return
        }

        setIsCreating(true)
        setErrors(nextErrors)

        try {
            const response = await fetch('http://localhost:3000/calendar-events', {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    title: trimmedTitle,
                    description: description.trim() || "",
                    familyGroupId: familyGroupId.trim(),
                    startAt: startDate.toISOString(),
                    endAt: endDate.toISOString(),
                }),
            })

            if (!response.ok) {
                throw new Error("Could not create calendar event. Please try again.")
            }

            setTitle("")
            setDescription("")
            setFamilyGroupId("")
            setStartAt("")
            setEndAt("")
            setErrors(nextErrors)
            onClose()
        } catch {
            setErrors({
                ...nextErrors,
                submit: "Could not create calendar event. Please try again.",
            })
        } finally {
            setIsCreating(false)
        }
    };

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            fullWidth
            maxWidth="sm"
            slotProps={{
                paper: { sx: cardStyle },
            }}
        >
            <DialogTitle sx={{color: '#f7f7f7'}}>Create new calendar event</DialogTitle>

            <DialogContent>
                <TextField
                    placeholder="Title"
                    variant="standard"
                    value={title}
                    onChange={(e) => {
                        setTitle(e.target.value)
                        setErrors((prev) => ({ ...prev, title: null, submit: null }))
                    }}
                    fullWidth
                    error={Boolean(errors.title)}
                    helperText={errors.title ?? " "}
                    sx={{
                        "& .MuiInputBase-input": { color: "#f7f7f7" },
                        "& .MuiInputBase-input::placeholder": { color: "#f7f7f7", opacity: 1 },
                    }}
                />
                <TextField
                    placeholder="Description"
                    variant="standard"
                    value={description}
                    onChange={(e) => {
                        setDescription(e.target.value)
                        setErrors((prev) => ({ ...prev, submit: null }))
                    }}
                    fullWidth
                    helperText={" "}
                    sx={{
                        "& .MuiInputBase-input": { color: "#f7f7f7" },
                        "& .MuiInputBase-input::placeholder": { color: "#f7f7f7", opacity: 1 },
                    }}
                />
                <TextField
                    placeholder="Family Group ID"
                    variant="standard"
                    value={familyGroupId}
                    onChange={(e) => {
                        setFamilyGroupId(e.target.value)
                        setErrors((prev) => ({ ...prev, familyGroupId: null, submit: null }))
                    }}
                    fullWidth
                    error={Boolean(errors.familyGroupId)}
                    helperText={errors.familyGroupId ?? " "}
                    sx={{
                        "& .MuiInputBase-input": { color: "#f7f7f7" },
                        "& .MuiInputBase-input::placeholder": { color: "#f7f7f7", opacity: 1 },
                    }}
                />
                <TextField
                    label="Start"
                    type="datetime-local"
                    variant="standard"
                    value={startAt}
                    onChange={(e) => {
                        setStartAt(e.target.value)
                        setErrors((prev) => ({ ...prev, startAt: null, submit: null }))
                    }}
                    fullWidth
                    slotProps={{inputLabel: { shrink: true }}}
                    error={Boolean(errors.startAt)}
                    helperText={errors.startAt ?? " "}
                    sx={{
                        "& .MuiInputBase-input": { color: "#f7f7f7" },
                        "& .MuiInputLabel-root": { color: "#f7f7f7" },
                        "& .MuiInputBase-input::-webkit-calendar-picker-indicator": { filter: "invert(100%)" },
                    }}
                />
                <TextField
                    label="End"
                    type="datetime-local"
                    variant="standard"
                    value={endAt}
                    onChange={(e) => {
                        setEndAt(e.target.value)
                        setErrors((prev) => ({ ...prev, endAt: null, submit: null }))
                    }}
                    fullWidth
                    slotProps={{inputLabel: { shrink: true }}}
                    error={Boolean(errors.endAt)}
                    helperText={errors.endAt ?? " "}
                    sx={{
                        "& .MuiInputBase-input": { color: "#f7f7f7" },
                        "& .MuiInputLabel-root": { color: "#f7f7f7" },
                        "& .MuiInputBase-input::-webkit-calendar-picker-indicator": { filter: "invert(100%)" },
                    }}
                />
                {errors.submit ? (
                    <TextField
                        variant="standard"
                        value={errors.submit}
                        fullWidth
                        InputProps={{ readOnly: true, disableUnderline: true }}
                        sx={{
                            "& .MuiInputBase-input": { color: "#ff8a80", px: 0, py: 0 },
                        }}
                    />
                ) : null}
            </DialogContent>

            <DialogActions>
                <Button onClick={handleClose} sx={{ color: "#f7f7f7" }}>
                    Cancel
                </Button>
                <Button onClick={handleCreateCalendarEvent} variant="contained" disabled={isCreating}>
                    Create
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default CreateCalendarEventDialog;