import { AttachFile, InsertLink, Send } from '@mui/icons-material'
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { useCallback, useEffect, useState } from 'react'
import { io, Socket } from 'socket.io-client'
import { supabase } from '../services/supabaseClient'
import { cardStyle } from './MainPage'

interface Message {
  id?: string
  text: string
  senderId: string
  senderName?: string
  createdAt?: string
}

interface ChatComponentProps {
  familyGroupId: string | null
  familyGroupName: string
  userId: string
  userName: string
  onUploadSuccess?: () => void
}

interface AssetCategory {
  id: number
  familyGroupId: number
  name: string
}

const ChatComponent: React.FC<ChatComponentProps> = ({
  familyGroupId,
  familyGroupName,
  userId,
  userName,
  onUploadSuccess,
}) => {
  const [currentSocket, setCurrentSocket] = useState<Socket | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isConnected, setIsConnected] = useState(false)
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false)
  const [isFileDialogOpen, setIsFileDialogOpen] = useState(false)
  const [linkUrl, setLinkUrl] = useState('')
  const [linkTitle, setLinkTitle] = useState('')
  const [category, setCategory] = useState('')
  const [selectedFile, setselectedFile] = useState<File | null>(null)
  const [categories, setCategories] = useState<AssetCategory[]>([])
  const [result, setResult] = useState<string | null>(null)

  const loadCategories = useCallback(async () => {
    if (!familyGroupId) {
      setCategories([])
      setCategory('')
      return
    }

    const response = await fetch(
      `http://localhost:3000/assets/categories?familyGroupId=${familyGroupId}`,
    )
    if (!response || !response.ok) {
      setCategories([])
      return
    }

    const data = (await response.json()) as AssetCategory[]
    setCategories(data)
  }, [familyGroupId])

  const scrollToBottom = () => {
    const container = document.getElementById('chat-scroll-container')
    if (!container) return
    container.scrollTop = container.scrollHeight
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    loadCategories()
  }, [loadCategories])

  useEffect(() => {
    if (!isLinkDialogOpen && !isFileDialogOpen) {
      return
    }

    loadCategories()
  }, [isFileDialogOpen, isLinkDialogOpen, loadCategories])

  useEffect(() => {
    if (!isLinkDialogOpen && !isFileDialogOpen) return

    if (categories.length === 0) {
      setCategory('')
      return
    }

    setCategory((current) =>
      categories.some((category) => category.name === current) ? current : categories[0].name,
    )
  }, [categories, isLinkDialogOpen, isFileDialogOpen])

  useEffect(() => {
    let socket: Socket | null = null

    const loadHistoryAndConnect = async () => {
      setMessages([])
      if (familyGroupId === null) {
        setIsConnected(false)
        setCurrentSocket(null)
        return
      }

      const response = await fetch(
        `http://localhost:3000/messages?familyGroupId=${familyGroupId}`,
      )
      if (!response || !response.ok) {
        return
      }

      const history = (await response.json()) as Message[]
      setMessages(history)

      socket = io('http://localhost:3000')
      setCurrentSocket(socket)

      socket.on('connect', () => {
        console.log('WebSocket connected')
        setIsConnected(true)
        socket?.emit('join-group', { familyGroupId })
      })

      socket.on('receive-message', (message: Message) => {
        const normalizedMessage: Message = {
          id: message.id,
          text: message.text,
          senderId: message.senderId ?? 'unknown',
          senderName: message.senderName,
          createdAt: message.createdAt,
        }
        setMessages((prev) => [...prev, normalizedMessage])
      })

      socket.on('disconnect', () => {
        console.log('WebSocket disconnected')
        setIsConnected(false)
      })
    }

    void loadHistoryAndConnect()

    return () => {
      socket?.emit('leave-group', { familyGroupId })
      socket?.disconnect()
      setCurrentSocket(null)
    }
  }, [familyGroupId])

  const handleSendMessage = () => {
    if (!input.trim() || !currentSocket) return

    const message = {
      text: input,
      senderId: userId,
      senderName: userName,
      familyGroupId,
    }

    currentSocket.emit('send-message', message)
    setInput('')
    requestAnimationFrame(() => scrollToBottom())
  }  
  const closeLinkDialog = () => {
    setIsLinkDialogOpen(false)
    setLinkUrl('')
    setLinkTitle('')
    setCategory('')
  }

  const closeFileDialog = () => {
    setIsFileDialogOpen(false)
    setselectedFile(null)
    setCategory('')
  }

  const handleSaveLink = async () => {
    if (!familyGroupId || !linkUrl.trim()) {
      setResult('Provide a valid URL and select a family group first.')
      return
    }

    const response = await fetch('http://localhost:3000/links', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        familyGroupId: Number(familyGroupId),
        url: linkUrl.trim(),
        title: linkTitle.trim() || undefined,
        categoryName: category,
      }),
    })

    if (!response || !response.ok) {
      const text = response ? await response.text() : 'Network error'
      setResult(`Link upload failed: ${text}`)
      return
    }

    setResult('Link uploaded successfully.')
    closeLinkDialog()
    onUploadSuccess?.()
  }

  const handleUploadFile = async () => {
    if (!familyGroupId || !selectedFile) {
      setResult('Select a family group and an image/video file first.')
      return
    }

    const fileExtension = selectedFile.name.split('.').pop()
    const fileName = `${Date.now()}.${fileExtension}`
    const storagePath = `family-${familyGroupId}/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('media')
      .upload(storagePath, selectedFile)

    if (uploadError) {
      setResult(`Media upload failed: ${uploadError.message}`)
      return
    }

    const response = await fetch('http://localhost:3000/assets/file', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        familyGroupId: Number(familyGroupId),
        storagePath,
        fileSize: selectedFile.size,
        categoryName: category,
      }),
    })

    if (!response || !response.ok) {
      const text = response ? await response.text() : 'Network error'
      setResult(`Media metadata save failed: ${text}`)
      return
    }

    setResult('Media uploaded successfully.')
    closeFileDialog()
    onUploadSuccess?.()
  }

  return (
    <Stack
      spacing={2}
      sx={{
        maxHeight: '70vh',
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      <Typography variant="body2" color={isConnected ? 'green' : 'red'}>
        {isConnected ? '🟢 Connected to' : '🔴 Disconnected from'} {familyGroupName}
      </Typography>

      <Box
        id="chat-scroll-container"
        sx={{
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
          '&::-webkit-scrollbar': {
            width: '5px',
          },
          '&::-webkit-scrollbar-thumb': {
            background: '#9e9e9e',
            borderRadius: '10px',
          },
          borderRadius: 1,
          p: 2,
          border: '1px solid #292d3b',
        }}
      >
        <Stack spacing={1}>
          {familyGroupId === null ? (
            <Typography variant="body2" color="#888" sx={{ textAlign: 'center', py: 4 }}>
              There is no family group selected. Please select a family group to start chatting.
            </Typography>
          ) : (messages.length === 0 ? (
            <Typography variant="body2" color="#888" sx={{ textAlign: 'center', py: 4 }}>
              No messages yet. Start the conversation!
            </Typography>
          ) : (
            messages.map((msg, idx) => (
              <Box
                key={idx}
                sx={{
                  mb: 1,
                  p: 1,
                  bgcolor: msg.senderId === userId ? '#1d6add' : '#21262d',
                  borderRadius: 1,
                  alignSelf: msg.senderId === userId ? 'flex-end' : 'flex-start',
                  maxWidth: '80%',
                }}
              >
                <Typography variant="caption" sx={{ color: '#888' }}>
                  {msg.senderName}
                </Typography>
                <Typography variant="body2" sx={{ color: '#f7f7f7', wordBreak: 'break-word' }}>
                  {msg.text}
                </Typography>
              </Box>
            ))
          ))}
        </Stack>
      </Box>

      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <Button
          sx={{
            borderRadius: 5,
            mr: 1,
            minWidth: 0,
            width: 30,
            height: 30,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          variant="contained"
          onClick={() => setIsLinkDialogOpen(true)}
          disabled={!isConnected}
        >
          <InsertLink fontSize='small' />
        </Button>
        <Button
          sx={{
            borderRadius: 5,
            mr: 1,
            minWidth: 0,
            width: 30,
            height: 30,
            px: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          variant="contained"
          onClick={() => setIsFileDialogOpen(true)}
          disabled={!isConnected}
        >
          <AttachFile fontSize="small" />
        </Button>
      </Box>

        <Dialog
          open={isLinkDialogOpen}
          onClose={closeLinkDialog}
          fullWidth
          maxWidth="sm"
          slotProps={{
                paper: { sx: cardStyle },
            }}
        >
          <DialogTitle sx={{ color: '#f7f7f7' }}>Save a link</DialogTitle>
          <DialogContent sx={{ display: 'grid', gap: 2, pt: 1, bgcolor: 'transparent' }}>
            <TextField
              autoFocus
              placeholder="URL"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              fullWidth
              sx={{
                '& .MuiInputBase-input': { color: '#f7f7f7' },
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: '#292d3b' },
                },
              }}
            />
            <TextField
              placeholder="Title (optional)"
              value={linkTitle}
              onChange={(e) => setLinkTitle(e.target.value)}
              fullWidth
              sx={{
                '& .MuiInputBase-input': { color: '#f7f7f7' },
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: '#292d3b' },
                },
              }}
            />
            <TextField
              select
              placeholder="Category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              fullWidth
              sx={{
                '& .MuiInputBase-input': { color: '#f7f7f7' },
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: '#292d3b' },
                },
                '& .MuiSvgIcon-root': { color: '#f7f7f7' },
              }}
            >
              {categories.map((category) => (
                <MenuItem key={category.id} value={category.name}>
                  {category.name}
                </MenuItem>
              ))}
            </TextField>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button sx={{ color: "#f7f7f7" }} onClick={closeLinkDialog}>
              Cancel
            </Button>
            <Button variant="contained" onClick={handleSaveLink} disabled={!linkUrl.trim()}>
              Save link
            </Button>
          </DialogActions>
        </Dialog>

      <Dialog
        open={isFileDialogOpen}
        onClose={closeFileDialog}
        fullWidth
        maxWidth="sm"
        slotProps={{
                paper: { sx: cardStyle },
            }}
      >
        <DialogTitle sx={{ color: '#f7f7f7' }}>Upload image or video</DialogTitle>
        <DialogContent sx={{ display: 'grid', gap: 2, pt: 1, bgcolor: 'transparent' }}>
          <Button variant="outlined" component="label">
            Choose image/video
            <input
              hidden
              type="file"
              accept="image/*,video/*"
              onChange={(e) => setselectedFile(e.target.files?.[0] ?? null)}
            />
          </Button>
          {selectedFile && (
            <Typography variant="caption">Selected: {selectedFile.name}</Typography>
          )}
          <TextField
            select
            placeholder="Category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            fullWidth
            sx={{
              '& .MuiInputBase-input': { color: '#f7f7f7' },
              '& .MuiOutlinedInput-root': {
                '& fieldset': { borderColor: '#292d3b' },
              },
              '& .MuiSvgIcon-root': { color: '#f7f7f7' },
            }}
          >
            {categories.length === 0 ? (
              <MenuItem value="" disabled>
                No categories available, create one first
              </MenuItem>
            ):
              categories.map((category) => (
                <MenuItem key={category.id} value={category.name}>
                  {category.name}
                </MenuItem>
              ))
            }
          </TextField>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button sx={{ color: "#f7f7f7" }} onClick={closeFileDialog}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleUploadFile} disabled={!selectedFile}>
            Upload media
          </Button>
        </DialogActions>
      </Dialog>

      {result && (
        <Typography variant="caption" sx={{ color: '#9fa6c2' }}>
          {result}
        </Typography>
      )}

      <Stack direction="row" spacing={1}>
        <TextField
          fullWidth
          size="small"
          placeholder="Type a message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={!isConnected}
          multiline
          maxRows={3}
          sx={{
            '& .MuiInputBase-input': { color: '#f7f7f7' },
            '& .MuiOutlinedInput-root': {
                '& fieldset': { borderColor: '#292d3b' },
            }
          }}
        />
        <Button
          variant="contained"
          onClick={handleSendMessage}
          disabled={!isConnected || !input.trim()}
          sx={{ minWidth: 50 }}
        >
          <Send />
        </Button>
      </Stack>
    </Stack>
  )
}

export default ChatComponent
