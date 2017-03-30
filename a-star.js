/* jshint esversion: 6 */

var types = require('./classes.js');
var Point = types.Point;
var PointList = types.PointList;
var PointCostList = types.PointCostList;

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
  [ν, ν, ι, ν, ν],
  [ν, ι, ν, ι, ν],
  [ν, ι, ι, ι, ν],
  [ν, ι, ν, ν, ν],
  [ν, ν, ν, ι, ν]
];

var trapMap = [
  [ν, ν, ι, ν, ν],
  [ν, ν, ι, ν, ν],
  [ι, ι, ι, ν, ν],
  [ν, ν, ν, ν, ν],
  [ν, ν, ν, ν, ν]
];

var bigMap = [
  [ν, ν, ν, ν, ν, ν, ν, ν, ν, ν, ν, ν, ν, ν, ν, ν, ν, ν, ν, ν],
  [ν, ν, ν, ν, ν, ν, ν, ν, ν, ν, ν, ν, ν, ν, ν, ν, ν, ν, ν, ν],
  [ν, ν, ν, ν, ν, ν, ν, ν, ν, ν, ν, ν, ν, ν, ν, ν, ν, ν, ν, ν],
  [ν, ν, ν, ν, ν, ν, ν, ν, ν, ν, ν, ν, ν, ν, ν, ν, ν, ν, ν, ν],
  [ν, ν, ν, ν, ν, ν, ν, ν, ν, ν, ν, ν, ν, ν, ν, ν, ν, ν, ν, ν],
  [ν, ν, ν, ν, ν, ν, ν, ν, ν, ν, ν, ν, ν, ν, ν, ν, ν, ν, ν, ν],
  [ν, ν, ν, ν, ν, ν, ν, ν, ν, ν, ν, ν, ν, ν, ν, ν, ν, ν, ν, ν],
  [ν, ν, ν, ν, ν, ν, ν, ν, ν, ν, ν, ν, ν, ν, ν, ν, ν, ν, ν, ν],
  [ν, ν, ν, ν, ν, ν, ν, ν, ν, ν, ν, ν, ν, ν, ν, ν, ν, ν, ν, ν],
  [ν, ν, ν, ν, ν, ν, ν, ν, ν, ν, ν, ν, ν, ν, ν, ν, ν, ν, ν, ν],
  [ν, ν, ν, ν, ν, ν, ν, ν, ν, ν, ν, ν, ν, ν, ν, ν, ν, ν, ν, ν],
  [ν, ν, ν, ν, ν, ν, ν, ν, ν, ν, ν, ν, ν, ν, ν, ν, ν, ν, ν, ν],
  [ν, ν, ν, ν, ν, ν, ν, ν, ν, ν, ν, ν, ν, ν, ν, ν, ν, ν, ν, ν],
  [ν, ν, ν, ν, ν, ν, ν, ν, ν, ν, ν, ν, ν, ν, ν, ν, ν, ν, ν, ν],
  [ν, ν, ν, ν, ν, ν, ν, ν, ν, ν, ν, ν, ν, ν, ν, ν, ν, ν, ν, ν],
  [ν, ν, ν, ν, ν, ν, ν, ν, ν, ν, ν, ν, ν, ν, ν, ν, ν, ν, ν, ν],
  [ν, ν, ν, ν, ν, ν, ν, ν, ν, ν, ν, ν, ν, ν, ν, ν, ν, ν, ν, ν],
  [ν, ν, ν, ν, ν, ν, ν, ν, ν, ν, ν, ν, ν, ν, ν, ν, ν, ν, ν, ν],
  [ν, ν, ν, ν, ν, ν, ν, ν, ν, ν, ν, ν, ν, ν, ν, ν, ν, ν, ν, ν],
  [ν, ν, ν, ν, ν, ν, ν, ν, ν, ν, ν, ν, ν, ν, ν, ν, ν, ν, ν, ν],
];

[testMap, trapMap, bigMap]
  .forEach(function(map) {
    var start = new Point(0, 0);
    var end = new Point(map.length-1, map[map.length-1].length-1);
    
    var path = AStar(map, start, end);
    if (path === null) {
      console.log(drawMap(map, [start, end]) + '\n');
    } else {
      console.log(drawMap(map, path) + '\n');
    };
  });

process.exit(0);

// ** AStar and related functions

function AStar(map, start, end) {

  var state = {
    map: map,
    frontier: new PointCostList([start, 0]),
    examined: new PointList(),
    prior: {},
    costs: {},
    here: null
  };
  
  state.prior[start] = null;
  state.costs[start] = 0;

  var evaluateNeighbor = makeEvaluator(state);
  var neighbors;

  while (state.frontier.length() > 0) {
    state.here = state.frontier.shift();
    neighbors = findNeighbors(state.map, state.here);
    
    if (state.here.equals(end)) {
      return gatherPath(state.prior, state.here);
    };

    neighbors.forEach(evaluateNeighbor);
  };

  return null;
};

function makeEvaluator(state) {
  return function(neighbor) {
    var cost = state.costs[state.here]
          + Math.max(getNodeCost(state.map, neighbor), 1);
    if (cost >= state.costs[neighbor]
        || state.examined.contains(neighbor)) return;

    state.costs[neighbor] = cost;
    
    if (cost < Infinity) {
      state.frontier.push(neighbor, cost);
    };
    
    state.examined.push(neighbor);
    state.prior[neighbor] = state.here;
  };
};

function getNodeCost(map, point) {
  return map[point.y][point.x];
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

function gatherPath(prior, from) {
  var here = from;
  var next = null;
  var path = [here];

  while (prior[here] !== null) {
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
    if (!char) char = pathDot(step, pathPoints[i-1]);
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

function pathDot(from, to) {
  return '●';
};

function pathArrow(from, to) {
  var arrows = {
    '-1': {
      '-1': '↖',
      '0': '↑',
      '1': '↗'
    },
    '0': {
      '-1': '←',
      '1': '→'
    },
    '1': {
      '-1': '↙',
      '0': '↓',
      '1': '↘'
    }
  };

  var Δx = from.x - to.x;
  var Δy = from.y - to.y;

  return arrows[Δy][Δx];
};
