import {api} from "../plugins/axios";
import {ref} from "vue";
import {defineStore} from "pinia";
import {ProjectInterface, ProjectPayloadInterface} from "../interfaces/project.interface";
import {toast} from "../plugins/toast";

export const useProjectsStore = defineStore('projects', () => {
    const data = ref<ProjectInterface[]>([])
    const loading = ref(false)
    const error = ref<string | null>(null)

    async function getAll(filters?: {
        name?: string
        status?: string | boolean | null
        sortBy?: string
    }) {
        loading.value = true
        error.value = null

        try {
            const { data: res } = await api.get('/projects/')
            data.value = [...res]


            if (filters?.sortBy) {
                switch (filters.sortBy) {
                    case 'id':
                        data.value.sort((a, b) => a.id - b.id)
                        break
                    case 'name':
                        data.value.sort((a, b) => a.name.localeCompare(b.name))
                        break
                    case 'tasks_count':
                        data.value.sort((a, b) => a.tasks_count - b.tasks_count)
                        break
                    case 'created_at':
                        data.value.sort((a, b) => Number(a.created_at) - Number(b.created_at))
                        break
                }
            }

            if (filters?.name) {
                data.value = data.value.filter(p =>
                    p.name.toLowerCase().includes(filters.name.toLowerCase())
                )
            }

            if (filters?.status) {
                data.value = data.value.filter(p => p.status === filters.status)
            }

        } catch (e: any) {
            error.value = e.message
        } finally {
            loading.value = false
        }
    }

    async function getById(id: number) {
        const { data } = await api.get(`/projects/${id}`)
        return data
    }

    async function create(payload: ProjectPayloadInterface) {
        try {
            const res = await api.post(`/projects`, payload)
            data.value.push(res.data)
            toast.success("Проєкт створено")
            return res.data
        }
        catch (e: any) {
            error.value = e.message
            console.log(error.value)
            toast.error("Сталася помилка при створенні")
        }
    }

    async function update(id: number, payload: ProjectPayloadInterface) {
        try {
            const { data } = await api.put(`/projects/${id}`, payload)
            toast.success("Проєкт оновлено")
            return data
        } catch (err: any) {
            console.error("Update failed:", err)
            toast.error("Сталася помилка при створенні")
            throw new Error(err?.response?.data?.message || "Не вдалось оновити проєкт")

        }
    }

    async function remove(id:number) {
        toast.success("Проєкт видалено")
        return await api.delete(`/projects/${id}`)
    }

    return {
        data,
        loading,
        error,
        getAll,
        getById,
        create,
        update,
        remove
    }
},)
