
class Calculate {
  constructor(convert, solutions, tripled, func, ctx) {
    this.convert = convert;
    this.solutions = solutions;
    /*if (solutions != undefined) {
      this.rootCount = this.solutions.length
    } else {
      this.rootCount = -1
    }
    if (mergedPoints != undefined) {
      this.critCount = mergedPoints.length - this.solutions.length;
    } else {
      this.critCount = -1
    }*/

    this.func = func;
    this.ctx = ctx;
    this.scale = this.convert.scale;
    this.xPercentOffset = this.convert.xPercentOffset;

    this.bezierList = this.convertToBeziers(tripled);
  }
  get Curves() {
    if (this.bezierList.length > 0) {
      let convertedCurveList = [];
      for (let curve of this.bezierList) {
        let convertedCurve = {};
        if (curve.type == 'linear') {
          console.log('linear X');
        } else if (curve.type == 'Cubic' || curve.type == 'Inflection') {
          convertedCurve.type = curve.type;
          convertedCurve.left = this.convert.cartesianCoordsToCanvas(curve.leftX,curve.leftY);
          convertedCurve.middle = this.convert.cartesianCoordsToCanvas(curve.middleX, curve.middleY);
          convertedCurve.right = this.convert.cartesianCoordsToCanvas(curve.rightX, curve.rightY);
          convertedCurve.root1 = curve.root1;
          convertedCurve.root2 = curve.root2;
          convertedCurve.labels = {
            left: [curve.leftX, curve.leftY],
            middle: [curve.middleX, curve.middleY],
            right: [curve.rightX, curve.rightY],
          }

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
  get RootLabels() {
    let labels = [];
    const decimalPoints = 2;
    for (let sol of this.solutions) {
      let rounded = Math.round(sol*(10**decimalPoints)) / (10**decimalPoints);
      let [x, y] = this.convert.cartesianCoordsToCanvas(sol/*+(sol/14)*/, 0);
      const label = {
        rounded,
        x,
        y
      };
      labels.push(label)
    }
    return labels
  }
  get Axis() {
    //Gets coords for the x and y axis lines
    //These will extend to the edges of the canvas and so must ignore any scaling factors (the zoom factor)
    //const edgeValues = this.getedgeValues;

    const y0 = this.convert.yCoordToPercent(0); //Line where y=0
    const y0Pix = this.convert.percentHeightToPix(y0, this.ctx);

    const x0 = -this.xPercentOffset + (this.xPercentOffset + 50) * (1 - this.scale);//line where x=0
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
  evaluate(x_value) {
    let factors = this.func.factors;
    let total = 0;
    for (let factor of factors) {
      total += factor.coeff * (x_value ** factor.power)
    }
    return total
  }
  convertToBeziers(tripled) {
    //converts an ordered list of points to a list of peicewise bezier curves or lines fitting those points
    let curveList = []; //list of curve objects
    /*if (this.rootCount == 0 && this.critCount ==  0){
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
      console.log("points");
      console.log(orderedPoints);
      //let consumedPoints = false;
      while (index < orderedPoints.length - 2) {
        let [p1, p2, p3] = orderedPoints.slice(index, index+3);
        //console.log("triple points");
        //console.log(p1);
        //console.log(p2);
        //console.log(p3);
        if (p1.Root != undefined && p2.Crit != undefined && p3.Root != undefined) {
          curveList.push(this.quadraticCurve(p1,p2,p3))
          index += 2
        } else if (p1.Root != undefined && p2.Crit!= undefined && (p2.Crit.nature == 'max' || p2.Crit.nature == 'min') &&p3.Crit != undefined) {
          curveList.push(this.leftRoot(p1,p2,p3))
          index += 2
        } else {
          index += 2
        }

      }
      index += 1 //To show done drawing last point from the group of three
      let amountRemaining = orderedPoints.length - index + 1;//need to re-add last drawn point
      if (amountRemaining > 0) {
        console.log("leftovers");
        console.log(index,orderedPoints.length, amountRemaining);
        if (amountRemaining == 1) {
          console.log('one remaining');
          let firstPoint = orderedPoints[index-2];
          let secondPoint = orderedPoints[index-1];
          console.log(firstPoint,secondPoint);
        } else if (amountRemaining == 2) {
          let crit, root;
          let firstPoint = orderedPoints[index-1];
          let secondPoint = orderedPoints[index];
          //curveList.push(this.inflectionCurve())
          if (firstPoint.Crit != undefined && secondPoint.Root != undefined) {
            crit  = firstPoint;
            root = secondPoint;
          } else if (firstPoint.Root != undefined && secondPoint.Crit != undefined) {
            crit = secondPoint;
            root = firstPoint
          } else{
            throw "Expecting a root to match crit"
          }
          if (index - 1 == 0) { //stupid way to check these are the only two points on the curve
            curveList.push(this.inflectionCurve(crit, root))
          } else {
            throw "Need to work with edge cubic cases"
          }
        }
      }
    }*/
    for (let triple of tripled) {
      let type;
      if (triple.left_y < triple.y && triple.y < triple.right_y || triple.left_y > triple.y && triple.y > triple.right_y) {
        type = 'Inflection'
      } else {
        type = 'Cubic'
      }
      const functionPart = {
        type,
        leftX: triple.left_x,
        rightX: triple.right_x,
        leftY: triple.left_y,
        rightY: triple.right_y,
        middleX: triple.x,
        middleY: triple.y,
        root1: null,
        root2: null,
      }
      curveList.push(functionPart)
    }
    return curveList
  }
  linearCurve(x_intercept) {
    let x_plus_1 = x_intercept + 1;
    let f_x_plus_1 = this.evaluate(x_plus_1);

    const functionPart = {
      type: 'Linear',
      xIntercept: x_intercept,
      xPlus1: x_plus_1,
      fXplus1: f_x_plus_1,
    }
    return functionPart
  }
  leftRoot(root, crit1, crit2) {
    const functionPart = {
      type: 'Cubic',
      leftX: root.Root,
      leftY: 0,
      middleX: crit1.Crit.x_val,
      middleY: crit1.Crit.y_val,
      rightX: crit2.Crit.x_val,
      rightY: crit2.Crit.y_val,
      root1: Math.round(root.Root * 100) / 100,
      root2: null,
    }
    console.log("leftRoot");
    console.log(functionPart);
    return functionPart
  }
  inflectionCurve(crit, root) {
    //Have to create third point that lies opposite the root relative to the inflection point
    console.log("inflection");
    let leftX, rightX, leftY, rightY;
    const leftSide = root.Root < crit.Crit.x_val; //Root is on left side of crit
    //console.log("left",leftSide);

    if (leftSide) {
      leftX = root.Root;
      leftY = 0;
      rightX = 2 * crit.Crit.x_val - root.Root;
      rightY = 2 * crit.Crit.y_val
    } else {
      leftX = 2 * crit.Crit.x_val - root.Root;
      leftY = 2 * crit.Crit.y_val
      rightX = root.Root;
      rightY = 0

    }
    const functionPart = {
      type: 'Inflection',
      leftX,
      leftY,
      middleX: crit.Crit.x_val,
      middleY: crit.Crit.y_val,
      rightX,
      rightY,
      root1: (leftSide) ? root.Root : null,
      root2: (leftSide) ? null : root.Root,
    }
    //console.log("cartesian");
    //console.log(functionPart);
    return functionPart
  }
  quadraticCurve(root1, crit, root2) {
    //actually drawn w cubic bezier but w/ever
    const functionPart = {
      type: 'Cubic',
      leftX: root1.Root,
      leftY: 0,
      middleX: crit.Crit.x_val,
      middleY: crit.Crit.y_val,
      rightX: root2.Root,
      rightY: 0,
      root1: Math.round(root1.Root * 100) / 100,
      root2: Math.round(root2.Root * 100) / 100,
    }
    return functionPart
  }
}

export {Calculate}
