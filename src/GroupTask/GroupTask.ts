import { Task, TaskConfigI } from "../Task/Task.js";

export type GroupTaskT = "series" | "parallel";

export interface GroupTaskConfigI<T extends unknown[], R> {
    type: GroupTaskT;
    subTasks: Task<T, R>[];
}

export class GroupTask<T extends unknown[], R> {
    #type;
    #subTasks;
    #result: Awaited<R>[] | undefined;

    constructor(groupTaskConfig: GroupTaskConfigI<T, R>) {
        if (!groupTaskConfig) {
            throw new Error("cannot create grouptask without config");
        }

        const { type, subTasks } = groupTaskConfig;

        if (type !== "series" && type !== "parallel") {
            throw new Error("invalid grouptask type");
        }

        if (subTasks.length === 0) {
            throw new Error("subTasks cannot be empty");
        }

        this.#type = type;
        this.#subTasks = subTasks;
    }

    get type() {
        return this.#type;
    }

    get subTasks() {
        return this.#subTasks;
    }

    get result() {
        return this.#result;
    }

    async execute(fbConfig: TaskConfigI<T, R> = {}) {
        let result: Awaited<R>[] = [];
        if (this.type === "series") {
            for (const subTask of this.subTasks) {
                const res = await subTask.execute(fbConfig);
                result.push(res);
            }
        } else if (this.type === "parallel") {
            result = await Promise.all(
                this.#subTasks.map((subTask) => subTask.execute(fbConfig)),
            );
        }
        this.#result = result;
        return this.#result;
    }
}
