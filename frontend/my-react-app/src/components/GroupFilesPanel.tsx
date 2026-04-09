import {
  Box,
  Button,
  Card,
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
import CalendarEventPanel from "./CalendarEventPanel";

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
  onCreateCalendarEvent: () => void;
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

const CALENDAR_SECTION = "__calendar__";
const NO_CATEGORY = "";

const getCategoriesStorageKey = (groupId: number) => `asset-categories-${groupId}`;
const getAssetCategoryMapStorageKey = (groupId: number) => `asset-category-map-${groupId}`;

const getStoredCategories = (groupId: number): string[] => {
  try {
    const raw = localStorage.getItem(getCategoriesStorageKey(groupId));
    if (!raw) return [];

    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];

    return Array.from(
      new Set(
        parsed
          .filter((value): value is string => typeof value === "string")
          .map((value) => value.trim())
          .filter((value) => value.length > 0),
      ),
    );
  } catch {
    return [];
  }
};

const setStoredCategories = (groupId: number, categories: string[]) => {
  localStorage.setItem(getCategoriesStorageKey(groupId), JSON.stringify(categories));
};

const getStoredAssetCategoryMap = (groupId: number): Record<string, string> => {
  try {
    const raw = localStorage.getItem(getAssetCategoryMapStorageKey(groupId));
    if (!raw) return {};

    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") return {};

    return parsed as Record<string, string>;
  } catch {
    return {};
  }
};

const setStoredAssetCategoryMap = (groupId: number, value: Record<string, string>) => {
  localStorage.setItem(getAssetCategoryMapStorageKey(groupId), JSON.stringify(value));
};

const GroupFilesPanel: React.FC<GroupFilesPanelProps> = ({
  apiBaseUrl,
  selectedGroupId,
  onCreateCalendarEvent,
}) => {
  const [assets, setAssets] = useState<SharedAsset[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedSection, setSelectedSection] = useState<string>(CALENDAR_SECTION);
  const [assetCategoryMap, setAssetCategoryMap] = useState<Record<string, string>>({});
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

  useEffect(() => {
    void fetchAssets();
  }, [fetchAssets]);

  useEffect(() => {
    if (!selectedGroupId) {
      setCategories([]);
      setSelectedSection(CALENDAR_SECTION);
      setAssetCategoryMap({});
      return;
    }

    const nextCategories = getStoredCategories(selectedGroupId);
    const nextAssetMap = getStoredAssetCategoryMap(selectedGroupId);

    setCategories(nextCategories);
    setAssetCategoryMap(nextAssetMap);
    setSelectedSection((prev) => {
      if (prev === CALENDAR_SECTION) return prev;
      return nextCategories.includes(prev) ? prev : CALENDAR_SECTION;
    });
  }, [selectedGroupId]);

  const addCategory = () => {
    if (!selectedGroupId) return;

    const trimmed = newCategoryName.trim();
    if (!trimmed) return;

    if (categories.includes(trimmed)) {
      setNewCategoryName("");
      return;
    }

    const next = [...categories, trimmed];
    setCategories(next);
    setStoredCategories(selectedGroupId, next);
    setSelectedSection(trimmed);
    setNewCategoryName("");
  };

  const setAssetCategory = (assetId: string, category: string) => {
    if (!selectedGroupId) return;

    const nextMap = {
      ...assetCategoryMap,
      [assetId]: category,
    };

    setAssetCategoryMap(nextMap);
    setStoredAssetCategoryMap(selectedGroupId, nextMap);
  };

  const filteredAssets = useMemo(() => {
    if (selectedSection === CALENDAR_SECTION) return [];
    return assets.filter((asset) => (assetCategoryMap[asset.id] ?? NO_CATEGORY) === selectedSection);
  }, [assetCategoryMap, assets, selectedSection]);

  const fileAssets = useMemo(
    () => filteredAssets.filter((asset) => asset.type === "FILE"),
    [filteredAssets],
  );

  const urlAssets = useMemo(
    () => filteredAssets.filter((asset) => asset.type === "URL"),
    [filteredAssets],
  );

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
                  <ListItemText
                    primary={asset.title || asset.url}
                    secondary={asset.url}
                    slotProps={{
                      primary: { sx: { color: "#f7f7f7", fontSize: 13 } },
                      secondary: { sx: { color: "#9fa6c2", fontSize: 12 } },
                    }}
                  />
                  <TextField
                    select
                    size="small"
                    value={assetCategoryMap[asset.id] ?? NO_CATEGORY}
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
                  <ListItemText
                    primary={asset.title || asset.url}
                    secondary={asset.url}
                    slotProps={{
                      primary: { sx: { color: "#f7f7f7", fontSize: 13 } },
                      secondary: { sx: { color: "#9fa6c2", fontSize: 12 } },
                    }}
                  />
                  <TextField
                    select
                    size="small"
                    value={assetCategoryMap[asset.id] ?? NO_CATEGORY}
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

export default GroupFilesPanel;
