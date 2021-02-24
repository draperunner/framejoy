import * as functions from "firebase-functions";
import admin from "firebase-admin";
import sharp from "sharp";
import path from "path";

admin.initializeApp();

type Frame = {
  id: string;
  path: string;
  top: number;
  left: number;
  width: number;
  height: number;
};

const frames: Frame[] = [
  {
    id: "gallery",
    path: "gallery.jpg",
    top: 68,
    left: 537,
    width: 485,
    height: 495,
  },
  {
    id: "tv",
    path: "tv.jpg",
    top: 492,
    left: 533,
    width: 2209,
    height: 1239,
  },
  {
    id: "laptop",
    path: "laptop.jpg",
    top: 334,
    left: 2154,
    width: 1010,
    height: 626,
  },
];

export const frameImage = functions
  .region("europe-west1")
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

        const [frameBuffer] = await admin
          .storage()
          .bucket("framejoy-frames")
          .file(frame.path)
          .download();

        const compositeImage = await sharp(frameBuffer)
          .composite([
            {
              input: content,
              top: frame.top,
              left: frame.left,
            },
          ])
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
