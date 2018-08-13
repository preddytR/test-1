import {TokensToAST} from '../algorithm/TokensToAST'

let sendFunction = function(stringFunction){
  let generate = new TokensToAST(stringFunction);
  let func = generate.factor()
  return func
  //console.log(func);
}
export {sendFunction}
