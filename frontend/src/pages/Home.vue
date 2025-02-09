<template>
    <v-row align="start" justify="center">
        <v-col lg="8" sm="10" xs="12">
            <div class="d-flex">
                <v-btn>Add knowledge base</v-btn>
            </div>
        </v-col>
    </v-row>
</template>

<script lang="ts" setup>
    import { useAuthStore } from '../stores/auth'
    import { useDocumentsSetsStore } from '../stores/documentsSets'
    const authStore = useAuthStore()
    const documentsSetsStore = useDocumentsSetsStore()

    documentsSetsStore.fetchDocumentsSets()
</script>
