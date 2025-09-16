import dotenv from "dotenv"
dotenv.config()

import { v2 as cloudinary } from "cloudinary"
import { CloudinaryStorage } from "multer-storage-cloudinary"

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})

const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: "azamon/products",
        allowed_formats: ["jpg", "png", "jpeg"],
        transformation: [{ width: 600, height: 600, crop: "limit"}]
    }
})


export { cloudinary, storage }