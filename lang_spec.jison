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
   ;

topExpr
   : expr { $$ = $1; }
   | VAR EQUALS expr { $$ = makeNode('assign', makeNode('lvar', $1), $3); }
   ;

expr
   : NUM           { $$ = makeNode('number', parseFloat($1)); }
   | VAR           { $$ = makeNode('var', $1); }
   | VAR LARROW expr { $$ = makeNode('assign', makeNode('lvar', $1), $3); }
   | VAR LLARROW expr { $$ = makeNode('assign_inherit', makeNode('lvar', $1), $3); }
   | '+' expr  %prec UMINUS { $$ = $2; }
   | '-' expr  %prec UMINUS { $$ = makeNode('arithop', '-', makeNode('number', 0), $2); }
   | EOL expr      { $$ = $2; }
   | '(' expr ')'  { $$ = $2; }
   | expr ':' expr { $$ = makeNode('range', $1, $3); }
   | expr '+' expr { $$ = makeNode('arithop', '+', $1, $3); }
   | expr '-' expr { $$ = makeNode('arithop', '-', $1, $3); }
   | expr '*' expr { $$ = makeNode('arithop', '*', $1, $3); }
   | expr '/' expr { $$ = makeNode('arithop', '/', $1, $3); }
   | expr '(' ')'  { $$ = makeNode('fun_call', $1, []); }
   | expr '(' callList ')' { $$ = makeNode('fun_call', $1, $3); }
   | FUN '(' ')' expr { $$ = makeNode('fun_def', [], $4); }
   | FUN '(' argList ')' expr { $$ = makeNode('fun_def', $3, $5); }
   | '{' exprList '}'     { $$ = makeNode('expr_seq', $2); }
   | LIBRARY '(' VAR ')'  { $$ = makeNode('library', $3); }
   ;

callList
   : callItem ',' callList   { $3.unshift($1); $$ = $3; }
   | callItem                { $$ = [$1]; }
   ;

callItem
   : expr                    { $$ = makeNode('actual', $1); }
   | VAR EQUALS expr         { $$ = makeNode('actual_named', $1, $3); }
   | DOTS                    { $$ = makeNode('actual_dots'); }
   ;

argList
   : argTerm ',' argList { $3.unshift($1); $$ = $3; }
   | argTerm             { $$ = [$1]; }
   ;

argTerm
   : VAR                 { $$ = makeNode('arg', $1); }
   | VAR EQUALS expr     { $$ = makeNode('arg_default', $1, $3); }
   | DOTS                { $$ = makeNode('arg_dots'); }
   ;
