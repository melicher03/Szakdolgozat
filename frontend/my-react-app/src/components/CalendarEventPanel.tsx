import { Add } from "@mui/icons-material";
import { Badge, Box, IconButton, List, ListItem, ListItemText, Stack, Typography } from "@mui/material";
import dayjs, { Dayjs } from "dayjs";
import { useEffect, useState } from "react";
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { PickersDay, type PickersDayProps } from '@mui/x-date-pickers/PickersDay';

type CalendarEvent = {
  id: number;
  title: string;
  description: string;
  startAt: string;
  endAt: string;
  familyGroupId: string;
};

type CalendarEventPanelProps = {
  onCreateCalendarEvent: () => void;
  selectedGroupId: number | null;
  apiBaseUrl?: string;
  refreshTrigger?: number;
};

const CalendarEventPanel: React.FC<CalendarEventPanelProps> = ({
  onCreateCalendarEvent,
  selectedGroupId,
  apiBaseUrl = "http://localhost:3000",
  refreshTrigger = 0,
}) => {
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [error, setError] = useState<string | null>(null);

  const getEventDays = (startAt: string, endAt: string) => {
    const start = dayjs(startAt).startOf("day");
    const end = dayjs(endAt).startOf("day");
    const days: string[] = [];

    if (end.isBefore(start)) {
      return;
    }

    let current = start;
    while (current.isBefore(end) || current.isSame(end, "day")) {
      days.push(current.format("YYYY-MM-DD"));
      current = current.add(1, "day");
    }

    return days;
  };

  // Fetch calendar events
  useEffect(() => {
    const fetchEvents = async () => {
      if (!selectedGroupId) {
        setEvents([]);
        return;
      }

      setError(null);
      try {
        const response = await fetch(
          `${apiBaseUrl}/calendar-events?familyGroupId=${selectedGroupId}`
        );
        if (!response.ok) {
          throw new Error("Failed to load calendar events");
        }
        const data = (await response.json()) as CalendarEvent[];
        setEvents(data);
      } catch (err) {
        console.error("Error loading events:", err);
        setError("Failed to load calendar events");
      }
    };

    fetchEvents();
  }, [selectedGroupId, apiBaseUrl, refreshTrigger]);

  // Get events for selected date
  const eventDays = new Set(
    events.flatMap((event) => getEventDays(event.startAt, event.endAt))
  );

  const eventsForSelectedDate = events.filter((event) => {
    const selectedDateStart = selectedDate.startOf("day");
    const selectedDateEnd = selectedDate.endOf("day");
    const eventStart = dayjs(event.startAt);
    const eventEnd = dayjs(event.endAt);

    return eventStart.isBefore(selectedDateEnd) && eventEnd.isAfter(selectedDateStart);
  });

  const handleDateChange = (newDate: Dayjs | null) => {
    if (newDate) {
      setSelectedDate(newDate);
    }
  };

  const Day = (props: PickersDayProps) => {
    const { day, outsideCurrentMonth, ...other } = props;
    const hasEvent = eventDays.has(day.format("YYYY-MM-DD"));

    return (
      <Badge
        overlap="circular"
        variant="dot"
        invisible={!hasEvent}
        sx={{
          "& .MuiBadge-badge": {
            backgroundColor: "#4da3ff",
            boxShadow: "0 0 0 2px #000000"
          },
        }}
      >
        <PickersDay
          {...other}
          day={day}
          outsideCurrentMonth={outsideCurrentMonth}
        />
      </Badge>
    );
  };

  return (
    <>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold" }}>
          Upcoming events
        </Typography>
        <IconButton
          onClick={onCreateCalendarEvent}
          sx={{ bgcolor: "#1e2232", "&:hover": { bgcolor: "#3b4363" } }}
        >
          <Add sx={{ color: "#f7f7f7" }} />
        </IconButton>
      </Box>

      {error && (
        <Typography variant="caption" color="#ff8a80">
          {error}
        </Typography>
      )}

      <Stack spacing={2}>
        <Box>
          <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="en-gb">
            <DateCalendar
              value={selectedDate}
              onChange={handleDateChange}
              slots={{ day: Day }}
              sx={{
                width: "100%",
                color: "#f7f7f7",
                "& .MuiPickersDay-root": {
                  color: "#f7f7f7",
                },
                "& .MuiPickersDay-root.MuiPickersDay-today:not(.Mui-selected)": {
                  border: "2px solid #9fa6c2",
                },
                "& .MuiDayCalendar-weekDayLabel": {
                  color: "#f7f7f7",
                },
                "& .MuiPickersArrowSwitcher-button": {
                  color: "#f7f7f7",
                },
                "& .MuiPickersCalendarHeader-switchViewButton": {
                  color: "#f7f7f7",
                },
              }}
            />
          </LocalizationProvider>
        </Box>

        {/* Events for selected date */}
        <Box>
          <Typography variant="body2" sx={{ fontWeight: "bold", mb: 1 }}>
            Events on {selectedDate.format("MMM DD, YYYY")}
          </Typography>
          {eventsForSelectedDate.length === 0 ? (
            <Typography variant="caption" color="#9fa6c2">
              No events scheduled for this date
            </Typography>
          ) : (
            <List sx={{ maxHeight: "20vh", overflowY: "auto" }}>
              {eventsForSelectedDate.map((event) => (
                <ListItem key={event.id} sx={{ px: 0 }}>
                  <ListItemText
                    primary={
                      <Typography
                        variant="body2"
                        sx={{ color: "#f7f7f7", fontWeight: "500" }}
                      >
                        {event.title}
                      </Typography>
                    }
                    secondary={
                      <>
                        <Typography
                          variant="caption"
                          sx={{ color: "#9fa6c2", display: "block" }}
                        >
                          {dayjs(event.startAt).format("HH:mm")} - {dayjs(event.endAt).format("HH:mm")}
                        </Typography>
                        {event.description && (
                          <Typography variant="caption" sx={{ color: "#9fa6c2" }}>
                            {event.description}
                          </Typography>
                        )}
                      </>
                    }
                  />
                </ListItem>
              ))}
            </List>
          )}
        </Box>
      </Stack>
    </>
  );
};

export default CalendarEventPanel