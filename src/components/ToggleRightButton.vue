<template>
  <div id="overflowManager">
	<div id="itemContainer" :class="(visible) ? 'visible' : 'notVisible'">
		<hideButton @update-visibility="visible=$event"/>
		<slot/>
	</div>
</div>
</template>

<script>
import HideButton from './HideButton.vue'

export default {
	components: {
		HideButton
	},
  data () {
    return {
      visible: false,
    }
  },
}
</script>

<style>
.visible {
  transition: transform 1s;
}
.notVisible {
  transition: transform 1s;
  transform: translate(calc(100% - 40px),0px);
}

#itemContainer {
  display: inline-block;
  float: right;
  z-index: 10;
  transition: transform 1s;
}

#overflowManager {
  display: block;
  overflow: hidden;
}
</style>
