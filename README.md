# panthrLang

Language Parser and Interpreter for PanthR

The main module is [panthrlang.js](panthrlang.js). It exports an object `panthrLang` which currently has two properties:

- `Node`. A simple object representing the language's AST. Described in more detail in [node.js](node.js).
- `parse`. A method expecting a string and an action function. It then parses that string and calls the action function on any complete expression.

To update the underlying parser, you will need to have [Jison](http://zaa.ch/jison/docs/) installed. Then from the terminal you would do:
```
npm run parser
```

## Usage

With panthrLang loaded, you could do for instance:
```
panthrLang.parse("2 + 3 * 4", action); // action defaults to console.log
panthrLang.parse("2 + 3 * 4\n 3 + 2", function(node) {
    console.log(node.evaluate());
});
```

