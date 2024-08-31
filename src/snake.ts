import { program } from "commander";
import { setWidth, setHeight, setSpeed } from "./config.js";
import { renderGame } from "./game.js";

const options = program
  .option("--width [WIDTH]", "Game size width", "20")
  .option("--height [HEIGHT]", "Game size height", "14")
  .option("--speed [SPEED]", "Game speed: fast|medium|slow", "fast")
  .helpOption("-h, --help", "Display this help message")
  .parse()
  .opts();

const { width, height, speed } = options;
setWidth(parseInt(width));
setHeight(parseInt(height));
setSpeed(speed);

console.clear();
renderGame();
