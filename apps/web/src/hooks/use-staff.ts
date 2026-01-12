import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { staffService } from "@/services/staff.service";
import { CreateStaffDto } from "@/lib/admin-api";
import { toast } from "react-hot-toast";
import { getErrorMessage } from "@/lib/api-client";

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
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });

  const updateStaff = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateStaffDto> }) => staffService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: STAFF_KEYS.lists() });
      toast.success("Staff member updated successfully");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });

  const deleteStaff = useMutation({
    mutationFn: (id: string) => staffService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: STAFF_KEYS.lists() });
      toast.success("Staff member deleted successfully");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });

  return {
    staff: staffQuery.data ?? [],
    isLoading: staffQuery.isLoading,
    isError: staffQuery.isError,
    error: staffQuery.error,
    createStaff,
    updateStaff,
    deleteStaff,
  };
}
