#!/usr/bin/env tsx

import { mkdirSync, readFileSync, writeFileSync } from "fs";
import { homedir } from "os";
import { dirname, join, resolve } from "path";
import { Task } from "./task.js";

const DATA_FILE = process.env.TODO_CLI_DATA_FILE
  ? resolve(process.env.TODO_CLI_DATA_FILE)
  : join(homedir(), ".todo-cli", "data.json");

type TaskStatus = Task["status"];

function main() {
  const cliArgs = process.argv.slice(2);
  if (cliArgs[0] === "--") {
    cliArgs.shift();
  }
  const [command, ...args] = cliArgs;

  if (typeof command != "string") {
    printUsage();
    process.exitCode = 1;
    return;
  }

  try {
    switch (command) {
      case "add":
        addTask(args[0]);
        break;
      case "update":
        updateTask(args[0], args[1]);
        break;
      case "delete":
        deleteTask(args[0]);
        break;
      case "list":
        const tasks = listTasks();
        printTasks(tasks);
        break;
      default:
        console.error(`${command} command not supported`);
        printUsage();
        process.exitCode = 1;
        break;
    }
  } catch (error) {
    console.error(error instanceof Error ? error.message : "Unexpected error.");
    process.exitCode = 1;
  }
}

function addTask(description: string | undefined) {
  if (!description?.trim()) {
    console.error("Please enter a task description.");
    process.exitCode = 1;
    return;
  }
  const tasks = readTasks();

  const task = new Task({
    description: description.trim(),
  });
  tasks.push(task);

  writeTasks(tasks);
  console.log(`Added task ${task.id}`);
}

function readTasks(): Task[] {
  try {
    const file = readFileSync(DATA_FILE, { encoding: "utf8" });
    const parsed: unknown = JSON.parse(file);

    if (!Array.isArray(parsed)) {
      throw new Error(`${DATA_FILE} must contain a JSON array.`);
    }

    return parsed.map(toTask);
  } catch (error) {
    if (isNodeError(error) && error.code === "ENOENT") {
      return [];
    }

    throw error;
  }
}

function writeTasks(tasks: Task[]) {
  mkdirSync(dirname(DATA_FILE), { recursive: true });
  writeFileSync(DATA_FILE, JSON.stringify(tasks, null, 2), {
    encoding: "utf8",
  });
}

function toTask(value: unknown): Task {
  if (!isObject(value)) {
    throw new Error("Task data must be an object.");
  }

  const description = value.description;
  if (typeof description !== "string" || !description.trim()) {
    throw new Error("Task description must be a non-empty string.");
  }

  const taskOptions: Partial<Task> = {
    description: description.trim(),
  };

  if (typeof value.id === "string") {
    taskOptions.id = value.id;
  }
  if (isTaskStatus(value.status)) {
    taskOptions.status = value.status;
  }
  if (typeof value.createdAt === "number") {
    taskOptions.createdAt = value.createdAt;
  }
  if (typeof value.updatedAt === "number") {
    taskOptions.updatedAt = value.updatedAt;
  }

  return new Task(taskOptions);
}

function updateTask(id: string | undefined, description: string | undefined) {
  if (!id?.trim()) {
    console.error("Please enter task id to update.");
    process.exitCode = 1;
    return;
  }
  if (!description?.trim()) {
    console.error("Please enter a new task description.");
    process.exitCode = 1;
    return;
  }
  const tasks = readTasks();

  const task = tasks.find((task) => task.id === id);
  if (!task) {
    console.error(`Task with id ${id} not found`);
    process.exitCode = 1;
    return;
  }
  task.description = description.trim();
  task.updatedAt = Date.now();

  writeTasks(tasks);
  console.log(`Updated task ${task.id}`);
}
function deleteTask(id: string | undefined) {
  if (!id?.trim()) {
    console.error("Please enter task id to delete.");
    process.exitCode = 1;
    return;
  }
  const tasks = readTasks();

  const taskIdx = tasks.findIndex((task) => task.id === id);
  if (taskIdx == -1) {
    console.error(`Task with id ${id} not found`);
    process.exitCode = 1;
    return;
  }

  tasks.splice(taskIdx, 1);
  writeTasks(tasks);
  console.log(`Deleted task ${id}`);
}

function listTasks(): Task[] {
  return readTasks();
}

function printTasks(tasks: Task[]) {
  if (tasks.length === 0) {
    console.log("No tasks found.");
    return;
  }

  console.table(
    tasks.map((task) => ({
      id: task.id,
      status: task.status,
      description: task.description,
      createdAt: new Date(task.createdAt).toLocaleString(),
      updatedAt: new Date(task.updatedAt).toLocaleString(),
    })),
  );
}

function printUsage() {
  console.log(`Usage:
  todo-cli add "Buy milk"
  todo-cli update <id> "Buy oat milk"
  todo-cli delete <id>
  todo-cli list`);
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isTaskStatus(value: unknown): value is TaskStatus {
  return value === "todo" || value === "in-progress" || value === "done";
}

function isNodeError(error: unknown): error is NodeJS.ErrnoException {
  return error instanceof Error && "code" in error;
}

main();
