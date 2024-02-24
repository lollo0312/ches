const WIDTH = 80;
const BOARD = {
    src : 'board.png',
    black : '#69a250',
    white : '#e4f2c9',
};
const starting_position = "rnb1k2r/pppq2p1/6B1/3pP1B1/2P5/4nN2/PP3PPP/R3K2R b KQkq - 0 6"   //"rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"

var game;
var side = 1;
var drawer = new Drawer(side, WIDTH);

let piece_images = {};

function drawGame(){
    drawer.drawEmptyBoard(game.style);
    drawer.drawPos(game.positions,piece_images);
}

loadEverything(BOARD,piece_images).then((empty_board)=> {
    console.log("Loaded");
    game = new ChessBoard(starting_position, {
        black : BOARD.black,
        white : BOARD.white,
        image : empty_board,
    });
    console.log(game);
    drawGame();
    let check = game.check;
    if (check){
        drawer.highlightSquare(check);
    }
}).catch(console.error.bind(console));

let wrapper = document.getElementById('board_wrapper');
wrapper.addEventListener("click",(e) => {
    drawGame();
    drawer.drawPossible(game.getMoves(side ? 7 - Math.floor((e.pageY-wrapper.offsetTop)/WIDTH) : Math.floor((e.pageY - wrapper.offsetTop)/WIDTH),side ? 7 - Math.floor((e.pageX - wrapper.offsetLeft)/WIDTH) : Math.floor((e.pageX - wrapper.offsetTop)/WIDTH)));
});

wrapper.addEventListener('keypress', (e) => {
    if (e.key == "w"){
        drawer.drawOnSquares(game.visibleSquares(0));
    } else if (e.key == "k"){
        drawer.drawOnSquares(game.visibleSquares(1));
    }
});

// wrapper.dispatchEvent()
wrapper.addEventListener('piecemoved', e => {
    //
});