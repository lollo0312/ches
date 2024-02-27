function copyPos(board){
    let out = [];
    for (let row of board){
        out.push(row.slice(0));
    }    
    return out
}

class ChessBoard{
    constructor(start, style){
        this.style = style;
        let tmp = start.split(" ")
        this.positions = ChessBoard.fenToPos(tmp[0]);
        this.active = (tmp[1] == 'w') ? 0 : 1; // 0 is white's turn
        // console.log(this.active ? "black" : "white")
        this.can_castle = {
            b_Kside : tmp[2].includes('k'),
            b_Qside : tmp[2].includes('q'),
            w_Kside : tmp[2].includes('K'),
            w_Qside : tmp[2].includes('Q')
        };
        this.enpassant = tmp[3] == '-' ? false : ChessBoard.charToPos(tmp[3]);
        this.halfmove = parseInt(tmp[4]);
        this.moves = parseInt(tmp[5]);
        this.check = this.computeCheck();
    }
    static rules = {
        rook : [[1,0],[-1,0],[0,1],[0,-1]],
        bishop : [[-1,-1],[-1,1],[1,-1],[1,1]],
        knight : [[2,1],[2,-1],[1,2],[1,-2],[-1,2],[-1,-2],[-2,1],[-2,-1]],
    }
    static charToPos(char){
        return [parseInt(8-char[1]), 'abcdefg'.indexOf(char[0])]
    }

    static fenToPos(fen){ // 0 , 0 == A8 , row col <=> 1-8 A-H
        let out = new Array(8);
        const fen_rows = fen.split("/");
        for (let i = 0; i<8; i++){
            let row = new Array(8);
            let j = 0
            for (let char of fen_rows[i]){
                if (/\d/g.test(char)){
                    j += parseInt(char);
                } else {
                    row[j] = char;
                    j+= 1;
                }
            }
            out[i] = row;
        }
        return out;
    }
    
    computeCheck(){
        let king =  this.currentKing();
        return this.visibleSquares(!this.active)[king[0]][king[1]] ? king : false;
    }

    currentKing(){
        let curr_king = this.active ? 'k' : 'K';
        for (let row = 0; row < 8; row++){
            for (let col = 0; col < 8; col++){
                if (this.positions[row][col] == curr_king){
                    return [row,col]
                }
            }
        }
    }

    lookforward(row, col, dirs){
        let out = [];
        let pos = [row, col];
        let self_color = (this.positions[row][col] == this.positions[row][col].toLowerCase());
        for (let dir of dirs){
            pos[0]+= dir[0];
            pos[1]+= dir[1];
            while (pos[0]<8 && pos[0]>= 0 && pos[1]<8 && pos[1]>=0){
                if (!this.positions[pos[0]][pos[1]]){
                    out.push([pos[0],pos[1]]);
                } else {
                    let other_color = (this.positions[pos[0]][pos[1]] == this.positions[pos[0]][pos[1]].toLowerCase());
                    if (self_color !=other_color){
                        out.push([pos[0],pos[1]]);
                    }
                    break;
                }
                pos[0] += dir[0];
                pos[1] += dir[1];
            }
            pos = [row,col];
        }
        return out
    }

    lookaround(row,col, dirs){
        let out = [];
        let self_color = (this.positions[row][col] == this.positions[row][col].toLowerCase());
        for (let dir of dirs){
            let cur = [row+dir[0], col + dir[1]]
            if ((cur[0]<8 && cur[0]>= 0 && cur[1]<8 && cur[1]>=0) && (!this.positions[cur[0]][cur[1]] || (self_color!= (this.positions[cur[0]][cur[1]] == this.positions[cur[0]][cur[1]].toLowerCase())))){
                out.push(cur);
            }
        }
        return out
    }

    lookCastle(observe, opponent){
        let cstl = true;
        let visible = this.visibleSquares(opponent);
        for (let sq of observe){
            cstl &= !(visible[sq[0]][sq[1]]);
        }
        return cstl;
    }

    retrievePieceMoves(row,col, piece){
        if (piece == 'r'){     // ROOK
            return this.lookforward(row, col, ChessBoard.rules.rook);
        } else if (piece == 'n'){     // KNIGHT
            return this.lookaround(row, col, ChessBoard.rules.knight);
        } else if (piece == 'b'){     // BISHOP
            return this.lookforward(row, col, ChessBoard.rules.bishop);
        } else if (piece == 'q'){     // QUEEN
            return this.lookforward(row, col, ChessBoard.rules.rook.concat(ChessBoard.rules.bishop));
        } else if (piece == 'k'){     // KING
            return this.lookaround(row, col, ChessBoard.rules.rook.concat(ChessBoard.rules.bishop));
        }
    }


    getMoves(row, col){
        let out = [];
        console.log(row,col)
        if (!this.positions[row][col]){
            return out
        }
        // Rules of chess
        let current = this.positions[row][col];
        let piece = current.toLowerCase();
        let advance = (current ==piece) * 2 - 1 // black = 1 white = -1;
        if (piece == 'p'){    // PAWN
            if (!this.positions[row+advance][col]){
                out.push([row + advance, col]);
                if (((advance == -1 && row == 6) || (advance == 1 && row == 1)) && !this.positions[row+2*advance][col]){
                    out.push([row + advance*2, col]);
                }
            }
            if (this.enpassant && this.active*2-1 == advance && Math.abs(this.enpassant[1] - col) == 1 && this.enpassant[0] - row == advance){
                out.push(this.enpassant)
            }
            // take
            for (let tcol = col-1; tcol <= col+1; tcol+=2){
                if (tcol >=0 && this.positions[row+advance][tcol] && ((current ==piece)!=((this.positions[row+advance][tcol] ==this.positions[row+advance][tcol].toLowerCase())))){
                    out.push([row+advance,tcol]);
                }
            }
        } else {
            out = out.concat(this.retrievePieceMoves(row, col, piece));
        }
        if (piece == 'k'){     // KING
            let bw = advance==1 ? 'b' : 'w';
            // not go into check
            let attacked = this.visibleSquares(bw == "w");   // If currently white look for black's visible squares)
            out = out.filter((v) =>{
                return !attacked[v[0]][v[1]]
            });

            // castling
            let observe = [];
            if (this.can_castle[bw + "_Kside"] && !this.positions[row][col+1] && !this.positions[row][col+2]){
                observe.push([row, col]);
                observe.push([row, col+1]);
                if (this.lookCastle(observe, bw=="w")) out.push([row,col+3]);  
            } 
            observe = [];
            if (this.can_castle[bw + "_Qside"] && !this.positions[row][col-1] && !this.positions[row][col-2] && !this.positions[row][col-3]){
                observe.push([row, col]);
                observe.push([row, col-1]);
                observe.push([row, col-2]);
                if (this.lookCastle(observe, bw=='w')) out.push([row,col-4]);
            }
        }

        // get out of check state if under attack
        if (this.check && (current==piece) == (this.positions[this.check[0]][this.check[1]] == this.positions[this.check[0]][this.check[1]].toLowerCase())){
            let current_state = copyPos(this.positions);
            let self = this;
            out = out.filter((move)=>{
                self.positions[row][col] = 0;
                self.positions[move[0]][move[1]] = current;
                let still_check = !self.computeCheck();
                self.positions = copyPos(current_state);
                return still_check;
            });
        }

        return out;
    }
    visibleSquares(color){    // 0 is white
        let out = [];
        for  (let ii = 0; ii < 8; ii++){
            out.push(new Array(8));
        }
        for (let col =0; col < 8; col++){
            for (let row=0; row<8; row++){
                if (this.positions[row][col] && (this.positions[row][col].toLowerCase() == this.positions[row][col]) == color){
                    let current = this.positions[row][col].toLowerCase();
                    out[row][col] = 1;
                    let advance = (this.positions[row][col] ==current) * 2 - 1 // black = 1 white = -1
                    if (current == 'p'){
                        out[row+advance][col-1] = 1;
                        out[row+advance][col+1] = 1;
                    }else {
                        for (let move of this.retrievePieceMoves(row, col, current)){
                            out[move[0]][move[1]] = 1
                        }
                    }
                }
            }
        }
        return out;
    }
}