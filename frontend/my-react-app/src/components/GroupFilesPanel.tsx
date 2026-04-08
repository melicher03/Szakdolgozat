import {
  Box,
  Card,
  List,
  ListItem,
  ListItemText,
  Stack,
  Typography,
} from "@mui/material";
import { useCallback, useEffect, useMemo, useState } from "react";

type SharedAsset = {
  id: string;
  type: "FILE" | "URL";
  title?: string;
  url: string;
  fileSize?: number;
  familyGroupId: number;
  uploadedBy: string;
  createdAt: string;
};

type GroupFilesPanelProps = {
  apiBaseUrl: string;
  selectedGroupId: number | null;
};

const panelStyle = {
  bgcolor: "#141620",
  borderRadius: 3,
  border: 1,
  borderColor: "#292d3b",
  p: 2,
  color: "#f7f7f7",
  height: "100%",
};

const GroupFilesPanel: React.FC<GroupFilesPanelProps> = ({
  apiBaseUrl,
  selectedGroupId,
}) => {
  const [assets, setAssets] = useState<SharedAsset[]>([]);
  const [_, setError] = useState<string | null>(null);

  const fetchAssets = useCallback(async () => {
    if (!selectedGroupId) {
      setAssets([]);
      return;
    }

    setError(null);
    try {
      const response = await fetch(`${apiBaseUrl}/assets?familyGroupId=${selectedGroupId}`);
      if (!response.ok) {
        throw new Error("Failed to load assets");
      }

      const data = (await response.json()) as SharedAsset[];
      setAssets(data);
    } catch {
      setError("Failed to load group assets.");
    }
  }, [apiBaseUrl, selectedGroupId]);

  useEffect(() => {
    void fetchAssets();
  }, [fetchAssets]);

  const fileAssets = useMemo(() => assets.filter((a) => a.type === "FILE"), [assets]);
  const urlAssets = useMemo(() => assets.filter((a) => a.type === "URL"), [assets]);

  return (
    <Card sx={panelStyle}>
      <Stack spacing={2}>
        <Typography variant="h6" fontWeight="bold">
          Group Files & Links
        </Typography>

        <Typography variant="subtitle2">Stored Files ({fileAssets.length})</Typography>
        <List dense sx={{ maxHeight: 180, overflow: "auto" }}>
          {fileAssets.map((asset) => (
            <ListItem key={asset.id} sx={{ px: 0 }}>
              <ListItemText
                primary={asset.title || asset.url}
                secondary={asset.url}
                slotProps={{
                  primary: { sx: { color: "#f7f7f7", fontSize: 13 } },
                  secondary: { sx: { color: "#9fa6c2", fontSize: 12 } },
                }}
              />
            </ListItem>
          ))}
        </List>

        <Typography variant="subtitle2">Saved Links ({urlAssets.length})</Typography>
        <List dense sx={{ maxHeight: 180, overflow: "auto" }}>
          {urlAssets.map((asset) => (
            <ListItem key={asset.id} sx={{ px: 0 }}>
              <ListItemText
                primary={asset.title || asset.url}
                secondary={asset.url}
                slotProps={{
                  primary: { sx: { color: "#f7f7f7", fontSize: 13 } },
                  secondary: { sx: { color: "#9fa6c2", fontSize: 12 } },
                }}
              />
            </ListItem>
          ))}
        </List>

        {assets.length === 0 && (
          <Box>
            <Typography variant="caption" color="text.secondary">
              No stored files or links in this group yet.
            </Typography>
          </Box>
        )}
      </Stack>
    </Card>
  );
};

export default GroupFilesPanel;
