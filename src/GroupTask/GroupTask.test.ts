import { describe, test, expect } from "vitest";

import { GroupTask } from "./GroupTask.js";
import type {
    GroupTaskModeT,
    GroupSubTasksT,
    GroupTaskConfigI,
} from "./GroupTask.js";

import { Task } from "../Task/Task.js";
import type { TaskWorkerT } from "../Task/Task.js";

describe("GroupTask class", () => {
    describe("constructor initialization", () => {
        test("throws with no config", () => {
            const nullConfig = null as unknown as GroupTaskConfigI<
                unknown[],
                unknown
            >;
            expect(() => new GroupTask(nullConfig)).toThrowError(
                "cannot create grouptask without config",
            );
        });

        test("throws with invalid mode", () => {
            const invalidTypeConfig = {
                mode: "invalid",
            } as unknown as GroupTaskConfigI<unknown[], unknown>;
            expect(() => new GroupTask(invalidTypeConfig)).toThrowError(
                "invalid grouptask mode",
            );
        });

        test("throws with no subTasks", () => {
            const noSubTasksConfig = {
                mode: "series",
                subTasks: [],
            } as unknown as GroupTaskConfigI<unknown[], unknown>;
            expect(() => new GroupTask(noSubTasksConfig)).toThrowError(
                "subTasks cannot be empty",
            );
        });

        test("with valid mode and single Task in subTasks", () => {
            const mode: GroupTaskModeT = "series";
            const subTasks: GroupSubTasksT<number[], number> = [new Task()];
            const groupTask = new GroupTask({ mode, subTasks });

            expect(groupTask).toBeInstanceOf(GroupTask);
            expect(groupTask.mode).toBe(mode);
            expect(groupTask.subTasks).toEqual(subTasks);
            expect(groupTask.result).toBeUndefined();
        });

        test("with valid mode and subTasks", () => {
            const type1: GroupTaskModeT = "series";
            const subTasks1: GroupSubTasksT<number[], number> = [
                new Task(),
                new Task(),
            ];
            const groupTask1 = new GroupTask({
                mode: type1,
                subTasks: subTasks1,
            });

            const type2: GroupTaskModeT = "parallel";
            const subTasks2: GroupSubTasksT<number[], number> = [
                new Task(),
                groupTask1,
                new Task(),
            ];
            const groupTask2 = new GroupTask({
                mode: type2,
                subTasks: subTasks2,
            });

            const type3: GroupTaskModeT = "series";
            const subTasks3: GroupSubTasksT<number[], number> = [
                new Task(),
                groupTask2,
                new Task(),
            ];
            const groupTask3 = new GroupTask({
                mode: type3,
                subTasks: subTasks3,
            });

            expect(groupTask3).toBeInstanceOf(GroupTask);
            expect(groupTask3.mode).toBe(type3);
            expect(groupTask3.subTasks).toEqual(subTasks3);
            expect(groupTask3.result).toBeUndefined();

            expect(groupTask3.subTasks[1]).toBeInstanceOf(GroupTask);
            expect(groupTask3.subTasks[1].mode).toBe(type2);
            expect(groupTask3.subTasks[1].subTasks).toEqual(subTasks2);
            expect(groupTask3.subTasks[1].result).toBeUndefined();

            expect(groupTask3.subTasks[1].subTasks[1]).toBeInstanceOf(
                GroupTask,
            );
            expect(groupTask3.subTasks[1].subTasks[1].mode).toBe(type1);
            expect(groupTask3.subTasks[1].subTasks[1].subTasks).toEqual(
                subTasks1,
            );
            expect(groupTask3.subTasks[1].subTasks[1].result).toBeUndefined();
        });
    });

    test("get type property", () => {
        const type: GroupTaskModeT = "parallel";
        const subTasks: GroupSubTasksT<number[], number> = [
            new Task(),
            new Task(),
        ];
        const groupTask = new GroupTask({ type, subTasks });

        expect(groupTask.type).toBe(type);
    });

    test("get mode property", () => {
        const mode: GroupTaskModeT = "parallel";
        const subTasks: GroupSubTasksT<number[], number> = [
            new Task(),
            new Task(),
        ];
        const groupTask = new GroupTask({ mode, subTasks });

        expect(groupTask.mode).toBe(mode);
    });

    test("get subTasks property", () => {
        const mode: GroupTaskModeT = "series";
        const subTasks: GroupSubTasksT<number[], number> = [
            new Task({
                worker: (a: number, b: number) => a + b,
                workerParams: [1, 2],
            }),
            new GroupTask({
                mode: "series",
                subTasks: [
                    new Task({
                        worker: (a: number, b: number) => a * b,
                        workerParams: [1, 2],
                    }),
                    new Task({
                        worker: (c: number, d: number) => c / d,
                        workerParams: [3, 4],
                    }),
                ],
            }),
            new Task({
                worker: (c: number, d: number) => c - d,
                workerParams: [3, 4],
            }),
        ];
        const groupTask = new GroupTask({ mode, subTasks });

        expect(groupTask.subTasks).toEqual(subTasks);
    });

    describe("call execute method", () => {
        type myWorker = TaskWorkerT<[number, number], number>;
        const adder: myWorker = (a, b) => a + b;
        const multiplier: myWorker = (a, b) => a * b;
        const subtractor: myWorker = (a, b) => a - b;

        type myAsyncWorker = TaskWorkerT<[number, number], Promise<number>>;
        const asyncAdder: myAsyncWorker = (a, b) =>
            new Promise((resolve) => setTimeout(() => resolve(a + b), 150));
        const asyncMultiplier: myAsyncWorker = (a, b) =>
            new Promise((resolve) => setTimeout(() => resolve(a * b), 75));
        const asyncSubtractor: myAsyncWorker = (a, b) =>
            new Promise((resolve) => setTimeout(() => resolve(a - b), 37));

        const syncTask1 = new Task({
            worker: adder,
            workerParams: [1, 2],
        });
        const syncTask2 = new Task({
            worker: multiplier,
            workerParams: [3, 4],
        });
        const syncTask3 = new Task({
            worker: subtractor,
            workerParams: [5, 6],
        });

        const asyncTask1 = new Task({
            worker: asyncAdder,
            workerParams: [1, 2],
        });
        const asyncTask2 = new Task({
            worker: asyncMultiplier,
            workerParams: [3, 4],
        });
        const asyncTask3 = new Task({
            worker: asyncSubtractor,
            workerParams: [5, 6],
        });

        const syncTasksInSeries = new GroupTask({
            mode: "series",
            subTasks: [syncTask1, syncTask2, syncTask3],
        });
        const syncTasksInParallel = new GroupTask({
            mode: "parallel",
            subTasks: [syncTask1, syncTask2, syncTask3],
        });

        const asyncTasksInSeries = new GroupTask({
            mode: "series",
            subTasks: [asyncTask1, asyncTask2, asyncTask3],
        });
        const asyncTasksInParallel = new GroupTask({
            mode: "parallel",
            subTasks: [asyncTask1, asyncTask2, asyncTask3],
        });

        const result = [3, 12, -1];

        test("for sync tasks in series", async () => {
            expect(await syncTasksInSeries.execute()).toEqual(result);
        });

        test("for sync tasks in parallel", async () => {
            expect(await syncTasksInParallel.execute()).toEqual(result);
        });

        test("for async tasks in series", async () => {
            expect(await asyncTasksInSeries.execute()).toEqual(result);
        });

        test("for async tasks in parallel", async () => {
            expect(await asyncTasksInParallel.execute()).toEqual(result);
        });

        test("for nested subTasks", async () => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const groupTask = new GroupTask<any, any>({
                mode: "series",
                subTasks: [
                    syncTasksInSeries,
                    syncTask1,
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    new GroupTask<any, any>({
                        mode: "parallel",
                        subTasks: [
                            syncTasksInParallel,
                            asyncTask2,
                            asyncTasksInSeries,
                        ],
                    }),
                    asyncTasksInParallel,
                ],
            });
            const result = [
                [3, 12, -1],
                3,
                [[3, 12, -1], 12, [3, 12, -1]],
                [3, 12, -1],
            ];

            expect(await groupTask.execute()).toEqual(result);
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

    describe("get result property", () => {
        test("sets after task execution", async () => {
            const groupTask = new GroupTask({
                mode: "series",
                subTasks: [
                    new Task({
                        worker: (a: number, b: number) => a + b,
                        workerParams: [1, 2],
                    }),
                    new GroupTask({
                        mode: "parallel",
                        subTasks: [
                            new Task({
                                worker: (a: number, b: number) => a - b,
                                workerParams: [1, 2],
                            }),
                            new GroupTask({
                                mode: "series",
                                subTasks: [
                                    new Task({
                                        worker: (a: number, b: number) => a * b,
                                        workerParams: [1, 2],
                                    }),
                                    new Task({
                                        worker: (a: number, b: number) => a / b,
                                        workerParams: [1, 2],
                                    }),
                                ],
                            }),
                        ],
                    }),
                ],
            });

            expect(groupTask.result).toBeUndefined();

            await groupTask.execute();
            const result = [3, [-1, [2, 1 / 2]]];

            expect(groupTask.result).toEqual(result);
            expect(groupTask.subTasks[0].result).toEqual(result[0]);
            expect(groupTask.subTasks[1].result).toEqual(result[1]);

            expect(groupTask.subTasks[1].subTasks[0].result).toEqual(
                result[1][0],
            );
            expect(groupTask.subTasks[1].subTasks[1].result).toEqual(
                result[1][1],
            );

            expect(
                groupTask.subTasks[1].subTasks[1].subTasks[0].result,
            ).toEqual(result[1][1][0]);
            expect(
                groupTask.subTasks[1].subTasks[1].subTasks[1].result,
            ).toEqual(result[1][1][1]);
        });

        test("updates after each execution of task", async () => {
            let globalCount = 0;

            const mode: GroupTaskModeT = "series";
            const subTasks: GroupSubTasksT<[], number> = [
                new Task({
                    worker: () => {
                        globalCount += 5;
                        return globalCount;
                    },
                    workerParams: [],
                }),
                new Task({
                    worker: () => {
                        globalCount -= 3;
                        return globalCount;
                    },
                    workerParams: [],
                }),
            ];
            const groupTask = new GroupTask({ mode, subTasks });

            expect(globalCount).toBe(0);
            expect(groupTask.result).toBeUndefined();

            await groupTask.execute();
            expect(globalCount).toBe(2);
            expect(groupTask.result).toEqual([5, 2]);

            await groupTask.execute();
            expect(globalCount).toBe(4);
            expect(groupTask.result).toEqual([7, 4]);
        });
    });
});
