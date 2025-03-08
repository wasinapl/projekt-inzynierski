<template>
    <v-data-table-server
        v-model:items-per-page="itemsPerPage"
        :headers="headers"
        :items="documentsSets"
        :items-length="totalItems"
        :loading="loading"
        item-value="name"
        :search="props.search"
        @update:options="onOptionsUpdate"
    >
        <template v-slot:item.createdAt="{ item }">
            {{ convertUtcToLocal(item.createdAt) }}
        </template>
        <template v-slot:item.actions="{ item }">
            <v-btn v-if="!item.isImported" color="primary" @click="importSet(item.code)"
                >import</v-btn
            >
            <v-btn v-else color="error" @click="removeImportSet(item.code)">remove</v-btn>
        </template>
        <template v-slot:tfoot>
            <tr>
                <td colspan="2">
                    <v-checkbox label="Imported only" v-model="importedOnly"></v-checkbox>
                </td>
            </tr>
        </template>
    </v-data-table-server>
</template>

<script lang="ts" setup>
    import { useDocumentsSetsStore } from '@/stores/documentsSetsStore'
    import { computed, ref, watch } from 'vue'
    import { convertUtcToLocal } from '@/utils/date'
    import { useRouter } from 'vue-router'

    const props = defineProps<{
        search: string
    }>()

    const documentsSetsStore = useDocumentsSetsStore()
    const router = useRouter()
    const itemsPerPage = ref(10)
    const importedOnly = ref<boolean>(false)
    const headers = [
        { title: 'Name', key: 'name', align: 'start', sortable: true },
        { title: 'Description', key: 'description', sortable: false },
        { title: 'Create date', key: 'createdAt', align: 'end', sortable: true },
        { title: 'Actions', key: 'actions', align: 'end', sortable: false },
    ]
    const documentsSets = computed(() => documentsSetsStore.documentsSets.data)
    const loading = computed(() => documentsSetsStore.documentsSets.loading)
    const totalItems = computed(() => documentsSetsStore.documentsSets.totalItems)

    const currentOptions = ref({
        page: 1,
        itemsPerPage: itemsPerPage.value,
        sortBy: [] as Array<{ key: string; order: string }>,
    })

    const onOptionsUpdate = (options: any) => {
        currentOptions.value = options
        loadItems(options)
    }

    const loadItems = async (data: any) => {
        const { page, itemsPerPage, sortBy } = data
        let orderBy = undefined
        let order = undefined
        if (sortBy.length > 0) {
            orderBy = sortBy[0].key
            order = sortBy[0].order
        }
        await documentsSetsStore.fetchDocumentsSets(
            page,
            itemsPerPage,
            orderBy,
            order,
            true,
            importedOnly.value,
            props.search
        )
    }

    const importSet = async (code: string) => {
        try {
            await documentsSetsStore.importDocumentsSet(code)
            await loadItems(currentOptions.value)
        } catch (error) {
            console.error('Error importing documents set:', error)
        }
    }

    const removeImportSet = async (code: string) => {
        try {
            await documentsSetsStore.removeImportDocumentsSet(code)
            await loadItems(currentOptions.value)
        } catch (error) {
            console.error('Error removing documents set:', error)
        }
    }

    watch(importedOnly, () => {
        currentOptions.value.page = 1
        loadItems(currentOptions.value)
    })
</script>
<style lang="css" scoped></style>
