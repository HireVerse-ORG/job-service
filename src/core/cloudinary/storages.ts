import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from './index';

export const offerLetterStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    // params: {
    //     folder: "hireverse/offer_letters",
    //     allowedFormats: ["pdf", "doc", "docx"],
    //     type: "private",
    // },
    params: () => {
        const folderPath = `hireverse/offer_letters`;
        const allowedFormats = ["pdf", "doc", "docx"];

        return {
            folder: folderPath,
            allowed_formats: allowedFormats
        };
    },
});