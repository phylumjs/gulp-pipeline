'use strict'

const {Pipeline} = require('@phylum/pipeline')

function resolveRun(value) {
    if (typeof value === 'string') {
        switch (value) {
            case 'once': return pipeline => pipeline.enable()

            case 'clean': return pipeline => {
                pipeline.disable()
                return pipeline.enable()
            }
        }
    }
    if (typeof value === 'function') {
        return pipeline => {
            const promise = value(pipeline)
            if (!(promise instanceof Promise)) {
                return Promise.reject(new TypeError('options.run must return a promise.'))
            }
            return promise
        }
    }
    throw new TypeError('options.run must be "clean", "lazy" or a function.')
}

module.exports = (pipeline, {
    name = 'pipeline',
    description,
    flags,
    run: runOption = 'once',
    autoDisposeUnused
} = {}) => {
    if (!(pipeline instanceof Pipeline)) {
        pipeline = new Pipeline(pipeline, {autoDisposeUnused})
    }

    const run = resolveRun(runOption)
    const {[name]: task} = {[name]: () => run(pipeline)}
    if (description) {
        task.description = description
    }
    if (flags) {
        task.flags = flags
    }
    return task
}
