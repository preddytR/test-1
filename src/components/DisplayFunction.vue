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
      type: Boolean
    },
    termStrings: {
      type: Array,
      default: []
    }
  },
  /*data () {
    return {
      stringFunction: "x^25+x^6+2",
    }
  }*/
}
</script>
