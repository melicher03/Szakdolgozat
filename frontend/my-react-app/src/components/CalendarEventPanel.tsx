import { Add } from "@mui/icons-material";
import { Box, IconButton, Stack, Typography } from "@mui/material";
import dayjs from "dayjs";
import { useState } from "react";
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

type CalendarEventPanelProps = {
  onCreateCalendarEvent: () => void;
};

const CalendarEventPanel: React.FC<CalendarEventPanelProps> = ({
  onCreateCalendarEvent,
}) => {
  const [value] = useState(dayjs());

  return (
    <>
        <Box
        sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
        }}
        >
        <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold" }}>
            Upcoming events
        </Typography>
        <IconButton
            onClick={onCreateCalendarEvent}
            sx={{ bgcolor: '#1e2232', '&:hover': { bgcolor: '#3b4363' } }}
        >
            <Add sx={{ color: '#f7f7f7' }} />
        </IconButton>
        </Box>

        <Stack spacing={2}>
        <Box>
            <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="en-gb">
            <DateCalendar
                value={value}
                sx={{
                width: '100%',
                color: '#f7f7f7',
                '& .MuiPickersDay-root': {
                    color: '#f7f7f7',
                    },
                    '& .MuiDayCalendar-weekDayLabel': {
                        color: '#f7f7f7',
                },
                '& .MuiPickersArrowSwitcher-button': {
                    color: '#f7f7f7',
                },
                '& .MuiPickersCalendarHeader-switchViewButton': {
                    color: '#f7f7f7',
                },
                }}
            />
            </LocalizationProvider>
        </Box>
        </Stack>
    </>
  )
}

export default CalendarEventPanel