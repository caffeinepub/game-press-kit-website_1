import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { GameDetails, AdminResult, UpdateContentResult } from '../backend';

// ─── Content Queries ───────────────────────────────────────────────────────────

export function useGetAboutText() {
  const { actor, isFetching } = useActor();
  return useQuery<string>({
    queryKey: ['aboutText'],
    queryFn: async () => {
      if (!actor) return '';
      return actor.getAboutText();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetFeatures() {
  const { actor, isFetching } = useActor();
  return useQuery<string[]>({
    queryKey: ['features'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getFeatures();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetGameDetails() {
  const { actor, isFetching } = useActor();
  return useQuery<GameDetails>({
    queryKey: ['gameDetails'],
    queryFn: async () => {
      if (!actor) return { genre: '', platforms: '', releaseDate: '' };
      return actor.getGameDetails();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetGameTitle() {
  const { actor, isFetching } = useActor();
  return useQuery<string>({
    queryKey: ['gameTitle'],
    queryFn: async () => {
      if (!actor) return '';
      return actor.getGameTitle();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetTagline() {
  const { actor, isFetching } = useActor();
  return useQuery<string>({
    queryKey: ['tagline'],
    queryFn: async () => {
      if (!actor) return '';
      return actor.getTagline();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetInstagramLink() {
  const { actor, isFetching } = useActor();
  return useQuery<string>({
    queryKey: ['instagramLink'],
    queryFn: async () => {
      if (!actor) return '';
      return actor.getInstagramLink();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetDeveloperLink() {
  const { actor, isFetching } = useActor();
  return useQuery<string>({
    queryKey: ['developerLink'],
    queryFn: async () => {
      if (!actor) return '';
      return actor.getDeveloperLink();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetPressEmail() {
  const { actor, isFetching } = useActor();
  return useQuery<string>({
    queryKey: ['pressEmail'],
    queryFn: async () => {
      if (!actor) return '';
      return actor.getPressEmail();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetBodyTextColor() {
  const { actor, isFetching } = useActor();
  return useQuery<string>({
    queryKey: ['bodyTextColor'],
    queryFn: async () => {
      if (!actor) return '#000000';
      return actor.getBodyTextColor();
    },
    enabled: !!actor && !isFetching,
  });
}

// ─── Admin Status Queries ──────────────────────────────────────────────────────

export function useGetAdminStatus() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ['adminStatus'],
    queryFn: async () => {
      if (!actor) return false;
      return actor.getAdminStatus();
    },
    enabled: !!actor && !isFetching,
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });
}

export function useIsCallerAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ['isCallerAdmin'],
    queryFn: async () => {
      if (!actor) return false;
      try {
        return await actor.isCallerAdmin();
      } catch {
        return false;
      }
    },
    enabled: !!actor && !isFetching,
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });
}

// ─── Password Queries ──────────────────────────────────────────────────────────

export function useCheckPasswordEnabled() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ['passwordEnabled'],
    queryFn: async () => {
      if (!actor) return false;
      // verifyPassword with empty string: if it returns true, no password is set
      // We use a dedicated check: verifyPassword('') returns true only when protection is disabled
      // Actually we check by calling verifyPassword with a sentinel — but the backend
      // doesn't expose a direct "isPasswordEnabled" query. We use verifyPassword('') as a proxy:
      // if it returns true → no password set (protection disabled)
      // if it returns false → protection is enabled
      const result = await actor.verifyPassword('__check_enabled__');
      // If verifyPassword returns true for a garbage string, protection is disabled
      return !result;
    },
    enabled: !!actor && !isFetching,
  });
}

export function useVerifyPassword() {
  const { actor } = useActor();
  return useMutation<boolean, Error, string>({
    mutationFn: async (password: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.verifyPassword(password);
    },
  });
}

// ─── Admin Mutations ───────────────────────────────────────────────────────────

export function useInitializeAdmin() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation<AdminResult, Error, { adminToken: string; userProvidedToken: string }>({
    mutationFn: async ({ adminToken, userProvidedToken }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.initializeAdmin(adminToken, userProvidedToken);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminStatus'] });
      queryClient.invalidateQueries({ queryKey: ['isCallerAdmin'] });
    },
  });
}

export function useResetAdmin() {
  const queryClient = useQueryClient();
  const { actor } = useActor();
  return useMutation<void, Error, void>({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.resetAdmin();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminStatus'] });
      queryClient.invalidateQueries({ queryKey: ['isCallerAdmin'] });
    },
  });
}

// ─── Content Mutations ─────────────────────────────────────────────────────────

export function useUpdateAboutText() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation<UpdateContentResult, Error, string>({
    mutationFn: async (text: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateAboutText(text);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['aboutText'] });
    },
  });
}

export function useUpdateFeatures() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation<UpdateContentResult, Error, string[]>({
    mutationFn: async (items: string[]) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateFeatures(items);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['features'] });
    },
  });
}

export function useUpdateGameDetails() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation<UpdateContentResult, Error, GameDetails>({
    mutationFn: async ({ genre, platforms, releaseDate }: GameDetails) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateGameDetails(genre, platforms, releaseDate);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gameDetails'] });
    },
  });
}

export function useUpdateGameTitle() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation<UpdateContentResult, Error, string>({
    mutationFn: async (title: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateGameTitle(title);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gameTitle'] });
    },
  });
}

export function useUpdateTagline() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation<UpdateContentResult, Error, string>({
    mutationFn: async (tagline: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateTagline(tagline);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tagline'] });
    },
  });
}

export function useUpdateInstagramLink() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation<UpdateContentResult, Error, string>({
    mutationFn: async (url: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateInstagramLink(url);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instagramLink'] });
    },
  });
}

export function useUpdateDeveloperLink() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation<UpdateContentResult, Error, string>({
    mutationFn: async (url: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateDeveloperLink(url);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['developerLink'] });
    },
  });
}

export function useUpdatePressEmail() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation<UpdateContentResult, Error, string>({
    mutationFn: async (email: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updatePressEmail(email);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pressEmail'] });
    },
  });
}

export function useUpdateBodyTextColor() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation<UpdateContentResult, Error, string>({
    mutationFn: async (color: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateBodyTextColor(color);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bodyTextColor'] });
    },
  });
}

export function useEnablePasswordProtection() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation<AdminResult, Error, string>({
    mutationFn: async (password: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.enablePasswordProtection(password);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['passwordEnabled'] });
    },
  });
}

export function useDisablePasswordProtection() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation<AdminResult, Error, void>({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.disablePasswordProtection();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['passwordEnabled'] });
    },
  });
}
