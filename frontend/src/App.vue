<template>
    <v-app>
        <ResponsiveAppBar />
        <div style="padding-top: 64px" class="mt-2 mx-2">
            <v-container>
                <v-row justify="center">
                    <v-col xs="12" sm="10" md="8" xl="6">
                        <router-view />
                    </v-col>
                </v-row>
            </v-container>
        </div>
    </v-app>
</template>

<script lang="ts" setup>
    import ResponsiveAppBar from './components/ResponsiveAppBar.vue'
    import { useAuthStore } from './stores/authStore'
    import { useRouter } from 'vue-router'

    const authStore = useAuthStore()
    const router = useRouter()
    authStore.load().catch((err) => {
        authStore.logout()
        router.push('Login')
    })
</script>

<style scoped>
    html,
    body,
    #app {
        height: 100%;
        margin: 0;
    }
</style>
