# gulp-pipeline
Create a gulp task that runs a pipeline or pipeline task.

## Installation
```js
npm i @phylum/gulp-pipeline gulp
```

## Usage
```js
const gulp = require('gulp')
const wrap = require('@phylum/gulp-pipeline')
```

### `wrap(pipelineOrTask[, options])`
Create a gulp task from an existing pipeline or pipeline task.
```js
const gulpTask = wrap(async ctx => {
    console.log('Hello World!')
}, {
    name: 'example-task',
    description: 'Just another code example..'
})

// Usage example:
gulp.task(gulpTask)
```
+ pipelineOrTask `<Pipeline> | <function>` - A pipeline or a pipeline task.
+ options `<object>` - Optional. An object with the following options:
    + name `<string>` - Optional gulp task name. Default is `'pipeline'`
    + description `<string>` - Optional gulp task description.
    + flags `<object>` - Optional gulp task flags.
    + run `<string> | <function>` - Optional. The action to run the pipeline:
        + `'once'` - **Default.** Ensure that the pipeline is enabled. The task will complete when the pipeline resolves or rejects.
        + `'clean'` - Disable the pipeline, then enable. The task will complete when the pipeline resolves or rejects.
        + `<function>` - A function that is called with the pipeline as first argument and must return a promise to signal async completion.
    + autoDisposeUnused `<boolean>` - Optional. This option is passed to the pipeline constructor when a pipeline task is wrapped.
