const express = require('express');
const upload = require('../middlewares/multer.middleware');
const { uploadFile, getFiles } = require('../controllers/file.controller');
const router = express.Router();

router.post('/upload', upload.single('file'), uploadFile)
router.get('/files', getFiles)

module.exports = router;
