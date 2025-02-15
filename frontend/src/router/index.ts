import { createRouter, createWebHistory } from 'vue-router'
import Chat from '../pages/Chat.vue'
import { useAuthStore } from '../stores/authStore'

const router = createRouter({
    history: createWebHistory(),
    routes: [
        { path: '/', redirect: '/thread/new' },
        { path: '/thread', redirect: '/thread/new' },
        { path: '/login', name: 'Login', component: () => import('../pages/Login.vue') },
        { path: '/register', name: 'Register', component: () => import('../pages/Register.vue') },
        {
            path: '/thread/:code',
            name: 'Chat',
            component: Chat,
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
