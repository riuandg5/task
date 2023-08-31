import { describe, bench } from "vitest";
import { GroupTask } from "./GroupTask.js";
import { Task, WorkerT } from "../Task/Task.js";

type myWorker = WorkerT<[number, number], number>;
const adder: myWorker = (a, b) => a + b;
const multiplier: myWorker = (a, b) => a * b;
const subtractor: myWorker = (a, b) => a - b;

type myAsyncWorker = WorkerT<[number, number], Promise<number>>;
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
    type: "series",
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
    type: "parallel",
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
    type: "series",
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
    type: "parallel",
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
