import {Token} from '../Token'

class FactorAST{ //list of terms
    constructor(factors){
      this.factors = factors;
      //this.Token = new Token();
      //print('factor',factors)
      this.length = this.factors.length;
    }

    detailed(){
      let r_str = [];
      if (this.factors.length == 1){
        return this.factors[0]
      }
      for (let term of this.factors){
        //print("fac",term)
        if ([Token.MUL, Token.DIV,Token.ADD,Token.SUB].indexOf(term) != -1){
          r_str.push(term)
        //elif type(term[0]) == list{
            //r_str.append(term.detailed)
        } else {
          r_str.push(term)
        }
      }
      return r_str
    }
    tree(){
      let tree_list = [];
      //console.log(this.factors);
      for (let term of this.factors) {
        tree_list.push(term.tree())//.tree()
      }
      return 'Factor('+tree_list+')'
    }
  }
FactorAST.prototype.toString = function FactorString(){
  let r_str = '';
  for (let i in this.factors){
    let term = this.factors[i];
    if (i > 0 && term.coeff > 0) {
      r_str += '+'
    }
    r_str += term
  }
  return r_str
}

export {FactorAST}
