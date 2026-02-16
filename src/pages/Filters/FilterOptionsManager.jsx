import { useState, useEffect } from "react";
import { FiArrowLeft, FiPlus } from "react-icons/fi";
import instance from "../../api/axios.config";
import FilterOptionForm from "./FilterOptionForm";
import FilterOptionsList from "./FilterOptionsList";

function FilterOptionsManager({ group, onBack }) {
  const [options, setOptions] = useState(group.options || []);
  const [showForm, setShowForm] = useState(false);
  const [editingOption, setEditingOption] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchOptions();
  }, [group._id]);

  const fetchOptions = async () => {
    try {
      setLoading(true);
      const response = await instance.get(`/filter-options/group/${group._id}`);
      setOptions(response.data.options || []);
    } catch (error) {
      console.error("Error fetching filter options:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOption = async (optionData) => {
    try {
      const payload = { ...optionData, filterGroup: group._id };
      const response = await instance.post("/filter-options", payload);
      setOptions([...options, response.data.option]);
      setShowForm(false);
    } catch (error) {
      console.error("Error creating filter option:", error);
      alert("Failed to create filter option");
    }
  };

  const handleUpdateOption = async (optionData) => {
    try {
      const response = await instance.put(`/filter-options/${editingOption._id}`, optionData);
      setOptions(options.map(o => o._id === editingOption._id ? response.data.option : o));
      setEditingOption(null);
      setShowForm(false);
    } catch (error) {
      console.error("Error updating filter option:", error);
      alert("Failed to update filter option");
    }
  };

  const handleDeleteOption = async (id) => {
    if (window.confirm("Delete this filter option?")) {
      try {
        await instance.delete(`/filter-options/${id}`);
        setOptions(options.filter(o => o._id !== id));
      } catch (error) {
        console.error("Error deleting filter option:", error);
        alert("Failed to delete filter option");
      }
    }
  };

  const handleEdit = (option) => {
    setEditingOption(option);
    setShowForm(true);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-200">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Go back"
          >
            <FiArrowLeft size={20} />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {group.displayName} - Options
            </h2>
            <p className="text-sm text-gray-600 mt-1">Filter Type: {group.filterType}</p>
          </div>
        </div>

        {!showForm && (
          <button
            onClick={() => {
              setEditingOption(null);
              setShowForm(true);
            }}
            className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            <FiPlus size={20} />
            Add Option
          </button>
        )}
      </div>

      {/* Form Section */}
      {showForm && (
        <div className="mb-8 p-6 bg-gray-50 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {editingOption ? "Edit Option" : "Create New Option"}
          </h3>
          <FilterOptionForm
            filterType={group.filterType}
            initialData={editingOption}
            onSubmit={editingOption ? handleUpdateOption : handleCreateOption}
            onCancel={() => {
              setShowForm(false);
              setEditingOption(null);
            }}
          />
        </div>
      )}

      {/* Options List Section */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Options ({options.length})
        </h3>
        <FilterOptionsList
          options={options}
          filterType={group.filterType}
          onEdit={handleEdit}
          onDelete={handleDeleteOption}
          loading={loading}
        />
      </div>
    </div>
  );
}

export default FilterOptionsManager;
