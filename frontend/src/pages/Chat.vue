<template>
    <div class="chat-view">
        <div class="chat-options">
            <v-autocomplete
                v-if="isNew"
                v-model="documentsSetCode"
                label="Select knowledge base"
                item-title="name"
                item-value="code"
                :items="documentsSets"
                variant="outlined"
            ></v-autocomplete>
            <div v-else>
                This thread have knowledge from:
                {{ thread?.DocumentsSet.name }}
            </div>
        </div>
        <div class="chat-messages" ref="messages_container">
            <div
                v-for="message in messages"
                :key="message.id"
                class="chat-message"
                :class="{
                    'chat-message--user': message.senderType === 'USER',
                    'chat-message--ai': message.senderType === 'AI',
                }"
            >
                <span>{{ message.content }}</span>
            </div>
            <div class="chat-message chat-message--ai" v-if="streamMessage">
                <span>{{ streamMessage }}</span>
            </div>
        </div>
        <div class="chat-input">
            <v-textarea
                v-model="message"
                label="Message"
                rows="2"
                auto-grow
                @keydown.enter.prevent="sendMessage"
            ></v-textarea>
            <v-btn @click="sendMessage" :disabled="submitting">Send</v-btn>
        </div>
    </div>
</template>

<script lang="ts" setup>
    import { useRoute, useRouter } from 'vue-router'
    import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
    import DocumentsSetsService from '@/services/documentsSetsService'
    import { useThreadsStore } from '@/stores/threadsStore'
    import type { Message } from '@/types/Message'
    import { connectSocket } from '@/sockets/chatSocket'

    const socket = connectSocket()
    const threadsStore = useThreadsStore()
    const route = useRoute()
    const router = useRouter()
    const threadCode = ref<string | undefined>(route.params.code as string | undefined)
    const message = ref<string>('')
    const submitting = ref<boolean>(false)
    const documentsSetCode = ref<string | undefined>()
    const messages_container = ref<HTMLElement | null>(null)

    const messages = ref<Message[]>([])
    const streamMessage = ref<string | undefined>('')

    watch(
        () => route.params.code,
        (newCode) => {
            threadCode.value = newCode as string | 'new'
            if (threadCode.value !== 'new' && threadsStore.thread.code !== threadCode.value) {
                threadsStore.fetchThread(threadCode.value!).then(() => {
                    messages.value = threadsStore.thread.data?.messages || []
                })
            } else if (threadCode.value === 'new') {
                messages.value = []
            }
        },
        { immediate: true }
    )

    watch(
        () => route.query.documentsSet,
        (newCode) => {
            if (newCode && !Array.isArray(newCode)) {
                documentsSetCode.value = newCode as string | undefined
            }
        },
        { immediate: true }
    )

    const isNew = computed(() => threadCode.value === 'new')
    const documentsSets = ref<DocumentsSet[]>([])
    const thread = computed(() => threadsStore.thread.data)

    const sendMessage = async () => {
        if (
            message.value.trim() === '' ||
            (isNew.value && !documentsSetCode.value) ||
            submitting.value
        ) {
            return
        }

        submitting.value = true
        if (isNew.value) {
            const code = await threadsStore.createThread({
                documentsSetCode: documentsSetCode.value!,
            })
            router.push({ name: 'Chat', params: { code: code } })
            socket.emit('message', { threadCode: code, message: message.value })
        } else {
            socket.emit('message', { threadCode: threadCode.value, message: message.value })
        }

        message.value = ''
        setScrollToBottom()
    }

    const setScrollToBottom = () => {
        nextTick(() => {
            if (messages_container.value) {
                messages_container.value.scrollTop = messages_container.value.scrollHeight
            }
        })
    }

    const onMessage = (messageThreadCode: string, message: Message) => {
        if (threadCode.value === messageThreadCode) {
            messages.value.push(message)
            setScrollToBottom()
        }
    }
    const onMessageStream = (messageThreadCode: string, content: string) => {
        if (threadCode.value === messageThreadCode) {
            streamMessage.value += content
            setScrollToBottom()
        }
    }
    const onMessageStreamEnd = (messageThreadCode: string) => {
        if (threadCode.value === messageThreadCode) {
            streamMessage.value = ''
            submitting.value = false
            setScrollToBottom()
        }
    }

    onMounted(() => {
        socket.on('message', onMessage)
        socket.on('message-stream', onMessageStream)
        socket.on('message-stream-end', onMessageStreamEnd)
    })

    onUnmounted(() => {
        socket.off('message', onMessage)
        socket.off('message-stream', onMessageStream)
        socket.off('message-stream-end', onMessageStreamEnd)
    })

    DocumentsSetsService.getAllDocumentsSets().then((response) => {
        documentsSets.value = response.items
    })
</script>

<style scoped>
    .chat-view {
        display: flex;
        flex-direction: column;
        height: calc(100vh - 110px);
    }

    .chat-options {
        flex: 0 0 auto;
    }

    .chat-messages {
        flex: 1 1 auto;
        display: flex;
        flex-direction: column;
        overflow-y: auto;
    }

    .chat-message {
        margin-bottom: 10px;
        padding: 10px;
        border-radius: 5px;
        background-color: #f2f2f2;
        color: #333;
        word-break: normal;
        max-width: 70%;
        white-space: break-spaces;
    }

    .chat-message--user {
        background-color: #007bff;
        align-self: flex-end;
        color: white;
    }

    .chat-message--ai {
        align-self: flex-start;
    }

    .chat-input {
        flex: 0 0 auto;
        display: flex;
        align-items: start;
    }
</style>
