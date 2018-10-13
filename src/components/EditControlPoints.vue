<template>
	<div v-if="keypoints.length > 0" id="controlPoints">
		<div v-for="(point, index) in controlPointsList"
			:key="index">
			<div class="input-group mb-3">
				<div class="input-group-prepend">
					<span class="input-group-text">{{point.name}}</span>
					<span class="input-group-text">x</span>
				</div>
				<input v-model="point.CP.x" name="cpx" type="number" style="width:100px;" class="form-control">
				<span class="input-group-text">y</span>
				<input v-model="point.CP.y" name="cpy" type="number" style="width:100px;" class="form-control">
			</div>
		</div>
	</div>
</template>

<script>
import HideButton from './HideButton.vue'

export default {
	components: {
		HideButton,
	},
	props: {
		type: {
			type: String,
			default: "Non-Linear"
		},
		keypoints: {
			type: Array,
			default: function() {
				return []
			},
		}
	},
	data () {
		return {
			decimalPoints: 2,
			visible: true,
		}
	},
	computed: {
		controlPointsList(){
			if (this.type == "Non-Linear") {
				let controlList = [];
				for (let keypoint of this.keypoints) {
					controlList.push({name:'CP1',
					CP: keypoint.controlPoints.CP1});
					controlList.push({name:'CP2',
					CP: keypoint.controlPoints.CP2});
				}
				for (let point of controlList) {
					point.CP.x = this.rounded(point.CP.x);
					point.CP.y = this.rounded(point.CP.y);
				}
				return controlList
			} else {
				return []
			}
		},
	},
	methods: {
		rounded: function(value){
			return Math.round(value * (10 ** this.decimalPoints)) / (10 ** this.decimalPoints)
		},
		toggleVisibility: function() {
			if (!this.visible) {
				this.visible = true
			}
		}
	},
}
</script>

<style>
#controlPoints {
	/*position: relative;*/
	/*top: 0px;*/
	float: right;
	z-index: 100;
	width: 325px;
	background-color: white;
	padding-top:15px;
	border: 1px solid grey;
	box-shadow: 2px 2px 1px;
	transition: transform 1s;
	position: relative;
	right: 0px;
}

.coord-input {
	width: 3em;
}
</style>
