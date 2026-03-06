import React, { useState, useEffect, useCallback } from "react";

const MatchGame = () => {
  const GRID_SIZE = 7;

  const [grid, setGrid] = useState([]);
  const [moves, setMoves] = useState(8);
  const [score, setScore] = useState(0);
  const [selectedCells, setSelectedCells] = useState([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [basketPosition, setBasketPosition] = useState(null);
  const [stars, setStars] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [reshuffleChances, setReshuffleChances] = useState(3);
  const [canReshuffle, setCanReshuffle] = useState(false);
  const [magicFlowerPos, setMagicFlowerPos] = useState(null);

  useEffect(() => {
    initializeGame();
  }, []);

  const initializeGame = () => {
    const randomRow = Math.floor(Math.random() * GRID_SIZE);
    const randomCol = Math.floor(Math.random() * GRID_SIZE);

    let magicRow, magicCol;
    do {
      magicRow = Math.floor(Math.random() * GRID_SIZE);
      magicCol = Math.floor(Math.random() * GRID_SIZE);
    } while (magicRow === randomRow && magicCol === randomCol);

    const normalTypes = ["butterfly", "fish", "flower", "crystal", "star"];
    const newGrid = Array(GRID_SIZE)
      .fill(null)
      .map((_, i) =>
        Array(GRID_SIZE)
          .fill(null)
          .map((_, j) => {
            if (i === randomRow && j === randomCol) {
              return null;
            }
            if (i === magicRow && j === magicCol) {
              return {
                type: "magic_flower",
                id: Math.random(),
                isMatching: false,
              };
            }
            return {
              type: normalTypes[Math.floor(Math.random() * normalTypes.length)],
              id: Math.random(),
              isMatching: false,
            };
          }),
      );

    setBasketPosition({ row: randomRow, col: randomCol });
    setMagicFlowerPos({ row: magicRow, col: magicCol });
    setGrid(newGrid);
    setMoves(8);
    setScore(0);
    setSelectedCells([]);
    setGameOver(false);
    setGameWon(false);
    setStars(0);
    setReshuffleChances(3);

    checkIfCanReshuffle(newGrid, randomRow, randomCol);
  };

  const getItemEmoji = (type) => {
    const emojis = {
      butterfly: "🚗",
      fish: "🐟",
      flower: "🍎",
      crystal: "❄️",
      star: "⭐",
      magic_flower: "🌺",
    };
    return emojis[type] || "●";
  };

  const checkIfCanReshuffle = (gridData, basketRow, basketCol) => {
    const directions = [
      [-1, -1],
      [-1, 0],
      [-1, 1],
      [0, -1],
      [0, 1],
      [1, -1],
      [1, 0],
      [1, 1],
    ];

    const adjacentCells = [];
    directions.forEach(([dRow, dCol]) => {
      const newRow = basketRow + dRow;
      const newCol = basketCol + dCol;
      if (
        newRow >= 0 &&
        newRow < GRID_SIZE &&
        newCol >= 0 &&
        newCol < GRID_SIZE
      ) {
        if (gridData[newRow][newCol]) {
          adjacentCells.push({
            row: newRow,
            col: newCol,
            item: gridData[newRow][newCol],
          });
        }
      }
    });

    let hasThreeConnected = false;
    const typeMap = {};
    adjacentCells.forEach((cell) => {
      const type = cell.item.type;
      if (!typeMap[type]) typeMap[type] = [];
      typeMap[type].push(cell);
    });

    Object.keys(typeMap).forEach((type) => {
      if (typeMap[type].length >= 3) {
        hasThreeConnected = true;
      }
    });

    setCanReshuffle(!hasThreeConnected);
  };

  const isAdjacent = (cell1, cell2) => {
    const rowDiff = Math.abs(cell1.row - cell2.row);
    const colDiff = Math.abs(cell1.col - cell2.col);
    return rowDiff <= 1 && colDiff <= 1 && (rowDiff !== 0 || colDiff !== 0);
  };

  const handleCellClick = (row, col) => {
    if (isAnimating || gameOver || gameWon) return;
    if (basketPosition?.row === row && basketPosition?.col === col) return;

    const cellItem = grid[row][col];
    if (!cellItem) return;

    const isSelected = selectedCells.some(
      (cell) => cell.row === row && cell.col === col,
    );

    if (isSelected) {
      setSelectedCells(
        selectedCells.filter((cell) => !(cell.row === row && cell.col === col)),
      );
    } else {
      if (selectedCells.length === 0) {
        if (!isAdjacent(basketPosition, { row, col })) {
          return;
        }
        setSelectedCells([{ row, col }]);
      } else {
        const lastSelected = selectedCells[selectedCells.length - 1];
        const firstSelectedItem =
          grid[selectedCells[0].row][selectedCells[0].col];
        const firstSelectedType = firstSelectedItem?.type;
        const currentType = cellItem.type;

        if (!isAdjacent(lastSelected, { row, col })) {
          return;
        }

        const hasMagicFlower = selectedCells.some(
          (cell) => grid[cell.row][cell.col]?.type === "magic_flower",
        );

        if (
          hasMagicFlower &&
          firstSelectedType === "magic_flower" &&
          currentType !== "magic_flower"
        ) {
          setSelectedCells([...selectedCells, { row, col }]);
        } else if (
          currentType === firstSelectedType ||
          currentType === "magic_flower" ||
          firstSelectedType === "magic_flower"
        ) {
          setSelectedCells([...selectedCells, { row, col }]);
        } else {
          return;
        }
      }
    }
  };

  const performMatch = () => {
    if (selectedCells.length < 3) return;
    if (isAnimating) return;

    const hasMagicFlower = selectedCells.some(
      (cell) => grid[cell.row][cell.col]?.type === "magic_flower",
    );

    let targetType = null;
    for (let cell of selectedCells) {
      const itemType = grid[cell.row][cell.col]?.type;
      if (itemType !== "magic_flower") {
        targetType = itemType;
        break;
      }
    }

    if (!targetType) {
      alert("无法消除！");
      return;
    }

    const allValid = selectedCells.every((cell) => {
      const itemType = grid[cell.row][cell.col]?.type;
      return itemType === targetType || itemType === "magic_flower";
    });

    if (!allValid) {
      alert("请选择相同类型的物品！");
      return;
    }

    setIsAnimating(true);

    const newGrid = grid.map((row) => [...row]);
    selectedCells.forEach(({ row, col }) => {
      if (newGrid[row][col]) {
        if (newGrid[row][col].type === "magic_flower") {
          newGrid[row][col].displayType = targetType;
        }
        newGrid[row][col].isMatching = true;
      }
    });

    setGrid(newGrid);
    setSelectedCells([]);

    setTimeout(() => {
      let gridAfterRemoval = newGrid.map((row) => [...row]);
      let lastRemovedCell = selectedCells[selectedCells.length - 1];

      selectedCells.forEach(({ row, col }) => {
        gridAfterRemoval[row][col] = null;
      });

      let newBasketPos = { ...lastRemovedCell };

      for (let col = 0; col < GRID_SIZE; col++) {
        const removedRows = selectedCells
          .filter((cell) => cell.col === col)
          .map((cell) => cell.row)
          .sort((a, b) => a - b);

        if (removedRows.length === 0) continue;

        let items = [];

        for (let row = 0; row < GRID_SIZE; row++) {
          if (gridAfterRemoval[row][col] !== null) {
            items.push(gridAfterRemoval[row][col]);
          }
        }

        for (let row = 0; row < GRID_SIZE; row++) {
          gridAfterRemoval[row][col] = null;
        }

        for (let i = 0; i < items.length; i++) {
          gridAfterRemoval[GRID_SIZE - 1 - i][col] = items[i];
        }

        const normalTypes = ["butterfly", "fish", "flower", "crystal", "star"];
        let magicFlowerGenerated =
          magicFlowerPos &&
          !selectedCells.some(
            (cell) =>
              cell.row === magicFlowerPos.row &&
              cell.col === magicFlowerPos.col,
          );

        for (let row = 0; row < GRID_SIZE; row++) {
          if (
            gridAfterRemoval[row][col] === null &&
            !(newBasketPos.row === row && newBasketPos.col === col)
          ) {
            if (!magicFlowerGenerated && Math.random() < 0.1) {
              gridAfterRemoval[row][col] = {
                type: "magic_flower",
                id: Math.random(),
                isMatching: false,
              };
              setMagicFlowerPos({ row, col });
              magicFlowerGenerated = true;
            } else {
              gridAfterRemoval[row][col] = {
                type: normalTypes[
                  Math.floor(Math.random() * normalTypes.length)
                ],
                id: Math.random(),
                isMatching: false,
              };
            }
          }
        }
      }

      const newScore = score + selectedCells.length * 100;
      setScore(newScore);
      setMoves(moves - 1);

      if (newScore >= 3000) setStars(3);
      else if (newScore >= 2000) setStars(2);
      else if (newScore >= 1000) setStars(1);
      else setStars(0);

      if (moves - 1 <= 0) {
        setGameOver(true);
        setGameWon(newScore >= 1000);
      }

      setGrid(gridAfterRemoval);
      setBasketPosition(newBasketPos);
      setIsAnimating(false);

      checkIfCanReshuffle(gridAfterRemoval, newBasketPos.row, newBasketPos.col);
    }, 500);
  };

  const handleReshuffle = () => {
    if (reshuffleChances <= 0) {
      alert("洗牌机会已用尽！");
      return;
    }

    if (!canReshuffle) {
      alert("篮子周围有可消除的物品，无法洗牌！");
      return;
    }

    const newGrid = grid.map((row) => [...row]);
    const normalTypes = ["butterfly", "fish", "flower", "crystal", "star"];

    for (let i = 0; i < GRID_SIZE; i++) {
      for (let j = 0; j < GRID_SIZE; j++) {
        if (
          !(basketPosition.row === i && basketPosition.col === j) &&
          !(magicFlowerPos.row === i && magicFlowerPos.col === j) &&
          newGrid[i][j]
        ) {
          newGrid[i][j].type =
            normalTypes[Math.floor(Math.random() * normalTypes.length)];
          newGrid[i][j].id = Math.random();
        }
      }
    }

    setGrid(newGrid);
    setReshuffleChances(reshuffleChances - 1);
    setSelectedCells([]);
    checkIfCanReshuffle(newGrid, basketPosition.row, basketPosition.col);
  };

  if (!grid.length) {
    return (
      <div style={{ textAlign: "center", marginTop: "50px", fontSize: "20px" }}>
        加载中...
      </div>
    );
  }

  const styles = {
    container: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "100vh",
      backgroundImage: "linear-gradient(to bottom, #fce7f3, #f3e8ff)",
      padding: "20px",
      fontFamily: "'Comic Sans MS', cursive",
    },
    topUI: {
      width: "100%",
      maxWidth: "600px",
      marginBottom: "24px",
    },
    statsRow: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "16px",
      fontSize: "20px",
      fontWeight: "bold",
      gap: "16px",
    },
    statBox: {
      padding: "12px 20px",
      borderRadius: "12px",
      backgroundColor: "#fcd34d",
      border: "3px solid #fbbf24",
      boxShadow: "0 4px 0 rgba(0,0,0,0.15)",
      flex: 1,
      textAlign: "center",
    },
    starsContainer: {
      display: "flex",
      gap: "8px",
      alignItems: "center",
    },
    targetBox: {
      backgroundColor: "#f472b6",
      borderRadius: "12px",
      padding: "16px 32px",
      border: "4px solid #ec4899",
      boxShadow: "0 4px 0 rgba(0,0,0,0.15)",
      marginBottom: "16px",
      textAlign: "center",
      fontSize: "14px",
      fontWeight: "bold",
      color: "#4b5563",
    },
    gameGrid: {
      backgroundColor: "#white",
      borderRadius: "20px",
      padding: "32px",
      border: "8px solid #fbbf24",
      boxShadow: "0 8px 0 rgba(0,0,0,0.2)",
      marginBottom: "32px",
    },
    grid: {
      display: "grid",
      gridTemplateColumns: "repeat(7, 60px)",
      gap: "8px",
      backgroundColor: "#fef3c7",
      padding: "24px",
      borderRadius: "16px",
    },
    cell: {
      width: "60px",
      height: "60px",
      borderRadius: "8px",
      border: "2px solid #f59e0b",
      backgroundColor: "#fef3c7",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "28px",
      cursor: "pointer",
      transition: "all 0.2s",
      fontWeight: "bold",
    },
    cellSelected: {
      backgroundColor: "#fcd34d",
      border: "2px solid #fbbf24",
      transform: "scale(1.05)",
      boxShadow: "0 0 15px rgba(255, 215, 0, 0.6)",
    },
    cellBasket: {
      backgroundColor: "#fed7aa",
      border: "4px solid #ea580c",
      boxShadow:
        "0 0 20px rgba(234, 88, 12, 0.8), inset 0 0 10px rgba(234, 88, 12, 0.3)",
      fontSize: "36px",
      fontWeight: "bold",
    },
    cellMatching: {
      opacity: 0.5,
      transform: "scale(0.5)",
    },
    buttonRow: {
      display: "flex",
      gap: "16px",
      marginBottom: "16px",
    },
    button: {
      padding: "12px 24px",
      borderRadius: "12px",
      border: "none",
      fontWeight: "bold",
      fontSize: "16px",
      cursor: "pointer",
      transition: "all 0.2s",
      color: "white",
    },
    buttonPrimary: {
      backgroundImage: "linear-gradient(to bottom, #4ade80, #22c55e)",
      border: "4px solid #16a34a",
    },
    buttonSecondary: {
      backgroundImage: "linear-gradient(to bottom, #a78bfa, #9333ea)",
      border: "4px solid #7e22ce",
    },
    buttonDisabled: {
      backgroundColor: "#d1d5db",
      cursor: "not-allowed",
    },
    modal: {
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 50,
    },
    modalContent: {
      backgroundColor: "white",
      borderRadius: "24px",
      padding: "32px",
      textAlign: "center",
      boxShadow: "0 20px 25px rgba(0,0,0,0.15)",
    },
    modalTitle: {
      fontSize: "36px",
      marginBottom: "16px",
      marginTop: "16px",
      fontWeight: "bold",
    },
    modalScore: {
      fontSize: "18px",
      marginBottom: "24px",
      color: "#6b7280",
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.topUI}>
        <div style={styles.statsRow}>
          <div style={styles.statBox}>
            <div style={{ fontSize: "12px" }}>步数</div>
            <div style={{ fontSize: "28px", fontWeight: "black" }}>{moves}</div>
          </div>
          <div style={styles.statBox}>
            <div style={{ fontSize: "12px" }}>分数</div>
            <div style={{ fontSize: "28px", fontWeight: "black" }}>{score}</div>
          </div>
          <div style={styles.starsContainer}>
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                style={{
                  fontSize: "36px",
                  opacity: i < stars ? 1 : 0.3,
                  transform: i < stars ? "scale(1)" : "scale(0.75)",
                  animation: i < stars ? "bounce 0.6s infinite" : "none",
                }}
              >
                ⭐
              </span>
            ))}
          </div>
        </div>
      </div>

      <div style={styles.targetBox}>再收集更多物品来获得星星！</div>

      <div style={styles.gameGrid}>
        <div style={styles.grid}>
          {grid.map((row, i) =>
            row.map((item, j) => {
              const isBasket =
                basketPosition?.row === i && basketPosition?.col === j;
              const isSelected = selectedCells.some(
                (cell) => cell.row === i && cell.col === j,
              );

              let cellStyle = { ...styles.cell };
              if (isBasket) {
                cellStyle = { ...cellStyle, ...styles.cellBasket };
              } else if (isSelected) {
                cellStyle = { ...cellStyle, ...styles.cellSelected };
              }
              if (item?.isMatching) {
                cellStyle = { ...cellStyle, ...styles.cellMatching };
              }

              return (
                <button
                  key={`${i}-${j}`}
                  onClick={() => handleCellClick(i, j)}
                  style={cellStyle}
                  disabled={isAnimating || isBasket}
                >
                  <span
                    style={{
                      animation:
                        item?.type === "magic_flower"
                          ? "bounce 0.6s infinite"
                          : "none",
                    }}
                  >
                    {isBasket ? "🧺" : item ? getItemEmoji(item.type) : ""}
                  </span>
                </button>
              );
            }),
          )}
        </div>
      </div>

      <div style={styles.buttonRow}>
        <button
          onClick={performMatch}
          disabled={selectedCells.length < 3 || isAnimating}
          style={{
            ...styles.button,
            ...(selectedCells.length >= 3
              ? styles.buttonPrimary
              : styles.buttonDisabled),
          }}
        >
          🎯 消除 ({selectedCells.length}/3+)
        </button>

        <button
          onClick={handleReshuffle}
          disabled={!canReshuffle || reshuffleChances <= 0 || isAnimating}
          style={{
            ...styles.button,
            ...(canReshuffle && reshuffleChances > 0
              ? styles.buttonSecondary
              : styles.buttonDisabled),
          }}
        >
          🔀 洗牌 ({reshuffleChances}/3)
        </button>

        <button
          onClick={initializeGame}
          style={{
            ...styles.button,
            backgroundImage: "linear-gradient(to bottom, #f472b6, #ec4899)",
            border: "4px solid #be185d",
          }}
        >
          🔄 重新开始
        </button>

        <button
          onClick={() => window.location.reload()}
          style={{
            ...styles.button,
            backgroundImage: "linear-gradient(to bottom, #9ca3af, #6b7280)",
            border: "4px solid #374151",
          }}
        >
          🚪 退出
        </button>
      </div>

      {gameOver && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            {gameWon ? (
              <>
                <div style={{ fontSize: "64px" }}>😄</div>
                <div style={{ ...styles.modalTitle, color: "#16a34a" }}>
                  过关!
                </div>
                <div style={styles.modalScore}>
                  最终得分:{" "}
                  <span style={{ fontWeight: "bold", color: "#ec4899" }}>
                    {score}
                  </span>
                </div>
                <div
                  style={{
                    display: "flex",
                    gap: "16px",
                    justifyContent: "center",
                  }}
                >
                  <button
                    onClick={initializeGame}
                    style={{
                      ...styles.button,
                      backgroundImage:
                        "linear-gradient(to bottom, #4ade80, #22c55e)",
                      border: "4px solid #16a34a",
                    }}
                  >
                    🔄 重新开始
                  </button>
                  <button
                    onClick={initializeGame}
                    style={{
                      ...styles.button,
                      backgroundImage:
                        "linear-gradient(to bottom, #a78bfa, #9333ea)",
                      border: "4px solid #7e22ce",
                    }}
                  >
                    ▶️ 下一局
                  </button>
                </div>
              </>
            ) : (
              <>
                <div style={{ fontSize: "64px" }}>😭</div>
                <div style={{ ...styles.modalTitle, color: "#dc2626" }}>
                  失败
                </div>
                <div style={styles.modalScore}>
                  最终得分:{" "}
                  <span style={{ fontWeight: "bold", color: "#ec4899" }}>
                    {score}
                  </span>
                </div>
                <div
                  style={{
                    display: "flex",
                    gap: "16px",
                    justifyContent: "center",
                  }}
                >
                  <button
                    onClick={initializeGame}
                    style={{
                      ...styles.button,
                      backgroundImage:
                        "linear-gradient(to bottom, #4ade80, #22c55e)",
                      border: "4px solid #16a34a",
                    }}
                  >
                    🔄 重新开始
                  </button>
                  <button
                    onClick={() => window.location.reload()}
                    style={{
                      ...styles.button,
                      backgroundImage:
                        "linear-gradient(to bottom, #9ca3af, #6b7280)",
                      border: "4px solid #374151",
                    }}
                  >
                    🚪 退出
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
      `}</style>
    </div>
  );
};

export default MatchGame;
