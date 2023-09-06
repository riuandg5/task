import { describe, test, expect } from "vitest";

import { BaseTask } from "./BaseTask.js";
import type { TaskWorkerParamsT, TaskWorkerT } from "./BaseTask.js";

import type { TaskResultT } from "../Task/Task.js";

import type { GroupTaskResultT } from "../GroupTask/GroupTask.js";

describe("BaseTask class", () => {
    // inherit abstract BaseTask class for testing
    // add method to mock set result
    class AnyTask<T extends unknown[], R> extends BaseTask<T, R> {
        mockSetResult(result: TaskResultT<R> | GroupTaskResultT<R>) {
            this.result = result;
        }
    }

    // prepare a few workers and workerParams to be used in tests
    const worker: TaskWorkerT<[p: number, q: number], number> = (a, b) => a + b;
    const workerParams: TaskWorkerParamsT<[p: number, q: number]> = [1, 2];

    const newWorker: TaskWorkerT<[p: number, q: number], number> = (c, d) =>
        c - d;
    const newWorkerParams: TaskWorkerParamsT<[p: number, q: number]> = [3, 4];

    // prepare a few result to be used in tests
    const taskResult: TaskResultT<number> = 5;
    const groupTaskResult: GroupTaskResultT<number> = [1, undefined, [3, 4]];

    describe("constructor initialization", () => {
        test("with no worker and no workerParams", () => {
            const task = new AnyTask();

            expect(task).toBeInstanceOf(AnyTask);
            expect(task.worker).toBeUndefined();
            expect(task.workerParams).toBeUndefined();
            expect(task.result).toBeUndefined();
        });

        test("with only worker", () => {
            const task = new AnyTask({ worker });

            expect(task).toBeInstanceOf(AnyTask);
            expect(task.worker).toBe(worker);
            expect(task.workerParams).toBeUndefined();
            expect(task.result).toBeUndefined();
        });

        test("with only workerParams", () => {
            const task = new AnyTask({ workerParams });

            expect(task).toBeInstanceOf(AnyTask);
            expect(task.worker).toBeUndefined();
            expect(task.workerParams).toEqual(workerParams);
            expect(task.result).toBeUndefined();
        });

        test("with both worker and workerParams", () => {
            const task = new AnyTask({ worker, workerParams });

            expect(task).toBeInstanceOf(AnyTask);
            expect(task.worker).toBe(worker);
            expect(task.workerParams).toEqual(workerParams);
            expect(task.result).toBeUndefined();
        });
    });

    test("get and set worker property", () => {
        const task = new AnyTask({ worker, workerParams });

        task.worker = newWorker;
        expect(task.worker).toBe(newWorker);
    });

    test("get and set workerParams property", () => {
        const task = new AnyTask({ worker, workerParams });

        task.workerParams = newWorkerParams;
        expect(task.workerParams).toEqual(newWorkerParams);
    });

    test("get and set result property", () => {
        const task = new AnyTask();

        task.mockSetResult(taskResult);
        expect(task.result).toEqual(taskResult);

        task.mockSetResult(groupTaskResult);
        expect(task.result).toEqual(groupTaskResult);
    });

    test("result resets after change of worker or workerParams", () => {
        const task = new AnyTask({ worker, workerParams });

        task.mockSetResult(taskResult);
        task.worker = newWorker;
        expect(task.result).toBeUndefined();

        task.mockSetResult(groupTaskResult);
        task.workerParams = newWorkerParams;
        expect(task.result).toBeUndefined();
    });
});
