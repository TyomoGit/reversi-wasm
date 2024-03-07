use std::fmt::Display;

use reversi::computer::{SimpleComputer, WeightedComputer};
use reversi::{
    board::ReversiError, computer::PlayerType, game::SimpleReversiGame, stone::Stone
};
use serde::Serialize;
use serde::ser::SerializeTuple;

use wasm_bindgen::prelude::*;

#[wasm_bindgen]
extern "C" {
    fn alert(s: &str);
}

#[wasm_bindgen(js_namespace = console)]
extern "C" {
    fn log(s: &str);
}

#[wasm_bindgen]
pub struct Game {
    game: SimpleReversiGame,
}

#[wasm_bindgen]
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum Color {
    Black = 0,
    White = 1,
    Empty = 2,
}

impl Display for Color {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Color::Black => write!(f, "Black"),
            Color::White => write!(f, "White"),
            Color::Empty => write!(f, "Empty"),
        }
    }
}

#[wasm_bindgen]
pub fn color_to_string(color: Color) -> String {
    color.to_string()
}

impl serde::Serialize for Color {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        serializer.serialize_u8(*self as u8)
    }
}

#[wasm_bindgen]
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum GameStatus {
    Ok,
    OkAndComputerPlaced,
    InvalidMove,
    BlackWin,
    WhiteWin,
    Draw,
    NextPlayerCantPutStone,
}

#[wasm_bindgen]
pub struct Point(pub usize, pub usize);

impl Serialize for Point {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
        where
            S: serde::Serializer {
        let mut tuple = serializer.serialize_tuple(2)?;
        tuple.serialize_element(&self.0)?;
        tuple.serialize_element(&self.1)?;
        tuple.end()
        
    }
}

#[wasm_bindgen]
impl Game {
    #[wasm_bindgen(constructor)]
    pub fn new(is_human: bool) -> Game {
        let white = if is_human {
            PlayerType::Human
        } else {
            PlayerType::Computer(
                Box::new(WeightedComputer::new(Stone::White))
            )
        };

        Game {
            game: SimpleReversiGame::new(PlayerType::Human, white),
        }
    }

    pub fn put(&mut self, x: usize, y: usize) -> GameStatus {
        match self.game.put_stone(x, y) {
            Ok(()) => {
                if let PlayerType::Computer(_) = self.game.white() {
                    GameStatus::OkAndComputerPlaced
                } else {
                    GameStatus::Ok
                }
            },
            Err(err) => match err {
                ReversiError::StoneAlreadyPlaced
                | ReversiError::InvalidMove
                | ReversiError::IndexOutOfBound
                | ReversiError::NoStoneToFlip => GameStatus::InvalidMove,
                ReversiError::GameOverWithWinner(winner) => match winner {
                    Stone::Black => GameStatus::BlackWin,
                    Stone::White => GameStatus::WhiteWin,
                },
                ReversiError::GameOverWithDraw => GameStatus::Draw,
                ReversiError::NextPlayerCantPutStone => GameStatus::NextPlayerCantPutStone,
            },
        }
    }

    /// Get the board
    /// returns Vec<Vec<Color>>
    pub fn get_board(&self) -> JsValue {
        let result: Vec<Vec<Color>> = self
            .game
            .board()
            .board()
            .iter()
            .map(|rows| {
                rows.iter()
                    .map(|cell| match cell {
                        Some(Stone::Black) => Color::Black,
                        Some(Stone::White) => Color::White,
                        None => Color::Empty,
                    })
                    .collect()
            })
            .collect();

        serde_wasm_bindgen::to_value(&result).unwrap()
    }

    pub fn can_put_stone(&self, x: usize, y: usize) -> bool {
        self.game.check_can_put(x, y)
    }

    pub fn get_can_put_stones(&self) -> Vec<Point> {
        self.game
            .get_can_put_stones()
            .into_iter()
            .map(|reversi::point::Point { x, y }| Point(x, y))
            .collect()
    }

    pub fn is_game_over(&self) -> bool {
        self.game
            .board()
            .is_game_over()
    }

    pub fn get_turn(&self) -> Color {
        match self.game.turn() {
            Stone::Black => Color::Black,
            Stone::White => Color::White,
        }
    }
}

impl Default for Game {
    fn default() -> Self {
        Self::new(true)
    }
}
