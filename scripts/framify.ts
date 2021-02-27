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
    id: "gallery",
    background: "frames/gallery.webp",
    top: 68,
    left: 537,
    width: 485,
    height: 495,
  },
  {
    id: "tv",
    background: "frames/tv.webp",
    top: 492,
    left: 533,
    width: 2209,
    height: 1239,
  },
  {
    id: "laptop",
    background: "frames/laptop.webp",
    top: 334,
    left: 2154,
    width: 1010,
    height: 626,
  },
  {
    id: "mckinney",
    background: "frames/mckinney.webp",
    foreground: "frames/mckinney_foreground.webp",
    top: 307,
    left: 175,
    width: 701,
    height: 678,
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
];

async function main() {
  const frame = frames.find(({ id }) => id === "phone");
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
