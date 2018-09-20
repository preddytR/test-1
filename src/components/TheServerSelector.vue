<template>
	<div id="serverSelector">
		<div id="switchMessage">API service</div>
		<div class="btn-group-vertical" role="group" aria-label="Switch webservice">
			<button :class="['btn btn-outline-dark', {active:localServer}]" name="local" @click="updateServer(true)">Local</button>
			<button :class="['btn btn-outline-dark', {active:!localServer}]" name="web" @click="updateServer(false)">Web</button>
		</div>
	</div>
</template>

<script>
export default {
  data () {
    return {
     localServer: false,
    }
  },
  methods: {
    updateServer(value) {
      this.localServer = value;
      this.$emit('update-server',value)
    }
  }
}
</script>

<style lang="scss">
#serverSelector {
	float: right;
  position: relative;
  right: 0px;
	background-color: white;
	border: 1px solid grey;
	border-radius: .25rem;
  box-shadow: 2px 2px 1px;
	#switchMessage {
		display: inline;
		padding-left: 5px;
		padding-right: 5px;
	}
	z-index: 110;
}
</style>
