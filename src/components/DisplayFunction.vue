<template>
	<div id="functionPreview">
		<div id="functionTerm">f(x)</div>
		<div v-if="stringFunction.length > 0 && validFunction" id="functionTerm">=</div><!--&ne;-->
		<div v-for="term in termStrings" id="termContainer" :key="term.index">
			<div v-if="termStrings.indexOf(term) != 0 || !term.positive" id="functionTerm">
				<div v-if="term.positive" id="sign">&plus;</div>
				<div v-else id="sign">&minus;</div>
			</div>
			<div id="functionTerm">
				<div v-if="term.coeff != ''" id="coeff">{{term.coeff}}</div>
				<div v-if="term.variable != ''" id="var">{{term.variable}}</div>
				<div v-if="term.power != ''" id="power"><sup>{{term.power}}</sup></div>
			</div>
		</div>
	</div>
</template>

<script>
export default {
  props: {
    stringFunction: {
      type: String,
      default: ''
    },
    validFunction: {
      type: Boolean,
      default: false
    },
    termStrings: {
      type: Array,
      default: function () {
        return []
      }
    }
  },
  /*data () {
    return {
      stringFunction: "x^25+x^6+2",
    }
  }*/
}
</script>

<style>
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
