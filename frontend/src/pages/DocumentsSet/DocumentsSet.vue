<template>
    <v-container>
        {{ documentsSet?.name }}
        <div>
            <v-btn color="primary" class="ma-2" @click="openTextDialog('new')">
                Add New Text
            </v-btn>
            <v-btn color="primary" class="ma-2" @click="openFileDialog()"> Add New File </v-btn>
            <div class="d-flex flex-wrap">
                <DocumentListItem
                    class="ma-2"
                    v-for="document in documentsSet?.documents"
                    :key="document.code"
                    :document="document"
                    @on-delete-click="openDeleteDialog(document.code)"
                    @on-edit-click="openTextDialog(document.code)"
                />
            </div>
        </div>
        <div>
            <div class="d-flex">
                <div>Threads</div>
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
                    <v-list-item>
                        <v-list-item-title>No threads found.</v-list-item-title>
                    </v-list-item>
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
        <DeleteDocument ref="deleteDocumentDialog" @document-deleted="loadDocumentsSet" />
    </v-container>
</template>

<script lang="ts" setup>
    import { useDocumentsSetsStore } from '@/stores/documentsSetsStore'
    import { ref, computed } from 'vue'
    import { useRoute, useRouter } from 'vue-router'
    import CreateTextDocument from '@/components/Documents/CreateTextDocument.vue'
    import CreateFileDocument from '@/components/Documents/CreateFileDocument.vue'
    import DeleteDocument from '@/components/Documents/DeleteDocument.vue'
    import DocumentListItem from '@/components/Documents/DocumentListItem.vue'

    const documentsSetsStore = useDocumentsSetsStore()

    const route = useRoute()
    const router = useRouter()
    const code = ref<string>(
        Array.isArray(route.params.code) ? route.params.code[0] : route.params.code || ''
    )
    const documentTextDialog = ref<{ openDialog: (code: string) => void } | null>(null)
    const documentFileDialog = ref<{ openDialog: () => void } | null>(null)
    const deleteDocumentDialog = ref<{ openDialog: (code: string) => void } | null>(null)

    const documentsSet = computed(() => documentsSetsStore.documentsSet.data)
    const threads = computed(() => documentsSet.value?.ChatThreads)
    const loading = computed(() => documentsSetsStore.documentsSet.loading)

    const loadDocumentsSet = () => {
        documentsSetsStore.fetchDocumentsSet(code.value)
    }
    const openTextDialog = (docCode: string) => {
        documentTextDialog.value?.openDialog(docCode)
    }
    const openFileDialog = () => {
        documentFileDialog.value?.openDialog()
    }
    const openDeleteDialog = (docCode: string) => {
        deleteDocumentDialog.value?.openDialog(docCode)
    }

    const createNewThread = () => {
        router.push({ name: 'Chat', params: { code: 'new' }, query: { documentsSet: code.value } })
    }

    const deleteThread = (threadCode: string) => {
        documentsSetsStore.deleteThread(code.value, threadCode)
    }

    const onThreadCLick = (threadCode: string) => {
        router.push({ name: 'Chat', params: { code: threadCode } })
    }

    loadDocumentsSet()
</script>
