import depd from "depd";
const deprecate = depd("@riuandg5/task-excute");

import { BaseTask } from "../BaseTask/BaseTask.js";
import type { TaskConfigI } from "../BaseTask/BaseTask.js";

import { Task } from "../Task/Task.js";
import type { TaskResultT } from "../Task/Task.js";

/**
 * The type of group task mode.
 */
export type GroupTaskModeT = "series" | "parallel";

/**
 * {@inheritDoc GroupTaskModeT}
 *
 * @deprecated Will be removed in next major release. Use {@link GroupTaskModeT} instead.
 */
export type GroupTaskT = GroupTaskModeT;

/**
 * The type of array with minimum one or two elements
 *
 * @typeParam T - The type of elements.
 *
 * @internal
 */
type ArrayWithMinOneOrTwoElementsT<T> = [T, ...T[]] | [T, T, ...T[]];

/**
 * The type of group sub tasks.
 *
 * @typeParam T - The type of the task worker parameters.
 * @typeParam R - The type of the task worker result.
 *
 * @example Use to define group sub tasks.
 * ```ts
 * const subTasks: GroupSubTasksT<[number, number], number> = [
 *     new Task({
 *         worker: (a, b) => a + b,
 *     }),
 *     // task result type must be defined for a task to match with that of
 *     // group sub tasks array, else use unknown or any in group sub tasks
 *     // array
 *     new Task<[number, number], number>({
 *         workerParams: [1, 2],
 *     }),
 *     new Task({
 *         worker: (a, b) => a * b,
 *         workerParams: [3, 4],
 *     }),
 * ];
 * ```
 *
 * @example Use to create template for similar group sub tasks.
 * ```ts
 * type TwoNumbersSubTaskTemplate = GroupSubTasksT<[number, number], number>;
 * const calcTasks1: TwoNumbersSubTaskTemplate = [
 *     new Task({ worker: (a, b) => a + b }),
 *     new Task({ worker: (a, b) => a - b }),
 * ];
 * const calcTasks2: TwoNumbersSubTaskTemplate = [
 *     new Task({ worker: (a, b) => a * b }),
 *     new Task({ worker: (a, b) => a / b }),
 * ];
 * ```
 */
export type GroupSubTasksT<
    T extends unknown[],
    R,
> = ArrayWithMinOneOrTwoElementsT<Task<T, R> | GroupTask<T, R>>;

/**
 * The old interface of the configuration options for a group task.
 *
 * @typeParam T - The type of the task worker parameters.
 * @typeParam R - The type of the task worker result.
 *
 * @internal
 */
interface GroupTaskConfigOldI<T extends unknown[], R>
    extends TaskConfigI<T, R> {
    /**
     * The execution type of the group task.
     *
     * @deprecated Will be removed in next major release. Use mode instead of type.
     */
    type: GroupTaskModeT;
    /**
     * The sub tasks of the group task, which will be executed on execution of the group task.
     */
    subTasks: GroupSubTasksT<T, R>;
}
/**
 * The new interface of the configuration options for a group task.
 *
 * @typeParam T - The type of the task worker parameters.
 * @typeParam R - The type of the task worker result.
 *
 * @internal
 */
interface GroupTaskConfigNewI<T extends unknown[], R>
    extends TaskConfigI<T, R> {
    /**
     * The execution mode of the group task.
     */
    mode: GroupTaskModeT;
    /**
     * The sub tasks of the group task, which will be executed on execution of the group task.
     */
    subTasks: GroupSubTasksT<T, R>;
}

/**
 * The interface of the configuration options for a group task.
 *
 * @typeParam T - The type of the task worker parameters.
 * @typeParam R - The type of the task worker result.
 *
 * @example Use to define a group task configuration.
 * ```ts
 * const dataGetterConfig: GroupTaskConfigI<[url: string], Promise<JSON>> = {
 *     mode: "parallel", // or "series"
 *     subTasks: [txtDataGetterTask, audioDataGetterTask, booksGetterGroupTask],
 * };
 * ```
 *
 * @example Other valid configurations.
 * ```ts
 * // with optional worker function
 * const dataGetterConfig: GroupTaskConfigI<[url: string], Promise<JSON>> = {
 *     mode: "parallel", // or "series"
 *     subTasks: [txtDataGetterTask, audioDataGetterTask, booksGetterGroupTask],
 *     worker: async (url) => {
 *         const response = await fetch(url);
 *         const movies = await response.json();
 *         return movies;
 *     };
 * };
 *
 * // with optional worker parameters
 * const dataGetterConfig: GroupTaskConfigI<[url: string], Promise<JSON>> = {
 *     mode: "parallel", // or "series"
 *     subTasks: [txtDataGetterTask, audioDataGetterTask, booksGetterGroupTask],
 *     workerParams: ["example.com"]
 * };
 *
 * // with both optional worker function and worker parameters
 * const dataGetterConfig: GroupTaskConfigI<[url: string], Promise<JSON>> = {
 *     mode: "parallel", // or "series"
 *     subTasks: [txtDataGetterTask, audioDataGetterTask, booksGetterGroupTask],
 *     worker: async (url) => {
 *         const response = await fetch(url);
 *         const movies = await response.json();
 *         return movies;
 *     };
 *     workerParams: ["example.com"]
 * };
 * ```
 */
export type GroupTaskConfigI<T extends unknown[], R> =
    | GroupTaskConfigOldI<T, R>
    | GroupTaskConfigNewI<T, R>;

/**
 * The type of multilevel nested array.
 *
 * @typeParam R - The type of array elements.
 *
 * @internal
 */
type NestedArrayT<R> = (R | NestedArrayT<R>)[];

/**
 * The type of group task worker result.
 *
 * @typeParam R - The type of task worker result.
 */
export type GroupTaskResultT<R> = NestedArrayT<TaskResultT<R>> | undefined;

/**
 * Error messages for GroupTask class.
 */
export const GROUPTASKERROR = {
    NO_CONFIG: "cannot create grouptask without config",
    INVALID_MODE: "invalid grouptask mode",
    EMPTY_SUBTASKS: "subTasks cannot be empty",
};

/**
 * Deprecation messages for GroupTask class.
 */
const DEPDMSG = {
    DEP_TYPE: `Use of "type" is deprecated and will be removed in next major release. Use "mode" instead.`,
    DEP_SINGLE_SUBTASK: `GroupTask must have at least a pair (2) of either Tasks, GroupTasks, or mix of them as it's subTasks. Support for < 2 subTasks is deprecated and will be removed in next major release.`,
};

/**
 * GroupTask class represents a kind of task which on execution runs its sub tasks in a defined
 * mode.
 *
 * @remarks
 * It must have the execution mode (or type, deprecated) and sub tasks defined in its
 * configuration.
 * It can optionally have a worker function and worker parameters in its configuration.
 * It has an execute method which is used to run its sub tasks and store their results.
 *
 * It can be a sub task of a group task.
 *
 * @typeParam T - The type of the task worker parameters.
 * @typeParam R - The type of the task worker result.
 *
 * @example Group task with only required configuration.
 * ```ts
 * const groupTask = GroupTask<[number, number], number>({
 *     mode: "series" // or "parallel",
 *     subTasks: [task1, task2], // at least 2 (or 1, deprecated)
 * });
 * ```
 *
 * @example GroupTask with optional worker function and worker parameters.
 * ```ts
 * const groupTask = GroupTask<[number, number], number>({
 *     mode: "series" // or "parallel",
 *     subTasks: [task1, task2], // at least 2
 *     worker: (a, b) => a + b,
 *     workerParams: [1, 2],
 * });
 * ```
 */
export class GroupTask<T extends unknown[], R> extends BaseTask<T, R> {
    #mode;
    #subTasks;

    /**
     * @param groupTaskConfig - The configuration options for the group task.
     *
     * @typeParam T - The type of the task worker parameters.
     * @typeParam R - The type of the task worker result.
     *
     * @throws
     * If no configuration is set.
     *
     * @throws
     * If invalid mode is set.
     *
     * @throws
     * If subtasks array is empty.
     */
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

    /**
     * Gets the group task type.
     *
     * @returns The group task type.
     *
     * @deprecated Will be removed in next major release. Use {@link GroupTask.mode} instead.
     */
    get type() {
        deprecate(DEPDMSG.DEP_TYPE);
        return this.#mode;
    }

    /**
     * Gets the group task mode.
     *
     * @returns The group task mode.
     */
    get mode() {
        return this.#mode;
    }

    /**
     * Gets the group sub tasks.
     *
     * @returns The group sub tasks.
     */
    get subTasks() {
        return this.#subTasks;
    }

    /**
     * Sets the group task type.
     *
     * @param type - The group task type.
     *
     * @deprecated Will be removed in next major release. Use {@link GroupTask.mode} instead.
     */
    set type(type: GroupTaskModeT) {
        deprecate(DEPDMSG.DEP_TYPE);
        this.#mode = type;
    }

    /**
     * Sets the group task mode.
     *
     * @param mode - The group task mode.
     */
    set mode(mode: GroupTaskModeT) {
        this.#mode = mode;
    }

    /**
     * Sets the group sub tasks.
     *
     * @param subTasks - The group sub tasks.
     */
    set subTasks(subTasks: GroupSubTasksT<T, R>) {
        this.#subTasks = subTasks;
    }

    /**
     * Executes the group task.
     *
     * @remarks
     * All sub tasks must have a worker function and worker parameters defined at the time of
     * execution.
     *
     * If any of the sub task have undefined worker function or worker parameters, then it should
     * be set or it will use group task's worker function and worker parameters if defined, or
     * fallback configuration can be provided to use for the execution, else it will throw an
     * error.
     *
     * Fallback configuration does not set the worker function or worker parameters of the group
     * task or its sub tasks but only provides the temporary values to fallback on.
     *
     * If even fallback values are undefined, then sub task throws an error.
     *
     * @param fbConfig - The fallback task configuration.
     *
     * @returns The task worker result.
     *
     * @example Without fallback configuration.
     * ```ts
     * groupTask.execute();
     * // will run successfully if subtask.worker and subtask.workerParams are not undefined or
     * // groupTask.worker and groupTask.workerParams are defined for fallback
     * ```
     *
     * @example With a fallback worker function.
     * ```ts
     * groupTask.execute({ worker: (a, b) => a - b });
     * // fallback worker function will be used only if subtask.worker and groupTask.worker are
     * // undefined
     * // will run successfully if subtask.workerParams is not undefined or
     * // groupTask.workerParams is defined for fallback
     * ```
     *
     * @example With fallback worker parameters.
     * ```ts
     * groupTask.execute({ worker: (a, b) => a - b });
     * // fallback worker parameters will be used only if subtask.workerParams and
     * // groupTask.workerParams are undefined
     * // will run successfully if subtask.worker is not undefined or
     * // groupTask.worker is defined for fallback
     * ```
     *
     * @example With both fallback worker and worker parameters.
     * ```ts
     * task.execute({ worker: (a, b) => a - b, workerParams: [3, 4] });
     * // fallback worker function will be used only if subtask.worker and groupTask.worker are
     * // undefined
     * // fallback worker parameters will be used only if subtask.workerParams and
     * // groupTask.workerParams are undefined
     * // will run successfully even if subtask.worker, subtask.workerParams, groupTask.worker,
     * // and groupTask.workerParams are undefined
     * ```
     */
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
