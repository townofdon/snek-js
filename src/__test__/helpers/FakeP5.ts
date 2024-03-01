
import P5 from "p5";

export const fakeP5: P5 = {
  preload: function (): void {
    // silence
  },
  setup: function (): void {
    // silence
  },
  draw: function (): void {
    // silence
  },
  remove: function (): void {
    // silence
  },
  disableFriendlyErrors: false,
  describe: function (text: string, display?: P5.DESCRIBE_DISPLAY): void {
    // silence
  },
  describeElement: function (name: string, text: string, display?: P5.DESCRIBE_DISPLAY): void {
    // silence
  },
  textOutput: function (display?: P5.TEXT_DISPLAY): void {
    // silence
  },
  gridOutput: function (display?: P5.GRID_DISPLAY): void {
    // silence
  },
  alpha: function (color: string | number[] | P5.Color): number {
    return 0;
  },
  blue: function (color: string | number[] | P5.Color): number {
    return 0;
  },
  brightness: function (color: string | number[] | P5.Color): number {
    return 0;
  },
  color: function (gray: any, alpha?: number): P5.Color {
    return null;
  },
  green: function (color: string | number[] | P5.Color): number {
    return 0;
  },
  hue: function (color: string | number[] | P5.Color): number {
    return 0;
  },
  lerpColor: function (c1: P5.Color, c2: P5.Color, amt: number): P5.Color {
    return null;
  },
  lightness: function (color: string | number[] | P5.Color): number {
    return 0;
  },
  red: function (color: string | number[] | P5.Color): number {
    return 0;
  },
  saturation: function (color: string | number[] | P5.Color): number {
    return 0;
  },
  // @ts-ignore
  background: function (color: P5.Color) {
    // silence
  },
  // @ts-ignore
  clear: function (r: number, g: number, b: number, a: number) {
    // silence
  },
  // @ts-ignore
  colorMode: function (mode: P5.COLOR_MODE, max?: number) {
    // silence
  },
  // @ts-ignore
  fill: function (args: any) {
    // silence
  },
  // @ts-ignore
  noFill: function () {
    // silence
  },
  // @ts-ignore
  noStroke: function () {
    // silence
  },
  // @ts-ignore
  stroke: function (args: any) {
    // silence
  },
  // @ts-ignore
  erase: function (strengthFill?: number, strengthStroke?: number) {
    // silence
  },
  // @ts-ignore
  noErase: function () {
    // silence
  },
  // @ts-ignore
  arc: function (x: number, y: number, w: number, h: number, start: number, stop: number, mode?: P5.ARC_MODE, detail?: number) {
    // silence
  },
  // @ts-ignore
  ellipse: function (x: number, y: number, w: number, h?: number) {
    // silence
  },
  // @ts-ignore
  circle: function (x: number, y: number, d: number) {
    // silence
  },
  // @ts-ignore
  line: function (x1: number, y1: number, x2: number, y2: number) {
    // silence
  },
  // @ts-ignore
  point: function (args: any) {
    // silence
  },
  // @ts-ignore
  quad: function (x1: number, y1: number, x2: number, y2: number, x3: number, y3: number, x4: number, y4: number, detailX?: number, detailY?: number) {
    // silence
  },
  // @ts-ignore
  rect: function (x: number, y: number, w: number, h?: number, tl?: number, tr?: number, br?: number, bl?: number) {
    // silence
  },
  // @ts-ignore
  square: function (x: number, y: number, s: number, tl?: number, tr?: number, br?: number, bl?: number) {
    // silence
  },
  // @ts-ignore
  triangle: function (x1: number, y1: number, x2: number, y2: number, x3: number, y3: number) {
    // silence
  },
  // @ts-ignore
  ellipseMode: function (mode: P5.ELLIPSE_MODE) {
    // silence
  },
  // @ts-ignore
  noSmooth: function () {
    // silence
  },
  // @ts-ignore
  rectMode: function (mode: P5.RECT_MODE) {
    // silence
  },
  // @ts-ignore
  smooth: function () {
    // silence
  },
  // @ts-ignore
  strokeCap: function (cap: P5.STROKE_CAP) {
    // silence
  },
  // @ts-ignore
  strokeJoin: function (join: P5.STROKE_JOIN) {
    // silence
  },
  // @ts-ignore
  strokeWeight: function (weight: number) {
    // silence
  },
  // @ts-ignore
  bezier: function (x1: number, y1: number, x2: number, y2: number, x3: number, y3: number, x4: number, y4: number) {
    // silence
  },
  // @ts-ignore
  bezierDetail: function (detail: number) {
    // silence
  },
  bezierPoint: function (a: number, b: number, c: number, d: number, t: number): number {
    return 0;
  },
  bezierTangent: function (a: number, b: number, c: number, d: number, t: number): number {
    return 0;
  },
  // @ts-ignore
  curve: function (x1: number, y1: number, x2: number, y2: number, x3: number, y3: number, x4: number, y4: number) {
    // silence
  },
  // @ts-ignore
  curveDetail: function (resolution: number) {
    // silence
  },
  // @ts-ignore
  curveTightness: function (amount: number) {
    // silence
  },
  curvePoint: function (a: number, b: number, c: number, d: number, t: number): number {
    return 0;
  },
  curveTangent: function (a: number, b: number, c: number, d: number, t: number): number {
    return 0;
  },
  // @ts-ignore
  beginContour: function () {
    // silence
  },
  // @ts-ignore
  beginShape: function (kind?: P5.BEGIN_KIND) {
    // silence
  },
  // @ts-ignore
  bezierVertex: function (x2: number, y2: number, x3: number, y3: number, x4: number, y4: number) {
    // silence
  },
  // @ts-ignore
  curveVertex: function (x: number, y: number) {
    // silence
  },
  // @ts-ignore
  endContour: function () {
    // silence
  },
  // @ts-ignore
  endShape: function (mode?: "close") {
    // silence
  },
  // @ts-ignore
  quadraticVertex: function (cx: number, cy: number, x3: number, y3: number) {
    // silence
  },
  // @ts-ignore
  vertex: function (x: number, y: number) {
    // silence
  },
  // @ts-ignore
  normal: function (vector: any) {
    // silence
  },
  VERSION: "version",
  P2D: "p2d",
  WEBGL: "webgl",
  WEBGL2: "webgl2",
  ARROW: "arrow",
  CROSS: "cross",
  HAND: "hand",
  MOVE: "move",
  TEXT: "text",
  WAIT: "wait",
  HALF_PI: 0,
  PI: 0,
  QUARTER_PI: 0,
  TAU: 0,
  TWO_PI: 0,
  DEGREES: "degrees",
  RADIANS: "radians",
  CORNER: "corner",
  CORNERS: "corners",
  RADIUS: "radius",
  RIGHT: "right",
  LEFT: "left",
  CENTER: "center",
  TOP: "top",
  BOTTOM: "bottom",
  BASELINE: "alphabetic",
  POINTS: 0,
  LINES: 1,
  LINE_STRIP: 3,
  LINE_LOOP: 2,
  TRIANGLES: 4,
  TRIANGLE_FAN: 6,
  TRIANGLE_STRIP: 5,
  QUADS: "quads",
  QUAD_STRIP: "quad_strip",
  TESS: "tess",
  CLOSE: "close",
  OPEN: "open",
  CHORD: "chord",
  PIE: "pie",
  PROJECT: "square",
  SQUARE: "butt",
  ROUND: "round",
  BEVEL: "bevel",
  MITER: "miter",
  RGB: "rgb",
  HSB: "hsb",
  HSL: "hsl",
  AUTO: "auto",
  ALT: 0,
  BACKSPACE: 0,
  CONTROL: 0,
  DELETE: 0,
  DOWN_ARROW: 0,
  ENTER: 0,
  ESCAPE: 0,
  LEFT_ARROW: 0,
  OPTION: 0,
  RETURN: 0,
  RIGHT_ARROW: 0,
  SHIFT: 0,
  TAB: 0,
  UP_ARROW: 0,
  BLEND: "source-over",
  REMOVE: "destination-out",
  ADD: "lighter",
  DARKEST: "darkest",
  LIGHTEST: "lighten",
  DIFFERENCE: "difference",
  SUBTRACT: "subtract",
  EXCLUSION: "exclusion",
  MULTIPLY: "multiply",
  SCREEN: "screen",
  REPLACE: "copy",
  OVERLAY: "overlay",
  HARD_LIGHT: "hard-light",
  SOFT_LIGHT: "soft-light",
  DODGE: "color-dodge",
  BURN: "color-burn",
  THRESHOLD: "threshold",
  GRAY: "gray",
  OPAQUE: "opaque",
  INVERT: "invert",
  POSTERIZE: "posterize",
  DILATE: "dilate",
  ERODE: "erode",
  BLUR: "blur",
  NORMAL: "normal",
  ITALIC: "italic",
  BOLD: "bold",
  BOLDITALIC: "bolditalic",
  CHAR: "char",
  WORD: "word",
  LINEAR: "linear",
  QUADRATIC: "quadratic",
  BEZIER: "bezier",
  CURVE: "curve",
  STROKE: "stroke",
  FILL: "fill",
  TEXTURE: "texture",
  IMMEDIATE: "immediate",
  IMAGE: "image",
  NEAREST: "nearest",
  REPEAT: "repeat",
  CLAMP: "clamp",
  MIRROR: "mirror",
  LANDSCAPE: "landscape",
  PORTRAIT: "portrait",
  GRID: "grid",
  AXES: "axes",
  LABEL: "label",
  FALLBACK: "fallback",
  CONTAIN: "contain",
  COVER: "cover",
  UNSIGNED_BYTE: "unsigned-byte",
  UNSIGNED_INT: "unsigned-int",
  HALF_FLOAT: "half-float",
  FLOAT: "float",
  RGBA: "rgba",
  print: function (contents: any): void {
    // silence
  },
  cursor: function (type: string, x?: number, y?: number): void {
    // silence
  },
  // @ts-ignore
  frameRate: function (fps: any) {
    return 0;
  },
  getTargetFrameRate: function (): number {
    return 0;
  },
  noCursor: function (): void {
    // silence
  },
  windowResized: function (event?: object): void {
    // silence
  },
  fullscreen: function (val?: boolean): boolean {
    return false;
  },
  // @ts-ignore
  pixelDensity: function (val: number) {
    // silence
  },
  displayDensity: function (): number {
    return 0;
  },
  getURL: function (): string {
    return "";
  },
  getURLPath: function (): string[] {
    return [""]
  },
  getURLParams: function (): object {
    return null;
  },
  frameCount: 0,
  deltaTime: 0,
  focused: false,
  webglVersion: "",
  displayWidth: 0,
  displayHeight: 0,
  windowWidth: 0,
  windowHeight: 0,
  width: 0,
  height: 0,
  // @ts-ignore
  createCanvas: function (w: number, h: number, renderer?: P5.RENDERER, canvas?: object): P5.Renderer {
    return null;
  },
  resizeCanvas: function (w: number, h: number, noRedraw?: boolean): void {
    // silence
  },
  noCanvas: function (): void {
    // silence
  },
  // @ts-ignore
  createGraphics: function (w: number, h: number, renderer?: P5.RENDERER, canvas?: object): P5.Graphics {
    return null;
  },
  createFramebuffer: function (options?: object): void {
    // silence
  },
  blendMode: function (mode: P5.BLEND_MODE): void {
    // silence
  },
  drawingContext: undefined,
  noLoop: function (): void {
    // silence
  },
  loop: function (): void {
    // silence
  },
  isLooping: function (): boolean {
    return true;
  },
  push: function (): void {
    // silence
  },
  pop: function (): void {
    // silence
  },
  redraw: function (n?: number): void {
    // silence
  },
  p5: function (sketch: object, node: string | object): void {
    // silence
  },
  // @ts-ignore
  applyMatrix: function (arr: any[]) {
    // silence
  },
  // @ts-ignore
  resetMatrix: function () {
    // silence
  },
  // @ts-ignore
  rotate: function (angle: number, axis?: P5.Vector | number[]) {
    // silence
  },
  // @ts-ignore
  rotateX: function (angle: number) {
    // silence
  },
  // @ts-ignore
  rotateY: function (angle: number) {
    // silence
  },
  // @ts-ignore
  rotateZ: function (angle: number) {
    // silence
  },
  // @ts-ignore
  scale: function (s: number | P5.Vector | number[], y?: number, z?: number) {
    // silence
  },
  // @ts-ignore
  shearX: function (angle: number) {
    // silence
  },
  // @ts-ignore
  shearY: function (angle: number) {
    // silence
  },
  // @ts-ignore
  translate: function (x: number, y: number, z?: number) {
    // silence
  },
  storeItem: function (key: string, value: string | number | boolean | object | P5.Vector | P5.Color): void {
    // silence
  },
  getItem: function (key: string): string | number | boolean | object | P5.Vector | P5.Color {
    return null;
  },
  clearStorage: function (): void {
    // silence
  },
  removeItem: function (key: string): void {
    // silence
  },
  // @ts-ignore
  createStringDict: function (key: string, value: string): P5.StringDict {
    return null;
  },
  // @ts-ignore
  createNumberDict: function (key: number, value: number): P5.NumberDict {
    return null;
  },
  select: function (selectors: string, container?: string | P5.Element | HTMLElement): P5.Element {
    return null;
  },
  selectAll: function (selectors: string, container?: string | P5.Element | HTMLElement): P5.Element[] {
    return null;
  },
  removeElements: function (): void {
    // silence
  },
  // @ts-ignore
  changed: function (fxn: boolean | ((...args: any[]) => any)) {
    // silence
  },
  // @ts-ignore
  input: function (fxn: boolean | ((...args: any[]) => any)) {
    // silence
  },
  createDiv: function (html?: string): P5.Element {
    return null;
  },
  createP: function (html?: string): P5.Element {
    return null;
  },
  createSpan: function (html?: string): P5.Element {
    return null;
  },
  createImg: function (src: string, alt: string): P5.Element {
    return null;
  },
  createA: function (href: string, html: string, target?: string): P5.Element {
    return null;
  },
  createSlider: function (min: number, max: number, value?: number, step?: number): P5.Element {
    return null;
  },
  createButton: function (label: string, value?: string): P5.Element {
    return null;
  },
  createCheckbox: function (label?: string, value?: boolean): P5.Element {
    return null;
  },
  // @ts-ignore
  createSelect: function (multiple?: boolean): P5.Element {
    return null;
  },
  // @ts-ignore
  createRadio: function (containerElement: object, name?: string): P5.Element {
    return null;
  },
  createColorPicker: function (value?: string | P5.Color): P5.Element {
    return null;
  },
  createInput: function (value: string, type?: string): P5.Element {
    return null;
  },
  createFileInput: function (callback: (...args: any[]) => any, multiple?: boolean): P5.Element {
    return null;
  },
  createVideo: function (src: string | string[], callback?: (...args: any[]) => any): P5.MediaElement {
    return null;
  },
  createAudio: function (src?: string | string[], callback?: (...args: any[]) => any): P5.MediaElement {
    return null;
  },
  createCapture: function (type: string | object, callback?: (...args: any[]) => any): P5.Element {
    return null;
  },
  createElement: function (tag: string, content?: string): P5.Element {
    return null;
  },
  setMoveThreshold: function (value: number): void {
    // silence
  },
  setShakeThreshold: function (value: number): void {
    // silence
  },
  deviceMoved: function (): void {
    // silence
  },
  deviceTurned: function (): void {
    // silence
  },
  deviceShaken: function (): void {
    // silence
  },
  deviceOrientation: undefined,
  accelerationX: 0,
  accelerationY: 0,
  accelerationZ: 0,
  pAccelerationX: 0,
  pAccelerationY: 0,
  pAccelerationZ: 0,
  rotationX: 0,
  rotationY: 0,
  rotationZ: 0,
  pRotationX: 0,
  pRotationY: 0,
  pRotationZ: 0,
  turnAxis: "",
  keyPressed: function (event?: object): void {
    // silence
  },
  keyReleased: function (event?: object): void {
    // silence
  },
  keyTyped: function (event?: object): void {
    // silence
  },
  keyIsDown: function (code: number): boolean {
    return false;
  },
  keyIsPressed: false,
  key: "",
  keyCode: 0,
  mouseMoved: function (event?: object): void {
    // silence
  },
  mouseDragged: function (event?: object): void {
    // silence
  },
  mousePressed: function (event?: object): void {
    // silence
  },
  mouseReleased: function (event?: object): void {
    // silence
  },
  mouseClicked: function (event?: object): void {
    // silence
  },
  doubleClicked: function (event?: object): void {
    // silence
  },
  mouseWheel: function (event?: object): void {
    // silence
  },
  requestPointerLock: function (): void {
    // silence
  },
  exitPointerLock: function (): void {
    // silence
  },
  movedX: 0,
  movedY: 0,
  mouseX: 0,
  mouseY: 0,
  pmouseX: 0,
  pmouseY: 0,
  winMouseX: 0,
  winMouseY: 0,
  pwinMouseX: 0,
  pwinMouseY: 0,
  mouseButton: undefined,
  mouseIsPressed: false,
  touchStarted: function (event?: object): void {
    // silence
  },
  touchMoved: function (event?: object): void {
    // silence
  },
  touchEnded: function (event?: object): void {
    // silence
  },
  touches: [],
  createImage: function (width: number, height: number): P5.Image {
    return null;
  },
  // @ts-ignore
  saveCanvas: function (selectedCanvas: P5.Element | HTMLCanvasElement, filename?: string, extension?: string): void {
    // silence
  },
  saveFrames: function (filename: string, extension: string, duration: number, framerate: number, callback?: (p1: any[]) => any): void {
    // silence
  },
  loadImage: function (path: string, successCallback?: (p1: P5.Image) => any, failureCallback?: (p1: Event) => any): P5.Image {
    return null;
  },
  saveGif: function (filename: string, duration: number, options: object): void {
    // silence
  },
  image: function (img: P5.Element | P5.Image | P5.Framebuffer, x: number, y: number, width?: number, height?: number): void {
    // silence
  },
  // @ts-ignore
  tint: function (v1: number, v2: number, v3: number, alpha?: number): void {
    // silence
  },
  noTint: function (): void {
    // silence
  },
  imageMode: function (mode: P5.IMAGE_MODE): void {
    // silence
  },
  // @ts-ignore
  blend: function (srcImage: P5.Image, sx: number, sy: number, sw: number, sh: number, dx: number, dy: number, dw: number, dh: number, blendMode: P5.BLEND_MODE): void {
    // silence
  },
  // @ts-ignore
  copy: function (srcImage: P5.Element | P5.Image, sx: number, sy: number, sw: number, sh: number, dx: number, dy: number, dw: number, dh: number): void {
    // silence
  },
  filter: function (filterType: P5.FILTER_TYPE, filterParam?: number): void {
    // silence
  },
  // @ts-ignore
  get: function (x: number, y: number, w: number, h: number): P5.Image {
    return null;
  },
  loadPixels: function (): void {
    // silence
  },
  set: function (x: number, y: number, c: number | object | number[]): void {
    // silence
  },
  updatePixels: function (x?: number, y?: number, w?: number, h?: number): void {
    // silence
  },
  pixels: [],
  // @ts-ignore
  loadJSON: function (path: string, jsonpOptions?: object, datatype?: string, callback?: (...args: any[]) => any, errorCallback?: (...args: any[]) => any): object | any[] {
    return null;
  },
  loadStrings: function (filename: string, callback?: (...args: any[]) => any, errorCallback?: (...args: any[]) => any): string[] {
    return []
  },
  loadTable: function (filename: string, extension?: string, header?: string, callback?: (...args: any[]) => any, errorCallback?: (...args: any[]) => any): object {
    return {}
  },
  loadXML: function (filename: string, callback?: (...args: any[]) => any, errorCallback?: (...args: any[]) => any): object {
    return {}
  },
  loadBytes: function (file: string, callback?: (...args: any[]) => any, errorCallback?: (...args: any[]) => any): object {
    return {}
  },
  // @ts-ignore
  httpGet: function (path: string, datatype?: string, data?: boolean | object, callback?: (...args: any[]) => any, errorCallback?: (...args: any[]) => any): Promise<any> {
    // silence
  },
  // @ts-ignore
  httpPost: function (path: string, datatype?: string, data?: boolean | object, callback?: (...args: any[]) => any, errorCallback?: (...args: any[]) => any): Promise<any> {
    // silence
  },
  // @ts-ignore
  httpDo: function (path: string, method?: string, datatype?: string, data?: object, callback?: (...args: any[]) => any, errorCallback?: (...args: any[]) => any): Promise<any> {
    // silence
  },
  createWriter: function (name: string, extension?: string): P5.PrintWriter {
    return null;
  },
  save: function (objectOrFilename?: string | object, filename?: string, options?: string | boolean): void {
    // silence
  },
  saveJSON: function (json: object | any[], filename: string, optimize?: boolean): void {
    // silence
  },
  saveStrings: function (list: string[], filename: string, extension?: string, isCRLF?: boolean): void {
    // silence
  },
  saveTable: function (Table: P5.Table, filename: string, options?: string): void {
    // silence
  },
  abs: function (n: number): number {
    return 0;
  },
  ceil: function (n: number): number {
    return 0;
  },
  constrain: function (n: number, low: number, high: number): number {
    return 0;
  },
  dist: function (x1: number, y1: number, x2: number, y2: number): number {
    return 0;
  },
  exp: function (n: number): number {
    return 0;
  },
  floor: function (n: number): number {
    return 0;
  },
  lerp: function (start: number, stop: number, amt: number): number {
    return 0;
  },
  log: function (n: number): number {
    return 0;
  },
  mag: function (a: number, b: number): number {
    return 0;
  },
  map: function (value: number, start1: number, stop1: number, start2: number, stop2: number, withinBounds?: boolean): number {
    return 0;
  },
  // @ts-ignore
  max: function (n0: number, n1: number): number {
    return 0;
  },
  // @ts-ignore
  min: function (n0: number, n1: number): number {
    return 0;
  },
  norm: function (value: number, start: number, stop: number): number {
    return 0;
  },
  pow: function (n: number, e: number): number {
    return 0;
  },
  round: function (n: number, decimals?: number): number {
    return 0;
  },
  sq: function (n: number): number {
    return 0;
  },
  sqrt: function (n: number): number {
    return 0;
  },
  fract: function (num: number): number {
    return 0;
  },
  createVector: function (x?: number, y?: number, z?: number): P5.Vector {
    return new P5.Vector(x, y, z);
  },
  noise: function (x: number, y?: number, z?: number): number {
    return 0;
  },
  noiseDetail: function (lod: number, falloff: number): void {
    // silence
  },
  noiseSeed: function (seed: number): void {
    // silence
  },
  randomSeed: function (seed: number): void {
    // silence
  },
  // @ts-ignore
  random: function (min?: number, max?: number): number {
    return 0;
  },
  randomGaussian: function (mean?: number, sd?: number): number {
    return 0;
  },
  acos: function (value: number): number {
    return 0;
  },
  asin: function (value: number): number {
    return 0;
  },
  atan: function (value: number): number {
    return 0;
  },
  atan2: function (y: number, x: number): number {
    return 0;
  },
  cos: function (angle: number): number {
    return 0;
  },
  sin: function (angle: number): number {
    return 0;
  },
  tan: function (angle: number): number {
    return 0;
  },
  degrees: function (radians: number): number {
    return 0;
  },
  radians: function (degrees: number): number {
    return 0;
  },
  // @ts-ignore
  angleMode: function (mode: P5.ANGLE_MODE): void {
    // silence
  },
  // @ts-ignore
  textAlign: function (horizAlign: P5.HORIZ_ALIGN, vertAlign?: P5.VERT_ALIGN) {
    // silence
  },
  // @ts-ignore
  textLeading: function (leading: number) {
    // silence
  },
  // @ts-ignore
  textSize: function (theSize: number) {
    // silence
  },
  // @ts-ignore
  textStyle: function (theStyle: P5.THE_STYLE) {
    // silence
  },
  textWidth: function (theText: string): number {
    return 0;
  },
  textAscent: function (): number {
    return 0;
  },
  textDescent: function (): number {
    return 0;
  },
  textWrap: function (wrapStyle: P5.WRAP_STYLE): string {
    return ""
  },
  loadFont: function (path: string, callback?: (...args: any[]) => any, onError?: (...args: any[]) => any): P5.Font {
    return null;
  },
  // @ts-ignore
  text: function (str: string | number | boolean | object | any[], x: number, y: number, x2?: number, y2?: number) {
    // silence
  },
  // @ts-ignore
  textFont: function (): object {
    return {}
  },
  append: function (array: any[], value: any): any[] {
    return []
  },
  // @ts-ignore
  arrayCopy: function (src: any[], srcPosition: number, dst: any[], dstPosition: number, length: number): void {
    // silence
  },
  concat: function (a: any[], b: any[]): any[] {
    return []
  },
  reverse: function (list: any[]): any[] {
    return []
  },
  shorten: function (list: any[]): any[] {
    return []
  },
  shuffle: function (array: any[], bool?: boolean): any[] {
    return []
  },
  sort: function (list: any[], count?: number): any[] {
    return []
  },
  splice: function (list: any[], value: any, position: number): any[] {
    return []
  },
  subset: function (list: any[], start: number, count?: number): any[] {
    return []
  },
  float: function (str: string): number {
    return 0;
  },
  // @ts-ignore
  int: function (n: string | number | boolean, radix?: number): number {
    return 0;
  },
  str: function (n: string | number | boolean | any[]): string {
    return ""
  },
  boolean: function (n: string | number | boolean | any[]): boolean {
    return false
  },
  // @ts-ignore
  byte: function (n: string | number | boolean): number {
    return 0;
  },
  // @ts-ignore
  char: function (n: string | number): string {
    return ""
  },
  // @ts-ignore
  unchar: function (n: string): number {
    return 0;
  },
  // @ts-ignore
  hex: function (n: number, digits?: number): string {
    return ""
  },
  // @ts-ignore
  unhex: function (n: string): number {
    return 0;
  },
  join: function (list: any[], separator: string): string {
    return ""
  },
  match: function (str: string, regexp: string): string[] {
    return []
  },
  matchAll: function (str: string, regexp: string): string[] {
    return []
  },
  // @ts-ignore
  nf: function (num: string | number, left?: string | number, right?: string | number): string {
    return ""
  },
  // @ts-ignore
  nfc: function (num: string | number, right?: string | number): string {
    return ""
  },
  // @ts-ignore
  nfp: function (num: number, left?: number, right?: number): string {
    return ""
  },
  // @ts-ignore
  nfs: function (num: number, left?: number, right?: number): string {
    return ""
  },
  split: function (value: string, delim: string): string[] {
    return []
  },
  splitTokens: function (value: string, delim?: string): string[] {
    return []
  },
  // @ts-ignore
  trim: function (str: string): string {
    return ""
  },
  day: function (): number {
    return 0;
  },
  hour: function (): number {
    return 0;
  },
  minute: function (): number {
    return 0;
  },
  millis: function (): number {
    return 0;
  },
  month: function (): number {
    return 0;
  },
  second: function (): number {
    return 0;
  },
  year: function (): number {
    return 0;
  },
  // @ts-ignore
  plane: function (width?: number, height?: number, detailX?: number, detailY?: number) {
    // silence
  },
  // @ts-ignore
  box: function (width?: number, height?: number, depth?: number, detailX?: number, detailY?: number) {
    // silence
  },
  // @ts-ignore
  sphere: function (radius?: number, detailX?: number, detailY?: number) {
    // silence
  },
  // @ts-ignore
  cylinder: function (radius?: number, height?: number, detailX?: number, detailY?: number, bottomCap?: boolean, topCap?: boolean) {
    // silence
  },
  // @ts-ignore
  cone: function (radius?: number, height?: number, detailX?: number, detailY?: number, cap?: boolean) {
    // silence
  },
  // @ts-ignore
  ellipsoid: function (radiusx?: number, radiusy?: number, radiusz?: number, detailX?: number, detailY?: number) {
    // silence
  },
  // @ts-ignore
  torus: function (radius?: number, tubeRadius?: number, detailX?: number, detailY?: number) {
    // silence
  },
  // @ts-ignore
  orbitControl: function (sensitivityX?: number, sensitivityY?: number, sensitivityZ?: number, options?: object) {
    // silence
  },
  debugMode: function (): void {
    // silence
  },
  noDebugMode: function (): void {
    // silence
  },
  // @ts-ignore
  ambientLight: function (v1: number, v2: number, v3: number, alpha?: number) {
    // silence
  },
  // @ts-ignore
  specularColor: function (v1: number, v2: number, v3: number) {
    // silence
  },
  // @ts-ignore
  directionalLight: function (v1: number, v2: number, v3: number, x: number, y: number, z: number) {
    // silence
  },
  // @ts-ignore
  pointLight: function (v1: number, v2: number, v3: number, x: number, y: number, z: number) {
    // silence
  },
  // @ts-ignore
  lights: function () {
    // silence
  },
  // @ts-ignore
  lightFalloff: function (constant: number, linear: number, quadratic: number) {
    // silence
  },
  // @ts-ignore
  spotLight: function (v1: number, v2: number, v3: number, x: number, y: number, z: number, rx: number, ry: number, rz: number, angle?: number, concentration?: number) {
    // silence
  },
  // @ts-ignore
  noLights: function () {
    // silence
  },
  // @ts-ignore
  loadModel: function (path: string, normalize: boolean, successCallback?: (p1: P5.Geometry) => any, failureCallback?: (p1: Event) => any, fileType?: string): P5.Geometry {
    // silence
  },
  model: function (model: P5.Geometry): void {
    // silence
  },
  loadShader: function (vertFilename: string, fragFilename: string, callback?: (...args: any[]) => any, errorCallback?: (...args: any[]) => any): P5.Shader {
    return null;
  },
  createShader: function (vertSrc: string, fragSrc: string): P5.Shader {
    return null;
  },
  // @ts-ignore
  shader: function (s: P5.Shader) {
    // silence
  },
  // @ts-ignore
  resetShader: function () {
    // silence
  },
  // @ts-ignore
  texture: function (tex: P5.Graphics | P5.MediaElement | P5.Image | P5.Framebuffer) {
    // silence
  },
  textureMode: function (mode: P5.TEXTURE_MODE): void {
    // silence
  },
  textureWrap: function (wrapX: P5.WRAP_X, wrapY?: P5.WRAP_Y): void {
    // silence
  },
  // @ts-ignore
  normalMaterial: function () {
    // silence
  },
  // @ts-ignore
  ambientMaterial: function (v1: number, v2: number, v3: number) {
    // silence
  },
  // @ts-ignore
  emissiveMaterial: function (v1: number, v2: number, v3: number, alpha?: number) {
    // silence
  },
  // @ts-ignore
  specularMaterial: function (gray: number, alpha?: number) {
    // silence
  },
  // @ts-ignore
  shininess: function (shine: number) {
    // silence
  },
  // @ts-ignore
  camera: function (x?: number, y?: number, z?: number, centerX?: number, centerY?: number, centerZ?: number, upX?: number, upY?: number, upZ?: number) {
    // silence
  },
  // @ts-ignore
  perspective: function (fovy?: number, aspect?: number, near?: number, far?: number) {
    // silence
  },
  // @ts-ignore
  ortho: function (left?: number, right?: number, bottom?: number, top?: number, near?: number, far?: number) {
    // silence
  },
  // @ts-ignore
  frustum: function (left?: number, right?: number, bottom?: number, top?: number, near?: number, far?: number) {
    // silence
  },
  createCamera: function (): P5.Camera {
    return null;
  },
  setCamera: function (cam: P5.Camera): void {
    // silence
  },
  // @ts-ignore
  vertexNormal: function (x: number, y: number, z: number, v: P5.Vector) {
    // silence
  },
  // @ts-ignore
  setAttributes: function (key: string, value: boolean): void {
    // silence
  }
}
