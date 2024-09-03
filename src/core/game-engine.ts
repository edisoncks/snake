import { clearInterval, setInterval } from "timers";
import { GameRound } from "./game-round.js";
import { Dimension } from "./types/dimension.js";
import { Position } from "./types/position.js";

export class GameEngine {
  private _boardSize: Dimension;
  private _tickInterval: number;
  private _isGameRunning: boolean;
  private _shouldRestartGameRound: boolean;
  private _gameRound: GameRound;
  private _ticker: NodeJS.Timeout | undefined;
  private _onAppleRespawn: (position: Position) => void;
  private _onGameStart: () => void;
  private _onGameStop: () => void;
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
    tickInterval: number,
    onAppleRespawn?: (position: Position) => void,
    onGameStart?: () => void,
    onGameStop?: () => void,
    onScoreChange?: (score: number) => void,
    onSnakeHitSelf?: () => void,
    onSnakeHitWall?: () => void,
    onSnakeMove?: (oldPositions: Position[], newPositions: Position[]) => void,
    onSnakeRespawn?: (positions: Position[]) => void,
    onWallCreated?: (positions: Position[]) => void,
  ) {
    this._onAppleRespawn = onAppleRespawn ?? (() => {});
    this._onGameStart = onGameStart ?? (() => {});
    this._onGameStop = onGameStop ?? (() => {});
    this._onScoreChange = onScoreChange ?? (() => {});
    this._onSnakeHitSelf = () => {
      if (onSnakeHitSelf) onSnakeHitSelf();
      this.stopGame();
    };
    this._onSnakeHitWall = () => {
      if (onSnakeHitWall) onSnakeHitWall();
      this.stopGame();
    };
    this._onSnakeMove = onSnakeMove ?? (() => {});
    this._onSnakeRespawn = onSnakeRespawn ?? (() => {});
    this._onWallCreated = onWallCreated ?? (() => {});
    this._boardSize = boardSize;
    this._tickInterval = tickInterval;
    this._isGameRunning = false;
    this._shouldRestartGameRound = false;
    this._gameRound = new GameRound(
      this._boardSize,
      this._onAppleRespawn,
      this._onScoreChange,
      this._onSnakeHitSelf,
      this._onSnakeHitWall,
      this._onSnakeMove,
      this._onSnakeRespawn,
      this._onWallCreated,
    );
  }

  private _startTicker(): void {
    this._ticker = setInterval(() => {
      this._gameRound.tick();
    }, this._tickInterval);
  }

  private _stopTicker(): void {
    if (this._ticker) clearInterval(this._ticker);
  }

  public get gameRound(): GameRound {
    return this._gameRound;
  }

  public get isGameRunning(): boolean {
    return this._isGameRunning;
  }

  public get tickInterval(): number {
    return this._tickInterval;
  }

  public updateTickInterval(interval: number): void {
    this._tickInterval = interval;
  }

  public startGame(): void {
    this._isGameRunning = true;
    if (this._shouldRestartGameRound) {
      this._gameRound = new GameRound(
        this._boardSize,
        this._onAppleRespawn,
        this._onScoreChange,
        this._onSnakeHitSelf,
        this._onSnakeHitWall,
        this._onSnakeMove,
        this._onSnakeRespawn,
        this._onWallCreated,
      );
    }
    this._startTicker();
    this._onGameStart();
  }

  public stopGame(): void {
    this._isGameRunning = false;
    this._shouldRestartGameRound = true;
    this._stopTicker();
    this._onGameStop();
  }
}
