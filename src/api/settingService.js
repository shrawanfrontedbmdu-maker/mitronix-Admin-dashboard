import instance from "./axios.config";

export const SettingService = {
    createSetting: async (data) => {
        try {
            const response = await instance.post("/setting/", data, {
                headers: { "Content-Type": "application/json" },
            });
            return response.data;
        } catch (error) {
            console.error("Create Setting Error:", error);
            const errorMessage =
                error.response?.data?.message || error.message || "Failed to create settings";
            throw new Error(errorMessage);
        }
    },

    updateSetting: async (data) => {
        try {
            const response = await instance.put("/settings/update", data, {
                headers: { "Content-Type": "application/json" },
            });
            return response.data;
        } catch (error) {
            console.error("Update Setting Error:", error);
            const errorMessage =
                error.response?.data?.message || error.message || "Failed to update settings";
            throw new Error(errorMessage);
        }
    },

    getSettings: async () => {
        try {
            const response = await instance.get("/settings/");
            return response.data;
        } catch (error) {
            console.error("Get Setting Error:", error);
            const errorMessage =
                error.response?.data?.message || error.message || "Failed to fetch settings";
            throw new Error(errorMessage);
        }
    },
    updateRouteSlug: async (data) => {
        const res = await instance.patch("/settings/route-slug", data);
        return res.data;
    }

};
