# Deviations from R

This file documents areas where our parser deviates from R's parser.

- The bodies of while and for loops are not allowed to be directly top-level expressions, without using curly braces. For instance the following is not allowed: `for (x in xs) y = y + x`
- We do not support `repeat` as a substitute for `while(TRUE)`.
- Variable, argument and key names cannot be quoted via single- or double-quotes, but they can be quoted via backticks.
- `diff` does not currently accept other parameters than the vector `x`.
- `<-` and `=` assignments are both turned into `<-` in expressions.
- PanthR does not have NaN. All "missing values" are NA. NaN is parsed and converted internally to NA.
- `x[]` is parsed by R as having one "empty" argument, while `f()` is not parsed as having any arguments. In panthR they are both treated as having no arguments.
- Trying to set the environment of a builtin fails silently, instead of setting an environment that is never used.
- All methods that interact with the environment hierarchy / search path assume that the environment they are called in lies below the global namespace.
- `.GlobalEnv` is not defined.  Use `globalenv()` to access the global environment.
- Will not implement `parent.env<-`.
- `new.env` takes the `parent` argument first, followed by the `hash` argument. R does the opposite but also accepts a call like `new.env(parentEnv)`.
- `missing` behaves differently, by effectively checking for presence in the current frame: Defaults do not count as missing: `f=function(y=3) { missing(y) }; f()` returns FALSE in panthR but TRUE in R.

# Design decisions

- "builtin" functions are also provided a secret second argument, the current Environment instance. This allows the base package methods to access the environment, so we can implement the environment-related methods.
