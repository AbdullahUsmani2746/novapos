// hooks/useMachineInstruction.js
import { useState, useEffect, useCallback } from "react";
import { machineInstructionAPI } from "@/components/Manufacturing/api";

export const useMachineInstructions = ({ searchTerm, filterStatus, page, limit, sortBy, sortOrder }) => {
  const [machineInstructions, setMachineInstructions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [total, setTotal] = useState(0);

  const fetchMachineInstructions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await machineInstructionAPI.getAll({ search: searchTerm, status: filterStatus, page, limit, sortBy, sortOrder });
      setMachineInstructions(data.data);
      setTotal(data.total);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, filterStatus, page, limit, sortBy, sortOrder]);

  const createMachineInstruction = async (machineData) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await machineInstructionAPI.create(machineData);
      setMachineInstructions((prev) => [...prev, data]);
      return { success: true, data };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const updateMachineInstruction = async (id, machineData) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await machineInstructionAPI.update(id, machineData);
      setMachineInstructions((prev) =>
        prev.map((machine) => (machine.id === id ? data : machine))
      );
      return { success: true, data };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const deleteMachineInstruction = async (id) => {
    setLoading(true);
    setError(null);
    try {
      await machineInstructionAPI.delete(id);
      setMachineInstructions((prev) => prev.filter((machine) => machine.id !== id));
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMachineInstructions();
  }, [fetchMachineInstructions]);

  return {
    machineInstructions,
    loading,
    error,
    total,
    createMachineInstruction,
    updateMachineInstruction,
    deleteMachineInstruction,
    fetchMachineInstructions,
    
  };
};