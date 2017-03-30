function Point(x, y) {
  this.x = x;
  this.y = y;
};

Point.prototype.toString = function() {
  return '[' + this.x + ',' + this.y + ']';
};

Point.prototype.equals = function(that) {
  if (! (that instanceof Point)) {
    throw new Error('Point not comparable with ' + that);
  };
  
  return (this.x === that.x)
    && (this.y === that.y);
};

// FIXME this can just be an array with indexOf, as long as
// Point.toString works
function PointList() {
  this.queue = [].slice.call(arguments);
};

PointList.prototype.length = function() {
  return this.queue.length;
};

PointList.prototype.shift = function() {
  return this.queue.shift();
};

PointList.prototype.push = function(that) {
  if (! (that instanceof Point)) {
    throw new Error('May not PointList#push ' + that);
  };
  
  return this.queue.push(that);
};

PointList.prototype.contains = function(what) {
  return this.queue
    .some((point) => point.equals(what));
};

module.exports = {
  Point: Point,
  PointList: PointList
};
