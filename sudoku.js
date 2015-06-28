// JavaScript for a simple sudoku game.  The code is currently capable of
// generating simple sudoku problems, and solving any sudoku problem (using
// backtracking).
//
// (c) Michael Munday 2015
// 
// This file is distributed under the GPLv3 copyleft license. See here for
// details: https://gnu.org/licenses/gpl.html

// Boards are stored in two forms - a 1D array which is indexed using 9j + i and
// the displayed form that the user interacts with.  In the array form 0
// represents undefined whereas in the displayed form undefined tiles are
// represented by "".

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

// Some colours - used for showing tile state.
var clueBackground    = "#EBEBEB";
var hintColor         = "#CCFF99";
var defaultBackground = "white";

// Generate some HTML and fill it with an initial game.
generateBoardHTML();
displayBoardVals(testBoard);
disableBoardVals();

// Print an error message to the screen in red. Will be cleared when a button is
// pressed.
function error(message) {
	var output = document.getElementById("messages");
	output.innerHTML = message;
	output.style.color = "red";
}

// Clears the current messages.
function clearMessages() {
	var output = document.getElementById("messages");
	output.innerHTML = "";
}

// Get the value of a cell (a.k.a. a tile) from an array.
function getCell(board, i, j) {
	return board[j*9 + i];
}

// Set the value of a cell (a.k.a. a tile) in an array.
function setCell(board, i, j, val) {
	board[j*9 + i] = val;
}

// Display the provided board in the HTML.
function displayBoardVals(board) {
	for (var i = 0; i < 9; i++) {
		for (var j = 0; j < 9; j++) {
			var cellValue = getCell(board, i, j);
			if (cellValue === 0) {
				cellValue = "";
			}
			document.getElementById(getCellId(i, j)).value = cellValue;
		}
	}
}

// Read board values from the HTML inputs and put them into a 1D array.
function readBoardVals() {
	var board = emptyBoard.slice();
	for (var j = 0; j < 9; j++) {
		for (var i = 0; i < 9; i++) {
			cellValue = document.getElementById(getCellId(i, j)).value;
			if (cellValue === "") {
				setCell(board, i, j, 0);
			} else {
				setCell(board, i, j, parseInt(cellValue));
			}
		}
	}
	return board;
}

// Solve the displayed sudoku using a backtracking based method. Will return the
// first correct solution found.
function solve() {
	clearMessages();
	var board = readBoardVals();
	if (!validate(board)) {
		error("Cannot solve this board, there is an incorrectly placed tile.");
		return;
	}

	var results = findResults(board, true);
	if (results.length > 0) {
		displayBoardVals(results[0]);
	}
}

// Display a simple hint on the screen for a second. The hint shows a cell which
// has only one possible value at the current time.
function hint() {
	clearMessages();
	var board = readBoardVals();
	for (var j = 0; j < 9; j++) {
		for (var i = 0; i < 9; i++) {
			if (getCell(board, i, j) != 0) {
				continue;
			}
			if (getPossibleValues(board, i, j).length === 1) {
				var cell = document.getElementById(getCellId(i, j));
				cell.style.background = hintColor;
				setTimeout(
					function() { cell.style.background = defaultBackground; },
					1000
				);
				return;		
			}
		}
	}
}

// Clear the currently displayed board of all none-"clue" values.
function boardClear() {
	clearMessages();
	for (var i = 0; i < 9; i++) {
		for (var j = 0; j < 9; j++) {
			var cell = document.getElementById(getCellId(i, j));
			if (defaultBackground === cell.style.background) {
				cell.value = "";
			}
		}
	}
}

// Generate a sudoku game. Currently this uses a fairly crude technique which
// seems to generate reasonable, albeit easy, games.
//
// The generator starts by placing each of the values [1, 9] in random locations
// on the board. It then attempts to solve the problem generating one or more
// valid complete sudoku solutions. The algorithm selects the first of these
// and then starts deleting cells in symmetric pairs (for cosmetic reasons).
// Each time a pair of cells are deleted the board is solved to ensure that it
// provides a unique solution.
//
// Due to the repeated solving, performance can get a little sluggish.  On
// modern desktops the generation will be instantaneous, on mid-range mobile
// devices the generation might take a second or two.
function generate() {
	clearMessages();
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
	if (results.length === 0) {
		error("Generation failed. Please try again.");
		return;
	}

	board = results[0];

	for (var num = 0; num < 25;) {
		var i = getRandomInt(0, 5);
		var j = getRandomInt(0, 9);

		if (getCell(board, i, j) === 0) {
			continue;
		}

		var tmp = board.slice();
		setCell(tmp, i, j, 0);
		setCell(tmp, 8 - i, j, 0);

		if (findResults(tmp, false).length === 1) {
			board = tmp;
			num++;	
		}
	}

	displayBoardVals(board);
	disableBoardVals();
}

// Goes through the displayed board and converts all the values to "clues" -
// giving them a grey background and making them read-only.
function disableBoardVals() {
	for (var i = 0; i < 9; i++) {
		for (var j = 0; j < 9; j++) {
			var cell = document.getElementById(getCellId(i, j));

			if (cell.value === "") {
				cell.style.color = "black";
				cell.style.background = "white";
				cell.onkeydown = function(e) {
					if (e.keyCode === 8 || e.keyCode === 46) {
						e.target.value = "";
						return false;
					}

					var value = e.keyCode - 48;
					if (value > 0 && value <= 9) {
						e.target.value = value;
					}
					return false;
				};
			} else {
				cell.style.color = "black";
				cell.style.background = clueBackground;
				cell.onkeydown = function() { return false };
			}
		}
	}
	
}

// Uses a backtracking algorithm to find solutions to the given sudoku board.  
// If exitAfterFirst is true it will not try to find all the possible results
// and instead will just return the first one it encountered.
// 
// The algorithm works by looking for the cell with the least possible values,
// based solely on the row, column and block the cell is in.  If the number of
// values is 0 then the board is a dead-end and cannot be solved. If the number
// is 1 then the value can simply be substituted into the board. If there is
// more than one possibility then two or more new boards are created and the
// algorithm repeats the process for each of them.
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
				if (getCell(board, i, j) === 0) {
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

// Figure out what values a cell could have based on its row, column and block.
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
		if (seen[v] === 0) {
			candidates.push(v);
		}
	}
	return candidates;
}

// Check if the board given represents a valid sudoku board or not.
function validate(board) {
	// Check all tiles can be assigned
	for (var j = 0; j < 9; j++) {
		for (var i = 0; i < 9; i++) {
			var candidates = getPossibleValues(board, i, j);
			if (candidates.length === 0) {
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

// Get the id for the input HTML for a cell.
function getCellId(i, j) {
	return "cell" + i + "_" + j;
}

// Generate the HTML representing the sudoku board.
function generateBoardHTML() {
	for (var j = 0; j < 9; j++) {
		for (var i = 0; i < 9; i++) {
			var blocki = Math.floor(i / 3);
			var blockj = Math.floor(j / 3);
			var block = document.getElementById("block" + blocki + "_" + blockj);
			
			if (i % 3 === 0) {
				block.innerHTML += '<div class="blockrow">'
			}
			var input = '<input type="text" pattern="[1-9]" class="cell" id="' +
			            getCellId(i, j) +
			            '"></input>';
			if (i % 3 === 2) {
				block.innerHTML += '</div>'
			}
			block.innerHTML += input;
		}
	}
}

// Generate an int between [min, max).
function getRandomInt(min, max) {
	return Math.floor(Math.random() * (max - min)) + min;
}

