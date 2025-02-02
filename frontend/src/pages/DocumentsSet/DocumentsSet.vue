<template>
    <v-container>
        {{ documentsSet?.name }}
        <div>
            <v-btn color="primary" @click="openDialog('new')"> Add New File/Text </v-btn>
            <div class="d-flex flex-wrap">
                <v-card
                    class="ma-2"
                    v-for="document in documentsSet?.documents"
                    :key="document.code"
                >
                    <template v-slot:title>
                        <v-icon icon="mdi-text-box-outline" size="small"></v-icon>
                        {{ document.title }}
                        <v-chip :color="getStatusColor(document.status)" dark small class="ml-2">
                            {{ document.status }}
                        </v-chip>
                    </template>

                    <template v-slot:subtitle></template>

                    <template v-slot:actions>
                        <v-btn color="primary" @click="openDialog(document.code)"> Edit </v-btn>
                        <v-btn color="error" @click="openDeleteDialog(document.code)">
                            Delete
                        </v-btn>
                    </template>
                </v-card>
            </div>
        </div>

        <CreateDocument
            ref="documentDialog"
            :document-set-code="code"
            @document-saved="loadDocumentsSet"
        />
        <DeleteDocument ref="deleteDocumentDialog" @document-deleted="loadDocumentsSet" />
    </v-container>
</template>

<script lang="ts" setup>
    import { useDocumentsSetsStore } from '@/store/documentsSets'
    import { ref, computed } from 'vue'
    import { useRoute } from 'vue-router'
    import CreateDocument from '@/components/CreateDocument.vue'
    import DeleteDocument from '@/components/DeleteDocument.vue'

    const documentsSetsStore = useDocumentsSetsStore()

    const route = useRoute()
    const code = ref<string>(
        Array.isArray(route.params.code) ? route.params.code[0] : route.params.code || ''
    )
    const documentDialog = ref<{ openDialog: (code: string) => void } | null>(null)
    const deleteDocumentDialog = ref<{ openDialog: (code: string) => void } | null>(null)

    const documentsSet = computed(() => documentsSetsStore.documentsSet.data)
    const loading = computed(() => documentsSetsStore.documentsSet.loading)

    const loadDocumentsSet = () => {
        documentsSetsStore.fetchDocumentsSet(code.value)
    }
    const openDialog = (docCode: string) => {
        documentDialog.value?.openDialog(docCode)
    }
    const openDeleteDialog = (docCode: string) => {
        deleteDocumentDialog.value?.openDialog(docCode)
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

    loadDocumentsSet()
</script>
