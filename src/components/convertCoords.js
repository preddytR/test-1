// Helper functions to convert a percentage of canvas area to pixels.
//const percentWidthToPix = (percent, ctx) => Math.floor((ctx.canvas.width / 100) * percent)
//const percentHeightToPix = (percent, ctx) => Math.floor((ctx.canvas.height / 100) * percent)

//const percentCoordToPix = (percentX, percentY, ctx) => [percentWidthToPix(percentX,ctx), percentHeightToPix(percentY, ctx)]
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
  coordsToPercent([x,y]) {
    //converts cartesian coordinates to an array of percentages
    //Range of output: [x:0-100,y:0-100]
    //As cartesian coords != canvas coords due to flipped y-axis, need to invert y-values
    return [this.xCoordToPercent(x), this.yCoordToPercent(y)]
  }
  percentWidthToPix(percent) {
    return Math.floor((this.ctx.canvas.width / 100) * percent)
  }
  percentHeightToPix(percent) {
    return Math.floor((this.ctx.canvas.height / 100) * percent)
  }
  percentCoordToPix(percentX, percentY) {
    let offset = 50 * (1 - this.scale);//Alternatively: coord = scale*(percent-50)+50
    return [this.percentWidthToPix(percentX * this.scale + offset), this.percentHeightToPix(percentY * this.scale + offset)]
  }
  cartesianCoordsToCanvas(x, y) {
    return this.percentCoordToPix(...this.coordsToPercent([x,y]))
  }
}

export {Convert}
