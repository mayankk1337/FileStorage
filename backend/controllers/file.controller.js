const File=require('../models/File');
const joi=require('joi');

exports.uploadFile=async(req,res)=>{
    try{
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
            
        }

        const { title, description } = req.body;
        const schema = joi.object({

            title: joi.string().min(3).max(100).required(),
            description: joi.string().max(500).optional()
        });

        const { error } = schema.validate({ title, description });
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }

        const newFile = new File({
            title,
            description,
             attachment: req.file.path.replace(/\\/g, '/')
        });

        await newFile.save();

        return res.status(201).json({
            success: true,
            message: 'File uploaded successfully',
            data: newFile
        });

    }catch(err){
        console.error('Error uploading file:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
}

exports.getFiles = async (req, res) => {
  try {
    const files = await File.find().sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      data: files,
    });
  } catch (err) {
    console.error('Error fetching files:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}
