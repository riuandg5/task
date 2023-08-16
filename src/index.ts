type WorkerT<T extends unknown[], R> = (...workerParams: T) => R;

interface TaskConfigI<T extends unknown[], R> {
    worker?: WorkerT<T, R>;
    workerParams?: T;
}

class Task<T extends unknown[], R> {
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

    execute() {
        if (this.#worker && this.#workerParams) {
            this.#result = this.#worker(...this.#workerParams);
            return this.#result;
        }
        throw new Error("no worker or workerParams is set for this task");
    }
}

export default Task;
