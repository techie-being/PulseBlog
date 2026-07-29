import React, { useState } from "react";
import toast from "react-hot-toast";
import {
  FaLinkedin,
  FaXTwitter,
  FaInstagram,
  FaYoutube,
} from "react-icons/fa6";
import { FiSearch, FiTarget, FiCopy, FiCheck, FiX } from "react-icons/fi";

const AssetGeneratorModal = ({ open, assets, onClose }) => {
  const [activeTab, setActiveTab] = useState("all");
  const [copiedKey, setCopiedKey] = useState(null);

  if (!open || !assets) return null;

  const handleCopy = (key, text) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const tabs = [
    { id: "all", label: "All Assets" },
    { id: "linkedin", label: "LinkedIn", show: assets.linkedin },
    { id: "twitter", label: "Twitter", show: assets.twitter },
    { id: "instagram", label: "Instagram", show: assets.instagram },
    { id: "youtube", label: "YouTube", show: assets.youtube },
    { id: "seo", label: "SEO", show: assets.seo },
    { id: "hooks", label: "Hooks", show: assets.hooks },
  ].filter((tab) => tab.id === "all" || tab.show);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-start justify-center pt-24 pb-8 px-4 z-50 overflow-y-auto animate-fadeIn">
      <div className="bg-white w-full max-w-4xl max-h-[82vh] flex flex-col rounded-3xl shadow-2xl overflow-hidden border border-gray-100 my-auto">
        
        {/* Modal Header */}
        <div className="flex justify-between items-center px-8 py-6 border-b border-gray-100 bg-gray-50/50 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-2xl">
              <i className="fi fi-rr-megaphone text-xl"></i>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">AI Marketing Assets</h2>
              <p className="text-sm text-gray-500">Review, copy, and export your generated content</p>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Close modal"
          >
            <FiX className="text-xl" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex px-8 pt-4 gap-2 border-b border-gray-100 overflow-x-auto scrollbar-none bg-white flex-shrink-0">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-3 px-4 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? "border-indigo-600 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-800"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Modal Body */}
        <div className="p-8 overflow-y-auto space-y-6 bg-gray-50/30 flex-1">
          
          {/* ---------------- LinkedIn ---------------- */}
          {assets.linkedin && (activeTab === "all" || activeTab === "linkedin") && (
            <AssetCard
              icon={<FaLinkedin className="text-[#0A66C2] text-2xl" />}
              title="LinkedIn Post"
              onCopy={() =>
                handleCopy(
                  "linkedin",
                  assets.linkedin.post + "\n\n" + assets.linkedin.hashtags.join(" ")
                )
              }
              isCopied={copiedKey === "linkedin"}
            >
              <p className="whitespace-pre-wrap text-gray-700 leading-relaxed">{assets.linkedin.post}</p>
              <TagList tags={assets.linkedin.hashtags} bg="bg-blue-50" text="text-blue-600" />
            </AssetCard>
          )}

          {/* ---------------- Twitter / X ---------------- */}
          {assets.twitter && (activeTab === "all" || activeTab === "twitter") && (
            <AssetCard
              icon={<FaXTwitter className="text-black text-2xl" />}
              title=" (Twitter) Post"
              onCopy={() =>
                handleCopy(
                  "twitter",
                  `${assets.twitter.tweet}\n\n${assets.twitter.hashtags.join(" ")}`
                )
              }
              isCopied={copiedKey === "twitter"}
            >
              <div className="bg-slate-50 border border-slate-100/80 rounded-2xl p-5">
                <p className="whitespace-pre-wrap text-gray-800 leading-relaxed">{assets.twitter.tweet}</p>
                <TagList tags={assets.twitter.hashtags} bg="bg-slate-200/60" text="text-slate-700" />
              </div>
            </AssetCard>
          )}

          {/* ---------------- Instagram ---------------- */}
          {assets.instagram && (activeTab === "all" || activeTab === "instagram") && (
            <AssetCard
              icon={<FaInstagram className="text-pink-600 text-2xl" />}
              title="Instagram Caption"
              onCopy={() =>
                handleCopy(
                  "instagram",
                  assets.instagram.caption + "\n\n" + assets.instagram.hashtags.join(" ")
                )
              }
              isCopied={copiedKey === "instagram"}
            >
              <p className="whitespace-pre-wrap text-gray-700 leading-relaxed">{assets.instagram.caption}</p>
              <TagList tags={assets.instagram.hashtags} bg="bg-pink-50" text="text-pink-600" />
            </AssetCard>
          )}

          {/* ---------------- YouTube ---------------- */}
          {assets.youtube && (activeTab === "all" || activeTab === "youtube") && (
            <AssetCard
              icon={<FaYoutube className="text-red-600 text-2xl" />}
              title="YouTube Video Kit"
              onCopy={() =>
                handleCopy(
                  "youtube",
                  assets.youtube.title + "\n\n" + assets.youtube.description + "\n\n" + assets.youtube.hashtags.join(" ")
                )
              }
              isCopied={copiedKey === "youtube"}
            >
              <h4 className="font-bold text-lg text-gray-900 mb-2">{assets.youtube.title}</h4>
              <p className="whitespace-pre-wrap text-gray-700 leading-relaxed">{assets.youtube.description}</p>
              <TagList tags={assets.youtube.hashtags} bg="bg-red-50" text="text-red-600" />
            </AssetCard>
          )}

          {/* ---------------- SEO ---------------- */}
          {assets.seo && (activeTab === "all" || activeTab === "seo") && (
            <AssetCard
              icon={<FiSearch className="text-emerald-600 text-2xl" />}
              title="SEO Metadata"
              onCopy={() => handleCopy("seo", JSON.stringify(assets.seo, null, 2))}
              isCopied={copiedKey === "seo"}
            >
              <div className="space-y-4 text-sm">
                <div>
                  <span className="font-semibold text-gray-400 uppercase tracking-wider text-xs">Meta Title</span>
                  <p className="text-gray-900 font-medium mt-0.5">{assets.seo.metaTitle}</p>
                </div>
                <div>
                  <span className="font-semibold text-gray-400 uppercase tracking-wider text-xs">Meta Description</span>
                  <p className="text-gray-700 mt-0.5">{assets.seo.metaDescription}</p>
                </div>
                <div>
                  <span className="font-semibold text-gray-400 uppercase tracking-wider text-xs">URL Slug</span>
                  <p className="text-indigo-600 font-mono bg-indigo-50/50 px-2.5 py-1 rounded-lg mt-0.5 inline-block">{assets.seo.slug}</p>
                </div>
                <TagList tags={assets.seo.keywords} bg="bg-emerald-50" text="text-emerald-700" />
              </div>
            </AssetCard>
          )}

          {/* ---------------- Hooks ---------------- */}
          {assets.hooks && (activeTab === "all" || activeTab === "hooks") && (
            <AssetCard
              icon={<FiTarget className="text-amber-500 text-2xl" />}
              title="Viral Hooks"
              onCopy={() => handleCopy("hooks", assets.hooks.join("\n\n"))}
              isCopied={copiedKey === "hooks"}
            >
              <div className="space-y-3">
                {assets.hooks.map((hook, index) => (
                  <div key={index} className="bg-amber-50/60 border border-amber-100/60 rounded-2xl p-4 text-gray-800 font-medium flex items-start gap-3">
                    <span className="bg-amber-100 text-amber-700 text-xs font-bold px-2 py-0.5 rounded-full mt-0.5">#{index + 1}</span>
                    <p className="flex-1">{hook}</p>
                  </div>
                ))}
              </div>
            </AssetCard>
          )}

        </div>
      </div>
    </div>
  );
};

// Reusable Sub-components for UI Consistency
const AssetCard = ({ icon, title, children, onCopy, isCopied }) => (
  <section className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
    <div className="flex justify-between items-center mb-4">
      <h3 className="flex items-center gap-3 text-lg font-bold text-gray-900">
        {icon}
        {title}
      </h3>
      <button
        onClick={onCopy}
        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
          isCopied
            ? "bg-emerald-600 text-white"
            : "bg-gray-900 text-white hover:bg-gray-800 active:scale-95"
        }`}
      >
        {isCopied ? <FiCheck /> : <FiCopy />}
        {isCopied ? "Copied!" : "Copy"}
      </button>
    </div>
    {children}
  </section>
);

const TagList = ({ tags, bg, text }) => (
  <div className="flex flex-wrap gap-2 mt-4">
    {tags.map((tag, index) => (
      <span key={index} className={`${bg} ${text} px-3 py-1 rounded-full text-xs font-medium`}>
        {tag}
      </span>
    ))}
  </div>
);

export default AssetGeneratorModal;