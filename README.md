# argparse-deno
Command line arguments parsing helper

## TODO

Optional default knobs, like:

```
myprogram --dir ./
```

vs.

```
myprogram ./
```

being the same thing

## Example

```typescript
import {
  parseArgs,
  ArgType,
  ParamOption,
} from "https://raw.githubusercontent.com/roobie/argparse-deno/master/argparse.ts";

const cli = [
  {
    shortName: "r",
    longName: "run",
    argType: ArgType.command,
  },
  {
    shortName: "d",
    longName: "debug",
    argType: ArgType.command,
  },
  {
    shortName: "w",
    longName: "with",
    argType: ArgType.knob,
    paramOption: ParamOption.one,
  },
  {
    shortName: "v",
    longName: "verbose",
    argType: ArgType.knob,
    paramOption: ParamOption.zero,
  },
];

const args = parseArgs(cli, Deno.args);
```
