%lex

%%

[ \t]+            {/* skip whitespace */}
[0-9]+         return 'NUM';
\n             return 'EOL';
':'            return ':';
'+'            return '+';
'-'            return '-';
'*'            return '*';
'/'            return '/';
<<EOF>>        return 'EOF';

/lex

%{

   Node = require('./node');
   make_node = Node.make_node;
%}

%left 'EOL'
%left '+' '-'
%left '*' '/'
&nonassoc ':'

%start expression

%%

expression
   : exprList EOF             { }
   ;

exprList
   : exprList EOL expr  { yy.emit($3); }
   | exprList EOL { }
   | expr { yy.emit($1); }
   ;

expr
   : NUM           { $$ = make_node('number', parseInt($1)); }
   | EOL expr      { $$ = $2; }
   | expr ':' expr { $$ = make_node('range', $1, $3); }
   | expr '+' expr { $$ = make_node('arithop', '+', $1, $3); }
   | expr '-' expr { $$ = make_node('arithop', '-', $1, $3); }
   | expr '*' expr { $$ = make_node('arithop', '*', $1, $3); }
   | expr '/' expr { $$ = make_node('arithop', '/', $1, $3); }
   ;
