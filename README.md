# argparse-deno
Command line arguments parsing helper

## Example

```typescript
import {parseArgs, ArgType, ParamOption} from './argparse.ts'

console.log(parseArgs([
    {
        shortName: 'r',
        longName: 'run',
        argType: ArgType.command
    },
    {
        shortName: 'd',
        longName: 'debug',
        argType: ArgType.command
    },
    {
        shortName: 'w',
        longName: 'with',
        argType: ArgType.knob,
        paramOption: ParamOption.one
    },
    {
        shortName: 'v',
        longName: 'verbose',
        argType: ArgType.knob,
        paramOption: ParamOption.zero
    }
], Deno.args))
```
