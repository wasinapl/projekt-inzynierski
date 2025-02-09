<template>
    <v-dialog v-model="isDialogOpen" max-width="400">
        <v-card>
            <v-card-title>
                <span class="text-h5">Add New File/text</span>
            </v-card-title>

            <v-card-text>
                <v-form @submit.prevent="createDocument" v-model="isFormValid">
                    <v-text-field
                        v-model="form.title"
                        :loading="loading"
                        label="Title"
                        :rules="[(v) => !!v || 'Title is required']"
                        required
                    ></v-text-field>
                    <v-textarea
                        v-model="form.content"
                        label="Content"
                        :loading="loading"
                        :rules="[(v) => !!v || 'Content is required']"
                        required
                        no-resize
                    ></v-textarea>
                </v-form>
            </v-card-text>

            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="blue darken-1" @click="closeDialog" :disabled="subbmiting"
                    >Cancel</v-btn
                >
                <v-btn color="blue darken-1" @click="createDocument" :loading="subbmiting">{{
                    isNew ? 'Add' : 'Save'
                }}</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script lang="ts" setup>
    import { useDocumentsStore } from '@/stores/documents'
    import { ref, computed } from 'vue'

    interface Props {
        documentSetCode: string
    }

    const props = defineProps<Props>()

    const emit = defineEmits(['document-saved'])
    const documentsStore = useDocumentsStore()

    const isNew = computed(() => documentCode.value == 'new')
    const loading = computed(() => documentsStore.document.loading)
    const document = computed(() => documentsStore.document.data)
    const subbmiting = ref(false)
    const isDialogOpen = ref(false)
    const isFormValid = ref(false)
    const error = ref(false)
    const form = ref({
        documentsSetCode: props.documentSetCode,
        title: '',
        content: '',
    })
    const documentCode = ref<string>('')

    const openDialog = (code: string): void => {
        documentCode.value = code
        isDialogOpen.value = true
        loadDocument()
    }

    const closeDialog = () => {
        isDialogOpen.value = false
    }

    const loadDocument = () => {
        if (!isNew.value) {
            documentsStore.fetchDocument(documentCode.value).then(() => {
                loadForm()
            })
        }
    }

    const loadForm = () => {
        form.value = {
            documentsSetCode: props.documentSetCode,
            title: document.value?.title || '',
            content: document.value?.content || '',
        }
    }

    const createDocument = () => {
        if (isFormValid.value) {
            subbmiting.value = true

            if (isNew.value) {
                documentsStore
                    .createDocumentFromText(form.value)
                    .then((res) => {
                        emit('document-saved')
                        closeDialog()
                    })
                    .catch((err) => {
                        error.value = true
                    })
                    .finally(() => {
                        subbmiting.value = false
                    })
            } else {
                documentsStore
                    .updateDocument(documentCode.value, {
                        title: form.value.title,
                        content: form.value.content,
                    })
                    .then((res) => {
                        emit('document-saved')
                        closeDialog()
                    })
                    .catch((err) => {
                        error.value = true
                    })
                    .finally(() => {
                        subbmiting.value = false
                    })
            }
        }
    }

    defineExpose({ openDialog })
</script>
<style lang="css" scoped></style>
