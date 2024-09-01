import { Speed } from "./core.js";

export const CELL_WIDTH = 2;

export const CELL_HEIGHT = 1;

export const SPRITES = {
  apple: "@",
  snake: "#",
  void: " ",
  wall: "x",
};

export const TIMER_SPEED: Record<Speed, number> = {
  fast: 50,
  medium: 100,
  slow: 200,
};
