import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { settingsService } from "@/services/settings.service";
import { SettingsFormValues } from "@/schemas/settings.schema";
import { toast } from "react-hot-toast";

export function useSettings() {
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery({
    queryKey: ["settings"],
    queryFn: settingsService.getSettings,
  });

  const { mutate: updateSettings, isPending: isSaving } = useMutation({
    mutationFn: settingsService.updateSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
      toast.success("Settings saved successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to save settings");
    },
  });

  return {
    settings,
    isLoading,
    updateSettings,
    isSaving,
  };
}
