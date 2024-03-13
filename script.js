import init, * as wasm from "./pkg/reversi_wasm.js";
const BOARD_SIZE = 8;
const GRID_SIZE = 40;
const PADDING_SCALE = 1 / 2;
const OFFSET = GRID_SIZE * PADDING_SCALE;
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const messageField = document.getElementById("messageField");
const showHintsToggle = document.getElementById("showHintsToggle");
const enemySelect = document.getElementById("enemySelect");
// begin global variables
let turn;
let showingHints;
let game;
let userCanPut = true;
// end global variables
init()
    .then(entry);
function entry() {
    reset();
    canvas.width = GRID_SIZE * (BOARD_SIZE + 1);
    canvas.height = GRID_SIZE * (BOARD_SIZE + 1);
    initEventListeners(canvas, ctx, messageField, showHintsToggle, enemySelect);
    updateTurnMessage(messageField);
    drawBoard(canvas, ctx, game);
}
function reset() {
    const isHuman = enemySelect.value == "human";
    game = new wasm.Game(isHuman, wasm.str_to_computer_strength(enemySelect.value));
    turn = game.get_turn();
    showingHints = showHintsToggle.checked;
}
function initEventListeners(canvas, ctx, messageField, showHintsToggle, enemySelect) {
    canvas.addEventListener('mousemove', (event) => {
        const { x, y } = cursorCoord(event, canvas);
        if (game.can_put_stone(x, y)) {
            drawBoard(canvas, ctx, game);
            drawStone(x, y, turn, ctx, 0.5);
        }
    });
    canvas.addEventListener('click', async (event) => {
        if (!userCanPut) {
            console.log("computer is thinking...");
            return;
        }
        const timeout = (ms) => new Promise(handler => setTimeout(handler, ms));
        const { x, y } = cursorCoord(event, canvas);
        const computerCanPut = put(new wasm.Point(x, y));
        if (!computerCanPut) {
            console.log("can't put stone");
            return;
        }
        userCanPut = false;
        const position_result_opt = game.decide();
        if (position_result_opt) {
            while (game.get_turn() == wasm.Color.White) {
                await timeout(500);
                const _ = put(position_result_opt);
            }
        }
        else {
            console.log("error");
        }
        userCanPut = true;
    });
    showHintsToggle.addEventListener('change', (_) => {
        showingHints = showHintsToggle.checked;
        // drawHintsIfNeeded(game, ctx);
        drawBoard(canvas, ctx, game);
    });
    enemySelect.addEventListener('change', (_) => {
        reset();
        drawBoard(canvas, ctx, game);
        console.log(`enemy: ${enemySelect.value}`);
    });
}
function put(position) {
    if (!game.can_put_stone(position.x, position.y)) {
        return false;
    }
    const status = game.put(position.x, position.y);
    switch (status) {
        case wasm.GameStatus.Ok:
            break;
        case wasm.GameStatus.BlackWin:
            messageField.innerHTML = "🎉🖤Black wins!🎉";
            drawBoard(canvas, ctx, game);
            return false;
        case wasm.GameStatus.WhiteWin:
            messageField.innerHTML = "🎉🤍White wins!🎉";
            drawBoard(canvas, ctx, game);
            return false;
        case wasm.GameStatus.Draw:
            messageField.innerHTML = "😮Draw.😮";
            drawBoard(canvas, ctx, game);
            return false;
        case wasm.GameStatus.InvalidMove:
            return false;
        case wasm.GameStatus.BlackCantPutStone:
            alert(`[Black] There is no stone to put. Pass.`);
            update_turn(messageField, ctx);
            break;
        case wasm.GameStatus.WhiteCantPutStone:
            alert(`[White] There is no stone to put. Pass.`);
            drawBoard(canvas, ctx, game);
            update_turn(messageField, ctx);
            return false;
        default:
            // unreachable
            return false;
    }
    drawBoard(canvas, ctx, game);
    update_turn(messageField, ctx);
    return true;
}
function drawBoardGrid(canvas, ctx) {
    ctx.fillStyle = '#41902a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = 'black';
    for (let i = 0; i < BOARD_SIZE + 1; i++) {
        // horizontal
        ctx.beginPath();
        ctx.moveTo(OFFSET + i * GRID_SIZE, OFFSET);
        ctx.lineTo(OFFSET + i * GRID_SIZE, canvas.height - OFFSET);
        ctx.stroke();
        // vertical
        ctx.beginPath();
        ctx.moveTo(OFFSET, OFFSET + i * GRID_SIZE);
        ctx.lineTo(canvas.width - OFFSET, OFFSET + i * GRID_SIZE);
        ctx.stroke();
    }
}
export function drawBoardRs(game) {
    drawBoard(canvas, ctx, game);
}
function drawBoard(canvas, ctx, game) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBoardGrid(canvas, ctx);
    game.get_board().forEach((row, rowIndex) => {
        row.forEach((stone, colIndex) => {
            if (stone == wasm.Color.Empty) {
                return;
            }
            drawStone(colIndex, rowIndex, stone, ctx, 1.0);
        });
    });
    drawHintsIfNeeded(ctx);
}
function drawStone(x, y, color, ctx, opacity) {
    if (color == wasm.Color.Empty) {
        return;
    }
    ctx.fillStyle = color == wasm.Color.Black ? "black" : "white";
    ctx.beginPath();
    const stonePadding = 2;
    ctx.arc(x * GRID_SIZE + OFFSET / PADDING_SCALE, y * GRID_SIZE + OFFSET / PADDING_SCALE, OFFSET - stonePadding, 0, 2 * Math.PI);
    ctx.globalAlpha = opacity;
    ctx.fill();
    ctx.globalAlpha = 1.0;
}
function cursorCoord(event, canvas) {
    const clientRect = canvas.getBoundingClientRect();
    const x = event.clientX - clientRect.left;
    const y = event.clientY - clientRect.top;
    return {
        x: Math.round((x - GRID_SIZE) / GRID_SIZE),
        y: Math.round((y - GRID_SIZE) / GRID_SIZE)
    };
}
function update_turn(messageField, ctx) {
    turn = game.get_turn();
    updateTurnMessage(messageField);
    drawHintsIfNeeded(ctx);
}
function updateTurnMessage(messageField) {
    messageField.innerHTML = turn == wasm.Color.Black
        ? "🖤Black's turn"
        : "🤍White's turn";
}
function drawHintsIfNeeded(ctx) {
    if (showingHints) {
        game.get_can_put_stones().forEach((point) => {
            ctx.fillStyle = "skyblue";
            ctx.beginPath();
            ctx.globalAlpha = 1.0;
            const stonePadding = 15;
            ctx.arc(point.x * GRID_SIZE + OFFSET / PADDING_SCALE, point.y * GRID_SIZE + OFFSET / PADDING_SCALE, OFFSET - stonePadding, 0, 2 * Math.PI);
            ctx.fill();
            ctx.globalAlpha = 1.0;
        });
    }
}
