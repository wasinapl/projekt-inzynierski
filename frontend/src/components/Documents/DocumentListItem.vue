<template>
    <v-card class="ma-2">
        <template v-slot:title>
            <v-icon icon="mdi-text-box-outline" size="small"></v-icon>
            {{ document.title }}
            <v-chip :color="getStatusColor(document.status)" dark small class="ml-2">
                {{ document.status }}
            </v-chip>
        </template>

        <template v-slot:subtitle></template>

        <template v-slot:actions>
            <v-btn color="primary" @click="onEditClick"> Edit </v-btn>
            <v-btn color="error" @click="onDeleteClick"> Delete </v-btn>
        </template>
    </v-card>
</template>

<script lang="ts" setup>
    import type { Document } from '@/types/Document'
    import { onMounted, onUnmounted } from 'vue'
    import { connectSocket } from '@/sockets/documents.socket'

    const socket = connectSocket()

    const onDocumentUpdate = (data: { documentCode: string; status: string }) => {
        console.log(data)
        if (data.documentCode === props.document.code) {
            props.document.status = data.status
        }
    }

    onMounted(() => {
        socket.on('status-update', onDocumentUpdate)
    })

    onUnmounted(() => {
        socket.off('status-update', onDocumentUpdate)
    })

    const props = defineProps<{
        document: Document
    }>()

    const emit = defineEmits(['onEditClick', 'onDeleteClick'])

    const onEditClick = () => {
        emit('onEditClick')
    }

    const onDeleteClick = () => {
        emit('onDeleteClick')
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PROCESSING':
                return 'blue'
            case 'READY':
                return 'green'
            case 'FAILED':
                return 'red'
            default:
                return 'grey'
        }
    }
</script>
