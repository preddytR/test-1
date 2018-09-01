import {Convert,
        percentWidthToPix,
        percentHeightToPix} from './convertCoords'


class Calculate {
  constructor(convert, solutions, critSolutions, func, ctx) {
    this.convert = convert;
    this.solutions = solutions;
    this.critSolutions = critSolutions;
    this.oldSols = solutions;
    this.oldCrits = critSolutions;
    if (solutions != undefined) {
      this.rootCount = this.solutions.length
    } else {
      this.rootCount = -1
    }
    if (critSolutions != undefined) {
      this.critCount = this.critSolutions.length;
    } else {
      this.critCount = -1
    }

    this.func = func;
    this.ctx = ctx;
    this.scale = this.convert.scale;
    this.xPercentOffset = this.convert.xPercentOffset;

    let ordered = this.orderPoints();
    /*console.log("order");
    console.log(this.solutions);
    console.log(this.critSolutions);
    console.log(ordered);*/
    this.bezierList = this.convertToBeziers(ordered);
    //console.log("beziers");
    //console.log(this.bezierList);
    //let this.convert = new Convert(this.width, this.height, this.provider.context, this.xPercentOffset);
  }
  get Curves() {
    if (this.bezierList.length > 0) {
      let convertedCurveList = [];
      let rootList = [];
      for (let curve of this.bezierList) {
        let convertedCurve = {};
        if (curve.type == 'linear') {
          console.log('linear X');
        } else if (curve.type == 'Cubic') {
          convertedCurve.type = 'Cubic';
          convertedCurve.left = this.convert.cartesianCoordsToCanvas(curve.leftX,curve.leftY);
          convertedCurve.middle = this.convert.cartesianCoordsToCanvas(curve.middleX, curve.middleY);
          convertedCurve.right = this.convert.cartesianCoordsToCanvas(curve.rightX, curve.rightY);

          const root1 = Math.round(curve.leftX*100)/100;
          const root2 = Math.round(curve.rightX*100)/100;

          convertedCurve.root1 = root1;
          convertedCurve.root2 = root2;
          rootList.push(root1);
          rootList.push(root2);

          convertedCurveList.push(convertedCurve)
        } else {
          console.log('Oooof');
        }
      }
      const calculated = convertedCurveList;

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
    if (this.rootCount > 0 && this.critCount > 0) {
      let index = 0;
      let revSols = this.solutions.slice();//copy
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
      while (pointList.length < this.rootCount + this.critCount) {
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
    } else {
      console.log("yikes");
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
  convertToBeziers(orderedPoints) {
    //converts an ordered list of points to a list of peicewise bezier curves or lines fitting those points
    let curveList = []; //list of curve objects
    if (this.rootCount == 0 && this.critCount ==  0){
      //console.log("Do nothing");
    } else if (this.rootCount == 0 && this.critCount > 0) {
      //No real solutions but need to draw
    } else if (this.rootCount == 1 && this.critCount == 0) {
      //A linear function
      let x_intercept = orderedPoints[0].Root//this.solutions[0];
      console.log("x-int");
      console.log(x_intercept);
      curveList.push(this.linearCurve(x_intercept));

    } else if (this.rootCount > 0 && this.critCount > 0) {
      //will have an orderedPoints list to use
      //console.log("extra");
      let index = 0;
      //look at three points at a time
      while (index < orderedPoints.length - 2) {
        let [p1, p2, p3] = orderedPoints.slice(index, index+3);
        //console.log("triple points");
        //console.log(p1);
        //console.log(p2);
        //console.log(p3);
        if (p1.Root != undefined && p2.Crit != undefined && p3.Root != undefined) {
          curveList.push(this.quadraticCurve(p1,p2,p3))
        }
        index += 2
      }
    }
    return curveList
  }
  linearCurve(point) {
    let x_plus_1 = x_intercept + 1;
    let f_x_plus_1 = this.evaluate(x_plus_1);

    const functionPart = {
      type: 'Linear',
      xIntercept: x_intercept,
      xPlus1: x_plus_1,
      fXplus1: f_x_plus_1
    }
    return functionPart
  }
  quadraticCurve(root1, crit, root2) {
    //actually drawn w cubic bezier but w/ever
    const functionPart = {
      type: 'Cubic',
      leftX: root1.Root,
      leftY: 0,
      middleX: crit.Crit[0],
      middleY: crit.Crit[1],
      rightX: root2.Root,
      rightY: 0
    }
    return functionPart
  }
}

export {Calculate}
