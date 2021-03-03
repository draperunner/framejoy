import * as functions from "firebase-functions";
import admin from "firebase-admin";
import sharp, { OverlayOptions } from "sharp";
import { v4 as uuid } from "uuid";

admin.initializeApp();

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
    background: "laptop.webp",
    top: 590,
    left: 539,
    width: 829,
    height: 517,
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
  {
    id: "phone",
    background: "phone.webp",
    top: 330,
    left: 869,
    width: 247,
    height: 423,
    rotation: 13,
  },
  {
    id: "cafe",
    background: "cafe.webp",
    top: 741,
    left: 677,
    width: 419,
    height: 705,
  },
  {
    id: "interior",
    background: "interior.webp",
    top: 694,
    left: 552,
    width: 388,
    height: 388,
  },
  {
    id: "tv",
    background: "tv.webp",
    top: 266,
    left: 710,
    width: 651,
    height: 366,
  },
  {
    id: "holding",
    background: "holding.webp",
    foreground: "holding_foreground.webp",
    top: 743,
    left: 180,
    width: 1106,
    height: 1496,
    rotation: -9.3,
  },
  {
    id: "gallery",
    background: "gallery.webp",
    foreground: "gallery_foreground.webp",
    top: 343,
    left: 598,
    width: 801,
    height: 1177,
  },
];

async function downloadFrame(path: string): Promise<Buffer> {
  const [buffer] = await admin
    .storage()
    .bucket("framejoy-frames")
    .file(path)
    .download();
  return buffer;
}

export const frameImage = functions
  .region("europe-west1")
  .runWith({
    memory: "1GB",
  })
  .https.onCall(async ({ data }, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "failed-precondition",
        "The function must be called " + "while authenticated."
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
    const { width = 1, height = 1 } = await sharp(fileBuffer).metadata();
    const aspectRatio = width / height;
    const fileId = uuid();

    const sortedFrames = [...frames]
      .sort((a, b) => {
        const ratioA = a.width / a.height;
        const ratioB = b.width / b.height;
        return Math.abs(aspectRatio - ratioA) - Math.abs(aspectRatio - ratioB);
      })
      .slice(0, 6);

    const framedImageUrls = await Promise.all(
      sortedFrames.map(async (frame) => {
        const [content, background, foreground] = await Promise.all([
          sharp(fileBuffer)
            .resize(frame.width, frame.height)
            .rotate(frame.rotation, { background: "rgba(0, 0, 0, 0)" })
            .webp()
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

        const bucket = admin.storage().bucket();
        const frameFile = bucket.file(`${fileId}-${frame.id}.jpg`);

        await frameFile.save(compositeImage);
        await frameFile.makePublic();
        return frameFile.publicUrl();
      })
    );

    return framedImageUrls;
  });
