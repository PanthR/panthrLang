%lex

%%

[ \t]+         {/* skip whitespace */}
[0-9]+         return 'NUM';
\n             return 'EOL';
':'            return ':';
'+'            return '+';
'-'            return '-';
'*'            return '*';
'/'            return '/';
'<-'           return 'LARROW';
'='            return 'EQUALS';
\w[\w\.]*      return 'VAR';
'('            return '(';
')'            return ')';
<<EOF>>        return 'EOF';

/lex

%{
   Node = require('./node');
   make_node = Node.make_node;
%}

%nonassoc 'LARROW' 'EQUALS'
%left 'EOL'
%left '+' '-'
%left '*' '/'
%nonassoc ':'
%nonassoc '('

%start expression

%%

expression
   : exprList EOF { yy.emit($1); }
   ;

exprList
   : exprList EOL expr  { $1.push($3); $$ = $1; }
   | exprList EOL { $$ = $1; }
   | expr { $$ = [$1]; }
   | VAR assign expr { $$ = [make_node('assign', make_node('lvar', $1), $3)]; }
   ;

assign : LARROW | EQUALS;

expr
   : NUM           { $$ = make_node('number', parseInt($1)); }
   | VAR           { $$ = make_node('var', $1); }
   | EOL expr      { $$ = $2; }
   | '(' expr ')'  { $$ = $2; }
   | expr ':' expr { $$ = make_node('range', $1, $3); }
   | expr '+' expr { $$ = make_node('arithop', '+', $1, $3); }
   | expr '-' expr { $$ = make_node('arithop', '-', $1, $3); }
   | expr '*' expr { $$ = make_node('arithop', '*', $1, $3); }
   | expr '/' expr { $$ = make_node('arithop', '/', $1, $3); }
   | expr '(' ')'         { $$ = make_node('fun_call', $1, []); }
   | expr '(' argList ')' { $$ = make_node('fun_call', $1, $3); }
   | '{' exprList '}'     { $$ = make_node('expr_seq', $2); }
   ;

argList
   : argTerm ',' argList { $3.unshift($1); $$ = $3; }
   | argTerm             { $$ = [$1]; }
   ;

argTerm
   : VAR          { $$ = make_node('var', $1); }
   ;
