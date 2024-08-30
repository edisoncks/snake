import React, { useEffect, useState, useTransition } from "react";
import { Box, Text, render, useApp, useInput } from "ink";
import { setInterval, setTimeout } from "node:timers";
import { SPRITES } from "./constants.js";
import { getDefaultMap, getDefaultSnakePositions } from "./default.js";
import { getNewApplePosition } from "./utils.js";

type Direction = "left" | "right" | "up" | "down";

type Speed = "fast" | "medium" | "slow";

type GameProps = {
  column: number;
  row: number;
  speed: Speed;
};

const CELL_WIDTH = 2;
const CELL_HEIGHT = 1;
const TIMER_SPEED: Record<Speed, number> = {
  fast: 50,
  medium: 100,
  slow: 200,
};

const Game = ({ column, row, speed }: GameProps) => {
  const { exit } = useApp();

  const [state, setState] = useState({
    map: getDefaultMap(column, row),
    score: 0,
    snakePositions: getDefaultSnakePositions(column, row),
    applePos: getNewApplePosition(
      column,
      row,
      getDefaultSnakePositions(column, row),
    ),
    clearPositionsQueue: [] as number[][],
    direction: "right" as Direction,
    nextDirection: "right" as Direction,
    gameCountdown: 3,
    gameEnded: false,
    positionTicker: undefined as NodeJS.Timeout | undefined,
    renderTicker: undefined as NodeJS.Timeout | undefined,
  });

  const [isPending, startTransition] = useTransition();

  const drawMap = () => {
    setState((prevState) => {
      for (const pos of prevState.clearPositionsQueue) {
        prevState.map[pos[0]][pos[1]] = SPRITES.void;
      }
      prevState.clearPositionsQueue = [];
      const { applePos } = prevState;
      prevState.map[applePos[0]][applePos[1]] = SPRITES.apple;
      const headPos = prevState.snakePositions[0];
      prevState.map[headPos[0]][headPos[1]] = SPRITES.snake;
      if (prevState.snakePositions.length === 3) {
        const bodyPos1 = prevState.snakePositions[1];
        prevState.map[bodyPos1[0]][bodyPos1[1]] = SPRITES.snake;
        const bodyPos2 = prevState.snakePositions[2];
        prevState.map[bodyPos2[0]][bodyPos2[1]] = SPRITES.snake;
      }
      return prevState;
    });
  };

  const updateSnakeAndApplePositions = () => {
    startTransition(() => {
      setState((prevState) => {
        if (prevState.gameEnded || prevState.gameCountdown > 0)
          return prevState;
        const headPos = prevState.snakePositions[0];
        const tailPos = prevState.snakePositions.slice(-1)[0];
        const nextPos = [...headPos];
        switch (prevState.nextDirection) {
          case "right":
            nextPos[0] += 1;
            break;
          case "left":
            nextPos[0] -= 1;
            break;
          case "up":
            nextPos[1] -= 1;
            break;
          case "down":
            nextPos[1] += 1;
            break;
        }
        const hasHitWall =
          nextPos[0] == 0 ||
          nextPos[1] == 0 ||
          nextPos[0] + 1 == column ||
          nextPos[1] + 1 == row;
        const hasHitSnake =
          prevState.snakePositions.find(
            (pos) => pos[0] == nextPos[0] && pos[1] == nextPos[1],
          ) !== undefined;
        const hasEatenApple =
          prevState.snakePositions.find(
            (pos) =>
              pos[0] == prevState.applePos[0] &&
              pos[1] == prevState.applePos[1],
          ) !== undefined;
        const newSnakePositions = [
          nextPos,
          ...prevState.snakePositions.slice(0, hasEatenApple ? undefined : -1),
        ];
        const newApplePosition = hasEatenApple
          ? getNewApplePosition(column, row, newSnakePositions)
          : prevState.applePos;
        return {
          ...prevState,
          direction: prevState.nextDirection,
          snakePositions:
            hasHitWall || hasHitSnake
              ? prevState.snakePositions
              : newSnakePositions,
          applePos: newApplePosition,
          clearPositionsQueue:
            hasHitWall || hasHitSnake || hasEatenApple
              ? prevState.clearPositionsQueue
              : [...prevState.clearPositionsQueue, tailPos],
          score:
            !hasHitWall && !hasHitSnake && hasEatenApple
              ? prevState.score + 100
              : prevState.score,
          gameEnded: hasHitWall || hasHitSnake,
        };
      });
    });
  };

  const startPositionTicker = () => {
    startTransition(() => {
      setState((prevState) => {
        return {
          ...prevState,
          positionTicker: setInterval(() => {
            updateSnakeAndApplePositions();
          }, TIMER_SPEED[speed]),
        };
      });
    });
  };

  const stopPositionTicker = () => {
    setState((prevState) => {
      if (prevState.positionTicker) clearInterval(prevState.positionTicker);
      return {
        ...prevState,
        positionTicker: undefined,
      };
    });
  };

  const startRenderTicker = () => {
    startTransition(() => {
      setState((prevState) => {
        return {
          ...prevState,
          renderTicker: setInterval(() => {
            drawMap();
          }, 50),
        };
      });
    });
  };

  const stopRenderTicker = () => {
    setState((prevState) => {
      if (prevState.renderTicker) clearInterval(prevState.renderTicker);
      return {
        ...prevState,
        renderTicker: undefined,
      };
    });
  };

  const startCountdown = () => {
    setTimeout(() => {
      setState((prevState) => {
        if (prevState.gameCountdown > 1) startCountdown();
        return {
          ...prevState,
          gameCountdown: prevState.gameCountdown - 1,
        };
      });
    }, 1000);
  };

  const resetGame = () => {
    setState((prevState) => {
      return {
        ...prevState,
        map: getDefaultMap(column, row),
        score: 0,
        snakePositions: getDefaultSnakePositions(column, row),
        applePos: getNewApplePosition(
          column,
          row,
          getDefaultSnakePositions(column, row),
        ),
        clearPositionsQueue: [] as number[][],
        direction: "right" as Direction,
        nextDirection: "right" as Direction,
        gameCountdown: 3,
        gameEnded: false,
      };
    });
    startCountdown();
  };

  const exitApp = () => {
    stopPositionTicker();
    stopRenderTicker();
    exit();
    process.exit();
  };

  useEffect(() => {
    drawMap();
    startCountdown();
    startPositionTicker();
    startRenderTicker();
    return () => {
      stopPositionTicker();
      stopRenderTicker();
    };
  }, []);

  useInput((input, key) => {
    if (input === "q") exitApp();
    if (input === "r") resetGame();
    if (key.rightArrow || input === "d")
      startTransition(() => {
        setState((prevState) => ({
          ...prevState,
          nextDirection:
            prevState.direction != "left" ? "right" : prevState.nextDirection,
        }));
      });
    if (key.leftArrow || input === "a")
      startTransition(() => {
        setState((prevState) => ({
          ...prevState,
          nextDirection:
            prevState.direction != "right" ? "left" : prevState.nextDirection,
        }));
      });
    if (key.upArrow || input === "w")
      startTransition(() => {
        setState((prevState) => ({
          ...prevState,
          nextDirection:
            prevState.direction != "down" ? "up" : prevState.nextDirection,
        }));
      });
    if (key.downArrow || input === "s")
      startTransition(() => {
        setState((prevState) => ({
          ...prevState,
          nextDirection:
            prevState.direction != "up" ? "down" : prevState.nextDirection,
        }));
      });
  });

  return (
    <Box flexDirection="column" alignItems="center" justifyContent="center">
      <Box width={column * CELL_WIDTH} marginTop={1}>
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
      <Box display={state.gameCountdown > 0 ? "flex" : "none"}>
        <Text color={"yellowBright"}>
          The game is starting in {state.gameCountdown} second(s)...
        </Text>
      </Box>
      <Box>
        <Text
          color={"blueBright"}
        >{`[←↑↓→]/[WASD] Move   [R] Restart   [Q] Quit`}</Text>
      </Box>
      <Box>
        <Text>{`Speed: `}</Text>
        <Text color={"greenBright"}>{`${speed}   `}</Text>
        <Text>{`Score: `}</Text>
        <Text color={"greenBright"}>{`${state.score}`}</Text>
      </Box>
      <Box display={state.gameEnded ? "flex" : "none"}>
        <Text color={"redBright"}>Game over!</Text>
      </Box>
    </Box>
  );
};

export const renderGame = (width: number, height: number, speed: Speed) => {
  render(<Game column={width} row={height} speed={speed} />);
};
