import { Logout } from "@mui/icons-material"
import { Box, Button, Card, Container, Grid, Typography } from "@mui/material"
import { useCallback, useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import CreateFamilyGroupDialog from "./CreateFamilyGroupDialog";
import CreateCalendarEventDialog from "./CreateCalendarEventDialog";
import Chat from "./Chat";
import { supabase } from "../services/supabaseClient";
import GroupFilesPanel from "./Sections.tsx";
import FamilyGroupsPanel from "./FamilyGroupsPanel.tsx";

type FamilyGroup = {
    id: number;
    name: string;
    members: string[];
    ownerId: string;
};

type MainPageProps = {
    currentUser: User;
};

export const cardStyle = {
        bgcolor: '#141620',
        borderRadius: 3,
        border: 1,
        borderColor: '#292d3b',
        p: 2,
        color: "#f7f7f7",
    };

const MainSite: React.FC<MainPageProps> = ({ currentUser }) => {
    const handleLogout = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) {
            console.error('Logout failed:', error.message);
        }
    }

    const [openCreateFamilyGroup, setOpenCreateFamilyGroup] = useState(false);
    const [openCreateCalendarEvent, setOpenCreateCalendarEvent] = useState(false);

    const handleCloseCreateFamilyGroup = () => {
        setOpenCreateFamilyGroup(false)
    }

    const handleCloseCreateCalendarEvent = () => {
        setOpenCreateCalendarEvent(false)
    }

    const [familyGroups, setFamilyGroups] = useState<FamilyGroup[] | null>(null)
    const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null)

    const fetchGroups = useCallback(async () => {
        const response = await fetch("http://localhost:3000/family-groups");
        const data = await response.json();
        setFamilyGroups(data);
    }, [])

    const currentUserId = (currentUser.email ?? currentUser.id).trim().toLowerCase()

    const visibleFamilyGroups = familyGroups?.filter((group) => {
        const trimmedMembers = group.members.map((member) => member.trim().toLowerCase())
        return trimmedMembers.includes(currentUserId)
    }) ?? null

    useEffect(() => {
        if (currentUser) {
            void fetchGroups();
        }
    }, [currentUser, fetchGroups, openCreateFamilyGroup])

    useEffect(() => {
        if (!visibleFamilyGroups || visibleFamilyGroups.length === 0) {
            setSelectedGroupId(null)
            return
        }

        if (!selectedGroupId || !visibleFamilyGroups.some((group) => group.id === selectedGroupId)) {
            setSelectedGroupId(visibleFamilyGroups[0].id)
        }
    }, [visibleFamilyGroups, selectedGroupId])

    const handleClickOpenCreateFamilyGroup = () => setOpenCreateFamilyGroup(true);
    const handleClickOpenCreateCalendarEvent = () => setOpenCreateCalendarEvent(true);

    return (
        <Box
            sx={{
                bgcolor: '#1e2232',
                minHeight: '100dvh',
                boxSizing: 'border-box',
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
                    currentUser={currentUser}
                />

                <CreateCalendarEventDialog
                    open={openCreateCalendarEvent}
                    onClose={handleCloseCreateCalendarEvent}
                    cardStyle={cardStyle}
                    familyGroups={visibleFamilyGroups}
                    selectedGroupId={selectedGroupId}
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
                        <GroupFilesPanel
                            apiBaseUrl="http://localhost:3000"
                            selectedGroupId={selectedGroupId}
                            onCreateCalendarEvent={handleClickOpenCreateCalendarEvent}
                        />
                    </Grid>

                    {/* Middle */}
                    <Grid size={{ xs: 12, md: 6.5 }}>
                        <Card sx={cardStyle}>
                            <Chat 
                                familyGroupId={selectedGroupId?.toString() ?? null}
                                familyGroupName={visibleFamilyGroups?.find((g) => g.id === selectedGroupId)?.name ?? "Select a family group"}
                                userId={ (currentUser.email ?? currentUser.id).trim().toLowerCase() }
                                userName={currentUser.email ?? currentUser.id}
                            />
                        </Card>
                    </Grid>

                    {/* Right side */}
                    <Grid size={{ xs: 12, md: 3 }}>
                        <Card sx={cardStyle}>
                            <FamilyGroupsPanel
                                familyGroups={visibleFamilyGroups}
                                selectedGroupId={selectedGroupId}
                                onSelectGroup={setSelectedGroupId}
                                onCreateFamilyGroup={handleClickOpenCreateFamilyGroup}
                                onGroupsChanged={() => void fetchGroups()}
                            />
                        </Card>
                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
}

export default MainSite