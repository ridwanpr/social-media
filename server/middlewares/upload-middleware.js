import path from "node:path";
import multer from "multer";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "../storage/tmp/uploads");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix);
  },
});

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (ext !== ".jpg" && ext !== ".png" && ext !== ".jpeg") {
    return cb(
      new Error("Only file with image format are allowed: .jpg, .jpeg & .png"),
    );
  }
  cb(null, true);
};

const upload = multer({ storage, fileFilter });

export default upload;
