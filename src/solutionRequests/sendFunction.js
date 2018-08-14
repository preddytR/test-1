import {TokensToAST} from '../algorithm/TokensToAST'

let sendFunction = function(stringFunction){
  let generate = new TokensToAST(stringFunction);
  let func = generate.factor()
  this.$http.post('localhost:3543/api/function',func)
  .then(function(response){
    let results = response.body.solutions;
    let time = response.body.time;
    return {'results':results,'time':time}
  }, function(error){
    throw error
    //console.log(error);
  });
  //return func
  //console.log(func);
}
export {sendFunction}
