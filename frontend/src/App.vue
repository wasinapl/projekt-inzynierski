<template>
    <v-app>
        <ResponsiveAppBar />
        <router-view />
    </v-app>
</template>

<script lang="ts" setup>
    import ResponsiveAppBar from './components/ResponsiveAppBar.vue'
    import { useAuthStore } from './store/auth'

    const authStore = useAuthStore()
    authStore.loadFromStorage()
</script>

<style scoped>
    html,
    body,
    #app {
        height: 100%;
        margin: 0;
    }
</style>
