
function distance(p1, p2) {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;

  return Math.sqrt(dx * dx + dy * dy);
}

function pointToLineSegmentDistance(p, p1, p2) {
  const l2 = distance(p1, p2) ** 2;
  if (l2 === 0) return distance(p, p1);
  let t = ((p.x - p1.x) * (p2.x - p1.x) + (p.y - p1.y) * (p2.y - p1.y)) / l2;
  t = Math.max(0, Math.min(1, t));
  const projection = {
    x: p1.x + t * (p2.x - p1.x),
    y : p1.y + t * (p2.y - p1.y)
  };
  return distance(p, projection);
}

function pointToPolylineDistance(p, polyline) {
  let minDist = Infinity;

  for (let i = 0; i < polyline.length - 1; i++) {
    const p1 = polyline[i];
    const p2 = polyline[i + 1];

    if (p1 && p2) {
      const dist = pointToLineSegmentDistance(p, p1, p2);
      minDist = Math.min(minDist, dist);
    }
  }

  return minDist;
}

function getBoundingBox(points) {
  const min = { x : Infinity, y: Infinity }
  const max = { x : -Infinity, y: -Infinity };

  for (const p of points) {
    min.x = Math.min(min.x, p.x);
    min.y = Math.min(min.y, p.y);
    max.x = Math.max(max.x, p.x);
    max.y = Math.max(max.y, p.y);
  }

  return { min, max };
}

function expandBoundingBox(bbox, maxPointDist) {
  return {
    min: { x: bbox.min.x - maxPointDist, y: bbox.min.y - maxPointDist },
    max: { x: bbox.max.x + maxPointDist, y: bbox.max.y + maxPointDist }
  };
}

function pointIntersectsBoundingBox(p, bbox) {
  return p.x >= bbox.min.x && p.x <= bbox.max.x &&
    p.y >= bbox.min.y && p.y <= bbox.max.y;
}

function bboxIntersect(bb1, bb2) {
  const corners1 = [
    { x : bb1.min.x, y : bb1.min.y },
    { x : bb1.min.x, y : bb1.max.y },
    { x : bb1.max.x, y : bb1.min.y },
    { x : bb1.max.x, y : bb1.max.y },
  ];

  for (const p of corners1) {
    if (pointIntersectsBoundingBox(p, bb2)) {
      return true;
    }
  }

  const corners2 = [
    { x : bb2.min.x, y : bb2.min.y },
    { x : bb2.min.x, y : bb2.max.y },
    { x : bb2.max.x, y : bb2.min.y },
    { x : bb2.max.x, y : bb2.max.y },
  ];

  for (const p of corners2) {
    if (pointIntersectsBoundingBox(p, bb1)) {
      return true;
    }
  }

  return false;
}

/**
 * Returns true if polylineA approximately is parallel and in roughly the same location as polylineB
 * for the entire length of polylineB.
 *
 * @param polylineA
 * @param polylineB
 * @param maxPointDist
 *
 * @returns {boolean}
 */
function matchPolylines(polylineA, polylineB, maxPointDist) {
  // Compute the maximum distance from sampled points to P_A
  let maxDistance = 0;
  let matchedPointCount = 0;
  let totalDistance = 0;

  for (const point of polylineB) {
    const dist = pointToPolylineDistance(point, polylineA);
    totalDistance += dist;

    if (dist <= maxPointDist) {
      matchedPointCount++;
    }

    maxDistance = Math.max(maxDistance, dist);
  }

  // If all sampled points are within maxPointDist, P_B is covered by P_A
  return {
    allPointsWithinMaxDist: maxDistance <= maxPointDist,
    averagePointDistance: totalDistance / polylineB.length,
    matchedPointCount,
    maxPointDist : maxDistance,
    matchedPointPercentage: matchedPointCount / polylineB.length,
  };
}

module.exports = module.exports.default = {
  distance,
  getBoundingBox,
  expandBoundingBox,
  bboxIntersect,
  matchPolylines
}
