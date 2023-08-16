import { describe, test, expect } from "vitest";
import Task from "./index";

describe("Task class", () => {
    describe("constructor initialization", () => {
        test("with no worker and no workerParams", () => {
            const task = new Task();

            expect(task).toBeInstanceOf(Task);
            expect(task.worker).toBeUndefined();
            expect(task.workerParams).toBeUndefined();
            expect(task.result).toBeUndefined();
        });

        test("with only worker", () => {
            const worker = (a: number, b: number) => a + b;
            const task = new Task({ worker });

            expect(task).toBeInstanceOf(Task);
            expect(task.worker).toBe(worker);
            expect(task.workerParams).toBeUndefined();
            expect(task.result).toBeUndefined();
        });

        test("with only workerParams", () => {
            const workerParams = [1, 2];
            const task = new Task({ workerParams });

            expect(task).toBeInstanceOf(Task);
            expect(task.worker).toBeUndefined();
            expect(task.workerParams).toEqual(workerParams);
            expect(task.result).toBeUndefined();
        });

        test("with both worker and workerParams", () => {
            const worker = (a: number, b: number) => a + b;
            const workerParams: [p1: number, p2: number] = [1, 2];
            const task = new Task({ worker, workerParams });

            expect(task).toBeInstanceOf(Task);
            expect(task.worker).toBe(worker);
            expect(task.workerParams).toEqual(workerParams);
            expect(task.result).toBeUndefined();
        });
    });

    test("get and set worker property", () => {
        const worker = (a: number, b: number) => a + b;
        const task = new Task({ worker, workerParams: [1, 2] });

        const newWorker = (c: number, d: number) => c - d;
        task.worker = newWorker;
        expect(task.worker).toBe(newWorker);
    });

    test("get and set workerParams property", () => {
        const workerParams: [p1: number, p2: number] = [1, 2];
        const task = new Task({
            worker: (a: number, b: number) => a + b,
            workerParams,
        });

        const newWorkerParams: [p1: number, p2: number] = [3, 4];
        task.workerParams = newWorkerParams;
        expect(task.workerParams).toEqual(newWorkerParams);
    });

    describe("call execute method", () => {
        test("throws with undefined worker or workerParams", () => {
            expect(() => new Task().execute()).toThrowError(
                "no worker or workerParams is set for this task",
            );

            expect(() =>
                new Task({ worker: (a: number, b: number) => a + b }).execute(),
            ).toThrowError("no worker or workerParams is set for this task");

            expect(() =>
                new Task({ workerParams: [1, 2] }).execute(),
            ).toThrowError("no worker or workerParams is set for this task");
        });

        test("returns with defined worker and workerParams", () => {
            expect(
                new Task({
                    worker: (a: number, b: number) => a + b,
                    workerParams: [1, 2],
                }).execute(),
            ).toBe(3);
        });
    });

    describe("get result property", () => {
        test("sets after task execution", () => {
            const task = new Task({
                worker: (a: number, b: number) => a + b,
                workerParams: [1, 2],
            });

            expect(task.result).toBeUndefined();

            task.execute();
            expect(task.result).toBe(3);
        });

        test("updates after each execution of task", () => {
            let globalCount = 0;
            const task = new Task({
                worker: () => {
                    globalCount += 1;
                    return globalCount;
                },
                workerParams: [],
            });

            expect(globalCount).toBe(0);
            expect(task.result).toBeUndefined();

            task.execute();
            expect(globalCount).toBe(1);
            expect(task.result).toBe(1);

            task.execute();
            expect(globalCount).toBe(2);
            expect(task.result).toBe(2);
        });

        test("resets after change of worker or workerParams", () => {
            const task = new Task({
                worker: (a: number, b: number) => a + b,
                workerParams: [1, 2],
            });

            task.execute();
            expect(task.result).toBe(3);

            task.worker = (c, d) => c - d;
            expect(task.result).toBeUndefined();

            task.execute();
            expect(task.result).toBe(-1);

            task.workerParams = [10, 5];
            expect(task.result).toBeUndefined();

            task.execute();
            expect(task.result).toBe(5);
        });
    });
});
