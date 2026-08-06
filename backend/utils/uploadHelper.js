const fs = require("fs");
const path = require("path");
const cloudinary = require("cloudinary").v2;

const ensureDirectoryExists = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

const moveUploadedFile = async (file, destinationPath) => {
  if (!file || typeof file.mv !== "function") {
    throw new Error("Invalid uploaded file");
  }
  ensureDirectoryExists(path.dirname(destinationPath));
  return file.mv(destinationPath);
};

const saveUploadedFiles = async (files, uploadDir, publicPath) => {
  const fileArray = Array.isArray(files) ? files : [files];
  ensureDirectoryExists(uploadDir);

  return Promise.all(
    fileArray.map(async (file) => {
      const fileName = `${Date.now()}-${file.name.replace(/\s+/g, "-")}`;
      const destination = path.join(uploadDir, fileName);
      await moveUploadedFile(file, destination);

      return {
        fileName: file.name,
        fileUrl: `${publicPath}/${fileName}`,
      };
    })
  );
};

const uploadToCloudinary = async (file, folder = "", publicId, options = {}) => {
  if (!file) {
    throw new Error("No file provided for Cloudinary upload");
  }

  const uploadOptions = {
    folder,
    public_id: publicId,
    ...options,
  };

  if (file.tempFilePath) {
    return cloudinary.uploader.upload(file.tempFilePath, uploadOptions);
  }

  if (Buffer.isBuffer(file.data)) {
    const base64File = `data:${file.mimetype};base64,${file.data.toString("base64")}`;
    return cloudinary.uploader.upload(base64File, uploadOptions);
  }

  if (typeof file === "string") {
    return cloudinary.uploader.upload(file, uploadOptions);
  }

  throw new Error("Unsupported file input for Cloudinary upload");
};

const getFileBase64 = (file) => {
  if (!file) {
    throw new Error("No file provided for base64 conversion");
  }

  if (file.tempFilePath) {
    const fileBuffer = fs.readFileSync(file.tempFilePath);
    return `data:${file.mimetype};base64,${fileBuffer.toString("base64")}`;
  }

  if (Buffer.isBuffer(file.data)) {
    return `data:${file.mimetype};base64,${file.data.toString("base64")}`;
  }

  throw new Error("Unsupported file input for base64 conversion");
};

module.exports = {
  ensureDirectoryExists,
  moveUploadedFile,
  saveUploadedFiles,
  uploadToCloudinary,
  getFileBase64,
};
