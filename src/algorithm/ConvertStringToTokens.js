import {Token} from './Token'

class ConvertStringToTokens{
  constructor(input_string, var_name){
    this.input_string = input_string;
    this.var_name = var_name;
    this.current_char_index = 0;
    this.token_stack = [];
  }
  convert(){
    this.current_token = this.next_token();
    let token = this.peek();

    while (token[0] != null){
      if (token == Token.NUM || token == Token.ID){
        this.token_stack.push(this.consume(token));
      }else{
        this.token_stack.push(this.consume(token));
      }
      token = this.peek();
      //console.log(this.token_stack);
    }
    this.current_token = this.token_stack[0];
  }
  skip_white_space(){
    while (this.current_char_index < this.input_string.length
           && ["","\n","\t"].indexOf(this.input_string[this.current_char_index]) != -1) {
      this.current_char_index += 1
    }
  }
  no_token(){
    throw 'lexical error: no token found at the start of ' +
              this.input_string.slice(self.current_char_index)
  }
  next_token(){
    this.skip_white_space();
    let token = null,
        longest = '';
    for (let [t,r] of Token.token_regexp) {
      let matched = this.input_string.slice(this.current_char_index).match(r);
      //console.log("Matching",r,matched);
      if (matched != null) {
        let longest_matched = matched.sort(function(a,b){a.length < b.length})[matched.length-1]
        if (longest_matched.length > longest.length && matched.index == 0) {
          token = t;
          longest = longest_matched;
        }
      }
    }
    this.current_char_index += longest.length;

    if (token == null && this.current_char_index < this.input_string.length) {
      this.no_token()
    }
    //console.log(token,longest);
    return [token, longest]
  }
  lookahead(){
    if(this.current_token == null){
      return null
    }
    if (this.current_token[0] == Token.NUM || this.current_token[0] == Token.ID) {
      return this.current_token[0]
    } else {
      return this.current_token
    }
  }
  peek(){
    return this.current_token
  }
  unexpected_token(found_token,expected_tokens){
    throw 'Syntax Error: token "' + expected_tokens + '" expected but "' +
                found_token + '" found'
    //exit()
  }
  consume(){
    let expected_tokens = Array.from(arguments);
    let next_token = this.current_token;
    this.current_token = this.next_token();
    //console.log('Consuming',expected_tokens,next_token);
    if (next_token[0] == Token.NUM || next_token[0] == Token.ID) {
      return next_token
    } else if ( expected_tokens.indexOf(next_token) != -1) {
      return next_token[0]
    } else {
      this.unexpected_token(next_token, expected_tokens)
    }
  }
}
export {ConvertStringToTokens}
