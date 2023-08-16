# [@riuandg5/task-execute](https://www.npmjs.com/package/@riuandg5/task-execute) &middot; ![GitHub licence: MIT](https://img.shields.io/github/license/riuandg5/task-execute) ![GitHub release](https://img.shields.io/github/v/release/riuandg5/task-execute) ![npm downloads](https://img.shields.io/npm/dt/%40riuandg5/task-execute)

> A utility to create tasks, group tasks, and execute.

## <a name='Installationandusage'></a>Installation and usage

To install and use package, run:

```
$ npm install -S @riuandg5/task-execute
```

then import the `Task` class from the package:

```ts
import Task from "@riuandg5/task-execute";
```

## API

## `Task`

The `Task` interface provides the ability to create, manage and execute an individual task.

### Constructor

Creates and returns a new `Task`.

```ts
new Task<T, R>(taskConfig?: TaskConfigI<T, R>);
```

#### Parameters

-   `taskConfig`

    | type                | required | defaut | description                                             |
    | ------------------- | -------- | ------ | ------------------------------------------------------- |
    | `TaskConfigI<T, R>` | no       | `{}`   | Use to configure task with `worker` and `workerParams`. |

    ```ts
    const taskConfig: TaskConfigI<[p1: number, p2: string], boolean> = {
        worker: (num, str) => num === str.length,
        workerParams: [11, "hello world"],
    };
    const task = new Task(taskConfig);

    // OR

    const task = new Task({
        worker: (num: number, str: string) => num === str.length,
        workerParams: [11, "hello world"],
    });
    ```

### Properties

|                | readonly | type            | default     | description                                   |
| -------------- | -------- | --------------- | ----------- | --------------------------------------------- |
| `worker`       | no       | `WorkerT<T, R>` | `undefined` | Use to get or set `worker` of the task.       |
| `workerParams` | no       | `T`             | `undefined` | Use to get or set `workerParams` of the task. |
| `result`       | yes      | `R`             | `undefined` | Use to get `result` of the task execution.    |

```ts
const task = newTask({
    worker: (a: number, b: number) => a + b,
    workerParams: [1, 2],
});

// get worker
console.log(task.worker);
// set worker
task.worker = (c, d) => c * d;

// get workerParams
console.log(task.workerParams);
// set workerParams
task.workerParams = [4, 5];

// get result
console.log(task.result);
```

> **NOTE**
>
> Do not leave or set `workerParams` to `undefined` if `worker` does not require any parameters.
>
> Set it as an empty array `[]`.
>
> ```ts
> const task = new Task({ worker: () => "hello world", workerParams: [] });
> ```

### Methods

`execute()`

Use to execute the task which basically calls the `worker` with `workerParams`.

```ts
task.execute(fbConfig?: taskConfigI<T, R>);
```

-   Parameters

    `fbConfig`

    | type                | required | defaut | description                                         |
    | ------------------- | -------- | ------ | --------------------------------------------------- |
    | `TaskConfigI<T, R>` | no       | `{}`   | Use to provide fallback configuration for the task. |

    > **NOTE**
    >
    > A task must have a `worker` and `workerParams` defined at the time of execution.
    >
    > If any of them is `undefined`, then it should be set or provided via the `fbConfig` to use for the execution, else it will throw an error.
    >
    > `fbConfig` does not set the `worker` or `workerParams` but only provides the temporary value to fallback on.
    >
    > If even fallback values are `undefined`, then it throws an error.

-   Returns

    | type | description                   |
    | ---- | ----------------------------- |
    | `R`  | Result of the task execution. |

-   Example

    ```ts
    // without fallback config
    const task = new Task({
        worker: (a: number, b: number) => a + b,
        workerParams: [1, 2],
    });
    task.execute(); // returns 1 + 2  = 3

    // with fallback config
    const task = new Task({ workerParams: [1, 2] });
    task.execute({ worker: (c, d) => c * d }); // returns 1 * 2 = 2

    const task = new Task({ worker: (a, b) => a * b });
    task.execute({ workerParams: [4, 5] }); // returns 4 + 5 = 9

    const task = new Task<number[], number>();
    task.execute({ worker: (c, d) => c * d, workerParams: [4, 5] }); // returns 4 * 5 = 20
    ```

### Types

`TaskConfigI<T, R>`

```ts
{
    worker?: Worker<T, R>;
    workerParams?: T;
}
```

`WorkerT<T, R>`

```ts
(...workerParams: T) => R;
```

## License

[MIT License](LICENSE) © Rishu Anand
