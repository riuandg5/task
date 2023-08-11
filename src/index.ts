type Worker<T extends unknown[], R> = (...workerParams: T) => R;

class Task<T extends unknown[], R> {
    #workerParams: T;
    #result: R | undefined;
    #worker: Worker<T, R> | undefined;

    constructor(workerParams: T, worker?: Worker<T, R>) {
        this.#workerParams = workerParams;
        this.#worker = worker;
    }

    getWorker(): Worker<T, R> | undefined {
        return this.#worker;
    }

    getWorkerParams(): T {
        return this.#workerParams;
    }

    getResult(): R | undefined {
        return this.#result;
    }

    setWorker(worker: Worker<T, R>): void {
        this.#worker = worker;
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
