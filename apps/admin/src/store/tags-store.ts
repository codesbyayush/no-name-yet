import { create } from 'zustand';

export interface Tag {
  id: string;
  name: string;
  color: string;
  count?: number;
}

interface TagsState {
  // Data
  tags: Tag[];
  tagsById: Record<string, Tag>;

  // Getters
  getAllTags: () => Tag[];
  getTagById: (id: string) => Tag | undefined;
  searchTags: (query: string) => Tag[];

  // Actions
  addTag: (tag: Tag) => void;
  addTags: (tags: Tag[]) => void;
  updateTag: (id: string, updatedTag: Partial<Tag>) => void;
  deleteTag: (id: string) => void;
  updateTagCount: (id: string, count: number) => void;
}

export const useTagsStore = create<TagsState>((set, get) => ({
  // Initial state
  tags: [],
  tagsById: {},

  // Getters
  getAllTags: () => get().tags,

  getTagById: (id: string) => {
    return get().tagsById[id];
  },

  searchTags: (query: string) => {
    const lowerCaseQuery = query.toLowerCase();
    return get().tags.filter((tag) =>
      tag.name.toLowerCase().includes(lowerCaseQuery)
    );
  },

  // Actions
  addTag: (tag: Tag) => {
    set((state) => {
      const newTags = [...state.tags, tag];
      const newTagsById = { ...state.tagsById, [tag.id]: tag };
      return {
        tags: newTags,
        tagsById: newTagsById,
      };
    });
  },

  addTags: (newTags: Tag[]) => {
    set((state) => {
      // Merge new tags with existing ones, avoiding duplicates by ID
      const existingIds = new Set(state.tags.map((tag) => tag.id));
      const uniqueNewTags = newTags.filter((tag) => !existingIds.has(tag.id));
      const allTags = [...state.tags, ...uniqueNewTags];

      // Create tagsById mapping
      const newTagsById = { ...state.tagsById };
      for (const tag of uniqueNewTags) {
        newTagsById[tag.id] = tag;
      }

      return {
        tags: allTags,
        tagsById: newTagsById,
      };
    });
  },

  updateTag: (id: string, updatedTag: Partial<Tag>) => {
    set((state) => {
      const newTags = state.tags.map((tag) =>
        tag.id === id ? { ...tag, ...updatedTag } : tag
      );

      const newTagsById = { ...state.tagsById };
      if (newTagsById[id]) {
        newTagsById[id] = { ...newTagsById[id], ...updatedTag };
      }

      return {
        tags: newTags,
        tagsById: newTagsById,
      };
    });
  },

  deleteTag: (id: string) => {
    set((state) => {
      const newTags = state.tags.filter((tag) => tag.id !== id);
      const newTagsById = { ...state.tagsById };
      delete newTagsById[id];

      return {
        tags: newTags,
        tagsById: newTagsById,
      };
    });
  },

  updateTagCount: (id: string, count: number) => {
    get().updateTag(id, { count });
  },
}));
