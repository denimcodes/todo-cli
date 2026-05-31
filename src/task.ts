import { randomUUID } from "crypto";

export class Task {
  id: string = randomUUID();
  description: string;
  status: "todo" | "in-progress" | "done" = "todo";
  createdAt: number = Date.now();
  updatedAt: number = Date.now();

  constructor(opts: Partial<Task> = {}) {
    ((this.id = opts.id ?? randomUUID()),
      (this.description = opts.description ?? ""),
      (this.status = opts.status ?? "todo"),
      (this.createdAt = opts.createdAt ?? Date.now()),
      (this.updatedAt = opts.updatedAt ?? Date.now()));
  }

  public getTaskId() {
    return this.id;
  }
}