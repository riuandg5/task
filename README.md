# [@riuandg5/task-execute](https://www.npmjs.com/package/@riuandg5/task-execute) &middot; ![GitHub licence: MIT](https://img.shields.io/github/license/riuandg5/task-execute) ![GitHub release](https://img.shields.io/github/v/release/riuandg5/task-execute) ![npm downloads](https://img.shields.io/npm/dt/%40riuandg5/task-execute)

> A utility to create tasks, group tasks, and execute.

## Installation

To install package, run:

```
$ npm install -S @riuandg5/task-execute
```

then import the `Task` and `GroupTask` classes from the package:

```ts
import { Task, GroupTask } from "@riuandg5/task-execute";
```

also import types and interfaces if needed:

```ts
import type {
    TaskWorkerT,
    TaskWorkerParamsT,
    TaskConfigI,
    TaskResultT,
    GroupTaskModeT,
    GroupSubTasksT,
    GroupTaskConfigI,
    GroupTaskResultT,
} from "@riuandg5/task-execute";
```

## API

The detailed API docs generated from [TSDoc](https://github.com/microsoft/tsdoc) style comments using [TypeDoc](https://github.com/TypeStrong/typedoc) can be found [here](https://riuandg5.github.io/task-execute/).

## License

[MIT License](LICENSE) © Rishu Anand
