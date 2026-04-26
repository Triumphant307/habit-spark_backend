import { Request, Response, NextFunction } from 'express';
import * as suggestionService from '../services/suggestionService.js';
import { SuggestionQuery } from '../validators/suggestionValidators.js';

/**
 * Handles GET /suggestions.
 */
export const getSuggestions = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.userId as string;
    const query = req.query;
    // TODO: Call suggestionService.listSuggestions with req.query
    const results = await suggestionService.listSuggestions(
      userId,
      query as unknown as SuggestionQuery,
    );
    res.status(200).json(results);
  } catch (error) {
    next(error);
  }
};

/**
 * Handles POST /suggestions/fav.
 */
export const toggleFavorite = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.userId as string;
    // TODO: Call suggestionService.favoriteSuggestion
    const { tipId, isFavorite } = req.body;
    await suggestionService.favoriteSuggestion(userId, { tipId, isFavorite });
    res.status(200).json({ message: 'Favorite status updated' });
  } catch (error) {
    next(error);
  }
};

/**
 * Handles GET /suggestions/categories.
 */
export const getCategories = async (
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const categories = await suggestionService.listCategories();
    res.status(200).json(categories);
  } catch (error) {
    next(error);
  }
};
