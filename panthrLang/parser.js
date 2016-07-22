/* parser generated by jison 0.4.17 */
/*
  Returns a Parser object of the following structure:

  Parser: {
    yy: {}
  }

  Parser.prototype: {
    yy: {},
    trace: function(),
    symbols_: {associative list: name ==> number},
    terminals_: {associative list: number ==> name},
    productions_: [...],
    performAction: function anonymous(yytext, yyleng, yylineno, yy, yystate, $$, _$),
    table: [...],
    defaultActions: {...},
    parseError: function(str, hash),
    parse: function(input),

    lexer: {
        EOF: 1,
        parseError: function(str, hash),
        setInput: function(input),
        input: function(),
        unput: function(str),
        more: function(),
        less: function(n),
        pastInput: function(),
        upcomingInput: function(),
        showPosition: function(),
        test_match: function(regex_match_array, rule_index),
        next: function(),
        lex: function(),
        begin: function(condition),
        popState: function(),
        _currentRules: function(),
        topState: function(),
        pushState: function(condition),

        options: {
            ranges: boolean           (optional: true ==> token location info will include a .range[] member)
            flex: boolean             (optional: true ==> flex-like lexing behaviour where the rules are tested exhaustively to find the longest match)
            backtrack_lexer: boolean  (optional: true ==> lexer regexes are tested in order and for each matching regex the action code is invoked; the lexer terminates the scan when a token is returned by the action code)
        },

        performAction: function(yy, yy_, $avoiding_name_collisions, YY_START),
        rules: [...],
        conditions: {associative list: name ==> set},
    }
  }


  token location info (@$, _$, etc.): {
    first_line: n,
    last_line: n,
    first_column: n,
    last_column: n,
    range: [start_number, end_number]       (where the numbers are indexes into the input string, regular zero-based)
  }


  the parseError function receives a 'hash' object with these members for lexer and parser errors: {
    text:        (matched text)
    token:       (the produced terminal token, if any)
    line:        (yylineno)
  }
  while parser (grammar) errors will also provide these members, i.e. parser errors deliver a superset of attributes: {
    loc:         (yylloc)
    expected:    (string describing the set of expected tokens)
    recoverable: (boolean: TRUE when the parser has a error recovery rule available for this particular error)
  }
*/
var parser = (function(){
var o=function(k,v,o,l){for(o=o||{},l=k.length;l--;o[k[l]]=v);return o},$V0=[1,5],$V1=[1,4],$V2=[1,8],$V3=[1,9],$V4=[1,10],$V5=[1,11],$V6=[1,12],$V7=[1,13],$V8=[1,14],$V9=[1,15],$Va=[1,16],$Vb=[1,17],$Vc=[1,18],$Vd=[1,20],$Ve=[5,6,35],$Vf=[1,29],$Vg=[1,30],$Vh=[1,36],$Vi=[1,24],$Vj=[1,25],$Vk=[1,26],$Vl=[1,27],$Vm=[1,28],$Vn=[1,31],$Vo=[1,32],$Vp=[1,33],$Vq=[1,34],$Vr=[1,35],$Vs=[2,12],$Vt=[1,38],$Vu=[1,39],$Vv=[5,6,16,17,18,19,20,22,23,24,25,26,27,28,29,30,35,39],$Vw=[1,23],$Vx=[2,48],$Vy=[5,6,19,35,39],$Vz=[1,64],$VA=[1,65],$VB=[5,6,16,17,19,20,22,23,24,25,26,27,29,30,35,39],$VC=[5,6,19,22,23,24,25,35,39],$VD=[1,73],$VE=[1,74],$VF=[5,6,16,17,19,22,23,24,25,26,27,29,30,35,39],$VG=[5,6,19,22,24,35,39],$VH=[5,6,16,17,19,22,23,24,25,35,39],$VI=[5,6,16,17,19,22,23,24,25,26,27,35,39],$VJ=[19,39];
var parser = {trace: function trace() { },
yy: {},
symbols_: {"error":2,"expression":3,"exprList":4,"EOF":5,"EOL":6,"topExpr":7,"expr":8,"lvalue":9,"EQUALS":10,"NUM":11,"TRUE":12,"FALSE":13,"LARROW":14,"LLARROW":15,"+":16,"-":17,"(":18,")":19,":":20,"!":21,"|":22,"&":23,"||":24,"&&":25,"*":26,"/":27,"^":28,"DIV":29,"MOD":30,"actuals":31,"FUN":32,"formals":33,"{":34,"}":35,"LIBRARY":36,"VAR":37,"actual":38,",":39,"DOTS":40,"formal":41,"$accept":0,"$end":1},
terminals_: {2:"error",5:"EOF",6:"EOL",10:"EQUALS",11:"NUM",12:"TRUE",13:"FALSE",14:"LARROW",15:"LLARROW",16:"+",17:"-",18:"(",19:")",20:":",21:"!",22:"|",23:"&",24:"||",25:"&&",26:"*",27:"/",28:"^",29:"DIV",30:"MOD",32:"FUN",34:"{",35:"}",36:"LIBRARY",37:"VAR",39:",",40:"DOTS"},
productions_: [0,[3,2],[4,3],[4,2],[4,1],[4,1],[4,1],[7,1],[7,3],[8,1],[8,1],[8,1],[8,1],[8,3],[8,3],[8,2],[8,2],[8,2],[8,3],[8,3],[8,2],[8,3],[8,3],[8,3],[8,3],[8,3],[8,3],[8,3],[8,3],[8,3],[8,3],[8,3],[8,3],[8,4],[8,4],[8,5],[8,3],[8,4],[31,3],[31,1],[38,1],[38,3],[38,1],[33,3],[33,1],[41,1],[41,3],[41,1],[9,1]],
performAction: function anonymous(yytext, yyleng, yylineno, yy, yystate /* action[1] */, $$ /* vstack */, _$ /* lstack */) {
/* this == yyval */

var $0 = $$.length - 1;
switch (yystate) {
case 1:
 yy.emit($$[$0-1]); 
break;
case 2:
 $$[$0-2].push($$[$0]); this.$ = $$[$0-2]; 
break;
case 3: case 18:
 this.$ = $$[$0-1]; 
break;
case 4: case 39: case 44:
 this.$ = [$$[$0]]; 
break;
case 5:
 this.$ = []; 
break;
case 6:
 this.$ = [Node.error(yy.lexer.yylloc, yy.parser.myError)]; 
break;
case 7: case 12: case 15: case 17: case 40:
 this.$ = $$[$0]; 
break;
case 8: case 13:
 this.$ = Node.assign(yy.lexer.yylloc, $$[$0-2], $$[$0]); 
break;
case 9:
 this.$ = Node.number(yy.lexer.yylloc, parseFloat($$[$0])); 
break;
case 10:
 this.$ = Node.boolean(yy.lexer.yylloc, true); 
break;
case 11:
 this.$ = Node.boolean(yy.lexer.yylloc, false); 
break;
case 14:
 this.$ = Node.assignExisting(yy.lexer.yylloc, $$[$0-2], $$[$0]); 
break;
case 16:
 this.$ = Node.funCall(yy.lexer.yylloc, '`-`', [Node.number(yy.lexer.yylloc, 0), $$[$0]]); 
break;
case 19:
 this.$ = Node.range(yy.lexer.yylloc, $$[$0-2], $$[$0]); 
break;
case 20:
 this.$ = Node.funCall(yy.lexer.yylloc, '`!`', [$$[$0]]); 
break;
case 21:
 this.$ = Node.funCall(yy.lexer.yylloc, '`|`', [$$[$0-2], $$[$0]]); 
break;
case 22:
 this.$ = Node.funCall(yy.lexer.yylloc, '`&`', [$$[$0-2], $$[$0]]); 
break;
case 23:
 this.$ = Node.funCall(yy.lexer.yylloc, '`||`', [$$[$0-2], $$[$0]]); 
break;
case 24:
 this.$ = Node.funCall(yy.lexer.yylloc, '`&&`', [$$[$0-2], $$[$0]]); 
break;
case 25:
 this.$ = Node.funCall(yy.lexer.yylloc, '`+`', [$$[$0-2], $$[$0]]); 
break;
case 26:
 this.$ = Node.funCall(yy.lexer.yylloc, '`-`', [$$[$0-2], $$[$0]]); 
break;
case 27:
 this.$ = Node.funCall(yy.lexer.yylloc, '`*`', [$$[$0-2], $$[$0]]); 
break;
case 28:
 this.$ = Node.funCall(yy.lexer.yylloc, '`/`', [$$[$0-2], $$[$0]]); 
break;
case 29:
 this.$ = Node.funCall(yy.lexer.yylloc, '`^`', [$$[$0-2], $$[$0]]); 
break;
case 30:
 this.$ = Node.funCall(yy.lexer.yylloc, '`%/%`', [$$[$0-2], $$[$0]]); 
break;
case 31:
 this.$ = Node.funCall(yy.lexer.yylloc, '`%%`', [$$[$0-2], $$[$0]]); 
break;
case 32:
 this.$ = Node.funCall(yy.lexer.yylloc, $$[$0-2], []); 
break;
case 33:
 this.$ = Node.funCall(yy.lexer.yylloc, $$[$0-3], $$[$0-1]); 
break;
case 34:
 this.$ = Node.funDef(yy.lexer.yylloc, [], $$[$0]); 
break;
case 35:
 this.$ = Node.funDef(yy.lexer.yylloc, $$[$0-2], $$[$0]); 
break;
case 36:
 this.$ = Node.block(yy.lexer.yylloc, $$[$0-1]); 
break;
case 37:
 this.$ = Node.library(yy.lexer.yylloc, $$[$0-1]); 
break;
case 38: case 43:
 $$[$0].unshift($$[$0-2]); this.$ = $$[$0]; 
break;
case 41:
 this.$ = Node.argNamed(yy.lexer.yylloc, $$[$0-2], $$[$0]); 
break;
case 42:
 this.$ = Node.argDots(yy.lexer.yylloc); 
break;
case 45:
 this.$ = Node.param(yy.lexer.yylloc, $$[$0]); 
break;
case 46:
 this.$ = Node.paramDefault(yy.lexer.yylloc, $$[$0-2], $$[$0]); 
break;
case 47:
 this.$ = Node.paramDots(yy.lexer.yylloc); 
break;
case 48:
 this.$ = Node.variable(yy.lexer.yylloc, $$[$0]); 
break;
}
},
table: [{2:$V0,3:1,4:2,6:$V1,7:3,8:6,9:7,11:$V2,12:$V3,13:$V4,16:$V5,17:$V6,18:$V7,21:$V8,32:$V9,34:$Va,36:$Vb,37:$Vc},{1:[3]},{5:[1,19],6:$Vd},o($Ve,[2,4]),o($Ve,[2,5],{8:21,9:22,11:$V2,12:$V3,13:$V4,16:$V5,17:$V6,18:$V7,21:$V8,32:$V9,34:$Va,36:$Vb,37:$Vc}),o($Ve,[2,6]),o($Ve,[2,7],{16:$Vf,17:$Vg,18:$Vh,20:$Vi,22:$Vj,23:$Vk,24:$Vl,25:$Vm,26:$Vn,27:$Vo,28:$Vp,29:$Vq,30:$Vr}),o([5,6,16,17,18,20,22,23,24,25,26,27,28,29,30,35],$Vs,{10:[1,37],14:$Vt,15:$Vu}),o($Vv,[2,9]),o($Vv,[2,10]),o($Vv,[2,11]),{6:$Vw,8:40,9:22,11:$V2,12:$V3,13:$V4,16:$V5,17:$V6,18:$V7,21:$V8,32:$V9,34:$Va,36:$Vb,37:$Vc},{6:$Vw,8:41,9:22,11:$V2,12:$V3,13:$V4,16:$V5,17:$V6,18:$V7,21:$V8,32:$V9,34:$Va,36:$Vb,37:$Vc},{6:$Vw,8:42,9:22,11:$V2,12:$V3,13:$V4,16:$V5,17:$V6,18:$V7,21:$V8,32:$V9,34:$Va,36:$Vb,37:$Vc},{6:$Vw,8:43,9:22,11:$V2,12:$V3,13:$V4,16:$V5,17:$V6,18:$V7,21:$V8,32:$V9,34:$Va,36:$Vb,37:$Vc},{18:[1,44]},{2:$V0,4:45,6:$V1,7:3,8:6,9:7,11:$V2,12:$V3,13:$V4,16:$V5,17:$V6,18:$V7,21:$V8,32:$V9,34:$Va,36:$Vb,37:$Vc},{18:[1,46]},o([5,6,10,14,15,16,17,18,19,20,22,23,24,25,26,27,28,29,30,35,39],$Vx),{1:[2,1]},o($Ve,[2,3],{8:6,9:7,7:47,11:$V2,12:$V3,13:$V4,16:$V5,17:$V6,18:$V7,21:$V8,32:$V9,34:$Va,36:$Vb,37:$Vc}),o($Vy,[2,17],{16:$Vf,17:$Vg,18:$Vh,20:$Vi,22:$Vj,23:$Vk,24:$Vl,25:$Vm,26:$Vn,27:$Vo,28:$Vp,29:$Vq,30:$Vr}),o($Vv,$Vs,{14:$Vt,15:$Vu}),{6:$Vw,8:21,9:22,11:$V2,12:$V3,13:$V4,16:$V5,17:$V6,18:$V7,21:$V8,32:$V9,34:$Va,36:$Vb,37:$Vc},{6:$Vw,8:48,9:22,11:$V2,12:$V3,13:$V4,16:$V5,17:$V6,18:$V7,21:$V8,32:$V9,34:$Va,36:$Vb,37:$Vc},{6:$Vw,8:49,9:22,11:$V2,12:$V3,13:$V4,16:$V5,17:$V6,18:$V7,21:$V8,32:$V9,34:$Va,36:$Vb,37:$Vc},{6:$Vw,8:50,9:22,11:$V2,12:$V3,13:$V4,16:$V5,17:$V6,18:$V7,21:$V8,32:$V9,34:$Va,36:$Vb,37:$Vc},{6:$Vw,8:51,9:22,11:$V2,12:$V3,13:$V4,16:$V5,17:$V6,18:$V7,21:$V8,32:$V9,34:$Va,36:$Vb,37:$Vc},{6:$Vw,8:52,9:22,11:$V2,12:$V3,13:$V4,16:$V5,17:$V6,18:$V7,21:$V8,32:$V9,34:$Va,36:$Vb,37:$Vc},{6:$Vw,8:53,9:22,11:$V2,12:$V3,13:$V4,16:$V5,17:$V6,18:$V7,21:$V8,32:$V9,34:$Va,36:$Vb,37:$Vc},{6:$Vw,8:54,9:22,11:$V2,12:$V3,13:$V4,16:$V5,17:$V6,18:$V7,21:$V8,32:$V9,34:$Va,36:$Vb,37:$Vc},{6:$Vw,8:55,9:22,11:$V2,12:$V3,13:$V4,16:$V5,17:$V6,18:$V7,21:$V8,32:$V9,34:$Va,36:$Vb,37:$Vc},{6:$Vw,8:56,9:22,11:$V2,12:$V3,13:$V4,16:$V5,17:$V6,18:$V7,21:$V8,32:$V9,34:$Va,36:$Vb,37:$Vc},{6:$Vw,8:57,9:22,11:$V2,12:$V3,13:$V4,16:$V5,17:$V6,18:$V7,21:$V8,32:$V9,34:$Va,36:$Vb,37:$Vc},{6:$Vw,8:58,9:22,11:$V2,12:$V3,13:$V4,16:$V5,17:$V6,18:$V7,21:$V8,32:$V9,34:$Va,36:$Vb,37:$Vc},{6:$Vw,8:59,9:22,11:$V2,12:$V3,13:$V4,16:$V5,17:$V6,18:$V7,21:$V8,32:$V9,34:$Va,36:$Vb,37:$Vc},{6:$Vw,8:63,9:22,11:$V2,12:$V3,13:$V4,16:$V5,17:$V6,18:$V7,19:[1,60],21:$V8,31:61,32:$V9,34:$Va,36:$Vb,37:$Vz,38:62,40:$VA},{6:$Vw,8:66,9:22,11:$V2,12:$V3,13:$V4,16:$V5,17:$V6,18:$V7,21:$V8,32:$V9,34:$Va,36:$Vb,37:$Vc},{6:$Vw,8:67,9:22,11:$V2,12:$V3,13:$V4,16:$V5,17:$V6,18:$V7,21:$V8,32:$V9,34:$Va,36:$Vb,37:$Vc},{6:$Vw,8:68,9:22,11:$V2,12:$V3,13:$V4,16:$V5,17:$V6,18:$V7,21:$V8,32:$V9,34:$Va,36:$Vb,37:$Vc},o($VB,[2,15],{18:$Vh,28:$Vp}),o($VB,[2,16],{18:$Vh,28:$Vp}),{16:$Vf,17:$Vg,18:$Vh,19:[1,69],20:$Vi,22:$Vj,23:$Vk,24:$Vl,25:$Vm,26:$Vn,27:$Vo,28:$Vp,29:$Vq,30:$Vr},o($VC,[2,20],{16:$Vf,17:$Vg,18:$Vh,20:$Vi,26:$Vn,27:$Vo,28:$Vp,29:$Vq,30:$Vr}),{19:[1,70],33:71,37:$VD,40:$VE,41:72},{6:$Vd,35:[1,75]},{37:[1,76]},o($Ve,[2,2]),o($VF,[2,19],{18:$Vh,28:$Vp}),o($VG,[2,21],{16:$Vf,17:$Vg,18:$Vh,20:$Vi,23:$Vk,25:$Vm,26:$Vn,27:$Vo,28:$Vp,29:$Vq,30:$Vr}),o($VC,[2,22],{16:$Vf,17:$Vg,18:$Vh,20:$Vi,26:$Vn,27:$Vo,28:$Vp,29:$Vq,30:$Vr}),o($VG,[2,23],{16:$Vf,17:$Vg,18:$Vh,20:$Vi,23:$Vk,25:$Vm,26:$Vn,27:$Vo,28:$Vp,29:$Vq,30:$Vr}),o($VC,[2,24],{16:$Vf,17:$Vg,18:$Vh,20:$Vi,26:$Vn,27:$Vo,28:$Vp,29:$Vq,30:$Vr}),o($VH,[2,25],{18:$Vh,20:$Vi,26:$Vn,27:$Vo,28:$Vp,29:$Vq,30:$Vr}),o($VH,[2,26],{18:$Vh,20:$Vi,26:$Vn,27:$Vo,28:$Vp,29:$Vq,30:$Vr}),o($VI,[2,27],{18:$Vh,20:$Vi,28:$Vp,29:$Vq,30:$Vr}),o($VI,[2,28],{18:$Vh,20:$Vi,28:$Vp,29:$Vq,30:$Vr}),o($VB,[2,29],{18:$Vh,28:$Vp}),o($VF,[2,30],{18:$Vh,20:$Vi,28:$Vp}),o($VF,[2,31],{18:$Vh,20:$Vi,28:$Vp}),o($Vv,[2,32]),{19:[1,77]},{19:[2,39],39:[1,78]},o($VJ,[2,40],{16:$Vf,17:$Vg,18:$Vh,20:$Vi,22:$Vj,23:$Vk,24:$Vl,25:$Vm,26:$Vn,27:$Vo,28:$Vp,29:$Vq,30:$Vr}),o([14,15,16,17,18,19,20,22,23,24,25,26,27,28,29,30,39],$Vx,{10:[1,79]}),o($VJ,[2,42]),o($Ve,[2,8],{16:$Vf,17:$Vg,18:$Vh,20:$Vi,22:$Vj,23:$Vk,24:$Vl,25:$Vm,26:$Vn,27:$Vo,28:$Vp,29:$Vq,30:$Vr}),o($Vy,[2,13],{16:$Vf,17:$Vg,18:$Vh,20:$Vi,22:$Vj,23:$Vk,24:$Vl,25:$Vm,26:$Vn,27:$Vo,28:$Vp,29:$Vq,30:$Vr}),o($Vy,[2,14],{16:$Vf,17:$Vg,18:$Vh,20:$Vi,22:$Vj,23:$Vk,24:$Vl,25:$Vm,26:$Vn,27:$Vo,28:$Vp,29:$Vq,30:$Vr}),o($Vv,[2,18]),{6:$Vw,8:80,9:22,11:$V2,12:$V3,13:$V4,16:$V5,17:$V6,18:$V7,21:$V8,32:$V9,34:$Va,36:$Vb,37:$Vc},{19:[1,81]},{19:[2,44],39:[1,82]},o($VJ,[2,45],{10:[1,83]}),o($VJ,[2,47]),o($Vv,[2,36]),{19:[1,84]},o($Vv,[2,33]),{6:$Vw,8:63,9:22,11:$V2,12:$V3,13:$V4,16:$V5,17:$V6,18:$V7,21:$V8,31:85,32:$V9,34:$Va,36:$Vb,37:$Vz,38:62,40:$VA},{6:$Vw,8:86,9:22,11:$V2,12:$V3,13:$V4,16:$V5,17:$V6,18:$V7,21:$V8,32:$V9,34:$Va,36:$Vb,37:$Vc},o($Vy,[2,34],{16:$Vf,17:$Vg,18:$Vh,20:$Vi,22:$Vj,23:$Vk,24:$Vl,25:$Vm,26:$Vn,27:$Vo,28:$Vp,29:$Vq,30:$Vr}),{6:$Vw,8:87,9:22,11:$V2,12:$V3,13:$V4,16:$V5,17:$V6,18:$V7,21:$V8,32:$V9,34:$Va,36:$Vb,37:$Vc},{33:88,37:$VD,40:$VE,41:72},{6:$Vw,8:89,9:22,11:$V2,12:$V3,13:$V4,16:$V5,17:$V6,18:$V7,21:$V8,32:$V9,34:$Va,36:$Vb,37:$Vc},o($Vv,[2,37]),{19:[2,38]},o($VJ,[2,41],{16:$Vf,17:$Vg,18:$Vh,20:$Vi,22:$Vj,23:$Vk,24:$Vl,25:$Vm,26:$Vn,27:$Vo,28:$Vp,29:$Vq,30:$Vr}),o($Vy,[2,35],{16:$Vf,17:$Vg,18:$Vh,20:$Vi,22:$Vj,23:$Vk,24:$Vl,25:$Vm,26:$Vn,27:$Vo,28:$Vp,29:$Vq,30:$Vr}),{19:[2,43]},o($VJ,[2,46],{16:$Vf,17:$Vg,18:$Vh,20:$Vi,22:$Vj,23:$Vk,24:$Vl,25:$Vm,26:$Vn,27:$Vo,28:$Vp,29:$Vq,30:$Vr})],
defaultActions: {19:[2,1],85:[2,38],88:[2,43]},
parseError: function parseError(str, hash) {
    if (hash.recoverable) {
        this.trace(str);
    } else {
        function _parseError (msg, hash) {
            this.message = msg;
            this.hash = hash;
        }
        _parseError.prototype = Error;

        throw new _parseError(str, hash);
    }
},
parse: function parse(input) {
    var self = this,
        stack = [0],
        tstack = [], // token stack
        vstack = [null], // semantic value stack
        lstack = [], // location stack
        table = this.table,
        yytext = '',
        yylineno = 0,
        yyleng = 0,
        recovering = 0,
        TERROR = 2,
        EOF = 1;

    var args = lstack.slice.call(arguments, 1);

    //this.reductionCount = this.shiftCount = 0;

    var lexer = Object.create(this.lexer);
    var sharedState = { yy: {} };
    // copy state
    for (var k in this.yy) {
      if (Object.prototype.hasOwnProperty.call(this.yy, k)) {
        sharedState.yy[k] = this.yy[k];
      }
    }

    lexer.setInput(input, sharedState.yy);
    sharedState.yy.lexer = lexer;
    sharedState.yy.parser = this;
    if (typeof lexer.yylloc == 'undefined') {
        lexer.yylloc = {};
    }
    var yyloc = lexer.yylloc;
    lstack.push(yyloc);

    var ranges = lexer.options && lexer.options.ranges;

    if (typeof sharedState.yy.parseError === 'function') {
        this.parseError = sharedState.yy.parseError;
    } else {
        this.parseError = Object.getPrototypeOf(this).parseError;
    }

    function popStack (n) {
        stack.length = stack.length - 2 * n;
        vstack.length = vstack.length - n;
        lstack.length = lstack.length - n;
    }

_token_stack:
    var lex = function () {
        var token;
        token = lexer.lex() || EOF;
        // if token isn't its numeric value, convert
        if (typeof token !== 'number') {
            token = self.symbols_[token] || token;
        }
        return token;
    }

    var symbol, preErrorSymbol, state, action, a, r, yyval = {}, p, len, newState, expected;
    while (true) {
        // retreive state number from top of stack
        state = stack[stack.length - 1];

        // use default actions if available
        if (this.defaultActions[state]) {
            action = this.defaultActions[state];
        } else {
            if (symbol === null || typeof symbol == 'undefined') {
                symbol = lex();
            }
            // read action for current state and first input
            action = table[state] && table[state][symbol];
        }

_handle_error:
        // handle parse error
        if (typeof action === 'undefined' || !action.length || !action[0]) {
            var error_rule_depth;
            var errStr = '';

            // Return the rule stack depth where the nearest error rule can be found.
            // Return FALSE when no error recovery rule was found.
            function locateNearestErrorRecoveryRule(state) {
                var stack_probe = stack.length - 1;
                var depth = 0;

                // try to recover from error
                for(;;) {
                    // check for error recovery rule in this state
                    if ((TERROR.toString()) in table[state]) {
                        return depth;
                    }
                    if (state === 0 || stack_probe < 2) {
                        return false; // No suitable error recovery rule available.
                    }
                    stack_probe -= 2; // popStack(1): [symbol, action]
                    state = stack[stack_probe];
                    ++depth;
                }
            }

            if (!recovering) {
                // first see if there's any chance at hitting an error recovery rule:
                error_rule_depth = locateNearestErrorRecoveryRule(state);

                // Report error
                expected = [];
                for (p in table[state]) {
                    if (this.terminals_[p] && p > TERROR) {
                        expected.push("'"+this.terminals_[p]+"'");
                    }
                }
                if (lexer.showPosition) {
                    errStr = 'Parse error on line '+(yylineno+1)+":\n"+lexer.showPosition()+"\nExpecting "+expected.join(', ') + ", got '" + (this.terminals_[symbol] || symbol)+ "'";
                } else {
                    errStr = 'Parse error on line '+(yylineno+1)+": Unexpected " +
                                  (symbol == EOF ? "end of input" :
                                              ("'"+(this.terminals_[symbol] || symbol)+"'"));
                }
                this.parseError(errStr, {
                    text: lexer.match,
                    token: this.terminals_[symbol] || symbol,
                    line: lexer.yylineno,
                    loc: yyloc,
                    expected: expected,
                    recoverable: (error_rule_depth !== false)
                });
            } else if (preErrorSymbol !== EOF) {
                error_rule_depth = locateNearestErrorRecoveryRule(state);
            }

            // just recovered from another error
            if (recovering == 3) {
                if (symbol === EOF || preErrorSymbol === EOF) {
                    throw new Error(errStr || 'Parsing halted while starting to recover from another error.');
                }

                // discard current lookahead and grab another
                yyleng = lexer.yyleng;
                yytext = lexer.yytext;
                yylineno = lexer.yylineno;
                yyloc = lexer.yylloc;
                symbol = lex();
            }

            // try to recover from error
            if (error_rule_depth === false) {
                throw new Error(errStr || 'Parsing halted. No suitable error recovery rule available.');
            }
            popStack(error_rule_depth);

            preErrorSymbol = (symbol == TERROR ? null : symbol); // save the lookahead token
            symbol = TERROR;         // insert generic error symbol as new lookahead
            state = stack[stack.length-1];
            action = table[state] && table[state][TERROR];
            recovering = 3; // allow 3 real symbols to be shifted before reporting a new error
        }

        // this shouldn't happen, unless resolve defaults are off
        if (action[0] instanceof Array && action.length > 1) {
            throw new Error('Parse Error: multiple actions possible at state: '+state+', token: '+symbol);
        }

        switch (action[0]) {
            case 1: // shift
                //this.shiftCount++;

                stack.push(symbol);
                vstack.push(lexer.yytext);
                lstack.push(lexer.yylloc);
                stack.push(action[1]); // push state
                symbol = null;
                if (!preErrorSymbol) { // normal execution/no error
                    yyleng = lexer.yyleng;
                    yytext = lexer.yytext;
                    yylineno = lexer.yylineno;
                    yyloc = lexer.yylloc;
                    if (recovering > 0) {
                        recovering--;
                    }
                } else {
                    // error just occurred, resume old lookahead f/ before error
                    symbol = preErrorSymbol;
                    preErrorSymbol = null;
                }
                break;

            case 2:
                // reduce
                //this.reductionCount++;

                len = this.productions_[action[1]][1];

                // perform semantic action
                yyval.$ = vstack[vstack.length-len]; // default to $$ = $1
                // default location, uses first token for firsts, last for lasts
                yyval._$ = {
                    first_line: lstack[lstack.length-(len||1)].first_line,
                    last_line: lstack[lstack.length-1].last_line,
                    first_column: lstack[lstack.length-(len||1)].first_column,
                    last_column: lstack[lstack.length-1].last_column
                };
                if (ranges) {
                  yyval._$.range = [lstack[lstack.length-(len||1)].range[0], lstack[lstack.length-1].range[1]];
                }
                r = this.performAction.apply(yyval, [yytext, yyleng, yylineno, sharedState.yy, action[1], vstack, lstack].concat(args));

                if (typeof r !== 'undefined') {
                    return r;
                }

                // pop off stack
                if (len) {
                    stack = stack.slice(0,-1*len*2);
                    vstack = vstack.slice(0, -1*len);
                    lstack = lstack.slice(0, -1*len);
                }

                stack.push(this.productions_[action[1]][0]);    // push nonterminal (reduce)
                vstack.push(yyval.$);
                lstack.push(yyval._$);
                // goto new state = table[STATE][NONTERMINAL]
                newState = table[stack[stack.length-2]][stack[stack.length-1]];
                stack.push(newState);
                break;

            case 3:
                // accept
                return true;
        }

    }

    return true;
}};

   Node = require('./node');
/* generated by jison-lex 0.3.4 */
var lexer = (function(){
var lexer = ({

EOF:1,

parseError:function parseError(str, hash) {
        if (this.yy.parser) {
            this.yy.parser.parseError(str, hash);
        } else {
            throw new Error(str);
        }
    },

// resets the lexer, sets new input
setInput:function (input, yy) {
        this.yy = yy || this.yy || {};
        this._input = input;
        this._more = this._backtrack = this.done = false;
        this.yylineno = this.yyleng = 0;
        this.yytext = this.matched = this.match = '';
        this.conditionStack = ['INITIAL'];
        this.yylloc = {
            first_line: 1,
            first_column: 0,
            last_line: 1,
            last_column: 0
        };
        if (this.options.ranges) {
            this.yylloc.range = [0,0];
        }
        this.offset = 0;
        return this;
    },

// consumes and returns one char from the input
input:function () {
        var ch = this._input[0];
        this.yytext += ch;
        this.yyleng++;
        this.offset++;
        this.match += ch;
        this.matched += ch;
        var lines = ch.match(/(?:\r\n?|\n).*/g);
        if (lines) {
            this.yylineno++;
            this.yylloc.last_line++;
        } else {
            this.yylloc.last_column++;
        }
        if (this.options.ranges) {
            this.yylloc.range[1]++;
        }

        this._input = this._input.slice(1);
        return ch;
    },

// unshifts one char (or a string) into the input
unput:function (ch) {
        var len = ch.length;
        var lines = ch.split(/(?:\r\n?|\n)/g);

        this._input = ch + this._input;
        this.yytext = this.yytext.substr(0, this.yytext.length - len);
        //this.yyleng -= len;
        this.offset -= len;
        var oldLines = this.match.split(/(?:\r\n?|\n)/g);
        this.match = this.match.substr(0, this.match.length - 1);
        this.matched = this.matched.substr(0, this.matched.length - 1);

        if (lines.length - 1) {
            this.yylineno -= lines.length - 1;
        }
        var r = this.yylloc.range;

        this.yylloc = {
            first_line: this.yylloc.first_line,
            last_line: this.yylineno + 1,
            first_column: this.yylloc.first_column,
            last_column: lines ?
                (lines.length === oldLines.length ? this.yylloc.first_column : 0)
                 + oldLines[oldLines.length - lines.length].length - lines[0].length :
              this.yylloc.first_column - len
        };

        if (this.options.ranges) {
            this.yylloc.range = [r[0], r[0] + this.yyleng - len];
        }
        this.yyleng = this.yytext.length;
        return this;
    },

// When called from action, caches matched text and appends it on next action
more:function () {
        this._more = true;
        return this;
    },

// When called from action, signals the lexer that this rule fails to match the input, so the next matching rule (regex) should be tested instead.
reject:function () {
        if (this.options.backtrack_lexer) {
            this._backtrack = true;
        } else {
            return this.parseError('Lexical error on line ' + (this.yylineno + 1) + '. You can only invoke reject() in the lexer when the lexer is of the backtracking persuasion (options.backtrack_lexer = true).\n' + this.showPosition(), {
                text: "",
                token: null,
                line: this.yylineno
            });

        }
        return this;
    },

// retain first n characters of the match
less:function (n) {
        this.unput(this.match.slice(n));
    },

// displays already matched input, i.e. for error messages
pastInput:function () {
        var past = this.matched.substr(0, this.matched.length - this.match.length);
        return (past.length > 20 ? '...':'') + past.substr(-20).replace(/\n/g, "");
    },

// displays upcoming input, i.e. for error messages
upcomingInput:function () {
        var next = this.match;
        if (next.length < 20) {
            next += this._input.substr(0, 20-next.length);
        }
        return (next.substr(0,20) + (next.length > 20 ? '...' : '')).replace(/\n/g, "");
    },

// displays the character position where the lexing error occurred, i.e. for error messages
showPosition:function () {
        var pre = this.pastInput();
        var c = new Array(pre.length + 1).join("-");
        return pre + this.upcomingInput() + "\n" + c + "^";
    },

// test the lexed token: return FALSE when not a match, otherwise return token
test_match:function (match, indexed_rule) {
        var token,
            lines,
            backup;

        if (this.options.backtrack_lexer) {
            // save context
            backup = {
                yylineno: this.yylineno,
                yylloc: {
                    first_line: this.yylloc.first_line,
                    last_line: this.last_line,
                    first_column: this.yylloc.first_column,
                    last_column: this.yylloc.last_column
                },
                yytext: this.yytext,
                match: this.match,
                matches: this.matches,
                matched: this.matched,
                yyleng: this.yyleng,
                offset: this.offset,
                _more: this._more,
                _input: this._input,
                yy: this.yy,
                conditionStack: this.conditionStack.slice(0),
                done: this.done
            };
            if (this.options.ranges) {
                backup.yylloc.range = this.yylloc.range.slice(0);
            }
        }

        lines = match[0].match(/(?:\r\n?|\n).*/g);
        if (lines) {
            this.yylineno += lines.length;
        }
        this.yylloc = {
            first_line: this.yylloc.last_line,
            last_line: this.yylineno + 1,
            first_column: this.yylloc.last_column,
            last_column: lines ?
                         lines[lines.length - 1].length - lines[lines.length - 1].match(/\r?\n?/)[0].length :
                         this.yylloc.last_column + match[0].length
        };
        this.yytext += match[0];
        this.match += match[0];
        this.matches = match;
        this.yyleng = this.yytext.length;
        if (this.options.ranges) {
            this.yylloc.range = [this.offset, this.offset += this.yyleng];
        }
        this._more = false;
        this._backtrack = false;
        this._input = this._input.slice(match[0].length);
        this.matched += match[0];
        token = this.performAction.call(this, this.yy, this, indexed_rule, this.conditionStack[this.conditionStack.length - 1]);
        if (this.done && this._input) {
            this.done = false;
        }
        if (token) {
            return token;
        } else if (this._backtrack) {
            // recover context
            for (var k in backup) {
                this[k] = backup[k];
            }
            return false; // rule action called reject() implying the next rule should be tested instead.
        }
        return false;
    },

// return next match in input
next:function () {
        if (this.done) {
            return this.EOF;
        }
        if (!this._input) {
            this.done = true;
        }

        var token,
            match,
            tempMatch,
            index;
        if (!this._more) {
            this.yytext = '';
            this.match = '';
        }
        var rules = this._currentRules();
        for (var i = 0; i < rules.length; i++) {
            tempMatch = this._input.match(this.rules[rules[i]]);
            if (tempMatch && (!match || tempMatch[0].length > match[0].length)) {
                match = tempMatch;
                index = i;
                if (this.options.backtrack_lexer) {
                    token = this.test_match(tempMatch, rules[i]);
                    if (token !== false) {
                        return token;
                    } else if (this._backtrack) {
                        match = false;
                        continue; // rule action called reject() implying a rule MISmatch.
                    } else {
                        // else: this is a lexer rule which consumes input without producing a token (e.g. whitespace)
                        return false;
                    }
                } else if (!this.options.flex) {
                    break;
                }
            }
        }
        if (match) {
            token = this.test_match(match, rules[index]);
            if (token !== false) {
                return token;
            }
            // else: this is a lexer rule which consumes input without producing a token (e.g. whitespace)
            return false;
        }
        if (this._input === "") {
            return this.EOF;
        } else {
            return this.parseError('Lexical error on line ' + (this.yylineno + 1) + '. Unrecognized text.\n' + this.showPosition(), {
                text: "",
                token: null,
                line: this.yylineno
            });
        }
    },

// return next match that has a token
lex:function lex() {
        var r = this.next();
        if (r) {
            return r;
        } else {
            return this.lex();
        }
    },

// activates a new lexer condition state (pushes the new lexer condition state onto the condition stack)
begin:function begin(condition) {
        this.conditionStack.push(condition);
    },

// pop the previously active lexer condition state off the condition stack
popState:function popState() {
        var n = this.conditionStack.length - 1;
        if (n > 0) {
            return this.conditionStack.pop();
        } else {
            return this.conditionStack[0];
        }
    },

// produce the lexer rule set which is active for the currently active lexer condition state
_currentRules:function _currentRules() {
        if (this.conditionStack.length && this.conditionStack[this.conditionStack.length - 1]) {
            return this.conditions[this.conditionStack[this.conditionStack.length - 1]].rules;
        } else {
            return this.conditions["INITIAL"].rules;
        }
    },

// return the currently active lexer condition state; when an index argument is provided it produces the N-th previous condition state, if available
topState:function topState(n) {
        n = this.conditionStack.length - 1 - Math.abs(n || 0);
        if (n >= 0) {
            return this.conditionStack[n];
        } else {
            return "INITIAL";
        }
    },

// alias for begin(condition)
pushState:function pushState(condition) {
        this.begin(condition);
    },

// return the number of states currently on the stack
stateStackSize:function stateStackSize() {
        return this.conditionStack.length;
    },
options: {},
performAction: function anonymous(yy,yy_,$avoiding_name_collisions,YY_START) {
var YYSTATE=YY_START;
switch($avoiding_name_collisions) {
case 0:/* skip whitespace */
break;
case 1:return 11;
break;
case 2:return 6;
break;
case 3:return 25;
break;
case 4:return 24;
break;
case 5:return yy_.yytext;
break;
case 6:return 32;
break;
case 7:return 32;
break;
case 8:return 12;
break;
case 9:return 13;
break;
case 10:return 36;
break;
case 11:return 14;
break;
case 12:return 15;
break;
case 13:return 10;
break;
case 14:return 40;
break;
case 15:return 30;
break;
case 16:return 29;
break;
case 17:return 37;
break;
case 18:return 5;
break;
}
},
rules: [/^(?:[ \t]+)/,/^(?:((0|[1-9][0-9]*)(\.[0-9]*)?|\.[0-9]+)([eE][+-]?[0-9]+)?)/,/^(?:\n|;)/,/^(?:&&)/,/^(?:\|\|)/,/^(?:[:+\-*^\/\,()\{\}\!\|\&])/,/^(?:function\b)/,/^(?:fun\b)/,/^(?:TRUE\b)/,/^(?:FALSE\b)/,/^(?:library\b)/,/^(?:<-)/,/^(?:<<-)/,/^(?:=)/,/^(?:\.\.\.)/,/^(?:%%)/,/^(?:%\/%)/,/^(?:\w[\w\.]*)/,/^(?:$)/],
conditions: {"INITIAL":{"rules":[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18],"inclusive":true}}
});
return lexer;
})();
parser.lexer = lexer;
function Parser () {
  this.yy = {};
}
Parser.prototype = parser;parser.Parser = Parser;
return new Parser;
})();


if (typeof require !== 'undefined' && typeof exports !== 'undefined') {
exports.parser = parser;
exports.Parser = parser.Parser;
exports.parse = function () { return parser.parse.apply(parser, arguments); };
exports.main = function commonjsMain(args) {
    if (!args[1]) {
        console.log('Usage: '+args[0]+' FILE');
        process.exit(1);
    }
    var source = require('fs').readFileSync(require('path').normalize(args[1]), "utf8");
    return exports.parser.parse(source);
};
if (typeof module !== 'undefined' && require.main === module) {
  exports.main(process.argv.slice(1));
}
}