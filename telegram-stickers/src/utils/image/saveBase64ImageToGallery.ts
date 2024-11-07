import { createAlbumAsync, createAssetAsync } from "expo-media-library";
import { documentDirectory, writeAsStringAsync } from "expo-file-system";

export const saveBase64ImageToGallery = async (
  base64Image: string,
  imageName: string,
  albumName: string,
): Promise<string> => {
  const uri = documentDirectory + `${imageName}.png`;
  await writeAsStringAsync(uri, base64Image, { encoding: "base64" });

  const asset = await createAssetAsync(uri);
  await createAlbumAsync(albumName, asset);

  return uri;
};
