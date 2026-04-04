import { CloudUpload, InsertLink } from "@mui/icons-material";
import {
  Box,
  Button,
  Card,
  Divider,
  List,
  ListItem,
  ListItemText,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "../services/supabaseClient";

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
  const storageBucket = import.meta.env.VITE_SUPABASE_STORAGE_BUCKET ?? "media";
  const [assets, setAssets] = useState<SharedAsset[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkTitle, setLinkTitle] = useState("");

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

  const handleUploadFile = useCallback(async () => {
    if (!selectedGroupId || !selectedFile) {
      setActionMessage("Select a group and file first.");
      return;
    }

    try {
      // Generate storage path
      const fileExtension = selectedFile.name.split('.').pop() || 'bin';
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExtension}`;
      const storagePath = `family-${selectedGroupId}/${fileName}`;

      // Upload to Supabase Storage (frontend direct)
      const { error: uploadError } = await supabase.storage
        .from(storageBucket)
        .upload(storagePath, selectedFile, {
          contentType: selectedFile.type || undefined,
        });

      if (uploadError) {
        setActionMessage(`Upload failed: ${uploadError.message}`);
        return;
      }

      // Get public URL
      const { data } = supabase.storage.from(storageBucket).getPublicUrl(storagePath);
      const publicUrl = data.publicUrl;

      // Save metadata to backend
      const response = await fetch(`${apiBaseUrl}/assets/file`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          familyGroupId: selectedGroupId,
          title: selectedFile.name,
          url: publicUrl,
          storagePath: storagePath,
          fileSize: selectedFile.size,
          uploadedBy: "You",
        }),
      });

      if (!response.ok) {
        const text = await response.text();
        setActionMessage(`Metadata save failed: ${text}`);
        return;
      }

      setSelectedFile(null);
      setActionMessage("File uploaded successfully.");
      void fetchAssets();
    } catch (err) {
      setActionMessage(`Upload error: ${err instanceof Error ? err.message : "Unknown error"}`);
    }
  }, [apiBaseUrl, fetchAssets, selectedFile, selectedGroupId, storageBucket]);

  const handleSaveUrl = useCallback(async () => {
    if (!selectedGroupId || !linkUrl.trim()) {
      setActionMessage("Select a group and provide a URL.");
      return;
    }

    const response = await fetch(`${apiBaseUrl}/links`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        familyGroupId: selectedGroupId,
        url: linkUrl.trim(),
        title: linkTitle.trim() || undefined,
        uploadedBy: "You",
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      setActionMessage(`URL save failed: ${text}`);
      return;
    }

    setLinkUrl("");
    setLinkTitle("");
    setActionMessage("URL saved successfully.");
    void fetchAssets();
  }, [apiBaseUrl, fetchAssets, linkTitle, linkUrl, selectedGroupId]);

  return (
    <Card sx={panelStyle}>
      <Stack spacing={2}>
        <Typography variant="h6" fontWeight="bold">
          Group Files & Links
        </Typography>

        <Stack direction="row" spacing={1}>
          <Button variant="outlined" component="label" startIcon={<CloudUpload />}>
            Pick File
            <input
              hidden
              type="file"
              onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
            />
          </Button>
          <Button variant="contained" onClick={handleUploadFile} disabled={!selectedFile}>
            Upload
          </Button>
        </Stack>

        {selectedFile && (
          <Typography variant="caption">Selected: {selectedFile.name}</Typography>
        )}

        <Stack direction="row" spacing={1}>
          <TextField
            size="small"
            label="URL"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            fullWidth
          />
          <Button variant="contained" startIcon={<InsertLink />} onClick={handleSaveUrl}>
            Save
          </Button>
        </Stack>

        <TextField
          size="small"
          label="URL title (optional)"
          value={linkTitle}
          onChange={(e) => setLinkTitle(e.target.value)}
          fullWidth
        />

        {actionMessage && <Typography variant="caption">{actionMessage}</Typography>}
        {error && <Typography variant="caption" color="error">{error}</Typography>}

        <Divider sx={{ borderColor: "#292d3b" }} />

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
