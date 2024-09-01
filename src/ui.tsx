import React, { useEffect, useReducer, useState } from "react";
import { Box, Text, render, useApp, useInput } from "ink";
import { CELL_HEIGHT, CELL_WIDTH, SPRITES, TIMER_SPEED } from "./constants.js";
import {
  changeDirection,
  getApplePosition,
  getHeight,
  getIsGameRunningFlag,
  getSnakePositions,
  getSpeed,
  getWidth,
  Position,
  setOnAppleRespawnHandler,
  setOnGameStartHandler,
  setOnGameStopHandler,
  setOnScoreUpdateHandler,
  setOnSnakeHitSelfHandler,
  setOnSnakeHitWallHandler,
  setOnSnakeMoveHandler,
  setSpeed,
  Speed,
  startGame,
  stopGame,
  tick,
} from "./core.js";
import { setInterval } from "timers";

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

const GameUI = () => {
  const { exit } = useApp();

  const [_, forceRerender] = useReducer((x) => x + 1, 0);

  const [state, setState] = useState({
    map: [] as string[][],
    score: 0,
    isGameRunning: false,
    isGameOver: false,
    ticker: undefined as NodeJS.Timeout | undefined,
  });

  const onAppleRespawn = (position: Position) => {
    // Render new apple position
    setState((state) => {
      state.map[position.x][position.y] = SPRITES.apple;
      return { ...state };
    });
  };

  const onGameStart = (applePosition: Position, snakePositions: Position[]) => {
    setState((state) => ({
      ...state,
      map: state.isGameOver
        ? getDefaultMap(getWidth(), getHeight(), applePosition, snakePositions)
        : state.map,
      isGameRunning: true,
      isGameOver: false,
      ticker: setInterval(() => {
        tick();
      }, TIMER_SPEED[getSpeed()]),
    }));
  };

  const onGameStop = () => {
    setState((state) => {
      if (state.ticker) clearInterval(state.ticker);
      return { ...state, isGameRunning: false, ticker: undefined };
    });
  };

  const onScoreUpdate = (score: number) => {
    setState((state) => ({ ...state, score }));
  };

  const onSnakeMove = (
    oldSnakePositions: Position[],
    newSnakePositions: Position[],
  ) => {
    // Render new snake positions
    setState((state) => {
      for (const pos of oldSnakePositions) {
        state.map[pos.x][pos.y] = SPRITES.void;
      }
      for (const pos of newSnakePositions) {
        state.map[pos.x][pos.y] = SPRITES.snake;
      }
      return { ...state };
    });
  };

  const onSnakeHitSelf = () => {
    setState((state) => ({ ...state, isGameOver: true }));
  };

  const onSnakeHitWall = () => {
    setState((state) => ({ ...state, isGameOver: true }));
  };

  useEffect(() => {
    // Render map on mount
    setState((state) => ({
      ...state,
      map: getDefaultMap(
        getWidth(),
        getHeight(),
        getApplePosition(),
        getSnakePositions(),
      ),
    }));
    // Assign handlers to game events
    setOnAppleRespawnHandler(onAppleRespawn);
    setOnGameStartHandler(onGameStart);
    setOnGameStopHandler(onGameStop);
    setOnScoreUpdateHandler(onScoreUpdate);
    setOnSnakeMoveHandler(onSnakeMove);
    setOnSnakeHitSelfHandler(onSnakeHitSelf);
    setOnSnakeHitWallHandler(onSnakeHitWall);
  }, []);

  useInput((input, key) => {
    if (input === "w" || key.upArrow) changeDirection("up");
    if (input === "a" || key.leftArrow) changeDirection("left");
    if (input === "s" || key.downArrow) changeDirection("down");
    if (input === "d" || key.rightArrow) changeDirection("right");
    if (input === "e" && !getIsGameRunningFlag()) {
      const mapping: Record<Speed, Speed> = {
        slow: "medium",
        medium: "fast",
        fast: "slow",
      };
      setSpeed(mapping[getSpeed()]);
      setState((state) => ({ ...state, score: 0 }));
      forceRerender();
    }
    if (input === "n" && !getIsGameRunningFlag()) {
      stopGame();
      startGame();
    }
    if (input === "q") {
      stopGame();
      exit();
      process.exit();
    }
  });

  return (
    <Box flexDirection="column" alignItems="center" justifyContent="center">
      <Box width={getWidth() * CELL_WIDTH} marginTop={1}>
        {state.map.map((mapCol, x) => (
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
        {state.isGameRunning && (
          <Text color={"blueBright"}>{`[←↑↓→]/[WASD] Move   `}</Text>
        )}
        {!state.isGameRunning && (
          <Text color={"blueBright"}>{`[E] Change Speed   `}</Text>
        )}
        {!state.isGameRunning && (
          <Text color={"blueBright"}>{`[N] New Game   `}</Text>
        )}
        <Text color={"blueBright"}>{`[Q] Quit`}</Text>
      </Box>
      <Box>
        <Text>{`Speed: `}</Text>
        <Text color={"greenBright"}>{`${getSpeed()}   `}</Text>
        <Text>{`Score: `}</Text>
        <Text color={"greenBright"}>{`${state.score}`}</Text>
      </Box>
      <Box display={state.isGameOver ? "flex" : "none"}>
        <Text color={"redBright"}>Game over!</Text>
      </Box>
    </Box>
  );
};

export const renderGameUI = () => {
  render(<GameUI />);
};
