import { useState, useEffect, useCallback } from "react";
import { bomAPI } from "../components/Manufactuting/api";
import axios from "axios";

export const useBOM = () => {
  const [bomItems, setBomItems] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all BOMs
  const fetchBOMs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await bomAPI.getAll();
      const itemsData = await axios.get("/api/setup/items"); // Adjust the endpoint as needed
      console.log("DAta: ",itemsData.data.data)
      setBomItems(data.data); // axios returns `response.data`, so this is 
      setItems(itemsData.data.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Create new BOM
  const createBOM = async (bomData) => {
    setLoading(true);
    setError(null);
    try {
      const newBOM = await bomAPI.create(bomData);
      setBomItems((prev) => [...prev, newBOM]);
      return { success: true, data: newBOM };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Update BOM
  const updateBOM = async (id, bomData) => {
    setLoading(true);
    setError(null);
    try {
      const updatedBOM = await bomAPI.update(id, bomData);
      setBomItems((prev) =>
        prev.map((item) => (item.id === id ? updatedBOM : item))
      );
      return { success: true, data: updatedBOM };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Delete BOM
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

  // Load BOMs on mount
  useEffect(() => {
    fetchBOMs();
  }, [fetchBOMs]);

  return {
    bomItems,
    items,
    loading,
    error,
    fetchBOMs,
    createBOM,
    updateBOM,
    deleteBOM,
  };
};
