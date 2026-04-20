import {
  Box,
  Button,
  Dialog,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Stack,
  TextField,
  Typography,
} from "@mui/material"
import { DeleteOutline } from "@mui/icons-material"
import { useCallback, useEffect, useMemo, useState } from "react"
import { io, Socket } from "socket.io-client"
import CalendarEventPanel from "./CalendarEventPanel"
import { CalendarIcon } from "@mui/x-date-pickers"
import { supabase } from "../services/supabaseClient"

type SharedAsset = {
  id: string
  storagePath: string
  categoryName?: string | null
  familyGroupId: number
}

type LinkItem = {
  id: string
  title?: string
  url: string
  categoryName?: string | null
  familyGroupId: number
}

type AssetCategory = {
  id: number
  familyGroupId: number
  name: string
}

type SectionProps = {
  selectedGroupId: number | null
  onCreateCalendarEvent: () => void
  uploadRefreshTrigger: number
  calendarRefreshTrigger?: number
}

const IMAGE_EXTENSIONS = ["png", "jpg", "jpeg", "gif", "webp", "jfif", "bmp", "svg"]
const VIDEO_EXTENSIONS = ["mp4", "webm", "mov", "m4v", "avi", "wmv", "flv", "mkv"]


const Sections: React.FC<SectionProps> = ({
  selectedGroupId,
  onCreateCalendarEvent,
  uploadRefreshTrigger,
  calendarRefreshTrigger,
}) => {
  const [assets, setAssets] = useState<SharedAsset[]>([])
  const [links, setLinks] = useState<LinkItem[]>([])
  const [error, setError] = useState<string | null>(null)
  const [categories, setCategories] = useState<AssetCategory[]>([])
  const [selectedSection, setSelectedSection] = useState<string>("calendar")
  const [newCategoryName, setNewCategoryName] = useState("")
  const [fullscreenImage, setFullscreenImage] = useState<{ url: string } | null>(null)
  
  const getFileExtension = (value: string): string => {
    const pathname = value.split("?")[0]
    const lastDot = pathname.lastIndexOf(".")
    return lastDot >= 0 ? pathname.slice(lastDot + 1).toLowerCase() : ""
  }

  const getPublicFileUrl = (storagePath: string): string =>
    supabase.storage.from("media").getPublicUrl(storagePath).data.publicUrl
  
  const getFileType = (value: string): "image" | "video" | null => {
    const extension = getFileExtension(value)
  
    if (IMAGE_EXTENSIONS.includes(extension)) {
      return "image"
    }
  
    if (VIDEO_EXTENSIONS.includes(extension)) {
      return "video"
    }
  
    return null
  }
  
  const fetchAssets = useCallback(async () => {
    if (!selectedGroupId) {
      setAssets([])
      return
    }

    setError(null)
    const response = await fetch(`http://localhost:3000/assets?familyGroupId=${selectedGroupId}`)
    if (!response || !response.ok) {
      setError("Failed to load group assets.")
      return
    }

    const data = (await response.json()) as SharedAsset[]
    setAssets(data)
  }, [selectedGroupId])

  const fetchLinks = useCallback(async () => {
    if (!selectedGroupId) {
      setLinks([])
      return
    }

    const response = await fetch(`http://localhost:3000/links?familyGroupId=${selectedGroupId}`)
    if (!response || !response.ok) {
      setLinks([])
      return
    }

    const data = (await response.json()) as LinkItem[]
    setLinks(data)
  }, [selectedGroupId])

  const fetchCategories = useCallback(async () => {
    if (!selectedGroupId) {
      setCategories([])
      return
    }

    const response = await fetch(
      `http://localhost:3000/categories?familyGroupId=${selectedGroupId}`,
    )

    if (!response || !response.ok) {
      setCategories([])
      return
    }

    const data = (await response.json()) as AssetCategory[]
      setCategories(data)
  }, [selectedGroupId])

  useEffect(() => {
    fetchAssets()
    fetchLinks()
    fetchCategories()
  }, [fetchAssets, fetchCategories, fetchLinks])

  useEffect(() => {
    let socket: Socket | null = null

    if (!selectedGroupId) {
      return
    }

    socket = io("http://localhost:3000")

    socket.on("connect", () => {
      socket?.emit("join-group", { familyGroupId: String(selectedGroupId) })
    })

    socket.on("category-created", () => {
      fetchCategories()
    })

    socket.on("asset-category-updated", () => {
      fetchAssets()
      fetchLinks()
      fetchCategories()
    })

    socket.on("asset-created", () => {
      fetchAssets()
    })

    socket.on("link-created", () => {
      fetchLinks()
    })

    return () => {
      socket?.emit("leave-group", { familyGroupId: String(selectedGroupId) })
      socket?.disconnect()
    }
  }, [fetchAssets, fetchCategories, fetchLinks, selectedGroupId])

  useEffect(() => {
    if (!selectedGroupId) {
      setCategories([])
      setSelectedSection("calendar")
      return
    }
  }, [selectedGroupId])

  useEffect(() => {
    if (selectedSection === "calendar") return

    if (!categories.some((category) => category.name === selectedSection)) {
      setSelectedSection("calendar")
    }
  }, [categories, selectedSection])
  useEffect(() => {
    fetchAssets()
    fetchLinks()
  }, [uploadRefreshTrigger, fetchAssets, fetchLinks])

  
  const addCategory = async () => {
    if (!selectedGroupId) return

    const trimmed = newCategoryName.trim()
    if (!trimmed) return

    const response = await fetch('http://localhost:3000/categories', {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        familyGroupId: selectedGroupId,
        name: trimmed,
      }),
    })

    if (!response || !response.ok) {
      setError("Failed to create category.")
      return
    }

    const createdCategory = (await response.json()) as AssetCategory
    setCategories((prev) => {
      if (prev.some((category) => category.id === createdCategory.id)) return prev
      return [...prev, createdCategory]
    })
    setSelectedSection(createdCategory.name)
    setNewCategoryName("")
    fetchCategories()
  }

  const deleteCategory = async (category: AssetCategory) => {
    setError(null)

    const response = await fetch(`http://localhost:3000/categories/${category.id}`, {
      method: "DELETE",
    })

    if (!response || !response.ok) {
      setError("Failed to delete category.")
      return
    }

    setCategories((prev) => prev.filter((item) => item.id !== category.id))
    if (selectedSection === category.name) {
      setSelectedSection("calendar")
    }
    fetchAssets()
    fetchCategories()
  }

  const filteredAssets = useMemo(() => {
    if (selectedSection === "calendar") return []
    return assets.filter((asset) => (asset.categoryName ?? "") === selectedSection)
  }, [assets, selectedSection])

  const filteredLinks = useMemo(() => {
    if (selectedSection === "calendar") return []
    return links.filter((link) => (link.categoryName ?? "") === selectedSection)
  }, [links, selectedSection])

  const fileAssets = useMemo(() => filteredAssets, [filteredAssets])

  const renderMediaPreview = (asset: SharedAsset) => {
    const mediaKind = getFileType(asset.storagePath)
    const publicUrl = getPublicFileUrl(asset.storagePath)

    if (mediaKind === "image") {
      return (
        <Box
          component="img"
          src={publicUrl}
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
              url: publicUrl,
            })
          }
        />
      )
    }

    if (mediaKind === "video") {
      return (
        <Box
          component="video"
          src={publicUrl}
          controls
          sx={{
            width: "100%",
            maxHeight: 220,
            borderRadius: 2,
            border: "1px solid #292d3b",
            mb: 1,
          }}
        />
      )
    }

    return null
  }

  return (
    <>
      <Stack spacing={2}>
        <Typography variant="h6" fontWeight="bold">
          Calendar & Categories
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
              selected={selectedSection === "calendar"}
              onClick={() => setSelectedSection("calendar")}
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
            <ListItem key={category.id} disablePadding>
              <ListItemButton
                selected={selectedSection === category.name}
                onClick={() => setSelectedSection(category.name)}
                sx={{ borderRadius: 3 }}
              >
                <ListItemText
                  primary={category.name}
                  slotProps={{
                    primary: {
                      sx: {
                        color: "#f7f7f7",
                        fontSize: 15,
                        fontWeight: selectedSection === category.name ? "bold" : "normal",
                      },
                    },
                  }}
                />
                <IconButton
                  onClick={() => deleteCategory(category)}
                  aria-label={`Delete ${category.name}`}
                  sx={{ color: "#ff8a80" }}
                >
                  <DeleteOutline fontSize="small" />
                </IconButton>
              </ListItemButton>
            </ListItem>
          ))}
        </List>

        {selectedSection === "calendar" ? (
          <CalendarEventPanel 
          onCreateCalendarEvent={onCreateCalendarEvent}
          selectedGroupId={selectedGroupId}
            refreshTrigger={calendarRefreshTrigger ?? 0 }
            />
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
              {filteredLinks.map((link) => (
                <ListItem key={link.id} sx={{ px: 0, display: "block" }}>
                  <Box
                    component="a"
                    href={link.url}
                    target="_blank"
                    sx={{
                      color: "#f7f7f7",
                      textDecoration: "none",
                    }}
                  >
                    <ListItemText
                      primary={link.title ? `Title: ${link.title}` : "Link:"}
                      secondary={link.url}
                      slotProps={{
                        primary: {
                          sx: { color: "#9fa6c2", fontSize: 15, wordBreak: "break-word" },
                        },
                        secondary: {
                          sx: { color: "#9fa6c2", fontSize: 14, wordBreak: "break-word" },
                        },
                      }}
                    />
                  </Box>
                </ListItem>
              ))}
            </List>

            {(assets.length > 0 || links.length > 0) &&
              filteredAssets.length === 0 &&
              filteredLinks.length === 0 && (
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
              sx={{
                maxWidth: "100%",
                maxHeight: "100%",
                objectFit: "contain",
              }}
            />
          </Box>
        )}
      </Dialog>
    </>
  )
}

export default Sections
