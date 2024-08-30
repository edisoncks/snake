import { getRandomInt } from "./random.js";

export const getNewApplePosition = (
  column: number,
  row: number,
  snakePositions: number[][],
) => {
  const applePos = [1, 1];
  do {
    applePos[0] = getRandomInt(1, column - 2);
    applePos[1] = getRandomInt(1, row - 2);
  } while (
    snakePositions.find((pos) => pos[0] == applePos[0] && pos[1] == applePos[1])
  );
  return applePos;
};
