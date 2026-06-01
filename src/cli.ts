import { createJsonTaskRepository } from "./tasks/task-repository.js";
import { createTaskService } from "./tasks/task-service.js";
import type { Task } from "./tasks/task.js";

export function main(argv = process.argv.slice(2)): number {
  const cliArgs = [...argv];
  if (cliArgs[0] === "--") {
    cliArgs.shift();
  }

  const [command, ...args] = cliArgs;
  if (!command) {
    printUsage();
    return 1;
  }

  const service = createTaskService(createJsonTaskRepository());

  try {
    switch (command) {
      case "add": {
        const result = service.add(args[0]);
        if (!result.ok) {
          return printError(result.error);
        }

        console.log(`Added task ${result.value.id}`);
        return 0;
      }
      case "update": {
        const result = service.updateDescription(args[0], args[1]);
        if (!result.ok) {
          return printError(result.error);
        }

        console.log(`Updated task ${result.value.id}`);
        return 0;
      }
      case "delete": {
        const result = service.delete(args[0]);
        if (!result.ok) {
          return printError(result.error);
        }

        console.log(`Deleted task ${result.value}`);
        return 0;
      }
      case "list": {
        const result = service.list(args[0]);
        if (!result.ok) {
          return printError(result.error);
        }

        printTasks(result.value);
        return 0;
      }
      case "mark-in-progress": {
        const result = service.updateStatus(args[0], "in-progress");
        if (!result.ok) {
          return printError(result.error);
        }

        console.log(`Updated task ${result.value.id}`);
        return 0;
      }
      case "mark-done": {
        const result = service.updateStatus(args[0], "done");
        if (!result.ok) {
          return printError(result.error);
        }

        console.log(`Updated task ${result.value.id}`);
        return 0;
      }
      default:
        console.error(`${command} command not supported`);
        printUsage();
        return 1;
    }
  } catch (error) {
    console.error(error instanceof Error ? error.message : "Unexpected error.");
    return 1;
  }
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
  todo-cli list [todo|in-progress|done]
  todo-cli mark-in-progress <id>
  todo-cli mark-done <id>`);
}

function printError(message: string): number {
  console.error(message);
  return 1;
}
