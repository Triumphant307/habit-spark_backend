import * as suggestionRepo from '../repositories/suggestionRepository.js';
import { SuggestionQuery } from '../validators/suggestionValidators.js';

export const listSuggestions = async (
  userId: string,
  query: SuggestionQuery,
) => {
  const [data, total] = await Promise.all([
    suggestionRepo.findMany(userId, query),
    suggestionRepo.countSuggestions(query),
  ]);

  const limit = query.limit as unknown as number;
  const page = query.page as unknown as number;

  return {
    data,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const favoriteSuggestion = async (
  userId: string,
  data: { tipId: string; isFavorite: boolean },
) => {
  return await suggestionRepo.toggleFavorite(
    userId,
    data.tipId,
    data.isFavorite,
  );
};

export const listCategories = async () => {
  return await suggestionRepo.getUniqueCategories();
};
