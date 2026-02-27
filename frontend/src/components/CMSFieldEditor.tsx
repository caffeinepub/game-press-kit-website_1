import React, { useState, useEffect } from 'react';
import { Check, Loader2 } from 'lucide-react';

interface CMSFieldEditorProps {
  label: string;
  value: string;
  onSave: (value: string) => Promise<void>;
  multiline?: boolean;
  placeholder?: string;
  compact?: boolean;
}

export default function CMSFieldEditor({
  label,
  value,
  onSave,
  multiline = false,
  placeholder = '',
  compact = false,
}: CMSFieldEditorProps) {
  const [localValue, setLocalValue] = useState(value);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleSave = async () => {
    if (localValue === value) return;
    setSaving(true);
    try {
      await onSave(localValue);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      setLocalValue(value);
    } finally {
      setSaving(false);
    }
  };

  const isDirty = localValue !== value;

  return (
    <div className={compact ? '' : 'space-y-1.5'}>
      <label className="text-xs uppercase tracking-widest opacity-50 block mb-1.5">{label}</label>
      {multiline ? (
        <textarea
          value={localValue}
          onChange={e => setLocalValue(e.target.value)}
          placeholder={placeholder}
          rows={5}
          className="w-full px-3 py-2 text-sm bg-background text-foreground border border-foreground/15 focus:outline-none focus:border-foreground/50 resize-none transition-colors"
        />
      ) : (
        <input
          type="text"
          value={localValue}
          onChange={e => setLocalValue(e.target.value)}
          placeholder={placeholder}
          className="w-full px-3 py-2 text-sm bg-background text-foreground border border-foreground/15 focus:outline-none focus:border-foreground/50 transition-colors"
          onKeyDown={e => e.key === 'Enter' && handleSave()}
        />
      )}
      <div className="flex items-center gap-2 pt-1">
        <button
          onClick={handleSave}
          disabled={saving || !isDirty}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-foreground text-background hover:bg-foreground/85 transition-colors disabled:opacity-30"
        >
          {saving ? (
            <><Loader2 size={11} className="animate-spin" /> Saving…</>
          ) : saved ? (
            <><Check size={11} /> Saved</>
          ) : (
            'Save'
          )}
        </button>
      </div>
    </div>
  );
}
