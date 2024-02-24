const ctx = document.getElementById('board').getContext('2d')


class Drawer{
    constructor(flipped=0, cell_width){
        this.flipped = flipped;
        this.glob_width = cell_width*8;
        this.glob_height = cell_width*8;
        this.width = cell_width;
        this.highlighted = {};
        this.board_element = document.getElementById("board_wrapper");
        this.board_element.style.setProperty("--width",cell_width + "px");
    }
    async drawEmptyBoard(info){
        ctx.clearRect(0,0,this.glob_width,this.glob_height)
        let colours = [info.white, info.black]
        ctx.drawImage(info.image, 0, 0, this.glob_width, this.glob_height);
        ctx.font = "20px Arial";
        let columns = "abcdefgh".split("");
        for (let i = 0; i < 8; i++) {
            ctx.fillStyle = colours[i % 2];
            ctx.fillText(this.flipped ? columns[7 - i] : columns[i], i * this.width + this.width*0.82, 715/90*this.width);
        }
        for (let j = 0; j < 8; j++) {
            ctx.fillStyle = colours[(j + 1) % 2];
            ctx.fillText(this.flipped ? (j + 1).toString() : (8 - j).toString(), 0.06*this.width, j * this.width + 0.24 * this.width);
        }
    }

    async drawPos(pos, images){
        for (let i = 0; i<8; i++){
            for (let j = 0; j<8; j++){
                if (!this.flipped && pos[j][i]){
                    ctx.drawImage(images[pos[j][i]], i * this.width, j * this.width, this.width, this.width);
                } else if (this.flipped && pos[7-j][7-i]){
                    ctx.drawImage(images[pos[7-j][7-i]], i * this.width, j * this.width, this.width, this.width);
                }
            }
        }
    }

    async drawPossible(moves){
        ctx.fillStyle = 'rgba(36,36,36,0.5)';
        for (let move of moves){
            ctx.beginPath();
            ctx.arc((this.flipped ? 7.5 - move[1] : move[1]+0.5)*this.width, (this.flipped ? 7.5 - move[0] : move[0]+0.5)*this.width, 0.2*this.width, 0, Math.PI*2);
            ctx.fill();
        }
    }

    async drawOnSquares(board){
        ctx.fillStyle = 'rgba(200,36,36,0.5)';
        for (let row = 0; row < 8; row++){
            for (let col = 0; col<8 ; col++){
                if (board[row][col]){
                    ctx.beginPath();
                    ctx.arc((this.flipped ? 7.5 - col : col+0.5)*this.width, (this.flipped ? 7.5 - row : row+0.5)*this.width, 0.2*this.width, 0, Math.PI*2);
                    ctx.fill();
                }
            }
        }
    }

    async highlightSquare(pos){
        let square = document.createElement('div');
        square.className = "highlight_square";
        square.style.setProperty("left", (this.flipped ? 7-pos[1] : pos[1])*this.width + "px");
        square.style.setProperty("top", (this.flipped ? 7-pos[0] : pos[0])*this.width + "px");
        this.board_element.appendChild(square);
    }
}
