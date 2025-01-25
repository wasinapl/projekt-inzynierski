<template>
    <v-app>
        <ResponsiveAppBar />
        <div style="padding-top: 64px" class="mt-2 mx-2">
            <router-view />
        </div>
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
