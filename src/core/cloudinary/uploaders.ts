import multer from "multer";
import { offerLetterStorage } from "./storages";

export const offerLetterUploader = () => {
    return multer({
        storage: offerLetterStorage,
        limits: {
            fileSize: 5 * 1024 * 1024, 
        },
    })
}