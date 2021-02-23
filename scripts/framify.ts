import sharp from "sharp";

const frames = {
  gallery: {
    path: "frames/gallery.jpg",
    top: 68,
    left: 537,
    width: 485,
    height: 495,
  },
  tv: {
    path: "frames/tv.jpg",
    top: 492,
    left: 533,
    width: 2209,
    height: 1239,
  },
  laptop: {
    path: "frames/laptop.jpg",
    top: 334,
    left: 2154,
    width: 1010,
    height: 626,
  },
};

async function main() {
  const frame = frames.gallery;
  const content = await sharp("content/screenshot2.png")
    .resize(frame.width, frame.height)
    .toBuffer();

  return sharp(frame.path)
    .composite([
      {
        input: content,
        top: frame.top,
        left: frame.left,
        gravity: "northwest",
      },
    ])
    .jpeg()
    .toFile("output.jpg");
}

main();
