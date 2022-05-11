export default class KonvaRectRegionCalculator {
  start(pos) {
    this._x1 = pos.x;
    this._y1 = pos.y;
    this._x2 = pos.x;
    this._y2 = pos.y;
  }
  getRect(pos) {
    this._x2 = pos.x;
    this._y2 = pos.y;
    return {
      x: Math.min(this._x1, this._x2),
      y: Math.min(this._y1, this._y2),
      width: Math.abs(this._x2 - this._x1),
      height: Math.abs(this._y2 - this._y1),  
    }
  }
}