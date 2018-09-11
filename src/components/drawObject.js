//Canvas methods to draw different functions
//Relies on data in FunctionGraph.vue

class Draw {
  constructor(calculate, ctx, scale) {
    this.calculated = calculate;
    this.ctx = ctx;
    this.scale = scale;
    this.lineWidth = 5;
  }
  Graph() {
    const curvesList = this.calculated.Curves;
    //console.log("newCurves");
    //console.log(newCurves);
    if (curvesList != null) {
      let index = 0;
      for (const curve of curvesList) {
        if (curve.type == 'Cubic') {
          this.Cubic(curve);
        } else if (curve.type == 'Inflection') {
          this.Inflection(curve);
        } else {
          console.log("curve type error");
        }
        this.triplePoints(curve.labels, index == curvesList.length - 1);
        index += 1
      }
    }
  }
  Cubic(curve) {
    const start = curve.left;
    const crit = curve.middle;
    const end = curve.right;
    const above1 = (crit[1] > start[1]) ? 1 : -1;//May need to change how y0 on canvas defined
    const above2 = (crit[1] > end[1]) ? 1 : -1;
    console.log("Cubic curve");
    console.log(curve);

    const adjust = (this.scale * this.ctx.canvas.height / 6 - this.lineWidth);
    const cp1 = [(crit[0] + start[0]) / 2, crit[1] + ((this.ctx.canvas.height / 2 - start[1]) / .85 + adjust) * above1]; // or * (20 / 17)
    const cp2 = [(end[0] + crit[0]) / 2, crit[1] + ((this.ctx.canvas.height / 2 - end[1]) / .85  + adjust) * above2];
    this.bezierCurve(start,cp1,cp2,end,curve.root1,curve.root2);
  }
  Inflection(curve) {
    const start = curve.left;
    const crit = curve.middle;
    const end = curve.right;
    const above1 = (crit[1] > start[1]) ? 1: -1;//May need to change how y0 on canvas defined
    const above2 = (crit[1] > end[1]) ? 1: -1;
    console.log("Inflection curve");
    console.log(curve);

    const adjust = (this.scale * this.ctx.canvas.height / 6 - this.lineWidth);
    const cp1 = [(crit[0] + start[0]) / 2, end[1]]; // or * (20 / 17)
    const cp2 = [(end[0] + crit[0]) / 2, start[1]];
    this.bezierCurve(start,cp1,cp2,end,curve.root1,curve.root2);
  }
  bezierCurve(start,cp1,cp2,end,root1,root2) {
    this.ctx.beginPath();
    this.ctx.moveTo(...start);

    // Draw the new graph.
    this.ctx.strokeStyle="red";
    this.ctx.lineWidth = this.lineWidth;
    this.ctx.bezierCurveTo(...cp1,...cp2,...end);
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
      let [x,y] = this.calculated.convert.cartesianCoordsToCanvas(...label);
      let round_x = Math.round(label[0] * (10 ** decimalPoints) / (10 ** decimalPoints));
      let round_y = Math.round(label[1] * (10 ** decimalPoints) / (10 ** decimalPoints));
      const labelCoords = {
        x,
        y,
        rounded: round_x + ',' + round_y
      };
      coordList.push(labelCoords)

    }
    this.Labels(true, coordList)
  }
  Border() {
    //Drawing Outline
    const newBorder = this.calculated.Border;

    /*console.log("border");
    console.log(newBorder);*/
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
    this.ctx.moveTo(...newAxis.xStart);
    this.ctx.lineTo(...newAxis.xEnd);
    //y-axis
    this.ctx.moveTo(...newAxis.yStart);
    this.ctx.lineTo(...newAxis.yEnd);

    this.ctx.stroke();
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
