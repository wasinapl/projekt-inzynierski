<template>
    <v-container class="fill-height" fluid>
        <v-row>
            <v-col>
                <h1>Welcome, {{ authStore.user?.email }}!</h1>
                <p>You are logged in. This is your home page.</p>
            </v-col>
        </v-row>
    </v-container>
</template>

<script lang="ts" setup>
    import { useAuthStore } from '../store/auth'
    const authStore = useAuthStore()
</script>
