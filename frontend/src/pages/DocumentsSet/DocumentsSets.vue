<template>
    <v-container>
        <v-btn color="primary" @click="openDialog">Add New Knowledgebase</v-btn>

        <v-list>
            <template v-if="loading">
                <v-list-item v-for="n in 5" :key="'skeleton-' + n" class="clickable">
                    <v-skeleton-loader type="text" :width="200" class="mb-2"></v-skeleton-loader>
                </v-list-item>
            </template>

            <template v-else-if="documentsSets.length == 0">
                <v-list-item>
                    <v-list-item-title>No knowledgebases found.</v-list-item-title>
                </v-list-item>
            </template>

            <template v-else>
                <v-list-item
                    v-for="documentsSet in documentsSets"
                    :key="documentsSet.code"
                    class="clickable"
                    @click="onDocumentsSetCLick(documentsSet.code)"
                >
                    <v-list-item-title>{{ documentsSet.name }}</v-list-item-title>
                </v-list-item>
            </template>
        </v-list>

        <v-dialog v-model="isDialogOpen" max-width="400">
            <v-card>
                <v-card-title>
                    <span class="text-h5">Add New KnowledgeBase</span>
                </v-card-title>

                <v-card-text>
                    <v-form ref="form" @submit.prevent="addDocumentsSet">
                        <v-text-field
                            v-model="newDocumentsSet.name"
                            label="Name"
                            :rules="[(v) => !!v || 'Item name is required']"
                            required
                        ></v-text-field>
                    </v-form>
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
    import { useDocumentsSetsStore } from '@/stores/documentsSets'
    import type { CreateDocumentsSetDTO } from '@/types/dto/DocumentsSetDTO'
    import { ref, computed } from 'vue'
    import { useRouter } from 'vue-router'
    const documentsSetsStore = useDocumentsSetsStore()
    const router = useRouter()

    documentsSetsStore.fetchDocumentsSets()

    const documentsSets = computed(() => documentsSetsStore.documentsSets.data)
    const loading = computed(() => documentsSetsStore.documentsSets.loading)
    const isDialogOpen = ref(false)
    const form = ref()
    const form_loading = ref(false)
    const form_error = ref(false)
    const newDocumentsSet = ref<CreateDocumentsSetDTO>({ name: '' })

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
                    documentsSetsStore.fetchDocumentsSets()
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

    const onDocumentsSetCLick = (code: string) => {
        router.push({ name: 'KnowledgeBase', params: { code: code } })
    }
</script>
<style lang="css" scoped>
    .clickable {
        cursor: pointer;
    }

    .clickable:hover {
        background-color: rgba(0, 0, 0, 0.04);
    }
</style>
