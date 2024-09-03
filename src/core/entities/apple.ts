import { getRandomInt } from "../random.js";
import { Dimension } from "../types/dimension.js";
import { Position } from "../types/position.js";

export class Apple {
  private _boardSize: Dimension;
  private _positions: { wall: Position[]; snake: Position[]; self: Position };
  private _onAppleRespawn: (position: Position) => void;

  public constructor(
    boardSize: Dimension,
    positions: { wall: Position[]; snake: Position[] },
    onAppleRespawn?: (position: Position) => void,
  ) {
    this._onAppleRespawn = onAppleRespawn ?? (() => {});
    this._boardSize = boardSize;
    this._positions = {
      ...positions,
      self: { x: 0, y: 0 },
    };
    this.respawn();
  }

  public get position(): Position {
    return this._positions.self;
  }

  public updateWallPositions(positions: Position[]): void {
    this._positions.wall = positions;
  }

  public updateSnakePositions(positions: Position[]): void {
    this._positions.snake = positions;
  }

  public respawn(): void {
    const newPosition = { x: 1, y: 1 };
    do {
      newPosition.x = getRandomInt(1, this._boardSize.x - 2);
      newPosition.y = getRandomInt(1, this._boardSize.y - 2);
    } while (
      this._positions.snake.find(
        (pos) => pos.x == newPosition.x && pos.y == newPosition.y,
      )
    );
    this._positions.self = newPosition;
    this._onAppleRespawn({ ...this._positions.self });
  }
}
