import cloudinary from "../config/cloudinary.js";

export const uploadImage = async (file) => {
  const base64 = `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;

  const result = await cloudinary.uploader.upload(base64, {
    folder: "wonderfox",
  });

  return {
    url: result.secure_url,
    public_id: result.public_id,
  };
};
