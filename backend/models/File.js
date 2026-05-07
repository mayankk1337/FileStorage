const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
    title:{
        type:String,
        required:true,
        minlength:3,
        maxlength:100

    },
    description:{
        type:String,
        maxlength:500

    },
    attachment:{
        type:String,
        required:true

    }
},{ timestamps:true });

const File = mongoose.model('File', fileSchema);
module.exports = File;
