/*let Token = class{
  constructor(){
    this.SIN = 'SIN';
    this.COS = 'COS';
    this.TAN = 'TAN';
    this.EXP = 'EXP';
    this.BEC = 'BEC';
    this.LESS  = 'LESS';
    this.EQ    = 'EQ';
    this.GRTR  = 'GRTR';
    this.LEQ   = 'LEQ';
    this.NEQ   = 'NEQ';
    this.GEQ   = 'GEQ';
    this.ADD   = 'ADD';
    this.SUB   = 'SUB';
    this.MUL   = 'MUL';
    this.DIV   = 'DIV';
    this.POW   = 'POW';
    this.LPAR  = 'LPAR';
    this.LPAR2 = 'LPAR2';
    this.RPAR  = 'RPAR';
    this.RPAR2 = 'RPAR2';
    this.ADD = 'ADD';
    this.NUM = 'NUM';
    this.ID = 'ID';
    this.COM = 'COM';
    this.OPERATORS = [this.ADD,this.SUB,this.MUL,this.DIV];
    this.COMMOPS = [this.ADD, this.SUB];//commutative operations- order independent

    this.token_regexp = [
      [this.SIN,   'sin'],
      [this.COS,   'cos'],
      [this.TAN,   'tan'],
      [this.EXP,   'exp'],
      [this.BEC,   ':='],
      [this.LESS,  '<'],
      [this.EQ,    '='],
      [this.GRTR,  '>'],
      [this.LEQ,   '<='],
      [this.NEQ,   '!='],
      [this.GEQ,   '>='],
      [this.ADD,   '\\+'], // + is special in regular expressions
      [this.SUB,   '-'],
      [this.MUL,   '\\*'],
      [this.DIV,   '/'],
      [this.POW,   '\\^'],
      [this.LPAR,  '\\('], // ( is special in regular expressions
      [this.RPAR,  '\\)'], // ) is special in regular expressions
      [this.NUM,   '[0-9]+\\.{0,1}[0-9]*'], //a positive integer or float, negatives are handled by SUB and ADD, no +ve sign
      [this.ID,    '[a-z]+'], //a variable, usually only 1 char long
      [this.COM,   ',']
    ]
  }
}*/
let Token = {
  'SIN' : 'SIN',
  'COS' : 'COS',
  'TAN' : 'TAN',
  'EXP' : 'EXP',
  'BEC' : 'BEC',
  'LESS'  : 'LESS',
  'EQ'    : 'EQ',
  'GRTR'  : 'GRTR',
  'LEQ'   : 'LEQ',
  'NEQ'   : 'NEQ',
  'GEQ'   : 'GEQ',
  'ADD'   : 'ADD',
  'SUB'   : 'SUB',
  'MUL'   : 'MUL',
  'DIV'   : 'DIV',
  'POW'   : 'POW',
  'LPAR'  : 'LPAR',
  'LPAR2' : 'LPAR2',
  'RPAR'  : 'RPAR',
  'RPAR2' : 'RPAR2',
  'NUM' : 'NUM',
  'ID' : 'ID',
  'COM' : 'COM',
  'OPERATORS' : ['ADD','SUB','MUL','DIV'],
  'COMMOPS' : ['ADD', 'SUB'],//commutative operations- order independent

  token_regexp : [
    ['SIN',   'sin'],
    ['COS',   'cos'],
    ['TAN',   'tan'],
    ['EXP',   'exp'],
    ['BEC',   ':='],
    ['LESS',  '<'],
    ['EQ',    '='],
    ['GRTR',  '>'],
    ['LEQ',   '<='],
    ['NEQ',   '!='],
    ['GEQ',   '>='],
    ['ADD',   '\\+'], // + is special in regular expressions
    ['SUB',   '-'],
    ['MUL',   '\\*'],
    ['DIV',   '/'],
    ['POW',   '\\^'],
    ['LPAR',  '\\('], // ( is special in regular expressions
    ['RPAR',  '\\)'], // ) is special in regular expressions
    ['NUM',   '[0-9]+\\.{0,1}[0-9]*'], //a positive integer or float, negatives are handled by SUB and ADD, no +ve sign
    ['ID',    '[a-z]+'], //a variable, usually only 1 char long
    ['COM',   ',']
  ]
}

export {Token}
