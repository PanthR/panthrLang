%lex

%%

[ \t]+         {/* skip whitespace */}
((0|[1-9][0-9]*)(\.[0-9]*)?|\.[0-9]+)([eE][+-]?[0-9]+)? return 'NUM';
\n|';'         return 'EOL';
[:+\-*/\,()\{\}]   return yytext;
'function'     return 'FUN';
'fun'          return 'FUN';
'library'      return 'LIBRARY';
'<-'           return 'LARROW';
'<<-'          return 'LLARROW';
'='            return 'EQUALS';
'...'          return 'DOTS';
\w[\w\.]*      return 'VAR';
<<EOF>>        return 'EOF';

/lex

%{
   Node = require('./node');
   makeNode = Node.makeNode;
%}

%left 'EOL'
%nonassoc 'FUN'
%nonassoc 'VAR'
%nonassoc 'LLARROW' 'LARROW' 'EQUALS'
%left '+' '-'
%left '*' '/'
%left 'UMINUS'
%nonassoc ':'
%nonassoc '('

%start expression

%%

expression
   : exprList EOF { yy.emit($1); }
   ;

exprList
   : exprList EOL topExpr  { $1.push($3); $$ = $1; }
   | exprList EOL { $$ = $1; }
   | topExpr { $$ = [$1]; }
   | EOL { $$ = []; }
   | error { $$ = [makeNode('error', yy.lexer.yylloc, yy.parser.myError)]; }
   ;

topExpr
   : expr { $$ = $1; }
   | VAR EQUALS expr { $$ = makeNode('assign', yy.lexer.yylloc, makeNode('lvar', yy.lexer.yylloc, $1), $3); }
   ;

expr
   : NUM           { $$ = makeNode('number', yy.lexer.yylloc, parseFloat($1)); }
   | VAR           { $$ = makeNode('var', yy.lexer.yylloc, $1); }
   | VAR LARROW expr { $$ = makeNode('assign', yy.lexer.yylloc, makeNode('lvar', yy.lexer.yylloc, $1), $3); }
   | VAR LLARROW expr { $$ = makeNode('assign_inherit', yy.lexer.yylloc, makeNode('lvar', yy.lexer.yylloc, $1), $3); }
   | '+' expr  %prec UMINUS { $$ = $2; }
   | '-' expr  %prec UMINUS { $$ = makeNode('arithop', yy.lexer.yylloc, '-', makeNode('number', yy.lexer.yylloc, 0), $2); }
   | EOL expr      { $$ = $2; }
   | '(' expr ')'  { $$ = $2; }
   | expr ':' expr { $$ = makeNode('range', yy.lexer.yylloc, $1, $3); }
   | expr '+' expr { $$ = makeNode('arithop', yy.lexer.yylloc, '+', $1, $3); }
   | expr '-' expr { $$ = makeNode('arithop', yy.lexer.yylloc, '-', $1, $3); }
   | expr '*' expr { $$ = makeNode('arithop', yy.lexer.yylloc, '*', $1, $3); }
   | expr '/' expr { $$ = makeNode('arithop', yy.lexer.yylloc, '/', $1, $3); }
   | expr '(' ')'  { $$ = makeNode('fun_call', yy.lexer.yylloc, $1, []); }
   | expr '(' actuals ')' { $$ = makeNode('fun_call', yy.lexer.yylloc, $1, $3); }
   | FUN '(' ')' expr { $$ = makeNode('fun_def', yy.lexer.yylloc, [], $4); }
   | FUN '(' formals ')' expr { $$ = makeNode('fun_def', yy.lexer.yylloc, $3, $5); }
   | '{' exprList '}'     { $$ = makeNode('expr_seq', yy.lexer.yylloc, $2); }
   | LIBRARY '(' VAR ')'  { $$ = makeNode('library', yy.lexer.yylloc, $3); }
   ;

actuals
   : actual ',' actuals    { $3.unshift($1); $$ = $3; }
   | actual                { $$ = [$1]; }
   ;

actual
   : expr                    { $$ = makeNode('actual', yy.lexer.yylloc, $1); }
   | VAR EQUALS expr         { $$ = makeNode('actual_named', yy.lexer.yylloc, $1, $3); }
   | DOTS                    { $$ = makeNode('actual_dots', yy.lexer.yylloc); }
   ;

formals
   : formal ',' formals { $3.unshift($1); $$ = $3; }
   | formal             { $$ = [$1]; }
   ;

formal
   : VAR                 { $$ = makeNode('arg', yy.lexer.yylloc, $1); }
   | VAR EQUALS expr     { $$ = makeNode('arg_default', yy.lexer.yylloc, $1, $3); }
   | DOTS                { $$ = makeNode('arg_dots', yy.lexer.yylloc); }
   ;
