import { program } from "commander";
import { renderGame } from "./game.js";

program
  .option("--width [WIDTH]", "Game size width", "20")
  .option("--height [HEIGHT]", "Game size height", "14")
  .option("--speed [SPEED]", "Game speed: fast|medium|slow", "fast")
  .helpOption("-h, --help", "Display this help message");

program.parse();

const options = program.opts();

console.clear();

renderGame(parseInt(options.width), parseInt(options.height), options.speed);
