import { useState, useEffect } from "react";
import { FiArrowLeft } from "react-icons/fi";

function FilterGroupForm({ initialData, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    name: "",
    displayName: "",
    filterType: "checkbox",
    description: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const filterTypes = [
    { value: "checkbox", label: "Checkbox" },
    { value: "range", label: "Range Slider" },
    { value: "dropdown", label: "Dropdown" },
    { value: "color", label: "Color" },
    { value: "size", label: "Size" },
  ];

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || "",
        displayName: initialData.displayName || "",
        filterType: initialData.filterType || "checkbox",
        description: initialData.description || "",
      });
    }
  }, [initialData]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Filter group name is required";
    if (!formData.displayName.trim()) newErrors.displayName = "Display name is required";
    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setLoading(true);
      await onSubmit(formData);
    } catch (error) {
      console.error("Form submission error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Name Field */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Filter Group Name
        </label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="e.g., resolution, brand, price"
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition ${
            errors.name ? "border-red-500" : "border-gray-300"
          }`}
        />
        {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
        <p className="text-gray-500 text-xs mt-1">Internal name (lowercase, no spaces)</p>
      </div>

      {/* Display Name Field */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Display Name
        </label>
        <input
          type="text"
          name="displayName"
          value={formData.displayName}
          onChange={handleChange}
          placeholder="e.g., Resolution, Brand, Price Range"
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition ${
            errors.displayName ? "border-red-500" : "border-gray-300"
          }`}
        />
        {errors.displayName && <p className="text-red-500 text-sm mt-1">{errors.displayName}</p>}
        <p className="text-gray-500 text-xs mt-1">Display name shown to customers</p>
      </div>

      {/* Filter Type Field */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Filter Type
        </label>
        <select
          name="filterType"
          value={formData.filterType}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition"
        >
          {filterTypes.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
        <p className="text-gray-500 text-xs mt-1">How this filter will be displayed</p>
      </div>

      {/* Description Field */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Description
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Optional description for this filter group"
          rows={3}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition resize-none"
        />
      </div>

      {/* Form Actions */}
      <div className="flex gap-3 pt-6 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          className="flex items-center gap-2 px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors"
        >
          <FiArrowLeft size={18} />
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 px-6 py-2 bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-300 text-white rounded-lg font-medium transition-colors"
        >
          {loading ? "Saving..." : initialData ? "Update Filter Group" : "Create Filter Group"}
        </button>
      </div>
    </form>
  );
}

export default FilterGroupForm;
