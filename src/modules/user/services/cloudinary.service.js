import cloudinary from "../../../common/config/cloudinary.js";
import ApiError from "../../../common/utils/api-error.js";

const CLOUDINARY_FOLDER =
  "live-game-platform/users/profile-images";

const generateUploadSignature = () => {
  try {
    const timestamp = Math.floor(
      Date.now() / 1000
    );

    const signature =
      cloudinary.utils.api_sign_request(
        {
          timestamp,
          folder: CLOUDINARY_FOLDER,
        },
        process.env.CLOUDINARY_API_SECRET
      );

    return {
      timestamp,
      signature,
      apiKey:
        process.env.CLOUDINARY_API_KEY,
      cloudName:
        process.env.CLOUDINARY_CLOUD_NAME,
      folder: CLOUDINARY_FOLDER,
    };
  } catch (error) {
    throw ApiError.internal(
      error?.message ||
        "Failed to generate upload signature"
    );
  }
};

export { generateUploadSignature };