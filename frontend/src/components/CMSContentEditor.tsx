import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import {
  useGetGameTitle, useGetTagline, useGetAboutText, useGetFeatures,
  useGetGameDetails, useGetInstagramLink, useGetDeveloperLink, useGetPressEmail,
  useUpdateGameTitle, useUpdateTagline, useUpdateAboutText, useUpdateFeatures,
  useUpdateGameDetails, useUpdateInstagramLink, useUpdateDeveloperLink, useUpdatePressEmail,
} from '../hooks/useQueries';
import CMSFieldEditor from './CMSFieldEditor';

type AdminSection = 'content' | 'media' | 'social' | 'settings';

interface CMSContentEditorProps {
  section: AdminSection;
}

export default function CMSContentEditor({ section }: CMSContentEditorProps) {
  switch (section) {
    case 'content': return <ContentSection />;
    case 'media': return <MediaSection />;
    case 'social': return <SocialSection />;
    default: return null;
  }
}

function ContentSection() {
  const { data: gameTitle = '' } = useGetGameTitle();
  const { data: tagline = '' } = useGetTagline();
  const { data: aboutText = '' } = useGetAboutText();
  const { data: features = [] } = useGetFeatures();
  const { data: gameDetails } = useGetGameDetails();

  const updateTitle = useUpdateGameTitle();
  const updateTagline = useUpdateTagline();
  const updateAbout = useUpdateAboutText();
  const updateFeatures = useUpdateFeatures();
  const updateDetails = useUpdateGameDetails();

  const [localFeatures, setLocalFeatures] = useState<string[]>(features);
  const [featuresDirty, setFeaturesDirty] = useState(false);

  useEffect(() => { setLocalFeatures(features); setFeaturesDirty(false); }, [features]);

  const handleSaveDetails = async (field: 'genre' | 'platforms' | 'releaseDate', value: string) => {
    const current = gameDetails || { genre: '', platforms: '', releaseDate: '' };
    await updateDetails.mutateAsync({
      genre: field === 'genre' ? value : current.genre,
      platforms: field === 'platforms' ? value : current.platforms,
      releaseDate: field === 'releaseDate' ? value : current.releaseDate,
    });
    toast.success('Saved');
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-3xl mb-1">Content</h1>
        <p className="text-sm opacity-50">Edit press kit text content</p>
      </div>

      <CMSFieldEditor
        label="Game Title"
        value={gameTitle}
        onSave={async v => { await updateTitle.mutateAsync(v); toast.success('Title saved'); }}
      />
      <CMSFieldEditor
        label="Tagline"
        value={tagline}
        onSave={async v => { await updateTagline.mutateAsync(v); toast.success('Tagline saved'); }}
      />
      <CMSFieldEditor
        label="About Text"
        value={aboutText}
        multiline
        onSave={async v => { await updateAbout.mutateAsync(v); toast.success('About text saved'); }}
      />

      {/* Features */}
      <div>
        <p className="text-xs uppercase tracking-widest opacity-50 mb-3">Features (max 4)</p>
        <div className="space-y-2">
          {localFeatures.map((f, i) => (
            <div key={i} className="flex gap-2">
              <input
                type="text"
                value={f}
                onChange={e => {
                  const next = [...localFeatures];
                  next[i] = e.target.value;
                  setLocalFeatures(next);
                  setFeaturesDirty(true);
                }}
                className="flex-1 px-3 py-2 text-sm bg-background text-foreground border border-foreground/15 focus:outline-none focus:border-foreground/50 transition-colors"
                placeholder={`Feature ${i + 1}`}
              />
              <button
                onClick={() => {
                  setLocalFeatures(localFeatures.filter((_, j) => j !== i));
                  setFeaturesDirty(true);
                }}
                className="px-2 text-foreground/40 hover:text-foreground transition-colors text-xs"
              >
                ✕
              </button>
            </div>
          ))}
          {localFeatures.length < 4 && (
            <button
              onClick={() => { setLocalFeatures([...localFeatures, '']); setFeaturesDirty(true); }}
              className="text-xs opacity-50 hover:opacity-100 transition-opacity"
            >
              + Add feature
            </button>
          )}
          {featuresDirty && (
            <button
              onClick={async () => {
                await updateFeatures.mutateAsync(localFeatures.filter(f => f.trim()));
                toast.success('Features saved');
                setFeaturesDirty(false);
              }}
              disabled={updateFeatures.isPending}
              className="px-4 py-1.5 text-xs bg-foreground text-background hover:bg-foreground/85 transition-colors disabled:opacity-40"
            >
              {updateFeatures.isPending ? 'Saving…' : 'Save Features'}
            </button>
          )}
        </div>
      </div>

      {/* Game Details */}
      <div>
        <p className="text-xs uppercase tracking-widest opacity-50 mb-3">Game Details</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <CMSFieldEditor
            label="Genre"
            value={gameDetails?.genre || ''}
            onSave={v => handleSaveDetails('genre', v)}
            compact
          />
          <CMSFieldEditor
            label="Platforms"
            value={gameDetails?.platforms || ''}
            onSave={v => handleSaveDetails('platforms', v)}
            compact
          />
          <CMSFieldEditor
            label="Release Date"
            value={gameDetails?.releaseDate || ''}
            onSave={v => handleSaveDetails('releaseDate', v)}
            compact
          />
        </div>
      </div>
    </div>
  );
}

function MediaSection() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl mb-1">Media</h1>
        <p className="text-sm opacity-50">Screenshots and media assets</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {[1, 2, 3, 4, 5, 6].map(n => (
          <div key={n} className="relative group overflow-hidden">
            <img
              src={`/assets/screen0${n}.png`}
              alt={`Screenshot ${n}`}
              className="w-full h-32 object-cover"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
              <span className="text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                screen0{n}.png
              </span>
            </div>
          </div>
        ))}
      </div>
      <p className="text-xs opacity-40">
        Screenshots are served from static assets. Upload new screenshots to replace the existing files.
      </p>
    </div>
  );
}

function SocialSection() {
  const { data: instagramLink = '' } = useGetInstagramLink();
  const { data: developerLink = '' } = useGetDeveloperLink();
  const { data: pressEmail = '' } = useGetPressEmail();

  const updateInstagram = useUpdateInstagramLink();
  const updateDeveloper = useUpdateDeveloperLink();
  const updateEmail = useUpdatePressEmail();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-3xl mb-1">Social & Contact</h1>
        <p className="text-sm opacity-50">Manage links and contact information</p>
      </div>
      <CMSFieldEditor
        label="Instagram URL"
        value={instagramLink}
        placeholder="https://instagram.com/..."
        onSave={async v => { await updateInstagram.mutateAsync(v); toast.success('Instagram link saved'); }}
      />
      <CMSFieldEditor
        label="Developer Website"
        value={developerLink}
        placeholder="https://..."
        onSave={async v => { await updateDeveloper.mutateAsync(v); toast.success('Developer link saved'); }}
      />
      <CMSFieldEditor
        label="Press Email"
        value={pressEmail}
        placeholder="press@..."
        onSave={async v => { await updateEmail.mutateAsync(v); toast.success('Press email saved'); }}
      />
    </div>
  );
}
