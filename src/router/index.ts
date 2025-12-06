import { createRouter, createWebHistory } from 'vue-router'

const routes = [
    {
        path: '/projects/:id',
        name: 'project',
        component: () => import('@/pages/tasks/index.vue')
    },
    {
        path: '/projects',
        alias: '/',
        name: 'projects',
        component: () => import('@/pages/projects/index.vue')
    },
]

export const router = createRouter({
    history: createWebHistory(),
    routes
})
