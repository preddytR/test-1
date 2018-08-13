<template>
  <div id="app">
    <h1>{{ msg }}</h1>
    <span>Enter a polynomial function to solve: </span>
    <input name="poly" v-model="stringFunction" type="text" placeholder="e.g 4x^2+2x+3">
    <button name="solve" @click="checkFunction">Solve</button>
    <p>{{result}}</p>
  </div>
</template>

<script>
import {sendFunction} from './solutionRequests/sendFunction'
export default {
  name: 'app',
  data () {
    return {
      stringFunction: "x^2-1",
      result: "",
      msg: 'Solve any integer coeffients, integer power, single variable polynomial functions here'
    }
  },
  methods: {
    checkFunction(){
      this.result = this.sendFunction(this.stringFunction);
    },
    sendFunction
  }
}
</script>

<style lang="scss">
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
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
</style>
