// hooks/useBOM.js
import { useState, useEffect, useCallback } from "react";
import { bomAPI } from "@/components/Manufacturing/api";
import axios from "axios";

export const useBOM = ({ searchTerm, filterStatus, page, limit, sortBy, sortOrder }) => {
  const [bomItems, setBomItems] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [total, setTotal] = useState(0);

  const fetchBOMs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await bomAPI.getAll({ search: searchTerm, status: filterStatus, page, limit, sortBy, sortOrder });      
      const itemsResponse = await axios.get("/api/setup/items");
      setBomItems(data.data);
      setTotal(data.total);
      setItems(itemsResponse.data.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, filterStatus, page, limit, sortBy, sortOrder]);

  const createBOM = async (bomData) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await bomAPI.create(bomData);
      setBomItems((prev) => [...prev, data]);
      return { success: true, data };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const updateBOM = async (id, bomData) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await bomAPI.update(id, bomData);
      setBomItems((prev) =>
        prev.map((item) => (item.id === id ? data : item))
      );
      return { success: true, data };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const deleteBOM = async (id) => {
    setLoading(true);
    setError(null);
    try {
      await bomAPI.delete(id);
      setBomItems((prev) => prev.filter((item) => item.id !== id));
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBOMs();
  }, [fetchBOMs]);

  return {
    bomItems,
    items,
    loading,
    error,
    createBOM,
    updateBOM,
    deleteBOM,
    fetchBOMs,
    total,
  };
};