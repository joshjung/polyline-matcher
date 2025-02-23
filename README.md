# Polyline Matcher Algorithm

An algorithm to determine how closely one polyline fits a portion of another polyline.

    Source Line: P1 ----------------------------------------------- P2
    Target Line:               P3--------------------------P4

In the above example, Target fits along the Source line within a maximum distance

    Source Line: P1 ----------------------------------------------- P2
    |
    |
    |
    Target Line:               P3--------------------------P4

In the above example, the Target line is too far away from the Source line to be considered a fit.

    Source Line: P1 ----------------------------------------------- P2
    |                          P3
    |                            \
    Target Line:                  \
    |                              \
    |                               P4

In the above example, the Target line (P3->P4) does not fit along the Source line (P1 -> P2) unless the
maximum distance is greater than the distance from P4 to the Source line.

Lines with more than 2 points can be any shape.

# Single Example

    import { matchPolylines, Point, PolylineMatchResult } from 'polyline-matcher';

    // Source Line with 100 points
    const sourceLine : Point[] = [];

    for (let i = 0; i < 100; i++) sourceLine.push({ x: i, y: i });

    // Target Line (make sourceLine fuzzy)
    const targetLine : Point[] = sourceLine.slice(0, 10)
      .map(p => ({ x: p.x + Math.random(), y: p.y + Math.random() }));

    // What is the maximum distance from the target line that 
    // a source point must be to be considered a match?
    const maxPointDist : number = 1.0;

    // Calculate...
    const result : PolylineMatchResult = matchPolylines(sourceLines, targetLines, maxPointDist);

    expect(result.allPointsWithinMaxDist).toBeTruthy();

# Polyline Match Algorithm

> Polyline: a line with 2 or more points.

> Source: a polyline

> Target: a polyline. We want to calculate to what extent the target line lies along the path of the source line.

Given a polyline Target and a polyline Source, we want to calculate a result that explains how closely Target lies 
along the path of Source. We can adjust how precise we want to be through a parameter `maxPointDist`.

It is possible for for the Source line to be much, much longer than the Target line!

    matchPolylines(source : Polyline, target : Polyline, maxPointDist : number) : PolylineMatchResult

Returns a `PolylineMatchResult`:

    type PolylineMatchResult = {
      allPointsWithinMaxDist: boolean // True if all points in Target were within maxPointDist of Source
      averagePointDistance: number    // self-explanatory
      matchedPointCount : number      // count of the number of points that fell within maxPointDist of Source
      maxPointDist : number       // self-explanatory
      matchedPointPercentage : number // percentage of points in Target that were within maxPointDist of Source
    }

# `class PolylineMatcher`

You may desire to do a comparison against a large set of Target polylines. The `PolylineMatcher` class is your friend.

Note that the arguments and types are slightly different with the `PolylineMatcher` compared to the `matchPolylines()` 
function. You must provide a full object for each line that includes an `idField`.

Also note that the `PolylineMatcher` builds an R-tree to improve the speed of finding potential matching Target lines.

    import { PolylineMatcher, PolylineWrapper, PolylineMatchResult } from 'polyline-matcher';

    type MyLine = PolylineWrapper<{ id : number }>;

    const targetPolylines : MyLine[] = [
      { id: 1, line: [{ x: 0, y: 0 }, { x: 1, y: 1 } ] },
      { id: 2, line: [{ x: 2, y: 2 }, { x: 4, y: 4 } ] },
      { id: 3, line: [{ x: 5, y: 5 }, { x: 10, y: -10 } ] }
    ]

    const polylineMatcher = new PolylineMatcher<{ id : number }>({
      maxPointDist: 1,
      minPointMatchPercentage: 0.75,
      idField: 'id',
      gridCellSize: 5, // This is the height and width of each cell in the R-tree
      targetPolylines
    });
  
    const sourcePolylines : MyLine[] = [
      { id: 1, line: [{ x: 0.1, y: 0.1 }, { x: 1, y: 1 } ] },
    ]

    const matches = polylineMatcher.findMatchesForAll(sourcePolylines);

# Tests

    $ yarn test

    Test Suites: 1 passed, 1 total
    Tests:       23 passed, 23 total
    Snapshots:   0 total
    Time:        0.969 s, estimated 2 s

# License

The MIT License (MIT)

Copyright (c) 2025 Joshua Jung

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.


