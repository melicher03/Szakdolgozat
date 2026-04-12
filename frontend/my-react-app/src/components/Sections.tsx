import {
  Box,
  Button,
  Card,
  Dialog,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useCallback, useEffect, useMemo, useState } from "react";
import { io, Socket } from "socket.io-client";
import CalendarEventPanel from "./CalendarEventPanel";
import { cardStyle } from "./MainPage";
import { CalendarIcon } from "@mui/x-date-pickers";

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
  const [fullscreenImage, setFullscreenImage] = useState<{ url: string; title?: string } | null>(null);

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
            cursor: "zoom-in",
          }}
          onClick={() =>
            setFullscreenImage({
              url: asset.url,
              title: asset.title,
            })
          }
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
    <Card sx={cardStyle}>
      <Stack spacing={2}>
        <Typography variant="h6" fontWeight="bold">
          Sections
        </Typography>

        {error && (
          <Typography variant="caption" color="#ff8a80">
            {error}
          </Typography>
        )}

        <Stack direction="row" spacing={1}>
          <TextField
            size="small"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            placeholder="New category"
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

        <List
          sx={{
            maxHeight: "15vh",
            overflow: "auto",
            border: "1px solid #292d3b",
            borderRadius: 3,
            p: 0.5,
            "&::-webkit-scrollbar": {
              width: "5px",
            },
            "&::-webkit-scrollbar-thumb": {
              background: "#9e9e9e",
              borderRadius: "10px",
            },
          }}
        >
          <ListItem disablePadding>
            <ListItemButton
              selected={selectedSection === CALENDAR_SECTION}
              onClick={() => setSelectedSection(CALENDAR_SECTION)}
              sx={{ borderRadius: 3 }}
            >
              <ListItemText
                primary="Calendar"
                slotProps={{
                  primary: { sx: { color: "#f7f7f7", fontSize: 15 } },
                }}
              />
              <CalendarIcon />
            </ListItemButton>
          </ListItem>

          {categories.map((category) => (
            <ListItem key={category} disablePadding>
              <ListItemButton
                selected={selectedSection === category}
                onClick={() => setSelectedSection(category)}
                sx={{ borderRadius: 3 }}
              >
                <ListItemText
                  primary={category}
                  slotProps={{
                    primary: {
                      sx: {
                        color: "#f7f7f7",
                        fontSize: 15,
                        fontWeight: selectedSection === category ? "bold" : "normal",
                      },
                    },
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
            <List
              sx={{
                maxHeight: "30vh",
                overflowY: "auto",
                overflowX: "hidden",
                "&::-webkit-scrollbar": {
                  width: "5px",
                },
                "&::-webkit-scrollbar-thumb": {
                  background: "#9e9e9e",
                  borderRadius: "10px",
                },
              }}
            >
              {fileAssets.map((asset) => (
                <ListItem key={asset.id} sx={{ px: 0 }}>
                  {renderMediaPreview(asset)}
                </ListItem>
              ))}
            </List>

            <List
              sx={{
                maxHeight: "15vh",
                overflow: "auto",
                "&::-webkit-scrollbar": {
                  width: "5px",
                },
                "&::-webkit-scrollbar-thumb": {
                  background: "#9e9e9e",
                  borderRadius: "10px",
                },
              }}
            >
              {urlAssets.map((asset) => (
                <ListItem key={asset.id} sx={{ px: 0, display: "block" }}>
                  <ListItemText
                    primary={asset.title || ''}
                    secondary={asset.url}
                    slotProps={{
                      primary: { sx: { color: "#f7f7f7", fontSize: 15, wordBreak: "break-word" } },
                      secondary: { sx: { color: "#9fa6c2", fontSize: 14, wordBreak: "break-word" } },
                    }}
                  />
                </ListItem>
              ))}
            </List>

            {assets.length > 0 && filteredAssets.length === 0 && (
              <Typography variant="caption" color="#f7f7f7">
                No files or links are assigned to this category yet.
              </Typography>
            )}
          </>
        )}
      </Stack>

      <Dialog
        open={Boolean(fullscreenImage)}
        onClose={() => setFullscreenImage(null)}
        fullScreen
        slotProps={{
          paper: {
            sx: {
              bgcolor: "rgba(0, 0, 0, 0.95)",
            },
          },
        }}
      >
        {fullscreenImage && (
          <Box
            sx={{
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              p: 2,
            }}
            onClick={() => setFullscreenImage(null)}
          >
            <Box
              component="img"
              src={fullscreenImage.url}
              alt={fullscreenImage.title || "Image preview"}
              sx={{
                maxWidth: "100%",
                maxHeight: "100%",
                objectFit: "contain",
              }}
            />
          </Box>
        )}
      </Dialog>
    </Card>
  );
};

export default Sections;
