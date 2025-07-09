"use client";
import React, { useState, useEffect } from "react";
import {
  Plus,
  Edit,
  Trash2,
  X,
  Eye,
  EyeOff,
  Users,
  UserPlus,
  Search,
  Filter,
  Menu,
} from "lucide-react";
import axios from "axios";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("create");
  const [selectedUser, setSelectedUser] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [shifts, setShifts] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "CASHIER",
    isActive: true,
  });
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    fetchUsers();
    fetchShifts();
  }, []);

  // Add this effect to clear shift when role changes
  useEffect(() => {
    if (formData.role !== "CASHIER") {
      setFormData((prev) => ({ ...prev, shiftId: null }));
    }
  }, [formData.role]);

  const fetchShifts = async () => {
    try {
      const response = await axios.get("/api/shifts");
      setShifts(response.data);
    } catch (error) {
      console.error("Error fetching shifts:", error);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get("/api/users", {
        params: { includeShifts: true },
      });
      setUsers(response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
      setError(error.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      setError(null);

      if (modalType === "create") {
        const response = await axios.post("/api/users", formData);
        const newUser = response.data;
        setUsers([newUser, ...users]);
      } else {
        const response = await axios.put(
          `/api/users/${selectedUser.id}`,
          formData
        );
        const updatedUser = response.data;
        setUsers(
          users.map((user) =>
            user.id === selectedUser.id ? updatedUser : user
          )
        );
      }

      closeModal();
    } catch (error) {
      console.error("Error saving user:", error);
      setError(
        error.response?.data?.message || error.message || "Something went wrong"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (userId) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await axios.delete(`/api/users/${userId}`);
        setUsers(users.filter((user) => user.id !== userId));
      } catch (error) {
        console.error("Error deleting user:", error);
        setError(
          error.response?.data?.message ||
            error.message ||
            "Failed to delete user"
        );
      }
    }
  };

  const formatTo12Hour = (timeString) => {
    if (!timeString) return "";

    try {
      const [hours, minutes] = timeString.split(":");
      const hourInt = parseInt(hours, 10);
      const minuteInt = parseInt(minutes, 10) || 0;

      const period = hourInt >= 12 ? "PM" : "AM";
      const twelveHour = hourInt % 12 || 12;
      const paddedMinutes = minuteInt.toString().padStart(2, "0");

      return `${twelveHour}:${paddedMinutes} ${period}`;
    } catch {
      return timeString;
    }
  };

  const openModal = (type, user = null) => {
    setModalType(type);
    setSelectedUser(user);
    setFormData(
      user
        ? {
            id: user.id,
            name: user.name,
            email: user.email,
            password: "",
            role: user.role,
            isActive: user.isActive,
          }
        : {
            name: "",
            email: "",
            password: "",
            role: "CASHIER",
            isActive: true,
          }
    );
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedUser(null);
    setShowPassword(false);
    setFormData({
      name: "",
      email: "",
      password: "",
      role: "CASHIER",
      isActive: true,
    });
    setError(null);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading users...</p>
        </div>
      </div>
    );
  }

  if (error && users.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="bg-destructive/10 p-4 rounded-lg mb-4">
            <p className="text-destructive">Error: {error}</p>
          </div>
          <button
            onClick={fetchUsers}
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-4 md:py-8">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
        {/* Error Display */}
        {error && (
          <div className="bg-destructive/10 border border-destructive rounded-lg p-3 mb-4 md:mb-6">
            <div className="flex items-center justify-between">
              <p className="text-destructive text-sm md:text-base">{error}</p>
              <button
                onClick={() => setError(null)}
                className="text-destructive hover:text-destructive/80"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="bg-card rounded-lg shadow-sm border border-border mb-4 md:mb-8">
          <div className="px-4 py-3 md:px-6 md:py-4 border-b border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 md:space-x-3">
                <div className="bg-primary/10 p-1 md:p-2 rounded-lg">
                  <Users className="h-5 w-5 md:h-6 md:w-6 text-primary" />
                </div>
                <div>
                  <h1 className="text-lg md:text-2xl font-bold text-foreground">
                    User Management
                  </h1>
                  <p className="text-xs md:text-sm text-muted-foreground">
                    Manage your users and their permissions
                  </p>
                </div>
              </div>
              <button
                onClick={() => openModal("create")}
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-3 py-1 md:px-4 md:py-2 rounded-lg flex items-center space-x-1 md:space-x-2 transition-colors text-sm md:text-base"
              >
                <UserPlus className="h-3 w-3 md:h-4 md:w-4" />
                <span>Add User</span>
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="px-4 py-3 md:px-6 md:py-4 bg-muted border-b border-border">
            <div className="flex flex-col space-y-3 md:space-y-0 md:flex-row md:items-center md:justify-between">
              <div className="relative flex-1 max-w-md">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-muted-foreground" />
                </div>
                <input
                  type="text"
                  autoComplete="off"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent text-sm md:text-base bg-background"
                />
              </div>
              <div className="flex items-center space-x-2 md:space-x-3">
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="md:hidden text-muted-foreground hover:text-foreground"
                >
                  <Menu className="h-5 w-5" />
                </button>
                <div
                  className={`${
                    isMobileMenuOpen ? "block" : "hidden"
                  } md:block`}
                >
                  <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="border border-input rounded-lg px-3 py-2 focus:ring-2 focus:ring-ring focus:border-transparent text-sm md:text-base w-full md:w-auto bg-background"
                  >
                    <option value="all">All Roles</option>
                    <option value="ADMIN">Admin</option>
                    <option value="CASHIER">Cashier</option>
                    <option value="ACCOUNTANT">Accountant</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-card rounded-lg shadow-sm border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-primary">
                <tr>
                  <th className="px-3 py-2 md:px-6 md:py-3 text-left text-xs font-medium text-primary-foreground uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-3 py-2 md:px-6 md:py-3 text-left text-xs font-medium text-primary-foreground uppercase tracking-wider hidden sm:table-cell">
                    Role
                  </th>
                  <th className="px-3 py-2 md:px-6 md:py-3 text-left text-xs font-medium text-primary-foreground uppercase tracking-wider hidden sm:table-cell">
                    Status
                  </th>
                  <th className="px-3 py-2 md:px-6 md:py-3 text-left text-xs font-medium text-primary-foreground uppercase tracking-wider hidden md:table-cell">
                    {roleFilter === "all" || roleFilter === "CASHIER"
                      ? "Shift"
                      : ""}
                  </th>
                  <th className="px-3 py-2 md:px-6 md:py-3 text-right text-xs font-medium text-primary-foreground uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-card divide-y divide-border">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-secondary">
                    <td className="px-3 py-3 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8 md:h-10 md:w-10">
                          <div className="h-8 w-8 md:h-10 md:w-10 rounded-full bg-primary flex items-center justify-center">
                            <span className="text-primary-foreground font-medium text-xs md:text-sm">
                              {user.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </span>
                          </div>
                        </div>
                        <div className="ml-2 md:ml-4">
                          <div className="text-sm font-medium text-primary">
                            {user.name}
                          </div>
                          <div className="text-xs md:text-sm text-primary">
                            {user.email}
                          </div>

                          {/* Role & Status - mobile only */}
                          <div className="sm:hidden mt-1 flex flex-wrap gap-1">
                            <span
                              className={`inline-flex px-1.5 py-0.5 text-xs font-semibold rounded-full ${
                                user.role === "ADMIN"
                                  ? "bg-purple-100 text-purple-800"
                                  : "bg-blue-100 text-blue-800"
                              }`}
                            >
                              {user.role}
                            </span>
                            <span
                              className={`inline-flex px-1.5 py-0.5 text-xs font-semibold rounded-full ${
                                user.isActive
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {user.isActive ? "Active" : "Inactive"}
                            </span>

                            {/* Shift - show on mobile if role is CASHIER */}
                            {user.role === "CASHIER" && (
                              <div className="text-muted-foreground text-xs">
                                {user.shift ? (
                                  <>
                                    {user.shift.name} |{" "}
                                    {formatTo12Hour(user.shift.startTime)} -{" "}
                                    {formatTo12Hour(user.shift.endTime)}
                                  </>
                                ) : (
                                  "Not assigned"
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-3 py-3 whitespace-nowrap hidden sm:table-cell">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          user.role === "ADMIN"
                            ? "bg-purple-100 text-purple-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap hidden sm:table-cell">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          user.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {user.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap text-xs md:text-sm text-primary hidden md:table-cell">
                      {user.role === "CASHIER" && user.shift ? (
                        <div>
                          <div>{user.shift.name}</div>
                          <div className="text-muted-foreground text-xs">
                            {formatTo12Hour(user.shift?.startTime)} -{" "}
                            {formatTo12Hour(user.shift?.endTime)}
                          </div>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">
                          {user.role === "CASHIER" ? "Not assigned" : ""}
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-1 md:space-x-2">
                        <button
                          onClick={() => openModal("edit", user)}
                          className="text-primary hover:text-primary/80 p-1 rounded-md hover:bg-primary/10 transition-colors"
                          aria-label="Edit user"
                        >
                          <Edit className="h-3 w-3 md:h-4 md:w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(user.id)}
                          className="text-destructive hover:text-destructive/80 p-1 rounded-md hover:bg-destructive/10 transition-colors"
                          aria-label="Delete user"
                        >
                          <Trash2 className="h-3 w-3 md:h-4 md:w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-8 md:py-12">
              <Users className="h-10 w-10 md:h-12 md:w-12 text-muted-foreground mx-auto mb-3 md:mb-4" />
              <p className="text-muted-foreground text-sm md:text-base">
                No users found
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 md:p-4">
          <div className="bg-primary rounded-lg md:rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 md:p-6 border-b border-border">
              <h3 className="text-lg font-semibold text-primary-foreground">
                {modalType === "create" ? "Add New User" : "Edit User"}
              </h3>
              <button
                onClick={closeModal}
                className="text-primary-foreground transition-colors"
                aria-label="Close modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-4 md:p-6 space-y-3 md:space-y-4">
              {error && (
                <div className="bg-secondary/10 border border-secondary rounded-lg p-2 md:p-3">
                  <p className="text-secondary text-sm">{error}</p>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-primary-foreground mb-1 md:mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  autoComplete="off"
                  placeholder="Enter full name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent text-sm md:text-base bg-background"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-primary-foreground mb-1 md:mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="Enter email address"
                  autoComplete="off"
                  name="new-email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent text-sm md:text-base bg-background"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-primary-foreground mb-1 md:mb-2">
                  {modalType === "create"
                    ? "Password"
                    : "New Password (leave blank to keep current)"}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder={
                      modalType === "create"
                        ? "Enter password"
                        : "Enter new password (optional)"
                    }
                    value={formData.password}
                    autoComplete="new-password"
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    className="w-full px-3 py-2 pr-10 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent text-sm md:text-base bg-background"
                    required={modalType === "create"}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-primary-foreground mb-1 md:mb-2">
                  Role
                </label>
                <select
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({ ...formData, role: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent text-sm md:text-base bg-background"
                >
                  <option value="ADMIN">Admin</option>
                  <option value="CASHIER">Cashier</option>
                  <option value="ACCOUNTANT">Accountant</option>
                </select>
              </div>

              {formData.role === "CASHIER" && (
                <div>
                  <label className="block text-sm font-medium text-primary-foreground mb-1 md:mb-2">
                    Shift
                  </label>
                  <select
                    value={formData.shiftId || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        shiftId: e.target.value || null,
                      })
                    }
                    className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent text-sm md:text-base bg-background"
                  >
                    <option value="">Select shift</option>
                    {shifts.map((shift) => (
                      <option key={shift.id} value={shift.id}>
                        {shift.name} ({formatTo12Hour(shift.startTime)} -{" "}
                        {formatTo12Hour(shift.endTime)})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) =>
                    setFormData({ ...formData, isActive: e.target.checked })
                  }
                  className="h-4 w-4 text-primary focus:ring-primary border-input rounded"
                />
                <label
                  htmlFor="isActive"
                  className="ml-2 block text-sm text-primary-foreground"
                >
                  Active user
                </label>
              </div>

              <div className="flex justify-end space-x-2 md:space-x-3 pt-3 md:pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-3 py-1.5 md:px-4 md:py-2 text-sm font-medium text-foreground bg-secondary hover:bg-secondary/80 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="px-3 py-1.5 md:px-4 md:py-2 text-sm font-medium text-foreground bg-secondary hover:bg-secondary/80 disabled:bg-primary/50 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center space-x-1 md:space-x-2"
                >
                  {submitting && (
                    <div className="animate-spin h-3 w-3 md:h-4 md:w-4 border-2 border-primary-foreground border-t-transparent rounded-full"></div>
                  )}
                  <span>
                    {submitting
                      ? "Saving..."
                      : modalType === "create"
                      ? "Create User"
                      : "Update User"}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
