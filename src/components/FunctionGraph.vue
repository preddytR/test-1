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
        roundedRoots: null,
      },
      width: 2,
      height: 2,
      xPercentOffset: 0,
      yPercentOffset: 0,
      scale: .9,
    }
  },
  methods: {
    evaluate: function(x_value) {
      let factors = this.func.factors;
      let total = 0;
      for (let factor of factors) {
        total += factor.coeff * (x_value ** factor.power)
      }
      return total
    },
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
    orderPoints: function(){
      let pointList = [];
      let solutionIndex = 0;
      let critIndex = 0;
      let critYValues = [];
      //let
      for (let crit of this.critSolutions) {
        critYValues.push(this.evaluate(crit))
      }
      //console.log("Y val");
      //console.log(critYValues);
      if (this.solutions.length == 0 && this.critSolutions.length ==  0){
        //console.log("Do nothing");
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
    xCoordToPercent: function(x) {
      return (x / this.width) * 100 - this.xPercentOffset
    },
    yCoordToPercent: function(y) {
      return 50 * (1 -  y / this.height)
    },
    coordsToPercent: function([x,y]) {
      //converts cartesian coordinates to an array of percentages
      //Range of output: [x:0-100,y:0-100]
      //As cartesian coords != canvas coords due to flipped y-axis, need to invert y-values
      return [this.xCoordToPercent(x), this.yCoordToPercent(y)]
    },
    percentCoordToPix: function(percentX, percentY) {
      const ctx = this.provider.context;
      let offset = 50 * (1 - this.scale);//Alternatively: coord = scale*(percent-50)+50
      return [this.percentWidthToPix(percentX * this.scale + offset,ctx), this.percentHeightToPix(percentY * this.scale + offset, ctx)]
    },
    percentWidthToPix: function(percent, ctx) {
      //const ctx = this.provider.context;
      return Math.floor((ctx.canvas.width / 100) * percent)
    },
    percentHeightToPix: function(percent, ctx) {
      //const ctx = this.provider.context;
      return Math.floor((ctx.canvas.height / 100) * percent)
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
          percentList.push(this.percentCoordToPix(...coord))
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
      //Gets coords for the x and y axis lines
      //These will extend to the edges of the canvas and so must ignore any scaling factors (the zoom factor)
      const edgeValues = this.getedgeValues;
      const ctx = this.provider.context;

      const y0 = this.yCoordToPercent(0); //Line where y=0
      const y0Pix = this.percentHeightToPix(y0, ctx);

      const x0 = -this.xPercentOffset + (this.xPercentOffset + 50)*(1 - this.scale);//line where x=0
      console.log("x0",x0);
      const x0Pix = this.percentWidthToPix(x0, ctx);

       //We skip scaling the coords down
      let xStartCoord = [0, y0Pix];
      let xEndCoord = [ctx.canvas.width, y0Pix];
      let yStartCoord = [x0Pix, 0];
      let yEndCoord = [x0Pix, ctx.canvas.height];

      const calculated = {
        xStart: xStartCoord,
        xEnd: xEndCoord,
        yStart: yStartCoord,
        yEnd: yEndCoord,
      }
      return calculated
    },
    calculatedBorder () {
      //Should draw a border that contains the entire graph, from first to last root
      const ctx = this.provider.context;
      const leftBorderTop = this.percentCoordToPix(0,0); //Graph should remain centered
      const width = ctx.canvas.width * this.scale;
      const height = ctx.canvas.height * this.scale;

      const calculated = {
        x: leftBorderTop[0],
        y: leftBorderTop[1],
        w: width,
        h: height,
      }

      return calculated
    },
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
    const ctx = this.provider.context;
    console.log("Updating");
    // console.log(this.solutions);
    //console.log(this.critSolutions);
    //console.log(this.orderPoints());
    // Keep a reference to the Graph used in the previous render call.
    //const oldGraph = this.oldGraph
    // Calculate the new Graph. (Computed properties update on-demand.)
    this.establishScale();
    const newGraph = this.calculatedGraph;

    if (newGraph != null){
      const start = newGraph.pixCoords[0];
      const crit = newGraph.pixCoords[1];
      const end = newGraph.pixCoords[2];
      const above = (crit[1] > 0) ? 1: -1;

      const cpY = crit[1] + (ctx.canvas.height / 6 - 2) * above * this.scale;
      const cp1 = [(crit[0] + start[0]) / 2 , cpY] //2 for lineWidth
      const cp2 = [(end[0] + crit[0]) / 2 , cpY]
      /*console.log(ctx.canvas.height);
      console.log("Start, crit, end");
      console.log(start,crit,end);
      console.log("cp1, cp2");
      console.log(cp1,cp2);*/

      const root1 = newGraph.roundedRoots[0];
      const root2 = newGraph.roundedRoots[1];
      /*console.log("Roots");
      console.log(root1,root2);*/
      ctx.beginPath();
      ctx.moveTo(...start);

      // Clear the old area from the previous render. x,y,w,h
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

      // Draw the new graph.
      ctx.strokeStyle="#FF0000";
      ctx.lineWidth = 2;
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
    console.log("axis");
    console.log(newAxis);
    //x-axis
    ctx.moveTo(...newAxis.xStart);
    ctx.lineTo(...newAxis.xEnd);
    //y-axis
    ctx.moveTo(...newAxis.yStart);
    ctx.lineTo(...newAxis.yEnd);
    ctx.strokeStyle="black";
    ctx.stroke();

    //Drawing Outline
    const newBorder = this.calculatedBorder;

    /*console.log("border");
    console.log(newBorder);*/
    ctx.rect(newBorder.x, newBorder.y, newBorder.w, newBorder.h);
    ctx.strokeStyle = "blue";
    ctx.stroke();
  }
}
</script>
