import { assertEquals, assertThrows } from "https://deno.land/std/testing/asserts.ts";

import {parseArgs, ArgType, ParamOption} from './argparse.ts'

Deno.test('argparse.1 - should succeed in the simplest of cases', () => {
    const result = parseArgs([
        {
            shortName: 'a',
            longName: 'after',
        }
    ], ['--after'])
    assertEquals(result.knobs.after, true)
})

Deno.test('argparse.2 - should throw because missing param', () => {
    assertThrows(() => {
        parseArgs([
            {
                shortName: 'a',
                longName: 'after',
                paramOption: ParamOption.one
            }
        ], ['--after'])
    })
})

Deno.test('argparse.3 - should be able to parse values', () => {
    const val = [1,2,3]
    const paramVal = JSON.stringify(val)
    function valueParser(v: string) {
        return JSON.parse(v)
    }
    const result = parseArgs([
        {
            shortName: 'a',
            longName: 'after',
            paramOption: ParamOption.one,
            valueParser
        }
    ], ['--after', paramVal])
    assertEquals(result.knobs.after, val)
})

Deno.test('argparse.4 - should be able to handle more complex arguments', () => {
    const result = parseArgs([
        {
            shortName: 'b',
            longName: 'before',
        },
        {
            shortName: 'a',
            longName: 'after',
            paramOption: ParamOption.one,
        },
        {
            shortName: 'c',
            longName: 'counter',
            paramOption: ParamOption.zero,
        },
        {
            shortName: 't',
            longName: 'test',
            argType: ArgType.command
        },
        {
            shortName: 'r',
            longName: 'run',
            argType: ArgType.command
        },
    ], ['test', '--after', '1', '-b', '2', '-c', 'value1', 'value2'])
    assertEquals(result.command, 'test')
    assertEquals(result.knobs.after, '1')
    assertEquals(result.knobs.before, '2')
    assertEquals(result.knobs.counter, true)
    assertEquals(result.values, ['value1', 'value2'])
})

Deno.test('argparse.5 - throw if argument looks like a knob but is not configured as a knob', () => {
    assertThrows(() => {
        parseArgs([
            {
                longName: 'after',
                shortName: 'a',
                argType: ArgType.command
            }
        ], ['--after'])
    })
})
