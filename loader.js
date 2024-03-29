Loader = {};

Loader.loadImage = async function(filename){
    return new Promise((r,e) => {
        let i = new Image()
        i.cross_origin = "anonymous";
        i.onload = (() => r(i)); 
        i.onerror = ((errmess) => e(`filename ${filename} not found`));
        i.src = 'img/' + filename;
    })
}

let pieceIds = {
    "Wpawn": "P",
    "Wknight": "N",
    "Wbishop": "B",
    "Wrook": "R",
    "Wqueen": "Q",
    "Wking": "K",
    "Bpawn": "p",
    "Bknight": "n",
    "Bbishop": "b",
    "Brook": "r",
    "Bqueen": "q",
    "Bking": "k"
};

Loader.loadEverything = function (board, pieces){
    let out = [];
    for (let [name, char] of Object.entries(pieceIds)){
        let temp = Loader.loadImage(name + '.png');
        temp.then(e => pieces[char] = e);
        out.push(temp);
    }
    return Promise.all(out.concat(Loader.loadImage(board.src)))
}
