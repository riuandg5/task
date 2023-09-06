import type { TaskResultT } from "../Task/Task.js";
import type { GroupTaskResultT } from "../GroupTask/GroupTask.js";

export type TaskWorkerT<T extends unknown[], R> =
    | ((...workerParams: T) => R)
    | undefined;
/**
 * @deprecated Will be removed in next major release. Use TaskWorkerT instead.
 */
export type WorkerT<T extends unknown[], R> = TaskWorkerT<T, R>;

export type TaskWorkerParamsT<T extends unknown[]> = T | undefined;

export interface TaskConfigI<T extends unknown[], R> {
    worker?: TaskWorkerT<T, R>;
    workerParams?: TaskWorkerParamsT<T>;
}

export abstract class BaseTask<T extends unknown[], R> {
    #worker;
    #workerParams;
    #result: TaskResultT<R> | GroupTaskResultT<R>;

    constructor(taskConfig: TaskConfigI<T, R> = {}) {
        const { worker, workerParams } = taskConfig;
        this.#worker = worker;
        this.#workerParams = workerParams;
    }

    get worker() {
        return this.#worker;
    }

    get workerParams() {
        return this.#workerParams;
    }

    get result() {
        return this.#result;
    }

    set worker(worker: TaskWorkerT<T, R>) {
        this.#worker = worker;
        this.#result = undefined;
    }

    set workerParams(workerParams: TaskWorkerParamsT<T>) {
        this.#workerParams = workerParams;
        this.#result = undefined;
    }

    protected set result(result: TaskResultT<R> | GroupTaskResultT<R>) {
        this.#result = result;
    }
}
