'use strict'

const test = require('ava')
const {Pipeline} = require('@phylum/pipeline')
const wrap = require('..')

test('basic usage', async t => {
    let done = false
    const task = wrap(() => {
        done = true
    })

    const state = task()
    t.true(state instanceof Promise)
    await state
    t.true(done)
})

test('use existing pipeline', async t => {
    let done = false
    const pipeline = new Pipeline(() => {
        done = true
    })
    const task = wrap(pipeline)
    await task()
    t.true(done)
})

test('autoDisposeUnused', async t => {
    function test(options, expected) {
        return wrap(ctx => {
            t.is(ctx.pipeline._autoDisposeUnused, expected)
        }, options)()
    }

    await test({}, true)
    await test({autoDisposeUnused: false}, false)
    await test({autoDisposeUnused: true}, true)
})

test('failing task', async t => {
    const task = wrap(() => {
        throw new Error('foo')
    })
    const err = await t.throwsAsync(task())
    t.is(err.message, 'foo')
})

test('task metadata', async t => {
    const task1 = wrap(() => {})
    t.is(task1.name, 'pipeline')
    t.is(task1.displayName, undefined)
    t.is(task1.description, undefined)
    t.is(task1.flags, undefined)

    const task2 = wrap(() => {}, {
        name: 'foo',
        description: 'bar',
        flags: {foo: 'bar'}
    })
    t.is(task2.name, 'foo')
    t.is(task2.displayName, undefined)
    t.is(task2.description, 'bar')
    t.deepEqual(task2.flags, {foo: 'bar'})
})

test('run: "once"', async t => {
    async function test(options) {
        let done = 0
        const task = wrap(ctx => {
            ctx.on('dispose', () => t.fail())
            done++
        }, options)
        const state1 = task()
        await state1
        const state2 = task()
        t.is(state1, state2)
        t.is(done, 1)
    }
    await test()
    await test({run: 'once'})
})

test('run: "clean"', async t => {
    let done = 0
    let disposed = 0
    const task = wrap(ctx => {
        ctx.on('dispose', () => disposed++)
        done++
    }, {run: 'clean'})
    await task()
    t.is(done, 1)
    t.is(disposed, 0)
    const state2 = task()
    t.is(disposed, 1)
    await state2
    t.is(done, 2)
})

test('run: function', async t => {
    const task = wrap(() => {
        t.fail()
    }, {run: async pipeline => {
        t.true(pipeline instanceof Pipeline)
        return 'foo'
    }})
    t.is(await task(), 'foo')
})

test('run: invalid', async t => {
    t.throws(() => wrap(() => {}, {run: 42}))
    await t.throwsAsync(wrap(() => {}, {run: () => 42})())
})
