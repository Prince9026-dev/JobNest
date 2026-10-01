require('dotenv').config();
const cloudinary = require("cloudinary").v2;
const { fileLoader } = require("ejs");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key : process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET,
})

const storage = new CloudinaryStorage({
    cloudinary : cloudinary,
    params:{
        file_name : "jobnest_resume_dev",
        allowedFormats : ["jpg", "jpeg"],
    }
})

module.exports = {
    cloudinary, 
    storage
}