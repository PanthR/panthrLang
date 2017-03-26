# Deviations from R

This file documents areas where our parser deviates from R's parser.

- the bodies of while and for loops are not allowed to be directly top-level expressions, without using curly braces. For instance the following is not allowed: `for (x in xs) y = y + x`
- We do not support `repeat` as a substitute for `while(TRUE)`.
- Variable, argument and key names cannot be quoted via single- or double-quotes, but they can be quoted via backticks.
- `diff` does not currently accept other parameters than the vector `x`.
- `<-` and `=` assignments are both turned into `<-` in expressions.
- PanthR does not have NaN. All "missing values" are NA. NaN is parsed and converted internally to NA.
