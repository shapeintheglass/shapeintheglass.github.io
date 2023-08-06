import Perspective from "perspectivets"

async function drawBase(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, imgSrc: string) {
  const meowBase = new Image();
  meowBase.src = imgSrc

  return new Promise((resolve, reject) => {
    meowBase.onload = () => {
      ctx.drawImage(meowBase, 0, 0);
      resolve(true);
    }
    meowBase.onerror = reject;
  });
}

async function main() {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  canvas.width = 512;
  canvas.height = 512;
  await drawBase(canvas, ctx, "./meow_bongo_base.png");
  await drawBase(canvas, ctx, "./meow_bongo_lower_left.png");
  await drawBase(canvas, ctx, "./meow_bongo_lower_right.png");

  document.body.appendChild(canvas);
}

main();
