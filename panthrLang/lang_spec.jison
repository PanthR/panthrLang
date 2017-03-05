%lex

%x backtick
%x doublequote
%x singlequote

%%

'`'                        this.begin('backtick');
<backtick>[^` \t\n]+       return 'VAR';
<backtick>'`'              this.popState();

'"'                        this.begin('doublequote');
<doublequote>'"'           this.popState();
<doublequote>(\\.|[^"])*   return 'STRING';
"'"                        this.begin('singlequote');
<singlequote>"'"           this.popState();
<singlequote>(\\.|[^'])*   return 'STRING';

[ \t]+         {/* skip whitespace */}
0x[0-9a-fA-F]+ return 'HEXNUM';
((0|[1-9][0-9]*)(\.[0-9]*)?|\.[0-9]+)([eE][+-]?[0-9]+)? return 'NUM';
\n|';'         return 'EOL';
'&&'           return '&&';
'||'           return '||';
'function'     return 'FUN';
'fun'          return 'FUN';
'if'           return 'IF';
'else'         return 'ELSE';
'while'        return 'WHILE';
'for'          return 'FOR';
'in'           return 'IN';
'break'        return 'BREAK';
'next'         return 'NEXT';
'NULL'         return 'NULL';
'TRUE'         return 'TRUE';
'FALSE'        return 'FALSE';
'NA'|'NaN'     return 'MISSING';
'library'      return 'LIBRARY';
'<-'           return 'LARROW';
'<<-'          return 'LLARROW';
'<='|'>='|'<'|'>'|'=='|'!='   return yytext;
'='            return 'EQUALS';
[:+\-*^/\,()\[\]\{\}\!\|\&]   return yytext;
'...'          return 'DOTS';
'$'            return 'DOLLAR';
'%%'           return 'MOD';
'%/%'          return 'DIV';
[a-zA-Z\_][\w\.]*|\.[a-zA-Z\_\.]\w*      return 'VAR';
<<EOF>>        return 'EOF';

/lex

%{
   Node = require('./node');
%}

%left 'EOL'
%nonassoc 'FUN'
%nonassoc 'VAR'
%nonassoc 'LLARROW' 'LARROW' 'EQUALS'
%right 'IF' 'ELSE'
%left '|' '||'
%left '&' '&&'
%right '!'
%nonassoc '<' '>' '<=' '>=' '==' '!='
%left '+' '-'
%left '*' '/'
%left 'DIV' 'MOD'
%nonassoc ':'
%left 'UMINUS'
%right '^'
%left 'DOLLAR'
%nonassoc '['
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
   | error { $$ = [Node.error(yy.lexer.yylloc, yy.parser.myError)]; }
   ;

topExpr
   : expr { $$ = $1; }
   | lvalue EQUALS expr { $$ = Node.assign(yy.lexer.yylloc, $1, $3); }
   ;

expr
   : NUM           { $$ = Node.number(yy.lexer.yylloc, parseFloat($1)); }
   | HEXNUM        { $$ = Node.number(yy.lexer.yylloc, parseInt($1)); }
   | STRING        { $$ = Node.string(yy.lexer.yylloc, $1); }
   | TRUE          { $$ = Node.boolean(yy.lexer.yylloc, true); }
   | FALSE         { $$ = Node.boolean(yy.lexer.yylloc, false); }
   | MISSING       { $$ = Node.missing(yy.lexer.yylloc); }
   | NULL          { $$ = Node.null(yy.lexer.yylloc); }
   | lvalue        { $$ = $1; }
   | lvalue LARROW expr { $$ = Node.assign(yy.lexer.yylloc, $1, $3); }
   | lvalue LLARROW expr { $$ = Node.assignExisting(yy.lexer.yylloc, $1, $3); }
   | EOL expr      { $$ = $2; }
   | '(' topExpr ')'  { $$ = Node.parens(yy.lexer.yylloc, $2); }
   | expr ':' expr { $$ = Node.range(yy.lexer.yylloc, $1, $3); }
   | '!' expr      { $$ = Node.funCall(yy.lexer.yylloc, '!', [$2]); }
   | expr '|' expr { $$ = Node.funCall(yy.lexer.yylloc, '|', [$1, $3]); }
   | expr '&' expr { $$ = Node.funCall(yy.lexer.yylloc, '&', [$1, $3]); }
   | expr '||' expr { $$ = Node.funCall(yy.lexer.yylloc, '||', [$1, $3]); }
   | expr '&&' expr { $$ = Node.funCall(yy.lexer.yylloc, '&&', [$1, $3]); }
   | '+' expr  %prec UMINUS { $$ = Node.funCall(yy.lexer.yylloc, '+', [$2]); }
   | '-' expr  %prec UMINUS { $$ = Node.funCall(yy.lexer.yylloc, '-', [$2]); }
   | expr '+' expr { $$ = Node.funCall(yy.lexer.yylloc, '+', [$1, $3]); }
   | expr '-' expr { $$ = Node.funCall(yy.lexer.yylloc, '-', [$1, $3]); }
   | expr '*' expr { $$ = Node.funCall(yy.lexer.yylloc, '*', [$1, $3]); }
   | expr '/' expr { $$ = Node.funCall(yy.lexer.yylloc, '/', [$1, $3]); }
   | expr '^' expr { $$ = Node.funCall(yy.lexer.yylloc, '^', [$1, $3]); }
   | expr 'DIV' expr { $$ = Node.funCall(yy.lexer.yylloc, '%/%', [$1, $3]); }
   | expr 'MOD' expr { $$ = Node.funCall(yy.lexer.yylloc, '%%', [$1, $3]); }
   | expr '<' expr { $$ = Node.funCall(yy.lexer.yylloc, '<', [$1, $3]); }
   | expr '>' expr { $$ = Node.funCall(yy.lexer.yylloc, '>', [$1, $3]); }
   | expr '<=' expr { $$ = Node.funCall(yy.lexer.yylloc, '<=', [$1, $3]); }
   | expr '>=' expr { $$ = Node.funCall(yy.lexer.yylloc, '>=', [$1, $3]); }
   | expr '==' expr { $$ = Node.funCall(yy.lexer.yylloc, '==', [$1, $3]); }
   | expr '!=' expr { $$ = Node.funCall(yy.lexer.yylloc, '!=', [$1, $3]); }
   | FUN '(' ')' expr { $$ = Node.funDef(yy.lexer.yylloc, [], $4); }
   | FUN '(' formals ')' expr { $$ = Node.funDef(yy.lexer.yylloc, $3, $5); }
   | IF '(' expr ')' expr %prec ELSE { $$ = Node.if(yy.lexer.yylloc, $3, $5); }
   | IF '(' expr ')' expr ELSE expr { $$ = Node.if(yy.lexer.yylloc, $3, $5, $7); }
   | '{' exprList '}'     { $$ = Node.block(yy.lexer.yylloc, $2); }
   | WHILE '(' expr ')' expr { $$ = Node.while(yy.lexer.yylloc, $3, $5); }
   | FOR '(' VAR 'IN' expr ')' expr  { $$ = Node.for(yy.lexer.yylloc, $3, $5, $7); }
   | BREAK { $$ = Node.break(yy.lexer.yylloc); }
   | NEXT { $$ = Node.next(yy.lexer.yylloc); }
   | LIBRARY '(' VAR ')'  { $$ = Node.library(yy.lexer.yylloc, $3); }
   ;

actuals
   : actual ',' actuals    { $3.unshift($1); $$ = $3; }
   | actual                { $$ = [$1]; }
   ;

actual
   : expr                    { $$ = $1; }
   | VAR EQUALS expr         { $$ = Node.argNamed(yy.lexer.yylloc, $1, $3); }
   | DOTS                    { $$ = Node.argDots(yy.lexer.yylloc); }
   |                         { $$ = Node.argEmpty(yy.lexer.yylloc); }
   ;

formals
   : formal ',' formals { $3.unshift($1); $$ = $3; }
   | formal             { $$ = [$1]; }
   ;

formal
   : VAR                 { $$ = Node.param(yy.lexer.yylloc, $1); }
   | VAR EQUALS expr     { $$ = Node.paramDefault(yy.lexer.yylloc, $1, $3); }
   | DOTS                { $$ = Node.paramDots(yy.lexer.yylloc); }
   ;

lvalue
   : VAR                 { $$ = Node.variable(yy.lexer.yylloc, $1); }
   | expr DOLLAR VAR { $$ = Node.dblBracketAccess(yy.lexer.yylloc, $1, Node.string(yy.lexer.yylloc, $3)); }
   | expr '[' actuals ']' { $$ = Node.singleBracketAccess(yy.lexer.yylloc, $1, $3); }
   | expr '[' '[' expr ']' ']' { $$ = Node.dblBracketAccess(yy.lexer.yylloc, $1, $4); }
   | expr '(' actuals ')' { $$ = Node.funCall(yy.lexer.yylloc, $1, $3); }
   ;

