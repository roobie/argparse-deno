/// Defines the available types for defining arguments A command is something
/// that is the main branching point for the CLI, like `run` vs `test`, e.g.
/// `deno run`
export enum ArgType {
    command = 'command',
    knob = 'knob', // maybe this should be switch - but that's a keyword
}

/// Defines the two possible defined modes for consuming parameters. Useful for
/// allowing a knob-argument to be followed by values that should be accumulated
/// in the general values array.
export enum ParamOption {
    zero,
    one,
}

/// A configuraiton for a single argument
export interface ArgConf {
    // The short name of the argument, such as -o or -R
    shortName: string
    // The long name of the argument, such as --open or --recursive
    longName: string
    // The type of argument. A command is the first non-knob argument, e.g. as
    // `run` in `deno run`, whereas a knob (switch) is something with at least
    // one prefixed dash. Defaults to knob.
    argType?: ArgType
    // Text to use when help is rendered.
    helpText?: string
    // Whether the knob is required (not really applicable to commands)
    isRequired?: boolean
    // Whether the arg requires exactly zero or one params, e.g.
    // --output-to=<requiredParam> or if not: --verbose. The tricky thing is
    // that values can come after knobs, so if a knob does not want a value, it
    // should not consume one (which will then be consumed in the general value
    // result).
    paramOption?: ParamOption
    // The function to parse the param to the knob. Defaults to the identity
    // function string->string
    valueParser?: (rawValue: string) => any
}

/// The array of configurations
export interface ArgsConf extends Array<ArgConf> {}

/// The result returned by the `parseArgs` function, and the like.
export interface ParseResult {
    command?: string
    knobs: Record<string, any>
    values: Array<any>
}

/// Using the supplied configurtion, parse the supplied arguments into a result.
export function parseArgs (conf: ArgsConf, args: string[]): any {
    const result: ParseResult = {
        knobs: {},
        values: [],
    }

    for (let i = 0; i < args.length; ++i) {
        const arg = args[i]
        const handleKnob = (ac: ArgConf) => {
            if (ac.argType && ac.argType !== ArgType.knob) {
                throw new Error('The argument ${arg} was detected as a knob, but is configured as a ${ac.argType}.')
            }
            // lookahead for param
            const oneAhead = args[i + 1]
            let oneAheadValue = null
            if (oneAhead && oneAhead.substring(0, 1) !== '-') {
                oneAheadValue = oneAhead
            }
            if (!oneAheadValue && ac.paramOption === ParamOption.one) {
                throw new Error(`The argument ${ac.longName} requires a parameter, but none was supplied.`)
            }
            if (oneAheadValue && !(ac.paramOption === ParamOption.zero)) {
                if (ac.valueParser) {
                    oneAheadValue = ac.valueParser(oneAheadValue)
                }
                result.knobs[ac.longName] = oneAheadValue
                i += 1
            } else {
                result.knobs[ac.longName] = true
            }
        }

        if (arg.substring(0, 2) === '--') {
            // long name
            const stripped = arg.substring(2)
            const found = conf.filter(c => c.longName === stripped)
            if (found.length) {
                handleKnob(found[0])
            }
        } else if (arg.substring(0, 1) === '-') {
            // short name
            const stripped = arg.substring(1)
            const found = conf.filter(c => c.shortName === stripped)
            if (found.length) {
                handleKnob(found[0])
            }
        } else {
            // might be a command or a value
            let foundCommand: ArgConf | null = null
            // at the moment, we require commands to be the first of all args.
            if (i === 0) {
                foundCommand = conf.filter(
                    c => c.argType === ArgType.command
                        && (c.shortName === arg
                            || c.longName === arg
                           ))[0]
                if (foundCommand) {
                    result.command = foundCommand.longName
                }
            }

            if (!foundCommand) {
                result.values.push(arg)
            }
        }
    }

    return result
}
