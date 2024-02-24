async function loadImage(filename){
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


async function loadEverything(board, pieces){
    for (let [name, char] of Object.entries(pieceIds)){
        pieces[char] = await loadImage(name + '.png');
    }
    return await loadImage(board.src)
}
