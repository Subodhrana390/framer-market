import multer from "multer";
import path from "path";
import AppError from "../utils/AppError.js";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/grader_documents/");
  },
  filename: function (req, file, cb) {
    const extname = path.extname(file.originalname);
    const filename = `grader_${Date.now()}${extname}`;
    cb(null, filename);
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const filetypes = /jpg|jpeg|png|pdf/;
    const extname = filetypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = filetypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new AppError(400, "Only image and PDF files are allowed!"));
    }
  },
});

export { upload };
