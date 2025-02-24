const { bboxIntersect, getBoundingBox } = require('./geometryUtils');

/**
 * Spatial indexing of line segments into a grid of cells that are cellSize x cellSize for faster
 * lookup.
 */
class GridSpatialIndex {
  constructor(polylineWrapperArray, cellSize, idField) {
    this.cells = new Map();
    this.cellSize = cellSize;
    this.idField = idField;

    this.indexSegments(polylineWrapperArray);
  }

  // Index all segments into grid cells based on their bounding boxes
  indexSegments(polylineWrapperArray) {
    polylineWrapperArray.forEach((polylineWrapper, idx) => {
      const bb = getBoundingBox(polylineWrapper.line);

      const minCellX = Math.floor(bb.min.x / this.cellSize);
      const maxCellX = Math.ceil(bb.max.x / this.cellSize);
      const minCellY = Math.floor(bb.min.y / this.cellSize);
      const maxCellY = Math.ceil(bb.max.y / this.cellSize);

      for (let x = minCellX; x <= maxCellX; x++) {
        for (let y = minCellY; y <= maxCellY; y++) {
          const key = `${x},${y}`;
          if (!this.cells.has(key)) this.cells.set(key, []);
          this.cells.get(key).push({
            id: polylineWrapper[this.idField],
            polyline: polylineWrapper.line,
            idx,
            bb,
            target: polylineWrapper
          });
        }
      }
    });
  }

  /**
   * Given a bounding box, search for all segments that lie within that bounding box.
   *
   * @param testBB
   * @returns {any[]}
   */
  query(testBB) {
    const minCellX = Math.floor(testBB.min.x / this.cellSize);
    const maxCellX = Math.ceil(testBB.max.x / this.cellSize);
    const minCellY = Math.floor(testBB.min.y / this.cellSize);
    const maxCellY = Math.ceil(testBB.max.y / this.cellSize);

    const resultsById = {};
    const results = new Set();
    
    for (let x = minCellX; x <= maxCellX; x++) {
      for (let y = minCellY; y <= maxCellY; y++) {
        const key = `${x},${y}`;
        if (this.cells.has(key)) {
          const cellSegments = this.cells.get(key);
          for (const { polyline, id, idx, bb : cellBB, target } of cellSegments) {
            if (!resultsById[id] && bboxIntersect(testBB, cellBB)) {
              resultsById[id] = true;
              results.add({ polyline, target, idx });
            }
          }
        }
      }
    }
    return Array.from(results);
  }
}

module.exports = GridSpatialIndex;
module.exports.default = GridSpatialIndex;
