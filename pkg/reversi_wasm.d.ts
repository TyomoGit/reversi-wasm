/* tslint:disable */
/* eslint-disable */
/**
* @param {Color} color
* @returns {string}
*/
export function color_to_string(color: Color): string;
/**
* @param {string} s
* @returns {ComputerStrength}
*/
export function str_to_computer_strength(s: string): ComputerStrength;
/**
*/
export enum GameStatus {
  Ok = 0,
  InvalidMove = 1,
  BlackWin = 2,
  WhiteWin = 3,
  Draw = 4,
  BlackCantPutStone = 5,
  WhiteCantPutStone = 6,
}
/**
*/
export enum ComputerStrength {
  Random = 0,
  Simple = 1,
  Weighted = 2,
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
* @param {boolean} is_human
* @param {ComputerStrength} computer_strength
*/
  constructor(is_human: boolean, computer_strength: ComputerStrength);
/**
* @returns {Point | undefined}
*/
  decide(): Point | undefined;
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
/**
* @returns {Color}
*/
  get_turn(): Color;
}
/**
*/
export class Point {
  free(): void;
/**
* @param {number} x
* @param {number} y
*/
  constructor(x: number, y: number);
/**
*/
  x: number;
/**
*/
  y: number;
}

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
  readonly memory: WebAssembly.Memory;
  readonly color_to_string: (a: number, b: number) => void;
  readonly str_to_computer_strength: (a: number, b: number) => number;
  readonly __wbg_point_free: (a: number) => void;
  readonly __wbg_get_point_x: (a: number) => number;
  readonly __wbg_set_point_x: (a: number, b: number) => void;
  readonly __wbg_get_point_y: (a: number) => number;
  readonly __wbg_set_point_y: (a: number, b: number) => void;
  readonly point_new: (a: number, b: number) => number;
  readonly __wbg_game_free: (a: number) => void;
  readonly game_new: (a: number, b: number) => number;
  readonly game_decide: (a: number) => number;
  readonly game_put: (a: number, b: number, c: number) => number;
  readonly game_get_board: (a: number) => number;
  readonly game_can_put_stone: (a: number, b: number, c: number) => number;
  readonly game_get_can_put_stones: (a: number, b: number) => void;
  readonly game_is_game_over: (a: number) => number;
  readonly game_get_turn: (a: number) => number;
  readonly __wbindgen_malloc: (a: number, b: number) => number;
  readonly __wbindgen_realloc: (a: number, b: number, c: number, d: number) => number;
  readonly __wbindgen_add_to_stack_pointer: (a: number) => number;
  readonly __wbindgen_free: (a: number, b: number, c: number) => void;
  readonly __wbindgen_exn_store: (a: number) => void;
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
