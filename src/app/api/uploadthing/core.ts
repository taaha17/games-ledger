// ============================================
// uploadthing file router
// ============================================
// handles file uploads for avatars and headers
// uses uploadthing's free tier which is perfect for our use case

import { createUploadthing, type FileRouter } from "uploadthing/next";
import { auth } from "@clerk/nextjs/server";

const f = createUploadthing();

// define what files we accept and their size limits
export const ourFileRouter = {
  // avatar uploads - square images up to 5mb
  avatarUploader: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
    .middleware(async () => {
      // make sure user is logged in
      const { userId } = await auth();
      if (!userId) throw new Error("Unauthorized");
      return { userId };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // this runs after upload completes
      // we return the url which gets sent back to the client
      console.log("avatar upload complete for user:", metadata.userId);
      console.log("file url:", file.ufsUrl);
      return { url: file.ufsUrl };
    }),

  // header/banner uploads - wider images up to 5mb
  headerUploader: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
    .middleware(async () => {
      const { userId } = await auth();
      if (!userId) throw new Error("Unauthorized");
      return { userId };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("header upload complete for user:", metadata.userId);
      console.log("file url:", file.ufsUrl);
      return { url: file.ufsUrl };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
