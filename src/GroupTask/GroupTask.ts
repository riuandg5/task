import depd from "depd";
const deprecate = depd("@riuandg5/task-excute");

import { BaseTask } from "../BaseTask/BaseTask.js";
import type { TaskConfigI } from "../BaseTask/BaseTask.js";

import { Task } from "../Task/Task.js";
import type { TaskResultT } from "../Task/Task.js";

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

interface GroupTaskConfigOldI<T extends unknown[], R>
    extends TaskConfigI<T, R> {
    /**
     * @deprecated Will be removed in next major release. Use mode instead of type.
     */
    type: GroupTaskModeT;
    subTasks: GroupSubTasksT<T, R>;
}
interface GroupTaskConfigNewI<T extends unknown[], R>
    extends TaskConfigI<T, R> {
    mode: GroupTaskModeT;
    subTasks: GroupSubTasksT<T, R>;
}
export type GroupTaskConfigI<T extends unknown[], R> =
    | GroupTaskConfigOldI<T, R>
    | GroupTaskConfigNewI<T, R>;

type NestedResultT<R> = (R | NestedResultT<R>)[];
export type GroupTaskResultT<R> = NestedResultT<TaskResultT<R>> | undefined;

export const GROUPTASKERROR = {
    NO_CONFIG: "cannot create grouptask without config",
    INVALID_MODE: "invalid grouptask mode",
    EMPTY_SUBTASKS: "subTasks cannot be empty",
};

const DEPDMSG = {
    DEP_TYPE: `Use of "type" is deprecated and will be removed in next major release. Use "mode" instead.`,
    DEP_SINGLE_SUBTASK: `GroupTask must have at least a pair (2) of either Tasks, GroupTasks, or mix of them as it's subTasks. Support for < 2 subTasks is deprecated and will be removed in next major release.`,
};

export class GroupTask<T extends unknown[], R> extends BaseTask<T, R> {
    #mode;
    #subTasks;

    constructor(groupTaskConfig: GroupTaskConfigI<T, R>) {
        if (!groupTaskConfig) {
            throw new Error(GROUPTASKERROR.NO_CONFIG);
        }

        const { type, subTasks, worker, workerParams } =
            groupTaskConfig as GroupTaskConfigOldI<T, R>;
        let { mode } = groupTaskConfig as GroupTaskConfigNewI<T, R>;

        if (type) {
            deprecate(DEPDMSG.DEP_TYPE);
            if (!mode) {
                mode = type;
            }
        }

        if (mode !== "series" && mode !== "parallel") {
            throw new Error(GROUPTASKERROR.INVALID_MODE);
        }

        if (subTasks.length === 0) {
            throw new Error(GROUPTASKERROR.EMPTY_SUBTASKS);
        } else if (subTasks.length < 2) {
            deprecate(DEPDMSG.DEP_SINGLE_SUBTASK);
        }

        super({ worker, workerParams });

        this.#mode = mode;
        this.#subTasks = subTasks;
    }

    get type() {
        deprecate(DEPDMSG.DEP_TYPE);
        return this.#mode;
    }
    get mode() {
        return this.#mode;
    }

    get subTasks() {
        return this.#subTasks;
    }

    set type(type: GroupTaskModeT) {
        deprecate(DEPDMSG.DEP_TYPE);
        this.#mode = type;
    }
    set mode(mode: GroupTaskModeT) {
        this.#mode = mode;
    }

    set subTasks(subTasks: GroupSubTasksT<T, R>) {
        this.#subTasks = subTasks;
    }

    async execute(
        fbConfig: TaskConfigI<T, R> = {},
    ): Promise<GroupTaskResultT<R>> {
        const { worker: fbWorker, workerParams: fbWorkerParams } = fbConfig;

        const worker = this.worker || fbWorker;
        const workerParams = this.workerParams || fbWorkerParams;

        const newFbConfig: TaskConfigI<T, R> = { worker, workerParams };

        let result: GroupTaskResultT<R> = [];

        if (this.mode === "series") {
            for (const subTask of this.subTasks) {
                const res = await subTask.execute(newFbConfig);
                result.push(res);
            }
        } else if (this.mode === "parallel") {
            result = await Promise.all(
                this.#subTasks.map((subTask) => subTask.execute(newFbConfig)),
            );
        }
        this.result = result;
        return this.result;
    }
}
