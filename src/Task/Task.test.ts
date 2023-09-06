import { describe, test, expect } from "vitest";

import type { TaskWorkerParamsT, TaskWorkerT } from "../BaseTask/BaseTask.js";

import { Task, TASKERROR } from "./Task.js";
import type { TaskResultT } from "./Task.js";

describe("Task class", () => {
    // prepare a few workers, workerParams, and result to be used in tests
    const adder: TaskWorkerT<[p: number, q: number], number> = (a, b) => a + b;
    const adderParams: TaskWorkerParamsT<[p: number, q: number]> = [1, 2];
    const adderResult: TaskResultT<number> = 3;

    const subtractor: TaskWorkerT<[p: number, q: number], number> = (a, b) =>
        a - b;
    const subtractorParams: TaskWorkerParamsT<[p: number, q: number]> = [3, 4];
    const subtractorResult: TaskResultT<number> = -1;

    const ERROR_FROM_WORKER = "error from worker";
    const throwingWorker: TaskWorkerT<[], never> = () => {
        throw new Error(ERROR_FROM_WORKER);
    };
    const throwingWorkerParams: TaskWorkerParamsT<[]> = [];

    describe("call execute method", () => {
        describe("with no fallback config", () => {
            test("throws with undefined worker or workerParams", () => {
                expect(() => new Task().execute()).toThrowError(
                    TASKERROR.NO_CONFIG,
                );

                expect(() =>
                    new Task({ worker: adder }).execute(),
                ).toThrowError(TASKERROR.NO_WORKERPARAMS);

                expect(() =>
                    new Task({ workerParams: adderParams }).execute(),
                ).toThrowError(TASKERROR.NO_WORKER);
            });

            test("throws with throwing worker", () => {
                expect(() =>
                    new Task({
                        worker: throwingWorker,
                        workerParams: throwingWorkerParams,
                    }).execute(),
                ).toThrowError(ERROR_FROM_WORKER);
            });

            test("returns with defined worker and workerParams", () => {
                expect(
                    new Task({
                        worker: adder,
                        workerParams: adderParams,
                    }).execute(),
                ).toBe(adderResult);
            });
        });

        describe("with fallback config", () => {
            test("throws with missing fallback and undefined worker or workerParams", () => {
                expect(() =>
                    new Task<number[], number>().execute({ worker: adder }),
                ).toThrowError(TASKERROR.NO_WORKERPARAMS);

                expect(() =>
                    new Task<number[], number>().execute({
                        workerParams: adderParams,
                    }),
                ).toThrowError(TASKERROR.NO_WORKER);

                expect(() =>
                    new Task({
                        worker: adder,
                    }).execute({
                        worker: subtractor,
                    }),
                ).toThrowError(TASKERROR.NO_WORKERPARAMS);

                expect(() =>
                    new Task({ workerParams: adderParams }).execute({
                        workerParams: subtractorParams,
                    }),
                ).toThrowError(TASKERROR.NO_WORKER);
            });

            test("throws with correct fallback which throws error", () => {
                expect(() =>
                    new Task({ workerParams: adderParams }).execute({
                        worker: throwingWorker,
                    }),
                ).toThrowError(ERROR_FROM_WORKER);
            });

            test("returns with correct fallback and undefined worker or workerParams", () => {
                expect(
                    new Task<
                        typeof adderParams,
                        ReturnType<typeof adder>
                    >().execute({
                        worker: adder,
                        workerParams: adderParams,
                    }),
                ).toBe(adderResult);

                expect(
                    new Task({
                        worker: adder,
                    }).execute({
                        workerParams: adderParams,
                    }),
                ).toBe(adderResult);

                expect(
                    new Task({ workerParams: subtractorParams }).execute({
                        worker: subtractor,
                    }),
                ).toBe(subtractorResult);
            });

            test("returns with defined worker and workerParams", () => {
                expect(
                    new Task({
                        worker: adder,
                        workerParams: adderParams,
                    }).execute({
                        worker: subtractor,
                        workerParams: subtractorParams,
                    }),
                ).toBe(adderResult);
            });
        });
    });
});
