import { useState, useEffect, useCallback } from "react";
import { productionAPI } from "../components/Manufactuting/api";

export const useProductionPlans = () => {
  const [productionPlans, setProductionPlans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all production plans
  const fetchProductionPlans = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await productionAPI.getAll();
      setProductionPlans(data.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Create new production plan
  const createProductionPlan = async (planData) => {
    setLoading(true);
    setError(null);
    try {
      const newPlan = await productionAPI.create(planData);
      setProductionPlans((prev) => [...prev, newPlan]);
      return { success: true, data: newPlan };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Update production plan
  const updateProductionPlan = async (id, planData) => {
    setLoading(true);
    setError(null);
    try {
      const updatedPlan = await productionAPI.update(id, planData);
      setProductionPlans((prev) =>
        prev.map((plan) => (plan.id === id ? updatedPlan : plan))
      );
      return { success: true, data: updatedPlan };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Delete production plan
  const deleteProductionPlan = async (id) => {
    setLoading(true);
    setError(null);
    try {
      await productionAPI.delete(id);
      setProductionPlans((prev) => prev.filter((plan) => plan.id !== id));
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Load production plans on mount
  useEffect(() => {
    fetchProductionPlans();
  }, [fetchProductionPlans]);

  return {
    productionPlans,
    loading,
    error,
    fetchProductionPlans,
    createProductionPlan,
    updateProductionPlan,
    deleteProductionPlan,
  };
};
