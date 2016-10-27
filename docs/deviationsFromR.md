# Deviations from R

This file documents areas where our parser deviates from R's parser.

- the bodies of while and for loops are not allowed to be directly top-level expressions, without using curly braces. For instance the following is not allowed: `for (x in xs) y = y + x`

