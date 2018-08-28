//Canvas methods to draw different functions
//Relies on data in FunctionGraph.vue

import {Calculate} from './calculateCoords'

class Draw {
  constructor(calculate, ctx, scale) {
    this.calculated = calculate;
    this.ctx = ctx;
    this.scale = scale;
  }
  Graph() {
    const newGraph = this.calculated.Graph;

    if (newGraph != null){
      const start = newGraph.pixCoords[0];
      const crit = newGraph.pixCoords[1];
      const end = newGraph.pixCoords[2];
      const above = (crit[1] > 0) ? 1: -1;
      console.log("graph");
      console.log(newGraph);

      const cpY = crit[1] + (this.ctx.canvas.height / 6 - 2) * above * this.scale;
      const cp1 = [(crit[0] + start[0]) / 2 , cpY] //2 for lineWidth
      const cp2 = [(end[0] + crit[0]) / 2 , cpY]
      /*console.log(this.ctx.canvas.height);
      console.log("Start, crit, end");
      console.log(start,crit,end);
      console.log("cp1, cp2");
      console.log(cp1,cp2);*/

      const root1 = newGraph.roundedRoots[0];
      const root2 = newGraph.roundedRoots[1];
      /*console.log("Roots");
      console.log(root1,root2);*/
      this.ctx.beginPath();
      this.ctx.moveTo(...start);

      // Clear the old area from the previous render. x,y,w,h
      this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

      // Draw the new graph.
      this.ctx.strokeStyle="#FF0000";
      this.ctx.lineWidth = 2;
      this.ctx.bezierCurveTo(...cp1,...cp2,...end);
      this.ctx.stroke();

      //Drawing labels
      this.ctx.font = "20px Verdana";
      this.ctx.textBaseline = "top";
      this.ctx.fillText(root1,...start);
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
    console.log("axis");
    console.log(newAxis);
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
