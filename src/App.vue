<template>
  <div id="app">
    <h1>{{ msg }}</h1>
    <span>Enter a polynomial function to solve: </span>
    <div id="InputBar">
      <input name="poly" v-model="stringFunction" type="text" placeholder="e.g 4x^2+2x+3">
      <button name="solve" @click="checkFunction">Solve</button>
    </div>
    <div id="functionPreview">
      <div id="functionTerm">f(x)</div>
      <div id="functionTerm" v-if="stringFunction.length > 0 && validFunction">=</div><!--&ne;-->
      <div id="termContainer" v-for="term in termStrings">
        <div id="functionTerm" v-if="termStrings.indexOf(term) != 0 || !term.positive">
          <div id="sign" v-if="term.positive">&plus;</div>
          <div id="sign" v-else>&minus;</div>
        </div>
        <div id="functionTerm">
          <div id="coeff" v-if="term.coeff != ''">{{term.coeff}}</div>
          <div id="var" v-if="term.variable != ''">{{term.variable}}</div>
          <div id="power" v-if="term.power != ''"><sup>{{term.power}}</sup></div>
        </div>
      </div>
    </div>
    <div id="functionSolutions" v-if="solutions.length != 0">
      <div id="functionTerm">x</div>
      <div id="functionTerm">=</div>
      <div id="functionTerm" v-for="sol in solutions">
        <div id="coeff">{{sol}}</div>
      </div>
    </div>
    <my-canvas style="width:600px; height:600px;margin:auto;">
      <function-graph
      :solutions="solutions"
      :critSolutions="critPoints"
      :func="func">
      </function-graph>
    </my-canvas>
    <!--<p>{{result}}</p>
    <p>{{funcString}}</p>
    <p>{{terms}}</p>
    <p>{{error}}</p>-->
  </div>
</template>

<script>
import {TokensToAST} from './algorithm/TokensToAST'

import MyCanvas from './components/MyCanvas.vue'
import MyBox from './components/MyBox.vue'
import FunctionGraph from './components/FunctionGraph.vue'
//import {sendFunction} from './solutionRequests/sendFunction'
export default {
  name: 'app',
  components : {
    MyCanvas,
    MyBox,
    FunctionGraph
  },
  data () {
    return {
      stringFunction: "x^2-x-1",
      func: {'factors':[],'length':0},
      funcString: "",
      validFunction: true,
      result: "",
      error: "",
      terms:[],
      solutions: [],
      funcId: -1,
      critPoints: [],
      termStrings: [],
      msg: 'PolySolve: Simple algorithm to find roots for a polynomial function',
    }
  },
  // Randomly selects a value to randomly increment or decrement every 16 ms.
  // Not really important, just demonstrates that reactivity still works.
  /*mounted () {
    let dir = 1;
    let selectedVal = Math.floor(Math.random() * this.chartValues.length);

    setInterval(() => {
      if (Math.random() > 0.995) dir *= -1;
      if (Math.random() > 0.99) selectedVal = Math.floor(Math.random() * this.chartValues.length);

      this.chartValues[selectedVal].val = Math.min(Math.max(this.chartValues[selectedVal].val + dir * 0.5, 0), 100);
    }, 16);
  },*/
  methods: {
    checkFunction: function(){
      let generate;
      try {
        generate = new TokensToAST(this.stringFunction);
      } catch (e) {
        this.error = 'TokensToAST error ' + e
      }
      let func = generate.factor();
      this.func = func
      this.funcString = func.toString();
      this.terms = func.factors;
      this.formatTokens();
      this.$http.post('https://random-project-testing.com/api/function',func)
      .then(function(response){
        let results = response.body.solutions;
        let time = response.body.time;
        this.funcId = response.body.id;
        const options = {
          headers: {
            "id": this.funcId
          }
        };
        this.$http.get('https://random-project-testing.com/api/critical',{params: {'id': this.funcId}})
        .then(function(response2){
          this.critPoints = response2.body.results;
          this.solutions = results; //called here so both set at same time
          //console.log(this.critPoints);
          //console.log(response2);
        }, function(error){
          //console.log("oops");
          //console.log(error);
          throw error
        });
        this.result = {'results':results,'time':time};
        //console.log(this.solutions);
      }, function(error){
        throw error
        //console.log(error);
      });
      //return func
      //console.log(func);
    },
    formatTokens: function(){
      let new_list = [];
      for (let term of this.terms) {
        let coeff, variable, power,positive;
        if (Math.abs(term.coeff) != 1 || term.variable == 'CONSTANT'){
          coeff = Math.abs(term.coeff)
        /*} else if (true) {*/

        } else {
          coeff = ''
        }
        if (term.variable != 'CONSTANT') {
          variable = term.variable
        } else {
          variable = ''
        }
        if (term.variable != 'CONSTANT' && term.power != 1) {
          power = term.power
        } else {
          power = ''
        }
        if (term.coeff > 0) {
          positive = true;
        } else {
          positive = false;
        }
        let termDict = {'coeff':coeff,
                    'variable':variable,
                    'power':power,
                    'positive':positive}
        new_list.push(termDict)
      }
      this.termStrings = new_list;
    }
  }
}
</script>

<style lang="scss">
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  /*color: #2c3e50;*/
  margin-top: 60px;
}

h1, h2 {
  font-weight: normal;
}

ul {
  list-style-type: none;
  padding: 0;
}

ul li {
  display: inline-block;
  margin: 0 10px;
}
ol li{
  text-align: left;
}

a {
  color: #42b983;
}

#InputBar {
  width: 70%;
  margin: auto;

  input {
    background-color: GhostWhite;
    text-shadow: 2px 2px Grey;
    height: 80px;
    padding-left: 10px;
    font-size: 50px;
    color: DimGrey;
  }
  button {
    height: 100px;
    font-size: 70px;
    color: DimGrey;
  }
}
#functionPreview {
  font-family: Verdana;
  /*background-color: Chartreuse;*/
  margin-top: 30px;
  margin-left: auto;
  margin-right: auto;
  width: 50%;
  height: 120px;
}
#functionSolutions {
  margin-bottom: 20px;
}
#functionTerm {
  /*padding-top: 20px;
  padding-bottom: 20px;*/
  font-size: 40px;
  background-color: DeepSkyBlue;
  margin-right: 10px;
  border-radius: 5px;
  border: 5px solid CornFlowerBlue;
  display: inline;
  text-shadow: 2px 2px 5px grey;
  padding-bottom: 3px;
}
#coeff,  #var, #power, #sign, #termContainer{
  display: inline;
}
#sign {
  color: white;
}
</style>
