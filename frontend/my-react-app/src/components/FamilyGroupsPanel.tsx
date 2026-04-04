import { Groups, Search } from "@mui/icons-material";
import {
  Box,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Stack,
  Typography,
} from "@mui/material";

type FamilyGroup = {
  id: number;
  name: string;
};

type FamilyGroupsPanelProps = {
  familyGroups: FamilyGroup[] | null;
  selectedGroupId: number | null;
  onSelectGroup: (id: number) => void;
  onCreateFamilyGroup: () => void;
};

const FamilyGroupsPanel: React.FC<FamilyGroupsPanelProps> = ({
  familyGroups,
  selectedGroupId,
  onSelectGroup,
  onCreateFamilyGroup,
}) => {
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
          <IconButton sx={{ bgcolor: '#1e2232', '&:hover': { bgcolor: '#3b4363' } }}>
            <Search sx={{ color: '#f7f7f7' }} />
          </IconButton>
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
          familyGroups.map((chat) => {
            const isSelected = selectedGroupId === chat.id

            return (
              <ListItem
                key={chat.id}
                disablePadding
                sx={{ borderBottom: 1, borderColor: '#292d3b' }}
              >
                <ListItemButton
                  selected={isSelected}
                  onClick={() => onSelectGroup(chat.id)}
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
          })
        ) : (
          <Typography>Még nem vagy tagja egy családi csoportnak sem</Typography>
        )}
      </List>
    </Box>
  )
}

export default FamilyGroupsPanel