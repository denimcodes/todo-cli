import { createTask, isTaskStatus, type Task, type TaskStatus } from "./task.js";
import type { TaskRepository } from "./task-repository.js";

type Result<T> = { ok: true; value: T } | { ok: false; error: string };

export type TaskService = {
  add(description: string | undefined): Result<Task>;
  updateDescription(id: string | undefined, description: string | undefined): Result<Task>;
  delete(id: string | undefined): Result<string>;
  list(status: string | undefined): Result<Task[]>;
  updateStatus(id: string | undefined, status: TaskStatus): Result<Task>;
};

export function createTaskService(repository: TaskRepository): TaskService {
  return {
    add(description) {
      const trimmedDescription = description?.trim();
      if (!trimmedDescription) {
        return failure("Please enter a task description.");
      }

      const tasks = repository.read();
      const task = createTask({ description: trimmedDescription });

      repository.write([...tasks, task]);
      return success(task);
    },

    updateDescription(id, description) {
      const taskId = id?.trim();
      const trimmedDescription = description?.trim();

      if (!taskId) {
        return failure("Please enter task id to update.");
      }
      if (!trimmedDescription) {
        return failure("Please enter a new task description.");
      }

      return updateTask(repository, taskId, (task, now) => ({
        ...task,
        description: trimmedDescription,
        updatedAt: now,
      }));
    },

    delete(id) {
      const taskId = id?.trim();
      if (!taskId) {
        return failure("Please enter task id to delete.");
      }

      const tasks = repository.read();
      const remainingTasks = tasks.filter((task) => task.id !== taskId);

      if (remainingTasks.length === tasks.length) {
        return failure(`Task with id ${taskId} not found`);
      }

      repository.write(remainingTasks);
      return success(taskId);
    },

    list(status) {
      if (!status) {
        return success(repository.read());
      }
      if (!isTaskStatus(status)) {
        return failure(`Invalid status ${status}`);
      }

      return success(repository.read().filter((task) => task.status === status));
    },

    updateStatus(id, status) {
      const taskId = id?.trim();
      if (!taskId) {
        return failure(`Please enter task id to mark as ${status}.`);
      }

      return updateTask(repository, taskId, (task, now) => ({
        ...task,
        status,
        updatedAt: now,
      }));
    },
  };
}

function updateTask(
  repository: TaskRepository,
  id: string,
  update: (task: Task, now: number) => Task,
): Result<Task> {
  const tasks = repository.read();
  const taskIndex = tasks.findIndex((task) => task.id === id);

  if (taskIndex === -1) {
    return failure(`Task with id ${id} not found`);
  }

  const task = tasks[taskIndex];
  if (!task) {
    return failure(`Task with id ${id} not found`);
  }

  const updatedTask = update(task, Date.now());
  const updatedTasks = [...tasks];
  updatedTasks[taskIndex] = updatedTask;

  repository.write(updatedTasks);
  return success(updatedTask);
}

function success<T>(value: T): Result<T> {
  return { ok: true, value };
}

function failure<T>(error: string): Result<T> {
  return { ok: false, error };
}
