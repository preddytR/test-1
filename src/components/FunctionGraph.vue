<script>
// Note how there's no template or styles in this component.

// Helper functions to convert a percentage of canvas area to pixels.
const percentWidthToPix = (percent, ctx) => Math.floor((ctx.canvas.width / 100) * percent)
const percentHeightToPix = (percent, ctx) => Math.floor((ctx.canvas.height / 100) * percent)

const percentCoordToPix = (percentX, percentY, ctx) => [percentWidthToPix(percentX,ctx), percentHeightToPix(percentY, ctx)]
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
      },
      width: 10,
      height: 10,
      xPercentOffset: 0,
      yPercentOffset: 0,
    }
  },
  methods: {
    evaluate: function(x_value){
      let factors = this.func.factors;
      let total = 0;
      for (let factor of factors) {
        total += factor.coeff * (x_value ** factor.power)
      }
      return total
    },
    getedgeValues : function() {
      let min_s_x = Math.min(...this.solutions);//Is zero if has no elements
      let max_s_x = Math.max(...this.solutions);
      let min_c_x = Math.min(...this.critSolutions);
      let max_c_x = Math.min(...this.critSolutions);

      let min_x, max_x;
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

      let min_y = Math.min(...critYValues);
      let max_y = Math.min(...critYValues);

      const edgeValues = {
        "max_x": max_x,
        "min_x": min_x,
        "max_y": max_y,
        "min_y": min_y,
      };
      return edgeValues
    },
    establishScale: function(){
      const edgeValues = this.getedgeValues;

      if (edgeValues.max_x == edgeValues.min_x){
        this.width = Math.abs(edgeValues.max_x)
      } else {
        this.width = Math.max(edgeValues.max_x -edgeValues.min_x,0);
      }

      this.xPercentOffset = edgeValues.min_x / this.width * 100;



      if (edgeValues.min_y == edgeValues.max_y) {
        this.height = Math.abs(edgeValues.min_y)
      } else {
        this.height = Math.max(edgeValues.max_y - edgeValues.min_y,0);
      }
      //this.height *= 1.1;
      //this.width *= 1.1;
      //this.yPercentOffset = 0;//min_y / this.height;
      //console.log(this.width,this.height,this.xPercentOffset,this.yPercentOffset);

    },
    orderPoints: function(){
      let pointList = [];
      let solutionIndex = 0;
      let critIndex = 0;
      let critYValues = []
      for (let crit of this.critSolutions) {
        critYValues.push(this.evaluate(crit))
      }
      //console.log("Y val");
    //  console.log(critYValues);
      if (this.solutions.length == 0 && this.critSolutions.length ==  0){
        console.log("Do nothing");
      } else {
        let index = 0;
        let revSols = this.solutions.slice();
        revSols.reverse();
        let revCrit = this.critSolutions.slice();
        revCrit.reverse();
        let revCritY = critYValues.slice();
        revCritY.reverse();
        let nextRoot = revSols.pop();
        let nextCrit = revCrit.pop();
        let nextYCrit = revCritY.pop();
        //Basically a variation of merge sort, assuming the sols and crit sols have
        //already been sorted
        while (pointList.length < this.solutions.length + this.critSolutions.length) {
          if (nextRoot != undefined && nextCrit != undefined) {
            if (nextRoot < nextCrit) {
              pointList.push({"Root": nextRoot});
              nextRoot = revSols.pop()
            } else {
              pointList.push({"Crit":[nextCrit, nextYCrit]});
              nextCrit = revCrit.pop();
              nextYCrit = revCritY.pop();
            }
          } else if (nextRoot != undefined) {
            pointList.push({"Root": nextRoot});
            nextRoot = revSols.pop()
          } else if (nextCrit != undefined) {
            pointList.push({"Crit":[nextCrit, nextYCrit]});
            nextCrit = revCrit.pop();
            nextYCrit = revCritY.pop();
          } else { //Should never happen
            console.log("Oof");
          }
        }
      }

      return pointList
    },
    coordsToPercent: function([x,y]){
      //converts cartesian coordinates to an array of percentages
      //Range of output: [x:0-100,y:0-100]
      //As cartesian coords != canvas coords due to flipped y-axis, need to invert y-values
      return [(x / this.width) * 100 - this.xPercentOffset, (100 - (y / this.height) * 100) / 2]
    },
    distance: function(x1,y1,x2,y2) {
      return Math.sqrt((x1-y1)**2 + (x2-y2)**2)
    }
  },
  computed: {
    calculatedGraph () {
      const ctx = this.provider.context

      const points = this.orderPoints();
      if (points.length != 0){
        //console.log("Points");
        //console.log(points);
        this.establishScale();
        let coordList = [];
        let rootList = [];//list of rounded roots to be displayed as labels
        // Turn start / end percentages into x, y, width, height in pixels.
        for (let point of points) {
          if (point.Crit != undefined) {
            coordList.push(this.coordsToPercent(point.Crit))
          } else {
            rootList.push(Math.round(point.Root*100)/100);
            coordList.push(this.coordsToPercent([point.Root,0]))
          }
        }
        //console.log("Percent");
        //console.log(coordList);
        let percentList = [];
        for (let coord of coordList) {
          //Need to inverse y-axis to conform to canvas coordinates
          percentList.push([percentWidthToPix(coord[0], ctx), percentHeightToPix(coord[1],ctx)])
        }
        const calculated = {
          pixCoords: percentList,
          roundedRoots: rootList,
        }
        //console.log("Coords");
        //console.log(percentList);
        // Yes yes, side-effects. This lets us cache the Graph dimensions of the previous render.
        // before we re-calculate calculatedGraph the next render.
        this.oldFunction = calculated
        return calculated
      } else {
        return null
      }

    },
    calculatedAxis () {
      const ctx = this.provider.context;

      const edgeValues = this.getedgeValues;

      //The smallest axis generated will have range +/- 1
      const left_limit = Math.min(edgeValues.min_x,-1);
      const right_limit = Math.max(edgeValues.max_x,1);
      const up_limit = Math.max(edgeValues.max_y,1);
      const down_limit = Math.min(edgeValues.min_y,-1);

      const xAxisStart = this.coordsToPercent([left_limit,0]);
      const xAxisEnd = this.coordsToPercent([right_limit,0]);

      const yAxisStart = this.coordsToPercent([0,up_limit]);
      const yAxisEnd = this.coordsToPercent([0,down_limit]);

      const calculated = {
        xStart: percentCoordToPix(...xAxisStart, ctx),
        xEnd: percentCoordToPix(...xAxisEnd, ctx),
        yStart: percentCoordToPix(...yAxisStart, ctx),
        yEnd: percentCoordToPix(...yAxisEnd, ctx),
      }
      return calculated
    },
    getedgeValues () {
      let min_s_x = Math.min(...this.solutions);//Is zero if has no elements
      let max_s_x = Math.max(...this.solutions);
      let min_c_x = Math.min(...this.critSolutions);
      let max_c_x = Math.min(...this.critSolutions);

      let min_x, max_x;
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

      let min_y = Math.min(...critYValues);
      let max_y = Math.min(...critYValues);

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
    const ctx = this.provider.context;
    console.log("Updating");
  //  console.log(this.solutions);
    //console.log(this.critSolutions);
    //console.log(this.orderPoints());
    // Keep a reference to the Graph used in the previous render call.
    //const oldGraph = this.oldGraph
    // Calculate the new Graph. (Computed properties update on-demand.)
    const newGraph = this.calculatedGraph;
    if (newGraph != null){
      const start = newGraph.pixCoords[0];
      const crit = newGraph.pixCoords[1];
      const end = newGraph.pixCoords[2];
      const above = (crit[1] > 0) ? 1: -1;
      const cp1 = [(crit[0] + start[0]) / 2, crit[1] + (ctx.canvas.height / 6 - 2) * above] //2 for lineWidth
      const cp2 = [(end[0] + crit[0]) / 2, crit[1] + (ctx.canvas.height / 6 - 2) * above]
      console.log(ctx.canvas.height);
      console.log("Start, crit, end");
      console.log(start,crit,end);
      console.log("cp1, cp2");
      console.log(cp1,cp2);

      const root1 = newGraph.roundedRoots[0];
      const root2 = newGraph.roundedRoots[1];
      console.log("Roots");
      console.log(root1,root2);
      ctx.beginPath();
      ctx.moveTo(...start);
      // Clear the old area from the previous render. x,y,w,h
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      // Clear the area for the text.
      //ctx.clearRect(newGraph.x, newGraph.y - 42, newGraph.w, 100);

      // Draw the new rectangle.
      ctx.strokeStyle="#FF0000";
      ctx.lineWidth = 2;
      //ctx.arcTo(start[0],cp1[1],...cp1,100);
      //ctx.arcTo(cp1[0],cp1[1],...end,(rad2+rad1)/4);
      //ctx.quadraticCurveTo(...cp1, ...end);
      ctx.bezierCurveTo(...cp1,...cp2,...end);
      ctx.stroke();

      //Drawing labels
      ctx.font = "20px Verdana";
      ctx.textBaseline = "top";
      ctx.fillText(root1,...start);
      ctx.fillText(root2,...end);
    }


    const newAxis = this.calculatedAxis;
    ctx.beginPath();
    ctx.lineWidth = 1;
    ctx.moveTo(...newAxis.xStart);
    ctx.lineTo(...newAxis.xEnd);
    ctx.moveTo(...newAxis.yStart);
    ctx.lineTo(...newAxis.yEnd);
    ctx.strokeStyle="black";
    ctx.stroke();
    //ctx.fillStyle = "red"//this.color;
    //ctx.fill();

    // Draw the text
    /*ctx.fillStyle = '#000'
    ctx.font = '28px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(Math.floor(this.value), (newGraph.x + (newGraph.w / 2)), newGraph.y - 14)*/
  }
}
</script>
