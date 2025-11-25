"use client";

import { useState } from "react";
import { updateProfile } from "@/app/actions";
import { toast } from "sonner";
import { X, Upload, Loader2 } from "lucide-react";
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

interface EditProfileModalProps {
  user: any;
  onClose: () => void;
}

export default function EditProfileModal({ user, onClose }: EditProfileModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    bio: user.bio || "",
    headerUrl: user.headerUrl || "",
    avatarUrl: user.avatarUrl || "",
    steamId: user.steamId || "",
    psnId: user.psnId || "",
    xboxGamertag: user.xboxGamertag || "",
    nintendoFriendCode: user.nintendoFriendCode || "",
    eaId: user.eaId || "",
    ubisoftId: user.ubisoftId || "",
    gogId: user.gogId || "",
    twitter: user.twitter || "",
    instagram: user.instagram || "",
    discord: user.discord || "",
    twitch: user.twitch || "",
    youtube: user.youtube || "",
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'avatarUrl' | 'headerUrl') => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024) { // 1MB limit
        toast.error("File size must be less than 1MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, [field]: reader.result as string });
      };
      reader.readAsDataURL(file);
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
      window.location.reload();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 flex flex-col max-h-[90vh]">
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
          {/* Images Section */}
          <div className="space-y-6">
            <h3 className="text-sm font-medium text-zinc-500 uppercase tracking-wider border-b border-zinc-200 dark:border-zinc-800 pb-2">Images</h3>
            
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Profile Picture</label>
                <div className="flex items-center gap-4">
                  <div className="relative w-20 h-20 rounded-full overflow-hidden bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
                    {formData.avatarUrl ? (
                      <Image src={formData.avatarUrl} alt="Avatar" fill className="object-cover" />
                    ) : (
                      <div className="flex items-center justify-center w-full h-full text-zinc-400">
                        <Upload className="w-6 h-6" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      aria-label="Upload Profile Picture"
                      onChange={(e) => handleFileChange(e, 'avatarUrl')}
                      className="text-sm text-zinc-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900/30 dark:file:text-blue-400"
                    />
                    <p className="text-xs text-zinc-500 mt-1">Max 1MB</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Header Image</label>
                <div className="flex items-center gap-4">
                  <div className="relative w-32 h-20 rounded-lg overflow-hidden bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
                    {formData.headerUrl ? (
                      <Image src={formData.headerUrl} alt="Header" fill className="object-cover" />
                    ) : (
                      <div className="flex items-center justify-center w-full h-full text-zinc-400">
                        <Upload className="w-6 h-6" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      aria-label="Upload Header Image"
                      onChange={(e) => handleFileChange(e, 'headerUrl')}
                      className="text-sm text-zinc-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900/30 dark:file:text-blue-400"
                    />
                    <p className="text-xs text-zinc-500 mt-1">Max 1MB</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bio Section */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-500 uppercase tracking-wider">Bio</label>
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              className="w-full p-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-transparent focus:ring-2 focus:ring-blue-500 outline-none transition-all min-h-[100px]"
              placeholder="Tell us about yourself..."
            />
          </div>

          {/* Gamertags Section */}
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
                  placeholder="Nintendo Friend Code"
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

          {/* Socials Section */}
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

        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 flex justify-end gap-3 bg-zinc-50 dark:bg-zinc-900/50">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
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
  );
}
