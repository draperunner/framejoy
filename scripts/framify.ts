import sharp from "sharp";

type Frame = {
  id: string;
  background: string;
  foreground?: string;
  top: number;
  left: number;
  width: number;
  height: number;
  rotation?: number;
};

const frames: Frame[] = [
  {
    id: "laptop",
    background: "frames/laptop.webp",
    top: 334,
    left: 2154,
    width: 1010,
    height: 626,
  },
  {
    id: "presentation",
    background: "frames/presentation.webp",
    foreground: "frames/presentation_foreground.webp",
    top: 411,
    left: 454,
    width: 951,
    height: 535,
  },
  {
    id: "phone",
    background: "frames/phone.webp",
    top: 330,
    left: 869,
    width: 247,
    height: 423,
    rotation: 13,
  },
  {
    id: "cafe",
    background: "frames/cafe.webp",
    top: 741,
    left: 677,
    width: 419,
    height: 705,
  },
  {
    id: "interior",
    background: "frames/interior.webp",
    top: 694,
    left: 552,
    width: 388,
    height: 388,
  },
  {
    id: "tv",
    background: "frames/tv.webp",
    top: 266,
    left: 710,
    width: 651,
    height: 366,
  },
  {
    id: "holding",
    background: "frames/holding.webp",
    foreground: "frames/holding_foreground.webp",
    top: 743,
    left: 180,
    width: 1106,
    height: 1496,
    rotation: -9.3,
  },
];

async function main() {
  const frame = frames.find(({ id }) => id === "holding");
  const content = await sharp("content/portrait.png")
    .resize(frame.width, frame.height)
    .rotate(frame.rotation, { background: "rgba(0, 0, 0, 0)" })
    .webp()
    .toBuffer();

  return sharp(frame.background)
    .composite(
      [
        {
          input: content,
          top: frame.top,
          left: frame.left,
          gravity: "northwest",
        },
        frame.foreground
          ? {
              input: frame.foreground,
              top: 0,
              left: 0,
            }
          : undefined,
      ].filter(Boolean)
    )
    .jpeg()
    .toFile("output.jpg");
}

main();
