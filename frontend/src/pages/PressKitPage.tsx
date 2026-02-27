import React, { useState, useEffect } from 'react';
import { Download, ExternalLink, Play, X } from 'lucide-react';
import { useAppTheme } from '../App';
import { useEditMode } from '../hooks/useEditMode';
import {
  useGetGameTitle, useGetTagline, useGetAboutText, useGetFeatures,
  useGetGameDetails, useGetInstagramLink, useGetDeveloperLink, useGetPressEmail,
  useCheckPasswordEnabled, useVerifyPassword,
  useUpdateGameTitle, useUpdateTagline, useUpdateAboutText, useUpdateFeatures,
  useUpdateGameDetails, useUpdateInstagramLink, useUpdateDeveloperLink, useUpdatePressEmail,
} from '../hooks/useQueries';
import InlineEditableField from '../components/InlineEditableField';
import EditableFeaturesList from '../components/EditableFeaturesList';
import PasswordModal from '../components/PasswordModal';
import { toast } from 'sonner';

const SCREENSHOTS = [
  '/assets/screen01.png',
  '/assets/screen02.png',
  '/assets/screen03.png',
  '/assets/screen04.png',
  '/assets/screen05.png',
  '/assets/screen06.png',
];

const VIDEO_ID = 'C-Q0-2kiFhs';

export default function PressKitPage() {
  const { isDark } = useAppTheme();
  const { isEditing } = useEditMode();

  // Password protection
  const { data: passwordEnabled, isLoading: passwordLoading } = useCheckPasswordEnabled();
  const [verified, setVerified] = useState(false);
  const verifyMutation = useVerifyPassword();

  // Content
  const { data: gameTitle = 'Poke A Nose' } = useGetGameTitle();
  const { data: tagline = '' } = useGetTagline();
  const { data: aboutText = '' } = useGetAboutText();
  const { data: features = [] } = useGetFeatures();
  const { data: gameDetails } = useGetGameDetails();
  const { data: instagramLink = '' } = useGetInstagramLink();
  const { data: developerLink = '' } = useGetDeveloperLink();
  const { data: pressEmail = '' } = useGetPressEmail();

  // Update mutations
  const updateTitle = useUpdateGameTitle();
  const updateTagline = useUpdateTagline();
  const updateAbout = useUpdateAboutText();
  const updateFeatures = useUpdateFeatures();
  const updateDetails = useUpdateGameDetails();
  const updateInstagram = useUpdateInstagramLink();
  const updateDeveloper = useUpdateDeveloperLink();
  const updateEmail = useUpdatePressEmail();

  // Video modal
  const [videoOpen, setVideoOpen] = useState(false);

  // Screenshot fullscreen
  const [fullscreenIndex, setFullscreenIndex] = useState<number | null>(null);

  useEffect(() => {
    if (fullscreenIndex !== null) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [fullscreenIndex]);

  const handleVerify = async (password: string) => {
    const result = await verifyMutation.mutateAsync(password);
    if (result) {
      setVerified(true);
    } else {
      throw new Error('Incorrect password');
    }
  };

  // Show password modal if protection is enabled and not verified
  if (!passwordLoading && passwordEnabled && !verified) {
    return (
      <div className="relative min-h-[calc(100vh-4rem)]">
        <div
          className="fixed inset-0 -z-10"
          style={{
            backgroundImage: "url('/assets/background_web.jpg')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed',
            filter: isDark ? 'invert(1)' : 'none',
            transition: 'filter 0.3s ease',
          }}
        />
        <PasswordModal onVerify={handleVerify} />
      </div>
    );
  }

  const handleSaveDetail = async (field: 'genre' | 'platforms' | 'releaseDate', value: string) => {
    const current = gameDetails || { genre: '', platforms: '', releaseDate: '' };
    await updateDetails.mutateAsync({
      genre: field === 'genre' ? value : current.genre,
      platforms: field === 'platforms' ? value : current.platforms,
      releaseDate: field === 'releaseDate' ? value : current.releaseDate,
    });
    toast.success('Saved');
  };

  return (
    <div className="relative">
      {/* Background */}
      <div
        className="fixed inset-0 -z-10"
        style={{
          backgroundImage: "url('/assets/background_web.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
          filter: isDark ? 'invert(1)' : 'none',
          transition: 'filter 0.3s ease',
        }}
      />

      <div className="max-w-4xl mx-auto px-6 py-16 space-y-16">

        {/* ── Hero ── */}
        <section className="text-center space-y-3">
          <h1 className="text-editorial-xl text-foreground">
            <InlineEditableField
              value={gameTitle}
              isEditing={isEditing}
              onSave={async v => { await updateTitle.mutateAsync(v); toast.success('Title saved'); }}
              className="font-heading"
              inputClassName="text-editorial-xl font-heading text-center w-full"
            />
          </h1>
          <p className="text-xl opacity-70">
            <InlineEditableField
              value={tagline}
              isEditing={isEditing}
              onSave={async v => { await updateTagline.mutateAsync(v); toast.success('Tagline saved'); }}
              inputClassName="text-xl text-center w-full"
            />
          </p>
        </section>

        {/* ── Video ── */}
        <section>
          <div
            className="relative cursor-pointer group overflow-hidden"
            onClick={() => setVideoOpen(true)}
          >
            <img
              src="/assets/video_thumbnail.png"
              alt="Game trailer thumbnail"
              className="w-full object-cover"
              style={{ maxHeight: '480px', objectPosition: 'center top' }}
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors">
              <div className="w-16 h-16 flex items-center justify-center bg-background/90 rounded-full">
                <Play size={24} className="text-foreground ml-1" fill="currentColor" />
              </div>
            </div>
          </div>
        </section>

        {/* ── About ── */}
        <section>
          <h2 className="text-editorial-md text-foreground mb-4">About the Game</h2>
          <div className="section-divider" />
          {isEditing ? (
            <EditableTextArea
              value={aboutText}
              onSave={async v => { await updateAbout.mutateAsync(v); toast.success('About text saved'); }}
            />
          ) : (
            <p className="text-base leading-relaxed max-w-2xl">{aboutText}</p>
          )}
        </section>

        {/* ── Features ── */}
        <section>
          <h2 className="text-editorial-md text-foreground mb-4">Features</h2>
          <div className="section-divider" />
          <EditableFeaturesList
            features={features}
            isEditing={isEditing}
            onSave={async items => { await updateFeatures.mutateAsync(items); toast.success('Features saved'); }}
          />
        </section>

        {/* ── Game Details ── */}
        <section>
          <h2 className="text-editorial-md text-foreground mb-4">Game Details</h2>
          <div className="section-divider" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { label: 'Genre', field: 'genre' as const, value: gameDetails?.genre || '' },
              { label: 'Platforms', field: 'platforms' as const, value: gameDetails?.platforms || '' },
              { label: 'Release Date', field: 'releaseDate' as const, value: gameDetails?.releaseDate || '' },
            ].map(({ label, field, value }) => (
              <div key={field}>
                <p className="text-xs uppercase tracking-widest opacity-50 mb-1">{label}</p>
                <InlineEditableField
                  value={value}
                  isEditing={isEditing}
                  onSave={v => handleSaveDetail(field, v)}
                  className="text-base font-medium"
                  inputClassName="text-base font-medium w-full"
                />
              </div>
            ))}
          </div>
        </section>

        {/* ── Media / Screenshots ── */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-editorial-md text-foreground">Screenshots</h2>
            <a
              href="/assets/PokeANose_MediaImages.zip"
              download
              className="flex items-center gap-2 text-xs opacity-60 hover:opacity-100 transition-opacity"
            >
              <Download size={14} />
              Download all Screenshots as ZIP (6.6MB)
            </a>
          </div>
          <div className="section-divider" />
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {SCREENSHOTS.map((src, i) => (
              <button
                key={src}
                onClick={() => setFullscreenIndex(i)}
                className="overflow-hidden group focus:outline-none"
                aria-label={`View screenshot ${i + 1}`}
              >
                <img
                  src={src}
                  alt={`Screenshot ${i + 1}`}
                  className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </button>
            ))}
          </div>
        </section>

        {/* ── Social Media ── */}
        {(instagramLink || isEditing) && (
          <section>
            <h2 className="text-editorial-md text-foreground mb-4">Social Media</h2>
            <div className="section-divider" />
            <div className="flex flex-col gap-3">
              {instagramLink && (
                <a
                  href={instagramLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 w-fit hover:opacity-70 transition-opacity"
                >
                  <img
                    src="/assets/generated/instagram-icon-transparent.dim_64x64.png"
                    alt="Instagram"
                    className={`w-8 h-8 ${isDark ? 'invert' : ''}`}
                    style={{ transition: 'filter 0.3s ease' }}
                  />
                  <span className="text-sm">Follow on Instagram</span>
                </a>
              )}
              {isEditing && (
                <div className="mt-2">
                  <p className="text-xs opacity-50 mb-1">Instagram URL</p>
                  <InlineEditableField
                    value={instagramLink}
                    isEditing={isEditing}
                    onSave={async v => { await updateInstagram.mutateAsync(v); toast.success('Instagram link saved'); }}
                    placeholder="https://instagram.com/..."
                    inputClassName="text-sm w-full"
                    forceEdit
                  />
                </div>
              )}
            </div>
          </section>
        )}

        {/* ── Developer ── */}
        <section>
          <h2 className="text-editorial-md text-foreground mb-4">Developer</h2>
          <div className="section-divider" />
          <div className="flex items-center gap-2">
            {isEditing ? (
              <InlineEditableField
                value={developerLink}
                isEditing={isEditing}
                onSave={async v => { await updateDeveloper.mutateAsync(v); toast.success('Developer link saved'); }}
                placeholder="https://..."
                inputClassName="text-sm w-full"
                forceEdit
              />
            ) : (
              developerLink && (
                <a
                  href={developerLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-sm hover:opacity-70 transition-opacity"
                >
                  <ExternalLink size={14} />
                  {developerLink}
                </a>
              )
            )}
          </div>
        </section>

        {/* ── Press & Support ── */}
        <section>
          <h2 className="text-editorial-md text-foreground mb-4">Press & Support</h2>
          <div className="section-divider" />
          {isEditing ? (
            <InlineEditableField
              value={pressEmail}
              isEditing={isEditing}
              onSave={async v => { await updateEmail.mutateAsync(v); toast.success('Press email saved'); }}
              placeholder="press@..."
              inputClassName="text-sm w-full"
              forceEdit
            />
          ) : (
            pressEmail && (
              <a
                href={`mailto:${pressEmail}`}
                className="text-sm hover:opacity-70 transition-opacity"
              >
                {pressEmail}
              </a>
            )
          )}
        </section>

        {/* ── Footer / Kaboom ── */}
        <footer className="pt-8 pb-4 flex flex-col items-center gap-6">
          <img
            src="/assets/kaboom-2025.png"
            alt="Kaboom Animation Festival 2025"
            className={`w-64 h-auto ${isDark ? 'invert' : ''}`}
            style={{ transition: 'filter 0.3s ease' }}
          />
          <p className="text-xs opacity-30 text-center">
            © {new Date().getFullYear()} Poke A Nose. Built with{' '}
            <span>♥</span>{' '}
            using{' '}
            <a
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname || 'poke-a-nose')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:opacity-70 transition-opacity"
            >
              caffeine.ai
            </a>
          </p>
        </footer>
      </div>

      {/* ── Video Modal ── */}
      {videoOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
          onClick={() => setVideoOpen(false)}
        >
          <button
            className="absolute top-4 right-4 text-white/80 hover:text-white"
            onClick={() => setVideoOpen(false)}
            aria-label="Close video"
          >
            <X size={28} />
          </button>
          <div
            className="w-full max-w-4xl aspect-video px-4"
            onClick={e => e.stopPropagation()}
          >
            <iframe
              src={`https://www.youtube.com/embed/${VIDEO_ID}?autoplay=1&playsinline=1&fs=0`}
              title="Poke A Nose Trailer"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              className="w-full h-full"
            />
          </div>
        </div>
      )}

      {/* ── Fullscreen Screenshot ── */}
      {fullscreenIndex !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black cursor-pointer"
          onClick={() => setFullscreenIndex(null)}
        >
          <img
            src={SCREENSHOTS[fullscreenIndex]}
            alt={`Screenshot ${fullscreenIndex + 1}`}
            className="max-w-full max-h-full object-contain cursor-pointer"
            onClick={() => setFullscreenIndex(null)}
          />
          <button
            className="absolute top-4 right-4 text-white/80 hover:text-white"
            onClick={() => setFullscreenIndex(null)}
            aria-label="Close"
          >
            <X size={28} />
          </button>
        </div>
      )}
    </div>
  );
}

// ── Inline textarea for about text ──
function EditableTextArea({ value, onSave }: { value: string; onSave: (v: string) => Promise<void> }) {
  const [text, setText] = useState(value);
  const [saving, setSaving] = useState(false);

  useEffect(() => { setText(value); }, [value]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(text);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-2">
      <textarea
        value={text}
        onChange={e => setText(e.target.value)}
        rows={5}
        className="w-full max-w-2xl px-3 py-2 text-base bg-background/80 text-foreground border border-foreground/20 focus:outline-none focus:border-foreground/60 resize-none transition-colors"
      />
      <button
        onClick={handleSave}
        disabled={saving || text === value}
        className="px-4 py-1.5 text-xs bg-foreground text-background hover:bg-foreground/85 transition-colors disabled:opacity-40"
      >
        {saving ? 'Saving…' : 'Save'}
      </button>
    </div>
  );
}
