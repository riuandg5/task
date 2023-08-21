export type WorkerT<T extends unknown[], R> = (...workerParams: T) => R;

export interface TaskConfigI<T extends unknown[], R> {
    worker?: WorkerT<T, R>;
    workerParams?: T;
}

export class Task<T extends unknown[], R> {
    #worker;
    #workerParams;
    #result: R | undefined;

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

    set worker(func: WorkerT<T, R> | undefined) {
        this.#worker = func;
        this.#result = undefined;
    }

    set workerParams(params: T | undefined) {
        this.#workerParams = params;
        this.#result = undefined;
    }

    execute(fbConfig: TaskConfigI<T, R> = {}) {
        const { worker: fbWorker, workerParams: fbWorkerParams } = fbConfig;

        const func = this.worker || fbWorker;
        const params = this.workerParams || fbWorkerParams;

        if (!func && !params) {
            throw new Error("no config set and no fallback config provided");
        }

        if (!func) {
            throw new Error("no worker set and no fallback worker provided");
        }

        if (!params) {
            throw new Error(
                "no workerParams set and no fallback workerParams provided",
            );
        }

        this.#result = func(...params);
        return this.#result;
    }
}
