#!/usr/bin/env tsx

import { accessSync, readFileSync, writeFile, writeFileSync } from "fs";
import { Task } from "./task.js";

async function main() {
  const [command, ...args] = process.argv.slice(2);

  if (typeof command != "string") {
    console.error(`Invalid command: ${command}`);
    return;
  }

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
      console.log(tasks);
      break;
    default:
      console.log(`${command} command not supported`);
      break;
  }
}

function addTask(description: string | undefined) {
  if (!description) {
    return;
  }
  let tasks = getTasksFromfile();
  if (tasks == null) return;

  const task = new Task({
    description,
  });
  tasks.push(task);

  const newFile = JSON.stringify(tasks, null, 2);
  writeFileSync("data.json", newFile, {
    encoding: "utf8",
  });
}

function getTasksFromfile() {
  try {
    accessSync("data.json");

    const file = readFileSync("data.json", { encoding: "utf8" });
    return JSON.parse(file) as Task[];
  } catch (error) {
    console.error("File not created or access error.");
  }

  return null;
}

function updateTask(id: string | undefined, description: string | undefined) {
  if (typeof id != "string") {
    return;
  }
  if (typeof description != "string") {
    return;
  }
  const tasks = getTasksFromfile();
  if (tasks == null) return;

  const task = tasks.find((task) => task.id === id);
  if (!task) {
    console.error(`Task with id ${id} not found`);
    return;
  }
  task.description = description;

  const modifiedFile = JSON.stringify(tasks, null, 2);
  writeFileSync("data.json", modifiedFile, {
    encoding: "utf8",
  });
}
function deleteTask(id: string | undefined) {
  if (!id) {
    console.log("Please enter task id to delete");
    return;
  }
  if (typeof id != "string") {
    return;
  }
  const tasks = getTasksFromfile();
  if (tasks == null) return;

  const taskIdx = tasks.findIndex((task) => task.id === id);
  if (taskIdx == -1) {
    console.error(`Taks with id ${id} not found`);
    return;
  }

  tasks.splice(taskIdx, 1);
  const modifiedFile = JSON.stringify(tasks, null, 2);
  writeFileSync("data.json", modifiedFile, {
    encoding: "utf8",
  });
}

function listTasks(): Task[] {
  let tasks: Task[] = [];
  try {
    const file = readFileSync("data.json", { encoding: "utf8" });
    tasks = JSON.parse(file) as Task[];
  } catch (error) {}

  return tasks;
}

main();
