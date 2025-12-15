"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Check, AlertCircle } from "lucide-react";

interface SettingsFormProps {
  currentUsername: string | null;
  userId: string;
}

export default function SettingsForm({ currentUsername, userId }: SettingsFormProps) {
  const router = useRouter();
  const [username, setUsername] = useState(currentUsername || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const validateUsername = (value: string): string | null => {
    if (!value) return null; // Empty is allowed
    if (value.length < 3) return "Username must be at least 3 characters";
    if (value.length > 30) return "Username must be 30 characters or less";
    if (!/^[a-zA-Z0-9_-]+$/.test(value)) {
      return "Username can only contain letters, numbers, underscores, and hyphens";
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationError = validateUsername(username);
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch("/api/settings/username", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username || null }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update username");
      }

      setSuccess(true);
      toast.success("Username updated successfully!");
      router.refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const hasChanged = username !== (currentUsername || "");

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="username" className="block text-sm font-medium mb-2">
          Username
        </label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              @
            </span>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value.toLowerCase());
                setError(null);
                setSuccess(false);
              }}
              placeholder="your-username"
              className="w-full pl-8 pr-4 py-3 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !hasChanged}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center gap-2"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : success ? (
              <Check className="w-4 h-4" />
            ) : null}
            Save
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-red-600 dark:text-red-400 text-sm">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      {username && !error && (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Your profile URL will be:{" "}
          <span className="font-mono text-blue-600 dark:text-blue-400">
            gamesled ger.com/u/{username}
          </span>
        </p>
      )}

      <p className="text-xs text-gray-400 dark:text-gray-500">
        Note: Custom username URLs are coming soon. Currently your profile uses your user ID.
      </p>
    </form>
  );
}
