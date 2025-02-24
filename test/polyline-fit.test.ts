import {describe, it, expect} from '@jest/globals';
import {PolylineMatcher, matchPolylines, Point, PolylineMatchResult, PolylineWrapper} from '../index.js';

import * as target1 from './data/target1.json';
import * as source1 from './data/source1.json';

describe('PolylineMatcher', function() {
  describe('new PolylineMatcher() should work', function () {
    it('Should instantiate without error', function () {
      const matcher = new PolylineMatcher({
        maxPointDist: 1,
        idField: 'id',
        gridCellSize: 1000,
        minPointMatchPercentage: 0.99,
        targetPolylines: [
          { line: [{ x: 0, y: 0}, { x: 100, y: 100 }] },
          { line: [{ x: 200, y: 200}, { x: 400, y: 400 }] }
        ]
      });

      expect(matcher).toBeDefined();
    });
  });

  describe('PolylineMatcher should match the simplest geometric use cases', function() {
    it('Should match identical 2-point lines', function() {
      const source1 = [{"x": -5, "y": 5}, {"x": 100, "y": 200}];

      expect(matchPolylines(source1, source1, 0).allPointsWithinMaxDist).toBeTruthy();
    });

    it('Should match identical N-point lines', function() {
      const source1 = [];

      for (let i = 0; i < 100; i++) {
        source1.push({ x: i, y: i });
      }

      expect(matchPolylines(source1, source1, 0).allPointsWithinMaxDist).toBeTruthy();
    });

    it('Should match identical N-point lines against a subset of an (N-M)-point line', function() {
      const source = [];

      for (let i = 0; i < 100; i++) {
        source.push({ x: i, y: i });
      }

      const target = source.slice(0, 10);

      expect(matchPolylines(source, target, 0).allPointsWithinMaxDist).toBeTruthy();
    });

    it('Should match identical N-point lines against a subset of an (N-M)-point line with random deviations', function() {
      const source : Point[] = [];

      for (let i = 0; i < 100; i++) {
        source.push({ x: i, y: i });
      }

      const target : Point[] = source.slice(0, 10).map(p => ({ x: p.x + Math.random(), y: p.y + Math.random() }));

      const matchResult: PolylineMatchResult = matchPolylines(source, target, 1);

      expect(matchResult.allPointsWithinMaxDist).toBeTruthy();
    });

    it('Should NOT match identical N-point lines against a subset of an (N-M)-point line with random deviations that fall outside of maxPointDist', function() {
      const source = [];

      for (let i = 0; i < 100; i++) {
        source.push({ x: i, y: i });
      }

      const target = source.slice(0, 10).map(p => ({ x: p.x + Math.random() * 2, y: p.y + Math.random() * 2 }));

      expect(matchPolylines(source, target, 0.5).allPointsWithinMaxDist).toBeFalsy();
    });

    it('Should match 2-point line shifted horizontally that fall within maxPointDist', function() {
      const SHIFT_DISTANCE = 1;

      const source = [{"x": -5, "y": 5}, {"x": 100, "y": 200}];
      const target = source.map(p => ({ x: p.x + SHIFT_DISTANCE, y: p.y}));

      const match = matchPolylines(source, target, SHIFT_DISTANCE).allPointsWithinMaxDist;

      expect(match).toBeTruthy();
    });

    it('Should NOT match 2-point  line shifted horizontally that fall outside maxPointDist', function() {
      const SHIFT_DISTANCE = 1;

      const source = [{"x": -5, "y": 5}, {"x": 100, "y": 200}];
      const target = source.map(p => ({ x: p.x + SHIFT_DISTANCE, y: p.y}));

      const match = matchPolylines(source, target, SHIFT_DISTANCE / 2).allPointsWithinMaxDist;

      expect(match).toBeFalsy();
    });

    it('Should match 2-point line shifted vertically that fall within maxPointDist', function() {
      const SHIFT_DISTANCE = 1;

      const source = [{"x": -5, "y": 5}, {"x": 100, "y": 200}];
      const target = source.map(p => ({ x: p.x, y: p.y + SHIFT_DISTANCE}));

      const match = matchPolylines(source, target, SHIFT_DISTANCE).allPointsWithinMaxDist;

      expect(match).toBeTruthy();
    });

    it('Should NOT match 2-point line shifted horizontally that fall outside maxPointDist', function() {
      const SHIFT_DISTANCE = 1;

      const source = [{"x": -5, "y": 5}, {"x": 100, "y": 200}];
      const target = source.map(p => ({ x: p.x, y: p.y + SHIFT_DISTANCE}));

      const match = matchPolylines(source, target, SHIFT_DISTANCE / 2).allPointsWithinMaxDist;

      expect(match).toBeFalsy();
    });

    it('Should NOT match 2-point lines that are perpendicular', function() {
      const source = [{"x": -1, "y": -1}, {"x": 1, "y": 1}];
      const target = [{"x": -1, "y": +1}, {"x": 1, "y": -1}];

      const match = matchPolylines(source, target, 0.2).allPointsWithinMaxDist;

      expect(match).toBeFalsy();
    });

    it('Should match 2-point lines that are perpendicular if maxPointDist is large enough', function() {
      const source = [{"x": -1, "y": -1}, {"x": 1, "y": 1}];
      const target = [{"x": -1, "y": +1}, {"x": 1, "y": -1}];

      const match = matchPolylines(source, target, 1000).allPointsWithinMaxDist;

      expect(match).toBeTruthy();
    });
  });

  describe('PolylineMatcher should match complex polylines, use case 1', function() {
    const source1 = [
      {"x": -490886, "y": 163593},
      {"x": -520745, "y": 163593},
      {"x": -526716, "y": 161802},
      {"x": -532091, "y": 157622},
      {"x": -536868, "y": 150456},
      {"x": -538062, "y": 143290},
      {"x": -539854, "y": 567},
      {"x": -542840, "y": -8987},
      {"x": -549409, "y": -16153},
      {"x": -558366, "y": -20333},
      {"x": -567323, "y": -20931},
      {"x": -576281, "y": -18542},
      {"x": -582253, "y": -14959},
      {"x": -587627, "y": -6599},
      {"x": -588821, "y": 1762},
      {"x": -588224, "y": 11316},
      {"x": -573295, "y": 44160},
      {"x": -570309, "y": 57895},
      {"x": -551797, "y": 154039}
    ];

    const target1 = [
      {"x": -512982, "y": 163593},
      {"x": -521939, "y": 162996},
      {"x": -530299, "y": 161205},
      {"x": -533882, "y": 158816},
      {"x": -537465, "y": 154039},
      {"x": -538660, "y": 149261},
      {"x": -539854, "y": 139109},
      {"x": -539257, "y": 567},
      {"x": -540451, "y": -5404},
      {"x": -544034, "y": -11973},
      {"x": -550006, "y": -17348},
      {"x": -557172, "y": -20931},
      {"x": -561352, "y": -22125},
      {"x": -569115, "y": -21528},
      {"x": -576878, "y": -18542},
      {"x": -585836, "y": -10182},
      {"x": -589419, "y": -3016},
      {"x": -590016, "y": 6539},
      {"x": -587627, "y": 15496},
      {"x": -575684, "y": 38786},
      {"x": -570906, "y": 53118},
      {"x": -560158, "y": 117014},
      {"x": -551200, "y": 125972}
    ];

    const badTarget1 = [
      {"x": -616888, "y": -33770},
      {"x": -604945, "y": -32874},
      {"x": -589419, "y": -29589},
      {"x": -582551, "y": -27201},
      {"x": -576878, "y": -24812},
      {"x": -570011, "y": -20035},
      {"x": -562248, "y": -12570},
      {"x": -555679, "y": -3314},
      {"x": -552992, "y": 1463},
      {"x": -550901, "y": 7136}
    ]

    it('Should match valid polyline with a large enough maxPointDist', function() {
      const result = matchPolylines(source1, target1, 5900);
      expect(result.allPointsWithinMaxDist).toBeTruthy();
    })

    it('Should not match valid polyline with a small maxPointDist', function() {
      const result = matchPolylines(source1, target1, 5700);
      expect(result.allPointsWithinMaxDist).toBeFalsy();
    })

    it('Should not match invalid polyline with a large maxPointDist', function() {
      const result = matchPolylines(source1, badTarget1, 30000);
      expect(result.allPointsWithinMaxDist).toBeFalsy();
    })
  })

  describe('PolylineMatcher sikmple', function() {
    it('Should match simple lines properly', function () {
      type TestWrapper = PolylineWrapper<{
        id : number | string,
        source : any
      }>

      /**
       * Create two horizontal identical lines 1 unit vertically separated
       */
      const target : TestWrapper[] = [
        { line: [{ x: 0, y: 0 }, { x: 10, y : 0 }], source: { id: 1 }, id: 1 },
        { line: [{ x: 0, y: 1 }, { x: 10, y : 1 }], source: { id: 2 }, id: 2 }
      ];

      /**
       * Create a target line that is closer to the top line (id 1)
       */
      const source : TestWrapper[] = [
        { line: [{ x: 0, y: 0.1 }, { x: 10, y : 0.1 }], source: { id: 'a' }, id: 'a' }
      ];

      const matcher = new PolylineMatcher<TestWrapper>({
        maxPointDist: 0.3,
        minPointMatchPercentage: 1,
        idField: 'id',
        gridCellSize: 10,
        targetPolylines: target
      });

      const matches = matcher.findMatchesForAll(source);

      const actualMatchCount = matches[0].matches.length;

      expect(actualMatchCount).toEqual(1);
      expect(matches[0].source.id).toEqual('a');
      expect(matches[0].matches[0].source.id).toEqual('a');
      expect(matches[0].matches[0].target.id).toEqual(1);
    });
  });

  describe('PolylineMatcher should match complex polylines, use case 2', function() {
    const source1 = [
      {"x": -220968, "y": 997832},
      {"x": -229926, "y": 994846},
      {"x": -235897, "y": 990666},
      {"x": -240077, "y": 985291},
      {"x": -242466, "y": 978125},
      {"x": -242466, "y": 878399},
      {"x": -241272, "y": 871830},
      {"x": -236494, "y": 864067},
      {"x": -228134, "y": 861081},
      {"x": -179167, "y": 861081},
      {"x": -142740, "y": 865858},
      {"x": -105118, "y": 875413},
      {"x": -75260, "y": 887954},
      {"x": -38833, "y": 910049},
      {"x": -7183, "y": 935727},
      {"x": 13717, "y": 958419},
      {"x": 32229, "y": 984097},
      {"x": 39993, "y": 999623},
      {"x": 52533, "y": 1029481},
      {"x": 61491, "y": 1061728},
      {"x": 66865, "y": 1088004},
      {"x": 68656, "y": 1117265},
      {"x": 67462, "y": 1138763},
      {"x": 64476, "y": 1163246},
      {"x": 57908, "y": 1191910},
      {"x": 50144, "y": 1216394},
      {"x": 40590, "y": 1238489},
      {"x": 31035, "y": 1255807},
      {"x": 16106, "y": 1277305},
      {"x": 580, "y": 1295817},
      {"x": -25098, "y": 1318509},
      {"x": -47791, "y": 1335230},
      {"x": -75857, "y": 1350756},
      {"x": -100341, "y": 1361505},
      {"x": -133782, "y": 1371657},
      {"x": -157669, "y": 1374642},
      {"x": -180361, "y": 1376434},
      {"x": -223357, "y": 1377628},
      {"x": -231717, "y": 1375837},
      {"x": -236494, "y": 1371657},
      {"x": -240675, "y": 1365088},
      {"x": -241272, "y": 1358519},
      {"x": -241869, "y": 1246849},
      {"x": -240675, "y": 1239683},
      {"x": -236494, "y": 1231920},
      {"x": -231717, "y": 1227143},
      {"x": -224551, "y": 1222366},
      {"x": -192901, "y": 1219977}];

    const target1 = [
      {"x": -15544, "y": 1308357},
      {"x": -38833, "y": 1328064},
      {"x": -65108, "y": 1344187},
      {"x": -93175, "y": 1357325},
      {"x": -112881, "y": 1364491},
      {"x": -140948, "y": 1371657},
      {"x": -164238, "y": 1374045},
      {"x": -217982, "y": 1376434}
    ];

    const badTarget1 = [
      {"x": -231717, "y": 1381211},
      {"x": -237689, "y": 1379420},
      {"x": -246049, "y": 1372254},
      {"x": -248438, "y": 1368671},
      {"x": -249632, "y": 1361505},
      {"x": -250229, "y": 1346576}
    ]

    const badTarget2 = [
      {"x": 13120, "y": 956329},
      {"x": 18495, "y": 966779},
      {"x": 19092, "y": 969466},
      {"x": 18793, "y": 973647},
      {"x": 17898, "y": 975737},
      {"x": 16703, "y": 976632}
    ]

    const maybeTarget1 = [
      {"x": 36410, "y": 988874},
      {"x": 48950, "y": 1012164},
      {"x": 56713, "y": 1030676},
      {"x": 62685, "y": 1046799},
      {"x": 69851, "y": 1085615},
      {"x": 73434, "y": 1128014},
      {"x": 73434, "y": 1142345},
      {"x": 67462, "y": 1177578},
      {"x": 62685, "y": 1195493},
      {"x": 57310, "y": 1209228},
      {"x": 46561, "y": 1234906},
      {"x": 39993, "y": 1248641},
      {"x": 19689, "y": 1276707}
    ];

    const badTargetInCenter = [
      {"x": -79440, "y": 1157275},
      {"x": -74663, "y": 1137568},
      {"x": -73469, "y": 1120250},
      {"x": -73469, "y": 1110099}
    ];

    it('Should match valid polyline with a large enough maxPointDist', function() {
      const result = matchPolylines(source1, target1, 1300);
      expect(result.allPointsWithinMaxDist).toBeTruthy();
    })

    it('Should not match valid polyline with a small maxPointDist', function() {
      const result = matchPolylines(source1, target1, 500);
      expect(result.allPointsWithinMaxDist).toBeFalsy();
    })

    it('Should not match invalid polyline with a large maxPointDist (case 1)', function() {
      const result = matchPolylines(source1, badTarget1, 5000);
      expect(result.allPointsWithinMaxDist).toBeFalsy();
    })

    it('Should not match invalid polyline with a large maxPointDist (case 2)', function() {
      const result = matchPolylines(source1, badTarget2, 5000);
      expect(result.allPointsWithinMaxDist).toBeFalsy();
    })

    it('Should match a similar polyline with a large maxPointDist', function() {
      const result = matchPolylines(source1, maybeTarget1, 10000);
      expect(result.allPointsWithinMaxDist).toBeTruthy();
    })

    it('Should not match a similar polyline with a small maxPointDist', function() {
      const result = matchPolylines(source1, maybeTarget1, 1500);
      expect(result.allPointsWithinMaxDist).toBeFalsy();
    })

    it('Should not match invalid polyline that exists in the center of a surrounding polyline even with a large maxPointDist', function() {
      const result = matchPolylines(source1, badTargetInCenter, 10000);
      expect(result.allPointsWithinMaxDist).toBeFalsy();
    })
  })

  describe('PolylineMatcher should match complex polylines, use case 2', function() {
    it('Should match complicated source line against many target lines and match to only the expected lines', function () {
      const matcher = new PolylineMatcher<{ match? : boolean, id : number }>({
        maxPointDist: 15000,
        minPointMatchPercentage: 0.75,
        idField: 'id',
        gridCellSize: 100000,
        targetPolylines: target1
      });

      const matches = matcher.findMatchesForAll(source1);

      const expectedMatchCount = target1.filter(t => t.match).length;
      const actualMatchCount = matches[0].matches.length;

      expect(expectedMatchCount).toEqual(actualMatchCount);
    });
  });
});
