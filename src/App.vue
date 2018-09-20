<template>
	<div id="app">
		<div id="hideToggle"
			:class="[{isNotVisible:!visible},'btn btn-outline-dark']"
			@mouseover="dimmed = true;if(!visible){tempVisible = true};"
			@mouseleave="dimmed = false; tempVisible = false"
			@click="visible = !visible;">
			<i class="fa fa-eye"/>
		</div>
		<div v-if="!perfectGraph" id="approximationWarning">Approximation</div>
		<div id="rightToolbar">
			<toggle-right-button v-if="serverSwitch">
				<the-server-selector
					@update-server="localServer=$event"/>
			</toggle-right-button>
			<toggle-right-button v-if="modifiedKeypoints.length>0">
				<edit-control-points
					:keypoints = "modifiedKeypoints"/>
			</toggle-right-button>
		</div>
		<div v-if="visible || tempVisible" :class="{isDimmed:dimmed}" id="center">
			<h1 class="display-4">{{ msg }}</h1>
			<span>Enter a polynomial function to solve: </span>
			<div id="InputBar" class="input-group input-group-lg">
				<div class="input-group-prepend">
					<span class="input-group-text">f(x)=</span>
				</div>
				<input v-model="stringFunction" name="poly" type="text" placeholder="4x^2+2x+3" class="form-control">
				<div class="input-group-append">
					<button name="solve" class="btn btn-primary" @click="checkFunction">Solve</button>
				</div>
			</div>
			<display-function
				:string-function="stringFunction"
				:valid-function="validFunction"
				:term-strings="termStrings"/>
			<div v-if="solutions.length != 0" id="functionSolutions">
				<div id="functionTerm">x</div>
				<div id="functionTerm">=</div>
				<div v-for="(sol, index) in solutions" id="functionTerm" :key="index">
					<div id="coeff">{{sol}}</div>
				</div>
			</div>
		</div>
		<my-canvas :class="{isDimmed:visible}" style="width:100%; height:100%;margin:auto;">
			<function-graph
				:solutions="solutions"
				:keypoints="modifiedKeypoints"
				:func="func"
			/>
		</my-canvas>
	</div>
</template>

<script>
import {TokensToAST} from './algorithm/TokensToAST'

import MyCanvas from './components/MyCanvas.vue'
import FunctionGraph from './components/FunctionGraph.vue'
import TheServerSelector from './components/TheServerSelector.vue'
import DisplayFunction from './components/DisplayFunction.vue'
import EditControlPoints from './components/EditControlPoints.vue'
import ToggleRightButton from './components/ToggleRightButton.vue'

//import {sendFunction} from './solutionRequests/sendFunction'
export default {
  name: 'app',
  components : {
    MyCanvas,
    FunctionGraph,
		TheServerSelector,
		DisplayFunction,
		EditControlPoints,
		ToggleRightButton,
  },
  data () {
    return {
      visible: true,
      tempVisible: false,
      dimmed: false,
      serverSwitch: true,
			localServer: false,
      stringFunction: "x^25+x^6+2",
      func: {'factors':[],'length':0},
      funcString: "", //Whether to use to local api, for testing purposes only
      validFunction: true,
      result: "",
      error: "",
			perfectGraph: true,
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
        //console.log(this.error);
        throw this.error;
      }
      this.haveAllInfo = false;
      let func = generate.factor();
      this.func = func
      this.funcString = func.toString();
      this.terms = func.factors;
      this.formatTokens();
			//console.log("loc",this.apiLocation);
      this.$http.post(this.apiLocation + '/function',func)
      .then(function(response){
        let results = response.body.solutions;
        let time = response.body.time;
        this.funcId = response.body.id;
        this.$http.get(this.apiLocation + '/keypoints',{params: {'id': this.funcId}})
        .then(function(response2){
          this.keypoints = response2.body.keypoints;
          this.modifiedKeypoints = this.keypoints;
					let allMatched = true;
					for (let keypoint of this.keypoints) {
						if (!keypoint.matched) {
							allMatched = false;
						}
					}
					this.perfectGraph = allMatched;

          this.solutions = results; //called here so both set at same time
          //console.log("db");
          //console.log(this.keypoints);
          //console.log(results);
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
      let index = 0;
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
        let termDict = {index,
                    'coeff':coeff,
                    'variable':variable,
                    'power':power,
                    'positive':positive}
        new_list.push(termDict)
        index += 1;
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

.isNotVisible {
  color: red;
  background-color: black;
}
#rightToolbar {
	position: absolute;
	right: 0;
	width: 400px;
	height: 100%;
}
#approximationWarning {
	width: 100%;
	position: fixed;
	left: 0px;
	top: 30%;
	font-size: 10vw;
	opacity: 0.25;
	z-index: -100;
}
#hideToggle {
  position: fixed;
  left: 4px;
  top: 4px;
  width: 2em;
  padding: 1px;
  border: 1px solid grey;
  box-shadow: 2px 2px 1px;
	z-index: 100;
}

#app {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  /*color: #2c3e50;*/
}

#InputBar {
  width: 70%;
  margin: auto;
	/*z-index: -10;*/
}
#center {
	/*z-index: -11;*/
}

</style>
