import { isTaskStatus, type Task } from "./task.js";

export function parseTaskList(value: unknown, source: string): Task[] {
  if (!Array.isArray(value)) {
    throw new Error(`${source} must contain a JSON array.`);
  }

  return value.map(parseTask);
}

function parseTask(value: unknown): Task {
  if (!isObject(value)) {
    throw new Error("Task data must be an object.");
  }

  const { id, description, status, createdAt, updatedAt } = value;

  if (typeof id !== "string" || !id.trim()) {
    throw new Error("Task id must be a non-empty string.");
  }
  if (typeof description !== "string" || !description.trim()) {
    throw new Error("Task description must be a non-empty string.");
  }
  if (!isTaskStatus(status)) {
    throw new Error("Task status must be todo, in-progress, or done.");
  }
  if (typeof createdAt !== "number") {
    throw new Error("Task createdAt must be a number.");
  }
  if (typeof updatedAt !== "number") {
    throw new Error("Task updatedAt must be a number.");
  }

  return {
    id,
    description: description.trim(),
    status,
    createdAt,
    updatedAt,
  };
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
