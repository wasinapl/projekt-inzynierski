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
    import { useAuthStore } from './store/auth'
    import { io, Socket } from 'socket.io-client'
    import { ref, onMounted } from 'vue'

    const socket = ref<Socket | null>(null)

    onMounted(() => {
        socket.value = io('http://localhost:3000/documents')

        socket.value.on('connect', () => {
            console.log('Connected to server:', socket.value?.id)
        })
    })

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
