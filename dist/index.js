import { randomUUID } from "crypto";
import { writeFile } from "fs";
import { readFile } from "fs/promises";
class Task {
    id = randomUUID();
    description;
    status = "todo";
    createdAt = Date.now();
    updatedAt = Date.now();
    constructor(opts = {}) {
        ((this.id = opts.id ?? randomUUID()),
            (this.description = opts.description ?? ""),
            (this.status = opts.status ?? "todo"),
            (this.createdAt = opts.createdAt ?? Date.now()),
            (this.updatedAt = opts.updatedAt ?? Date.now()));
    }
    getTaskId() {
        return this.id;
    }
}
async function main() {
    const [name, command, ...args] = process.argv.slice();
    if (name == null || typeof name != "string" || name != "todo-cli") {
        console.error("Invalid name");
        return;
    }
    if (command == null || typeof command != "string") {
        console.error("Invalid command");
        return;
    }
    switch (command) {
        case "add":
            const description = args[0];
            if (typeof description != "string") {
                return;
            }
            const task = new Task({
                description,
            });
            await addTask(task);
            break;
        case "update":
            break;
        case "delete":
            break;
        case "list":
            const tasks = await listTasks();
            console.log({ tasks });
            break;
        default:
            console.log(`${command} command not supported`);
            break;
    }
}
async function addTask(task) {
    const file = await readFile("data.json", { encoding: "utf8" });
    const tasks = JSON.parse(file);
    tasks.push(task);
    const newFile = JSON.stringify(tasks, null, 2);
    writeFile("data.json", newFile, {
        encoding: "utf8",
    }, () => {
        console.log("File write successful");
    });
}
function updateTask(id, description) { }
function deleteTask(id) { }
async function listTasks() {
    let tasks = [];
    try {
        const file = await readFile("data.json", { encoding: "utf8" });
        tasks = JSON.parse(file);
    }
    catch (error) { }
    return tasks;
}
main();
//# sourceMappingURL=index.js.map