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
    solutions: {
      type: Array,
      default: []
    },
    critSolutions: {
      type: Array,
      default: []
    },
    func: {
      type: Object,
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
      scale: 1, //Both x and y direction - zoom factor
      windowScale: 1, //How much of the webpage the canvas element should take
      draw: null,
      calculated: null,
    }
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
     console.log("Changing", window.innerHeight, this.provider.context.canvas.height);
     this.redraw();
     //actualResizeHandler();
     //The actualResizeHandler will execute at a rate of 1fps
    },
    redraw: function() {
      if(!this.provider.context) return;
      //console.log("Updating");
      const ctx = this.provider.context;
      this.establishScale();

      if (this.checkViewModified()) {
        let canvas = this.provider.context.canvas;
        canvas.height = window.innerHeight;
        canvas.width = window.innerWidth;
      }

      if (this.draw == null || this.checkFuncModified() ) {
        //console.log("updating function");
        this.newDrawObject()
      }

      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

      this.draw.Graph();
      this.draw.Axis();
      this.draw.Border();
    },
    establishScale: function() {
      const edgeValues = this.getedgeValues;

      if (edgeValues.max_x == edgeValues.min_x) {
        this.width = Math.abs(edgeValues.max_x)
      } else {
        this.width = Math.max(edgeValues.max_x - edgeValues.min_x,0);
      }
      //console.log("edge");
      //console.log(edgeValues);
      if (edgeValues.min_x == edgeValues.max_x) { //
        this.xPercentOffset = edgeValues.min_x / this.width * 100+ 50;
      } else {
        this.xPercentOffset = edgeValues.min_x / this.width * 100;
      }

      if (edgeValues.min_y == edgeValues.max_y) {
        this.height = Math.abs(edgeValues.min_y)
      } else {
        this.height = Math.max(edgeValues.max_y - edgeValues.min_y,0);
      }
      //this.height *= 2;
      //this.width *= 2;
      //this.yPercentOffset = 0;//min_y / this.height;
      //console.log(this.width,this.height,this.xPercentOffset,this.yPercentOffset);
    },
    distance: function(x1,y1,x2,y2) {
      return Math.sqrt((x1-y1)**2 + (x2-y2)**2)
    },
    newDrawObject: function() {
      //console.log("New function");
      let ctx = this.provider.context;
      let convert = new Convert(this.width, this.height, ctx, this.xPercentOffset, this.scale);
      let calculate = new Calculate(convert, this.solutions, this.critSolutions, this.func, ctx);
      this.draw = new Draw(calculate, ctx, this.scale);
    },
    evaluate: function(x_value) {
      let factors = this.func.factors;
      let total = 0;
      for (let factor of factors) {
        total += factor.coeff * (x_value ** factor.power)
      }
      return total
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
      return modified
      if (modified) {
        console.log("function");
        //this.newDrawObject(); //called already
      }
    },

  },
  computed: {
    getedgeValues () {
      let min_x, max_x, min_y, max_y;
      if (this.solutions.length != 0 || this.critSolutions.length != 0) {
        let min_s_x = Math.min(...this.solutions);//Is zero if has no elements
        let max_s_x = Math.max(...this.solutions);
        let min_c_x = Math.min(...this.critSolutions);
        let max_c_x = Math.min(...this.critSolutions);

        if (min_s_x < min_c_x) {
          min_x = min_s_x
        } else {
          min_x = max_c_x
        }

        if (max_s_x > max_c_x) {
          max_x = max_s_x
        } else {
          max_x = max_c_x
        }

        let critYValues = [];
        for (let crit of this.critSolutions) {
          critYValues.push(this.evaluate(crit))
        }

        min_y = Math.min(...critYValues);
        max_y = Math.min(...critYValues);
      } else {
        [min_x, max_x, min_y, max_y] = [-1, 1, -1, 1];
      }
      const edgeValues = {
        "max_x": max_x,
        "min_x": min_x,
        "max_y": max_y,
        "min_y": min_y,
      };
      return edgeValues
    },
  },

  render () {
    // Since the parent canvas has to mount first, it's *possible* that the context may not be
    // injected by the time this render function runs the first time.
    this.redraw();
  }
}
</script>
