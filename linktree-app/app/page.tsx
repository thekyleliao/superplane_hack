"use client";

import { useState } from "react";

export default function Home() {
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [links, setLinks] = useState([{ title: "", url: "" }]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleAddLink = () => {
    setLinks([...links, { title: "", url: "" }]);
  };

  const handleRemoveLink = (index: number) => {
    setLinks(links.filter((_, i) => i !== index));
  };

  const handleLinkChange = (index: number, field: "title" | "url", value: string) => {
    const updatedLinks = [...links];
    updatedLinks[index][field] = value;
    setLinks(updatedLinks);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const response = await fetch("/api/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          display_name: displayName,
          links,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create profile");
      }

      setSuccess(true);
      setUsername("");
      setDisplayName("");
      setLinks([{ title: "", url: "" }]);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500 mb-2">
            Claim Your Link
          </h1>
          <p className="text-gray-400 text-lg">One link to rule them all.</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-center">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-500/10 border border-green-500/50 rounded-lg text-green-400 text-center">
            Success! Your link profile has been created and your DNS is being configured.
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="username" className="text-sm font-medium text-gray-300 block">
                Desired Username
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500 pointer-events-none">
                  link.app/
                </span>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase())}
                  required
                  placeholder="your-name"
                  className="w-full pl-20 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="displayName" className="text-sm font-medium text-gray-300 block">
                Display Name
              </label>
              <input
                id="displayName"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
                placeholder="John Doe"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
              />
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-white/10">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Your Links</h2>
              <button
                type="button"
                onClick={handleAddLink}
                className="text-sm px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
              >
                + Add Link
              </button>
            </div>

            {links.map((link, index) => (
              <div key={index} className="flex gap-4 items-start bg-white/5 p-4 rounded-xl border border-white/5 relative group">
                <div className="flex-1 space-y-4">
                  <input
                    type="text"
                    value={link.title}
                    onChange={(e) => handleLinkChange(index, "title", e.target.value)}
                    required
                    placeholder="Link Title (e.g. My Twitter)"
                    className="w-full px-4 py-2 bg-transparent border-b border-white/10 focus:border-purple-500 outline-none transition-colors"
                  />
                  <input
                    type="url"
                    value={link.url}
                    onChange={(e) => handleLinkChange(index, "url", e.target.value)}
                    required
                    placeholder="https://..."
                    className="w-full px-4 py-2 bg-transparent border-b border-white/10 focus:border-purple-500 outline-none text-sm text-gray-300 transition-colors"
                  />
                </div>
                {links.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveLink(index)}
                    className="text-gray-500 hover:text-red-400 p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label="Remove link"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 mt-8 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold rounded-xl shadow-lg transform transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? "Creating..." : "Create Profile"}
          </button>
        </form>
      </div>
    </div>
  );
}
