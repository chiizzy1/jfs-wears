"use client";

import { useState, useEffect } from "react";
import { adminAPI, Staff, CreateStaffDto } from "@/lib/admin-api";
import { toast } from "react-hot-toast";

const roles = ["ADMIN", "MANAGER", "STAFF"];

export default function StaffPage() {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<CreateStaffDto>({
    name: "",
    email: "",
    password: "",
    role: "STAFF",
  });

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      setIsLoading(true);
      const data = await adminAPI.getStaff();
      setStaff(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch staff:", error);
      toast.error("Failed to load staff members");
    } finally {
      setIsLoading(false);
    }
  };

  const getRoleBadgeStyle = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "bg-purple-50 text-purple-700 border border-purple-200";
      case "MANAGER":
        return "bg-blue-50 text-blue-700 border border-blue-200";
      case "STAFF":
        return "bg-gray-50 text-gray-700 border border-gray-200";
      default:
        return "bg-gray-50 text-gray-700 border border-gray-200";
    }
  };

  const openModal = () => {
    setFormData({
      name: "",
      email: "",
      password: "",
      role: "STAFF",
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.password) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);

    try {
      await adminAPI.createStaff(formData);
      toast.success("Staff member added successfully");
      closeModal();
      fetchStaff();
    } catch (error) {
      console.error("Failed to create staff:", error);
      toast.error(error instanceof Error ? error.message : "Failed to add staff member");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-black border-t-transparent animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xs uppercase tracking-[0.15em] font-medium text-muted">Staff</h1>
          <p className="text-2xl font-light mt-1">Team Management</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchStaff}
            className="px-4 py-3 border border-gray-200 hover:border-black transition-colors"
            title="Refresh"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </button>
          <button
            onClick={openModal}
            className="px-6 py-3 bg-black text-white text-xs uppercase tracking-[0.15em] hover:bg-black/90 transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Add Staff
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 border border-gray-100">
          <p className="text-xs uppercase tracking-[0.15em] text-muted font-medium">Total Staff</p>
          <p className="text-3xl font-light mt-3">{staff.length}</p>
        </div>
        <div className="bg-white p-6 border border-gray-100">
          <p className="text-xs uppercase tracking-[0.15em] text-muted font-medium">Admins</p>
          <p className="text-3xl font-light mt-3">{staff.filter((s) => s.role === "ADMIN").length}</p>
        </div>
        <div className="bg-white p-6 border border-gray-100">
          <p className="text-xs uppercase tracking-[0.15em] text-muted font-medium">Managers</p>
          <p className="text-3xl font-light mt-3">{staff.filter((s) => s.role === "MANAGER").length}</p>
        </div>
        <div className="bg-white p-6 border border-gray-100">
          <p className="text-xs uppercase tracking-[0.15em] text-muted font-medium">Staff</p>
          <p className="text-3xl font-light mt-3">{staff.filter((s) => s.role === "STAFF").length}</p>
        </div>
      </div>

      {/* Staff List */}
      <div className="bg-white border border-gray-100">
        {staff.length === 0 ? (
          <div className="text-center py-16">
            <svg
              className="mx-auto h-12 w-12 text-gray-300"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
            <h3 className="mt-4 text-sm font-medium">No staff members</h3>
            <p className="mt-2 text-sm text-muted">Add your first staff member to get started.</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-6 py-4 text-xs uppercase tracking-[0.1em] font-medium text-muted">Name</th>
                <th className="text-left px-6 py-4 text-xs uppercase tracking-[0.1em] font-medium text-muted">Email</th>
                <th className="text-left px-6 py-4 text-xs uppercase tracking-[0.1em] font-medium text-muted">Role</th>
                <th className="text-left px-6 py-4 text-xs uppercase tracking-[0.1em] font-medium text-muted">Status</th>
                <th className="text-right px-6 py-4 text-xs uppercase tracking-[0.1em] font-medium text-muted">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {staff.map((member) => (
                <tr key={member.id} className="border-t border-gray-50 hover:bg-secondary/50 transition-colors">
                  <td className="px-6 py-4 font-medium">{member.name}</td>
                  <td className="px-6 py-4 text-muted">{member.email}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-medium ${getRoleBadgeStyle(member.role)}`}>{member.role}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 text-xs font-medium ${
                        member.isActive
                          ? "bg-green-50 text-green-700 border border-green-200"
                          : "bg-gray-50 text-gray-500 border border-gray-200"
                      }`}
                    >
                      {member.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 text-muted hover:text-black transition-colors">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                        />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add Staff Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={closeModal}></div>
          <div className="relative bg-white w-full max-w-md m-4 p-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-xs uppercase tracking-[0.15em] font-medium text-muted">Add Staff</h2>
                <p className="text-xl font-light mt-1">New Team Member</p>
              </div>
              <button onClick={closeModal} className="p-2 text-muted hover:text-black transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-xs uppercase tracking-[0.1em] text-muted font-medium mb-3">Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="John Doe"
                  className="w-full px-4 py-3 border border-gray-200 focus:outline-none focus:border-black transition-colors text-sm"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-[0.1em] text-muted font-medium mb-3">Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="john@example.com"
                  className="w-full px-4 py-3 border border-gray-200 focus:outline-none focus:border-black transition-colors text-sm"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-[0.1em] text-muted font-medium mb-3">Password *</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 border border-gray-200 focus:outline-none focus:border-black transition-colors text-sm"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-[0.1em] text-muted font-medium mb-3">Role *</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 bg-white focus:outline-none focus:border-black transition-colors text-sm"
                >
                  {roles.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-6 py-3 border border-gray-200 text-xs uppercase tracking-[0.15em] hover:border-black transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-6 py-3 bg-black text-white text-xs uppercase tracking-[0.15em] hover:bg-black/90 transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? "Adding..." : "Add Staff"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
