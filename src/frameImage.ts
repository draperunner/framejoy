import { frames } from "./frames-setup";

async function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function degreesToRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

function resizeImage(
  img: HTMLImageElement,
  targetWidth: number,
  targetHeight: number,
): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;
  canvas.width = targetWidth;
  canvas.height = targetHeight;

  const imgAspectRatio = img.width / img.height;
  const targetAspectRatio = targetWidth / targetHeight;

  let drawWidth, drawHeight, offsetX, offsetY;

  if (imgAspectRatio > targetAspectRatio) {
    // Image is wider than target - scale to height and crop width
    drawHeight = targetHeight;
    drawWidth = drawHeight * imgAspectRatio;
    offsetX = (targetWidth - drawWidth) / 2;
    offsetY = 0;
  } else {
    // Image is taller than target - scale to width and crop height
    drawWidth = targetWidth;
    drawHeight = drawWidth / imgAspectRatio;
    offsetX = 0;
    offsetY = (targetHeight - drawHeight) / 2;
  }

  ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
  return canvas;
}

function rotateImage(
  img: HTMLImageElement | HTMLCanvasElement,
  rotationRadians: number,
): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;

  const imgWidth = img.width;
  const imgHeight = img.height;

  // Calculate rotated dimensions
  const cos = Math.abs(Math.cos(rotationRadians));
  const sin = Math.abs(Math.sin(rotationRadians));
  const newWidth = imgWidth * cos + imgHeight * sin;
  const newHeight = imgWidth * sin + imgHeight * cos;

  canvas.width = newWidth;
  canvas.height = newHeight;

  // Translate to center and rotate
  ctx.translate(newWidth / 2, newHeight / 2);
  ctx.rotate(rotationRadians);
  ctx.drawImage(img, -imgWidth / 2, -imgHeight / 2);

  return canvas;
}

declare const __brand: unique symbol;

export type JpegDataURL = string & { [__brand]: "JpegDataURL" };

export async function frameImage(data: string): Promise<JpegDataURL[]> {
  if (!data || !new RegExp("^data:image/(png|jpeg|webp)").test(data)) {
    throw new Error("Invalid input data.");
  }

  // Load the user image
  const userImage = await loadImage(data);
  const { width = 1, height = 1 } = userImage;
  const aspectRatio = width / height;

  // Select the 6 closest frames based on aspect ratio
  const sortedFrames = [...frames]
    .sort((a, b) => {
      const ratioA = a.width / a.height;
      const ratioB = b.width / b.height;
      return Math.abs(aspectRatio - ratioA) - Math.abs(aspectRatio - ratioB);
    })
    .slice(0, 6);

  const framedImageData = await Promise.all(
    sortedFrames.map(async (frame) => {
      try {
        // Load frame images
        const loadPromises = [loadImage(frame.background)];
        if (frame.foreground) {
          loadPromises.push(loadImage(frame.foreground));
        }

        const [backgroundImg, foregroundImg] = await Promise.all(loadPromises);

        // Resize user image
        let processedUserImage: HTMLImageElement | HTMLCanvasElement =
          resizeImage(userImage, frame.width, frame.height);

        // Rotate user image if needed
        if (frame.rotation) {
          const rotationRadians = degreesToRadians(frame.rotation);
          processedUserImage = rotateImage(processedUserImage, rotationRadians);
        }

        // Create composite canvas
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d")!;
        canvas.width = backgroundImg.width;
        canvas.height = backgroundImg.height;

        ctx.drawImage(backgroundImg, 0, 0);
        ctx.drawImage(processedUserImage, frame.left, frame.top);

        if (foregroundImg) {
          ctx.drawImage(foregroundImg, 0, 0);
        }

        // Convert to JPEG and return as base64
        return canvas.toDataURL("image/jpeg", 0.9) as JpegDataURL;
      } catch (error) {
        console.error(`Error processing frame ${frame.id}:`, error);
        throw error;
      }
    }),
  );

  return framedImageData;
}
