// Helper functions to convert a percentage of canvas area to pixels.

class Convert {
  constructor(width, height, ctx, xPercentOffset, scale) {
    this.width = width;
    this.height = height;
    this.ctx = ctx;
    this.xPercentOffset = xPercentOffset;
    this.scale = scale;
  }
  xCoordToPercent(x) {
    return (x / this.width) * 100 - this.xPercentOffset
  }
  yCoordToPercent(y) {
    return 50 * (1 -  y / this.height)
  }
  percentToXCoord(xPer) {
    //inverse function for xCoordToPercent
    return (xPer + this.xPercentOffset) * this.width / 100;
  }
  percentToYCoord(yPer) {
    //inverse function for yCoordToPercent
    return (1 - yPer / 50) * this.height
  }
  coordsToPercent(point) {
    //converts cartesian coordinates to an array of percentages
    //Range of output: [x:0-100,y:0-100]
    //As cartesian coords != canvas coords due to flipped y-axis, need to invert y-values
    return {
      x: this.xCoordToPercent(point.x),
      y: this.yCoordToPercent(point.y)
    }
  }
  percentWidthToPix(percent) {
    return Math.floor((this.ctx.canvas.width / 100) * percent)
  }
  percentHeightToPix(percent) {
    return Math.floor((this.ctx.canvas.height / 100) * percent)
  }
  percentCoordToPix(point) {
    let offset = 50 * (1 - this.scale);//Alternatively: coord = scale*(percent-50)+50
    return {
      x: this.percentWidthToPix(point.x * this.scale + offset),
      y: this.percentHeightToPix(point.y * this.scale + offset)
    }
  }
  cartesianCoordsToCanvas(point) {
    return this.percentCoordToPix(this.coordsToPercent(point))
  }
}

export {Convert}
