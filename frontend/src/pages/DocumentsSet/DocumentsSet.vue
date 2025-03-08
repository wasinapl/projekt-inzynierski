<template>
    <v-container>
        <div class="d-flex align-center">
            <h1>{{ documentsSet?.name }}</h1>
            <v-btn
                class="ml-2"
                density="compact"
                variant="text"
                icon="mdi-pencil"
                @click="openEditNameDialog"
            ></v-btn>
            <v-btn class="ml-2" variant="text" color="error" @click="openDeleteDialog"
                >delete</v-btn
            >
        </div>
        <v-switch v-model="isPublic" label="Is Public" color="primary"></v-switch>
        <div class="d-flex align-center">
            <h3>Description</h3>
            <v-btn
                class="ml-2"
                density="compact"
                variant="text"
                icon="mdi-pencil"
                @click="openEditDescriptionDialog"
            ></v-btn>
        </div>
        <div v-if="documentsSet?.description">{{ documentsSet?.description }}</div>
        <div v-else="documentsSet?.description">No description</div>
        <div>
            <div class="d-flex align-center">
                <h3>Files/Texts</h3>
                <v-btn color="primary" class="ma-2" @click="openTextDialog('new')">
                    Add New Text
                </v-btn>
                <v-btn color="primary" class="ma-2" @click="openFileDialog()"> Add New File </v-btn>
            </div>
            <div
                v-if="documentsSet && documentsSet?.documents.length == 0"
                class="d-flex align-center my-4"
            >
                <div>There is no texts/files</div>
            </div>
            <div class="d-flex flex-wrap">
                <DocumentListItem
                    class="ma-2"
                    v-for="document in documentsSet?.documents"
                    :key="document.code"
                    :document="document"
                    @on-delete-click="openDeleteDocumentDialog(document.code)"
                    @on-edit-click="openTextDialog(document.code)"
                />
            </div>
        </div>
        <div>
            <div class="d-flex align-center">
                <h3>Last threads</h3>
                <v-btn class="ml-2" color="primary" @click="createNewThread"> New </v-btn>
            </div>
            <v-list>
                <template v-if="loading">
                    <v-list-item v-for="n in 5" :key="'skeleton-' + n" class="clickable">
                        <v-skeleton-loader
                            type="text"
                            :width="200"
                            class="mb-2"
                        ></v-skeleton-loader>
                    </v-list-item>
                </template>

                <template v-else-if="!threads || threads.length == 0">
                    <div>No threads found.</div>
                </template>

                <template v-else>
                    <v-list two-line>
                        <v-list-item
                            v-for="thread in threads"
                            :key="thread.code"
                            @click="onThreadCLick(thread.code)"
                            class="clickable"
                        >
                            <v-list-item-content>
                                <v-list-item-title>
                                    {{ thread.messages[0].content }}
                                </v-list-item-title>
                            </v-list-item-content>
                        </v-list-item>
                    </v-list>
                </template>
            </v-list>
        </div>

        <CreateTextDocument
            ref="documentTextDialog"
            :document-set-code="code"
            @document-saved="loadDocumentsSet"
        />
        <CreateFileDocument
            ref="documentFileDialog"
            :document-set-code="code"
            @document-saved="loadDocumentsSet"
        />
        <DeleteDocumentsSet ref="deleteDialog" @deleted="goToList" />
        <DeleteDocument ref="deleteDocumentDialog" @document-deleted="loadDocumentsSet" />
        <EditDocumentsSetName ref="editDocumentsSetName" @saved="loadDocumentsSet" />
        <EditDocumentsSetDescription ref="editDocumentsSetDescription" @saved="loadDocumentsSet" />
    </v-container>
</template>

<script lang="ts" setup>
    import { useDocumentsSetsStore } from '@/stores/documentsSetsStore'
    import { ref, computed, watch } from 'vue'
    import { useRoute, useRouter } from 'vue-router'
    import CreateTextDocument from '@/components/Documents/CreateTextDocument.vue'
    import CreateFileDocument from '@/components/Documents/CreateFileDocument.vue'
    import DeleteDocumentsSet from '@/components/DocumentsSets/DeleteDocumentsSet.vue'
    import DeleteDocument from '@/components/Documents/DeleteDocument.vue'
    import EditDocumentsSetName from '@/components/DocumentsSets/EditDocumentsSetName.vue'
    import EditDocumentsSetDescription from '@/components/DocumentsSets/EditDocumentsSetDescription.vue'
    import DocumentListItem from '@/components/Documents/DocumentListItem.vue'

    const documentsSetsStore = useDocumentsSetsStore()

    const route = useRoute()
    const router = useRouter()
    const code = ref<string>(
        Array.isArray(route.params.code) ? route.params.code[0] : route.params.code || ''
    )
    const documentTextDialog = ref<{ openDialog: (code: string) => void } | null>(null)
    const documentFileDialog = ref<{ openDialog: () => void } | null>(null)
    const deleteDialog = ref<{ openDialog: (code: string) => void } | null>(null)
    const deleteDocumentDialog = ref<{ openDialog: (code: string) => void } | null>(null)
    const editDocumentsSetName = ref<{ openDialog: (code: string, name: string) => void } | null>(
        null
    )
    const editDocumentsSetDescription = ref<{
        openDialog: (code: string, description: string) => void
    } | null>(null)

    const documentsSet = computed(() => documentsSetsStore.documentsSet.data)
    const threads = computed(() => documentsSet.value?.ChatThreads)
    const loading = computed(() => documentsSetsStore.documentsSet.loading)

    const isPublic = ref(false)

    const loadDocumentsSet = async () => {
        await documentsSetsStore.fetchDocumentsSet(code.value)
        isPublic.value = !!documentsSet.value?.public
    }
    const openTextDialog = (docCode: string) => {
        documentTextDialog.value?.openDialog(docCode)
    }
    const openFileDialog = () => {
        documentFileDialog.value?.openDialog()
    }
    const openDeleteDocumentDialog = (docCode: string) => {
        deleteDocumentDialog.value?.openDialog(docCode)
    }
    const openDeleteDialog = () => {
        deleteDialog.value?.openDialog(code.value)
    }
    const openEditNameDialog = () => {
        if (documentsSet.value?.code && documentsSet.value?.name)
            editDocumentsSetName.value?.openDialog(
                documentsSet.value?.code,
                documentsSet.value?.name
            )
    }

    const openEditDescriptionDialog = () => {
        if (documentsSet.value?.code)
            editDocumentsSetDescription.value?.openDialog(
                documentsSet.value?.code,
                documentsSet.value?.description || ''
            )
    }

    const createNewThread = () => {
        router.push({ name: 'Chat', params: { code: 'new' }, query: { documentsSet: code.value } })
    }

    const onThreadCLick = (threadCode: string) => {
        router.push({ name: 'Chat', params: { code: threadCode } })
    }

    const goToList = () => {
        router.push({ name: 'KnowledgeBases' })
    }

    watch(isPublic, (newVal) => {
        documentsSetsStore.updateDocumentsSet(code.value, { public: newVal })
    })

    loadDocumentsSet()
</script>
