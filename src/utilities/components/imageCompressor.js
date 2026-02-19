import ImageResizer from "@bam.tech/react-native-image-resizer";
import RNFS from "react-native-fs";
 
 export  const compressImageIfNeeded = async (image) => {
  try {
    const path = image.uri.replace("file://", "");
    const stat = await RNFS.stat(path);
    const sizeInMB = stat.size / 1024 / 1024;

    console.log("Original size:", sizeInMB.toFixed(2), "MB");

    // compress only if > 5MB
    if (sizeInMB <= 1) {
      return image;
    }

    const resizedImage = await ImageResizer.createResizedImage(
      image.uri,
      1600,
      1600,
      "JPEG",
      80
    );

    console.log("Compressed:", resizedImage.size / 1024 / 1024, "MB");

    return {
      uri: resizedImage.uri,
      type: "image/jpeg",
      name: `compressed_${Date.now()}.jpg`,
      captureImageTime: image.captureImageTime,
    };
  } catch (error) {
    console.log("Compression error:", error);
    return image;
  }
};
