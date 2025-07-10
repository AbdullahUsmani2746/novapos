"use client";
import React, { useState, useEffect } from "react";
import { Plus, Edit, Trash2, X, Clock, Search } from "lucide-react";
import axios from "axios";

const ShiftPage = () => {
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("create");
  const [selectedShift, setSelectedShift] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showUsersModal, setShowUsersModal] = useState(false);
  const [shiftUsers, setShiftUsers] = useState([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);

  const [formData, setFormData] = useState({
    name: "",
    startTime: "",
    endTime: "",
  });
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchShifts();
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm, page]);

  useEffect(() => {
    fetchShifts();
  }, []);

  const fetchShifts = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get("/api/shifts", {
        params: { search: searchTerm, page, limit },
      });

      const formatted = response.data.shifts.map((shift) => ({
        ...shift,
        startTime: formatTime(shift.startTime),
        endTime: formatTime(shift.endTime),
      }));

      setShifts(formatted);
      setTotal(response.data.total);
    } catch (error) {
      console.error("Error fetching shifts:", error);
      setError(error.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const formatTo12Hour = (timeString) => {
    if (timeString.includes("AM") || timeString.includes("PM")) {
      return timeString;
    }

    if (timeString.includes(":")) {
      const [hours, minutes] = timeString.split(":");
      const hourInt = parseInt(hours, 10);

      const period = hourInt >= 12 ? "PM" : "AM";
      const twelveHour = hourInt % 12 || 12;

      return `${twelveHour}:${minutes} ${period}`;
    }

    if (timeString.includes("T")) {
      return new Date(timeString).toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    }

    return timeString;
  };

   const openUsersModal = (users) => {
    setShiftUsers(users);
    setShowUsersModal(true);
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      setError(null);

      // Simple validation
      if (!formData.startTime || !formData.endTime) {
        throw new Error("Start and end times are required");
      }

      if (formData.startTime >= formData.endTime) {
        throw new Error("End time must be after start time");
      }

      if (modalType === "create") {
        const response = await axios.post("/api/shifts", formData);
        setShifts([response.data, ...shifts]);
      } else {
        const response = await axios.put(
          `/api/shifts/${selectedShift.id}`,
          formData
        );
        setShifts(
          shifts.map((shift) =>
            shift.id === selectedShift.id ? response.data : shift
          )
        );
      }

      closeModal();
    } catch (error) {
      console.error("Error saving shift:", error);
      setError(
        error.response?.data?.error || error.message || "Something went wrong"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (shiftId) => {
    if (window.confirm("Are you sure you want to delete this shift?")) {
      try {
        await axios.delete(`/api/shifts/${shiftId}`);
        setShifts(shifts.filter((shift) => shift.id !== shiftId));
      } catch (error) {
        console.error("Error deleting shift:", error);
        setError(
          error.response?.data?.error ||
            error.message ||
            "Failed to delete shift"
        );
      }
    }
  };

  const openModal = (type, shift = null) => {
    setModalType(type);
    setSelectedShift(shift);

    if (shift) {
      setFormData({
        name: shift.name,
        startTime: shift.startTime,
        endTime: shift.endTime,
      });
    } else {
      setFormData({
        name: "",
        startTime: "08:00",
        endTime: "17:00",
      });
    }

    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedShift(null);
    setFormData({
      name: "",
      startTime: "",
      endTime: "",
    });
    setError(null);
  };

  const formatTime = (timeString) => {
    if (typeof timeString === "string" && timeString.includes(":")) {
      return timeString;
    }

    try {
      return new Date(timeString).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    } catch {
      return timeString;
    }
  };

  const filteredShifts = shifts.filter((shift) =>
    shift.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // if (loading) {
  //   return (
  //     <div className="min-h-screen bg-background flex items-center justify-center p-4">
  //       <div className="text-center">
  //         <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto mb-3"></div>
  //         <p className="text-muted-foreground text-sm md:text-base">
  //           Loading shifts...
  //         </p>
  //       </div>
  //     </div>
  //   );
  // }

  if (error && shifts.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center max-w-xs md:max-w-md">
          <div className="bg-destructive/10 p-3 md:p-4 rounded-lg mb-4">
            <p className="text-destructive text-sm md:text-base">
              Error: {error}
            </p>
          </div>
          <button
            onClick={fetchShifts}
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg text-sm md:text-base"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-2 sm:py-4 md:py-6 lg:py-8">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
        {error && (
          <div className="bg-destructive/10 border border-destructive rounded-lg p-2 sm:p-3 mb-3 sm:mb-4 md:mb-6">
            <div className="flex items-center justify-between">
              <p className="text-destructive text-xs sm:text-sm md:text-base">
                {error}
              </p>
              <button
                onClick={() => setError(null)}
                className="text-destructive hover:text-destructive/80"
              >
                <X className="h-3 w-3 sm:h-4 sm:w-4" />
              </button>
            </div>
          </div>
        )}

        <div className="bg-card rounded-lg shadow-sm border border-border mb-3 sm:mb-4 md:mb-6 lg:mb-8">
          <div className="px-3 py-2 sm:px-4 sm:py-3 md:px-6 md:py-4 border-b border-border">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="bg-primary/10 p-1 sm:p-2 rounded-lg">
                  <Clock className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-primary" />
                </div>
                <div>
                  <h1 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-foreground">
                    Shift Management
                  </h1>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Manage shift schedules
                  </p>
                </div>
              </div>
              <button
                onClick={() => openModal("create")}
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-2 py-1 sm:px-3 sm:py-1.5 md:px-4 md:py-2 rounded-lg flex items-center space-x-1 sm:space-x-2 transition-colors text-xs sm:text-sm md:text-base"
              >
                <Plus className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4" />
                <span>Add Shift</span>
              </button>
            </div>
          </div>

          <div className="px-3 py-2 sm:px-4 sm:py-3 md:px-6 md:py-4 bg-muted border-b border-border">
            <div className="relative max-w-xs sm:max-w-sm md:max-w-md">
              <div className="absolute inset-y-0 left-0 pl-2 sm:pl-3 flex items-center pointer-events-none">
                <Search className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
              </div>
              <input
                type="text"
                placeholder="Search shifts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-7 sm:pl-10 pr-2 sm:pr-3 py-1.5 sm:py-2 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent text-xs sm:text-sm md:text-base bg-background"
              />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading shifts...</p>
          </div>
        ) : (
          <div className="bg-card rounded-lg shadow-sm border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-border">
               <thead className="bg-primary">
    <tr>
      <th className="px-2 py-1 sm:px-3 sm:py-2 md:px-6 md:py-3 text-center text-xs sm:text-xs font-medium text-primary-foreground uppercase tracking-wider">
        Shift Name
      </th>
      <th className="px-2 py-1 sm:px-3 sm:py-2 md:px-6 md:py-3 text-center text-xs sm:text-xs font-medium text-primary-foreground uppercase tracking-wider">
        Start Time
      </th>
      <th className="px-2 py-1 sm:px-3 sm:py-2 md:px-6 md:py-3 text-center text-xs sm:text-xs font-medium text-primary-foreground uppercase tracking-wider">
        End Time
      </th>
      <th className="px-2 py-1 sm:px-3 sm:py-2 md:px-6 md:py-3 text-center text-xs sm:text-xs font-medium text-primary-foreground uppercase tracking-wider">
        Users
      </th>
      <th className="px-2 py-1 sm:px-3 sm:py-2 md:px-6 md:py-3 text-center text-xs sm:text-xs font-medium text-primary-foreground uppercase tracking-wider">
        Actions
      </th>
    </tr>
  </thead>
                <tbody className="bg-card divide-y divide-border">
                {filteredShifts.map((shift) => (
    <tr key={shift.id} className="hover:bg-secondary">
      <td className="px-2 py-2 sm:px-3 sm:py-3 whitespace-nowrap">
        <div className="text-xs sm:text-sm font-sm text-primary text-center">
          {shift.name}
        </div>
      </td>
      <td className="px-2 py-2 sm:px-3 sm:py-3 whitespace-nowrap text-center">
        <div className="text-xs sm:text-sm text-primary">
          {formatTo12Hour(shift.startTime)}
        </div>
      </td>
      <td className="px-2 py-2 sm:px-3 sm:py-3 whitespace-nowrap text-center">
        <div className="text-xs sm:text-sm text-primary">
          {formatTo12Hour(shift.endTime)}
        </div>
      </td>
      <td className="px-2 py-2 sm:px-3 sm:py-3 whitespace-nowrap text-center">
        <button 
          onClick={() => openUsersModal(shift.users)}
          className={`text-xs sm:text-sm px-2 py-1 rounded-full ${
            shift.users.length > 0 
              ? "bg-primary/10 text-primary hover:bg-primary/20 cursor-pointer"
              : "bg-muted text-muted-foreground cursor-default"
          }`}
        >
          {shift.users.length} user{shift.users.length !== 1 ? 's' : ''}
        </button>
      </td>
      <td className="px-2 py-2 sm:px-3 sm:py-3 whitespace-nowrap text-center text-xs sm:text-sm font-medium">
        <div className="flex justify-center space-x-1 sm:space-x-2">
          <button
            onClick={() => openModal("edit", shift)}
            className="text-primary hover:text-primary/80 p-1 rounded-md hover:bg-primary/10 transition-colors"
          >
            <Edit className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4" />
          </button>
          <button
            onClick={() => handleDelete(shift.id)}
            className="text-destructive hover:text-destructive/80 p-1 rounded-md hover:bg-destructive/10 transition-colors"
          >
            <Trash2 className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4" />
          </button>
        </div>
      </td>
    </tr>
  ))}
                </tbody>
              </table>
            </div>

            {filteredShifts.length === 0 && (
              <div className="text-center py-6 sm:py-8 md:py-10 lg:py-12">
                <Clock className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 text-muted-foreground mx-auto mb-2 sm:mb-3 md:mb-4" />
                <p className="text-muted-foreground text-xs sm:text-sm md:text-base">
                  No shifts found
                </p>
              </div>
            )}
          </div>
        )}
        <div className="flex items-center justify-between py-4">
          <span className="text-sm text-muted-foreground">
            Page {page} of {Math.ceil(total / limit)}
          </span>

          <div className="flex space-x-2">
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page === 1}
              className="px-3 py-1 rounded bg-secondary hover:bg-secondary/80 disabled:opacity-50"
            >
              Previous
            </button>

            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={page >= Math.ceil(total / limit)}
              className="px-3 py-1 rounded bg-secondary hover:bg-secondary/80 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {showUsersModal && (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-card rounded-lg shadow-sm border border-border w-full max-w-xs sm:max-w-sm md:max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-3 sm:p-4 md:p-5 lg:p-6 border-b border-border">
          <h3 className="text-base sm:text-lg font-semibold">
            Users in Shift
          </h3>
          <button
            onClick={() => setShowUsersModal(false)}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
        </div>

        <div className="p-3 sm:p-4 md:p-5 lg:p-6">
          {shiftUsers.length > 0 ? (
            <div className="space-y-3">
              {shiftUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-2 border rounded-lg">
                  <div>
                    <p className="font-medium">{user.name}</p>
                    <p className="text-sm text-muted-foreground capitalize">{user.role.toLowerCase()}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {user.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4">
              <UserX className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-muted-foreground">No users assigned to this shift</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-primary text-primary-foreground rounded-lg sm:rounded-xl w-full max-w-xs sm:max-w-sm md:max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-3 sm:p-4 md:p-5 lg:p-6 border-b border-border">
              <h3 className="text-base sm:text-lg font-semibold text-primary-foreground">
                {modalType === "create" ? "Add New Shift" : "Edit Shift"}
              </h3>
              <button
                onClick={closeModal}
                className="text-primary-foreground transition-colors"
              >
                <X className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
            </div>

            <div className="p-3 sm:p-4 md:p-5 lg:p-6 space-y-3 sm:space-y-4">
              {error && (
                <div className="bg-secondary/10 border border-secondary rounded-lg p-2 sm:p-3">
                  <p className="text-secondary text-xs sm:text-sm">{error}</p>
                </div>
              )}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-primary-foreground mb-1 sm:mb-2">
                  Shift Name
                </label>
                <input
                  type="text"
                  placeholder="Enter shift name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-2 py-1.5 sm:px-3 sm:py-2 border border-input rounded-lg text-foreground focus:ring-2 focus:ring-ring focus:border-transparent text-xs sm:text-sm md:text-base bg-background"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 md:gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-primary-foreground   mb-1 sm:mb-2">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={formData.startTime}
                    onChange={(e) =>
                      setFormData({ ...formData, startTime: e.target.value })
                    }
                    className="w-full px-2 py-1.5 sm:px-3 sm:py-2 border text-foreground border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent text-xs sm:text-sm md:text-base bg-background"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-primary-foreground mb-1 sm:mb-2">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={formData.endTime}
                    onChange={(e) =>
                      setFormData({ ...formData, endTime: e.target.value })
                    }
                    className="w-full px-2 py-1.5 sm:px-3 sm:py-2 border text-foreground border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent text-xs sm:text-sm md:text-base bg-background"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 sm:space-x-3 pt-3 sm:pt-4">
                <button
                  onClick={closeModal}
                  className="px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium text-primary bg-secondary hover:bg-secondary/80 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium text-primary bg-secondary hover:bg-secondary/80 disabled:bg-primary/50 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center space-x-1 sm:space-x-2"
                >
                  {submitting && (
                    <div className="animate-spin h-3 w-3 sm:h-4 sm:w-4 border-2 border-primary-foreground border-t-transparent rounded-full"></div>
                  )}
                  <span>
                    {modalType === "create" ? "Create Shift" : "Update Shift"}
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

export default ShiftPage;
