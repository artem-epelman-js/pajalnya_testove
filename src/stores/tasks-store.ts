import { defineStore } from "pinia"
import { ref } from "vue"
import { api } from "../plugins/axios"
import { TaskInterface, TaskPayloadInterface } from "../interfaces/task.interface"
import { toast } from "../plugins/toast"

export const useTasksStore = defineStore("tasks", () => {
    const data = ref<TaskInterface[]>([])
    const loading = ref(false)
    const error = ref<string | null>(null)

    async function getAll(
        projectId: number,
        filters?: {
            performer?: string | null
            status?: string | null
        }
    ) {
        loading.value = true
        error.value = null

        try {
            const params: any = {}

            if (filters) {
                if (filters.performer) params.performer = filters.performer
                if (filters.status) params.status = filters.status
            }

            const response = await api.get(`/projects/${projectId}/tasks`, { params })
            data.value = response.data
        } catch (err: any) {
            error.value = err?.response?.data?.message || "Не вдалось завантажити задачі"
        } finally {
            loading.value = false
        }
    }

    async function getById(projectId: number, id: number) {
        try {
            const { data } = await api.get(`/projects/${projectId}/tasks/${id}`)
            return data
        } catch (err: any) {
            const msg = err?.response?.data?.message || "Не вдалось завантажити задачу"
            toast.error(msg)
            throw new Error(msg)
        }
    }

    async function create(projectId: number, payload: TaskPayloadInterface) {
        try {
            const res = await api.post(`/projects/${projectId}/tasks`, payload)
            data.value.push(res.data)
            toast.success("Задача створена")
            return res.data
        } catch (err: any) {
            const msg = err?.response?.data?.message || "Не вдалось створити задачу"
            toast.error(msg)
            throw new Error(msg)
        }
    }

    async function update(projectId: number, id: number, payload: Partial<TaskPayloadInterface>) {

        let task = data.value.find(t => t.id === id)
        const fullPayload = { ...task, ...payload }

        try {
            const { data: updatedTask } = await api.put(`/projects/${projectId}/tasks/${id}`, fullPayload)
            toast.info("Задача оновлена")
            return updatedTask
        } catch (err: any) {
            const msg = err?.response?.data?.message || "Не вдалось оновити задачу"
            toast.error(msg)
            throw new Error(msg)
        }
    }

    return {
        data,
        loading,
        error,
        getAll,
        getById,
        create,
        update,
    }
})