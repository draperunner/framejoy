import * as functions from "firebase-functions";
import admin, { firestore } from "firebase-admin";
import sharp from "sharp";
import path from "path";

type Frame = {
  id: string;
  path: string;
  top: number;
  left: number;
  width: number;
  height: number;
};

export const frame = functions
  .region("europe-west1")
  .storage.object()
  .onFinalize(async (object) => {
    const fileBucket = object.bucket; // The Storage bucket that contains the file.
    const filePath = object.name; // File path in the bucket.

    if (!filePath) {
      console.log("filePath does not exist");
      return;
    }

    const fileName = path.basename(filePath);

    if (fileName.startsWith("framed_")) {
      console.log("Image is already framed");
      return;
    }

    const framesRefs = await firestore().collection("frames").get();
    const frames = framesRefs.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    })) as Frame[];

    const bucket = admin.storage().bucket(fileBucket);
    const [fileBuffer] = await bucket.file(filePath).download();

    await Promise.all(
      frames.map(async (frame) => {
        const content = await sharp(fileBuffer)
          .resize(frame.width, frame.height)
          .toBuffer();

        const compositeImage = await sharp(frame.path)
          .composite([
            {
              input: content,
              top: frame.top,
              left: frame.left,
            },
          ])
          .jpeg()
          .toBuffer();

        return bucket
          .file(
            path.join(path.dirname(filePath), `framed-${frame.id}-${fileName}`)
          )
          .save(compositeImage);
      })
    );
  });
