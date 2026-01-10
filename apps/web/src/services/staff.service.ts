import { adminAPI, CreateStaffDto, Staff } from "@/lib/admin-api";

export const staffService = {
  getAll: async (): Promise<Staff[]> => {
    return adminAPI.getStaff();
  },

  create: async (data: CreateStaffDto): Promise<Staff> => {
    return adminAPI.createStaff(data);
  },

  delete: async (id: string): Promise<void> => {
    return adminAPI.deleteStaff(id);
  },
};
