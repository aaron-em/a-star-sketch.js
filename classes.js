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

Point.prototype.distanceFrom = function(that) {
  return Math.sqrt(Math.pow(that.x - this.x, 2) +
                   Math.pow(that.y - this.y, 2));
};



function PointList() {
  this.queue = [];
  this.queueHash = {};
};

PointList.prototype.length = function() {
  return this.queue.length;
};

PointList.prototype.shift = function() {
  var point = this.queue.shift();
  this.queueHash[point] -= 1;
  return point;
};

PointList.prototype.push = function(that) {
  if (! (that instanceof Point)) {
    throw new Error('May not PointList#push ' + that);
  };

  this.queueHash[that] = this.queueHash[that] ? this.queueHash[that] + 1 : 1;
  return this.queue.push(that);
};

PointList.prototype.contains = function(what) {
  return !!this.queueHash[what];
};



function PointCostList() {
  this.queues = {};
  this.length = 0;
  this.priority = Infinity;
  this.priorities = [0];
  // TODO usable speed
};

PointCostList.prototype.shift = function() {
  if (this.queues[this.priority].length === 0) {
    this.priority = Object.keys(this.queues)
      .filter((p) => (this.queues[p].length > 0))
      .sort()[0];
  };

  var point = this.queues[this.priority].shift();
  this.length -= 1;

  return point;
};

PointCostList.prototype.push = function(point, pri) {
  if (! (point instanceof Point)) {
    throw new Error('May not PointCostList#push ' + point);
  };

  this.queues[pri] = this.queues[pri] || [];
  this.queues[pri].push(point);
  this.length += 1;

  if (pri < this.priority) {
    this.priority = pri;
  };
};




module.exports = {
  Point: Point,
  PointList: PointList,
  PointCostList: PointCostList
};
