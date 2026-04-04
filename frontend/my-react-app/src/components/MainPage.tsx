import { CalendarMonth, Folder, RssFeed, Search, Image, Logout, InsertLink, Groups, Add } from "@mui/icons-material"
import { Avatar, Box, Button, Card, Chip, Container, Grid, IconButton, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Stack, Typography } from "@mui/material"
import { useEffect, useState } from "react";
import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';
import "dayjs/locale/en-gb";
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import CreateFamilyGroupDialog from "./CreateFamilyGroupDialog";
import CreateCalendarEventDialog from "./CreateCalendarEventDialog";
import Chat from "./Chat";
import { supabase } from "../services/supabaseClient";
import GroupFilesPanel from "./GroupFilesPanel";

type FamilyGroup = {
    id: number;
    name: string;
    members: string[];
    ownerId: string;
};

type CalendarEvent = {
    id: number;
    title: string;
    description?: string;
    startAt: string;
    endAt: string;
    familyGroupId: number;
};

const MainSite: React.FC = () => {
    const handleLogout = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) {
            console.error('Logout failed:', error.message);
        }
    };

    const cardStyle = {
        bgcolor: '#141620',
        borderRadius: 3,
        border: 1,
        borderColor: '#292d3b',
        p: 2,
        mb: 2,
        color: "#f7f7f7",
    };

    const pages = [
        { text: 'Feed', icon: <RssFeed />, active: true },
        { text: 'Media', icon: <Image /> },
        { text: 'Calendar', icon: <CalendarMonth /> },
        { text: 'Links', icon: <InsertLink /> },
        { text: 'Files', icon: <Folder /> },
    ]

    const [openCreateFamilyGroup, setOpenCreateFamilyGroup] = useState(false);
    const [openCreateCalendarEvent, setOpenCreateCalendarEvent] = useState(false);

    const handleCloseCreateFamilyGroup = () => {
        setOpenCreateFamilyGroup(false)
    }

    const handleCloseCreateCalendarEvent = () => {
        setOpenCreateCalendarEvent(false)
    }

    const [familyGroups, setFamilyGroups] = useState<FamilyGroup[] | null>(null)
    const [events, setEvents] = useState<CalendarEvent[] | null>(null)
    const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null)

    useEffect(() => {
        const fetchGroups = async () => {
            const response = await fetch("http://localhost:3000/family-groups");

            const data = await response.json();
            setFamilyGroups(data);
        };
        fetchGroups();
    }, [openCreateFamilyGroup])

    useEffect(() => {
        const fetchEvents = async () => {
            const response = await fetch("http://localhost:3000/calendar-events");

            const data = await response.json();
            setEvents(data);
        };
        fetchEvents();
    }, [openCreateCalendarEvent])

    useEffect(() => {
        if (!familyGroups || familyGroups.length === 0) {
            setSelectedGroupId(null)
            return
        }

        if (!selectedGroupId || !familyGroups.some((group) => group.id === selectedGroupId)) {
            setSelectedGroupId(familyGroups[0].id)
        }
    }, [familyGroups, selectedGroupId])

    console.log(events)

    const handleClickOpenCreateFamilyGroup = () => setOpenCreateFamilyGroup(true);
    const handleClickOpenCreateCalendarEvent = () => setOpenCreateCalendarEvent(true);

    const [value] = useState<Dayjs | null>(dayjs());

    return (
        <Box
            sx={{
                bgcolor: '#1e2232',
                minHeight: '100vh',
                color: '#f7f7f7',
                py: 3
            }}
        >
            <Container maxWidth="xl">

                {/* Create pop ups */}
                <CreateFamilyGroupDialog
                    open={openCreateFamilyGroup}
                    onClose={handleCloseCreateFamilyGroup}
                    cardStyle={cardStyle}
                />

                <CreateCalendarEventDialog
                    open={openCreateCalendarEvent}
                    onClose={handleCloseCreateCalendarEvent}
                    cardStyle={cardStyle}
                />

                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        mb: 4,
                        alignItems: 'center'
                    }}
                >
                    <Typography variant="h4" fontWeight="bold">
                        FamilyHub
                    </Typography>
                    <Button
                        variant="outlined"
                        size="small"
                        onClick={handleLogout}
                        sx={{
                            color: "#f7f7f7",
                            borderColor: "#f7f7f7"
                        }}
                    >
                        <Logout />
                        Logout
                    </Button>
                </Box>

                <Grid container spacing={3}>

                    {/* Left side */}
                    <Grid size={{ xs: 12, md: 2.5 }}>
                        <Card sx={cardStyle}>
                            <Box sx={{ display: 'flex' }}>
                                <Avatar sx={{ mr: 1, bgcolor: '#333' }}>Y</Avatar>
                                <Box>
                                    <Typography variant="body2" fontWeight="bold">You</Typography>
                                    <Typography variant="caption">@you</Typography>
                                </Box>
                            </Box>
                            <List>
                                {pages.map((page) => (
                                    <ListItem
                                        disablePadding
                                        key={page.text}
                                        sx={{
                                            '&:hover': { backgroundColor: "#24283b" }
                                        }}
                                    >
                                        <ListItemButton selected={page.active} sx={{ borderRadius: 2, mb: 0.5 }}>
                                            <ListItemIcon
                                                sx={{
                                                    color: page.active ? '#1976d2' : '#f7f7f7',
                                                    minWidth: 40
                                                }}
                                            >
                                                {page.icon}
                                            </ListItemIcon>
                                            <ListItemText>{page.text}</ListItemText>
                                        </ListItemButton>
                                    </ListItem>
                                ))}
                            </List>
                        </Card>

                        <GroupFilesPanel
                            apiBaseUrl="http://localhost:3000"
                            selectedGroupId={selectedGroupId}
                        />
                    </Grid>

                    {/* Middle */}
                    <Grid size={{ xs: 12, md: 6.5 }}>
                        <Card sx={cardStyle}>
                            <Chat 
                                familyGroupId="3"
                                familyGroupName="bagaméri"
                                userId="2"
                                userName="local-user"
                            />
                        </Card>
                    </Grid>

                    {/* Right side */}
                    <Grid size={{ xs: 12, md: 3 }}>
                        <Card sx={cardStyle}>
                            <Box sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                mb: 2,
                                gap: 2,
                            }}>
                                <Typography variant="h6" sx={{ fontWeight: "bold" }}>Chats</Typography>
                                <Stack direction="row" spacing={1}>

                                    <IconButton sx={{ bgcolor: '#1e2232', '&:hover': { bgcolor: '#3b4363' } }}>
                                        <Search sx={{ color: '#f7f7f7' }} />
                                    </IconButton>
                                    <IconButton onClick={handleClickOpenCreateFamilyGroup} sx={{ bgcolor: '#1e2232', '&:hover': { bgcolor: '#3b4363' } }}>
                                        <Groups sx={{ color: '#f7f7f7' }} />
                                    </IconButton>
                                </Stack>
                            </Box>
                            <List sx={{
                                maxHeight: '50vh',
                                overflow: 'auto',
                                '&::-webkit-scrollbar': {
                                    width: '5px',
                                },
                                '&::-webkit-scrollbar-thumb': {
                                    background: '#9e9e9e',
                                    borderRadius: '10px',
                                },
                            }}>
                                {familyGroups ? familyGroups.map((chat) => {
                                    const isSelected = selectedGroupId === chat.id
                                    return (
                                        <ListItem
                                            key={chat.id}
                                            disablePadding
                                            sx={{ borderBottom: 1, borderColor: '#292d3b' }}
                                        >
                                            <ListItemButton
                                                selected={isSelected}
                                                onClick={() => setSelectedGroupId(chat.id)}
                                                sx={{
                                                    borderRadius: 1,
                                                    px: 0,
                                                    py: 1,
                                                    '&.Mui-selected': { bgcolor: '#2a3048' },
                                                    '&.Mui-selected:hover': { bgcolor: '#333b57' },
                                                }}
                                            >
                                                <ListItemText>
                                                    <Box component="div" sx={{ py: 1 }}>
                                                        <Typography
                                                            variant="body1"
                                                            fontWeight={isSelected ? "bold" : "normal"}
                                                        >
                                                            {chat.name}
                                                        </Typography>
                                                    </Box>
                                                </ListItemText>
                                            </ListItemButton>
                                        </ListItem>
                                    )
                                }) : 'Még nem vagy tagja egy családi csoportnak sem'}
                            </List>
                        </Card>

                        <Card sx={cardStyle}>
                            <Box sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                            }}>
                                <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold" }}>Upcoming events</Typography>
                                <IconButton onClick={handleClickOpenCreateCalendarEvent} sx={{ bgcolor: '#1e2232', '&:hover': { bgcolor: '#3b4363' } }}>
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
                            </Stack>
                        </Card>
                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
}

export default MainSite