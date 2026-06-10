import * as cloudinaryService from "../services/cloudinary.service.js";
import ApiResponse from "../../../common/utils/api-response.js";

const getUploadSignature = async (
  req,
  res,
  next
) => {
  try {
    const signatureData =
      cloudinaryService.generateUploadSignature();

    ApiResponse.ok(
      res,
      "Upload signature generated successfully",
      signatureData
    );
  } catch (error) {
    next(error);
  }
};

export { getUploadSignature };