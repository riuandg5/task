import { describe, bench } from "vitest";

import type { TaskWorkerParamsT, TaskWorkerT } from "../BaseTask/BaseTask.js";

import { Task } from "../Task/Task.js";

import { GroupTask } from "./GroupTask.js";
import type { GroupTaskModeT } from "./GroupTask.js";

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

const series: GroupTaskModeT = "series";
const parallel: GroupTaskModeT = "parallel";

const syncTasksInSeries = new GroupTask({
    type: series,
    subTasks: [
        syncTask1,
        syncTask2,
        syncTask3,
        syncTask1,
        syncTask2,
        syncTask3,
        syncTask1,
        syncTask2,
        syncTask3,
        syncTask1,
        syncTask2,
        syncTask3,
        syncTask1,
        syncTask2,
        syncTask3,
        syncTask1,
        syncTask2,
        syncTask3,
        syncTask1,
        syncTask2,
        syncTask3,
        syncTask1,
        syncTask2,
        syncTask3,
        syncTask1,
        syncTask2,
        syncTask3,
        syncTask1,
        syncTask2,
        syncTask3,
    ],
});
const syncTasksInParallel = new GroupTask({
    type: parallel,
    subTasks: [
        syncTask1,
        syncTask2,
        syncTask3,
        syncTask1,
        syncTask2,
        syncTask3,
        syncTask1,
        syncTask2,
        syncTask3,
        syncTask1,
        syncTask2,
        syncTask3,
        syncTask1,
        syncTask2,
        syncTask3,
        syncTask1,
        syncTask2,
        syncTask3,
        syncTask1,
        syncTask2,
        syncTask3,
        syncTask1,
        syncTask2,
        syncTask3,
        syncTask1,
        syncTask2,
        syncTask3,
        syncTask1,
        syncTask2,
        syncTask3,
    ],
});

const asyncTasksInSeries = new GroupTask({
    type: series,
    subTasks: [
        asyncTask1,
        asyncTask2,
        asyncTask3,
        asyncTask1,
        asyncTask2,
        asyncTask3,
        asyncTask1,
        asyncTask2,
        asyncTask3,
        asyncTask1,
        asyncTask2,
        asyncTask3,
        asyncTask1,
        asyncTask2,
        asyncTask3,
        asyncTask1,
        asyncTask2,
        asyncTask3,
        asyncTask1,
        asyncTask2,
        asyncTask3,
        asyncTask1,
        asyncTask2,
        asyncTask3,
        asyncTask1,
        asyncTask2,
        asyncTask3,
        asyncTask1,
        asyncTask2,
        asyncTask3,
    ],
});
const asyncTassInParallel = new GroupTask({
    type: parallel,
    subTasks: [
        asyncTask1,
        asyncTask2,
        asyncTask3,
        asyncTask1,
        asyncTask2,
        asyncTask3,
        asyncTask1,
        asyncTask2,
        asyncTask3,
        asyncTask1,
        asyncTask2,
        asyncTask3,
        asyncTask1,
        asyncTask2,
        asyncTask3,
        asyncTask1,
        asyncTask2,
        asyncTask3,
        asyncTask1,
        asyncTask2,
        asyncTask3,
        asyncTask1,
        asyncTask2,
        asyncTask3,
        asyncTask1,
        asyncTask2,
        asyncTask3,
        asyncTask1,
        asyncTask2,
        asyncTask3,
    ],
});

describe("sync tasks in series vs parallel", async () => {
    bench("sync tasks in series", async () => {
        await syncTasksInSeries.execute();
    });

    bench("sync tasks in parallel", async () => {
        await syncTasksInParallel.execute();
    });
});

describe("async tasks in series vs parallel", async () => {
    bench("async tasks in series", async () => {
        await asyncTasksInSeries.execute();
    });

    bench("async tasks in parallel", async () => {
        await asyncTassInParallel.execute();
    });
});
