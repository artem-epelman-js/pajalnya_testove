import {Status} from "./task.interface";

export interface ProjectInterface {
    id: number,
    name: string,
    description?: string,
    tasks_count?: number|null,
    status?: Status,
    created_at?: string,
}

export interface ProjectPayloadInterface {
    name: string,
    description: string,
    status: string,
}