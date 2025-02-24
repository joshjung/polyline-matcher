export interface Point {
  x: number;
  y: number;
}

export type Polyline = Point[];

export type PolylineWrapper<T = {}> = {
  line : Polyline
} & T;

export type PolylineMatchResult = {
  allPointsWithinMaxDist: boolean
  averagePointDistance: number
  matchedPointCount : number
  maxPointDist : number
  matchedPointPercentage : number
}

export function matchPolylines(source : Polyline, target : Polyline, maxPointDist : number) : PolylineMatchResult

export type PolylineWrapperMatchResult<T> = {
  polyline : Polyline
  source : PolylineWrapper<T>
  target : PolylineWrapper<T>
  matchResult : PolylineMatchResult
}

export type PolylineWrappersMatchResult<T> = {
  source : PolylineWrapper<T>
  matches : PolylineWrapperMatchResult<T>[]
}

export type PolylineMatchOptions<T> = {
  maxPointDist : number
  minPointMatchPercentage : number
  gridCellSize : number
  idField : string
  targetPolylines: PolylineWrapper<T>[]
}

export class PolylineMatcher<T> {
  constructor(options : PolylineMatchOptions<T>);
  findMatches(polyline: PolylineWrapper<T>) : PolylineWrapperMatchResult<T>[]
  findMatchesForAll(lineSetA : PolylineWrapper<T>[]) : PolylineWrappersMatchResult<T>[];
}
