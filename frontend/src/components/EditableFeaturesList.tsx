import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Check } from 'lucide-react';

interface EditableFeaturesListProps {
  features: string[];
  isEditing: boolean;
  onSave: (items: string[]) => Promise<void>;
}

export default function EditableFeaturesList({ features, isEditing, onSave }: EditableFeaturesListProps) {
  const [items, setItems] = useState<string[]>(features);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    setItems(features);
    setDirty(false);
  }, [features]);

  const handleChange = (index: number, value: string) => {
    const next = [...items];
    next[index] = value;
    setItems(next);
    setDirty(true);
  };

  const handleAdd = () => {
    if (items.length < 4) {
      setItems([...items, '']);
      setDirty(true);
    }
  };

  const handleRemove = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
    setDirty(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(items.filter(i => i.trim()));
      setDirty(false);
    } finally {
      setSaving(false);
    }
  };

  if (!isEditing) {
    return (
      <ul className="space-y-2">
        {features.map((f, i) => (
          <li key={i} className="flex items-start gap-2 text-base">
            <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-foreground/40 flex-shrink-0" />
            {f}
          </li>
        ))}
      </ul>
    );
  }

  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-2">
          <input
            type="text"
            value={item}
            onChange={e => handleChange(i, e.target.value)}
            placeholder={`Feature ${i + 1}`}
            className="flex-1 px-3 py-1.5 text-sm bg-background/80 text-foreground border border-foreground/20 focus:outline-none focus:border-foreground/60 transition-colors"
          />
          <button
            onClick={() => handleRemove(i)}
            className="text-foreground/40 hover:text-foreground transition-colors"
            aria-label="Remove feature"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ))}
      <div className="flex items-center gap-3 pt-1">
        {items.length < 4 && (
          <button
            onClick={handleAdd}
            className="flex items-center gap-1 text-xs opacity-60 hover:opacity-100 transition-opacity"
          >
            <Plus size={13} /> Add feature
          </button>
        )}
        {dirty && (
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-1 px-3 py-1 text-xs bg-foreground text-background hover:bg-foreground/85 transition-colors disabled:opacity-40"
          >
            <Check size={12} />
            {saving ? 'Saving…' : 'Save'}
          </button>
        )}
      </div>
    </div>
  );
}
