type Worker<T extends unknown[], R> = (...workerParams: T) => R;

class Task<T extends unknown[], R> {
    #workerParams: T;
    #result: R | undefined;
    #worker: Worker<T, R> | undefined;

    constructor(workerParams: T, worker?: Worker<T, R>) {
        this.#workerParams = workerParams;
        this.#worker = worker;
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

    set worker(func: Worker<T, R> | undefined) {
        this.#worker = func;
        this.#result = undefined;
    }

    execute(): R {
        if (this.#worker) {
            this.#result = this.#worker(...this.#workerParams);
            return this.#result;
        }
        throw new Error("no worker is set for this task");
    }
}

export default Task;
