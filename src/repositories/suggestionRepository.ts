import { Prisma } from '@prisma/client';
import { prisma } from '../config/database.js';
import { SuggestionQuery } from '../validators/suggestionValidators.js';

/**
 * Builds a dynamic 'where' clause for Suggestion queries.
 */
const buildWhereClause = (query: SuggestionQuery) => {
  const { q, category } = query;
  const where: Prisma.SuggestionWhereInput = {};

  if (category) {
    where.category = category;
  }

  if (q) {
    where.OR = [
      { title: { contains: q, mode: 'insensitive' } },
      { description: { contains: q, mode: 'insensitive' } },
    ];
  }

  return where;
};

export const findMany = async (userId: string, query: SuggestionQuery) => {
  const { limit, page } = query;
  const take = Number(limit);
  const skip = (Number(page) - 1) * take;

  return await prisma.suggestion.findMany({
    where: buildWhereClause(query),
    include: {
      favoritedBy: {
        where: { userId },
      },
    },
    take,
    skip,
    orderBy: { createdAt: 'desc' },
  });
};

export const countSuggestions = async (query: SuggestionQuery) => {
  return await prisma.suggestion.count({
    where: buildWhereClause(query),
  });
};

export const toggleFavorite = async (
  userId: string,
  tipId: string,
  isFavorite: boolean,
) => {
  if (isFavorite) {
    return await prisma.userSuggestionFavorite.create({
      data: {
        userId,
        suggestionId: tipId,
      },
    });
  } else {
    return await prisma.userSuggestionFavorite.deleteMany({
      where: {
        userId,
        suggestionId: tipId,
      },
    });
  }
};

export const getUniqueCategories = async () => {
  const results = await prisma.suggestion.findMany({
    select: { category: true },
    distinct: ['category'],
  });
  return results.map((r) => r.category);
};
