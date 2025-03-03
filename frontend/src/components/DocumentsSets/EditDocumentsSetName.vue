<template>
    <v-dialog v-model="isDialogOpen" max-width="300">
        <v-card>
            <v-card-title>
                <span class="text-h5">Change name</span>
            </v-card-title>

            <v-card-text>
                <v-form @submit.prevent="updateName" v-model="isFormValid">
                    <v-text-field
                        v-model="form.name"
                        label="Name"
                        :rules="[(v) => !!v || 'Name is required']"
                        required
                    ></v-text-field>
                </v-form>
            </v-card-text>

            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="blue darken-1" @click="closeDialog" :disabled="subbmiting"
                    >Cancel</v-btn
                >
                <v-btn color="blue darken-1" @click="updateName" :loading="subbmiting">
                    Save
                </v-btn>
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
        name: '',
    })

    const openDialog = (code: string, name: string): void => {
        form.value.documentsSetCode = code
        form.value.name = name
        isDialogOpen.value = true
    }

    const closeDialog = () => {
        isDialogOpen.value = false
    }

    const updateName = () => {
        if (isFormValid.value) {
            subbmiting.value = true
            documentsSetsStore
                .updateDocumentsSet(form.value.documentsSetCode, {
                    name: form.value.name,
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
