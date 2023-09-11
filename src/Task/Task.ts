import { BaseTask } from "../BaseTask/BaseTask.js";
import type { TaskConfigI } from "../BaseTask/BaseTask.js";

/**
 * Error messages for Task class.
 */
export const TASKERROR = {
    NO_CONFIG: "no config set and no fallback config provided",
    NO_WORKER: "no worker set and no fallback worker provided",
    NO_WORKERPARAMS:
        "no workerParams set and no fallback workerParams provided",
};

/**
 * The type of task worker result.
 *
 * @typeParam R - The type of task worker result.
 *
 * @example
 * ```ts
 * let adderResult: TaskResultT<number>;
 * ```
 */
export type TaskResultT<R> = R | undefined;

/**
 * Task class represents an individual task which in very simplest form calls its defined worker
 * function with its defined worker parameters on execution.
 *
 * @remarks
 * It can optionally have a worker function and worker parameters in its configuration.
 * It has an execute method which is used to run the task and store its result.
 *
 * If any of worker function or worker parameters is undefined then it uses the fallback
 * configuration for the execution.
 *
 * It can be a sub task of a group task.
 *
 * @typeParam T - The type of the task worker parameters.
 * @typeParam R - The type of the task worker result.
 *
 * @example Task with no configuration.
 * ```ts
 * const task = Task();
 * // or
 * const task = Task({});
 * ```
 *
 * @example Task with worker function only.
 * ```ts
 * const task = Task<[number, number], number>({
 *     worker: (a, b) => a + b,
 * });
 * ```
 *
 * @example Task with worker parameters only.
 * ```ts
 * const task = Task<[number, number], unknown>({
 *     workerParams: [1, 2],
 * });
 * ```
 *
 * @example Task with both worker function and woker parameters.
 * ```ts
 * const task = Task<[number, number], number>({
 *     worker: (a, b) => a + b,
 *     workerParams: [1, 2],
 * });
 * ```
 */
export class Task<T extends unknown[], R> extends BaseTask<T, R> {
    /**
     * Executes the task.
     *
     * @remarks
     * A task must have a worker function and worker parameters defined at the time of execution.
     *
     * If any of them is undefined, then it should be set or provided via the fallback
     * configuration to use for the execution, else it will throw an error.
     *
     * Fallback configuration does not set the worker function or worker parameters but only
     * provides the temporary values to fallback on.
     *
     * If even fallback values are undefined, then it throws an error.
     *
     * @param fbConfig - The fallback task configuration.
     *
     * @returns The task worker result.
     *
     * @throws
     * If no configuration and no fallback configuration is set.
     *
     * @throws
     * If no worker function is set and no fallback worker function is provided either.
     *
     * @throws
     * If no worker parameters are set and no fallback worker parameters are provided either.
     *
     * @example Without fallback configuration.
     * ```ts
     * task.execute();
     * // will run successfully if task.worker and task.workerParams are not undefined
     * ```
     *
     * @example With a fallback worker function.
     * ```ts
     * task.execute({ worker: (a, b) => a - b });
     * // fallback worker function will be used only if task.worker is undefined
     * // will run successfully if task.workerParams is not undefined
     * ```
     *
     * @example With fallback worker parameters.
     * ```ts
     * task.execute({ workerParams: [3, 4] });
     * // fallback worker parameters will be used only if task.workerParams is undefined
     * // will run successfully if task.worker is not undefined
     * ```
     *
     * @example With both fallback worker and worker parameters.
     * ```ts
     * task.execute({ worker: (a, b) => a - b, workerParams: [3, 4] });
     * // fallback worker function will be used only if task.worker is undefined
     * // fallback worker parameters will be used only if task.workerParams is undefined
     * // will run successfully even if task.worker and task.workerParams are undefined
     * ```
     */
    execute(fbConfig: TaskConfigI<T, R> = {}): TaskResultT<R> {
        const { worker: fbWorker, workerParams: fbWorkerParams } = fbConfig;

        const worker = this.worker || fbWorker;
        const workerParams = this.workerParams || fbWorkerParams;

        if (!worker && !workerParams) {
            throw new Error(TASKERROR.NO_CONFIG);
        }

        if (!worker) {
            throw new Error(TASKERROR.NO_WORKER);
        }

        if (!workerParams) {
            throw new Error(TASKERROR.NO_WORKERPARAMS);
        }

        this.result = worker(...workerParams);
        return this.result;
    }
}
