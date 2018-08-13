import {ConvertStringToTokens} from './ConvertStringToTokens'
import {Token} from './Token'

import {FactorAST} from './ASTClasses/FactorAST'
import {TermAST} from './ASTClasses/TermAST'

class TokensToAST{ //take a string input and uses it to convert tokens to an AST
  constructor(string_input){
    let convert = new ConvertStringToTokens(string_input,"x");
    convert.convert();
    this.token_stack = convert.token_stack;
    this.token_length = this.token_stack.length;
    this.token_index = 0;
    this.var_dict = {};
  }
  consume(){
    let tokens = Array.from(arguments);
    let old_token = this.token_stack[this.token_index];
    if (tokens.indexOf(old_token) == -1 &&
        ([Token.ID,Token.NUM].indexOf(tokens[0]) != -1 &&
        tokens.indexOf(old_token[0]) == -1)) {
      throw 'ValueError: Expected token' + tokens + ' got ' + old_token
    } else {
      this.token_index += 1
    }
    return old_token
  }
  lookahead(offset){
    if(offset == null){
      offset = 0;
    }
    if (this.token_index + offset >= this.token_length) {
      return null
    }
    let token = this.token_stack[this.token_index+offset];
    if ([Token.NUM,Token.ID].indexOf(token[0]) != -1) {
      return token[0]
    } else {
      return token
    }
  }
  check_vars(){
    for (let token of this.token_stack) {
      let _var = token[1];
      if (token[0] == Token.ID && this.var_dict[_var] == undefined) {
        this.var_dict[_var] = this.var_count;
        this.var_count += 1
      }
    }
  }
  factor(tokens,index,right_dir){
    if (tokens == undefined){
      tokens = this.token_stack
    }
    if (index == undefined){
      index = 0
    }
    let token_stack = [];
    if (right_dir || right_dir == undefined) {
      token_stack = tokens.slice(index)
    } else {
      token_stack = tokens.slice(0,index)
    }
    let term_list = [];
    while (token_stack.length > 0) {
      //console.log('token stack',token_stack);
      let left = null;
      let right = null;
      let op = null;

      for (let token of token_stack) {
        //console.log('Finding index ' + token);
        let has_ops = Token.COMMOPS.indexOf(token);
        if (has_ops != -1) {
          let op_index = token_stack.indexOf(token);
          left = token_stack.slice(0,op_index);
          right = token_stack.slice(op_index+1);
          op = token_stack[op_index]
          //console.log('op at position ' + op_index);
          break
        }
      }
      if (op == null){
        //console.log('d ');
        //console.log(token_stack);
        term_list.push(this.terms(token_stack));
        token_stack = [];
      } else {
        term_list.push(this.terms(left))
        if (op == Token.SUB){
          if (right[0][0] == Token.NUM){
            right[0][1] *= -1
          } else if (right[0][0] == Token.ID){
            //console.log('r_1 '+right+' :'+token_stack);
            right = [[Token.NUM,'-1']].concat(right);
            //console.log('r '+right);
          } else {
            throw 'TokenError: unhandled case at factor()'
          }
        }
        token_stack = right;
      }
    }
    term_list.sort(function(a,b){return a.power < b.power});
    return new FactorAST(term_list)
  }
  terms(tokens){
    //console.log(tokens);
    let coeff = null;
    let power = null;
    let variable = null;
    if (tokens.length == 4) { //NUM , ID, POW, NUM
      coeff = tokens[0][1];
      power = tokens[3][1];
      variable = tokens[1][1]
    } else if (tokens.length == 3) { //ID POW NUM
      coeff = 1;
      power = tokens[2][1]
      variable= tokens[0][1]
    } else if (tokens.length == 2) {//NUM ID
       coeff = tokens[0][1];
       power = 1;
       variable = tokens[1][1]
    } else if (tokens.length ==1) {//NUM or ID
      if (tokens[0][0] == Token.NUM) {
        coeff = tokens[0][1];
        power = 0;
        variable = 'CONSTANT'
      } else {
        coeff = 1;
        power = 0;
        variable = tokens[0][1]
      }
    } else {
      throw 'Unexpected token list, got ' + tokens
    }
    return new TermAST(coeff,power,variable)
  }
  get_mul(){
    let mult = 1;
    while ([Token.ADD, Token.SUB].indexOf(this.lookahead()) != -1) {
      if (this.lookahead() == Token.SUB) {
        mult *= -1
      }
      this.consume(Token.ADD, Token.SUB)
    }
    return mult
  }
}

export {TokensToAST}
