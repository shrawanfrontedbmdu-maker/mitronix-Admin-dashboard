import { useState, useEffect } from "react";
import { FiPlus, FiEdit2, FiTrash2, FiChevronRight } from "react-icons/fi";
import instance from "../../api/axios.config";
import FilterGroupForm from "./FilterGroupForm";
import FilterGroupList from "./FilterGroupList";
import FilterOptionsManager from "./FilterOptionsManager";

function Filters() {
  const [activeView, setActiveView] = useState("list"); // list, create, edit, options
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [filterGroups, setFilterGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [editingGroup, setEditingGroup] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch categories on mount
  useEffect(() => {
    fetchCategories();
  }, []);

  // Fetch filter groups when category changes
  useEffect(() => {
    if (selectedCategory) {
      fetchFilterGroups();
    }
  }, [selectedCategory]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await instance.get("/category");
      console.log(response)
      setCategories(response.data || []);
      if (response?.data?.length > 0) {
        setSelectedCategory(response.data[0]._id);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFilterGroups = async () => {
    try {
      setLoading(true);
      const response = await instance.get(`/filter-groups/category/${selectedCategory}`);
      setFilterGroups(response.data.filterGroups || []);
    } catch (error) {
      console.error("Error fetching filter groups:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGroup = async (groupData) => {
    try {
      const payload = { ...groupData, category: selectedCategory };
      const response = await instance.post("/filter-groups", payload);
      setFilterGroups([...filterGroups, response.data.filterGroup]);
      setActiveView("list");
    } catch (error) {
      console.error("Error creating filter group:", error);
    }
  };

  const handleEditGroup = async (groupData) => {
    try {
      const response = await instance.put(`/filter-groups/${editingGroup._id}`, groupData);
      setFilterGroups(filterGroups.map(g => g._id === editingGroup._id ? response.data.filterGroup : g));
      setEditingGroup(null);
      setActiveView("list");
    } catch (error) {
      console.error("Error updating filter group:", error);
    }
  };

  const handleDeleteGroup = async (id) => {
    if (window.confirm("Are you sure you want to delete this filter group?")) {
      try {
        await instance.delete(`/filter-groups/${id}`);
        setFilterGroups(filterGroups.filter(g => g._id !== id));
      } catch (error) {
        console.error("Error deleting filter group:", error);
      }
    }
  };

  const handleManageOptions = (group) => {
    setSelectedGroup(group);
    setActiveView("options");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Filter Management</h1>
        <p className="text-gray-600">Create and manage filter groups and options for your categories</p>
      </div>

      {/* Category Selector */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          Select Category
        </label>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="w-full md:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
        >
          <option value="">Choose a category</option>
          {categories.map((cat) => (
            <option key={cat._id} value={cat._id}>
              {cat.pageTitle}
            </option>
          ))}
        </select>
      </div>

      {/* Navigation Tabs */}
      {selectedCategory && (
        <div className="flex gap-2 mb-6 border-b border-gray-200">
          <button
            onClick={() => setActiveView("list")}
            className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
              activeView === "list"
                ? "border-yellow-500 text-yellow-600"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            Filter Groups
          </button>
          {activeView === "options" && selectedGroup && (
            <button
              onClick={() => setActiveView("options")}
              className="px-4 py-3 font-medium text-sm border-b-2 border-yellow-500 text-yellow-600 flex items-center gap-2"
            >
              <FiChevronRight size={16} />
              {selectedGroup.displayName} Options
            </button>
          )}
        </div>
      )}

      {/* Main Content */}
      {!selectedCategory ? (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <p className="text-gray-500 text-lg">Please select a category to manage filters</p>
        </div>
      ) : activeView === "list" ? (
        <div>
          {/* Create Button */}
          <div className="mb-6">
            <button
              onClick={() => {
                setEditingGroup(null);
                setActiveView("create");
              }}
              className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              <FiPlus size={20} />
              Create Filter Group
            </button>
          </div>

          {/* Filter Groups List */}
          <FilterGroupList
            groups={filterGroups}
            onEdit={(group) => {
              setEditingGroup(group);
              setActiveView("edit");
            }}
            onDelete={handleDeleteGroup}
            onManageOptions={handleManageOptions}
            loading={loading}
          />
        </div>
      ) : activeView === "create" || activeView === "edit" ? (
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {editingGroup ? "Edit Filter Group" : "Create Filter Group"}
          </h2>
          <FilterGroupForm
            initialData={editingGroup}
            onSubmit={editingGroup ? handleEditGroup : handleCreateGroup}
            onCancel={() => setActiveView("list")}
          />
        </div>
      ) : activeView === "options" && selectedGroup ? (
        <FilterOptionsManager
          group={selectedGroup}
          onBack={() => setActiveView("list")}
        />
      ) : null}
    </div>
  );
}

export default Filters;
