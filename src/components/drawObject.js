//Canvas methods to draw different functions
//Relies on data in FunctionGraph.vue

class Draw {
  constructor(calculate, ctx, scale, type) {
    this.calculated = calculate;
    this.type = type;
    this.ctx = ctx;
    this.scale = scale;
    this.lineWidth = 5;
    this.priColour1 = "red";
    this.priColour2 = "black";
    this.priColour3 = "green";
    this.priColour4 = "blue";
  }
  Graph() {
    const curvesList = this.calculated.Curves;
    //console.log("newCurves");
    //console.log(curvesList);
    if (curvesList != null) {
      if (this.type == "Non-Linear") {
        let index = 0;
        for (const curve of curvesList) {
          this.Cubic(curve);
          this.triplePoints(curve.labels, index == curvesList.length - 1);
          index += 1;
        }
      } else {
        const curve = curvesList[0];
        this.Linear(curve);
        this.triplePoints(curve.labels, true);
      }
    }
  }
  Linear(curve){
    const start = curve.left;
    const end = curve.right;
    this.ctx.beginPath();
    this.ctx.strokeStyle = this.priColour1;//(this.alternate) ? this.priColour1 : this.priColour2;
    this.ctx.lineWidth = this.lineWidth;
    this.ctx.moveTo(start.x, start.y);
    this.ctx.lineTo(end.x, end.y);
    this.ctx.stroke();
  }
  Cubic(curve) {
    const start = curve.left;
    const end = curve.right;
    //console.log("Cubic curve");
    //console.log(curve);
    let cp1 = curve.CP1;
    let cp2 = curve.CP2;

    this.ctx.beginPath();
    this.ctx.moveTo(start.x,start.y);
    // Draw the new graph.
    this.ctx.strokeStyle = this.priColour1;//(this.alternate) ? this.priColour1 : this.priColour2;
    this.ctx.lineWidth = this.lineWidth;
    this.ctx.bezierCurveTo(cp1.x,cp1.y,cp2.x,cp2.y,end.x,end.y);
    this.ctx.stroke();
  }
  triplePoints(labels, includeRight) {
    let labelList = [labels.left, labels.middle];
    let coordList = []
    const decimalPoints = 2;
    if (includeRight) {
      labelList.push(labels.right)
    }
    for (let label of labelList) {
      let point = this.calculated.convert.cartesianCoordsToCanvas(label);
      let round_x = Math.round(label.x * (10 ** decimalPoints) / (10 ** decimalPoints));
      let round_y = Math.round(label.y * (10 ** decimalPoints) / (10 ** decimalPoints));
      const labelCoords = {
        x : point.x,
        y : point.y,
        rounded: round_x + ',' + round_y
      };
      coordList.push(labelCoords)

    }
    this.Labels(true, coordList)
  }
  Border() {
    //Drawing Outline
    const newBorder = this.calculated.Border;
    this.ctx.rect(newBorder.x, newBorder.y, newBorder.w, newBorder.h);
    this.ctx.strokeStyle = "blue";
    this.ctx.stroke();
  }
  Axis() {
    const newAxis = this.calculated.Axis;
    this.ctx.beginPath();
    this.ctx.strokeStyle="black";
    this.ctx.lineWidth = 1;
    //console.log("axis");
    //console.log(newAxis);
    //x-axis
    let xStart = newAxis.xStart;
    let xEnd = newAxis.xEnd;
    this.ctx.moveTo(xStart.x, xEnd.y);
    this.ctx.lineTo(xEnd.x, xEnd.y);
    //y-axis
    let yStart = newAxis.yStart;
    let yEnd = newAxis.yEnd;
    this.ctx.moveTo(yStart.x, yStart.y);
    this.ctx.lineTo(yEnd.x, yEnd.y);
    this.ctx.stroke();

    //Adding axis limit numbers
    this.Labels(false, newAxis.labels);
  }
  Labels(addCross, rootLabels) {
    this.ctx.font = "20px Verdana";
    this.ctx.textBaseline = "top";
    if (rootLabels == undefined) {
      rootLabels = this.calculated.RootLabels;
    }
    //const rootLabels = this.calculated.RootLabels;
    for (let label of rootLabels) {
      if (addCross) {
        this.ctx.beginPath();
        this.ctx.strokeStyle="black";
        let offset = 10;
        this.ctx.moveTo(label.x - offset, label.y - offset);
        this.ctx.lineTo(label.x + offset, label.y + offset);
        this.ctx.moveTo(label.x - offset, label.y + offset);
        this.ctx.lineTo(label.x + offset, label.y - offset);
        this.ctx.stroke();
      }
      this.ctx.fillText(label.rounded,label.x,label.y);
    }
    this.ctx.stroke();
  }
}

export {Draw}
