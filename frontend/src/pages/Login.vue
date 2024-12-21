<template>
    <v-container class="fill-height" fluid>
        <v-row align="center" justify="center">
            <v-col cols="12" sm="6" md="4">
                <v-card>
                    <v-card-title>Login</v-card-title>
                    <v-card-text>
                        <v-form @submit.prevent="handleLogin" v-model="isFormValid">
                            <v-text-field
                                label="Email"
                                v-model="email"
                                type="email"
                                required
                                :rules="emailRules"
                            />
                            <v-text-field
                                label="Password"
                                v-model="password"
                                type="password"
                                required
                                :rules="passwordRules"
                            />
                            <v-alert class="mb-1" type="error" v-if="error">{{ error }}</v-alert>
                            <v-btn
                                type="submit"
                                color="primary"
                                block
                                :loading="loading"
                                :disabled="!isFormValid"
                                >Login</v-btn
                            >
                        </v-form>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>
    </v-container>
</template>

<script lang="ts" setup>
    import { ref } from 'vue'
    import { useRouter } from 'vue-router'
    import { useAuthStore } from '../store/auth'
    import { login } from '../services/authService'

    const email = ref('')
    const password = ref('')
    const error = ref('')
    const loading = ref(false)
    const isFormValid = ref(false)
    const authStore = useAuthStore()
    const router = useRouter()

    const emailRules = [
        (v: string) => !!v || 'Email is required',
        (v: string) => /.+@.+\..+/.test(v) || 'Email must be valid',
    ]

    const passwordRules = [
        (v: string) => !!v || 'Password is required',
        (v: string) => v.length >= 8 || 'Password must be at least 8 characters',
    ]
    async function handleLogin() {
        if (!isFormValid.value) return
        loading.value = true
        error.value = ''
        try {
            const data = await login(email.value, password.value)

            authStore.setAuthData(data.access_token)
            router.push('/')
        } catch (err: any) {
            error.value = err.response.data.message || 'Login failed'
        } finally {
            loading.value = false
        }
    }
</script>
