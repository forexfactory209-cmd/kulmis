import { create } from 'zustand';
import { getFavorites, toggleFavorite as toggleFavoriteApi } from '../api/users';

interface FavoritesState {
  favorites: string[];
  isLoading: boolean;
  fetchFavorites: () => Promise<void>;
  toggleFavorite: (id: string) => Promise<void>;
}

export const useFavoritesStore = create<FavoritesState>((set, get) => ({
  favorites: [],
  isLoading: false,
  fetchFavorites: async () => {
    set({ isLoading: true });
    try {
      const data = await getFavorites();
      const ids = data.map((f: any) => f.freelancerId || f.id);
      set({ favorites: ids });
    } catch (error) {
      console.error('Failed to fetch favorites', error);
    } finally {
      set({ isLoading: false });
    }
  },
  toggleFavorite: async (id: string) => {
    const { favorites } = get();
    const isFav = favorites.includes(id);
    
    // Optimistic update
    if (isFav) {
      set({ favorites: favorites.filter(favId => favId !== id) });
    } else {
      set({ favorites: [...favorites, id] });
    }

    try {
      await toggleFavoriteApi(id);
      // Let it stay optimistic, or refetch
    } catch (error) {
      console.error('Failed to toggle favorite', error);
      // Revert optimistic update
      if (isFav) {
        set({ favorites: [...favorites, id] });
      } else {
        set({ favorites: favorites.filter(favId => favId !== id) });
      }
    }
  }
}));
