import init, * as wasm  from "./pkg/reversi_wasm.js";

const BOARD_SIZE = 8;
const GRID_SIZE = 40;

const PADDING_SCALE = 1/2;
const OFFSET = GRID_SIZE * PADDING_SCALE;

const canvas = document.getElementById("canvas") as HTMLCanvasElement;
const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
const messageField = document.getElementById("messageField") as HTMLParagraphElement;
const showHintsToggle = document.getElementById("showHintsToggle") as HTMLInputElement;
const enemySelect = document.getElementById("enemySelect") as HTMLSelectElement;

// begin global variables
let turn: wasm.Color;
let showingHints: boolean;
let game: wasm.Game;
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
    console.log(isHuman);
    

    game = new wasm.Game(isHuman);
    turn = game.get_turn();
    showingHints = showHintsToggle.checked;
}

function initEventListeners(
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D,
    messageField: HTMLParagraphElement,
    showHintsToggle: HTMLInputElement,
    enemySelect: HTMLSelectElement
) {
    canvas.addEventListener('mousemove', (event) => {
        const { x, y } = cursorCoord(event, canvas);
        
        if (game.can_put_stone(x, y)) {
            drawBoard(canvas, ctx, game);
            
            drawStone(x, y, turn, ctx, 0.5);
        }
    });

    canvas.addEventListener('click', (event: MouseEvent) => {
        const { x, y } = cursorCoord(event, canvas);

        const status = game.put(x, y);
        switch (status) {
            case wasm.GameStatus.Ok:
                break;
            case wasm.GameStatus.OkAndComputerPlaced:
                takeTurn(messageField, ctx);
                break;
            case wasm.GameStatus.BlackWin:
                messageField.innerHTML = "🎉🖤Black win!🎉";
                drawBoard(canvas, ctx, game);
                return;
            case wasm.GameStatus.WhiteWin:
                messageField.innerHTML = "🎉🤍White win!🎉";
                drawBoard(canvas, ctx, game);
                return;
            case wasm.GameStatus.Draw:
                messageField.innerHTML = "😮Draw.😮";
                drawBoard(canvas, ctx, game);
                break;
            case wasm.GameStatus.InvalidMove:
                return;
            case wasm.GameStatus.NextPlayerCantPutStone:
                alert(`[${wasm.color_to_string(turn)}] There is no stone to put. Pass.`);
                takeTurn(messageField, ctx);
                break;
            default:
                // unreachable
                return;
        }

        drawBoard(canvas, ctx, game);

        takeTurn(messageField, ctx);
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

function drawBoardGrid(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = '#41902a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = 'black';
    for (let i = 0; i < BOARD_SIZE+1; i++) {
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

export function drawBoardRs(game: wasm.Game) {
    drawBoard(canvas, ctx, game);
}

function drawBoard(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, game: wasm.Game) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBoardGrid(canvas, ctx);

    game.get_board().forEach((row: wasm.Color[], rowIndex: number) => {
        row.forEach((stone: wasm.Color, colIndex: number) => {
            if (stone == wasm.Color.Empty) { return; }
            drawStone(colIndex, rowIndex, stone, ctx, 1.0);
        })
    });

    drawHintsIfNeeded(ctx);
}

function drawStone(
    x: number,
    y: number,
    color: wasm.Color,
    ctx: CanvasRenderingContext2D,
    opacity: number
) {
    if (color == wasm.Color.Empty) {
        return;
    }
    
    ctx.fillStyle = color == wasm.Color.Black ? "black" : "white";
    ctx.beginPath();

    const stonePadding = 2;
    ctx.arc(
        x * GRID_SIZE + OFFSET / PADDING_SCALE,
        y * GRID_SIZE + OFFSET / PADDING_SCALE,
        OFFSET - stonePadding,
        0,
        2 * Math.PI
    );
    ctx.globalAlpha = opacity;
    ctx.fill();
    ctx.globalAlpha = 1.0;
}

function cursorCoord(event: MouseEvent, canvas: HTMLCanvasElement): {x: number, y: number} {
    const clientRect = canvas.getBoundingClientRect();
    const x = event.clientX - clientRect.left;
    const y = event.clientY - clientRect.top;

    return {
        x: Math.round((x - GRID_SIZE) / GRID_SIZE),
        y: Math.round((y - GRID_SIZE) / GRID_SIZE)
    };
}

function takeTurn(messageField: HTMLParagraphElement, ctx: CanvasRenderingContext2D) {
    turn = game.get_turn();

    updateTurnMessage(messageField);

    drawHintsIfNeeded(ctx);
}

function updateTurnMessage(messageField: HTMLParagraphElement) {
    messageField.innerHTML = turn == wasm.Color.Black
        ? "🖤Black's turn"
        : "🤍White's turn";
}

function drawHintsIfNeeded(ctx: CanvasRenderingContext2D) {
    if (showingHints) {
        game.get_can_put_stones().forEach((point: wasm.Point) => {
            ctx.fillStyle = "skyblue";
            ctx.beginPath();
            ctx.globalAlpha = 1.0;

            const stonePadding = 15;
            ctx.arc(
                point[0] * GRID_SIZE + OFFSET / PADDING_SCALE,
                point[1] * GRID_SIZE + OFFSET / PADDING_SCALE,
                OFFSET - stonePadding,
                0,
                2 * Math.PI
            );
            ctx.fill();
            ctx.globalAlpha = 1.0;
        })
    }
}
