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
      //default: []
    },
    mergedPoints: {
      type: Array,
      //default: []
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
      scale: .75, //Both x and y direction - zoom factor
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
    distance: function(x1,y1,x2,y2) {
      return Math.sqrt((x1-y1)**2 + (x2-y2)**2)
    },
    newDrawObject: function() {
      //console.log("New function");
      let ctx = this.provider.context;
      let convert = new Convert(this.width, this.height, ctx, this.xPercentOffset, this.scale);
      let calculate = new Calculate(convert, this.solutions, this.mergedPoints, this.func, ctx);
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
      /*if (modified) {
        console.log("function");
        //this.newDrawObject(); //called already
      }*/
      return modified
    },
    comparePoints: function(a, b) {
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
    }
  },
  computed: {
    getedgeValues () {
      let min_x, max_x, min_y, max_y;
      let mLen = this.mergedPoints.length - 1;
      let leftCrit = this.mergedPoints[0].Crit != undefined;
      let rightCrit = this.mergedPoints[mLen].Crit != undefined;
      if (leftCrit || rightCrit) {
        //Usually a cubic/ other graph w inflection point
        console.log("Hehe");
        let index = (leftCrit) ? 0 : mLen;
        const solX = this.solutions[0];
        const critX = this.mergedPoints[index].Crit.x_val;
        const critY = this.mergedPoints[index].Crit.y_val;
        const mirrorX = 2 * critX - solX;
        const mirrorY = 2 * critY

        min_x = Math.min(mirrorX, solX, critX);
        max_x = Math.max(mirrorX, solX, critX);
        min_y = Math.min(mirrorY, 0, critY);
        max_y = Math.max(mirrorY, 0, critY);

      } else if (this.mergedPoints.length != 0) {
        if (this.mergedPoints[0].Root != undefined) {
          min_x = this.mergedPoints[0].Root
        } else {
          min_x = this.mergedPoints[0].Crit.x_val
        }
        let mLen = this.mergedPoints.length - 1;
        if (this.mergedPoints[mLen].Root != undefined) {
          max_x = this.mergedPoints[mLen].Root
        } else {
          max_x = this.mergedPoints[mLen].Crit.x_val
        }

        let mergedCopy = this.mergedPoints.slice();
        mergedCopy.sort(this.comparePoints);

        if (mergedCopy[0].Root != undefined) {
          min_y = 0
        } else {
          min_y = mergedCopy[0].Crit.y_val
        }
        if (mergedCopy[mLen].Root != undefined) {
          max_y = 0
        } else {
          max_y = mergedCopy[mLen].Crit.y_val
        }
      } else {
        [min_x, max_x, min_y, max_y] = [-1, 1, -1, 1];
      }
      const edgeValues = {
        "max_x": max_x,
        "min_x": min_x,
        "max_y": max_y,
        "min_y": min_y,
      };
      console.log("edge");
      console.log(edgeValues);
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
