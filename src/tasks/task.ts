import { randomUUID } from "crypto";

export const TASK_STATUSES = ["todo", "in-progress", "done"] as const;

export type TaskStatus = (typeof TASK_STATUSES)[number];

export type Task = {
  id: string;
  description: string;
  status: TaskStatus;
  createdAt: number;
  updatedAt: number;
};

type CreateTaskOptions = {
  description: string;
  now?: number;
};

export function createTask({ description, now = Date.now() }: CreateTaskOptions): Task {
  return {
    id: randomUUID(),
    description,
    status: "todo",
    createdAt: now,
    updatedAt: now,
  };
}

export function isTaskStatus(value: unknown): value is TaskStatus {
  return TASK_STATUSES.includes(value as TaskStatus);
}
