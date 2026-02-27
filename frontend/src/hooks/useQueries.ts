import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { UpdateContentResult } from '../backend';

// ─── Read queries ────────────────────────────────────────────────────────────

export function useGetAdminStatus() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ['adminStatus'],
    queryFn: async () => {
      if (!actor) return false;
      return actor.getAdminStatus();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();
  const query = useQuery({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });
  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (name: string) => {
      if (!actor) throw new Error('Actor not available');
      await actor.saveCallerUserProfile({ name });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

export function useGetGameTitle() {
  const { actor, isFetching } = useActor();
  return useQuery<string>({
    queryKey: ['gameTitle'],
    queryFn: async () => {
      if (!actor) return 'Poke A Nose';
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
  return useQuery({
    queryKey: ['gameDetails'],
    queryFn: async () => {
      if (!actor) return { genre: '', platforms: '', releaseDate: '' };
      return actor.getGameDetails();
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
      if (!actor) return '#1a1a1a';
      return actor.getBodyTextColor();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useVerifyPassword() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async (password: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.verifyPassword(password);
    },
  });
}

// ─── Initialize Admin mutation ────────────────────────────────────────────────

export function useInitializeAdmin() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      // Pass empty strings for tokens — the backend accepts these when no admin is set yet
      const result = await actor.initializeAdmin('', '');
      if (result.__kind__ === 'error') {
        throw new Error(result.error);
      }
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminStatus'] });
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

// ─── Update mutations ─────────────────────────────────────────────────────────

function useUpdateMutation<T>(
  mutationFn: (actor: NonNullable<ReturnType<typeof useActor>['actor']>, arg: T) => Promise<UpdateContentResult>,
  invalidateKeys: string[][]
) {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (arg: T) => {
      if (!actor) throw new Error('Actor not available');
      const result = await mutationFn(actor, arg);
      if (result === UpdateContentResult.notAdmin) throw new Error('Not admin');
      return result;
    },
    onSuccess: () => {
      invalidateKeys.forEach(key => queryClient.invalidateQueries({ queryKey: key }));
    },
  });
}

export function useUpdateGameTitle() {
  return useUpdateMutation<string>((actor, title) => actor.updateGameTitle(title), [['gameTitle']]);
}

export function useUpdateTagline() {
  return useUpdateMutation<string>((actor, tagline) => actor.updateTagline(tagline), [['tagline']]);
}

export function useUpdateAboutText() {
  return useUpdateMutation<string>((actor, text) => actor.updateAboutText(text), [['aboutText']]);
}

export function useUpdateFeatures() {
  return useUpdateMutation<string[]>((actor, items) => actor.updateFeatures(items), [['features']]);
}

export function useUpdateGameDetails() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ genre, platforms, releaseDate }: { genre: string; platforms: string; releaseDate: string }) => {
      if (!actor) throw new Error('Actor not available');
      const result = await actor.updateGameDetails(genre, platforms, releaseDate);
      if (result === UpdateContentResult.notAdmin) throw new Error('Not admin');
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gameDetails'] });
    },
  });
}

export function useUpdateInstagramLink() {
  return useUpdateMutation<string>((actor, url) => actor.updateInstagramLink(url), [['instagramLink']]);
}

export function useUpdateDeveloperLink() {
  return useUpdateMutation<string>((actor, url) => actor.updateDeveloperLink(url), [['developerLink']]);
}

export function useUpdatePressEmail() {
  return useUpdateMutation<string>((actor, email) => actor.updatePressEmail(email), [['pressEmail']]);
}

export function useUpdateBodyTextColor() {
  return useUpdateMutation<string>((actor, color) => actor.updateBodyTextColor(color), [['bodyTextColor']]);
}

export function useEnablePasswordProtection() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (password: string) => {
      if (!actor) throw new Error('Actor not available');
      const result = await actor.enablePasswordProtection(password);
      if (result.__kind__ === 'error') throw new Error(result.error);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['passwordStatus'] });
    },
  });
}

export function useDisablePasswordProtection() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      const result = await actor.disablePasswordProtection();
      if (result.__kind__ === 'error') throw new Error(result.error);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['passwordStatus'] });
    },
  });
}

// We use verifyPassword as a proxy to check if password protection is enabled
// (returns true if not enabled, false if enabled and wrong password)
export function useCheckPasswordEnabled() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ['passwordStatus'],
    queryFn: async () => {
      if (!actor) return false;
      // If verifyPassword('') returns true, protection is disabled
      const result = await actor.verifyPassword('__check_enabled__');
      return !result; // true = protection enabled
    },
    enabled: !!actor && !isFetching,
  });
}
