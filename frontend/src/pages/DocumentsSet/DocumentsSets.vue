<template>
    <v-container>
        <v-btn color="primary" @click="openDialog">Create Knowledge base</v-btn>

        <v-data-table-server
            v-model:items-per-page="itemsPerPage"
            :headers="headers"
            :items="documentsSets"
            :items-length="totalItems"
            :loading="loading"
            item-value="name"
            @update:options="loadItems"
            @click:row="onDocumentsSetCLick"
        >
            <template v-slot:item.isPublic="{ item }">
                <v-icon v-if="item.public">mdi-lock-open-variant</v-icon>
                <v-icon v-else>mdi-lock</v-icon>
            </template>
            <template v-slot:item.createdAt="{ item }">
                {{ convertUtcToLocal(item.createdAt) }}
            </template>
        </v-data-table-server>

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
    import type { DocumentsSet } from '@/types/DocumentsSet'
    import type { CreateDocumentsSetDTO } from '@/types/dto/DocumentsSetDTO'
    import { ref, computed } from 'vue'
    import { useRouter } from 'vue-router'
    import { convertUtcToLocal } from '@/utils/date'

    const documentsSetsStore = useDocumentsSetsStore()
    const router = useRouter()

    const documentsSets = computed(() => documentsSetsStore.documentsSets.data)
    const loading = computed(() => documentsSetsStore.documentsSets.loading)
    const totalItems = computed(() => documentsSetsStore.documentsSets.totalItems)
    const isDialogOpen = ref(false)
    const form = ref()
    const form_loading = ref(false)
    const form_error = ref(false)
    const newDocumentsSet = ref<CreateDocumentsSetDTO>({ name: '', description: '', public: false })
    const itemsPerPage = ref(10)

    const headers = [
        { title: 'Name', key: 'name', align: 'start', sortable: true },
        { title: 'Description', key: 'description', sortable: false },
        { title: 'Public', key: 'isPublic', align: 'end', sortable: true },
        { title: 'Create date', key: 'createdAt', align: 'end', sortable: true },
    ]

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
                    documentsSetsStore.fetchDocumentsSets(1, itemsPerPage.value)
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

    const loadItems = async (data: any) => {
        const { page, itemsPerPage, sortBy } = data
        let orderBy = undefined
        let order = undefined
        if (sortBy.length > 0) {
            orderBy = sortBy[0].key
            order = sortBy[0].order
        }
        await documentsSetsStore.fetchDocumentsSets(page, itemsPerPage, orderBy, order)
    }

    const onDocumentsSetCLick = (event: Event, { item }: { item: DocumentsSet }) => {
        router.push({ name: 'KnowledgeBase', params: { code: item.code } })
    }
</script>
<style lang="css" scoped></style>
