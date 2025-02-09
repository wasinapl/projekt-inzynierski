<template>
    <v-container class="fill-height" fluid>
        <v-row align="center" justify="center">
            <v-col cols="12" sm="6" md="4">
                <v-card>
                    <v-card-title>Register</v-card-title>
                    <v-card-text>
                        <v-form @submit.prevent="handleRegister" v-model="isFormValid">
                            <v-text-field
                                label="Name"
                                v-model="name"
                                type="text"
                                :rules="nameRules"
                                required
                            />
                            <v-text-field
                                label="Email"
                                v-model="email"
                                type="email"
                                :rules="emailRules"
                                required
                            />
                            <v-text-field
                                label="Password"
                                v-model="password"
                                type="password"
                                required
                                :rules="passwordRules"
                            />
                            <v-alert type="error" v-if="error">{{ error }}</v-alert>
                            <v-btn
                                type="submit"
                                color="primary"
                                block
                                :loading="loading"
                                :disabled="!isFormValid"
                                >Register</v-btn
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
    import { useAuthStore } from '../stores/auth'
    import { register } from '../services/authService'

    const name = ref('')
    const email = ref('')
    const password = ref('')
    const error = ref('')
    const loading = ref(false)
    const authStore = useAuthStore()
    const router = useRouter()
    const isFormValid = ref(false)

    const emailRules = [
        (v: string) => !!v || 'Email is required',
        (v: string) => /.+@.+\..+/.test(v) || 'Email must be valid',
    ]

    const passwordRules = [
        (v: string) => !!v || 'Password is required',
        (v: string) => v.length >= 8 || 'Password must be at least 8 characters',
    ]

    const nameRules = [
        (v: string) => !!v || 'Name is required',
        (v: string) => v.length >= 4 || 'Name must be at least 4 characters',
    ]

    async function handleRegister() {
        loading.value = true
        error.value = ''
        try {
            const data = await register(name.value, email.value, password.value)
            authStore.setAuthData(data.access_token)
            router.push('/knowledgbases')
        } catch (err: any) {
            error.value = err.response.data.message || 'Registration failed'
        } finally {
            loading.value = false
        }
    }
</script>
