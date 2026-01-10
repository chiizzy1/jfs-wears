import { adminAPI } from "@/lib/admin-api";
import { SettingsFormValues } from "@/schemas/settings.schema";

export const settingsService = {
  getSettings: async () => {
    return await adminAPI.getSettings();
  },
  updateSettings: async (data: SettingsFormValues) => {
    return await adminAPI.updateSettings(data);
  },
};
