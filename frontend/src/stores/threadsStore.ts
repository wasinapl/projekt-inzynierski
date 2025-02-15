import ThreadsService from '@/services/threadsService'
import type { CreateThreadDTO } from '@/types/dto/ThreadDTO'
import type { Thread } from '@/types/Thread'
import { defineStore } from 'pinia'

interface ThreadsState {
    threads: {
        data: Thread[]
        loading: boolean
    }
    thread: {
        code?: string
        data: Thread | null
        loading: boolean
    }
}

export const useThreadsStore = defineStore('threads', {
    state: (): ThreadsState => ({
        threads: {
            data: [],
            loading: false,
        },
        thread: {
            code: undefined,
            data: null,
            loading: false,
        },
    }),
    actions: {
        async fetchThreads() {
            this.threads.loading = true
            this.threads.data = await ThreadsService.getAllThreads()
            this.threads.loading = false
        },
        async fetchThread(code: string) {
            this.thread.loading = true
            this.thread.data = await ThreadsService.getThreadByCode(code)
            this.thread.code = this.thread.data?.code
            this.thread.loading = false
        },
        async createThread(data: CreateThreadDTO) {
            const { code } = await ThreadsService.createThread(data)
            await this.fetchThread(code)
            return code
        },
    },
})
