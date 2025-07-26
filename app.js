'use strict';

const numberbox = document.getElementById("numberbox");
const slider = document.getElementById("slider");
const progressBar = document.getElementById("progress-bar");
const playButton = document.getElementById("play-button");
const pauseButton = document.getElementById("pause-button");
const commentBox = document.getElementById("comment-box");
const themeSwitch = document.getElementById("themeSwitch");

const queen = '<i class="fas fa-chess-queen" style="color:#000"></i>';

let n, speed, tempSpeed, q, Board = 0;
let paused = false;

const array = [0, 1, 0, 0, 2, 10, 4, 40, 92];
let pos = {};

speed = (100 - slider.value) * 10;
tempSpeed = speed;

slider.oninput = function () {
  progressBar.style.width = this.value + "%";
  speed = (100 - this.value) * 10;
};

themeSwitch.onchange = function () {
  document.body.classList.toggle("dark", this.checked);
};

function logMove(message, type) {
  const div = document.createElement("div");
  div.className = `comment-entry ${type}`;
  div.textContent = message;
  commentBox.insertBefore(div, commentBox.firstChild);
}

class Queen {
  constructor() {
    this.position = Object.assign({}, pos);
    this.uuid = [];
  }

  nQueen = async () => {
    Board = 0;
    this.position[`${Board}`] = {};
    numberbox.disabled = true;
    playButton.disabled = true;
    pauseButton.disabled = false;
    await this.solveQueen(Board, 0, n);
    await this.clearColor(Board);
    numberbox.disabled = false;
    playButton.disabled = false;
    pauseButton.disabled = true;
  };

  isValid = async (board, r, col, n) => {
    const table = document.getElementById(`table-${this.uuid[board]}`);
    const currentRow = table.firstChild.childNodes[r];
    const currentColumn = currentRow.getElementsByTagName("td")[col];
    currentColumn.innerHTML = queen;
    await this.delay();

    // Same column
    for (let i = r - 1; i >= 0; --i) {
      const row = table.firstChild.childNodes[i];
      const column = row.getElementsByTagName("td")[col];
      if (column.innerHTML == queen) {
        column.style.backgroundColor = "#FB5607";
        currentColumn.innerHTML = "-";
        logMove(`Rejected (${r}, ${col}) — Conflict in column`, "red");
        return false;
      }
    }

    // Upper left diagonal
    for (let i = r - 1, j = col - 1; i >= 0 && j >= 0; --i, --j) {
      const row = table.firstChild.childNodes[i];
      const column = row.getElementsByTagName("td")[j];
      if (column.innerHTML == queen) {
        column.style.backgroundColor = "#FB5607";
        currentColumn.innerHTML = "-";
        logMove(`Rejected (${r}, ${col}) — Conflict on left diagonal`, "red");
        return false;
      }
    }

    // Upper right diagonal
    for (let i = r - 1, j = col + 1; i >= 0 && j < n; --i, ++j) {
      const row = table.firstChild.childNodes[i];
      const column = row.getElementsByTagName("td")[j];
      if (column.innerHTML == queen) {
        column.style.backgroundColor = "#FB5607";
        currentColumn.innerHTML = "-";
        logMove(`Rejected (${r}, ${col}) — Conflict on right diagonal`, "red");
        return false;
      }
    }

    logMove(`Accepted (${r}, ${col})`, "green");
    return true;
  };

  clearColor = async (board) => {
    for (let j = 0; j < n; ++j) {
      const table = document.getElementById(`table-${this.uuid[board]}`);
      const row = table.firstChild.childNodes[j];
      for (let k = 0; k < n; ++k)
        (j + k) & 1
          ? (row.getElementsByTagName("td")[k].style.backgroundColor = "#FF9F1C")
          : (row.getElementsByTagName("td")[k].style.backgroundColor = "#FCCD90");
    }
  };

  delay = async () => {
    while (paused) await new Promise((res) => setTimeout(res, 100));
    await new Promise((done) => setTimeout(() => done(), speed));
  };

  solveQueen = async (board, r, n) => {
    if (r == n) {
      ++Board;
      let table = document.getElementById(`table-${this.uuid[Board]}`);
      for (let k = 0; k < n; ++k) {
        let row = table.firstChild.childNodes[k];
        row.getElementsByTagName("td")[this.position[board][k]].innerHTML = queen;
      }
      this.position[Board] = { ...this.position[board] };
      return;
    }

    for (let i = 0; i < n; ++i) {
      await this.delay();
      await this.clearColor(board);
      if (await this.isValid(board, r, i, n)) {
        await this.delay();
        await this.clearColor(board);
        let table = document.getElementById(`table-${this.uuid[board]}`);
        let row = table.firstChild.childNodes[r];
        row.getElementsByTagName("td")[i].innerHTML = queen;

        this.position[board][r] = i;

        if (await this.solveQueen(board, r + 1, n)) {
          await this.clearColor(board);
        }

        await this.delay();
        board = Board;
        table = document.getElementById(`table-${this.uuid[board]}`);
        row = table.firstChild.childNodes[r];
        row.getElementsByTagName("td")[i].innerHTML = "-";

        delete this.position[`${board}`][`${r}`];
      }
    }
  };
}

playButton.onclick = async function () {
  const chessBoard = document.getElementById("n-queen-board");
  const arrangement = document.getElementById("queen-arrangement");

  n = parseInt(numberbox.value);
  if (n > 8 || n < 1 || isNaN(n)) {
    alert("Please enter a number between 1 and 8");
    numberbox.value = "";
    return;
  }

  while (chessBoard.hasChildNodes()) chessBoard.removeChild(chessBoard.firstChild);
  if (arrangement.hasChildNodes()) arrangement.removeChild(arrangement.lastChild);
  commentBox.innerHTML = "";

  const para = document.createElement("p");
  para.setAttribute("class", "queen-info");
  para.innerHTML = `For ${n}x${n} board, ${array[n]} arrangements are possible.`;
  arrangement.appendChild(para);

  q = new Queen();

  for (let i = 0; i < array[n]; ++i) {
    q.uuid.push(Math.random());
    let div = document.createElement("div");
    let table = document.createElement("table");
    let header = document.createElement("h4");
    header.innerHTML = `Board ${i + 1}`;
    table.setAttribute("id", `table-${q.uuid[i]}`);
    header.setAttribute("id", `paragraph-${i}`);
    chessBoard.appendChild(div);
    div.appendChild(header);
    div.appendChild(table);
  }

  for (let k = 0; k < array[n]; ++k) {
    let table = document.getElementById(`table-${q.uuid[k]}`);
    for (let i = 0; i < n; ++i) {
      const row = table.insertRow(i);
      row.setAttribute("id", `Row${i}`);
      for (let j = 0; j < n; ++j) {
        const col = row.insertCell(j);
        (i + j) & 1
          ? (col.style.backgroundColor = "#FF9F1C")
          : (col.style.backgroundColor = "#FCCD90");
        col.innerHTML = "-";
        col.style.border = "0.3px solid #373f51";
      }
    }
    await q.clearColor(k);
  }

  paused = false;
  await q.nQueen();
};

pauseButton.onclick = function () {
  paused = !paused;
  pauseButton.innerHTML = paused
    ? '<i class="fa fa-play"></i> Resume'
    : '<i class="fa fa-pause"></i> Pause';
};
