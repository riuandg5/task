import type { TaskResultT } from "../Task/Task.js";
import type { GroupTaskResultT } from "../GroupTask/GroupTask.js";

/**
 * The type of the task worker function.
 *
 * @typeParam T - The type of the task worker parameters.
 * @typeParam R - The type of the task worker result.
 *
 * @example Use to define a task worker function.
 * ```ts
 * const moviesGetter: TaskWorkerT<[url: string], Promise<JSON>> = async (url) => {
 *     const response = await fetch(url);
 *     const movies = await response.json();
 *     return movies;
 * };
 * ```
 *
 * @example Use to create a template for similar task worker functions.
 * ```ts
 * type TwoNumbersWorkerTemplate = TaskWorkerT<[number, number], number>;
 * const adder: TwoNumbersWorkerTemplate = (a, b) => a + b;
 * const multiplier: TwoNumbersWorkerTemplate = (a, b) => a * b;
 * ```
 */
export type TaskWorkerT<T extends unknown[], R> =
    | ((...workerParams: T) => R)
    | undefined;

/**
 * {@inheritDoc TaskWorkerT}
 *
 * @deprecated Will be removed in next major release. Use {@link TaskWorkerT} instead.
 */
export type WorkerT<T extends unknown[], R> = TaskWorkerT<T, R>;

/**
 * The type of the task worker parameters.
 *
 * @typeParam T - The type of the task worker parameters.
 *
 * @example Use to define task worker parameters.
 * ```ts
 * const moviesGetterParams: TaskWorkerParamsT<[url: string]> = ["example.com"];
 * ```
 *
 * @example Use to create a template for similar task worker parameters.
 * ```ts
 * type TwoNumbersWorkerParamsTemplate = TaskWorkerParamsT<[number, number]>;
 * const adderParams: TwoNumbersWorkerParamsTemplate = [1, 2];
 * const multiplierParams: TwoNumbersWorkerParamsTemplate = [3, 4];
 * ```
 */
export type TaskWorkerParamsT<T extends unknown[]> = T | undefined;

/**
 * The interface of the configuration options for a task.
 *
 * @typeParam T - The type of the task worker parameters.
 * @typeParam R - The type of the task worker result.
 *
 * @example Use to define a task configuration.
 * ```ts
 * const moviesGetterConfig: TaskConfigI<[url: string], Promise<JSON>> = {
 *     worker: moviesGetter,
 *     workerParams: moviesGetterParams,
 * };
 * ```
 *
 * @example Use to define a template for similar task configurations.
 * ```ts
 * type TwoNumbersConfigTemplate = TaskConfigI<[number, number], number>;
 * const adderConfig: TwoNumbersConfigTemplate = {
 *     worker: adder,
 *     workerParams: adderParams,
 * };
 * const multiplierConfig: TwoNumbersConfigTemplate = {
 *     worker: multiplier,
 *     workerParams: multiplierParams,
 * };
 * ```
 *
 * @example Other valid configurations.
 * ```ts
 * const emptyConfig: TaskConfigI<unknown[], unknown> = {};
 *
 * const onlyWorkerConfig: TaskConfigI<[number, number], number> = {
 *     worker: adder,
 * };
 *
 * const onlyWorkerParamsConfig: TaskConfigI<[number, number], unknown> = {
 *     workerParams: [1, 2],
 * };
 * ```
 */
export interface TaskConfigI<T extends unknown[], R> {
    /**
     * The task worker function that if defined, will be run when the task is executed.
     */
    worker?: TaskWorkerT<T, R>;
    /**
     * The task worker parameters that if defined, will be passed to the task work function as its
     * arguments for task execution.
     */
    workerParams?: TaskWorkerParamsT<T>;
}

/**
 * BaseTask class is the foundation of {@link Task} and {@link GroupTask} class.
 *
 * @remarks
 * It is an abstract class with worker, workerParams, and result (getter) as public accessors.
 * Task and GroupTask class extends it to implement their own execution method and also use
 * its protected accessor, result (setter) to store the task execution result.
 *
 * @typeParam T - The type of the task worker parameters.
 * @typeParam R - The type of the task worker result.
 *
 * @internal
 */
export abstract class BaseTask<T extends unknown[], R> {
    #worker;
    #workerParams;
    #result: TaskResultT<R> | GroupTaskResultT<R>;

    /**
     * @param taskConfig - The configuration options for the task.
     *
     * @defaultValue \{\}
     *
     * @typeParam T - The type of the task worker parameters.
     * @typeParam R - The type of the task worker result.
     */
    constructor(taskConfig: TaskConfigI<T, R> = {}) {
        const { worker, workerParams } = taskConfig;
        this.#worker = worker;
        this.#workerParams = workerParams;
    }

    /**
     * Gets the task worker function.
     *
     * @returns The task worker function.
     */
    get worker() {
        return this.#worker;
    }

    /**
     * Gets the task worker parameters.
     *
     * @returns The task worker parameters.
     */
    get workerParams() {
        return this.#workerParams;
    }

    /**
     * Gets the task worker result.
     *
     * @returns The task worker result.
     */
    get result() {
        return this.#result;
    }

    /**
     * Sets the task worker function.
     *
     * @param worker - The task worker function.
     */
    set worker(worker: TaskWorkerT<T, R>) {
        this.#worker = worker;
        this.#result = undefined;
    }

    /**
     * Sets the task worker parameters.
     *
     * @param workerParams - The task worker parameters.
     */
    set workerParams(workerParams: TaskWorkerParamsT<T>) {
        this.#workerParams = workerParams;
        this.#result = undefined;
    }

    /**
     * Sets the task worker result.
     *
     * @param result - The task worker result.
     *
     * @internal
     */
    protected set result(result: TaskResultT<R> | GroupTaskResultT<R>) {
        this.#result = result;
    }
}
