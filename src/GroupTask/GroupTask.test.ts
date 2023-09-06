import { describe, test, expect } from "vitest";

import type { TaskWorkerParamsT, TaskWorkerT } from "../BaseTask/BaseTask.js";

import { Task } from "../Task/Task.js";
import type { TaskResultT } from "../Task/Task.js";

import { GroupTask, GROUPTASKERROR } from "./GroupTask.js";
import type {
    GroupTaskModeT,
    GroupSubTasksT,
    GroupTaskConfigI,
    GroupTaskResultT,
} from "./GroupTask.js";

describe("GroupTask class", () => {
    // prepare a few workers, workerParams, Tasks, and results to be used in tests
    type mySyncWorker = TaskWorkerT<[p: number, q: number], number>;
    type myAsyncWorker = TaskWorkerT<[p: number, q: number], Promise<number>>;
    type myParams = TaskWorkerParamsT<[p: number, q: number]>;

    const adder: mySyncWorker = (a, b) => a + b;
    const asyncAdder: myAsyncWorker = (a, b) =>
        new Promise((resolve) => setTimeout(() => resolve(a + b), 150));
    const adderParams: myParams = [1, 2];

    const subtractor: mySyncWorker = (a, b) => a - b;
    const asyncSubtractor: myAsyncWorker = (a, b) =>
        new Promise((resolve) => setTimeout(() => resolve(a - b), 37));
    const subtractorParams: myParams = [3, 4];

    const multiplier: mySyncWorker = (a, b) => a * b;
    const asyncMultiplier: myAsyncWorker = (a, b) =>
        new Promise((resolve) => setTimeout(() => resolve(a * b), 75));
    const multiplierParams: myParams = [5, 6];

    const syncTask1 = new Task({
        worker: adder,
        workerParams: adderParams,
    });
    const syncTask2 = new Task({
        worker: subtractor,
        workerParams: subtractorParams,
    });
    const syncTask3 = new Task({
        worker: multiplier,
        workerParams: multiplierParams,
    });

    const asyncTask1 = new Task({
        worker: asyncAdder,
        workerParams: adderParams,
    });
    const asyncTask2 = new Task({
        worker: asyncSubtractor,
        workerParams: subtractorParams,
    });
    const asyncTask3 = new Task({
        worker: asyncMultiplier,
        workerParams: multiplierParams,
    });

    const task1Result: TaskResultT<number> = 3;
    const task2Result: TaskResultT<number> = -1;
    const task3Result: TaskResultT<number> = 30;

    const series: GroupTaskModeT = "series";
    const parallel: GroupTaskModeT = "parallel";

    describe("constructor initialization", () => {
        test("throws with no config", () => {
            const nullConfig = null as unknown as GroupTaskConfigI<
                unknown[],
                unknown
            >;
            expect(() => new GroupTask(nullConfig)).toThrowError(
                GROUPTASKERROR.NO_CONFIG,
            );
        });

        test("throws with invalid mode", () => {
            const invalidTypeConfig = {
                mode: "invalid",
            } as unknown as GroupTaskConfigI<unknown[], unknown>;
            expect(() => new GroupTask(invalidTypeConfig)).toThrowError(
                GROUPTASKERROR.INVALID_MODE,
            );
        });

        test("throws with no subTasks", () => {
            const noSubTasksConfig = {
                mode: series,
                subTasks: [],
            } as unknown as GroupTaskConfigI<unknown[], unknown>;
            expect(() => new GroupTask(noSubTasksConfig)).toThrowError(
                GROUPTASKERROR.EMPTY_SUBTASKS,
            );
        });

        test("with valid mode and single Task in subTasks", () => {
            const groupTask = new GroupTask({
                mode: series,
                subTasks: [syncTask1],
            });

            expect(groupTask).toBeInstanceOf(GroupTask);
            expect(groupTask.mode).toBe(series);
            expect(groupTask.subTasks).toEqual([syncTask1]);
            expect(groupTask.result).toBeUndefined();
        });

        test("with valid mode and subTasks", () => {
            const groupTask1 = new GroupTask({
                mode: series,
                subTasks: [syncTask1, syncTask2],
            });

            const subTasks2: GroupSubTasksT<number[], number> = [
                syncTask1,
                groupTask1,
                syncTask2,
            ];
            const groupTask2 = new GroupTask({
                mode: parallel,
                subTasks: subTasks2,
            });

            const subTasks3: GroupSubTasksT<number[], number> = [
                syncTask1,
                groupTask2,
                syncTask2,
            ];
            const groupTask3 = new GroupTask({
                mode: series,
                subTasks: subTasks3,
            });

            expect(groupTask3).toBeInstanceOf(GroupTask);
            expect(groupTask3.mode).toBe(series);
            expect(groupTask3.subTasks).toEqual(subTasks3);
            expect(groupTask3.result).toBeUndefined();

            const gt2 = groupTask3.subTasks[1] as typeof groupTask2;
            expect(gt2).toBeInstanceOf(GroupTask);
            expect(gt2.mode).toBe(parallel);
            expect(gt2.subTasks).toEqual(subTasks2);
            expect(gt2.result).toBeUndefined();

            const gt1 = gt2.subTasks[1] as typeof groupTask1;
            expect(gt1).toBeInstanceOf(GroupTask);
            expect(gt1.mode).toBe(series);
            expect(gt1.subTasks).toEqual([syncTask1, syncTask2]);
            expect(gt1.result).toBeUndefined();
        });
    });

    test("get and set type property", () => {
        const groupTask = new GroupTask({
            type: series,
            subTasks: [syncTask1, syncTask2],
        });

        expect(groupTask.type).toBe(series);
        groupTask.type = parallel;
        expect(groupTask.type).toBe(parallel);
    });

    test("get and set mode property", () => {
        const groupTask = new GroupTask({
            mode: series,
            subTasks: [syncTask1, syncTask2],
        });

        expect(groupTask.mode).toBe(series);
        groupTask.mode = parallel;
        expect(groupTask.mode).toBe(parallel);
    });

    test("get and set subTasks property", () => {
        const groupTask = new GroupTask({
            mode: series,
            subTasks: [syncTask1, syncTask2],
        });

        expect(groupTask.subTasks).toEqual([syncTask1, syncTask2]);
        groupTask.subTasks = [syncTask1, syncTask1, syncTask2];
        expect(groupTask.subTasks).toEqual([syncTask1, syncTask1, syncTask2]);
    });

    describe("call execute method", () => {
        const syncTasksInSeries = new GroupTask({
            mode: series,
            subTasks: [syncTask1, syncTask2, syncTask3],
        });
        const syncTasksInParallel = new GroupTask({
            mode: parallel,
            subTasks: [syncTask1, syncTask2, syncTask3],
        });

        const asyncTasksInSeries = new GroupTask({
            mode: series,
            subTasks: [asyncTask1, asyncTask2, asyncTask3],
        });
        const asyncTasksInParallel = new GroupTask({
            mode: parallel,
            subTasks: [asyncTask1, asyncTask2, asyncTask3],
        });

        const groupTaskResult: GroupTaskResultT<number> = [
            task1Result,
            task2Result,
            task3Result,
        ];

        test("for sync tasks in series", async () => {
            expect(await syncTasksInSeries.execute()).toEqual(groupTaskResult);
        });

        test("for sync tasks in parallel", async () => {
            expect(await syncTasksInParallel.execute()).toEqual(
                groupTaskResult,
            );
        });

        test("for async tasks in series", async () => {
            expect(await asyncTasksInSeries.execute()).toEqual(groupTaskResult);
        });

        test("for async tasks in parallel", async () => {
            expect(await asyncTasksInParallel.execute()).toEqual(
                groupTaskResult,
            );
        });

        test("for nested subTasks", async () => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const groupTask = new GroupTask<any, any>({
                mode: series,
                subTasks: [
                    syncTasksInSeries,
                    syncTask1,
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    new GroupTask<any, any>({
                        mode: parallel,
                        subTasks: [
                            syncTasksInParallel,
                            asyncTask2,
                            asyncTasksInSeries,
                        ],
                    }),
                    asyncTasksInParallel,
                ],
            });
            const nestedResult = [
                groupTaskResult,
                task1Result,
                [groupTaskResult, task2Result, groupTaskResult],
                groupTaskResult,
            ];

            expect(await groupTask.execute()).toEqual(nestedResult);
        });

        test("should take nearly same time for sync tasks in series and parallel", async () => {
            let start = Date.now();
            await syncTasksInSeries.execute();
            let end = Date.now();
            const timeForSeries = end - start;

            start = Date.now();
            await syncTasksInParallel.execute();
            end = Date.now();
            const timeForParallel = end - start;

            expect(timeForSeries).toBeCloseTo(timeForParallel);
        });

        test("should take more time for async tasks in series than in parallel", async () => {
            let start = Date.now();
            await asyncTasksInSeries.execute();
            let end = Date.now();
            const timeForSeries = end - start;

            start = Date.now();
            await asyncTasksInParallel.execute();
            end = Date.now();
            const timeForParallel = end - start;

            expect(timeForSeries).toBeGreaterThan(timeForParallel);
        });
    });
});
