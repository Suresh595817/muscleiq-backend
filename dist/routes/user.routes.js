"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const user_controller_1 = require("../controllers/user.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
// Configure Multer storage engine
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './uploads/');
    },
    filename: (req, file, cb) => {
        // Unique filename formatting: user-id-timestamp.ext
        const userId = req.user ? req.user.id : 'anonymous';
        cb(null, `${userId}-${Date.now()}${path_1.default.extname(file.originalname)}`);
    },
});
// Configure image validation filter
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png/;
    const extName = allowedTypes.test(path_1.default.extname(file.originalname).toLowerCase());
    const mimeType = allowedTypes.test(file.mimetype);
    if (extName && mimeType) {
        cb(null, true);
    }
    else {
        cb(new Error('Images only (jpeg, jpg, png are supported)!'));
    }
};
const upload = (0, multer_1.default)({
    storage,
    limits: { fileSize: 2 * 1024 * 1024 }, // 2MB max
    fileFilter,
});
router.put('/profile', auth_middleware_1.protect, user_controller_1.updateProfile);
router.post('/avatar', auth_middleware_1.protect, upload.single('avatar'), user_controller_1.uploadAvatar);
exports.default = router;
