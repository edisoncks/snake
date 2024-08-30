import { SPRITES } from "./constants.js";
import { getRandomInt } from "./random.js";

export const getDefaultMap = (column: number, row: number): string[][] => {
  const map: string[][] = [];
  for (let x = 0; x < column; x++) {
    const mapCol: string[] = [];
    for (let y = 0; y < row; y++) {
      mapCol.push(
        x == 0 || y == 0 || x + 1 == column || y + 1 == row
          ? SPRITES.wall
          : SPRITES.void,
      );
    }
    map.push(mapCol);
  }
  return map;
};

export const getDefaultSnakePositions = (
  column: number,
  row: number,
): number[][] => {
  const positions: number[][] = [
    [Math.floor(column / 2) - 0, Math.floor(row / 2)],
    [Math.floor(column / 2) - 1, Math.floor(row / 2)],
    [Math.floor(column / 2) - 2, Math.floor(row / 2)],
  ];
  return positions;
};
