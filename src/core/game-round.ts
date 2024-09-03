import { Apple } from "./entities/apple.js";
import { Snake } from "./entities/snake.js";
import { Dimension } from "./types/dimension.js";
import { Direction } from "./types/direction.js";
import { Position } from "./types/position.js";

export class GameRound {
  private _boardSize: Dimension;
  private _wallPositions: Position[];
  private _snake: Snake;
  private _apple: Apple;
  private _score: number;
  private _hasHitSelf: boolean;
  private _hasHitWall: boolean;
  private _onAppleRespawn: (position: Position) => void;
  private _onScoreChange: (score: number) => void;
  private _onSnakeHitSelf: () => void;
  private _onSnakeHitWall: () => void;
  private _onSnakeMove: (
    oldPositions: Position[],
    newPositions: Position[],
  ) => void;
  private _onSnakeRespawn: (positions: Position[]) => void;
  private _onWallCreated: (positions: Position[]) => void;

  public constructor(
    boardSize: Dimension,
    onAppleRespawn?: (position: Position) => void,
    onScoreChange?: (score: number) => void,
    onSnakeHitSelf?: () => void,
    onSnakeHitWall?: () => void,
    onSnakeMove?: (oldPositions: Position[], newPositions: Position[]) => void,
    onSnakeRespawn?: (positions: Position[]) => void,
    onWallCreated?: (positions: Position[]) => void,
  ) {
    this._onAppleRespawn = onAppleRespawn ?? (() => {});
    this._onScoreChange = onScoreChange ?? (() => {});
    this._onSnakeHitSelf = onSnakeHitSelf ?? (() => {});
    this._onSnakeHitWall = onSnakeHitWall ?? (() => {});
    this._onSnakeMove = onSnakeMove ?? (() => {});
    this._onSnakeRespawn = onSnakeRespawn ?? (() => {});
    this._onWallCreated = onWallCreated ?? (() => {});
    this._boardSize = boardSize;
    this._wallPositions = this.calculateWallPositions();
    this._onWallCreated(this._wallPositions);
    this._snake = new Snake(
      boardSize,
      "right",
      this._onSnakeMove,
      this._onSnakeRespawn,
    );
    this._apple = new Apple(
      boardSize,
      {
        wall: [],
        snake: this._snake.positions,
      },
      this._onAppleRespawn,
    );
    this._score = 0;
    this._hasHitSelf = false;
    this._hasHitWall = false;
  }

  private calculateWallPositions(): Position[] {
    const positions: Position[] = [];
    for (let x = 0; x < this._boardSize.x; x++) {
      for (let y = 0; y < this._boardSize.y; y++) {
        if (
          x === 0 ||
          y === 0 ||
          x === this._boardSize.x - 1 ||
          y === this._boardSize.y - 1
        )
          positions.push({ x, y });
      }
    }
    return positions;
  }

  private updateHasHitSelf(hasHitSelf: boolean): void {
    this._hasHitSelf = hasHitSelf;
    if (hasHitSelf) {
      this._onSnakeHitSelf();
    }
  }

  private updateHasHitWall(hasHitWall: boolean): void {
    this._hasHitWall = hasHitWall;
    if (hasHitWall) {
      this._onSnakeHitWall();
    }
  }

  private _updateScore(score: number): void {
    this._score = score;
    this._onScoreChange(this._score);
  }

  public get apple(): Apple {
    return this._apple;
  }

  public get hasHitSelf(): boolean {
    return this._hasHitSelf;
  }

  public get hasHitWall(): boolean {
    return this._hasHitWall;
  }

  public get snake(): Snake {
    return this._snake;
  }

  public get wallPositions(): Position[] {
    return this._wallPositions;
  }

  public changeDirection(direction: Direction): void {
    this._snake.changeDirection(direction);
  }

  public tick(): void {
    const snakePositions = this._snake.positions;
    const snakeNextPosition = this._snake.calculateNextPosition();
    const applePosition = this._apple.position;
    const hasHitSelf =
      snakePositions.find(
        (pos) => pos.x === snakeNextPosition.x && pos.y === snakeNextPosition.y,
      ) !== undefined;
    const hasHitWall =
      this._wallPositions.find(
        (pos) => pos.x === snakeNextPosition.x && pos.y === snakeNextPosition.y,
      ) !== undefined;
    const hasEatenApple =
      snakeNextPosition.x === applePosition.x &&
      snakeNextPosition.y === applePosition.y;
    if (!hasHitSelf && !hasHitWall) {
      this._snake.move(hasEatenApple);
    }
    if (hasEatenApple) {
      this._apple.respawn();
      this._updateScore(this._score + 100);
    }
    this.updateHasHitSelf(hasHitSelf);
    this.updateHasHitWall(hasHitWall);
  }
}
