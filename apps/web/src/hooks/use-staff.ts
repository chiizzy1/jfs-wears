import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { staffService } from "@/services/staff.service";
import { CreateStaffDto } from "@/lib/admin-api";
import { toast } from "react-hot-toast";

export const STAFF_KEYS = {
  all: ["staff"] as const,
  lists: () => [...STAFF_KEYS.all, "list"] as const,
};

export function useStaff() {
  const queryClient = useQueryClient();

  const staffQuery = useQuery({
    queryKey: STAFF_KEYS.lists(),
    queryFn: staffService.getAll,
  });

  const createStaff = useMutation({
    mutationFn: (data: CreateStaffDto) => staffService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: STAFF_KEYS.lists() });
      toast.success("Staff member added successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create staff member");
    },
  });

  const deleteStaff = useMutation({
    mutationFn: (id: string) => staffService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: STAFF_KEYS.lists() });
      toast.success("Staff member deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete staff member");
    },
  });

  return {
    staff: staffQuery.data ?? [],
    isLoading: staffQuery.isLoading,
    isError: staffQuery.isError,
    error: staffQuery.error,
    createStaff,
    deleteStaff,
  };
}
