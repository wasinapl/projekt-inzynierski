<template>
    <v-container>
        <v-btn color="primary" @click="openDialog">Create Knowledge base</v-btn>

        <div class="my-4">
            <v-btn-toggle v-model="documentsSetsType" mandatory>
                <v-btn value="my">My Document Sets</v-btn>
                <v-btn value="public">Public Document Sets</v-btn>
            </v-btn-toggle>
        </div>

        <v-text-field
            v-model="search"
            class="ma-2"
            density="compact"
            placeholder="Search name..."
            hide-details
        ></v-text-field>
        <DocumentsSetsTable :search="search" v-if="documentsSetsType == 'my'" />
        <DocumentsSetsPublicTable :search="search" v-else-if="documentsSetsType == 'public'" />

        <v-dialog v-model="isDialogOpen" max-width="400">
            <v-card>
                <v-card-title>
                    <span class="text-h5">Add new knowledge base</span>
                </v-card-title>

                <v-card-text>
                    <v-text-field
                        v-model="newDocumentsSet.name"
                        label="Name"
                        :rules="[(v) => !!v || 'Name is required']"
                        required
                    ></v-text-field>
                </v-card-text>

                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="blue darken-1" @click="closeDialog" :disabled="form_loading"
                        >Cancel</v-btn
                    >
                    <v-btn
                        color="blue darken-1"
                        @click="addDocumentsSet"
                        :form_loading="form_loading"
                        >Add</v-btn
                    >
                </v-card-actions>
            </v-card>
        </v-dialog>
    </v-container>
</template>

<script lang="ts" setup>
    import { useDocumentsSetsStore } from '@/stores/documentsSetsStore'
    import type { CreateDocumentsSetDTO } from '@/types/dto/DocumentsSetDTO'
    import { ref } from 'vue'
    import { useRouter } from 'vue-router'
    import DocumentsSetsTable from '@/components/DocumentsSets/DocumentsSetsTable.vue'
    import DocumentsSetsPublicTable from '@/components/DocumentsSets/DocumentsSetsPublicTable.vue'

    const documentsSetsStore = useDocumentsSetsStore()
    const router = useRouter()

    const isDialogOpen = ref(false)
    const form = ref()
    const form_loading = ref(false)
    const form_error = ref(false)
    const newDocumentsSet = ref<CreateDocumentsSetDTO>({ name: '', description: '', public: false })
    const itemsPerPage = ref(10)
    const search = ref('')
    const documentsSetsType = ref('my')

    const openDialog = () => {
        isDialogOpen.value = true
    }

    const closeDialog = () => {
        isDialogOpen.value = false
        newDocumentsSet.value.name = ''
    }

    const addDocumentsSet = () => {
        if (newDocumentsSet.value.name.trim()) {
            form_loading.value = true
            documentsSetsStore
                .createDocumentsSet(newDocumentsSet.value)
                .then((res) => {
                    router.push(`/knowledgebases/${res.code}`)
                    closeDialog()
                })
                .catch((err) => {
                    form_error.value = true
                })
                .finally(() => {
                    form_loading.value = false
                })
        }
    }
</script>
<style lang="css" scoped></style>
