import {
  FilterMode,
  ImageFormat,
  MipmapMode,
  rect,
  Skia,
  SkImage,
} from "@shopify/react-native-skia";
import { SizeVector, StickerState } from "../../types";

type Options = {
  image: SkImage;
  imageSize: SizeVector<number>; // Size of the image on screen
  stickerSize: number; // Size of the sticker on screen
  history: number[]; // Order in which the stickers are activated
  stickerContext: Record<string, StickerState>; // Transformation and metadata of the stickers
};

const RAG2DEG = 180 / Math.PI;

export const convertImageAndStickersToBase64 = (options: Options) => {
  const { image, imageSize, history, stickerContext } = options;

  const offscreen = Skia.Surface.MakeOffscreen(image.width(), image.height())!;
  const canvas = offscreen?.getCanvas();

  if (canvas === undefined) return undefined;

  // Draw image image
  canvas.drawImageRectOptions(
    image,
    rect(0, 0, image.width(), image.height()),
    rect(0, 0, image.width(), image.height()),
    FilterMode.Linear,
    MipmapMode.Linear,
    Skia.Paint(),
  );

  const relativeScale = image.width() / imageSize.width;
  const centerX = image.width() / 2;
  const centerY = image.height() / 2;

  for (let i = 0; i < history.length; i++) {
    const stickerIndex = history[i];
    const sticker = stickerContext[stickerIndex];

    const translateX = sticker.transform.translate.x * relativeScale;
    const translateY = sticker.transform.translate.y * relativeScale;
    const angle = sticker.transform.rotate * RAG2DEG;

    const size = sticker.radius * 2 * relativeScale;
    const x = centerX - size / 2 + translateX;
    const y = centerY - size / 2 + translateY;

    canvas.save();
    canvas.rotate(angle, centerX + translateX, centerY + translateY);

    if (sticker.skiaSource !== null) {
      const stickerImage = sticker.skiaSource;

      canvas.drawImageRectOptions(
        stickerImage,
        rect(0, 0, stickerImage.width(), stickerImage.height()),
        rect(x, y, size, size),
        FilterMode.Linear,
        MipmapMode.Linear,
        Skia.Paint(),
      );
    }

    canvas.restore();
  }

  const snapshot = offscreen.makeImageSnapshot(
    rect(0, 0, image.width(), image.height()),
  );

  return snapshot.encodeToBase64(ImageFormat.PNG, 100);
};
