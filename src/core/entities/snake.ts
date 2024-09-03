import { Dimension } from "../types/dimension.js";
import { Direction } from "../types/direction.js";
import { Position } from "../types/position.js";

export class Snake {
  private _boardSize: Dimension;
  private _direction: { next: Direction; current: Direction };
  private _positions: Position[] = [];
  private _onSnakeMove: (
    oldPositions: Position[],
    newPositions: Position[],
  ) => void;
  private _onSnakeRespawn: (positions: Position[]) => void;

  public constructor(
    boardSize: Dimension,
    direction: Direction,
    onSnakeMove?: (oldPositions: Position[], newPositions: Position[]) => void,
    onSnakeRespawn?: (positions: Position[]) => void,
  ) {
    this._onSnakeMove = onSnakeMove ?? (() => {});
    this._onSnakeRespawn = onSnakeRespawn ?? (() => {});
    this._boardSize = boardSize;
    this._direction = { next: direction, current: direction };
    this.respawn();
  }

  public get positions(): Position[] {
    return this._positions;
  }

  public calculateNextPosition(): Position {
    const nextPosition = { ...this._positions[0] };
    nextPosition.x =
      this._direction.next === "right"
        ? nextPosition.x + 1
        : this._direction.next === "left"
          ? nextPosition.x - 1
          : nextPosition.x;
    nextPosition.y =
      this._direction.next === "down"
        ? nextPosition.y + 1
        : this._direction.next === "up"
          ? nextPosition.y - 1
          : nextPosition.y;
    return nextPosition;
  }

  public changeDirection(newDirection: Direction): void {
    const invalidDirectionMapping: Record<Direction, Direction> = {
      right: "left",
      left: "right",
      down: "up",
      up: "down",
    };
    if (this._direction.current !== invalidDirectionMapping[newDirection]) {
      this._direction.next = newDirection;
    }
  }

  public move(shouldGrow: boolean): void {
    const nextPosition = this.calculateNextPosition();
    const oldPositions = [...this._positions];
    const newPositions = [
      nextPosition,
      ...(shouldGrow ? oldPositions : oldPositions.slice(0, -1)),
    ];
    this._positions = newPositions;
    this._direction.current = this._direction.next;
    this._onSnakeMove([...oldPositions], [...newPositions]);
  }

  public respawn(): void {
    const positions: Position[] = [
      {
        x: Math.floor(this._boardSize.x / 2) - 0,
        y: Math.floor(this._boardSize.y / 2),
      },
      {
        x: Math.floor(this._boardSize.x / 2) - 1,
        y: Math.floor(this._boardSize.y / 2),
      },
      {
        x: Math.floor(this._boardSize.x / 2) - 2,
        y: Math.floor(this._boardSize.y / 2),
      },
    ];
    this._positions = positions;
    this._onSnakeRespawn([...this._positions]);
  }
}
