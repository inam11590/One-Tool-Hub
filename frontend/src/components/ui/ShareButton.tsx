'use client';

import { useState, useRef, useEffect } from 'react';
import { Share2, Check, Copy, ExternalLink } from 'lucide-react';

interface ShareButtonProps {
  title: string;
  text?: string;
  url?: string;
  className?: string;
  variant?: 'outline' | 'subtle' | 'primary';
  size?: 'sm' | 'md';
}

export function ShareButton({
  title,
  text = 'Check out this free, browser-processed tool on OneToolHub:',
  url,
  className = '',
  variant = 'outline',
  size = 'md',
}: ShareButtonProps) {
  const [copied, setCopied] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(false);
  const [hasNativeShare, setHasNativeShare] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check if Web Share API is available (primarily mobile devices & macOS Safari)
    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      setHasNativeShare(true);
    }
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpenDropdown(false);
      }
    }
    if (openDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openDropdown]);

  const getResolvedUrl = () => {
    if (url) {
      if (url.startsWith('http')) return url;
      if (typeof window !== 'undefined') {
        return `${window.location.origin}${url.startsWith('/') ? url : `/${url}`}`;
      }
      return `https://one-tool-hub-sooty.vercel.app${url.startsWith('/') ? url : `/${url}`}`;
    }
    if (typeof window !== 'undefined') {
      return window.location.href;
    }
    return 'https://one-tool-hub-sooty.vercel.app';
  };

  const handleShare = async () => {
    const targetUrl = getResolvedUrl();
    const shareData = {
      title,
      text: `${text} ${title}`,
      url: targetUrl,
    };

    if (hasNativeShare) {
      try {
        await navigator.share(shareData);
        return;
      } catch (err: unknown) {
        // If user cancelled, do nothing. If error, fall back to dropdown
        if (err instanceof Error && err.name === 'AbortError') {
          return;
        }
      }
    }

    // Toggle dropdown fallback for desktop or when native share is unavailable
    setOpenDropdown((prev) => !prev);
  };

  const copyToClipboard = async () => {
    const targetUrl = getResolvedUrl();
    try {
      await navigator.clipboard.writeText(targetUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback for older clipboard access
      const textArea = document.createElement('textarea');
      textArea.value = targetUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const targetUrl = getResolvedUrl();
  const shareText = encodeURIComponent(`${text} ${title}`);
  const encodedUrl = encodeURIComponent(targetUrl);

  const twitterUrl = `https://twitter.com/intent/tweet?text=${shareText}&url=${encodedUrl}`;
  const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
  const redditUrl = `https://reddit.com/submit?url=${encodedUrl}&title=${encodeURIComponent(title)}`;
  const whatsappUrl = `https://api.whatsapp.com/send?text=${shareText}%20${encodedUrl}`;

  const baseStyles =
    size === 'sm'
      ? 'px-2.5 py-1.5 text-xs gap-1.5'
      : 'px-3 py-2 text-sm gap-2';

  const variantStyles =
    variant === 'primary'
      ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-xs'
      : variant === 'subtle'
      ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
      : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 shadow-xs';

  return (
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={handleShare}
        aria-haspopup="true"
        aria-expanded={openDropdown}
        className={`inline-flex items-center font-medium rounded-lg transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ${baseStyles} ${variantStyles}`}
        title="Share this page"
      >
        <Share2 className={size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'} aria-hidden="true" />
        <span>Share</span>
      </button>

      {openDropdown && (
        <div
          role="menu"
          aria-orientation="vertical"
          className="absolute right-0 mt-2 w-64 rounded-xl bg-white shadow-xl ring-1 ring-black/10 p-2 z-50 text-slate-800 animate-in fade-in zoom-in-95 duration-100"
        >
          <div className="px-2 py-1.5 border-b border-slate-100 mb-1">
            <p className="text-xs font-semibold text-slate-900">Share this page</p>
            <p className="text-[11px] text-slate-500 truncate" title={title}>
              {title}
            </p>
          </div>

          <div className="space-y-0.5">
            <button
              type="button"
              role="menuitem"
              onClick={copyToClipboard}
              className="w-full flex items-center justify-between px-2.5 py-2 text-xs font-medium text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <span className="flex items-center gap-2">
                {copied ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <Copy className="w-3.5 h-3.5 text-slate-500" />
                )}
                <span>{copied ? 'Copied to clipboard!' : 'Copy direct link'}</span>
              </span>
              {copied && <span className="text-[10px] text-emerald-600 font-bold">Done</span>}
            </button>

            <a
              href={twitterUrl}
              target="_blank"
              rel="noopener noreferrer"
              role="menuitem"
              className="w-full flex items-center justify-between px-2.5 py-2 text-xs font-medium text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <span className="flex items-center gap-2">
                <span className="w-3.5 text-center font-bold text-slate-900">𝕏</span>
                <span>Share on X (Twitter)</span>
              </span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </a>

            <a
              href={linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              role="menuitem"
              className="w-full flex items-center justify-between px-2.5 py-2 text-xs font-medium text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <span className="flex items-center gap-2">
                <span className="w-3.5 text-center font-bold text-sky-700">in</span>
                <span>Share on LinkedIn</span>
              </span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </a>

            <a
              href={redditUrl}
              target="_blank"
              rel="noopener noreferrer"
              role="menuitem"
              className="w-full flex items-center justify-between px-2.5 py-2 text-xs font-medium text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <span className="flex items-center gap-2">
                <span className="w-3.5 text-center font-bold text-orange-600">r/</span>
                <span>Share on Reddit</span>
              </span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </a>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              role="menuitem"
              className="w-full flex items-center justify-between px-2.5 py-2 text-xs font-medium text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <span className="flex items-center gap-2">
                <span className="w-3.5 text-center font-bold text-emerald-600">💬</span>
                <span>Share via WhatsApp</span>
              </span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
