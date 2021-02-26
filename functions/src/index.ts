import * as functions from "firebase-functions";
import admin from "firebase-admin";
import sharp, { OverlayOptions } from "sharp";
import path from "path";

admin.initializeApp();

type Frame = {
  id: string;
  background: string;
  foreground?: string;
  top: number;
  left: number;
  width: number;
  height: number;
};

const frames: Frame[] = [
  {
    id: "gallery",
    background: "gallery.webp",
    top: 68,
    left: 537,
    width: 485,
    height: 495,
  },
  {
    id: "tv",
    background: "tv.webp",
    top: 492,
    left: 533,
    width: 2209,
    height: 1239,
  },
  {
    id: "mckinney",
    background: "mckinney.webp",
    foreground: "mckinney_foreground.webp",
    top: 307,
    left: 175,
    width: 701,
    height: 678,
  },
  {
    id: "presentation",
    background: "presentation.webp",
    foreground: "presentation_foreground.webp",
    top: 411,
    left: 454,
    width: 951,
    height: 535,
  },
];

const cache: Record<string, Buffer> = {};

async function downloadFrame(path: string): Promise<Buffer> {
  if (cache[path]) {
    console.log("Using cached", path);
    return cache[path];
  }

  const [buffer] = await admin
    .storage()
    .bucket("framejoy-frames")
    .file(path)
    .download();

  cache[path] = buffer;
  return buffer;
}

export const frameImage = functions
  .region("europe-west1")
  .runWith({
    memory: "1GB",
  })
  .https.onCall(async (data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "failed-precondition",
        "The function must be called " + "while authenticated."
      );
    }

    const fileBucket = data.bucket; // The Storage bucket that contains the file.
    const filePath = data.fullPath; // File path in the bucket.

    if (!filePath) {
      console.log("filePath does not exist");
      return;
    }

    const fileName = path.basename(filePath);

    if (fileName.startsWith("framed-")) {
      console.log("Image is already framed");
      return;
    }

    const bucket = admin.storage().bucket(fileBucket);
    const [fileBuffer] = await bucket.file(filePath).download();

    const framedImageUrls = await Promise.all(
      frames.map(async (frame) => {
        const content = await sharp(fileBuffer)
          .resize(frame.width, frame.height)
          .toBuffer();

        const [background, foreground] = await Promise.all([
          downloadFrame(frame.background),
          frame.foreground ? downloadFrame(frame.foreground) : undefined,
        ]);

        const layers: OverlayOptions[] = [
          {
            input: content,
            top: frame.top,
            left: frame.left,
          },
        ];

        if (foreground) {
          layers.push({
            input: foreground,
            top: 0,
            left: 0,
          });
        }

        const compositeImage = await sharp(background)
          .composite(layers)
          .jpeg()
          .toBuffer();

        const frameFile = bucket.file(
          path.join(
            path.dirname(filePath),
            `framed-${frame.id}-${fileName}`.replace(".png", ".jpg")
          )
        );

        await frameFile.save(compositeImage);
        await frameFile.makePublic();
        return frameFile.publicUrl();
      })
    );

    await bucket.file(filePath).delete();

    return framedImageUrls;
  });
