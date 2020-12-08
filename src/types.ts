export interface RequestResult<T> {
    status: 'ok' | 'error'
    message: T
}

export interface RequestGetMessage {
    tasks: TaskItem[]
    total_task_count: string
}

export interface TaskItem {
    id: number
    username: string
    email: string
    text: string
    status: number
    image_path: string
}

export type ColumnName = 'username' | 'email' | 'text' | 'status' | 'image_path' | 'id';

export type OrderedBy = 'id' | 'username' | 'email' | 'status';
export type OrderedDir = 'asc' | 'desc';

export type MessageType = null | 'info' | 'error';

export interface MessageEntity {
    text: string
    type: MessageType
}
