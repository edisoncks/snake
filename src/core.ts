import { getRandomInt } from "./random.js";

export type Direction = "left" | "right" | "up" | "down";
export type Optional<K> = K | undefined;
export type Position = { x: number; y: number };
export type Speed = "fast" | "medium" | "slow";

const config = {
  width: 20,
  height: 14,
  speed: "fast" as Speed,
};

const flags = {
  isGameRunning: false,
  hasStartedOnce: false,
  hasHitSelf: false,
  hasHitWall: false,
};

const hooks = {
  onAppleRespawn: (applePosition: Position) => {},
  onGameStart: (applePosition: Position, snakePositions: Position[]) => {},
  onGameStop: () => {},
  onScoreUpdate: (score: number) => {},
  onSnakeMove: (
    oldSnakePositions: Position[],
    newSnakePositions: Position[],
  ) => {},
  onSnakeHitSelf: () => {},
  onSnakeHitWall: () => {},
};

const state = {
  direction: {
    current: "right" as Direction,
    next: "right" as Direction,
  },
  positions: {
    snake: [] as Position[],
    apple: { x: 0, y: 0 } as Position,
  },
  score: 0,
};

const getNewApplePosition = (): Position => {
  const applePosition = { x: 1, y: 1 };
  do {
    applePosition.x = getRandomInt(1, config.width - 2);
    applePosition.y = getRandomInt(1, config.height - 2);
  } while (
    state.positions.snake.find(
      (pos) => pos.x == applePosition.x && pos.y == applePosition.y,
    )
  );
  return applePosition;
};

const getDefaultSnakePositions = (): Position[] => {
  const positions: Position[] = [
    { x: Math.floor(config.width / 2) - 0, y: Math.floor(config.height / 2) },
    { x: Math.floor(config.width / 2) - 1, y: Math.floor(config.height / 2) },
    { x: Math.floor(config.width / 2) - 2, y: Math.floor(config.height / 2) },
  ];
  return positions;
};

const getSnakeNextPosition = (): Position => {
  const nextPosition = { ...state.positions.snake[0] };
  nextPosition.x =
    state.direction.next === "right"
      ? nextPosition.x + 1
      : state.direction.next === "left"
        ? nextPosition.x - 1
        : nextPosition.x;
  nextPosition.y =
    state.direction.next === "down"
      ? nextPosition.y + 1
      : state.direction.next === "up"
        ? nextPosition.y - 1
        : nextPosition.y;
  return nextPosition;
};

const moveSnakeToPosition = (position: Position, growLength: boolean) => {
  const oldSnakePositions = [...state.positions.snake];
  const newSnakePositions = [
    position,
    ...(growLength ? oldSnakePositions : oldSnakePositions.slice(0, -1)),
  ];
  state.positions.snake = [...newSnakePositions];
  hooks.onSnakeMove(oldSnakePositions, newSnakePositions);
};

const updateScore = (score: number) => {
  state.score = score;
  hooks.onScoreUpdate(score);
};

const updateHasHitSelfFlag = (hasHitSelf: boolean) => {
  flags.hasHitSelf = hasHitSelf;
  if (flags.hasHitSelf) hooks.onSnakeHitSelf();
};

const updateHasHitWallFlag = (hasHitWall: boolean) => {
  flags.hasHitWall = hasHitWall;
  if (flags.hasHitWall) hooks.onSnakeHitWall();
};

const respawnApple = () => {
  const applePosition = getNewApplePosition();
  state.positions.apple = { ...applePosition };
  hooks.onAppleRespawn({ ...applePosition });
};

export const getWidth = () => config.width;

export const setWidth = (width: number) => {
  config.width = width;
  state.positions.snake = getDefaultSnakePositions();
  state.positions.apple = getNewApplePosition();
};

export const getHeight = () => config.height;

export const setHeight = (height: number) => {
  config.height = height;
  state.positions.snake = getDefaultSnakePositions();
  state.positions.apple = getNewApplePosition();
};

export const getSpeed = () => config.speed;

export const setSpeed = (speed: Speed) => {
  config.speed = speed;
};

export const getIsGameRunningFlag = () => flags.isGameRunning;

export const getApplePosition = () => state.positions.apple;

export const getSnakePositions = () => state.positions.snake;

export const changeDirection = (newDirection: Direction) => {
  const invalidDirectionMapping: Record<Direction, Direction> = {
    right: "left",
    left: "right",
    down: "up",
    up: "down",
  };
  if (state.direction.current !== invalidDirectionMapping[newDirection]) {
    state.direction.next = newDirection;
  }
};

export const setOnAppleRespawnHandler = (
  handler: (applePosition: Position) => void,
) => {
  hooks.onAppleRespawn = handler;
};

export const setOnGameStartHandler = (
  handler: (applePosition: Position, snakePositions: Position[]) => void,
) => {
  hooks.onGameStart = handler;
};

export const setOnGameStopHandler = (handler: () => void) => {
  hooks.onGameStop = handler;
};

export const setOnScoreUpdateHandler = (handler: (score: number) => void) => {
  hooks.onScoreUpdate = handler;
};

export const setOnSnakeMoveHandler = (
  handler: (
    oldSnakePositions: Position[],
    newSnakePositions: Position[],
  ) => void,
) => {
  hooks.onSnakeMove = handler;
};

export const setOnSnakeHitSelfHandler = (handler: () => void) => {
  hooks.onSnakeHitSelf = handler;
};

export const setOnSnakeHitWallHandler = (handler: () => void) => {
  hooks.onSnakeHitWall = handler;
};

export const startGame = () => {
  updateHasHitWallFlag(false);
  updateHasHitSelfFlag(false);
  updateScore(0);
  state.positions.snake = getDefaultSnakePositions();
  if (flags.hasStartedOnce) {
    state.positions.apple = getNewApplePosition();
  }
  state.direction.current = "right";
  state.direction.next = "right";
  flags.hasStartedOnce = true;
  flags.isGameRunning = true;
  hooks.onGameStart(state.positions.apple, state.positions.snake);
};

export const stopGame = () => {
  flags.isGameRunning = false;
  hooks.onGameStop();
};

export const tick = () => {
  const snakeNextPosition = getSnakeNextPosition();
  const hasHitSelf =
    state.positions.snake.find(
      (pos) => pos.x === snakeNextPosition.x && pos.y === snakeNextPosition.y,
    ) !== undefined;
  const hasHitWall =
    snakeNextPosition.x === 0 ||
    snakeNextPosition.y === 0 ||
    snakeNextPosition.x + 1 === config.width ||
    snakeNextPosition.y + 1 === config.height;
  const hasEatenApple =
    snakeNextPosition.x === state.positions.apple.x &&
    snakeNextPosition.y === state.positions.apple.y;
  if (!hasHitWall && !hasHitSelf)
    moveSnakeToPosition(snakeNextPosition, hasEatenApple);
  if (hasEatenApple) respawnApple();
  updateHasHitWallFlag(hasHitWall);
  updateHasHitSelfFlag(hasHitSelf);
  if (hasEatenApple) updateScore(state.score + 100);
  state.direction.current = state.direction.next;
  if (hasHitWall || hasHitSelf) stopGame();
};

state.positions.snake = getDefaultSnakePositions();
state.positions.apple = getNewApplePosition();
