//Canvas methods to draw different functions
//Relies on data in FunctionGraph.vue

import {Calculate} from './calculateCoords'

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
      for (const curve of curvesList) {
        if (curve.type == 'Cubic') {
          this.Cubic(curve);
        } else {
          console.log("curve type error");
        }
      }
    }
  }
  Cubic(curve) {
    const start = curve.left;
    const crit = curve.middle;
    const end = curve.right;
    const above1 = (crit[1] > start[1]) ? 1: -1;//May need to change how y0 on canvas defined
    const above2 = (crit[1] > end[1]) ? 1: -1;
    //console.log("curve");
    //console.log(curve);

    const adjust = (this.scale * this.ctx.canvas.height / 6 - this.lineWidth);
    const cpY = crit[1] + adjust;
    const cp1 = [(crit[0] + start[0]) / 2 , crit[1] + adjust * above1];
    const cp2 = [(end[0] + crit[0]) / 2 , crit[1] + adjust * above2];
    //console.log(this.ctx.canvas.height);
    //console.log("Start, crit, end");
    //console.log(start,crit,end);
    //console.log("cp1, cp2");
    //console.log(cp1,cp2);
    //console.log("adjust",adjust);


    //console.log("Roots");
    //console.log(root1,root2);
    this.ctx.beginPath();
    this.ctx.moveTo(...start);

    // Draw the new graph.
    this.ctx.strokeStyle="#FF0000";
    this.ctx.lineWidth = this.lineWidth;
    this.ctx.bezierCurveTo(...cp1,...cp2,...end);
    this.ctx.stroke();

    //Drawing labels
    const root1 = curve.root1;
    const root2 = curve.root2;
    this.ctx.font = "20px Verdana";
    this.ctx.textBaseline = "top";
    if (root1 != null) {
      this.ctx.fillText(root1,...start);
    }
    if (root2 != null) {
      this.ctx.fillText(root2,...end);
    }


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
    this.ctx.lineWidth = 1;
    //console.log("axis");
    //console.log(newAxis);
    //x-axis
    this.ctx.moveTo(...newAxis.xStart);
    this.ctx.lineTo(...newAxis.xEnd);
    //y-axis
    this.ctx.moveTo(...newAxis.yStart);
    this.ctx.lineTo(...newAxis.yEnd);
    this.ctx.strokeStyle="black";
    this.ctx.stroke();
  }
}

export {Draw}
