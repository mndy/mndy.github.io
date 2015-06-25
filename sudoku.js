var emptyBoard = [
0, 0, 0, 0, 0, 0, 0, 0, 0,
0, 0, 0, 0, 0, 0, 0, 0, 0,
0, 0, 0, 0, 0, 0, 0, 0, 0,
0, 0, 0, 0, 0, 0, 0, 0, 0,
0, 0, 0, 0, 0, 0, 0, 0, 0,
0, 0, 0, 0, 0, 0, 0, 0, 0,
0, 0, 0, 0, 0, 0, 0, 0, 0,
0, 0, 0, 0, 0, 0, 0, 0, 0,
0, 0, 0, 0, 0, 0, 0, 0, 0
];

var testBoard = [
0, 0, 3, 0, 2, 0, 6, 0, 0,
9, 0, 0, 3, 0, 5, 0, 0, 1,
0, 0, 1, 8, 0, 6, 4, 0, 0,
0, 0, 8, 1, 0, 2, 9, 0, 0,
7, 0, 0, 0, 0, 0, 0, 0, 8,
0, 0, 6, 7, 0, 8, 2, 0, 0,
0, 0, 2, 6, 0, 9, 5, 0, 0,
8, 0, 0, 2, 0, 3, 0, 0, 9,
0, 0, 5, 0, 1, 0, 3, 0, 0
];

generateBoardHTML();
displayBoardVals(testBoard);

function getCell(board, i, j) {
	return board[j*9 + i];
}

function setCell(board, i, j, val) {
	board[j*9 + i] = val;
}

function displayBoardVals(board) {
	for (var i = 0; i < 9; i++) {
		for (var j = 0; j < 9; j++) {
			var cellValue = getCell(board, i, j);
			if (cellValue == 0) {
				document.getElementById(getCellId(i, j)).value = "";
			} else {
				document.getElementById(getCellId(i, j)).value = cellValue;
			}
		}
	}
}

function readBoardVals() {
	var board = emptyBoard.slice();
	for (var j = 0; j < 9; j++) {
		for (var i = 0; i < 9; i++) {
			cellValue = document.getElementById(getCellId(i, j)).value;
			if (cellValue == "") {
				setCell(board, i, j, 0);
			} else {
				setCell(board, i, j, parseInt(cellValue));
			}
		}
	}
	return board;
}

function solve() {
	var board = readBoardVals();
	if (!validate(board)) {
		document.getElementById("solve").style.color = "red";
	} else {
		document.getElementById("solve").style.color = "green";
	}

	var results = findResults(board, true);
	if (results.length > 0) {
		displayBoardVals(results[0]);
	}
}

function hint() {
	var board = readBoardVals();
	for (var j = 0; j < 9; j++) {
		for (var i = 0; i < 9; i++) {
			if (getCell(board, i, j) != 0) {
				continue;
			}
			if (getPossibleValues(board, i, j).length == 1) {
				var cellId = getCellId(i, j);
				document.getElementById(cellId).style.background = "green";
				setTimeout(
					function() {
						document.getElementById(cellId).style.background = "";
					},
					1000
				);
				return;		
			}
		}
	}
}

function generate() {
	var board = emptyBoard.slice();
	for (var val = 0; val < 10; val++) {
		var i   = getRandomInt(0, 9);
		var j   = getRandomInt(0, 9);
		var newboard = board.slice();
		setCell(newboard, i, j, val);

		if (validate(newboard)) {
			board = newboard;
		}
	}

	var results = findResults(board, true);
	if (results.length == 0) {
		console.log("Generation failed");
	}

	board = results[0];

	for (var num = 0; num < 25;) {
		var i = getRandomInt(0, 5);
		var j = getRandomInt(0, 9);

		if (getCell(board, i, j) == 0) {
			continue;
		}

		var tmp = board.slice();
		setCell(tmp, i, j, 0);
		setCell(tmp, 8 - i, j, 0);

		if (findResults(tmp).length == 1) {
			board = tmp;
			num++;	
		}
	}

	displayBoardVals(board);
}

function findResults(board, exitAfterFirst) {
	var results = [];
	var boards = [board];
	while (boards.length > 0) {
		var board = boards.pop();
		var update = {
			i: -1,
			j: -1,
			candidates: [1, 2, 3, 4, 5, 6, 7, 8, 9]
		};
		for (var j = 0; j < 9; j++) {
			for (var i = 0; i < 9; i++) {
				if (getCell(board, i, j) == 0) {
					var candidates = getPossibleValues(board, i, j);
					if (candidates.length <= update.candidates.length) {
						update.i = i;
						update.j = j;
						update.candidates = candidates;
					}
				}
			}
		}
		if (update.i != -1) {
			for (var candidate of update.candidates) {
				var option = board.slice();
				setCell(option, update.i, update.j, candidate);
				boards.push(option);
			}
		} else {
			results.push(board);

			if (exitAfterFirst) {
				return results;
			}
		}
	}
	return results;
}

function getPossibleValues(board, i, j) {
	var seen = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
	var indices = [];

	// Check row
	for (var x = 0; x < 9; x++) {
		if (x != i) {
			indices.push([x, j]);
		}
	}

	// Check column
	for (var y = 0; y < 9; y++) {
		if (y != j) {
			indices.push([i, y]);
		}
	}

	// Check block
	var ii = Math.floor(i / 3) * 3;
	var jj = Math.floor(j / 3) * 3;
	for (var y = jj; y < jj+3; y++) {
		for (var x = ii; x < ii+3; x++) {
			if (x != i || y != j) {
				indices.push([x, y]);
			}
		}
	}

	var values = "";
	for (var index of indices) {
		var val = getCell(board, index[0], index[1]);
		values += val;
		seen[val] = 1;
	}

	// Return possible values
	var candidates = [];
	for (var v = 1; v <= 9; v++) {
		if (seen[v] == 0) {
			candidates.push(v);
		}
	}
	return candidates;
}

function validate(board) {
	// Check all tiles can be assigned
	for (var j = 0; j < 9; j++) {
		for (var i = 0; i < 9; i++) {
			var candidates = getPossibleValues(board, i, j);
			if (candidates.length == 0) {
				return false;
			}
		}
	}

	// Validate rows
	for (var j = 0; j < 9; j++) {
		var seen = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
		for (var i = 0; i < 9; i++) {
			seen[getCell(board, i, j)]++;
		}
		for (var cell = 1; cell < 10; cell++) {
			if (seen[cell] > 1) {
				return false;
			}
		}
	}

	// Validate columns
	for (var i = 0; i < 9; i++) {
		var seen = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
		for (var j = 0; j < 9; j++) {
			seen[getCell(board, i, j)]++;
		}
		for (var cell = 1; cell < 10; cell++) {
			if (seen[cell] > 1) {
				return false;
			}
		}
	}

	// Validate blocks
	for (var ii = 0; ii < 3; ii++) {
		for (var jj = 0; jj < 3; jj++) {
			var seen = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
			for (var j = jj*3; j < jj*3+3; j++) {
				for (var i = ii*3; i < ii*3+3; i++) {
					seen[getCell(board, i, j)]++;
				}
			}
			for (var cell = 1; cell < 10; cell++) {
				if (seen[cell] > 1) {
					return false;
				}
			}
		}
	}

	return true;
}

function getCellId(i, j) {
	return "cell" + i + "_" + j;
}

function generateBoardHTML() {
	for (var i = 0; i < 9; i++) {
		createRowHTML(i);
	}
}

function createRowHTML(j) {
	var rowHTML = '<div id="row' + j + '">';
	for (var i = 0; i < 9; i++) {
		var input = '<input type="text" class="cell" id="' + getCellId(i, j) + '"></input>';
		rowHTML += input;
	}
	rowHTML += '</div>';
	document.getElementById("board").innerHTML += rowHTML;
}

function getRandomInt(min, max) {
	return Math.floor(Math.random() * (max - min)) + min;
}

