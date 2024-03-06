import init, * as wasm  from "./pkg/reversi_wasm.js";

const BOARD_SIZE = 8;
const GRID_SIZE = 40;

const PADDING_SCALE = 1/2;
const OFFSET = GRID_SIZE * PADDING_SCALE;

// begin global variables
let turn: wasm.Color = wasm.Color.Black;
let showingHints = false;
// end global variables

init()
    .then(main);

function main() {
    const game = new wasm.Game();
    const canvas = document.getElementById("canvas") as HTMLCanvasElement;
    const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
    const messageField = document.getElementById("messageField") as HTMLParagraphElement;
    const showHintsToggle = document.getElementById("showHintsToggle") as HTMLInputElement;
    showingHints = showHintsToggle.checked;

    canvas.width = GRID_SIZE * (BOARD_SIZE + 1);
    canvas.height = GRID_SIZE * (BOARD_SIZE + 1);

    initEventListeners(canvas, ctx, game, messageField, showHintsToggle);

    updateTurnMessage(messageField);
    drawBoard(canvas, ctx, game);
}

function initEventListeners(
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D,
    game: wasm.Game,
    messageField: HTMLParagraphElement,
    showHintsToggle: HTMLInputElement
) {
    canvas.addEventListener('mousemove', (event) => {
        const { x, y } = cursorCoord(event, canvas);
        
        if (game.can_put_stone(x, y)) {
            drawBoard(canvas, ctx, game);
            
            drawStone(x, y, turn, ctx, 0.5);
        }
    });

    canvas.addEventListener('click', (event) => {
        const { x, y } = cursorCoord(event, canvas);

        const status = game.put(x, y);
        switch (status) {
            case wasm.GameStatus.Ok:
                break;
            case wasm.GameStatus.BlackWin:
                messageField.innerHTML = "🎉🖤Black win!🎉";
                break;
            case wasm.GameStatus.WhiteWin:
                messageField.innerHTML = "🎉🤍White win!🎉";
                break;
            case wasm.GameStatus.Draw:
                messageField.innerHTML = "😮Draw.😮";
                break;
            case wasm.GameStatus.InvalidMove:
                alert("Can't put stone here.");
                return;
            default:
                // unreachable
                return;
        }

        drawBoard(canvas, ctx, game);

        takeTurn(messageField, game, ctx);
    });

    showHintsToggle.addEventListener('change', (_) => {
        showingHints = showHintsToggle.checked;

        // drawHintsIfNeeded(game, ctx);
        drawBoard(canvas, ctx, game);
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

function drawBoard(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, game: wasm.Game) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBoardGrid(canvas, ctx);

    game.get_board().forEach((row: wasm.Color[], rowIndex: number) => {
        row.forEach((stone: wasm.Color, colIndex: number) => {
            if (stone == wasm.Color.Empty) { return; }
            drawStone(colIndex, rowIndex, stone, ctx, 1.0);
        })
    });

    drawHintsIfNeeded(game, ctx);
}

function drawStone(x: number, y: number, color: wasm.Color, ctx: CanvasRenderingContext2D, opacity: number) {
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

function takeTurn(messageField: HTMLParagraphElement, game: wasm.Game, ctx: CanvasRenderingContext2D) {
    if (turn == wasm.Color.Black) {
        turn = wasm.Color.White;
    } else {
        turn = wasm.Color.Black;
    }

    updateTurnMessage(messageField);

    if (game.get_can_put_stones().length == 0) {
        alert("There is no stone to put. Pass.");
        takeTurn(messageField, game, ctx);
    }

    drawHintsIfNeeded(game, ctx);
}

function updateTurnMessage(messageField: HTMLParagraphElement) {
    messageField.innerHTML = turn == wasm.Color.Black
        ? "🖤Black's turn"
        : "🤍White's turn";
}

function drawHintsIfNeeded(game: wasm.Game, ctx: CanvasRenderingContext2D) {
    if (showingHints) {
        game.get_can_put_stones().forEach((point: wasm.Point) => {
            // drawStone(point[0], point[1], turn, ctx, 0.50);
            
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
