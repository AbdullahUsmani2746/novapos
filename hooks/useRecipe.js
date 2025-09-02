// hooks/useRecipe.js
import { useState, useEffect, useCallback } from "react";
import { recipeAPI } from "@/components/Manufacturing/api";

export const useRecipes = () => {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchRecipes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await recipeAPI.getAll();
      setRecipes(data.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const createRecipe = async (recipeData) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await recipeAPI.create(recipeData);
      setRecipes((prev) => [...prev, data]);
      return { success: true, data };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const updateRecipe = async (id, recipeData) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await recipeAPI.update(id, recipeData);
      setRecipes((prev) =>
        prev.map((recipe) => (recipe.id === id ? data : recipe))
      );
      return { success: true, data };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const deleteRecipe = async (id) => {
    setLoading(true);
    setError(null);
    try {
      await recipeAPI.delete(id);
      setRecipes((prev) => prev.filter((recipe) => recipe.id !== id));
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecipes();
  }, [fetchRecipes]);

  return {
    recipes,
    loading,
    error,
    createRecipe,
    updateRecipe,
    deleteRecipe,
  };
};