import React, { useState, useEffect, useRef } from 'react';
import { Check, Pencil } from 'lucide-react';

interface InlineEditableFieldProps {
  value: string;
  isEditing: boolean;
  onSave: (value: string) => Promise<void>;
  className?: string;
  inputClassName?: string;
  placeholder?: string;
  forceEdit?: boolean;
}

export default function InlineEditableField({
  value,
  isEditing,
  onSave,
  className = '',
  inputClassName = '',
  placeholder = '',
  forceEdit = false,
}: InlineEditableFieldProps) {
  const [localValue, setLocalValue] = useState(value);
  const [isLocalEditing, setIsLocalEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  useEffect(() => {
    if (!isEditing) {
      setIsLocalEditing(false);
    }
  }, [isEditing]);

  useEffect(() => {
    if (isLocalEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isLocalEditing]);

  const handleSave = async () => {
    if (localValue === value) {
      setIsLocalEditing(false);
      return;
    }
    setSaving(true);
    try {
      await onSave(localValue);
      setIsLocalEditing(false);
    } catch {
      setLocalValue(value);
    } finally {
      setSaving(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSave();
    if (e.key === 'Escape') {
      setLocalValue(value);
      setIsLocalEditing(false);
    }
  };

  if (!isEditing && !forceEdit) {
    return <span className={className}>{value || placeholder}</span>;
  }

  if (isLocalEditing || forceEdit) {
    return (
      <span className="inline-flex items-center gap-1.5 w-full">
        <input
          ref={inputRef}
          type="text"
          value={localValue}
          onChange={e => setLocalValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleSave}
          placeholder={placeholder}
          className={`bg-background/80 text-foreground border-b border-foreground/40 focus:outline-none focus:border-foreground px-1 py-0.5 transition-colors ${inputClassName}`}
          disabled={saving}
        />
        {saving && <span className="text-xs opacity-50">…</span>}
      </span>
    );
  }

  return (
    <span className={`group inline-flex items-center gap-1.5 cursor-pointer ${className}`}>
      <span>{value || <span className="opacity-40">{placeholder}</span>}</span>
      {isEditing && (
        <button
          onClick={() => setIsLocalEditing(true)}
          className="opacity-0 group-hover:opacity-60 hover:!opacity-100 transition-opacity"
          aria-label="Edit"
        >
          <Pencil size={12} />
        </button>
      )}
    </span>
  );
}
