import { program } from "commander";
import { renderGameUI } from "./ui/terminal/components/game-ui.js";

const options = program
  .option("--width [WIDTH]", "Game size width", "20")
  .option("--height [HEIGHT]", "Game size height", "14")
  .option("--speed [SPEED]", "Game speed: fast|medium|slow", "fast")
  .helpOption("-h, --help", "Display this help message")
  .parse()
  .opts();

const { width, height, speed } = options;

console.clear();
renderGameUI({
  width: parseInt(width),
  height: parseInt(height),
  speed,
});
