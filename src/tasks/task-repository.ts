import { mkdirSync, readFileSync, writeFileSync } from "fs";
import { homedir } from "os";
import { dirname, join, resolve } from "path";
import { parseTaskList } from "./task-schema.js";
import type { Task } from "./task.js";

const DEFAULT_DATA_FILE = join(homedir(), ".todo-cli", "data.json");

export type TaskRepository = {
  read(): Task[];
  write(tasks: Task[]): void;
};

export function createJsonTaskRepository(
  dataFile = process.env.TODO_CLI_DATA_FILE
    ? resolve(process.env.TODO_CLI_DATA_FILE)
    : DEFAULT_DATA_FILE,
): TaskRepository {
  return {
    read() {
      try {
        const file = readFileSync(dataFile, { encoding: "utf8" });
        return parseTaskList(JSON.parse(file), dataFile);
      } catch (error) {
        if (isNodeError(error) && error.code === "ENOENT") {
          return [];
        }

        throw error;
      }
    },
    write(tasks) {
      mkdirSync(dirname(dataFile), { recursive: true });
      writeFileSync(dataFile, JSON.stringify(tasks, null, 2), {
        encoding: "utf8",
      });
    },
  };
}

function isNodeError(error: unknown): error is NodeJS.ErrnoException {
  return error instanceof Error && "code" in error;
}
