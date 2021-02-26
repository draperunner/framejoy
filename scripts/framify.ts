import sharp from "sharp";

type Frame = {
  background: string;
  foreground?: string;
  top: number;
  left: number;
  width: number;
  height: number;
};

const frames: Record<string, Frame> = {
  gallery: {
    background: "frames/gallery.jpg",
    top: 68,
    left: 537,
    width: 485,
    height: 495,
  },
  tv: {
    background: "frames/tv.jpg",
    top: 492,
    left: 533,
    width: 2209,
    height: 1239,
  },
  laptop: {
    background: "frames/laptop.jpg",
    top: 334,
    left: 2154,
    width: 1010,
    height: 626,
  },
  mckinney: {
    background: "frames/mckinney.jpg",
    foreground: "frames/mckinney_foreground.png",
    top: 307,
    left: 175,
    width: 701,
    height: 678,
  },
  presentation: {
    background: "frames/presentation.jpg",
    foreground: "frames/presentation_foreground.png",
    top: 411,
    left: 454,
    width: 951,
    height: 535,
  },
};

async function main() {
  const frame = frames.presentation;
  const content = await sharp("content/screenshot2.png")
    .resize(frame.width, frame.height)
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
