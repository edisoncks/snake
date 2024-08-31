import React, { useEffect, useState } from "react";
import { Box, Text, render, useApp, useInput } from "ink";
import { clearInterval, setInterval } from "node:timers";
import { getConfig, Speed, toggleSpeed } from "./config.js";
import { SPRITES } from "./constants.js";
import {
  getSnakeNextPosition,
  getState,
  moveSnakeToPosition,
  Position,
  resetApplePosition,
  resetState,
  setCurrentDirection,
  setGameEnded,
  setGameHasRunOnce,
  setNextDirection,
  setScore,
  setTicker,
} from "./state.js";

const CELL_WIDTH = 2;
const CELL_HEIGHT = 1;
const TIMER_SPEED: Record<Speed, number> = {
  fast: 50,
  medium: 100,
  slow: 200,
};

const getDefaultMap = (
  columns: number,
  rows: number,
  applePosition: Position,
  snakePositions: Position[],
): string[][] => {
  const map: string[][] = [];
  for (let x = 0; x < columns; x++) {
    const mapCol: string[] = [];
    for (let y = 0; y < rows; y++) {
      mapCol.push(
        x == 0 || y == 0 || x + 1 == columns || y + 1 == rows
          ? SPRITES.wall
          : SPRITES.void,
      );
    }
    map.push(mapCol);
  }
  map[applePosition.x][applePosition.y] = SPRITES.apple;
  for (const pos of snakePositions) {
    map[pos.x][pos.y] = SPRITES.snake;
  }
  return map;
};

const Game = (): React.JSX.Element => {
  const { exit } = useApp();

  const [gameState, setGameState] = useState({
    gameEnded: true,
    gameHasRunOnce: false,
    map: [] as string[][],
    score: 0,
    speed: getConfig().speed,
  });

  const tick = () => {
    const { width, height } = getConfig();
    const {
      applePosition,
      gameEnded,
      nextDirection,
      score,
      snakePositions,
      ticker,
    } = getState();
    if (gameEnded) {
      stopTicker();
      return;
    }
    const snakeNextPosition = getSnakeNextPosition(nextDirection);
    const snakeTailPosition = snakePositions.slice(-1)[0];
    const hasHitWall =
      snakeNextPosition.x === 0 ||
      snakeNextPosition.y === 0 ||
      snakeNextPosition.x + 1 === width ||
      snakeNextPosition.y + 1 === height;
    const hasHitSnake =
      snakePositions.find(
        (pos) => pos.x === snakeNextPosition.x && pos.y === snakeNextPosition.y,
      ) !== undefined;
    const hasEatenApple =
      snakeNextPosition.x === applePosition.x &&
      snakeNextPosition.y === applePosition.y;
    const newSnakePositions =
      hasHitWall || hasHitSnake
        ? snakePositions
        : moveSnakeToPosition(snakeNextPosition, hasEatenApple);
    const newApplePosition = hasEatenApple
      ? resetApplePosition(width, height)
      : applePosition;
    setGameEnded(hasHitWall || hasHitSnake);
    setScore(hasEatenApple ? score + 100 : score);
    setCurrentDirection(nextDirection);
    setGameState((prevGameState) => {
      const gameState = { ...prevGameState };
      const { gameEnded, score } = getState();
      gameState.map[snakeTailPosition.x][snakeTailPosition.y] = SPRITES.void;
      gameState.map[newApplePosition.x][newApplePosition.y] = SPRITES.apple;
      for (const pos of newSnakePositions) {
        gameState.map[pos.x][pos.y] = SPRITES.snake;
      }
      gameState.score = score;
      gameState.gameEnded = gameEnded;
      return gameState;
    });
  };

  const changeSpeed = () => {
    const speed = toggleSpeed();
    setScore(0);
    setGameState((prevGameState) => {
      const gameState = { ...prevGameState, score: 0, speed };
      return gameState;
    });
  };

  const resetGameState = () => {
    const { width, height } = getConfig();
    resetState(width, height);
    setGameState((prevGameState) => {
      const gameState = { ...prevGameState };
      const { applePosition, snakePositions } = getState();
      gameState.map = getDefaultMap(
        width,
        height,
        applePosition,
        snakePositions,
      );
      gameState.score = 0;
      gameState.gameEnded = false;
      return gameState;
    });
  };

  const startTicker = () => {
    const { speed } = getConfig();
    setTicker(
      setInterval(() => {
        tick();
      }, TIMER_SPEED[speed]),
    );
    setGameHasRunOnce(true);
    setGameState((prevGameState) => {
      const gameState = { ...prevGameState, gameHasRunOnce: true };
      return gameState;
    });
  };

  const stopTicker = () => {
    const { ticker } = getState();
    if (ticker) clearInterval(ticker);
  };

  const stopGame = () => {
    setGameEnded(true);
    stopTicker();
  };

  const restartGame = () => {
    stopTicker();
    resetGameState();
    startTicker();
  };

  useEffect(() => {
    resetGameState();
  }, []);

  const exitGame = () => {
    stopGame();
    exit();
    process.exit();
  };

  useInput((input, key) => {
    const { gameEnded, gameHasRunOnce } = getState();
    if (input === "d" || key.rightArrow) setNextDirection("right");
    if (input === "a" || key.leftArrow) setNextDirection("left");
    if (input === "s" || key.downArrow) setNextDirection("down");
    if (input === "w" || key.upArrow) setNextDirection("up");
    if (input === "e" && (gameEnded || !gameHasRunOnce)) changeSpeed();
    if (key.return && !gameHasRunOnce) startTicker();
    if (input === "r" && gameHasRunOnce) restartGame();
    if (input === "q") exitGame();
  });

  return (
    <Box flexDirection="column" alignItems="center" justifyContent="center">
      <Box width={getConfig().width * CELL_WIDTH} marginTop={1}>
        {gameState.map.map((mapCol, x) => (
          <Box key={`col_${x}`} width={CELL_WIDTH} flexDirection="column">
            {mapCol.map((cell, y) => (
              <Box key={`row_${y}`} height={CELL_HEIGHT}>
                <Text
                  color={
                    cell == SPRITES.apple
                      ? "redBright"
                      : cell == SPRITES.snake
                        ? "greenBright"
                        : "whiteBright"
                  }
                >
                  {cell}
                </Text>
              </Box>
            ))}
          </Box>
        ))}
      </Box>
      <Box>
        {!gameState.gameEnded && gameState.gameHasRunOnce && (
          <Text color={"blueBright"}>{`[←↑↓→]/[WASD] Move   `}</Text>
        )}
        {(gameState.gameEnded || !gameState.gameHasRunOnce) && (
          <Text color={"blueBright"}>{`[E] Change Speed   `}</Text>
        )}
        {!gameState.gameHasRunOnce && (
          <Text color={"blueBright"}>{`[↵] Start   `}</Text>
        )}
        {gameState.gameHasRunOnce && (
          <Text color={"blueBright"}>{`[R] Restart   `}</Text>
        )}
        <Text color={"blueBright"}>{`[Q] Quit`}</Text>
      </Box>
      <Box>
        <Text>{`Speed: `}</Text>
        <Text color={"greenBright"}>{`${gameState.speed}   `}</Text>
        <Text>{`Score: `}</Text>
        <Text color={"greenBright"}>{`${gameState.score}`}</Text>
      </Box>
      <Box display={gameState.gameEnded ? "flex" : "none"}>
        <Text color={"redBright"}>Game over!</Text>
      </Box>
    </Box>
  );
};

export const renderGame = () => {
  render(<Game />);
};
