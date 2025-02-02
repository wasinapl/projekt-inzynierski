<template>
    <v-dialog v-model="isDialogOpen" max-width="400">
        <v-card>
            <v-card-title>
                <span class="text-h5">Delete Document</span>
            </v-card-title>

            <v-card-text> Are you sure you want to delete this document? </v-card-text>

            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="blue darken-1" @click="closeDialog" :disabled="submitting">
                    Cancel
                </v-btn>
                <v-btn color="error" @click="deleteDocument" :loading="submitting"> Delete </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script lang="ts" setup>
    import { useDocumentsStore } from '@/store/documents'
    import { ref } from 'vue'

    const emit = defineEmits(['document-deleted'])
    const documentsStore = useDocumentsStore()

    const isDialogOpen = ref(false)
    const submitting = ref(false)
    const documentCode = ref<string>('')

    const openDialog = (code: string): void => {
        documentCode.value = code
        isDialogOpen.value = true
    }

    const closeDialog = () => {
        isDialogOpen.value = false
    }

    const deleteDocument = () => {
        submitting.value = true

        documentsStore
            .deleteDocument(documentCode.value)
            .then(() => {
                emit('document-deleted')
                closeDialog()
            })
            .catch((err) => {
                console.error('Error deleting document:', err)
            })
            .finally(() => {
                submitting.value = false
            })
    }

    defineExpose({ openDialog })
</script>
