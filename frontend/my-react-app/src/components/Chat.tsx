import { Send } from '@mui/icons-material';
import { Box, Button, Stack, TextField, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface Message {
  id?: string;
  text: string;
  senderId: string;
  senderName?: string;
  createdAt?: string;
}

interface ChatComponentProps {
  familyGroupId: string;
  familyGroupName: string;
  userId: string;
  userName: string;
}

const ChatComponent: React.FC<ChatComponentProps> = ({
  familyGroupId,
  familyGroupName,
  userId,
  userName,
}) => {
  const [currentSocket, setCurrentSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const socket = io('http://localhost:3000', {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });
    setCurrentSocket(socket);

    socket.on('connect', () => {
      console.log('WebSocket connected');
      setIsConnected(true);
      socket.emit('join-group', { familyGroupId });
    });

    socket.on('receive-message', (message: Message) => {
      const normalizedMessage: Message = {
        id: message.id,
        text: message.text,
        senderId: message.senderId ?? 'unknown',
        senderName: message.senderName,
        createdAt: message.createdAt,
      };
      setMessages((prev) => [...prev, normalizedMessage]);
    });

    socket.on('disconnect', () => {
      console.log('WebSocket disconnected');
      setIsConnected(false);
    });

    return () => {
      socket.emit('leave-group', { familyGroupId });
      socket.disconnect();
      setCurrentSocket(null);
    };
  }, [familyGroupId]);

  const handleSendMessage = () => {
    if (!input.trim() || !currentSocket) return;

    const message = {
      text: input,
      senderId: userId,
      senderName: userName,
      familyGroupId,
    };

    currentSocket.emit('send-message', message);
    setInput('');
  };

  return (
    <Stack spacing={2} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Typography variant="body2" color={isConnected ? 'green' : 'red'}>
        {isConnected ? '🟢 Connected' : '🔴 Disconnected'} to {familyGroupName}
      </Typography>

      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          borderRadius: 1,
          p: 2,
          border: '1px solid #292d3b',
        }}
      >
        <Stack spacing={1}>
          {messages.length === 0 ? (
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
          )}
        </Stack>
      </Box>

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
  );
};

export default ChatComponent;
