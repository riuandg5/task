import { BaseTask } from "../BaseTask/BaseTask.js";
import type { TaskConfigI } from "../BaseTask/BaseTask.js";

export const TASKERROR = {
    NO_CONFIG: "no config set and no fallback config provided",
    NO_WORKER: "no worker set and no fallback worker provided",
    NO_WORKERPARAMS:
        "no workerParams set and no fallback workerParams provided",
};

export type TaskResultT<R> = R | undefined;

export class Task<T extends unknown[], R> extends BaseTask<T, R> {
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
