import { createContext, useContext, useState, useCallback } from 'react';

interface EditModeContextType {
  isEditing: boolean;
  toggleEditing: () => void;
  setEditing: (v: boolean) => void;
}

export const EditModeContext = createContext<EditModeContextType>({
  isEditing: false,
  toggleEditing: () => {},
  setEditing: () => {},
});

export function useEditMode() {
  return useContext(EditModeContext);
}

export function useEditModeState(): EditModeContextType {
  const [isEditing, setIsEditing] = useState(false);
  const toggleEditing = useCallback(() => setIsEditing(v => !v), []);
  const setEditing = useCallback((v: boolean) => setIsEditing(v), []);
  return { isEditing, toggleEditing, setEditing };
}
