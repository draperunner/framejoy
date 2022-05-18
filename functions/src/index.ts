import * as functions from "firebase-functions";
import sharp, { OverlayOptions } from "sharp";

import { initializeApp } from "firebase-admin/app";
import { getStorage } from "firebase-admin/storage";
import { frames } from "./frames-setup";

initializeApp();

const storage = getStorage();

async function downloadFrame(path: string): Promise<Buffer> {
  const [buffer] = await storage
    .bucket("framejoy-frames")
    .file(path)
    .download({ validation: !process.env.FUNCTIONS_EMULATOR });
  return buffer;
}

export const frameImage = functions
  .region("europe-west1")
  .runWith({
    memory: "2GB",
  })
  .https.onCall(async ({ data }, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "failed-precondition",
        "The function must be called while authenticated."
      );
    }

    if (!data || !new RegExp("^data:image/(png|jpeg|webp)").test(data)) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Invalid input data."
      );
    }

    const dataWithoutPrefix = data.replace(/^data:.+;base64,/, "");
    const fileBuffer = Buffer.from(dataWithoutPrefix, "base64");
    const fileSharp = sharp(fileBuffer).webp();
    const { width = 1, height = 1 } = await fileSharp.metadata();
    const aspectRatio = width / height;

    const sortedFrames = [...frames]
      .sort((a, b) => {
        const ratioA = a.width / a.height;
        const ratioB = b.width / b.height;
        return Math.abs(aspectRatio - ratioA) - Math.abs(aspectRatio - ratioB);
      })
      .slice(0, 6);

    const framedImageData = await Promise.all(
      sortedFrames.map(async (frame) => {
        const [content, background, foreground] = await Promise.all([
          fileSharp
            .clone()
            .resize(frame.width, frame.height)
            .rotate(frame.rotation, { background: "rgba(0, 0, 0, 0)" })
            .toBuffer(),
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

        return "data:image/jpeg;base64," + compositeImage.toString("base64");
      })
    );

    return framedImageData;
  });
