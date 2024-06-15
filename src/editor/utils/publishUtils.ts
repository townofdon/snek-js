import Color from "color";
import { getRelativeDir } from "../../utils";
import { Palette } from "../../types";

export const getCanvasImage = async (canvas: HTMLCanvasElement): Promise<File> => {
  const dataUrl = canvas.toDataURL('image/png');
  const blob = await (await fetch(dataUrl)).blob();
  return new File([blob], `map-${Date.now()}.png`, { type: blob.type });
};

export async function loadImage(path: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    const onLoad = () => {
      cleanup();
      resolve(image);
    }
    const onError = (err: ErrorEvent) => {
      cleanup();
      reject(err);
    }
    const cleanup = () => {
      image.removeEventListener("load", onLoad);
      image.removeEventListener("error", onError)
    }
    image.addEventListener("load", onLoad);
    image.addEventListener("error", onError)

    const isDataUri = /^data:image\/.*;base64/.test(path);
    if (isDataUri) {
      image.src = path;
    } else {
      image.src = `${getRelativeDir()}/assets/graphics/${path}`;
    }
  });
}

export async function loadFont(name: string, path: string): Promise<void> {
  const url = `${getRelativeDir()}/assets/fonts/${path}`;
  const font = new FontFace(name, `url(${url})`);
  const loaded = await (font.load());
  document.fonts.add(loaded);
}

export async function drawShareImage(ctx: CanvasRenderingContext2D, colors: Palette, mapImageDataUrl: string, mapName: string, author?: string) {
  const template = await loadImage('editor-share-template.png');
  const mapImage = await loadImage(mapImageDataUrl);
  await loadFont('RetroGaming', 'RetroGaming.ttf');
  await loadFont('MiniMOOD', 'MiniMOOD.ttf');

  const shadow = '#405578';
  const titleColor = colors.playerHead;
  const authorColor = colors.apple;

  ctx.fillStyle = Color(colors.background).darken(0.2).desaturate(0.15).hex();
  ctx.fillRect(0, 0, 1200, 630);
  ctx.fillStyle = colors.background;
  ctx.fillRect(0, 15, 1200, 600);
  ctx.drawImage(template, 0, 0, 600, 600, 0, 15, 600, 600);
  ctx.drawImage(mapImage, 0, 0, 600, 600, 600, 15, 600, 600);

  const y = drawText(ctx, mapName, 300, 375, { fill: titleColor, fontSize: 36, shadow: { x: 0, y: 4, color: shadow, fontSizeAdd: -0.5 } });

  if (author) {
    drawText(ctx, `map by`, 300, y + 100, { fill: '#ddd', fontSize: 12, shadow: { x: 0, y: 3, color: shadow, fontSizeAdd: -0.1667 } });
    drawText(ctx, author, 300, y + 120, { fill: authorColor, fontSize: 12, shadow: { x: 0, y: 3, color: shadow, fontSizeAdd: -0.1667 } });
  }
}

interface DrawTextOptions {
  align?: CanvasTextAlign;
  fill?: string,
  stroke?: string,
  fontSize?: number,
  fontFamily?: string,
  shadow?: { x: number, y: number, color?: string, fontSizeAdd?: number }
  lineHeight?: number,
  lines?: string[],
}
function drawText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, options: DrawTextOptions = {}): number {
  const {
    align = 'center',
    fill = 'white',
    stroke,
    fontSize = 30,
    fontFamily = 'MiniMOOD',
    lineHeight = fontSize,
    shadow,
  } = options;

  let lastY = y;

  ctx.fillStyle = fill;
  ctx.textAlign = align;
  ctx.font = `${fontSize}px ${fontFamily}`;
  const lines = options.lines || getTextLines(ctx, text, 500);

  if (shadow) {
    const shadowOpts = { shadow, fill, stroke, fontSize, ...options };
    drawText(ctx, text, x + shadow.x, y + shadow.y, {
      ...shadowOpts,
      fill: shadow.color || "black",
      fontSize: fontSize + (shadow.fontSizeAdd || 0),
      lines,
      stroke: undefined,
      shadow: undefined,
    });
  }

  ctx.fillStyle = fill;
  ctx.textAlign = align;
  ctx.font = `${fontSize}px ${fontFamily}`;

  lines.forEach((line, index) => {
    ctx.fillText(line, x, y + index * lineHeight);
    if (stroke) {
      ctx.lineWidth = 2;
      ctx.strokeStyle = stroke;
      ctx.strokeText(line, x, y + index * lineHeight);
    }
    lastY = y + index * lineHeight;
  });

  return lastY;
}

function getTextLines(ctx: CanvasRenderingContext2D, text: string, maxWidth: number) {
  var words = text.split(" ");
  var lines = [];
  var currentLine = words[0];

  for (var i = 1; i < words.length; i++) {
      var word = words[i];
      var width = ctx.measureText(currentLine + " " + word).width;
      if (width < maxWidth) {
          currentLine += " " + word;
      } else {
          lines.push(currentLine);
          currentLine = word;
      }
  }
  lines.push(currentLine);
  return lines;
}

function getBrightestColor(colors: string[]) {
  const values = colors.map(color => Color(color).value());
  const max = Math.max(...values);
  const index = values.indexOf(max);
  return colors[index || 0];
}

function boxGradient(ctx: CanvasRenderingContext2D, size: number, color0 = '#00000000', color1 = '#00000011', color2 = '#00000022') {
  const w = 1200;
  const h = 600;
  const x0 = size;
  const x1 = w - size;
  const y0 = size;
  const y1 = h - size;
  const apply = (x0: number, y0: number, x1: number, y1: number, gradient: CanvasGradient) => {
    gradient.addColorStop(0, color0);
    gradient.addColorStop(0.7, color1);
    gradient.addColorStop(1, color2);
    ctx.fillStyle = gradient;
    ctx.rect(x0, y0, x1, y1);
    ctx.fill();
  }
  apply(0, 0, w, y0, ctx.createLinearGradient(0, y0, 0, 0));
  apply(0, y1, w, h, ctx.createLinearGradient(0, y1, 0, h));
  apply(0, 0, x0, h, ctx.createLinearGradient(x0, 0, 0, 0));
  apply(x1, 0, w, h, ctx.createLinearGradient(x1, 0, w, 0));
}

function vingette(ctx: CanvasRenderingContext2D) {
  ctx.beginPath();
  const grad = ctx.createRadialGradient(300, 315, 15, 300, 315, 520);
  grad.addColorStop(0, "#00000000");
  grad.addColorStop(0.7, "#00000022");
  grad.addColorStop(1, "#00000088");
  ctx.fillStyle = grad;
  ctx.rect(0, 15, 600, 615);
  ctx.fill();
}

function decoGrad(ctx: CanvasRenderingContext2D, size = 300, color = 'black') {
  const gutter = 60;
  const grad = ctx.createLinearGradient(1200 - size, 615 - size, 1200 - gutter, 615 - gutter);
  grad.addColorStop(0, "#00000000");
  grad.addColorStop(0.6, Color(color).alpha(0.35).hexa());
  grad.addColorStop(1, Color(color).alpha(1).hexa());
  ctx.beginPath();
  ctx.fillStyle = grad;
  ctx.rect(1200 - size, 615 - size, 600, 600);
  ctx.fill();
}

function mapOverlay(ctx: CanvasRenderingContext2D, color = 'black') {
  ctx.beginPath();
  ctx.fillStyle = Color(color).alpha(0.4).hexa();
  ctx.rect(1200 - 600, 15, 600, 600);
  ctx.fill();
}
