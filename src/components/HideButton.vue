<template>
	<button id="hideButton" class="btn btn-outline-dark" @click="toggleVisibility()">
		<div v-if="visible">&#10097;</div>
		<div v-else>&#10096;</div>
	</button>
</template>

<script>
export default {
  data (){
    return {
      visible: false
    }
  },
  methods: {
    toggleVisibility: function() {
      this.visible = !this.visible
      this.$emit('update-visibility',this.visible)
    }
  }
}
</script>
<style>
#hideButton {
  position: relative;
  height: 77px;
  top: 0;
  left: 0;
  width: 1em;
  z-index: 2;
  font-size: 40px;
}
</style>
