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
        pixCoords: null,
        roundedRoots: null,
      },
      width: 2,
      height: 2,
      xPercentOffset: 0,
      yPercentOffset: 0,
      scale: .5,
      draw: null,
      calculated: null
    }
  },
  methods: {
    establishScale: function() {
      const edgeValues = this.getedgeValues;

      if (edgeValues.max_x == edgeValues.min_x) {
        this.width = Math.abs(edgeValues.max_x)
      } else {
        this.width = Math.max(edgeValues.max_x - edgeValues.min_x,0);
      }
      console.log("edge");
      console.log(edgeValues);
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
    checkDraw: function() {
      //Create if not defined
      if (this.draw == null) {
        console.log("do");
        let ctx = this.provider.context;
        let convert = new Convert(this.width, this.height, ctx, this.xPercentOffset, this.scale);
        let calculate = new Calculate(convert, this.solutions, this.critSolutions, this.func, ctx);
        this.draw = new Draw(calculate, ctx, this.scale);
      } else {
        console.log("dont");
          //update values because I enjoy suffering
        if (this.scale != this.draw.scale) {
          this.draw.scale = this.scale;
          this.draw.calculated.scale = this.scale;
          this.draw.calculated.convert.scale = this.scale;
        }
        if (this.solutions != this.draw.calculated.solutions) {
          this.draw.calculated.solutions = this.solutions
        }
        if (this.critSolutions != this.draw.calculated.critSolutions) {
          this.draw.calculated.critSolutions = this.critSolutions
        }
        if (this.xPercentOffset != this.draw.calculated.convert.xPercentOffset) {
          this.draw.calculated.convert.xPercentOffset = this.xPercentOffset;
          this.draw.calculated.xPercentOffset = this.xPercentOffset
        }
        if (this.width != this.draw.calculated.convert.width) {
          this.draw.calculated.convert.width = this.width
        }
        if (this.height != this.draw.calculated.convert.height) {
          this.draw.calculated.convert.height = this.height
        }
        if (this.func != this.draw.calculated.func) {
          this.draw.calculated.func = this.func;
        }
      }
    },
    evaluate: function(x_value) {
      let factors = this.func.factors;
      let total = 0;
      for (let factor of factors) {
        total += factor.coeff * (x_value ** factor.power)
      }
      return total
    }
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
    if(!this.provider.context) return;
    console.log("Updating");
    const ctx = this.provider.context;
    this.establishScale();
    this.checkDraw();

    // console.log(this.solutions);
    //console.log(this.critSolutions);
    //console.log(this.orderPoints());
    // Keep a reference to the Graph used in the previous render call.
    //const oldGraph = this.oldGraph
    // Calculate the new Graph. (Computed properties update on-demand.)

    //console.log("Drawing");
    //console.log(this.draw);
    //console.log(this.draw.calculated);
    this.draw.Graph();
    this.draw.Axis();
    this.draw.Border();
  }
}
</script>
