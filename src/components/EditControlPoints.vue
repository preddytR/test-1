<template>
  <div id="controlContainer" :class="(visible) ? 'visible' : 'notVisible'">
    <div id="controlPoints">
      <div id="hideButton" @click="visible = !visible">
        <div v-if="visible">&#10097;</div>
        <div v-else>&#10096;</div>
      </div>
      <div v-for="(point, index) in controlPointsList">
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
  </div>
</template>

<script>
export default {
  props: {
    keypoints: {
      type: Array,
      default: [],
    }
  },
  data () {
    return {
      decimalPoints: 2,
      visible: false,
    }
  },
  computed: {
    controlPointsList(){
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
    },
  },
  methods: {
    rounded: function(value){
      return Math.round(value * (10 ** this.decimalPoints)) / (10 ** this.decimalPoints)
    }
  },
}
</script>

<style>
.visible {
  transition: transform 2s;
}
.notVisible {
  transition: transform 2s;
  transform: translate(325px,0px);
}

#controlContainer {
  width: 325px;
  position: absolute;
  top: 40px;
  z-index: 100;
  right: 0px;

}
#controlPoints {
  background-color: white;
  padding-top:15px;
  border: 1px solid grey;
  box-shadow: 2px 2px 1px;
  transition: transform 1s;
}
 .notVisible #controlPoints:hover {
  transform: translate(-60px,0);
}
.coord-input {
  width: 3em;
}
#hideButton {
  position: absolute;
  left: -0.5em;
  top: 0px;
  background: white;
  border: 1px solid grey;
  width: 0.5em;
  font-size: 40px;
}
</style>
