const WIDTH = 80;
const BOARD = {
    src : 'brown.png',
    black : '#b58863',
    white : '#f0d9b5',
};
const starting_position = "rnb1k2r/pppq2p1/6B1/3pP1B1/2P5/4nN2/PP3PPP/R3K2R b KQkq - 0 6"   //"rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"

var game;
var side = 1;
var drawer = new Drawer(side, WIDTH);

let piece_images = {};

function drawGame(){
    return Promise.all([ 
        drawer.drawEmptyBoard(game.style),
        drawer.drawPos(game.positions,piece_images)
    ])
}

Loader.loadEverything(BOARD,piece_images).then(async (all)=> {
    console.log("Loaded");
    game = new ChessBoard(starting_position, {
        black : BOARD.black,
        white : BOARD.white,
        image : all.pop(),
    });
    console.log(game);
    await drawGame();
    let check = game.check;
    if (check){
        drawer.highlightSquare(check);
    }
}).catch(console.error.bind(console));

let wrapper = document.getElementById('board_wrapper');
wrapper.addEventListener("click", async (e) => {
    await drawGame();
    await drawer.drawPossible(game.getMoves(side ? 7 - Math.floor((e.pageY-wrapper.offsetTop)/WIDTH) : Math.floor((e.pageY - wrapper.offsetTop)/WIDTH),side ? 7 - Math.floor((e.pageX - wrapper.offsetLeft)/WIDTH) : Math.floor((e.pageX - wrapper.offsetTop)/WIDTH)));
});

document.addEventListener('keypress', (e) => {
    console.log('keypres')
    if (e.key == "w"){
        drawGame();
        drawer.drawOnSquares(game.visibleSquares(0));
    } else if (e.key == "k"){
        drawGame();
        drawer.drawOnSquares(game.visibleSquares(1));
    } else if (e.key == "f"){
        side = !side;
        drawer.changeSide();
        drawGame();
    }

});

// wrapper.dispatchEvent()
wrapper.addEventListener('piecemoved', e => {
    //
});