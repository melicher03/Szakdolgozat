import { Delete, Edit, Groups } from "@mui/icons-material";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { cardStyle } from "./MainPage";

type FamilyGroup = {
  id: number;
  name: string;
  members: string[];
  ownerId: string;
};

type FamilyGroupsPanelProps = {
  familyGroups: FamilyGroup[] | null;
  selectedGroupId: number | null;
  onSelectGroup: (id: number) => void;
  onCreateFamilyGroup: () => void;
  onGroupsChanged: () => void;
};

const FamilyGroupsPanel: React.FC<FamilyGroupsPanelProps> = ({
  familyGroups,
  selectedGroupId,
  onSelectGroup,
  onCreateFamilyGroup,
  onGroupsChanged,
}) => {
  const [activeGroup, setActiveGroup] = useState<FamilyGroup | null>(null);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [editName, setEditName] = useState("");
  const [editMembers, setEditMembers] = useState<string[]>([]);
  const [userOptions, setUserOptions] = useState<string[]>([]);
  const [editError, setEditError] = useState<string | null>(null);

  const editMemberOptions = useMemo(() => {
    const source = [
      ...userOptions,
      ...(activeGroup?.members ?? []),
      activeGroup?.ownerId ?? "",
    ];

    return [...new Set(source.map((value) => value.trim().toLowerCase())
      .filter((value) => value.length > 0),)].sort((left, right) => left.localeCompare(right));
      
  }, [activeGroup?.members, activeGroup?.ownerId, userOptions]);

  useEffect(() => {
    const loadUsers = async () => {
      if (!openEditDialog) return;

      try {
        const response = await fetch("http://localhost:3000/users");
        if (!response.ok) {
          throw new Error("Failed to load users");
        }

        const data = (await response.json()) as Array<{ id: string; email: string }>;
        const nextUsers = Array.from(
          new Set(
            data
              .map((user) => user.email?.trim().toLowerCase())
              .filter((email): email is string => Boolean(email)),
          ),
        );
        setUserOptions(nextUsers);
      } catch {
        setUserOptions([]);
      }
    };

    loadUsers();
  }, [openEditDialog]);

  const handleOpenEdit = (group: FamilyGroup) => {
    setActiveGroup(group);
    setEditName(group.name);
    setEditMembers(group.members.map((member) => member.trim().toLowerCase()));
    setEditError(null);
    setOpenEditDialog(true);
  };

  const handleDelete = async (group: FamilyGroup) => {

    try {
      const response = await fetch(`http://localhost:3000/family-groups/${group.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete group");
      }

      onGroupsChanged();
    } catch {
      setEditError("Could not delete the family group.");
    }
  };

  const handleSaveEdit = async () => {
    if (!activeGroup) return;

    const trimmedName = editName.trim();
    if (!trimmedName) {
      setEditError("Group name is required.");
      return;
    }

    setEditError(null);

    try {
      const response = await fetch(`http://localhost:3000/family-groups/${activeGroup.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: trimmedName,
          members: editMembers,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update group");
      }

      setOpenEditDialog(false);
      onGroupsChanged();
    } catch {
      setEditError("Could not update the family group.");
    }
  };

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          mb: 2,
          gap: 2,
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: "bold" }}>
          Chats
        </Typography>
        <Stack direction="row" spacing={1}>
          <IconButton
            onClick={onCreateFamilyGroup}
            sx={{ bgcolor: '#1e2232', '&:hover': { bgcolor: '#3b4363' } }}
          >
            <Groups sx={{ color: '#f7f7f7' }} />
          </IconButton>
        </Stack>
      </Box>

      <List
        sx={{
          maxHeight: '50vh',
          overflow: 'auto',
          '&::-webkit-scrollbar': {
            width: '5px',
          },
          '&::-webkit-scrollbar-thumb': {
            background: '#9e9e9e',
            borderRadius: '10px',
          },
        }}
      >
        {familyGroups ? (
          familyGroups.map((group) => {
            const isSelected = selectedGroupId === group.id

            return (
              <ListItem
                key={group.id}
                disablePadding
                sx={{ borderBottom: 1, borderColor: '#292d3b' }}
                secondaryAction={
                  <Stack direction="row" spacing={0.5}>
                    <IconButton
                      onClick={() => {
                        handleOpenEdit(group);
                      }}
                      sx={{ color: '#9fa6c2' }}
                    >
                      <Edit />
                    </IconButton>
                    <IconButton
                      onClick={() => {
                        handleDelete(group);
                      }}
                      sx={{ color: '#ff8a80' }}
                    >
                      <Delete />
                    </IconButton>
                  </Stack>
                }
              >
                <ListItemButton
                  selected={isSelected}
                  onClick={() => onSelectGroup(group.id)}
                  sx={{
                    borderRadius: 1,
                    px: 2,
                    '&.Mui-selected': { bgcolor: '#2a3048' },
                  }}
                >
                  <ListItemText>
                    <Box component="div" sx={{ py: 1 }}>
                      <Typography
                        variant="body1"
                        fontWeight={isSelected ? "bold" : "normal"}
                      >
                        {group.name}
                      </Typography>
                    </Box>
                  </ListItemText>
                </ListItemButton>
              </ListItem>
            )
          })
        ) : (
          <Typography>Még nem vagy tagja egy családi csoportnak sem</Typography>
        )}
      </List>

      {/* Edit */}
      <Dialog
        open={openEditDialog}
        onClose={() => setOpenEditDialog(false)}
        fullWidth
        maxWidth="sm"
        slotProps={{
          paper: { sx: cardStyle },
        }}
      >
        <DialogTitle>Edit family group</DialogTitle>
        <DialogContent sx={{ display: 'grid', gap: 2, pt: 1 }}>
          <TextField
            label="Group name"
            value={editName}
            onChange={(event) => setEditName(event.target.value)}
            fullWidth
          />

          <TextField
            select
            label="Members"
            fullWidth
            value={editMembers}
            onChange={(event) => {
              const value = event.target.value;
              setEditMembers(typeof value === 'string' ? value.split(',') : value);
            }}
            slotProps={{
              select: {
                multiple: true,
              },
            }}
          >
            {editMemberOptions.map((email) => (
              <MenuItem key={email} value={email}>
                {email}
              </MenuItem>
            ))}
          </TextField>

          {editError && (
            <Typography variant="caption" sx={{ color: '#ff8a80' }}>
              {editError}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditDialog(false)}>Cancel</Button>
          <Button onClick={handleSaveEdit} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default FamilyGroupsPanel