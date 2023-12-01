const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({ //formating the cloudinary object to connect with out cloud
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_SECRET    
})

const storage = new CloudinaryStorage({ //calling the coudinary object
    cloudinary,
    params: {
        folder: 'YelpCamp',
        allowedFromats: ['jpeg', 'png', 'jpg']
    }
});

module.exports = {
    cloudinary,
    storage
}