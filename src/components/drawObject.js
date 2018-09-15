//Canvas methods to draw different functions
//Relies on data in FunctionGraph.vue

class Draw {
  constructor(calculate, ctx, scale) {
    this.calculated = calculate;
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
    //console.log(newCurves);
    this.alternate = true;
    if (curvesList != null) {
      for (let i of [1,2,3,4]) {
        let index = 0;
        for (const curve of curvesList) {
          //if (curve.type == 'Cubic') {
            this.Cubic(curve,i);
          //} else if (curve.type == 'Inflection') {
            //this.Inflection(curve,i);
          //} else {
            //console.log("curve type error");
          //}
          //this.triplePoints(curve.labels, index == curvesList.length - 1);
          index += 1;
          this.alternate = !this.alternate
        }
      }
    }
  }
  Cubic(curve, i) {
    const start = curve.left;
    const crit = curve.middle;
    const end = curve.right;
    //const above1 = (crit.y > start.y) ? 1 : -1; //whether the crit point is above or below the LHS point
    //const above2 = (crit.y > end.y) ? 1 : -1;
    console.log("Cubic curve");
    console.log(curve);
    let cp1, cp2;
    if (i == 1) {
      cp1 = curve.CP1;
      cp2 = curve.CP2;
    } else if (i == 2) {
      cp1 = curve.CP1a;
      cp2 = curve.CP2a;
    } else if (i == 3){
      cp1 = curve.CP1b;
      cp2 = curve.CP2b;
    } else {
      cp1 = curve.CP1AVERAGE,
      cp2 = curve.CP2AVERAGE
    }
    /*if (cp1.x > cp2.x) {
      let old_cp1 = cp1;
      cp1 = cp2;
      cp2 = old_cp1;
    }*/
    //const adjust = (this.scale * this.ctx.canvas.height / 6 - this.lineWidth);
    //const cp1 = [(crit[0] + start[0]) / 2, crit[1] + ((this.ctx.canvas.height / 2 - start[1]) / .85 + adjust) * above1]; // or * (20 / 17)
    //const cp2 = [(end[0] + crit[0]) / 2, crit[1] + ((this.ctx.canvas.height / 2 - end[1]) / .85  + adjust) * above2];
    this.bezierCurve(start,cp1,cp2,end,curve.root1,curve.root2, i);
  }
  Inflection(curve) {
    const start = curve.left;
    const crit = curve.middle;
    const end = curve.right;
    //const above1 = (crit[1] > start[1]) ? 1: -1;//May need to change how y0 on canvas defined
    //const above2 = (crit[1] > end[1]) ? 1: -1;
    console.log("Inflection curve");
    console.log(curve);
    let cp1, cp2;
    if (curve.CP1.x < curve.CP2.x) {
      cp1 = curve.CP1;
      cp2 = curve.CP2;
    } else {
      cp1 = curve.CP2;
      cp2 = curve.CP1;
    }
    //const adjust = (this.scale * this.ctx.canvas.height / 6 - this.lineWidth);
    //const cp1 = [(crit[0] + start[0]) / 2, end[1]]; // or * (20 / 17)
    //const cp2 = [(end[0] + crit[0]) / 2, start[1]];
    this.bezierCurve(start,cp1,cp2,end,curve.root1,curve.root2);
  }
  bezierCurve(start,cp1,cp2,end,root1,root2, i) {
    this.ctx.beginPath();
    this.ctx.moveTo(start.x,start.y);

    // Draw the new graph.
    let colour;
    if (i == 1) {
      colour = this.priColour1
    } else if (i == 2) {
      colour = this.priColour2
    } else if (i == 3){
      colour = this.priColour3
    } else {
      colour = this.priColour4
    }
    this.ctx.strokeStyle = colour;//(this.alternate) ? this.priColour1 : this.priColour2;
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
