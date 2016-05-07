%lex

%%

[ \t]+         {/* skip whitespace */}
((0|[1-9][0-9]*)(\.[0-9]*)?|\.[0-9]+)([eE][+-]?[0-9]+)? return 'NUM';
\n|';'         return 'EOL';
[:+\-*/\,()\{\}]   return yytext;
'function'     return 'FUN';
'fun'          return 'FUN';
'<-'           return 'LARROW';
'<<-'          return 'LLARROW';
'='            return 'EQUALS';
'...'          return 'DOTS';
\w[\w\.]*      return 'VAR';
<<EOF>>        return 'EOF';

/lex

%{
   Node = require('./node');
   make_node = Node.make_node;
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
   | VAR EQUALS expr { $$ = make_node('assign', make_node('lvar', $1), $3); }
   ;

expr
   : NUM           { $$ = make_node('number', parseFloat($1)); }
   | VAR           { $$ = make_node('var', $1); }
   | VAR LARROW expr { $$ = make_node('assign', make_node('lvar', $1), $3); }
   | VAR LLARROW expr { $$ = make_node('assign_inherit', make_node('lvar', $1), $3); }
   | '+' expr  %prec UMINUS { $$ = $2; }
   | '-' expr  %prec UMINUS { $$ = make_node('arithop', '-', make_node('number', 0), $2); }
   | EOL expr      { $$ = $2; }
   | '(' expr ')'  { $$ = $2; }
   | expr ':' expr { $$ = make_node('range', $1, $3); }
   | expr '+' expr { $$ = make_node('arithop', '+', $1, $3); }
   | expr '-' expr { $$ = make_node('arithop', '-', $1, $3); }
   | expr '*' expr { $$ = make_node('arithop', '*', $1, $3); }
   | expr '/' expr { $$ = make_node('arithop', '/', $1, $3); }
   | expr '(' ')'  { $$ = make_node('fun_call', $1, []); }
   | expr '(' callList ')' { $$ = make_node('fun_call', $1, $3); }
   | FUN '(' ')' expr { $$ = make_node('fun_def', [], $4); }
   | FUN '(' argList ')' expr { $$ = make_node('fun_def', $3, $5); }
   | '{' exprList '}'     { $$ = make_node('expr_seq', $2); }
   ;

callList
   : callItem ',' callList   { $3.unshift($1); $$ = $3; }
   | callItem                { $$ = [$1]; }
   ;

callItem
   : expr                    { $$ = make_node('actual', $1); }
   | VAR EQUALS expr         { $$ = make_node('actual_named', $1, $3); }
   | DOTS                    { $$ = make_node('actual_dots'); }
   ;

argList
   : argTerm ',' argList { $3.unshift($1); $$ = $3; }
   | argTerm             { $$ = [$1]; }
   ;

argTerm
   : VAR                 { $$ = make_node('arg', $1); }
   | VAR EQUALS expr     { $$ = make_node('arg_default', $1, $3); }
   | DOTS                { $$ = make_node('arg_dots'); }
   ;
