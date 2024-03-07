/* tslint:disable */
/* eslint-disable */
/**
* @param {Color} color
* @returns {string}
*/
export function color_to_string(color: Color): string;
/**
*/
export enum GameStatus {
  Ok = 0,
  InvalidMove = 1,
  BlackWin = 2,
  WhiteWin = 3,
  Draw = 4,
  NextPlayerCantPutStone = 5,
}
/**
*/
export enum Color {
  Black = 0,
  White = 1,
  Empty = 2,
}
/**
*/
export class Game {
  free(): void;
/**
*/
  constructor();
/**
* @param {number} x
* @param {number} y
* @returns {GameStatus}
*/
  put(x: number, y: number): GameStatus;
/**
* Get the board
* returns Vec<Vec<Color>>
* @returns {any}
*/
  get_board(): any;
/**
* @param {number} x
* @param {number} y
* @returns {boolean}
*/
  can_put_stone(x: number, y: number): boolean;
/**
* @returns {(Point)[]}
*/
  get_can_put_stones(): (Point)[];
/**
* @returns {boolean}
*/
  is_game_over(): boolean;
}
/**
*/
export class Point {
  free(): void;
/**
*/
  0: number;
/**
*/
  1: number;
}

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
  readonly memory: WebAssembly.Memory;
  readonly __wbg_game_free: (a: number) => void;
  readonly color_to_string: (a: number, b: number) => void;
  readonly __wbg_point_free: (a: number) => void;
  readonly __wbg_get_point_0: (a: number) => number;
  readonly __wbg_set_point_0: (a: number, b: number) => void;
  readonly __wbg_get_point_1: (a: number) => number;
  readonly __wbg_set_point_1: (a: number, b: number) => void;
  readonly game_new: () => number;
  readonly game_put: (a: number, b: number, c: number) => number;
  readonly game_get_board: (a: number) => number;
  readonly game_can_put_stone: (a: number, b: number, c: number) => number;
  readonly game_get_can_put_stones: (a: number, b: number) => void;
  readonly game_is_game_over: (a: number) => number;
  readonly __wbindgen_malloc: (a: number, b: number) => number;
  readonly __wbindgen_realloc: (a: number, b: number, c: number, d: number) => number;
  readonly __wbindgen_add_to_stack_pointer: (a: number) => number;
  readonly __wbindgen_free: (a: number, b: number, c: number) => void;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;
/**
* Instantiates the given `module`, which can either be bytes or
* a precompiled `WebAssembly.Module`.
*
* @param {SyncInitInput} module
*
* @returns {InitOutput}
*/
export function initSync(module: SyncInitInput): InitOutput;

/**
* If `module_or_path` is {RequestInfo} or {URL}, makes a request and
* for everything else, calls `WebAssembly.instantiate` directly.
*
* @param {InitInput | Promise<InitInput>} module_or_path
*
* @returns {Promise<InitOutput>}
*/
export default function __wbg_init (module_or_path?: InitInput | Promise<InitInput>): Promise<InitOutput>;
