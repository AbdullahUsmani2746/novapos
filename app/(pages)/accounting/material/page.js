"use client";
import React, { useState, useEffect } from "react";
import {
  Plus,
  BoxIcon,
  Settings,
  Calendar,
  BarChart3,
  FileText,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  Save,
  X,
  AlertCircle,
  Check,
  BookOpen,
  Cog,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useBOM } from "@/hooks/useBOM";
import { useProductionPlans } from "@/hooks/useProduction";
import { useRecipes } from "@/hooks/useRecipe";
import { useMachineInstructions } from "@/hooks/useMachineInstruction";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import Select from "react-select";

const ITEM_TYPE = "RECIPE_DETAIL";

const Material = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("");
  const [editingItem, setEditingItem] = useState(null);
  const [notification, setNotification] = useState(null);

  // State for each tab
  const [searchBOM, setSearchBOM] = useState("");
  const [filterBOM, setFilterBOM] = useState("");
  const [bomPage, setBomPage] = useState(1);
  const [bomLimit, setBomLimit] = useState(10);
  const [bomSortBy, setBomSortBy] = useState("id");
  const [bomSortOrder, setBomSortOrder] = useState("asc");

  const [searchProduction, setSearchProduction] = useState("");
  const [filterProduction, setFilterProduction] = useState("");
  const [productionPage, setProductionPage] = useState(1);
  const [productionLimit, setProductionLimit] = useState(10);
  const [productionSortBy, setProductionSortBy] = useState("id");
  const [productionSortOrder, setProductionSortOrder] = useState("asc");

  const [searchRecipe, setSearchRecipe] = useState("");
  const [filterRecipe, setFilterRecipe] = useState("");
  const [recipePage, setRecipePage] = useState(1);
  const [recipeLimit, setRecipeLimit] = useState(10);
  const [recipeSortBy, setRecipeSortBy] = useState("receipe_id");
  const [recipeSortOrder, setRecipeSortOrder] = useState("asc");

  const [searchMachine, setSearchMachine] = useState("");
  const [filterMachine, setFilterMachine] = useState("");
  const [machinePage, setMachinePage] = useState(1);
  const [machineLimit, setMachineLimit] = useState(10);
  const [machineSortBy, setMachineSortBy] = useState("rec_id");
  const [machineSortOrder, setMachineSortOrder] = useState("asc");

  const {
    bomItems,
    items: finishItems,
    loading: bomLoading,
    error: bomError,
    createBOM: createBOMAPI,
    updateBOM: updateBOMAPI,
    deleteBOM: deleteBOMAPI,
    total: bomTotal,
    fetchBOMs,
  } = useBOM({
    searchTerm: searchBOM,
    filterStatus: filterBOM,
    page: bomPage,
    limit: bomLimit,
    sortBy: bomSortBy,
    sortOrder: bomSortOrder,
  });

  const {
    productionPlans,
    loading: productionLoading,
    error: productionError,
    createProductionPlan: createProductionPlanAPI,
    updateProductionPlan: updateProductionPlanAPI,
    deleteProductionPlan: deleteProductionPlanAPI,
    total: productionTotal,
    fetchProductionPlans,
  } = useProductionPlans({
    searchTerm: searchProduction,
    filterStatus: filterProduction,
    page: productionPage,
    limit: productionLimit,
    sortBy: productionSortBy,
    sortOrder: productionSortOrder,
  });

  const {
    recipes,
    loading: recipeLoading,
    error: recipeError,
    createRecipe: createRecipeAPI,
    updateRecipe: updateRecipeAPI,
    deleteRecipe: deleteRecipeAPI,
    total: recipeTotal,
    fetchRecipes,
  } = useRecipes({
    searchTerm: searchRecipe,
    filterStatus: filterRecipe,
    page: recipePage,
    limit: recipeLimit,
    sortBy: recipeSortBy,
    sortOrder: recipeSortOrder,
  });

  const {
    machineInstructions,
    loading: machineLoading,
    error: machineError,
    createMachineInstruction: createMachineInstructionAPI,
    updateMachineInstruction: updateMachineInstructionAPI,
    deleteMachineInstruction: deleteMachineInstructionAPI,
    total: machineTotal,
    fetchMachineInstructions,
  } = useMachineInstructions({
    searchTerm: searchMachine,
    filterStatus: filterMachine,
    page: machinePage,
    limit: machineLimit,
    sortBy: machineSortBy,
    sortOrder: machineSortOrder,
  });

  const [bomForm, setBomForm] = useState({
    finished_id: "",
    category: "Finished",
    instructions: "",
    bomDetails: [],
  });

  const [productionForm, setProductionForm] = useState({
    receipe_id: "",
    finished_id: "",
    dated: "",
    req_del_date: "",
    batch_no: "",
    sale_ord_no: null,
    qty: 0,
    actual_yield: null,
    viscosity: "",
    machine_id: null,
    time_min: null,
    bom_id: null,
    productionPlanDetail: [], // Renamed from materialRequirements
  });

  const [recipeForm, setRecipeForm] = useState({
    receipe_id: 0,
    finished_id: "",
    finished_count: 0,
    machine_id: "",
    bom_id: "",
    time_min: 0,
    status: "Active",
    dated: "",
    receipeDetails: [],
  });

  const [machineForm, setMachineForm] = useState({
    machine_id: "",
    time_min: 0,
    descr: "",
    machineDetails: [],
  });

  const [materialInput, setMaterialInput] = useState({
    material_id: "",
    material_desc: "",
    material_percentage: 0,
  });

  const [machineDetailInput, setMachineDetailInput] = useState({
    machine_id: "",
    part: "",
    time_min: 0,
    instructions: "",
  });

  // Fetch BOMs, Production Plans, Recipes, and Machine Instructions
  useEffect(() => {
    fetchBOMs();
  }, [searchBOM, filterBOM, bomPage, bomLimit, bomSortBy, bomSortOrder]);

  useEffect(() => {
    fetchProductionPlans();
  }, [searchProduction, filterProduction, productionPage, productionLimit, productionSortBy, productionSortOrder]);

  useEffect(() => {
    fetchRecipes();
  }, [searchRecipe, filterRecipe, recipePage, recipeLimit, recipeSortBy, recipeSortOrder]);

  useEffect(() => {
    fetchMachineInstructions();
  }, [searchMachine, filterMachine, machinePage, machineLimit, machineSortBy, machineSortOrder]);

  // Handle Recipe Form: Auto-populate receipeDetails and time_min
  useEffect(() => {
    if (recipeForm.bom_id && recipeForm.machine_id) {
      const bom = bomItems.find((b) => b.id === recipeForm.bom_id);
      const machine = machineInstructions.find((m) => m.rec_id === recipeForm.machine_id);
      let newDetails = [];

      if (bom && bom.bomDetails) {
        // Fetch BOM materials as products
        const bomDetails = bom.bomDetails.map((mat, index) => ({
          product_id: mat.material_id,
          product_desc: mat.item?.item || mat.material_id.toString(),
          type: "product",
          qty: 1, // Default, adjustable
          product_percentage: mat.material_percentage || 0,
          instructions: "",
          sno: index + 1,
        }));
        newDetails = [...bomDetails];
      }

      if (machine && machine.machineDetails) {
        // Fetch machine instructions
        const machineDetails = machine.machineDetails.map((det, index) => ({
          product_id: det.machine_id,
          product_desc: det.part || det.machine_id.toString(),
          type: "instruction",
          qty: 0,
          product_percentage: 0,
          instructions: det.instructions || "",
          sno: newDetails.length + index + 1,
        }));
        newDetails = [...newDetails, ...machineDetails];
      }

      setRecipeForm((prev) => ({
        ...prev,
        time_min: machine?.time_min || 0,
        receipeDetails: newDetails,
      }));
    } else {
      setRecipeForm((prev) => ({
        ...prev,
        receipeDetails: [],
        time_min: 0,
      }));
    }
  }, [recipeForm.bom_id, recipeForm.machine_id, bomItems, machineInstructions]);

  // Handle Production Form: Auto-populate productionPlanDetail
  useEffect(() => {
    if (productionForm.receipe_id && productionForm.qty > 0) {
      const recipe = recipes.find((r) => r.receipe_id === productionForm.receipe_id);
      if (recipe) {
        const materialRequirements = recipe.receipeDetails
          .filter((det) => det.type === "product")
          .map((det, index) => ({
            material_id: det.product_id,
            material_desc: det.product_desc,
            material_percentage: det.product_percentage || 0,
            material_qty: (productionForm.qty * (det.product_percentage || 0)) / 100,
            sno: index + 1,
          }));
        setProductionForm((prev) => ({
          ...prev,
          finished_id: recipe.finished_id,
          machine_id: recipe.machine_id || null,
          time_min: recipe.time_min || null,
          bom_id: recipe.bom_id || null,
          productionPlanDetail: materialRequirements,
        }));
      }
    } else {
      setProductionForm((prev) => ({
        ...prev,
        productionPlanDetail: [],
        finished_id: "",
        machine_id: null,
        time_min: null,
        bom_id: null,
      }));
    }
  }, [productionForm.receipe_id, productionForm.qty, recipes]);

  // Handle Recipe Form: Ensure only one active recipe per finished_id
  useEffect(() => {
    if (recipeForm.finished_id && recipeForm.status === "Active") {
      const existingRecipes = recipes.filter(
        (r) => r.finished_id === recipeForm.finished_id && r.status === "Active" && r.receipe_id !== editingItem?.receipe_id
      );
      if (existingRecipes.length > 0) {
        showNotification(
          "Only one recipe can be active per finished product. Inactivating others.",
          "warning"
        );
      }
    }
  }, [recipeForm.finished_id, recipeForm.status, recipes, editingItem]);

  // Error Handling
  if (bomError || productionError || recipeError || machineError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-red-600 mb-2">Error Loading Data</h2>
          <p className="text-gray-600">{bomError || productionError || recipeError || machineError}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // BOM CRUD
  const createBOM = async () => {
    if (!bomForm.finished_id || bomForm.bomDetails.length === 0) {
      showNotification("Please fill all required fields and add at least one material", "error");
      return;
    }

    const totalPercentage = bomForm.bomDetails.reduce((sum, mat) => sum + mat.material_percentage, 0);
    if (totalPercentage !== 100) {
      showNotification("Material percentages must add up to 100%", "error");
      return;
    }

    const result = await createBOMAPI(bomForm);
    if (result.success) {
      resetBOMForm();
      closeModal();
      showNotification("BOM created successfully!");
    } else {
      showNotification(result.error || "Failed to create BOM", "error");
    }
  };

  const updateBOM = async () => {
    if (!bomForm.finished_id || bomForm.bomDetails.length === 0) {
      showNotification("Please fill all required fields and add at least one material", "error");
      return;
    }

    const totalPercentage = bomForm.bomDetails.reduce((sum, mat) => sum + mat.material_percentage, 0);
    if (totalPercentage !== 100) {
      showNotification("Material percentages must add up to 100%", "error");
      return;
    }

    const result = await updateBOMAPI(editingItem.id, bomForm);
    if (result.success) {
      resetBOMForm();
      closeModal();
      showNotification("BOM updated successfully!");
    } else {
      showNotification(result.error || "Failed to update BOM", "error");
    }
  };

  const deleteBOM = async (id) => {
    if (window.confirm("Are you sure you want to delete this BOM?")) {
      const result = await deleteBOMAPI(id);
      if (result.success) {
        showNotification("BOM deleted successfully!");
      } else {
        showNotification(result.error || "Failed to delete BOM", "error");
      }
    }
  };

  // Production Plan CRUD
  const createProductionPlan = async () => {
    if (!productionForm.receipe_id || !productionForm.dated || productionForm.qty <= 0 || productionForm.productionPlanDetail.length === 0) {
      showNotification("Please select a recipe, date, quantity, and ensure materials are calculated", "error");
      return;
    }

    const result = await createProductionPlanAPI(productionForm);
    if (result.success) {
      resetProductionForm();
      closeModal();
      showNotification("Production plan created successfully!");
    } else {
      showNotification(result.error || "Failed to create production plan", "error");
    }
  };

  const updateProductionPlan = async () => {
    if (!productionForm.receipe_id || !productionForm.dated || productionForm.qty <= 0 || productionForm.productionPlanDetail.length === 0) {
      showNotification("Please select a recipe, date, quantity, and ensure materials are calculated", "error");
      return;
    }

    const result = await updateProductionPlanAPI(editingItem.id, productionForm);
    if (result.success) {
      resetProductionForm();
      closeModal();
      showNotification("Production plan updated successfully!");
    } else {
      showNotification(result.error || "Failed to update production plan", "error");
    }
  };

  const deleteProductionPlan = async (id) => {
    if (window.confirm("Are you sure you want to delete this production plan?")) {
      const result = await deleteProductionPlanAPI(id);
      if (result.success) {
        showNotification("Production plan deleted successfully!");
      } else {
        showNotification(result.error || "Failed to delete production plan", "error");
      }
    }
  };

  // Recipe CRUD
  const createRecipe = async () => {
    if (!recipeForm.finished_id || recipeForm.receipeDetails.length === 0) {
      showNotification("Please fill all required fields and ensure recipe details are populated", "error");
      return;
    }

    if (recipeForm.status === "Active") {
      const existing = recipes.filter(
        (r) => r.finished_id === recipeForm.finished_id && r.receipe_id !== editingItem?.receipe_id && r.status === "Active"
      );
      for (const ex of existing) {
        await updateRecipeAPI(ex.receipe_id, { ...ex, status: "Inactive" });
      }
    }

    const result = await createRecipeAPI(recipeForm);
    if (result.success) {
      resetRecipeForm();
      closeModal();
      showNotification("Recipe created successfully!");
    } else {
      showNotification(result.error || "Failed to create recipe", "error");
    }
  };

  const updateRecipe = async () => {
    if (!recipeForm.finished_id || recipeForm.receipeDetails.length === 0) {
      showNotification("Please fill all required fields and ensure recipe details are populated", "error");
      return;
    }

    if (recipeForm.status === "Active") {
      const existing = recipes.filter(
        (r) => r.finished_id === recipeForm.finished_id && r.receipe_id !== editingItem.receipe_id && r.status === "Active"
      );
      for (const ex of existing) {
        await updateRecipeAPI(ex.receipe_id, { ...ex, status: "Inactive" });
      }
    }

    const result = await updateRecipeAPI(editingItem.receipe_id, recipeForm);
    if (result.success) {
      resetRecipeForm();
      closeModal();
      showNotification("Recipe updated successfully!");
    } else {
      showNotification(result.error || "Failed to update recipe", "error");
    }
  };

  const deleteRecipe = async (id) => {
    if (window.confirm("Are you sure you want to delete this recipe?")) {
      const result = await deleteRecipeAPI(id);
      if (result.success) {
        showNotification("Recipe deleted successfully!");
      } else {
        showNotification(result.error || "Failed to delete recipe", "error");
      }
    }
  };

  // Machine Instruction CRUD
  const createMachineInstruction = async () => {
    if (!machineForm.machine_id || machineForm.machineDetails.length === 0) {
      showNotification("Please fill all required fields and add at least one detail", "error");
      return;
    }

    const result = await createMachineInstructionAPI(machineForm);
    if (result.success) {
      resetMachineForm();
      closeModal();
      showNotification("Machine instruction created successfully!");
    } else {
      showNotification(result.error || "Failed to create machine instruction", "error");
    }
  };

  const updateMachineInstruction = async () => {
    if (!machineForm.machine_id || machineForm.machineDetails.length === 0) {
      showNotification("Please fill all required fields and add at least one detail", "error");
      return;
    }

    const result = await updateMachineInstructionAPI(editingItem.rec_id, machineForm);
    if (result.success) {
      resetMachineForm();
      closeModal();
      showNotification("Machine instruction updated successfully!");
    } else {
      showNotification(result.error || "Failed to update machine instruction", "error");
    }
  };

  const deleteMachineInstruction = async (id) => {
    if (window.confirm("Are you sure you want to delete this machine instruction?")) {
      const result = await deleteMachineInstructionAPI(id);
      if (result.success) {
        showNotification("Machine instruction deleted successfully!");
      } else {
        showNotification(result.error || "Failed to delete machine instruction", "error");
      }
    }
  };

  // Reset Forms
  const resetBOMForm = () => {
    setBomForm({
      finished_id: "",
      category: "Finished",
      instructions: "",
      bomDetails: [],
    });
    setMaterialInput({ material_id: "", material_desc: "", material_percentage: 0 });
  };

  const resetProductionForm = () => {
    setProductionForm({
      receipe_id: "",
      finished_id: "",
      dated: "",
      req_del_date: "",
      batch_no: "",
      sale_ord_no: null,
      qty: 0,
      actual_yield: null,
      viscosity: "",
      machine_id: null,
      time_min: null,
      bom_id: null,
      productionPlanDetail: [],
    });
  };

  const resetRecipeForm = () => {
    setRecipeForm({
      receipe_id: 0,
      finished_id: "",
      finished_count: 0,
      machine_id: "",
      bom_id: "",
      time_min: 0,
      status: "Active",
      dated: "",
      receipeDetails: [],
    });
  };

  const resetMachineForm = () => {
    setMachineForm({
      machine_id: "",
      time_min: 0,
      descr: "",
      machineDetails: [],
    });
    setMachineDetailInput({ machine_id: "", part: "", time_min: 0, instructions: "" });
  };

  // BOM Material Handling
  const addMaterial = () => {
    if (!materialInput.material_id || !materialInput.material_desc || materialInput.material_percentage <= 0) {
      showNotification("Please fill all material fields", "error");
      return;
    }

    const currentTotal = bomForm.bomDetails.reduce((sum, mat) => sum + mat.material_percentage, 0);
    if (currentTotal + materialInput.material_percentage > 100) {
      showNotification("Total percentage cannot exceed 100%", "error");
      return;
    }

    setBomForm({
      ...bomForm,
      bomDetails: [...bomForm.bomDetails, { ...materialInput }],
    });
    setMaterialInput({ material_id: "", material_desc: "", material_percentage: 0 });
  };

  const removeMaterial = (index) => {
    setBomForm({
      ...bomForm,
      bomDetails: bomForm.bomDetails.filter((_, i) => i !== index),
    });
  };

  // Recipe Detail Handling
  const moveRecipeDetail = (dragIndex, hoverIndex) => {
    const dragged = recipeForm.receipeDetails[dragIndex];
    const newDetails = [...recipeForm.receipeDetails];
    newDetails.splice(dragIndex, 1);
    newDetails.splice(hoverIndex, 0, dragged);
    setRecipeForm({
      ...recipeForm,
      receipeDetails: newDetails.map((det, i) => ({ ...det, sno: i + 1 })),
    });
  };

  // Machine Detail Handling
  const addMachineDetail = () => {
    if (!machineDetailInput.machine_id || !machineDetailInput.part) {
      showNotification("Please fill all machine detail fields", "error");
      return;
    }

    setMachineForm({
      ...machineForm,
      machineDetails: [...machineForm.machineDetails, { ...machineDetailInput }],
    });
    setMachineDetailInput({ machine_id: "", part: "", time_min: 0, instructions: "" });
  };

  const removeMachineDetail = (index) => {
    setMachineForm({
      ...machineForm,
      machineDetails: machineForm.machineDetails.filter((_, i) => i !== index),
    });
  };

  // Open Modal
  const openModal = (type, item = null) => {
    setModalType(type);
    setEditingItem(item);

    if (type === "bom") {
      if (item) {
        setBomForm({
          finished_id: item.finished_id,
          category: item.category || "Finished",
          instructions: item.instructions || "",
          bomDetails: [...item.bomDetails],
        });
      } else {
        resetBOMForm();
      }
    } else if (type === "production") {
      if (item) {
        setProductionForm({
          receipe_id: item.receipe_id || "",
          finished_id: item.finished_id,
          dated: item.dated,
          req_del_date: item.req_del_date || "",
          batch_no: item.batch_no || "",
          sale_ord_no: item.sale_ord_no || null,
          qty: item.qty,
          actual_yield: item.actual_yield || null,
          viscosity: item.viscosity || "",
          machine_id: item.machine_id || null,
          time_min: item.time_min || null,
          bom_id: item.bom_id || null,
          productionPlanDetail: item.productionPlanDetail || [],
        });
      } else {
        resetProductionForm();
      }
    } else if (type === "recipe") {
      if (item) {
        setRecipeForm({
          receipe_id: item.receipe_id,
          finished_id: item.finished_id,
          finished_count: item.finished_count,
          machine_id: item.machine_id || "",
          bom_id: item.bom_id || "",
          time_min: item.time_min || 0,
          status: item.status,
          dated: item.dated,
          receipeDetails: [...item.receipeDetails].sort((a, b) => a.sno - b.sno),
        });
      } else {
        resetRecipeForm();
      }
    } else if (type === "machine") {
      if (item) {
        setMachineForm({
          machine_id: item.machine_id,
          time_min: item.time_min,
          descr: item.descr,
          machineDetails: [...item.machineDetails],
        });
      } else {
        resetMachineForm();
      }
    }

    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setModalType("");
    setEditingItem(null);
    resetBOMForm();
    resetProductionForm();
    resetRecipeForm();
    resetMachineForm();
  };

  const isLoading = bomLoading || productionLoading || recipeLoading || machineLoading;

  // Sorting Handlers
  const handleBomSort = (field) => {
    if (bomSortBy === field) {
      setBomSortOrder(bomSortOrder === "asc" ? "desc" : "asc");
    } else {
      setBomSortBy(field);
      setBomSortOrder("asc");
    }
  };

  const handleProductionSort = (field) => {
    if (productionSortBy === field) {
      setProductionSortOrder(productionSortOrder === "asc" ? "desc" : "asc");
    } else {
      setProductionSortBy(field);
      setProductionSortOrder("asc");
    }
  };

  const handleRecipeSort = (field) => {
    if (recipeSortBy === field) {
      setRecipeSortOrder(recipeSortOrder === "asc" ? "desc" : "asc");
    } else {
      setRecipeSortBy(field);
      setRecipeSortOrder("asc");
    }
  };

  const handleMachineSort = (field) => {
    if (machineSortBy === field) {
      setMachineSortOrder(machineSortOrder === "asc" ? "desc" : "asc");
    } else {
      setMachineSortBy(field);
      setMachineSortOrder("asc");
    }
  };

  // Pagination Components
  const BomPagination = () => (
    <div className="flex justify-between items-center mt-4">
      <button
        onClick={() => setBomPage(Math.max(1, bomPage - 1))}
        disabled={bomPage === 1}
        className="flex items-center gap-2 px-4 py-2 bg-gray-200 rounded-lg disabled:opacity-50"
      >
        <ChevronLeft size={16} /> Previous
      </button>
      <span>Page {bomPage} of {Math.ceil(bomTotal / bomLimit)}</span>
      <button
        onClick={() => setBomPage(bomPage + 1)}
        disabled={bomPage >= Math.ceil(bomTotal / bomLimit)}
        className="flex items-center gap-2 px-4 py-2 bg-gray-200 rounded-lg disabled:opacity-50"
      >
        Next <ChevronRight size={16} />
      </button>
    </div>
  );

  const ProductionPagination = () => (
    <div className="flex justify-between items-center mt-4">
      <button
        onClick={() => setProductionPage(Math.max(1, productionPage - 1))}
        disabled={productionPage === 1}
        className="flex items-center gap-2 px-4 py-2 bg-gray-200 rounded-lg disabled:opacity-50"
      >
        <ChevronLeft size={16} /> Previous
      </button>
      <span>Page {productionPage} of {Math.ceil(productionTotal / productionLimit)}</span>
      <button
        onClick={() => setProductionPage(productionPage + 1)}
        disabled={productionPage >= Math.ceil(productionTotal / productionLimit)}
        className="flex items-center gap-2 px-4 py-2 bg-gray-200 rounded-lg disabled:opacity-50"
      >
        Next <ChevronRight size={16} />
      </button>
    </div>
  );

  const RecipePagination = () => (
    <div className="flex justify-between items-center mt-4">
      <button
        onClick={() => setRecipePage(Math.max(1, recipePage - 1))}
        disabled={recipePage === 1}
        className="flex items-center gap-2 px-4 py-2 bg-gray-200 rounded-lg disabled:opacity-50"
      >
        <ChevronLeft size={16} /> Previous
      </button>
      <span>Page {recipePage} of {Math.ceil(recipeTotal / recipeLimit)}</span>
      <button
        onClick={() => setRecipePage(recipePage + 1)}
        disabled={recipePage >= Math.ceil(recipeTotal / recipeLimit)}
        className="flex items-center gap-2 px-4 py-2 bg-gray-200 rounded-lg disabled:opacity-50"
      >
        Next <ChevronRight size={16} />
      </button>
    </div>
  );

  const MachinePagination = () => (
    <div className="flex justify-between items-center mt-4">
      <button
        onClick={() => setMachinePage(Math.max(1, machinePage - 1))}
        disabled={machinePage === 1}
        className="flex items-center gap-2 px-4 py-2 bg-gray-200 rounded-lg disabled:opacity-50"
      >
        <ChevronLeft size={16} /> Previous
      </button>
      <span>Page {machinePage} of {Math.ceil(machineTotal / machineLimit)}</span>
      <button
        onClick={() => setMachinePage(machinePage + 1)}
        disabled={machinePage >= Math.ceil(machineTotal / machineLimit)}
        className="flex items-center gap-2 px-4 py-2 bg-gray-200 rounded-lg disabled:opacity-50"
      >
        Next <ChevronRight size={16} />
      </button>
    </div>
  );

  // Recipe Detail Row for Drag-and-Drop
  const RecipeDetailRow = ({ detail, index, moveRecipeDetail }) => {
    const ref = React.useRef(null);
    const [{ isDragging }, drag] = useDrag({
      type: ITEM_TYPE,
      item: { index },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    });

    const [, drop] = useDrop({
      accept: ITEM_TYPE,
      hover: (item) => {
        if (item.index !== index) {
          moveRecipeDetail(item.index, index);
          item.index = index;
        }
      },
    });

    drag(drop(ref));

    return (
      <div
        ref={ref}
        className={`flex items-center justify-between p-3 bg-white rounded border cursor-move ${isDragging ? "opacity-50" : ""}`}
      >
        <div className="flex-1">
          <span className="font-medium">{detail.sno}. {detail.type === "product" ? "Product" : "Instruction"}: {detail.product_id}</span>
          <span className="text-sm text-gray-600 ml-2">
            {detail.product_desc}
            {detail.type === "product" ? ` - Qty: ${detail.qty} - %: ${detail.product_percentage}` : ` - ${detail.instructions}`}
          </span>
        </div>
        <button
          onClick={() => {
            setRecipeForm({
              ...recipeForm,
              receipeDetails: recipeForm.receipeDetails.filter((_, i) => i !== index).map((det, i) => ({ ...det, sno: i + 1 })),
            });
          }}
          className="text-red-600 hover:text-red-800"
        >
          <X size={16} />
        </button>
      </div>
    );
  };

  // Loading Spinner
  const LoadingSpinner = () => (
    <tr className="flex items-center justify-center py-8">
      <td className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></td>
      <td className="ml-2 text-gray-600">Loading...</td>
    </tr>
  );

  // Navigation Button
  const NavButton = ({ icon: Icon, label, tabKey, count }) => (
    <button
      onClick={() => setActiveTab(tabKey)}
      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 w-full text-left ${
        activeTab === tabKey
          ? "bg-blue-600 text-white shadow-lg"
          : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
      }`}
    >
      <Icon size={20} />
      <span className="font-medium">{label}</span>
      {count !== undefined && (
        <span
          className={`ml-auto px-2 py-1 rounded-full text-xs font-semibold ${
            activeTab === tabKey
              ? "bg-white text-blue-600"
              : "bg-gray-200 text-gray-600"
          }`}
        >
          {count}
        </span>
      )}
    </button>
  );

  // Action Button
  const ActionButton = ({ icon: Icon, label, onClick, variant = "primary", disabled = false }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 ${
        variant === "primary"
          ? "bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg"
          : variant === "secondary"
          ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
          : variant === "danger"
          ? "bg-red-100 text-red-700 hover:bg-red-200"
          : "bg-green-100 text-green-700 hover:bg-green-200"
      }`}
    >
      <Icon size={16} />
      {label}
    </button>
  );

  // Card Component
  const Card = ({ children, className = "" }) => (
    <div className={`bg-white rounded-xl shadow-md border border-gray-200 ${className}`}>
      {children}
    </div>
  );

  // Status Badge
  const StatusBadge = ({ status }) => (
    <span
      className={`px-3 py-1 rounded-full text-xs font-semibold ${
        status === "Active" || status === "Scheduled"
          ? "bg-green-100 text-green-800"
          : status === "In Progress"
          ? "bg-blue-100 text-blue-800"
          : status === "Completed"
          ? "bg-purple-100 text-purple-800"
          : status === "Inactive"
          ? "bg-red-100 text-red-800"
          : "bg-gray-100 text-gray-800"
      }`}
    >
      {status}
    </span>
  );

  // Notification Component
  const Notification = ({ message, type }) => (
    <div
      className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 flex items-center gap-2 ${
        type === "success" ? "bg-green-500 text-white" : type === "error" ? "bg-red-500 text-white" : "bg-yellow-500 text-white"
      }`}
    >
      {type === "success" ? <Check size={16} /> : <AlertCircle size={16} />}
      {message}
    </div>
  );

  // Select Options
  const finishOptions = finishItems.map((item) => ({
    value: item.itcd,
    label: `${item.itcd} - ${item.item}`,
  }));

  const bomOptions = bomItems.map((bom) => ({
    value: bom.id,
    label: `${bom.id} - ${bom.item?.item || bom.finished_id}`,
  }));

  const activeBomOptions = bomItems
    .filter((b) => b.instructions === "A")
    .map((bom) => ({
      value: bom.id,
      label: `${bom.id} - ${bom.item?.item || bom.finished_id}`,
    }));

  const machineOptions = machineInstructions.map((machine) => ({
    value: machine.rec_id,
    label: `${machine.machine_id} - ${machine.item?.item || machine.machine_id}`,
  }));

  const recipeOptions = recipes.map((recipe) => ({
    value: recipe.receipe_id,
    label: `${recipe.receipe_id} - ${recipe.item?.item || recipe.finished_id}`,
  }));

  // BOM Form
  const BOMForm = () => (
    <div className="flex flex-row h-full">
      {/* Left Side: Master Data */}
      <div className="w-1/2 p-4 border-r border-gray-200">
        <h4 className="font-semibold text-gray-800 mb-4">Master Data</h4>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Product Category</label>
            <select
              value={bomForm.category}
              onChange={(e) => setBomForm({ ...bomForm, category: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="Raw Material">Raw Material</option>
              <option value="Semi Finished">Semi Finished</option>
              <option value="Finished">Finished</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Finished Product</label>
            <Select
              value={finishOptions.find((opt) => opt.value === bomForm.finished_id) || null}
              onChange={(selected) =>
                setBomForm({
                  ...bomForm,
                  finished_id: selected ? selected.value : "",
                })
              }
              options={finishOptions}
              isSearchable
              isClearable
              placeholder="Select Product"
              classNamePrefix="react-select"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Instructions</label>
            <textarea
              value={bomForm.instructions}
              onChange={(e) => setBomForm({ ...bomForm, instructions: e.target.value })}
              placeholder="Enter instructions"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Right Side: Detail Data */}
      <div className="w-1/2 p-4 bg-gray-50">
        <h4 className="font-semibold text-gray-800 mb-4">Materials Required</h4>
        <div className="space-y-3 mb-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Select
              value={finishOptions.find((opt) => opt.value === materialInput.material_id) || null}
              onChange={(selected) =>
                setMaterialInput({
                  ...materialInput,
                  material_id: selected ? selected.value : "",
                  material_desc: selected ? selected.label.split(" - ")[1] : "",
                })
              }
              options={finishItems
                .filter((item) => item.itcd !== bomForm.finished_id)
                .map((item) => ({
                  value: item.itcd,
                  label: `${item.itcd} - ${item.item}`,
                }))}
              isSearchable
              isClearable
              placeholder="Select Material"
              classNamePrefix="react-select"
            />
            <input
              type="number"
              value={materialInput.material_percentage}
              onChange={(e) =>
                setMaterialInput({
                  ...materialInput,
                  material_percentage: parseFloat(e.target.value) || 0,
                })
              }
              placeholder="Percentage %"
              min="0"
              max="100"
              className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <button
              onClick={addMaterial}
              className="bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 font-medium"
            >
              Add Material
            </button>
          </div>
        </div>

        {bomForm.bomDetails.length > 0 && (
          <div className="space-y-2">
            <h5 className="font-medium text-gray-700">Added Materials:</h5>
            {bomForm.bomDetails.map((material, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-white rounded border">
                <div className="flex-1">
                  <span className="font-medium">{material.material_id}</span>
                  <span className="text-sm text-gray-600 ml-2">({material.material_desc})</span>
                  <span className="text-sm text-gray-600 ml-2">- {material.material_percentage}%</span>
                </div>
                <button
                  onClick={() => removeMaterial(index)}
                  className="text-red-600 hover:text-red-800"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
            <div className="text-sm text-gray-600 mt-2">
              Total: {bomForm.bomDetails.reduce((sum, mat) => sum + mat.material_percentage, 0)}% (Must equal 100%)
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // Production Plan Form
  const ProductionPlanForm = () => (
    <div className="flex flex-row h-full">
      {/* Left Side: Master Data */}
      <div className="w-1/2 p-4 border-r border-gray-200">
        <h4 className="font-semibold text-gray-800 mb-4">Master Data</h4>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Recipe ID</label>
            <Select
              value={recipeOptions.find((opt) => opt.value === productionForm.receipe_id) || null}
              onChange={(selected) =>
                setProductionForm({
                  ...productionForm,
                  receipe_id: selected ? selected.value : "",
                })
              }
              options={recipeOptions}
              isSearchable
              isClearable
              placeholder="Select Recipe ID"
              classNamePrefix="react-select"
              menuPortalTarget={document.body}
              styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Plan Date</label>
            <input
              type="date"
              value={productionForm.dated}
              onChange={(e) => setProductionForm({ ...productionForm, dated: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Required Delivery Date</label>
            <input
              type="date"
              value={productionForm.req_del_date}
              onChange={(e) => setProductionForm({ ...productionForm, req_del_date: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Batch Number</label>
            <input
              type="text"
              value={productionForm.batch_no}
              onChange={(e) => setProductionForm({ ...productionForm, batch_no: e.target.value })}
              placeholder="Enter batch number"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Sale Order Number</label>
            <input
              type="number"
              value={productionForm.sale_ord_no}
              onChange={(e) =>
                setProductionForm({ ...productionForm, sale_ord_no: parseInt(e.target.value) || null })
              }
              placeholder="Enter sale order number"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Production Quantity</label>
            <input
              type="number"
              value={productionForm.qty}
              onChange={(e) =>
                setProductionForm({
                  ...productionForm,
                  qty: parseFloat(e.target.value) || 0,
                })
              }
              placeholder="Enter quantity to produce"
              min="1"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Actual Yield</label>
            <input
              type="number"
              value={productionForm.actual_yield}
              onChange={(e) =>
                setProductionForm({ ...productionForm, actual_yield: parseFloat(e.target.value) || null })
              }
              placeholder="Enter actual yield"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Viscosity</label>
            <input
              type="text"
              value={productionForm.viscosity}
              onChange={(e) => setProductionForm({ ...productionForm, viscosity: e.target.value })}
              placeholder="Enter viscosity"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Right Side: Detail Data */}
      <div className="w-1/2 p-4 bg-gray-50">
        <h4 className="font-semibold text-gray-800 mb-4">Material Requirements (Auto-calculated from Recipe)</h4>
        {productionForm.productionPlanDetail.length > 0 ? (
          <div className="space-y-2">
            {productionForm.productionPlanDetail.map((material, index) => (
              <div key={index} className="flex justify-between items-center p-3 bg-white rounded border">
                <span className="font-medium">{material.material_desc}</span>
                <span className="text-sm text-gray-600">
                  {material.material_percentage}% - {material.material_qty} units (SNo: {material.sno})
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-600">Select a recipe and quantity to populate material requirements.</p>
        )}
      </div>
    </div>
  );

  // Recipe Form
  const RecipeForm = () => (
    <DndProvider backend={HTML5Backend}>
      <div className="flex flex-row h-full">
        {/* Left Side: Master Data */}
        <div className="w-1/2 p-4 border-r border-gray-200">
          <h4 className="font-semibold text-gray-800 mb-4">Master Data</h4>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Finished Product ID</label>
              <Select
                value={finishOptions.find((opt) => opt.value === recipeForm.finished_id) || null}
                onChange={(selected) =>
                  setRecipeForm({ ...recipeForm, finished_id: selected ? selected.value : "" })
                }
                options={finishOptions}
                isSearchable
                isClearable
                placeholder="Select Finished ID"
                classNamePrefix="react-select"
                menuPortalTarget={document.body}
                styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Finished Count</label>
              <input
                type="number"
                value={recipeForm.finished_count}
                onChange={(e) =>
                  setRecipeForm({ ...recipeForm, finished_count: parseInt(e.target.value) || 0 })
                }
                placeholder="Finished Count"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Machine ID</label>
              <Select
                value={machineOptions.find((opt) => opt.value === recipeForm.machine_id) || null}
                onChange={(selected) =>
                  setRecipeForm({ ...recipeForm, machine_id: selected ? selected.value : "" })
                }
                options={machineOptions}
                isSearchable
                isClearable
                placeholder="Select Machine ID"
                classNamePrefix="react-select"
                menuPortalTarget={document.body}
                styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Linked BOM ID (Active only)</label>
              <Select
                value={activeBomOptions.find((opt) => opt.value === recipeForm.bom_id) || null}
                onChange={(selected) =>
                  setRecipeForm({ ...recipeForm, bom_id: selected ? selected.value : "" })
                }
                options={activeBomOptions}
                isSearchable
                isClearable
                placeholder="Select BOM ID"
                classNamePrefix="react-select"
                menuPortalTarget={document.body}
                styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Time (min)</label>
              <input
                type="number"
                value={recipeForm.time_min}
                onChange={(e) =>
                  setRecipeForm({ ...recipeForm, time_min: parseInt(e.target.value) || 0 })
                }
                placeholder="Time in minutes"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
              <select
                value={recipeForm.status}
                onChange={(e) => setRecipeForm({ ...recipeForm, status: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Draft">Draft</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Date</label>
              <input
                type="date"
                value={recipeForm.dated}
                onChange={(e) => setRecipeForm({ ...recipeForm, dated: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Right Side: Detail Data */}
        <div className="w-1/2 p-4 bg-gray-50">
          <h4 className="font-semibold text-gray-800 mb-4">Recipe Details (Drag to reorder)</h4>
          {recipeForm.receipeDetails.length > 0 ? (
            <div className="space-y-2">
              <h5 className="font-medium text-gray-700">Sequence (Drag to reorder):</h5>
              {recipeForm.receipeDetails.map((detail, index) => (
                <RecipeDetailRow
                  key={index}
                  detail={detail}
                  index={index}
                  moveRecipeDetail={moveRecipeDetail}
                />
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-600">Select a BOM and Machine ID to populate recipe details.</p>
          )}
        </div>
      </div>
    </DndProvider>
  );

  // Machine Instruction Form
  const MachineInstructionForm = () => (
    <div className="flex flex-row h-full">
      {/* Left Side: Master Data */}
      <div className="w-1/2 p-4 border-r border-gray-200">
        <h4 className="font-semibold text-gray-800 mb-4">Master Data</h4>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Machine ID</label>
            <Select
              value={finishOptions.find((opt) => opt.value === machineForm.machine_id) || null}
              onChange={(selected) =>
                setMachineForm({ ...machineForm, machine_id: selected ? selected.value : "" })
              }
              options={finishOptions}
              isSearchable
              isClearable
              placeholder="Select Machine ID"
              classNamePrefix="react-select"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Time (min)</label>
            <input
              type="number"
              value={machineForm.time_min}
              onChange={(e) =>
                setMachineForm({ ...machineForm, time_min: parseInt(e.target.value) || 0 })
              }
              placeholder="Time in minutes"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
            <textarea
              value={machineForm.descr}
              onChange={(e) => setMachineForm({ ...machineForm, descr: e.target.value })}
              placeholder="Description"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Right Side: Detail Data */}
      <div className="w-1/2 p-4 bg-gray-50">
        <h4 className="font-semibold text-gray-800 mb-4">Machine Details</h4>
        <div className="space-y-3 mb-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <Select
              value={finishOptions.find((opt) => opt.value === machineDetailInput.machine_id) || null}
              onChange={(selected) =>
                setMachineDetailInput({ ...machineDetailInput, machine_id: selected ? selected.value : "" })
              }
              options={finishOptions}
              isSearchable
              isClearable
              placeholder="Select Machine ID"
              classNamePrefix="react-select"
            />
            <input
              type="text"
              value={machineDetailInput.part}
              onChange={(e) => setMachineDetailInput({ ...machineDetailInput, part: e.target.value })}
              placeholder="Part"
              className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <input
              type="number"
              value={machineDetailInput.time_min}
              onChange={(e) =>
                setMachineDetailInput({ ...machineDetailInput, time_min: parseInt(e.target.value) || 0 })
              }
              placeholder="Time (min)"
              className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <input
              type="text"
              value={machineDetailInput.instructions}
              onChange={(e) =>
                setMachineDetailInput({ ...machineDetailInput, instructions: e.target.value })
              }
              placeholder="Instructions"
              className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <button
              onClick={addMachineDetail}
              className="bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 font-medium col-span-full md:col-auto"
            >
              Add Detail
            </button>
          </div>
        </div>

        {machineForm.machineDetails.length > 0 && (
          <div className="space-y-2">
            <h5 className="font-medium text-gray-700">Added Details:</h5>
            {machineForm.machineDetails.map((detail, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-white rounded border">
                <div className="flex-1">
                  <span className="font-medium">{detail.machine_id}</span>
                  <span className="text-sm text-gray-600 ml-2">
                    Part: {detail.part} - Time: {detail.time_min} min - Instructions: {detail.instructions}
                  </span>
                </div>
                <button
                  onClick={() => removeMachineDetail(index)}
                  className="text-red-600 hover:text-red-800"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  // Modal Component
  const Modal = ({ isOpen, onClose, title, children, onSave }) => {
    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl max-w-6xl w-full max-h-full overflow-hidden">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">{title}</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">
              ×
            </button>
          </div>
          <div className="p-6 overflow-y-auto max-h-[70vh]">{children}</div>
          <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <ActionButton
              icon={Save}
              label={editingItem ? "Update" : "Save"}
              onClick={onSave}
              variant="primary"
              disabled={modalType === "production" && productionForm.productionPlanDetail.length === 0}
            />
          </div>
        </div>
      </div>
    );
  };

  // Main Render
  return (
    <div className="min-h-screen bg-gray-50">
      {notification && <Notification message={notification.message} type={notification.type} />}

      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <BoxIcon className="text-blue-600" size={28} />
              <h1 className="text-xl font-bold text-gray-900">Manufacturing Hub</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-12 gap-8">
          <div className="col-span-12 lg:col-span-3">
            <Card className="p-6">
              <nav className="space-y-2">
                <NavButton icon={BarChart3} label="Dashboard" tabKey="dashboard" />
                <NavButton icon={BoxIcon} label="Bill of Materials" tabKey="bom" count={bomTotal} />
                <NavButton icon={Calendar} label="Production Plans" tabKey="production" count={productionTotal} />
                <NavButton icon={BookOpen} label="Recipes" tabKey="recipe" count={recipeTotal} />
                <NavButton icon={Cog} label="Machine Instructions" tabKey="machine" count={machineTotal} />
              </nav>
            </Card>
          </div>

          <div className="col-span-12 lg:col-span-9">
            {activeTab === "dashboard" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <Card className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total BOMs</p>
                        <p className="text-2xl font-bold text-gray-900">{bomTotal}</p>
                      </div>
                      <FileText className="text-blue-600" size={32} />
                    </div>
                  </Card>
                  <Card className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Production Plans</p>
                        <p className="text-2xl font-bold text-gray-900">{productionTotal}</p>
                      </div>
                      <Calendar className="text-green-600" size={32} />
                    </div>
                  </Card>
                  <Card className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Recipes</p>
                        <p className="text-2xl font-bold text-gray-900">{recipeTotal}</p>
                      </div>
                      <BookOpen className="text-purple-600" size={32} />
                    </div>
                  </Card>
                  <Card className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Machine Instructions</p>
                        <p className="text-2xl font-bold text-gray-900">{machineTotal}</p>
                      </div>
                      <Cog className="text-orange-600" size={32} />
                    </div>
                  </Card>
                </div>
                <Card className="p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Activities</h3>
                  <p className="text-sm text-gray-600">No recent activities to display.</p>
                </Card>
              </div>
            )}
            {activeTab === "bom" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">Bill of Materials</h2>
                  <ActionButton
                    icon={Plus}
                    label="New BOM"
                    onClick={() => openModal("bom")}
                    variant="primary"
                  />
                </div>
                <div className="flex items-center gap-4">
                  <div className="relative flex-1">
                    <Search
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                      size={16}
                    />
                    <input
                      type="text"
                      value={searchBOM}
                      onChange={(e) => setSearchBOM(e.target.value)}
                      placeholder="Search BOMs..."
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full"
                    />
                  </div>
                  <select
                    value={filterBOM}
                    onChange={(e) => setFilterBOM(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">All Status</option>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Draft">Draft</option>
                  </select>
                </div>
                <Card>
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                          onClick={() => handleBomSort("id")}
                        >
                          BOM ID <ArrowUpDown size={12} className="inline" />
                        </th>
                        <th
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                          onClick={() => handleBomSort("finished_id")}
                        >
                          Finished ID <ArrowUpDown size={12} className="inline" />
                        </th>
                        <th
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                          onClick={() => handleBomSort("dated")}
                        >
                          Date Created <ArrowUpDown size={12} className="inline" />
                        </th>
                        <th
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                          onClick={() => handleBomSort("status")}
                        >
                          Status <ArrowUpDown size={12} className="inline" />
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Linked Recipes
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {bomLoading ? (
                        <LoadingSpinner />
                      ) : bomItems.length === 0 ? (
                        <tr>
                          <td colSpan="6" className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                            No BOMs found.
                          </td>
                        </tr>
                      ) : (
                        bomItems.map((item, index) => (
                          <tr key={index}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.id}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.finished_id}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{new Date(item.dated).toLocaleDateString(
                              "en-US",
                              { year: "numeric", month: "short", day: "numeric" }
                            )}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <StatusBadge status={item.instructions=== "A" ? "Active" : "Inactive"} />
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {item.receipeMasters?.map((r) => r.receipe_id).join(", ") || "None"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-right space-x-2">
                              <button
                                onClick={() => openModal("bom", item)}
                                className="text-blue-600 hover:text-blue-900"
                                title="Edit"
                              >
                                <Edit size={16} />
                              </button>
                              <button
                                onClick={() => deleteBOM(item.id)}
                                className="text-red-600 hover:text-red-900"
                                title="Delete"
                              >
                                <Trash2 size={16} />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </Card>
                <BomPagination />
              </div>
            )}
            {activeTab === "production" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">Production Plans</h2>
                  <ActionButton
                    icon={Plus}
                    label="New Plan"
                    onClick={() => openModal("production")}
                    variant="primary"
                  />
                </div>
                <div className="flex items-center gap-4">
                  <div className="relative flex-1">
                    <Search
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                      size={16}
                    />
                    <input
                      type="text"
                      value={searchProduction}
                      onChange={(e) => setSearchProduction(e.target.value)}
                      placeholder="Search production plans..."
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full"
                    />
                  </div>
                  <select
                    value={filterProduction}
                    onChange={(e) => setFilterProduction(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">All Status</option>
                    <option value="Scheduled">Scheduled</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
                <Card>
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                          onClick={() => handleProductionSort("id")}
                        >
                          Plan ID <ArrowUpDown size={12} className="inline" />
                        </th>
                        <th
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                          onClick={() => handleProductionSort("finished_id")}
                        >
                          Finished ID <ArrowUpDown size={12} className="inline" />
                        </th>
                        <th
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                          onClick={() => handleProductionSort("item.item")}
                        >
                          Product Name <ArrowUpDown size={12} className="inline" />
                        </th>
                        <th
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                          onClick={() => handleProductionSort("dated")}
                        >
                          Date <ArrowUpDown size={12} className="inline" />
                        </th>
                        <th
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                          onClick={() => handleProductionSort("qty")}
                        >
                          Quantity <ArrowUpDown size={12} className="inline" />
                        </th>
                                                <th
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                          onClick={() => handleProductionSort("status")}
                        >
                          Status <ArrowUpDown size={12} className="inline" />
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {productionLoading ? (
                        <LoadingSpinner />
                      ) : productionPlans.length === 0 ? (
                        <tr>
                          <td colSpan="7" className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                            No production plans found.
                          </td>
                        </tr>
                      ) : (
                        productionPlans.map((plan, index) => (
                          <tr key={index}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{plan.id}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{plan.finished_id}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{plan.item?.item || plan.finished_id}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{plan.dated}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{plan.qty}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <StatusBadge status={plan.status} />
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-right space-x-2">
                              <button
                                onClick={() => openModal("production", plan)}
                                className="text-blue-600 hover:text-blue-900"
                                title="Edit"
                              >
                                <Edit size={16} />
                              </button>
                              <button
                                onClick={() => deleteProductionPlan(plan.id)}
                                className="text-red-600 hover:text-red-900"
                                title="Delete"
                              >
                                <Trash2 size={16} />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </Card>
                <ProductionPagination />
              </div>
            )}
            {activeTab === "recipe" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">Recipes</h2>
                  <ActionButton
                    icon={Plus}
                    label="New Recipe"
                    onClick={() => openModal("recipe")}
                    variant="primary"
                  />
                </div>
                <div className="flex items-center gap-4">
                  <div className="relative flex-1">
                    <Search
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                      size={16}
                    />
                    <input
                      type="text"
                      value={searchRecipe}
                      onChange={(e) => setSearchRecipe(e.target.value)}
                      placeholder="Search recipes..."
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full"
                    />
                  </div>
                  <select
                    value={filterRecipe}
                    onChange={(e) => setFilterRecipe(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">All Status</option>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Draft">Draft</option>
                  </select>
                </div>
                <Card>
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                          onClick={() => handleRecipeSort("receipe_id")}
                        >
                          Recipe ID <ArrowUpDown size={12} className="inline" />
                        </th>
                        <th
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                          onClick={() => handleRecipeSort("finished_id")}
                        >
                          Finished ID <ArrowUpDown size={12} className="inline" />
                        </th>
                        <th
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                          onClick={() => handleRecipeSort("item.item")}
                        >
                          Product Name <ArrowUpDown size={12} className="inline" />
                        </th>
                        <th
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                          onClick={() => handleRecipeSort("dated")}
                        >
                          Date Created <ArrowUpDown size={12} className="inline" />
                        </th>
                        <th
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                          onClick={() => handleRecipeSort("status")}
                        >
                          Status <ArrowUpDown size={12} className="inline" />
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {recipeLoading ? (
                        <LoadingSpinner />
                      ) : recipes.length === 0 ? (
                        <tr>
                          <td colSpan="6" className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                            No recipes found.
                          </td>
                        </tr>
                      ) : (
                        recipes.map((recipe, index) => (
                          <tr key={index}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{recipe.receipe_id}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{recipe.finished_id}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{recipe.item?.item || recipe.finished_id}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{new Date(recipe.dated).toLocaleDateString(
                              "en-US",
                              { year: "numeric", month: "short", day: "numeric" }
                            )}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <StatusBadge status={recipe.status==="A" ? "Active" : "Inactive"} />
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-right space-x-2">
                              <button
                                onClick={() => openModal("recipe", recipe)}
                                className="text-blue-600 hover:text-blue-900"
                                title="Edit"
                              >
                                <Edit size={16} />
                              </button>
                              <button
                                onClick={() => deleteRecipe(recipe.receipe_id)}
                                className="text-red-600 hover:text-red-900"
                                title="Delete"
                              >
                                <Trash2 size={16} />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </Card>
                <RecipePagination />
              </div>
            )}
            {activeTab === "machine" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">Machine Instructions</h2>
                  <ActionButton
                    icon={Plus}
                    label="New Instruction"
                    onClick={() => openModal("machine")}
                    variant="primary"
                  />
                </div>
                <div className="flex items-center gap-4">
                  <div className="relative flex-1">
                    <Search
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                      size={16}
                    />
                    <input
                      type="text"
                      value={searchMachine}
                      onChange={(e) => setSearchMachine(e.target.value)}
                      placeholder="Search machine instructions..."
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full"
                    />
                  </div>
                  <select
                    value={filterMachine}
                    onChange={(e) => setFilterMachine(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">All Status</option>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Draft">Draft</option>
                  </select>
                </div>
                <Card>
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                          onClick={() => handleMachineSort("rec_id")}
                        >
                          Machine ID <ArrowUpDown size={12} className="inline" />
                        </th>
                        <th
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                          onClick={() => handleMachineSort("machine_id")}
                        >
                          Machine Name <ArrowUpDown size={12} className="inline" />
                        </th>
                        <th
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                          onClick={() => handleMachineSort("time_min")}
                        >
                          Time (min) <ArrowUpDown size={12} className="inline" />
                        </th>
                        {/* <th
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                          onClick={() => handleMachineSort("status")}
                        >
                          Status <ArrowUpDown size={12} className="inline" />
                        </th> */}
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {machineLoading ? (
                        <LoadingSpinner />
                      ) : machineInstructions.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                            No machine instructions found.
                          </td>
                        </tr>
                      ) : (
                        machineInstructions.map((machine, index) => (
                          <tr key={index}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{machine.rec_id}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{machine.item?.item || machine.machine_id}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{machine.time_min}</td>
                            {/* <td className="px-6 py-4 whitespace-nowrap">
                              <StatusBadge status={machine.status} />
                            </td> */}
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-right space-x-2">
                              <button
                                onClick={() => openModal("machine", machine)}
                                className="text-blue-600 hover:text-blue-900"
                                title="Edit"
                              >
                                <Edit size={16} />
                              </button>
                              <button
                                onClick={() => deleteMachineInstruction(machine.rec_id)}
                                className="text-red-600 hover:text-red-900"
                                title="Delete"
                              >
                                <Trash2 size={16} />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </Card>
                <MachinePagination />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal */}
      <Modal
        isOpen={showModal}
        onClose={closeModal}
        title={
          modalType === "bom"
            ? editingItem
              ? "Edit Bill of Materials"
              : "Create Bill of Materials"
            : modalType === "production"
            ? editingItem
              ? "Edit Production Plan"
              : "Create Production Plan"
            : modalType === "recipe"
            ? editingItem
              ? "Edit Recipe"
              : "Create Recipe"
            : editingItem
            ? "Edit Machine Instruction"
            : "Create Machine Instruction"
        }
        onSave={
          modalType === "bom"
            ? editingItem
              ? updateBOM
              : createBOM
            : modalType === "production"
            ? editingItem
              ? updateProductionPlan
              : createProductionPlan
            : modalType === "recipe"
            ? editingItem
              ? updateRecipe
              : createRecipe
            : editingItem
            ? updateMachineInstruction
            : createMachineInstruction
        }
      >
        {modalType === "bom" && <BOMForm />}
        {modalType === "production" && <ProductionPlanForm />}
        {modalType === "recipe" && <RecipeForm />}
        {modalType === "machine" && <MachineInstructionForm />}
      </Modal>
    </div>
  );
};

export default Material;