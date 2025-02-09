import { io, Socket } from 'socket.io-client'
import { useAuthStore } from '@/stores/auth'

let socket: Socket | null = null

export function connectSocket(): Socket {
    if (socket) {
        return socket
    }

    const authStore = useAuthStore()
    const token = authStore.getToken()

    socket = io('http://localhost:3000/documents', {
        extraHeaders: {
            Authorization: `Bearer ${token}`,
        },
    })

    socket.on('connect', () => {
        console.log('Socket.IO connected, id:', socket?.id)
    })

    socket.on('disconnect', (reason: string) => {
        console.log('Socket.IO disconnected:', reason)
    })

    return socket
}

export function disconnectSocket(): void {
    if (socket) {
        socket.disconnect()
        socket = null
    }
}
