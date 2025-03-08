<template>
    <v-dialog v-model="isDialogOpen" max-width="400">
        <v-card>
            <v-card-title>
                <span class="text-h5">Delete Knowledge base</span>
            </v-card-title>

            <v-card-text> Are you sure you want to delete this knowledge base? </v-card-text>

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
    import { useDocumentsSetsStore } from '@/stores/documentsSetsStore'
    import { ref } from 'vue'

    const emit = defineEmits(['deleted'])
    const documentsSetsStore = useDocumentsSetsStore()

    const isDialogOpen = ref(false)
    const submitting = ref(false)
    const documentsSetCode = ref<string>('')

    const openDialog = (code: string): void => {
        documentsSetCode.value = code
        isDialogOpen.value = true
    }

    const closeDialog = () => {
        isDialogOpen.value = false
    }

    const deleteDocument = () => {
        submitting.value = true

        documentsSetsStore
            .deleteDocumentsSet(documentsSetCode.value)
            .then(() => {
                emit('deleted')
                closeDialog()
            })
            .catch((err) => {
                console.error('Error deleting knowledge base:', err)
            })
            .finally(() => {
                submitting.value = false
            })
    }

    defineExpose({ openDialog })
</script>
