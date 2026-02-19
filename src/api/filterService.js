import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

export const filterService = {
  async getFilterGroupsByCategory(categoryId) {
    const res = await axios.get(
      `${API_BASE}/filter-groups/category/${categoryId}`
    );
    // backend returns { success, count, filterGroups }
    return res.data.filterGroups;
  },

  async getFilterOptionsByGroup(groupId) {
    const res = await axios.get(
      `${API_BASE}/filter-options/group/${groupId}`
    );
    return res.data.filterOptions || res.data.options;
  },
};

export default filterService;