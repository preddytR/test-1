class TermAST{
    constructor(coeff,power,variable){
      this.coeff = float_int(coeff);
      this.power = float_int(power);
      this.variable = variable
    }
    tree(){
      return 'Term(' + this.toString() + ')'
    }
  }
TermAST.prototype.toString = function TermString(){
  let r_str = '';
  if (this.variable == 'CONSTANT'){
    r_str += this.coeff
  } else {
    if (this.coeff == 1){
      r_str += this.variable
    } else if (this.coeff == -1) {
      r_str += '-'+this.variable
    } else {
        r_str += this.coeff+this.variable
    }
    if (this.power == 1 || this.power == 0) {
      r_str += ''
    } else {
      r_str += '^' + this.power
    }
  }
  return r_str
}

function float_int(string){ //returns a nice integer if the float version is equivalent
  if (string == parseInt(string)){
    return parseInt(string)
  } else {
    return string
  }
}

export {TermAST}
