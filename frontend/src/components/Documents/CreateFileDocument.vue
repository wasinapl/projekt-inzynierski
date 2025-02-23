<template>
    <v-dialog v-model="isDialogOpen" max-width="400">
        <v-card>
            <v-card-title>
                <span class="text-h5">Add New File</span>
            </v-card-title>

            <v-card-text>
                <UploadFile v-model="file"></UploadFile>
            </v-card-text>

            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="blue darken-1" @click="closeDialog" :disabled="subbmiting"
                    >Cancel</v-btn
                >
                <v-btn color="blue darken-1" @click="createDocument" :loading="subbmiting"
                    >Add</v-btn
                >
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script lang="ts" setup>
    import { useDocumentsStore } from '@/stores/documentsStore'
    import { ref } from 'vue'
    import UploadFile from './UploadFile.vue'

    const props = defineProps<{
        documentSetCode: string
    }>()

    const emit = defineEmits(['document-saved'])
    const documentsStore = useDocumentsStore()

    const subbmiting = ref(false)
    const isDialogOpen = ref(false)
    const file = ref<File | null>(null)

    const openDialog = (): void => {
        isDialogOpen.value = true
        file.value = null
    }

    const closeDialog = () => {
        isDialogOpen.value = false
    }

    const createDocument = () => {
        if (file.value) {
            subbmiting.value = true
            documentsStore
                .createDocumentFromFile({
                    file: file.value,
                    documentsSetCode: props.documentSetCode,
                })
                .then(() => {
                    emit('document-saved')
                    closeDialog()
                })
                .finally(() => {
                    subbmiting.value = false
                })
        }
    }

    defineExpose({ openDialog })
</script>
<style lang="css" scoped></style>
