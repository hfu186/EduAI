const { uploadToCloudinary, getFileBase64 } = require("./uploadHelper");

const uploadImageToCloudinary = async (file, folder = "", publicId, options = {}, overrideOptions = {}) => {
  const uploadOptions = { ...options, ...overrideOptions };
  return uploadToCloudinary(file, folder, publicId, uploadOptions);
};

module.exports = {
  uploadImageToCloudinary,
  getFileBase64,
};
