import { describe, test, expect } from "vitest";
import Task from "./index";

describe("Task class", () => {
    describe("constructor initializtion", () => {
        test("with worker not having 0 parameters", () => {
            const worker = (name: string, age: number, subjects: string[]) => {
                return { name, age, subjects };
            };
            const workerParams: [
                name: string,
                age: number,
                subjects: string[],
            ] = ["Student", 18, ["Physics", "Chemistry", "Maths"]];
            const task = new Task(workerParams, worker);

            expect(task).toBeInstanceOf(Task);
            expect(task.worker).toBe(worker);
            expect(task.workerParams).toEqual(workerParams);
            expect(task.result).toBeUndefined();
        });

        test("with worker having 0 parameters", () => {
            const worker = () => `Hello World!`;
            const workerParams: [] = [];
            const task = new Task(workerParams, worker);

            expect(task).toBeInstanceOf(Task);
            expect(task.worker).toBe(worker);
            expect(task.workerParams).toEqual([]);
            expect(task.result).toBeUndefined();
        });

        test("with no worker", () => {
            const workerParams = ["Hello", "World"];
            const task = new Task(workerParams);

            expect(task).toBeInstanceOf(Task);
            expect(task.worker).toBeUndefined();
            expect(task.workerParams).toEqual(workerParams);
            expect(task.result).toBeUndefined();
        });
    });

    describe("execute method", () => {
        test("with worker", () => {
            const task = new Task(["Name", 20], (name: string, age: number) => {
                return { name, age };
            });

            expect(task.result).toBeUndefined();

            const result = task.execute();
            expect(result).toEqual({ name: "Name", age: 20 });

            expect(task.result).toEqual(result);
        });

        test("without worker", () => {
            const task = new Task([1, 2]);

            expect(task.result).toBeUndefined();

            expect(() => task.execute()).toThrowError(
                "no worker is set for this task",
            );

            expect(task.result).toBeUndefined();
        });

        test("with worker which throws error", () => {
            const task = new Task([], () => {
                throw new Error("something went wrong");
            });

            expect(task.result).toBeUndefined();

            expect(() => task.execute()).toThrowError("something went wrong");

            expect(task.result).toBeUndefined();
        });
    });

    describe("setWorker method", () => {
        test("to task with no worker", () => {
            const task = new Task([1, 2]);

            expect(task.worker).toBeUndefined();

            const worker = (x: number, y: number) => x + y;
            task.worker = worker;

            expect(task.worker).toBe(worker);
        });

        test("to task with worker", () => {
            const worker = (x: number, y: number) => x + y;
            const task = new Task([1, 2], worker);

            expect(task.worker).toBe(worker);

            const newWorker = (x: number, y: number) => x - y;
            task.worker = newWorker;

            expect(task.worker).toBe(newWorker);
        });
    });

    describe("getResult method", () => {
        test("returns updated result after each execution", () => {
            let globalCount = 0;
            const worker = () => {
                globalCount += 1;
                return globalCount;
            };
            const task = new Task([], worker);

            expect(task.result).toBeUndefined();
            expect(globalCount).toBe(0);

            expect(task.execute()).toBe(1);
            expect(task.result).toBe(1);
            expect(globalCount).toBe(1);

            expect(task.execute()).toBe(2);
            expect(task.result).toBe(2);
            expect(globalCount).toBe(2);
        });

        const worker = (x: number, y: number) => x + y;

        test("returns undefined as result resets after change of worker", () => {
            const task = new Task([1, 2], worker);

            expect(task.result).toBeUndefined();

            expect(task.execute()).toBe(3);

            const newWorker = (x: number, y: number) => x - y;
            task.worker = newWorker;

            expect(task.result).toBeUndefined();
        });

        test("returns result according to current worker", () => {
            const task = new Task([1, 2], worker);

            expect(task.result).toBeUndefined();

            expect(task.execute()).toBe(3);

            const newWorker = (x: number, y: number) => x - y;
            task.worker = newWorker;

            expect(task.result).toBeUndefined();

            expect(task.execute()).toBe(-1);
            expect(task.result).toBe(-1);
        });
    });
});
