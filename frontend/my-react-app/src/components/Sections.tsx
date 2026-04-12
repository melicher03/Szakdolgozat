import {
  Box,
  Button,
  Card,
  Chip,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useCallback, useEffect, useMemo, useState } from "react";
import { io, Socket } from "socket.io-client";
import CalendarEventPanel from "./CalendarEventPanel";

type SharedAsset = {
  id: string;
  type: "FILE" | "URL";
  title?: string;
  url: string;
  fileSize?: number;
  categoryName?: string | null;
  familyGroupId: number;
  uploadedBy: string;
  createdAt: string;
};

type AssetCategory = {
  id: number;
  familyGroupId: number;
  name: string;
};

type SectionProps = {
  apiBaseUrl: string;
  selectedGroupId: number | null;
  onCreateCalendarEvent: () => void;
};

const panelStyle = {
  bgcolor: "#141620",
  borderRadius: 3,
  border: 1,
  borderColor: "#292d3b",
  p: 2,
  color: "#f7f7f7",
  maxHeight: "70vh",
  overflowY: "auto",
};

const CALENDAR_SECTION = "__calendar__";
const NO_CATEGORY = "";

const IMAGE_EXTENSIONS = ["png", "jpg", "jpeg", "gif", "webp", "avif", "bmp"];
const VIDEO_EXTENSIONS = ["mp4", "webm", "ogg", "mov", "m4v"];

const getFileExtension = (value: string): string => {
  try {
    const url = new URL(value);
    const pathname = url.pathname;
    const lastDot = pathname.lastIndexOf(".");
    return lastDot >= 0 ? pathname.slice(lastDot + 1).toLowerCase() : "";
  } catch {
    const pathname = value.split("?")[0].split("#")[0];
    const lastDot = pathname.lastIndexOf(".");
    return lastDot >= 0 ? pathname.slice(lastDot + 1).toLowerCase() : "";
  }
};

const getMediaKind = (value: string): "image" | "video" | null => {
  const extension = getFileExtension(value);

  if (IMAGE_EXTENSIONS.includes(extension)) {
    return "image";
  }

  if (VIDEO_EXTENSIONS.includes(extension)) {
    return "video";
  }

  return null;
};

const Sections: React.FC<SectionProps> = ({
  apiBaseUrl,
  selectedGroupId,
  onCreateCalendarEvent,
}) => {
  const [assets, setAssets] = useState<SharedAsset[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedSection, setSelectedSection] = useState<string>(CALENDAR_SECTION);
  const [newCategoryName, setNewCategoryName] = useState("");

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

  const fetchCategories = useCallback(async () => {
    if (!selectedGroupId) {
      setCategories([]);
      return;
    }

    try {
      const response = await fetch(
        `${apiBaseUrl}/assets/categories?familyGroupId=${selectedGroupId}`,
      );

      if (!response.ok) {
        throw new Error("Failed to load categories");
      }

      const data = (await response.json()) as AssetCategory[];
      setCategories(data.map((category) => category.name));
    } catch {
      setCategories([]);
    }
  }, [apiBaseUrl, selectedGroupId]);

  useEffect(() => {
    void fetchAssets();
    void fetchCategories();
  }, [fetchAssets, fetchCategories]);

  useEffect(() => {
    let socket: Socket | null = null;

    if (!selectedGroupId) {
      return;
    }

    socket = io("http://localhost:3000", {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    socket.on("connect", () => {
      socket?.emit("join-group", { familyGroupId: String(selectedGroupId) });
    });

    socket.on("category-created", () => {
      void fetchCategories();
    });

    socket.on("asset-category-updated", () => {
      void fetchAssets();
      void fetchCategories();
    });

    return () => {
      socket?.emit("leave-group", { familyGroupId: String(selectedGroupId) });
      socket?.disconnect();
    };
  }, [fetchAssets, fetchCategories, selectedGroupId]);

  useEffect(() => {
    if (!selectedGroupId) {
      setCategories([]);
      setSelectedSection(CALENDAR_SECTION);
      return;
    }
  }, [selectedGroupId]);

  useEffect(() => {
    if (selectedSection === CALENDAR_SECTION) return;

    if (!categories.includes(selectedSection)) {
      setSelectedSection(CALENDAR_SECTION);
    }
  }, [categories, selectedSection]);

  const addCategory = async () => {
    if (!selectedGroupId) return;

    const trimmed = newCategoryName.trim();
    if (!trimmed) return;

    try {
      const response = await fetch(`${apiBaseUrl}/assets/categories`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          familyGroupId: selectedGroupId,
          name: trimmed,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create category");
      }

      const createdCategory = (await response.json()) as AssetCategory;
      setCategories((prev) => {
        if (prev.includes(createdCategory.name)) return prev;
        return [...prev, createdCategory.name].sort((left, right) => left.localeCompare(right));
      });
      setSelectedSection(createdCategory.name);
      setNewCategoryName("");
      void fetchCategories();
    } catch {
      setError("Failed to create category.");
    }
  };

  const setAssetCategory = async (assetId: string, category: string) => {
    if (!selectedGroupId) return;

    try {
      const response = await fetch(`${apiBaseUrl}/assets/${assetId}/category`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          categoryName: category === NO_CATEGORY ? null : category,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update asset category");
      }

      const updatedAsset = (await response.json()) as SharedAsset;
      setAssets((prev) =>
        prev.map((asset) => (asset.id === updatedAsset.id ? updatedAsset : asset)),
      );
      void fetchCategories();
    } catch {
      setError("Failed to update asset category.");
    }
  };

  const filteredAssets = useMemo(() => {
    if (selectedSection === CALENDAR_SECTION) return [];
    return assets.filter((asset) => (asset.categoryName ?? NO_CATEGORY) === selectedSection);
  }, [assets, selectedSection]);

  const fileAssets = useMemo(
    () => filteredAssets.filter((asset) => asset.type === "FILE"),
    [filteredAssets],
  );

  const urlAssets = useMemo(
    () => filteredAssets.filter((asset) => asset.type === "URL"),
    [filteredAssets],
  );

  const renderMediaPreview = (asset: SharedAsset) => {
    const mediaKind = getMediaKind(asset.url);

    if (mediaKind === "image") {
      return (
        <Box
          component="img"
          src={asset.url}
          alt={asset.title || "Uploaded file preview"}
          sx={{
            width: "100%",
            maxHeight: 180,
            objectFit: "cover",
            borderRadius: 2,
            border: "1px solid #292d3b",
            mb: 1,
          }}
        />
      );
    }

    if (mediaKind === "video") {
      return (
        <Box
          component="video"
          src={asset.url}
          controls
          sx={{
            width: "100%",
            maxHeight: 220,
            borderRadius: 2,
            border: "1px solid #292d3b",
            mb: 1,
          }}
        />
      );
    }

    return null;
  };

  return (
    <Card sx={panelStyle}>
      <Stack spacing={2}>
        <Typography variant="h6" fontWeight="bold">
          Sections
        </Typography>

        <Stack direction="row" spacing={1}>
          <TextField
            size="small"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            placeholder="New category (e.g. Recipes)"
            fullWidth
            sx={{
              "& .MuiInputBase-input": { color: "#f7f7f7" },
              "& .MuiOutlinedInput-root": {
                "& fieldset": { borderColor: "#292d3b" },
              },
            }}
          />
          <Button variant="contained" onClick={addCategory} disabled={!selectedGroupId}>
            Add
          </Button>
        </Stack>

        <List dense sx={{ border: "1px solid #292d3b", borderRadius: 2, p: 0.5 }}>
          <ListItem sx={{ px: 0 }} disablePadding>
            <ListItemButton
              selected={selectedSection === CALENDAR_SECTION}
              onClick={() => setSelectedSection(CALENDAR_SECTION)}
              sx={{ borderRadius: 1 }}
            >
              <ListItemText
                primary="Calendar"
                slotProps={{
                  primary: { sx: { color: "#f7f7f7", fontSize: 13 } },
                }}
              />
            </ListItemButton>
          </ListItem>

          {categories.map((category) => (
            <ListItem key={category} sx={{ px: 0 }} disablePadding>
              <ListItemButton
                selected={selectedSection === category}
                onClick={() => setSelectedSection(category)}
                sx={{ borderRadius: 1 }}
              >
                <ListItemText
                  primary={category}
                  slotProps={{
                    primary: { sx: { color: "#f7f7f7", fontSize: 13 } },
                  }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>

        {selectedSection === CALENDAR_SECTION ? (
          <CalendarEventPanel onCreateCalendarEvent={onCreateCalendarEvent} />
        ) : (
          <>
            <Typography variant="subtitle2">
              {selectedSection} files ({fileAssets.length})
            </Typography>

            <List dense sx={{ maxHeight: 180, overflow: "auto" }}>
              {fileAssets.map((asset) => (
                <ListItem key={asset.id} sx={{ px: 0, display: "block" }}>
                  {renderMediaPreview(asset)}
                  <ListItemText
                    primary={asset.title || asset.url}
                    secondary={asset.url}
                    slotProps={{
                      primary: { sx: { color: "#f7f7f7", fontSize: 13, wordBreak: "break-word" } },
                      secondary: { sx: { color: "#9fa6c2", fontSize: 12, wordBreak: "break-word" } },
                    }}
                  />
                  <TextField
                    select
                    size="small"
                    value={asset.categoryName ?? NO_CATEGORY}
                    onChange={(e) => setAssetCategory(asset.id, e.target.value)}
                    sx={{
                      mt: 1,
                      minWidth: 150,
                      "& .MuiInputBase-input": { color: "#f7f7f7" },
                      "& .MuiOutlinedInput-root": {
                        "& fieldset": { borderColor: "#292d3b" },
                      },
                      "& .MuiSvgIcon-root": { color: "#f7f7f7" },
                    }}
                  >
                    <MenuItem value={NO_CATEGORY}>No category</MenuItem>
                    {categories.map((category) => (
                      <MenuItem key={`${asset.id}-${category}`} value={category}>
                        {category}
                      </MenuItem>
                    ))}
                  </TextField>
                </ListItem>
              ))}
            </List>

            <Typography variant="subtitle2">
              {selectedSection} links ({urlAssets.length})
            </Typography>

            <List dense sx={{ maxHeight: 180, overflow: "auto" }}>
              {urlAssets.map((asset) => (
                <ListItem key={asset.id} sx={{ px: 0, display: "block" }}>
                  {renderMediaPreview(asset)}
                  <ListItemText
                    primary={asset.title || asset.url}
                    secondary={asset.url}
                    slotProps={{
                      primary: { sx: { color: "#f7f7f7", fontSize: 13, wordBreak: "break-word" } },
                      secondary: { sx: { color: "#9fa6c2", fontSize: 12, wordBreak: "break-word" } },
                    }}
                  />
                  <TextField
                    select
                    size="small"
                    value={asset.categoryName ?? NO_CATEGORY}
                    onChange={(e) => setAssetCategory(asset.id, e.target.value)}
                    sx={{
                      mt: 1,
                      minWidth: 150,
                      "& .MuiInputBase-input": { color: "#f7f7f7" },
                      "& .MuiOutlinedInput-root": {
                        "& fieldset": { borderColor: "#292d3b" },
                      },
                      "& .MuiSvgIcon-root": { color: "#f7f7f7" },
                    }}
                  >
                    <MenuItem value={NO_CATEGORY}>No category</MenuItem>
                    {categories.map((category) => (
                      <MenuItem key={`${asset.id}-${category}`} value={category}>
                        {category}
                      </MenuItem>
                    ))}
                  </TextField>
                </ListItem>
              ))}
            </List>

            {error && (
              <Typography variant="caption" sx={{ color: "#ff8a80" }}>
                {error}
              </Typography>
            )}

            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
              {categories.map((category) => (
                <Chip
                  key={category}
                  label={category}
                  size="small"
                  onClick={() => setSelectedSection(category)}
                  variant={selectedSection === category ? "filled" : "outlined"}
                />
              ))}
            </Box>

            {assets.length > 0 && filteredAssets.length === 0 && (
              <Typography variant="caption" color="text.secondary">
                No files or links are assigned to this category yet.
              </Typography>
            )}

            {assets.length === 0 && (
              <Box>
                <Typography variant="caption" color="text.secondary">
                  No stored files or links in this group yet.
                </Typography>
              </Box>
            )}
          </>
        )}
      </Stack>
    </Card>
  );
};

export default Sections;
