// ============================================
// uploadthing client utilities
// ============================================
// these hooks are used in components to trigger uploads

import {
  generateUploadButton,
  generateUploadDropzone,
  generateReactHelpers,
} from "@uploadthing/react";

import type { OurFileRouter } from "@/app/api/uploadthing/core";

// pre-built upload button component
export const UploadButton = generateUploadButton<OurFileRouter>();

// pre-built dropzone component  
export const UploadDropzone = generateUploadDropzone<OurFileRouter>();

// hook for programmatic uploads
export const { useUploadThing } = generateReactHelpers<OurFileRouter>();
