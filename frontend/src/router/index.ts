import { createRouter, createWebHistory } from 'vue-router'
import Home from '../pages/Home.vue'
import { useAuthStore } from '../stores/auth'

const router = createRouter({
    history: createWebHistory(),
    routes: [
        { path: '/login', name: 'Login', component: () => import('../pages/Login.vue') },
        { path: '/register', name: 'Register', component: () => import('../pages/Register.vue') },
        {
            path: '/',
            name: 'Home',
            component: Home,
            meta: { requiresAuth: true },
        },
        {
            path: '/knowledgebases',
            name: 'KnowledgeBases',
            component: () => import('../pages/DocumentsSet/DocumentsSets.vue'),
            meta: { requiresAuth: true },
        },

        {
            path: '/knowledgebases/:code',
            name: 'KnowledgeBase',
            component: () => import('../pages/DocumentsSet/DocumentsSet.vue'),
            meta: { requiresAuth: true },
        },
    ],
})

router.beforeEach((to, from, next) => {
    const authStore = useAuthStore()

    if (to.meta.requiresAuth && !authStore.isAuthenticated) {
        next({ name: 'Login' })
    } else {
        next()
    }
})

export default router
