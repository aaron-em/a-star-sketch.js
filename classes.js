var util = require('util');

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



function PointCostList() {
  var self = this;
  
  this.queues = {};
  [].slice.call(arguments)
    .forEach(function(arg, i) {
      var point = arg[0];
      var pri = arg[1];
      self.push(point, pri);
    });
};

PointCostList.prototype.length = function() {
  return Object.keys(this.queues)
    .map((pri) => this.queues[pri].length)
    .reduce((m, n) => m + n);
};

PointCostList.prototype.shift = function() {
  var pri = Object.keys(this.queues)
        .filter((p) => this.queues[p].length > 0)
        .sort()[0];

  return pri
    ? this.queues[pri].shift()
    : undefined;
};

PointCostList.prototype.push = function(point, pri) {
  if (! (point instanceof Point)) {
    throw new Error('May not PointCostList#push ' + point);
  };

  this.queues[pri] = this.queues[pri] || [];
  this.queues[pri].push(point);
};




module.exports = {
  Point: Point,
  PointList: PointList,
  PointCostList: PointCostList
};
