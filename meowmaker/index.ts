import Perspective from "perspectivets"

const canvas = document.getElementById("meow");
const meowBase = document.querySelector("img");

if (canvas instanceof HTMLCanvasElement) {
  const ctx = canvas.getContext("2d");
  if (ctx && meowBase) {
    let p = new Perspective(ctx, meowBase)
    p.draw({
      topLeftX: 30,
      topLeftY: 30,
      topRightX: 462,
      topRightY: 50,
      bottomRightX: 442,
      bottomRightY: 482,
      bottomLeftX: 10,
      bottomLeftY: 512,
    })
  }
}