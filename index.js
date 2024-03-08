const items = {
  flag: "🚩",
  bomb: "💣"
}

const RESULT_STATUS = {
  START: "START",
  NUMBER: 1,
  LOSE: "LOSE",
  WIN: "WIN"
}
const colorPalette = {
  1: 'green',
  2: 'blue',
  3: 'purple',
  4: 'darkorange',
  5: 'red',
  6: 'brown',
  7: 'black',
  8: 'gray'
}

let boardSize = 10 
const numberOfBombs = Math.floor((boardSize * boardSize) * 0.25)
let gameOver = false
const boardElement = document.querySelector(".board")
const bombInfo = document.getElementById("flag-left")
const resultInfo = document.getElementById("result-text")
const restartBtn = document.querySelector(".restart")
resultInfo.textContent = RESULT_STATUS.START

const generateCell = (row, column) => {
  const cell = document.createElement('div')
  cell.classList.add('cell')
  cell.dataset.idRow = row
  cell.dataset.idCol = column
  return cell
}

const generateBombs = (boardSize, numberOfBombs) => {
  const bombs = []
  while (bombs.length < numberOfBombs) {
    const row = Math.floor(Math.random() * boardSize)
    const column = Math.floor(Math.random() * boardSize)
    if (!bombs.some(bomb => bomb.row === row && bomb.column === column)) {
      bombs.push({ row, column })
    }
  }
  return bombs
}

const placeBombs = (board, bombs) => {
  bombs.forEach(bomb => {
    const cell = board.querySelector(`[data-id-row="${bomb.row}"][data-id-col="${bomb.column}"]`)
    cell.dataset.bomb = true
  })
}

const revealAllBombs = (board) => {
  board.querySelectorAll('.cell').forEach(cell => {
    if (cell.dataset.bomb === 'true') {
      cell.textContent = items.bomb
    }
  })
}

const generateBoard = (boardSize, boardElement) => {
  boardElement.innerHTML = ''
  gameOver = false

  Array.from({ length: boardSize }).forEach((_, i) => {
    const row = document.createElement('div')
    row.classList.add('row')

    Array.from({ length: boardSize }).forEach((_, j) => {
      const cell = generateCell(i, j)
      row.appendChild(cell)
    })

    boardElement.appendChild(row)
  })
}

const checkVictory = (board) => {
  const cells = board.querySelectorAll('.cell')
  const unopenedSafeCells = Array.from(cells).filter(cell => !cell.classList.contains('opened') && cell.dataset.bomb !== 'true')

  if (unopenedSafeCells.length === 0) {
    gameOver = true
    resultInfo.textContent = RESULT_STATUS.WIN
    revealAllBombs(board)
  }
}

const handleCellClick = (cell, board) => {
  if (gameOver || cell.classList.contains('opened')){
    return
  } 
  const row = parseInt(cell.dataset.idRow)
  const column = parseInt(cell.dataset.idCol)
  const bomb = cell.dataset.bomb === 'true'

  if (bomb) {
    gameOver = true
    resultInfo.textContent = RESULT_STATUS.LOSE
    revealAllBombs(boardElement)
  } else {
    resultInfo.textContent = RESULT_STATUS.NUMBER++
    openEmptyCells(board, row, column)
    checkVictory(board)
  }
}

const openEmptyCells = (board, row, column) => {
  const cell = board.querySelector(`[data-id-row="${row}"][data-id-col="${column}"]`)
  
  if (!cell || cell.dataset.bomb === 'true' || cell.classList.contains('opened')) {
    return
  }

  const numberOfBombsAround = getNumberOfBombsAround(board, row, column)
  if (numberOfBombsAround > 0) {
    cell.textContent = numberOfBombsAround
    cell.style.color = colorPalette[numberOfBombsAround]
    cell.classList.add("opened")
  } else {
    cell.classList.add('opened')

    for (let i = -1; i <= 1; i++) {
      for (let j = -1; j <= 1; j++) {
        openEmptyCells(board, row + i, column + j)
      }
    }
  }
}

const getNumberOfBombsAround = (board, row, column) => {
  let count = 0
  const cellsAround = getCellsAround(board, row, column)
  cellsAround.forEach(cell => {
    if (cell.dataset.bomb === 'true') {
      count++
    }
  })
  return count
}

const getCellsAround = (board, row, column) => {
  const cells = []
  for (let i = -1; i <= 1; i++) {
    for (let j = -1; j <= 1; j++) {
      if (i === 0 && j === 0){
        continue
      } 
      const cell = board.querySelector(`[data-id-row="${row + i}"][data-id-col="${column + j}"]`)
      if (cell) {
        cells.push(cell)
      }
    }
  }
  return cells
}

const addCellClickHandler = (board) => {
  board.querySelectorAll('.cell').forEach(cell => {
    cell.addEventListener('click', () => {
      handleCellClick(cell, board)
    })

    cell.addEventListener('contextmenu', (event) => {
      event.preventDefault()

      if (!gameOver) {
        toggleFlag(cell)
      }
    })
  })
}

const toggleFlag = (cell) => {
  if (cell.classList.contains('opened') || gameOver) {
    return
  }

  const currentText = cell.textContent
  cell.textContent = currentText === items.flag ? '' : items.flag
}

const startGame = () => {
  const bombs = generateBombs(boardSize, numberOfBombs)
  generateBoard(boardSize, boardElement)
  placeBombs(boardElement, bombs)
  addCellClickHandler(boardElement)
  updateBombInfo(numberOfBombs)
}

const updateBombInfo = (numberOfBombs) => {
  bombInfo.textContent = `${numberOfBombs}`
}

const restartGame = () => {
  resultInfo.textContent = RESULT_STATUS.START
  gameOver = false
  RESULT_STATUS.NUMBER = 1

  const cells = boardElement.querySelectorAll('.cell')
  cells.forEach(cell => {
    cell.textContent = ''
    cell.classList.remove('opened')
    delete cell.dataset.bomb
  })

  const bombs = generateBombs(boardSize, numberOfBombs)
  placeBombs(boardElement, bombs)
  updateBombInfo(numberOfBombs)
}

restartBtn.addEventListener("click", restartGame)

startGame()
