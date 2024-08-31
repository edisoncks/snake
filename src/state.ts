import { clearInterval } from "timers";
import { getRandomInt } from "./random.js";

export type Direction = "left" | "right" | "up" | "down";

export type Position = { x: number; y: number };

const state = {
  score: 0,
  snakePositions: [] as Position[],
  applePosition: { x: 0, y: 0 } as Position,
  currentDirection: "right" as Direction,
  nextDirection: "right" as Direction,
  gameEnded: true,
  gameHasRunOnce: false,
  ticker: undefined as NodeJS.Timeout | undefined,
};

const getDefaultSnakePositions = (
  columns: number,
  rows: number,
): Position[] => {
  const positions: Position[] = [
    { x: Math.floor(columns / 2) - 0, y: Math.floor(rows / 2) },
    { x: Math.floor(columns / 2) - 1, y: Math.floor(rows / 2) },
    { x: Math.floor(columns / 2) - 2, y: Math.floor(rows / 2) },
  ];
  return positions;
};

const getNewApplePosition = (columns: number, rows: number): Position => {
  const applePosition = { x: 1, y: 1 };
  do {
    applePosition.x = getRandomInt(1, columns - 2);
    applePosition.y = getRandomInt(1, rows - 2);
  } while (
    state.snakePositions.find(
      (pos) => pos.x == applePosition.x && pos.y == applePosition.y,
    )
  );
  return applePosition;
};

export const resetState = (columns: number, rows: number): void => {
  state.score = 0;
  state.snakePositions = getDefaultSnakePositions(columns, rows);
  state.applePosition = getNewApplePosition(columns, rows);
  state.currentDirection = "right";
  state.nextDirection = "right";
  state.gameEnded = false;
  if (state.ticker) clearInterval(state.ticker);
  state.ticker = undefined;
};

export const getState = () => state;

export const setScore = (score: number) => {
  state.score = score;
};

export const getSnakeNextPosition = (direction: Direction): Position => {
  const nextPosition = { ...state.snakePositions[0] };
  nextPosition.x =
    direction === "right"
      ? nextPosition.x + 1
      : direction === "left"
        ? nextPosition.x - 1
        : nextPosition.x;
  nextPosition.y =
    direction === "down"
      ? nextPosition.y + 1
      : direction === "up"
        ? nextPosition.y - 1
        : nextPosition.y;
  return nextPosition;
};

export const moveSnakeToPosition = (
  position: Position,
  growLength: boolean,
) => {
  state.snakePositions = [
    position,
    ...(growLength ? state.snakePositions : state.snakePositions.slice(0, -1)),
  ];
  return state.snakePositions;
};

export const resetApplePosition = (columns: number, rows: number) => {
  state.applePosition = getNewApplePosition(columns, rows);
  return state.applePosition;
};

export const setCurrentDirection = (direction: Direction) => {
  state.currentDirection = direction;
};

export const setNextDirection = (direction: Direction) => {
  const invalidDirectionMapping: Record<Direction, Direction> = {
    right: "left",
    left: "right",
    down: "up",
    up: "down",
  };
  if (state.currentDirection !== invalidDirectionMapping[direction]) {
    state.nextDirection = direction;
  }
};

export const setGameEnded = (ended: boolean) => {
  state.gameEnded = ended;
};

export const setGameHasRunOnce = (once: boolean) => {
  state.gameHasRunOnce = once;
};

export const setTicker = (ticker: NodeJS.Timeout) => {
  state.ticker = ticker;
};
