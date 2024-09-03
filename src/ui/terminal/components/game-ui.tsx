import { Box, render, useApp, useInput } from "ink";
import React, { useEffect, useReducer, useState } from "react";
import { Speed } from "../../../core/types/speed.js";
import { Position } from "../../../core/types/position.js";
import { SPRITES } from "../constants.js";
import { GameEngine } from "../../../core/game-engine.js";
import { GameBoard } from "./game-board.js";
import { KeyHints } from "./key-hints.js";
import { GameStats } from "./game-stats.js";
import { GameOver } from "./game-over.js";

type GameUIProps = {
  width: number;
  height: number;
  speed: Speed;
};

const tickerIntervalMapping: Record<Speed, number> = {
  fast: 50,
  medium: 100,
  slow: 200,
};

const speedMapping = Object.entries(tickerIntervalMapping).reduce(
  (prev, entry) => {
    const [k, v] = entry as [Speed, number];
    prev[v] = k;
    return prev;
  },
  {} as Record<number, Speed>,
);

export const GameUI = ({
  width,
  height,
  speed,
}: GameUIProps): React.JSX.Element => {
  const { exit } = useApp();

  const [_, forceRerender] = useReducer((x) => x + 1, 0);

  const [state, setState] = useState({
    gameEngine: undefined as unknown as GameEngine,
    map: [] as string[][],
    score: 0,
    isGameRunning: false,
    hasSnakeHitSelf: false,
    hasSnakeHitWall: false,
  });

  const onAppleRespawn = (position: Position) => {
    setState((state) => {
      const map = [...state.map];
      map[position.x][position.y] = SPRITES.apple;
      return { ...state, map };
    });
  };

  const onGameStart = () => {
    setState((state) => ({
      ...state,
      isGameRunning: true,
      hasSnakeHitSelf: false,
      hasSnakeHitWall: false,
    }));
  };

  const onGameStop = () => {
    setState((state) => ({
      ...state,
      isGameRunning: false,
    }));
  };

  const onScoreChange = (score: number) => {
    setState((state) => ({ ...state, score }));
  };

  const onSnakeHitSelf = () => {
    setState((state) => ({
      ...state,
      hasSnakeHitSelf: true,
    }));
  };

  const onSnakeHitWall = () => {
    setState((state) => ({
      ...state,
      hasSnakeHitWall: true,
    }));
  };

  const onSnakeMove = (
    oldSnakePositions: Position[],
    newSnakePositions: Position[],
  ) => {
    setState((state) => {
      const map = [...state.map];
      for (const pos of oldSnakePositions) {
        map[pos.x][pos.y] = SPRITES.void;
      }
      for (const pos of newSnakePositions) {
        map[pos.x][pos.y] = SPRITES.snake;
      }
      return { ...state, map };
    });
  };

  const onSnakeRespawn = (positions: Position[]) => {
    setState((state) => {
      const map = [...state.map];
      for (const pos of positions) {
        map[pos.x][pos.y] = SPRITES.snake;
      }
      return { ...state, map };
    });
  };

  const onWallCreated = (positions: Position[]) => {
    setState((state) => {
      const map: string[][] = [];
      for (let x = 0; x < width; x++) {
        const column: string[] = [];
        for (let y = 0; y < height; y++) {
          column.push(
            positions.find((pos) => pos.x === x && pos.y === y) !== undefined
              ? SPRITES.wall
              : SPRITES.void,
          );
        }
        map.push(column);
      }
      return { ...state, map };
    });
  };

  useEffect(() => {
    setState((state) => {
      // Init game engine
      const gameEngine = new GameEngine(
        { x: width, y: height },
        tickerIntervalMapping[speed],
        onAppleRespawn,
        onGameStart,
        onGameStop,
        onScoreChange,
        onSnakeHitSelf,
        onSnakeHitWall,
        onSnakeMove,
        onSnakeRespawn,
        onWallCreated,
      );
      // Render initial wall positions
      const map: string[][] = [];
      for (let x = 0; x < width; x++) {
        const column: string[] = [];
        for (let y = 0; y < height; y++) {
          column.push(
            gameEngine.gameRound.wallPositions.find(
              (pos) => pos.x === x && pos.y === y,
            ) !== undefined
              ? SPRITES.wall
              : SPRITES.void,
          );
        }
        map.push(column);
      }
      // Render initial snake positions
      for (const pos of gameEngine.gameRound.snake.positions) {
        map[pos.x][pos.y] = SPRITES.snake;
      }
      // Render initial apple position
      map[gameEngine.gameRound.apple.position.x][
        gameEngine.gameRound.apple.position.y
      ] = SPRITES.apple;
      return {
        ...state,
        gameEngine,
        map,
      };
    });
  }, []);

  useInput((input, key) => {
    if (input === "w" || key.upArrow)
      state.gameEngine.gameRound.changeDirection("up");
    if (input === "a" || key.leftArrow)
      state.gameEngine.gameRound.changeDirection("left");
    if (input === "s" || key.downArrow)
      state.gameEngine.gameRound.changeDirection("down");
    if (input === "d" || key.rightArrow)
      state.gameEngine.gameRound.changeDirection("right");
    if (input === "e" && !state.isGameRunning) {
      const mapping: Record<Speed, Speed> = {
        slow: "medium",
        medium: "fast",
        fast: "slow",
      };
      const speed = speedMapping[state.gameEngine.tickInterval ?? 50];
      state.gameEngine.updateTickInterval(
        tickerIntervalMapping[mapping[speed]],
      );
      setState((state) => ({ ...state, score: 0 }));
      forceRerender();
    }
    if (input === "n" && !state.isGameRunning) {
      state.gameEngine.startGame();
    }
    if (input === "q") {
      state.gameEngine.stopGame();
      exit();
      process.exit();
    }
  });

  return (
    <Box
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      marginTop={1}
    >
      <GameBoard width={width * 2} height={height} cells={state.map} />
      <KeyHints
        showMoveKey={state.isGameRunning}
        showSpeedKey={!state.isGameRunning}
        showNewGameKey={!state.isGameRunning}
        color="blue"
      />
      <GameStats
        score={state.score}
        speed={speedMapping[state.gameEngine?.tickInterval ?? 50]}
        color="green"
      />
      <GameOver
        color="red"
        display={
          state.hasSnakeHitSelf || state.hasSnakeHitWall ? "flex" : "none"
        }
      />
    </Box>
  );
};

export const renderGameUI = (props: GameUIProps) => {
  render(<GameUI {...props} />);
};
