export type TaskWorkerT<T extends unknown[], R> =
    | ((...workerParams: T) => R)
    | undefined;
/**
 * @deprecated Will be removed in next major release. Use TaskWorkerT instead.
 */
export type WorkerT<T extends unknown[], R> = TaskWorkerT<T, R>;

export type TaskWorkerParamsT<T> = T | undefined;

export interface TaskConfigI<T extends unknown[], R> {
    worker?: TaskWorkerT<T, R>;
    workerParams?: TaskWorkerParamsT<T>;
}

export type TaskResultT<R> = R | undefined;

export class Task<T extends unknown[], R> {
    #worker;
    #workerParams;
    #result: TaskResultT<R>;

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

    execute(fbConfig: TaskConfigI<T, R> = {}): TaskResultT<R> {
        const { worker: fbWorker, workerParams: fbWorkerParams } = fbConfig;

        const worker = this.worker || fbWorker;
        const workerParams = this.workerParams || fbWorkerParams;

        if (!worker && !workerParams) {
            throw new Error("no config set and no fallback config provided");
        }

        if (!worker) {
            throw new Error("no worker set and no fallback worker provided");
        }

        if (!workerParams) {
            throw new Error(
                "no workerParams set and no fallback workerParams provided",
            );
        }

        this.#result = worker(...workerParams);
        return this.#result;
    }
}
