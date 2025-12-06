export interface TaskInterface {
    id: number;
    projectId: number;
    name: string;
    performer: string,
    status: Status,
    deadline: string,
}

export interface TaskPayloadInterface {
    name?:string,
    performer?: string,
    projectId?: number,
    status?: Status,
    deadline?: string,
}

export enum Status {
    To_do = "To do",
    In_progress = "In Progress",
    Done = "Done"
}

