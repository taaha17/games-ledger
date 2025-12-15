"use client";

// ============================================
// edit profile modal
// ============================================
// allows users to update their profile info including:
// - avatar and header images (with cropping, up to 5mb)
// - bio
// - gamertags (steam, psn, xbox, nintendo, ea, ubisoft, gog)
// - socials (twitter, instagram, discord, twitch, youtube)

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { updateProfile } from "@/app/actions";
import { toast } from "sonner";
import { X, Upload, Loader2, Camera } from "lucide-react";
import { 
  SiSteam, 
  SiPlaystation, 
  SiNintendoswitch, 
  SiEa, 
  SiUbisoft, 
  SiGogdotcom, 
  SiX, 
  SiInstagram, 
  SiDiscord, 
  SiTwitch, 
  SiYoutube 
} from "react-icons/si";
import { FaXbox } from "react-icons/fa";
import Image from "next/image";
import { ImageCropper } from "./image-cropper";
import { useUploadThing } from "@/lib/uploadthing";
import type { EditProfileModalProps } from "@/types";

// max file size in bytes (5mb)
const MAX_FILE_SIZE = 5 * 1024 * 1024;

export default function EditProfileModal({ user, onClose }: EditProfileModalProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingHeader, setUploadingHeader] = useState(false);
  
  // image cropping state
  const [cropImage, setCropImage] = useState<{ src: string; type: 'avatar' | 'header' } | null>(null);
  
  // file input refs
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const headerInputRef = useRef<HTMLInputElement>(null);
  
  // uploadthing hooks
  const { startUpload: uploadAvatar } = useUploadThing("avatarUploader");
  const { startUpload: uploadHeader } = useUploadThing("headerUploader");

  const [formData, setFormData] = useState({
    bio: user?.bio || "",
    headerUrl: user?.headerUrl || "",
    avatarUrl: user?.avatarUrl || "",
    steamId: user?.steamId || "",
    psnId: user?.psnId || "",
    xboxGamertag: user?.xboxGamertag || "",
    nintendoFriendCode: user?.nintendoFriendCode || "",
    eaId: user?.eaId || "",
    ubisoftId: user?.ubisoftId || "",
    gogId: user?.gogId || "",
    twitter: user?.twitter || "",
    instagram: user?.instagram || "",
    discord: user?.discord || "",
    twitch: user?.twitch || "",
    youtube: user?.youtube || "",
  });

  // handle file selection - opens cropper
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'header') => {
    const file = e.target.files?.[0];
    if (!file) return;

    // check file size (5mb limit)
    if (file.size > MAX_FILE_SIZE) {
      toast.error("File size must be less than 5MB");
      return;
    }

    // check file type
    if (!file.type.startsWith('image/')) {
      toast.error("Please select an image file");
      return;
    }

    // create object url and open cropper
    const imageUrl = URL.createObjectURL(file);
    setCropImage({ src: imageUrl, type });
    
    // reset the input
    e.target.value = '';
  };

  // handle cropped image - uploads to uploadthing
  const handleCropComplete = async (blob: Blob) => {
    if (!cropImage) return;

    const type = cropImage.type;
    setCropImage(null);

    // create file from blob
    const file = new File([blob], `${type}.jpg`, { type: 'image/jpeg' });

    try {
      if (type === 'avatar') {
        setUploadingAvatar(true);
        const result = await uploadAvatar([file]);
        if (result?.[0]?.ufsUrl) {
          setFormData(prev => ({ ...prev, avatarUrl: result[0].ufsUrl }));
          toast.success("Avatar uploaded!");
        }
      } else {
        setUploadingHeader(true);
        const result = await uploadHeader([file]);
        if (result?.[0]?.ufsUrl) {
          setFormData(prev => ({ ...prev, headerUrl: result[0].ufsUrl }));
          toast.success("Header uploaded!");
        }
      }
    } catch (error) {
      console.error("upload error:", error);
      toast.error("Failed to upload image");
    } finally {
      setUploadingAvatar(false);
      setUploadingHeader(false);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    const res = await updateProfile(formData);
    setLoading(false);
    
    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success("Profile updated!");
      onClose();
      router.refresh();
    }
  };

  return (
    <>
      {/* image cropper modal */}
      {cropImage && (
        <ImageCropper
          imageSrc={cropImage.src}
          aspectRatio={cropImage.type === 'avatar' ? 1 : 3}
          cropShape={cropImage.type === 'avatar' ? 'round' : 'rect'}
          onCropComplete={handleCropComplete}
          onCancel={() => {
            URL.revokeObjectURL(cropImage.src);
            setCropImage(null);
          }}
        />
      )}

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
        <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 flex flex-col max-h-[90vh]">
          {/* header */}
          <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center sticky top-0 bg-inherit z-10">
            <h2 className="text-xl font-bold">Edit Profile</h2>
            <button 
              onClick={onClose} 
              aria-label="Close"
              className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-8 overflow-y-auto custom-scrollbar">
            {/* images section */}
            <div className="space-y-6">
              <h3 className="text-sm font-medium text-zinc-500 uppercase tracking-wider border-b border-zinc-200 dark:border-zinc-800 pb-2">
                Images
              </h3>
              
              <div className="grid gap-6 md:grid-cols-2">
                {/* avatar upload */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Profile Picture</label>
                  <div className="flex items-center gap-4">
                    <div 
                      className="relative w-20 h-20 rounded-full overflow-hidden bg-zinc-100 dark:bg-zinc-800 border-2 border-zinc-200 dark:border-zinc-700 cursor-pointer group"
                      onClick={() => avatarInputRef.current?.click()}
                    >
                      {formData.avatarUrl ? (
                        <Image src={formData.avatarUrl} alt="Avatar" fill className="object-cover" />
                      ) : (
                        <div className="flex items-center justify-center w-full h-full text-zinc-400">
                          <Camera className="w-6 h-6" />
                        </div>
                      )}
                      {uploadingAvatar && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <Loader2 className="w-6 h-6 animate-spin text-white" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Camera className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <input
                        ref={avatarInputRef}
                        type="file"
                        accept="image/*"
                        aria-label="Upload Profile Picture"
                        onChange={(e) => handleFileSelect(e, 'avatar')}
                        className="hidden"
                      />
                      <button
                        onClick={() => avatarInputRef.current?.click()}
                        disabled={uploadingAvatar}
                        className="text-sm px-4 py-2 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-lg transition-colors"
                      >
                        {uploadingAvatar ? "Uploading..." : "Change Avatar"}
                      </button>
                      <p className="text-xs text-zinc-500 mt-1">Max 5MB. Square crop.</p>
                    </div>
                  </div>
                </div>

                {/* header upload */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Header Image</label>
                  <div className="flex items-center gap-4">
                    <div 
                      className="relative w-32 h-20 rounded-lg overflow-hidden bg-zinc-100 dark:bg-zinc-800 border-2 border-zinc-200 dark:border-zinc-700 cursor-pointer group"
                      onClick={() => headerInputRef.current?.click()}
                    >
                      {formData.headerUrl ? (
                        <Image src={formData.headerUrl} alt="Header" fill className="object-cover" />
                      ) : (
                        <div className="flex items-center justify-center w-full h-full text-zinc-400">
                          <Camera className="w-6 h-6" />
                        </div>
                      )}
                      {uploadingHeader && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <Loader2 className="w-6 h-6 animate-spin text-white" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Camera className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <input
                        ref={headerInputRef}
                        type="file"
                        accept="image/*"
                        aria-label="Upload Header Image"
                        onChange={(e) => handleFileSelect(e, 'header')}
                        className="hidden"
                      />
                      <button
                        onClick={() => headerInputRef.current?.click()}
                        disabled={uploadingHeader}
                        className="text-sm px-4 py-2 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-lg transition-colors"
                      >
                        {uploadingHeader ? "Uploading..." : "Change Header"}
                      </button>
                      <p className="text-xs text-zinc-500 mt-1">Max 5MB. 3:1 aspect ratio.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* bio section */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-500 uppercase tracking-wider">Bio</label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                className="w-full p-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-transparent focus:ring-2 focus:ring-blue-500 outline-none transition-all min-h-[100px]"
                placeholder="Tell us about yourself..."
                maxLength={500}
              />
              <p className="text-xs text-zinc-500 text-right">{formData.bio.length}/500</p>
            </div>

            {/* gamertags section */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-zinc-500 uppercase tracking-wider border-b border-zinc-200 dark:border-zinc-800 pb-2">Gamertags</h3>
              
              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 flex items-center justify-center bg-[#171a21] text-white rounded-lg shrink-0">
                    <SiSteam className="w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    value={formData.steamId}
                    onChange={(e) => setFormData({ ...formData, steamId: e.target.value })}
                    className="flex-1 p-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-transparent focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    placeholder="Steam ID"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 flex items-center justify-center bg-[#003087] text-white rounded-lg shrink-0">
                    <SiPlaystation className="w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    value={formData.psnId}
                    onChange={(e) => setFormData({ ...formData, psnId: e.target.value })}
                    className="flex-1 p-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-transparent focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    placeholder="PSN ID"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 flex items-center justify-center bg-[#107C10] text-white rounded-lg shrink-0">
                    <FaXbox className="w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    value={formData.xboxGamertag}
                    onChange={(e) => setFormData({ ...formData, xboxGamertag: e.target.value })}
                    className="flex-1 p-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-transparent focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    placeholder="Xbox Gamertag"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 flex items-center justify-center bg-[#e60012] text-white rounded-lg shrink-0">
                    <SiNintendoswitch className="w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    value={formData.nintendoFriendCode}
                    onChange={(e) => setFormData({ ...formData, nintendoFriendCode: e.target.value })}
                    className="flex-1 p-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-transparent focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    placeholder="SW-XXXX-XXXX-XXXX"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 flex items-center justify-center bg-[#FF4747] text-white rounded-lg shrink-0">
                    <SiEa className="w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    value={formData.eaId}
                    onChange={(e) => setFormData({ ...formData, eaId: e.target.value })}
                    className="flex-1 p-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-transparent focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    placeholder="EA ID"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 flex items-center justify-center bg-[#0091DA] text-white rounded-lg shrink-0">
                    <SiUbisoft className="w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    value={formData.ubisoftId}
                    onChange={(e) => setFormData({ ...formData, ubisoftId: e.target.value })}
                    className="flex-1 p-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-transparent focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    placeholder="Ubisoft Connect"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 flex items-center justify-center bg-[#5c2e91] text-white rounded-lg shrink-0">
                    <SiGogdotcom className="w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    value={formData.gogId}
                    onChange={(e) => setFormData({ ...formData, gogId: e.target.value })}
                    className="flex-1 p-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-transparent focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    placeholder="GOG Galaxy"
                  />
                </div>
              </div>
            </div>

            {/* socials section */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-zinc-500 uppercase tracking-wider border-b border-zinc-200 dark:border-zinc-800 pb-2">Socials</h3>
              
              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 flex items-center justify-center bg-black text-white rounded-lg shrink-0">
                    <SiX className="w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    value={formData.twitter}
                    onChange={(e) => setFormData({ ...formData, twitter: e.target.value })}
                    className="flex-1 p-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-transparent focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    placeholder="X (Twitter) Handle"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 flex items-center justify-center bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500 text-white rounded-lg shrink-0">
                    <SiInstagram className="w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    value={formData.instagram}
                    onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                    className="flex-1 p-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-transparent focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    placeholder="Instagram Handle"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 flex items-center justify-center bg-[#5865F2] text-white rounded-lg shrink-0">
                    <SiDiscord className="w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    value={formData.discord}
                    onChange={(e) => setFormData({ ...formData, discord: e.target.value })}
                    className="flex-1 p-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-transparent focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    placeholder="Discord Username"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 flex items-center justify-center bg-[#9146FF] text-white rounded-lg shrink-0">
                    <SiTwitch className="w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    value={formData.twitch}
                    onChange={(e) => setFormData({ ...formData, twitch: e.target.value })}
                    className="flex-1 p-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-transparent focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    placeholder="Twitch Channel"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 flex items-center justify-center bg-[#FF0000] text-white rounded-lg shrink-0">
                    <SiYoutube className="w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    value={formData.youtube}
                    onChange={(e) => setFormData({ ...formData, youtube: e.target.value })}
                    className="flex-1 p-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-transparent focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    placeholder="YouTube Channel"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* footer actions */}
          <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 flex justify-end gap-3 bg-zinc-50 dark:bg-zinc-900/50">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={loading || uploadingAvatar || uploadingHeader}
              className="px-6 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-colors font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
