import { z } from "zod";

// File Size Limit
const fileSizeLimit = 5 * 1024 * 1024; // 5MB

// Document Schema
export const DOCUMENT_SCHEMA = z
    .instanceof(File)
    .refine(
        (file) =>
            [
                "application/pdf",
                "application/vnd.ms-excel",
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                "application/vnd.openxmlformats-officedocument.presentationml.presentation",
            ].includes(file.type),
            { message: "Invalid document file type" }
    )
    .refine(
        (file) => file.size <= fileSizeLimit, { 
            message: "File size should not exceed 5MB"
        }
    )

// Image Schema
export const IMAGE_SCHEMA = z
    .instanceof(File)
    .refine(
        (file) =>
            [
                "image/png",
                "image/jpeg",
                "image/jpg",
                // "image/svg+xml",
                // "image/gif",
            ].includes(file.type),
            { message: "Invalid image file type" }
    )
    .refine(
        (file) => file.size <= fileSizeLimit, { 
            message: "File size should not exceed 5MB"
        }
    )

// 
export const MULTIPLE_FILE_SCHEMA = z
    .object({
        files: z
            .instanceof(FileList)
            .refine(list => list.length > 0, "No files selected")
            .refine(list => list.length <= 5, "Maximum 5 files allowed")
            .transform((list) => Array.from(list))

        // to be continued
        // src: https://dev.to/drprime01/how-to-validate-a-file-input-with-zod-5739
    })