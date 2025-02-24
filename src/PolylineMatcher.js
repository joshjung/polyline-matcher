const {expandBoundingBox, getBoundingBox, matchPolylines} = require('./geometryUtils');
const GridSpatialIndex = require('./GridSpatialIndex');

/**
 * Utility class that fits a line onto a set of lines.
 *
 * For performance, it spatially indexes a target line set (B).
 *
 * You can call fit(lineSet) to find all the segments in the target line set (B) that are approximately covered by lineSet (A).
 *
 * Note: this algorithm was built with help from Grok 3 Alpha. The original had some obvious bugs, and I had to rewrite
 * some of it and broke it into utility functions, etc. to clean it up.
 */
class PolylineMatcher {
  constructor(options) {
    const { maxPointDist, minPointMatchPercentage, gridCellSize, idField, targetPolylines = undefined } = options;

    if (!idField) {
      throw new Error('idField is required and used to deduplicate results from the spatial index.');
    }

    if (minPointMatchPercentage < 0 || minPointMatchPercentage > 1) {
      throw new Error(`minPointMatchPercentage must be between 0 and 1. Was ${minPointMatchPercentage}`);
    }

    this.idField = idField;
    this.maxPointDist = maxPointDist;
    this.minPointMatchPercentage = minPointMatchPercentage;
    this.gridCellSize = gridCellSize;

    if (targetPolylines) {
      this.setTargetLineSet(targetPolylines);
    }
  }

  setTargetLineSet(value) {
    this.targetPolylines = value;
    this.spatialIndex = new GridSpatialIndex(value, this.gridCellSize, this.idField);
  }

  findMatches(sourceLineWrapper) {
    let bbA = getBoundingBox(sourceLineWrapper.line);
    const expandedBBA = expandBoundingBox(bbA, this.maxPointDist);

    const potentialPolylines = this.spatialIndex.query(expandedBBA);

    const results = [];

    for (const { polyline, target } of potentialPolylines) {
      const matchResult = matchPolylines(sourceLineWrapper.line, polyline, this.maxPointDist);

      if (matchResult.matchedPointPercentage >= this.minPointMatchPercentage) {
        results.push({ polyline, source: sourceLineWrapper, target, matchResult });
      }
    }

    return results;
  }

  /**
   * Main algorithm to find segments in set B approximately covered by each segment in set A
   */
  findMatchesForAll(sourcePolylines) {
    const results = []; // Maps index of P_A to list of P_B indices

    if (!sourcePolylines.length) {
      throw new Error('No source polylines to match against');
    }

    // Step 2: Process each segment in set A
    sourcePolylines.forEach(sourceLineWrapper => {
      const matches = this.findMatches(sourceLineWrapper);

      if (matches.length > 0) {
        results.push({
          source: sourceLineWrapper,
          matches
        });
      }
    });

    return results;
  }
}

module.exports.matchPolylines = matchPolylines;
module.exports.default = PolylineMatcher;
