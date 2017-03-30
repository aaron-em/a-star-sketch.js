/* jshint esversion: 6 */

var types = require('./classes.js');
var Point = types.Point;
var PointList = types.PointList;

var process = require('process');

var _ = require('lodash');

var ι = Infinity;
var ν = 0;

var emptyMap = [
  [ν, ν, ν, ν, ν],
  [ν, ν, ν, ν, ν],
  [ν, ν, ν, ν, ν],
  [ν, ν, ν, ν, ν],
  [ν, ν, ν, ν, ν]
];

var testMap = [
  [ν, ν, ν, ν, ν],
  [ν, ι, ν, ι, ν],
  [ν, ν, ι, ι, ν],
  [ν, ν, ν, ν, ν],
  [ν, ν, ν, ν, ν]
];

var start = new Point(0, 0);
var end = new Point(4, 4);

var path = AStar(testMap, start, end);
if (path === null) {
  console.log(drawMap(testMap, [start, end]));
} else {
  console.log(drawMap(testMap, path));
};

process.exit(0);

// ** AStar and related functions

function AStar(map, start, end) {
  var frontier = new PointList(start);
  var examined = new PointList();
  var prior = {};
  var cost = {};
  var here;

  while (frontier.length() > 0) {
    here = frontier.shift();
    if (here.equals(end))
      return gatherPath(prior, start, end);

    findNeighbors(map, here)
      .forEach(function(neighbor) {
        if (examined.contains(neighbor)) return;
        frontier.push(neighbor);
        examined.push(neighbor);
        prior[neighbor] = here;
      });
  };

  return null;
};

function findNeighbors(map, point) {
  var xExtent = map[0].length;
  var yExtent = map.length;
  
  return [
    [point.x-1, point.y-1], [point.x, point.y-1], [point.x+1, point.y-1],
    [point.x-1, point.y],   /*      point      */ [point.x+1, point.y],
    [point.x-1, point.y+1], [point.x, point.y+1], [point.x+1, point.y+1]
  ]
    .filter((c) =>
            (c[0] >= 0 && c[0] < xExtent) &&
            (c[1] >= 0 && c[1] < yExtent))
    .map((n) => new Point(n[0], n[1]));
};

function gatherPath(prior, start, end) {
  var here = end;
  var next = null;
  var path = [here];

  while (! here.equals(start)) {
    next = prior[here];
    path.push(next);
    here = next;
  };

  return path.reverse();
};

// ** Utilities

function drawMap(map, pathPoints) {
  var drawn = _.cloneDeep(map);
  var pathChars = (pathPoints || []).map(function(step, i) {
    var char;
    if (i === 0) char = 'o';
    if (i === pathPoints.length - 1) char = 'x';
    if (!char) char = pathArrow(step, pathPoints[i-1]);
    return [step, char];
  });

  pathChars.forEach(function(item) {
    var point = item[0];
    var char = item[1];
    drawn[point.y][point.x] = char;
  });

  drawn.forEach(function(row) {
    row.forEach(function(cell, i) {
      if (cell === Infinity) cell = '#';
      if (cell === 0) cell = '·';
      row[i] = cell;
    });
  });

  return drawn
    .map((row) =>
         [].join.call(row, ''))
    .join('\n');
};

function pathArrow(from, to) {
  var arrows = {
    '-1': {
      '-1': '↖',
      '0': '←',
      '1': '↙'
    },
    '0': {
      '-1': '↑',
      '1': '↓'
    },
    '1': {
      '-1': '↗',
      '0': '→',
      '1': '↘'
    }
  };

  var Δx = from.x - to.x;
  var Δy = from.y - to.y;

  return arrows[Δy][Δx];
};
