<template>
    <v-container> 
        {{ documentsSet?.name }}
    </v-container>
</template>

<script lang="ts" setup>
    import { useDocumentsSetsStore } from '@/store/documentsSets'
    import { ref, computed } from 'vue'
    import { useRoute } from 'vue-router'
    const documentsSetsStore = useDocumentsSetsStore()

    const route = useRoute()
    const code = ref<string>(
        Array.isArray(route.params.code) ? route.params.code[0] : route.params.code || ''
    )
    documentsSetsStore.fetchDocumentsSet(code.value)

    const documentsSet = computed(() => documentsSetsStore.documentsSet.data)
    const loading = computed(() => documentsSetsStore.documentsSet.loading)
</script>
<style lang="css" scoped></style>
