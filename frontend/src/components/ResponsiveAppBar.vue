<template>
    <div>
        <v-app-bar color="primary" dark>
            <v-app-bar-nav-icon
                variant="text"
                class="d-md-none"
                @click="toggleDrawer"
            ></v-app-bar-nav-icon>

            <v-app-bar-title><v-icon icon="mdi-forum-outline"></v-icon></v-app-bar-title>

            <div class="d-none d-md-flex">
                <template v-if="authStore.isAuthenticated">
                    <v-btn variant="text" color="white" to="/">Chat</v-btn>
                    <v-btn variant="text" color="white" to="/knowledgebases">Knowledge bases</v-btn>
                    <v-btn variant="text" color="white" @click="logout">Logout</v-btn>
                </template>
                <template v-else>
                    <v-btn variant="text" color="white" to="/login">Login</v-btn>
                    <v-btn variant="text" color="white" to="/register">Register</v-btn>
                </template>
            </div>
        </v-app-bar>

        <v-navigation-drawer v-model="drawer" temporary>
            <v-list>
                <template v-if="authStore.isAuthenticated">
                    <v-list-item @click="logout">
                        <v-list-item-title>Logout</v-list-item-title>
                    </v-list-item>
                </template>
                <template v-else>
                    <v-list-item :to="'/login'" @click="drawer = false">
                        <v-list-item-title>Login</v-list-item-title>
                    </v-list-item>
                    <v-list-item :to="'/register'" @click="drawer = false">
                        <v-list-item-title>Register</v-list-item-title>
                    </v-list-item>
                </template>
            </v-list>
        </v-navigation-drawer>
    </div>
</template>

<script lang="ts" setup>
    import { ref } from 'vue'
    import { useAuthStore } from '../stores/authStore'
    import { useRouter } from 'vue-router'

    const drawer = ref(false)
    const authStore = useAuthStore()
    const router = useRouter()

    const logout = () => {
        authStore.logout()
        router.push('/login')
        drawer.value = false
    }
    const toggleDrawer = () => {
        drawer.value = !drawer.value
    }
</script>

<style scoped></style>
