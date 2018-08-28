import {Convert,
        percentWidthToPix,
        percentHeightToPix} from './convertCoords'


class Calculate {
  constructor(convert, solutions, critSolutions, func, ctx) {
    this.convert = convert;
    this.solutions = solutions;
    this.critSolutions = critSolutions;
    this.func = func;
    this.ctx = ctx;
    this.scale = this.convert.scale;
    this.xPercentOffset = this.convert.xPercentOffset;
    //let this.convert = new Convert(this.width, this.height, this.provider.context, this.xPercentOffset);
  }
  get Graph() {
    //const this.ctx = this.provider.context

    const points = this.orderPoints();
    if (points.length != 0){
      /*console.log("Points");
      console.log(points);*/
      let coordList = [];
      let rootList = [];//list of rounded roots to be displayed as labels
      // Turn start / end percentages into x, y, width, height in pixels.
      for (let point of points) {
        if (point.Crit != undefined) {
          coordList.push(this.convert.coordsToPercent(point.Crit))
        } else {
          rootList.push(Math.round(point.Root*100)/100);
          coordList.push(this.convert.coordsToPercent([point.Root,0]))
        }
      }
      //console.log("Percent");
      //console.log(coordList);
      let percentList = [];
      for (let coord of coordList) {
        //Need to inverse y-axis to conform to canvas coordinates
        percentList.push(this.convert.percentCoordToPix(...coord))
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
  }
  get Axis() {
    //Gets coords for the x and y axis lines
    //These will extend to the edges of the canvas and so must ignore any scaling factors (the zoom factor)
    const edgeValues = this.getedgeValues;

    const y0 = this.convert.yCoordToPercent(0); //Line where y=0
    const y0Pix = this.convert.percentHeightToPix(y0, this.ctx);

    const x0 = -this.xPercentOffset + (this.xPercentOffset + 50)*(1 - this.scale);//line where x=0
    //console.log("x0",x0);
    const x0Pix = this.convert.percentWidthToPix(x0, this.ctx);

     //We skip scaling the coords down
    let xStartCoord = [0, y0Pix];
    let xEndCoord = [this.ctx.canvas.width, y0Pix];
    let yStartCoord = [x0Pix, 0];
    let yEndCoord = [x0Pix, this.ctx.canvas.height];

    const calculated = {
      xStart: xStartCoord,
      xEnd: xEndCoord,
      yStart: yStartCoord,
      yEnd: yEndCoord,
    }
    return calculated
  }
  get Border() {
    //Should draw a border that contains the entire graph, from first to last root
    const leftBorderTop = this.convert.percentCoordToPix(0,0); //Graph should remain centered
    const width = this.ctx.canvas.width * this.scale;
    const height = this.ctx.canvas.height * this.scale;

    const calculated = {
      x: leftBorderTop[0],
      y: leftBorderTop[1],
      w: width,
      h: height,
    }

    return calculated
  }
  orderPoints() {
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
  }
  evaluate(x_value) {
    let factors = this.func.factors;
    let total = 0;
    for (let factor of factors) {
      total += factor.coeff * (x_value ** factor.power)
    }
    return total
  }
}

export {Calculate}
