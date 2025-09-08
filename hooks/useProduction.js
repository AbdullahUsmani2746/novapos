import { useState, useEffect, useCallback } from "react";
import { productionAPI } from "@/components/Manufacturing/api";

export const useProductionPlans = ({ searchTerm, filterStatus, page, limit, sortBy, sortOrder }) => {
  const [productionPlans, setProductionPlans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [total, setTotal] = useState(0);

  const fetchProductionPlans = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await productionAPI.getAll({ search: searchTerm, status: filterStatus, page, limit, sortBy, sortOrder });
      setTotal(data.total);
      setProductionPlans(data.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, filterStatus, page, limit, sortBy, sortOrder]);

  const createProductionPlan = async (planData) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await productionAPI.create({
        receipe_id: planData.receipe_id,
        finished_id: planData.finished_id,
        qty: planData.qty,
        dated: planData.dated,
        req_del_date: planData.req_del_date,
        batch_no: planData.batch_no,
        sale_ord_no: planData.sale_ord_no,
        actual_yield: planData.actual_yield,
        viscosity: planData.viscosity,
        machine_id: planData.machine_id,
        time_min: planData.time_min,
        bom_id: planData.bom_id,
        productionPlanDetail: planData.productionPlanDetail,
      });
      setProductionPlans((prev) => [...prev, data]);
      return { success: true, data };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const updateProductionPlan = async (id, planData) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await productionAPI.update(id, {
        receipe_id: planData.receipe_id,
        finished_id: planData.finished_id,
        qty: planData.qty,
        dated: planData.dated,
        req_del_date: planData.req_del_date,
        batch_no: planData.batch_no,
        sale_ord_no: planData.sale_ord_no,
        actual_yield: planData.actual_yield,
        viscosity: planData.viscosity,
        machine_id: planData.machine_id,
        time_min: planData.time_min,
        bom_id: planData.bom_id,
        productionPlanDetail: planData.productionPlanDetail,
        status: planData.status,
      });
      setProductionPlans((prev) =>
        prev.map((plan) => (plan.id === id ? data : plan))
      );
      return { success: true, data };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

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

  useEffect(() => {
    fetchProductionPlans();
  }, [fetchProductionPlans]);

  return {
    productionPlans,
    loading,
    error,
    total,
    createProductionPlan,
    updateProductionPlan,
    deleteProductionPlan,
    fetchProductionPlans,
  };
};