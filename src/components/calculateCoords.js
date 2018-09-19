
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
  }
  get Curves() {
    //converts an ordered list of points to a list of peicewise bezier curves or lines fitting those points
    if (this.keypoints.length > 0) {
      let curveList = []; //list of curve objects
      for (let keypoint of this.keypoints) {
        const functionPart = {
          left : this.convert.cartesianCoordsToCanvas(keypoint.points.left),
          CP1 : this.convert.cartesianCoordsToCanvas(keypoint.controlPoints.CP1),
          CP2: this.convert.cartesianCoordsToCanvas(keypoint.controlPoints.CP2),
          right: this.convert.cartesianCoordsToCanvas(keypoint.points.right),
          labels: {
            left: keypoint.points.left,
            middle: keypoint.points.crit,
            right: keypoint.points.right
          }
        }
        curveList.push(functionPart)
      }
      return curveList
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
    const x0Pix = this.convert.percentWidthToPix(x0, this.ctx);

     //We skip scaling the coords down as we want them to extend to each side of the view window
    let xStartCoord = {x:0, y:y0Pix};
    let xEndCoord = {x:this.ctx.canvas.width, y:y0Pix};
    let yStartCoord = {x:x0Pix, y:0};
    let yEndCoord = {x:x0Pix, y:this.ctx.canvas.height};

    //Calculating the numbers to use for the axis scale guide
    const outerWidth = this.ctx.canvas.width * (1 - this.scale) / 2;
    const outerHeight = this.ctx.canvas.height * (1 - this.scale) / 2;

    const xMin = this.round(this.convert.percentToXCoord(0));
    const xMax = this.round(this.convert.percentToXCoord(100));
    const yMin = -this.round(this.convert.percentToYCoord(0));//-ve as y-axis reversed
    const yMax = -this.round(this.convert.percentToYCoord(100));

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
    //console.log("labels");
    //console.log(labels);
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
  linearCurve(x_intercept) {
    //Not called anywhere yet but provides the basic object needed to plot out a straight line
    let x_plus_1 = x_intercept + 1;
    let f_x_plus_1 = this.func.eval_f_x(x_plus_1);

    const functionPart = {
      type: 'Linear',
      xIntercept: x_intercept,
      xPlus1: x_plus_1,
      fXplus1: f_x_plus_1,
    }
    return functionPart
  }
  round(number) {
    return Math.round(number * (10 ** this.decimalPoints) / (10 ** this.decimalPoints))
  }
}

export {Calculate}
