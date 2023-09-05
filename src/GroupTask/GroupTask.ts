import depd from "depd";
const deprecate = depd("@riuandg5/task-excute");

import { Task } from "../Task/Task.js";
import type { TaskConfigI, TaskResultT } from "../Task/Task.js";

export type GroupTaskModeT = "series" | "parallel";
/**
 * @deprecated Will be removed in next major release. Use GroupTaskModeT instead.
 */
export type GroupTaskT = GroupTaskModeT;

type ArrayWithMinOneOrTwoElementsT<T> = [T, ...T[]] | [T, T, ...T[]];
export type GroupSubTasksT<
    T extends unknown[],
    R,
> = ArrayWithMinOneOrTwoElementsT<Task<T, R> | GroupTask<T, R>>;

interface GroupTaskConfigOldI<T extends unknown[], R> {
    /**
     * @deprecated Will be removed in next major release. Use mode instead of type.
     */
    type: GroupTaskModeT;
    subTasks: GroupSubTasksT<T, R>;
}
interface GroupTaskConfigNewI<T extends unknown[], R> {
    mode: GroupTaskModeT;
    subTasks: GroupSubTasksT<T, R>;
}
export type GroupTaskConfigI<T extends unknown[], R> =
    | GroupTaskConfigOldI<T, R>
    | GroupTaskConfigNewI<T, R>;

type NestedResultT<R> = (R | NestedResultT<R>)[];
export type GroupTaskResultT<R> = NestedResultT<TaskResultT<R>> | undefined;

export class GroupTask<T extends unknown[], R> {
    #mode;
    #subTasks;
    #result: TaskResultT<R> | GroupTaskResultT<R>;

    constructor(groupTaskConfig: GroupTaskConfigI<T, R>) {
        if (!groupTaskConfig) {
            throw new Error("cannot create grouptask without config");
        }

        const { type, subTasks } = groupTaskConfig as GroupTaskConfigOldI<T, R>;
        let { mode } = groupTaskConfig as GroupTaskConfigNewI<T, R>;

        if (type) {
            deprecate(
                `Use of "type" is deprecated and will be removed in next major release. Use "mode" instead.`,
            );
            if (!mode) {
                mode = type;
            }
        }

        if (mode !== "series" && mode !== "parallel") {
            throw new Error("invalid grouptask mode");
        }

        if (subTasks.length === 0) {
            throw new Error("subTasks cannot be empty");
        } else if (subTasks.length < 2) {
            deprecate(
                `GroupTask must have at least a pair (2) of either Tasks, GroupTasks, or mix of them as it's subTasks. Support for < 2 subTasks is deprecated and will be removed in next major release.`,
            );
        }

        this.#mode = mode;
        this.#subTasks = subTasks;
    }

    get type() {
        deprecate(
            `Use of "type" is deprecated and will be removed in next major release. Use "mode" instead.`,
        );
        return this.#mode;
    }
    get mode() {
        return this.#mode;
    }

    get subTasks() {
        return this.#subTasks;
    }

    get result() {
        return this.#result;
    }

    async execute(
        fbConfig: TaskConfigI<T, R> = {},
    ): Promise<GroupTaskResultT<R>> {
        let result: GroupTaskResultT<R> = [];
        if (this.mode === "series") {
            for (const subTask of this.subTasks) {
                const res = await subTask.execute(fbConfig);
                result.push(res);
            }
        } else if (this.mode === "parallel") {
            result = await Promise.all(
                this.#subTasks.map((subTask) => subTask.execute(fbConfig)),
            );
        }
        this.#result = result;
        return this.#result;
    }
}
