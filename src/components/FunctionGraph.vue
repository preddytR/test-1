<script>
import {Draw} from './drawObject'

import {Calculate} from './calculateCoords'

import {Convert} from './convertCoords'
// Note how there's no template or styles in this component.

export default {
  // Gets us the provider property from the parent <my-canvas> component.
  inject: ['provider'],

  props: {
    // Array of roots plus array of critical points
    type: {
      type: String,
      default: "Non-Linear"
    },
    solutions: {
      type: Array,
      required: true,
      //default: []
    },
    keypoints: {
      type: Array,
      required: true,
      //default: []
    },
    func: {
      type: Object,
      required: true,
    },
    // The color of the function.
    color: {
      type: String,
      default: '#F00'
    }
  },

  data () {
    return {
      // We cache the dimensions of the previous
      // render so that we can clear the area later.
      oldFunction: {
        func: null,
        pixCoords: null,
        sols: null,
        roundedRoots: null,
        width: 2,
        height: 2,
      },
      width: 2,
      height: 2,
      xPercentOffset: 0,
      yPercentOffset: 0,
      scale: .95, //Both x and y direction - zoom factor
      windowScale: 1, //How much of the webpage the canvas element should take
      draw: null,
      calculated: null,
    }
  },
  computed: {
    getedgeValues () {
      //Works out the minimum and maximum x and y values that will be drawn
      //Some of the points that need to be drawn do not exist as solutions
      //or critical points
      let min_x, max_x, min_y, max_y;
      let tLen = this.keypoints.length;
      if (this.keypoints.length == 1) {
        max_x = this.keypoints[0].points.right.x;
        min_x = this.keypoints[0].points.left.x;
        let minMaxY = this.findMinMaxY();
        min_y = minMaxY.min_y;
        max_y = minMaxY.max_y;
      } else if (this.keypoints.length != 0) {
        max_x = this.keypoints[tLen-1].points.right.x;
        min_x = this.keypoints[0].points.left.x;
        let minMaxY = this.findMinMaxY();
        min_y = minMaxY.min_y;
        max_y = minMaxY.max_y;
      } else {
        [min_x, max_x, min_y, max_y] = [-1, 1, -1, 1];
        //console.log("edgeBase");
      }
      const edgeValues = {
        max_x,
        min_x,
        max_y,
        min_y,
      };
      //console.log("edge");
      //console.log(edgeValues);
      return edgeValues
    },
  },
  mounted: function(){
    this.waiting = false;
    window.addEventListener("resize", this.resizeThrottler, false);
  },
  methods: {
    resizeThrottler: function() {
      // ignore resize events as long as an actualResizeHandler execution is in the queue
      if ( !this.waiting ) {
        this.waiting = true;
        setTimeout(this.timerFunction, 300);
      }
    },
    timerFunction: function() {
     this.waiting = false;
     //console.log("Changing", window.innerHeight, this.provider.context.canvas.height);
     this.redraw();
     //actualResizeHandler();
     //The actualResizeHandler will execute at a rate of 1fps
    },
    redraw: function() {
      if(!this.provider.context) return;
      //console.log("Updating");
      const ctx = this.provider.context;
      this.establishScale();
      let update = false;
      if (this.checkViewModified()) {
        let canvas = this.provider.context.canvas;
        canvas.height = window.innerHeight;
        canvas.width = window.innerWidth;
        update = true;
      }

      if (this.draw == null || this.checkFuncModified() ) {
        //console.log("updating function");
        update = true;
      }

      if (update) {
        this.newDrawObject()
      }
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

      this.draw.Graph();
      //this.draw.Labels(true);//Add Cross
      this.draw.Axis();
      this.draw.Border();
    },
    establishScale: function() {
      //Sets the height and width - in cartesian coordinates
      //Also sets the x-offset as a percentage
      //Otherwise cartesion x-values less than 0
      //will be drawn off to the side of the intended bounds

      const edgeValues = this.getedgeValues;

      if (edgeValues.max_x == edgeValues.min_x) {
        this.width = Math.abs(edgeValues.max_x)
      } else {
        this.width = Math.max(edgeValues.max_x - edgeValues.min_x,0);
      }
      //console.log("edge");
      //console.log(edgeValues);
      if (edgeValues.min_x == edgeValues.max_x) { //
        this.xPercentOffset = edgeValues.min_x / this.width * 100 + 50;
      } else {
        this.xPercentOffset = edgeValues.min_x / this.width * 100;
      }

      if (edgeValues.min_y == edgeValues.max_y) {
        this.height = Math.abs(edgeValues.min_y)
      } else {
        //if (this.solutions != []) {
          //this.height = Math.max(edgeValues.max_y, edgeValues.min_y);
        //} else {
          this.height = Math.max(edgeValues.max_y - edgeValues.min_y,0);
      }
      //this.height *= 2;
      //this.width *= 2;
      //this.yPercentOffset = 0;//min_y / this.height;
      //console.log("W*H",this.width,this.height);
    },
    newDrawObject: function() {
      //Recreates the this.draw object
      //Called when one of this.vars changes

      //console.log("New function");
      let ctx = this.provider.context;
      let convert = new Convert(this.width, this.height, ctx, this.xPercentOffset, this.scale);
      let calculate = new Calculate(convert, this.solutions, this.keypoints, this.func, ctx, this.type);
      this.draw = new Draw(calculate, ctx, this.scale, this.type);
    },
    checkViewModified: function() {
      let canvas = this.provider.context.canvas;
      //console.log("checking dims");
      //console.log(window.innerHeight,canvas.height);
      return window.innerHeight != canvas.height || window.innerWidth != canvas.width
    },
    checkFuncModified: function() {
      //console.log("checking func");
      //console.log(this.func);
      //console.log(this.oldFunction.func);
      let modified = false;
      if (this.func !== this.oldFunction.func) {
        this.oldFunction.func = this.func;
        modified = true
      }
      if (this.solutions !== this.oldFunction.sols) {
        this.oldFunction.sols = this.solutions;
        modified = true
      }
      /*if (modified) {
        console.log("function");
        //this.newDrawObject(); //called already
      }*/
      return modified
    },
    comparePoints: function(a, b) {
      //Used to compare the y-values of different points
      let a_y, b_y;
      if(a.Root != undefined) {
        a_y = 0
      } else {
        a_y = a.Crit.y_val
      }
      if (b.Root != undefined) {
        b_y = 0
      } else {
        b_y = b.Crit.y_val
      }
      return a_y > b_y;
    },
    findMinMaxY: function() {
      let min_y = 0;
      let max_y = 0;
      let middle = (this.type == "Linear") ? "middle" : "crit";
      for (let keypoint of this.keypoints) {
        min_y = Math.min(keypoint.points.left.y, keypoint.points[middle].y, keypoint.points.right.y, min_y);
        max_y = Math.max(keypoint.points.left.y, keypoint.points[middle].y, keypoint.points.right.y, max_y)
      }
      return {min_y, max_y}
    }
  },

  render () {
    // Since the parent canvas has to mount first, it's *possible* that the context may not be
    // injected by the time this render function runs the first time.
    //console.log("detected change");
    this.redraw();
    return true;
  }
}
</script>
