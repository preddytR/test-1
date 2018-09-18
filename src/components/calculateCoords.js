
class Calculate {
  constructor(convert, solutions, keypoints, func, ctx) {
    this.convert = convert;
    this.solutions = solutions;
    this.decimalPoints = 2;

    this.func = func;
    this.ctx = ctx;
    this.scale = this.convert.scale;
    this.xPercentOffset = this.convert.xPercentOffset;

    this.keypoints = keypoints;

    //this.bezierList = this.convertToBeziers(keypoints);
  }
  get Curves() {
    if (this.keypoints.length > 0) {
      return this.convertToBeziers(this.keypoints);
    } else {
      return null
    }
  }
  get RootLabels() {
    let labels = [];
    for (let sol of this.solutions) {
      let rounded = this.round(sol);
      let point = this.convert.cartesianCoordsToCanvas({x:sol,y: 0});
      const label = {
        rounded,
        x: point.x,
        y: point.y
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

    //Calculating the numbers to use for the axis
    const outerWidth = this.ctx.canvas.width * (1 - this.scale) / 2;
    const outerHeight = this.ctx.canvas.height * (1 - this.scale) / 2;

    const xMin = this.round(this.convert.percentToXCoord(0));
    const xMax = this.round(this.convert.percentToXCoord(100));
    const yMin = this.round(this.convert.percentToYCoord(0));
    const yMax = this.round(this.convert.percentToYCoord(100));

    const xLeftLabel = {x: outerWidth, y: y0Pix, rounded: xMin};
    const xRightLabel = {x: this.ctx.canvas.width - outerWidth, y: y0Pix, rounded: xMax};
    const yTopLabel = {x: x0Pix, y: outerHeight, rounded: yMax};
    const yBotLabel = {x: x0Pix, y: this.ctx.canvas.height - outerHeight, rounded: yMin};
    const labels = [
      xLeftLabel,
      xRightLabel,
      yTopLabel,
      yBotLabel,
    ];
    console.log("labels");
    console.log(labels);
    const calculated = {
      xStart: xStartCoord,
      xEnd: xEndCoord,
      yStart: yStartCoord,
      yEnd: yEndCoord,
      labels,
    }
    return calculated
  }
  get Border() {
    //Should draw a border that contains the entire graph, from first to last root
    const leftBorderTop = this.convert.percentCoordToPix({x:0,y:0}); //Graph should remain centered
    const width = this.ctx.canvas.width * this.scale;
    const height = this.ctx.canvas.height * this.scale;

    const calculated = {
      x: leftBorderTop.x,
      y: leftBorderTop.y,
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
  convertToBeziers(keypoints) {
    //converts an ordered list of points to a list of peicewise bezier curves or lines fitting those points
    let curveList = []; //list of curve objects
    for (let keypoint of keypoints) {
      let type;
      if (keypoint.points.left.y < keypoint.points.crit.y && keypoint.points.crit.y < keypoint.points.right.y ||
         keypoint.points.left.y > keypoint.points.crit.y && keypoint.points.crit.y > keypoint.points.right.y) {
        type = 'Inflection'
      } else {
        type = 'Cubic'
      }
      const functionPart = {
        type,
        left : this.convert.cartesianCoordsToCanvas(keypoint.points.left),
        CP1 : this.convert.cartesianCoordsToCanvas(keypoint.controlPoints.CP1),
        CP2: this.convert.cartesianCoordsToCanvas(keypoint.controlPoints.CP2),
        right: this.convert.cartesianCoordsToCanvas(keypoint.points.right),
        root1: null,
        root2: null,
        labels: {
          left: keypoint.points.left,
          middle: keypoint.points.crit,
          right: keypoint.points.right
        }
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
  round(number) {
    return Math.round(number * (10 ** this.decimalPoints) / (10 ** this.decimalPoints))
  }
}

export {Calculate}
