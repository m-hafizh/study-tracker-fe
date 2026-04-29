export type Tasks = {
    id: string;
    projectId: string;
    title: string;
    description: string;
    assigneeId: string;
    statusId: string;
    statusName: string; 
    statusTitle: string;
    priority: string;
    createdAt: string;
    updatedAt: string;
    dueDate: string;
}

export type Status = {
    id: string;
    name: string;
    title: string;
    color: string;
}