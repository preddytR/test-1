<template>
  <div id="app">
    <div id="hideToggle" @mouseover="dimmed = true" @mouseleave="dimmed = false">
      <i class="fa fa-eye" @click="visible = !visible"></i>
    </div>
    <div id="serverSelector" v-if="serverSwitch">
      <button name="server" @click="localServer = !localServer">Switch API service</button>
      <p>Currently: {{apiLocation}}</p>
    </div>
    <div id="controlPoints">
      <div v-for="keypoint in modifiedKeypoints">
        <p> CP1 </p>
        <div id="editCoord">
          <p> x: {{keypoint.controlPoints.CP1.x}}</p>
          <input name="cp1x" v-model="keypoint.controlPoints.CP1.x" type="number">
        </div>
        <p> y: {{keypoint.controlPoints.CP1.y}}</p>
        <input name="cp1y" v-model="keypoint.controlPoints.CP1.y" type="number">
        <p> CP2 </p>
        <p> x: {{keypoint.controlPoints.CP2.x}}</p>
        <input name="cp2x" v-model="keypoint.controlPoints.CP2.x" type="number">
        <p> y: {{keypoint.controlPoints.CP2.y}}</p>
        <input name="cp2y" v-model="keypoint.controlPoints.CP2.y" type="number">
        <!--<button name="updateCP">Update</button>-->
      </div>
    </div>
    <div v-if="visible" :class="{isDimmed:dimmed}">
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
    </div>
    <my-canvas style="width:100%; height:100%;margin:auto;">
      <function-graph
      :solutions="solutions"
      :keypoints="modifiedKeypoints"
      :func="func"
      >
      </function-graph>
    </my-canvas>
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
      visible: true,
      dimmed: false,
      serverSwitch: true,
      stringFunction: "x^3-2x+24",
      func: {'factors':[],'length':0},
      funcString: "",
      localServer: true, //Whether to use to local api, for testing purposes only
      validFunction: true,
      result: "",
      error: "",
      terms:[],
      solutions: [],
      funcId: -1,
      tripled: [],
      tripled2: [],
      keypoints: [],
      modifiedKeypoints: [],
      haveAllInfo: false,
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
  computed: {
    apiLocation () {
      return (this.localServer) ? "http://localhost:3543/api" : "https://random-project-testing.com/api"
    }
  },
  methods: {
    checkFunction: function(){
      let generate;
      try {
        generate = new TokensToAST(this.stringFunction);
      } catch (e) {
        this.error = 'TokensToAST error ' + e
        console.log(this.error);
      }
      this.haveAllInfo = false;
      let func = generate.factor();
      this.func = func
      this.funcString = func.toString();
      this.terms = func.factors;
      this.formatTokens();
      this.$http.post(this.apiLocation + '/function',func)
      .then(function(response){
        let results = response.body.solutions;
        let time = response.body.time;
        this.funcId = response.body.id;
        const options = {
          headers: {
            "id": this.funcId
          }
        };
        this.$http.get(this.apiLocation + '/keypoints',{params: {'id': this.funcId}})
        .then(function(response2){
          this.keypoints = response2.body.keypoints;
          this.modifiedKeypoints = this.keypoints;
          this.solutions = results; //called here so both set at same time
          console.log("db");
          console.log(this.keypoints);
          console.log(results);
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

.isDimmed {
  opacity: 0.5;
}

#hideToggle {
  position: fixed;
  left: 4px;
  top: 4px;
  width: 1em;
  padding: 1px;
  border: 1px solid grey;
  box-shadow: 2px 2px 1px;
}

#serverSelector {
  position: fixed;
  right: 4px;
  top: 4px;
}

#controlPoints {
  position: fixed;
  left: 4px;
  top: 40px;
  background-color: black;
  color: white
}

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
