<template>
    <v-dialog v-model="isDialogOpen" max-width="800">
        <v-card>
            <v-card-title>
                <span class="text-h5">Change name</span>
            </v-card-title>

            <v-card-text>
                <v-form @submit.prevent="update" v-model="isFormValid">
                    <v-textarea
                        v-model="form.description"
                        label="Description"
                        required
                        rows="10"
                        no-resize
                    ></v-textarea>
                </v-form>
            </v-card-text>

            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="blue darken-1" @click="closeDialog" :disabled="subbmiting"
                    >Cancel</v-btn
                >
                <v-btn color="blue darken-1" @click="update" :loading="subbmiting"> Save </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script lang="ts" setup>
    import { useDocumentsSetsStore } from '@/stores/documentsSetsStore'
    import { ref } from 'vue'

    const emit = defineEmits(['saved'])
    const documentsSetsStore = useDocumentsSetsStore()
    const subbmiting = ref(false)
    const isDialogOpen = ref(false)
    const isFormValid = ref(false)
    const error = ref(false)
    const form = ref({
        documentsSetCode: '',
        description: '',
    })

    const openDialog = (code: string, description: string): void => {
        form.value.documentsSetCode = code
        form.value.description = description
        isDialogOpen.value = true
    }

    const closeDialog = () => {
        isDialogOpen.value = false
    }

    const update = () => {
        if (isFormValid.value) {
            subbmiting.value = true
            documentsSetsStore
                .updateDocumentsSet(form.value.documentsSetCode, {
                    description: form.value.description,
                })
                .then(() => {
                    emit('saved')
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
