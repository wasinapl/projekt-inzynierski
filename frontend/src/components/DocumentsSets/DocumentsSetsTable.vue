<template>
    <v-data-table-server
        v-model:items-per-page="itemsPerPage"
        :headers="headers"
        :items="documentsSets"
        :items-length="totalItems"
        :loading="loading"
        item-value="name"
        :search="props.search"
        @update:options="loadItems"
        @click:row="onDocumentsSetCLick"
    >
        <template v-slot:item.public="{ item }">
            <v-icon v-if="item.public">mdi-lock-open-variant</v-icon>
            <v-icon v-else>mdi-lock</v-icon>
        </template>
        <template v-slot:item.createdAt="{ item }">
            {{ convertUtcToLocal(item.createdAt) }}
        </template>
    </v-data-table-server>
</template>

<script lang="ts" setup>
    import { useDocumentsSetsStore } from '@/stores/documentsSetsStore'
    import { computed, ref } from 'vue'
    import { convertUtcToLocal } from '@/utils/date'
    import { useRouter } from 'vue-router'
    import type { DocumentsSet } from '@/types/DocumentsSet'

    const props = defineProps<{
        search: string
    }>()

    const documentsSetsStore = useDocumentsSetsStore()
    const router = useRouter()
    const itemsPerPage = ref(10)
    const headers = [
        { title: 'Name', key: 'name', align: 'start', sortable: true },
        { title: 'Description', key: 'description', sortable: false },
        { title: 'Public', key: 'public', align: 'end', sortable: true },
        { title: 'Create date', key: 'createdAt', align: 'end', sortable: true },
    ]
    const documentsSets = computed(() => documentsSetsStore.documentsSets.data)
    const loading = computed(() => documentsSetsStore.documentsSets.loading)
    const totalItems = computed(() => documentsSetsStore.documentsSets.totalItems)

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
            false,
            false,
            props.search
        )
    }

    const onDocumentsSetCLick = (event: Event, { item }: { item: DocumentsSet }) => {
        router.push({ name: 'KnowledgeBase', params: { code: item.code } })
    }
</script>
<style lang="css" scoped></style>
