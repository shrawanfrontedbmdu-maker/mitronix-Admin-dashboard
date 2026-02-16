import { useState, useEffect } from "react";

function FilterOptionForm({ filterType, initialData, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    label: "",
    value: "",
    color: "#000000",
    displayOrder: 0,
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        label: initialData.label || "",
        value: initialData.value || "",
        color: initialData.color || "#000000",
        displayOrder: initialData.displayOrder || 0,
      });
    }
  }, [initialData]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.label.trim()) newErrors.label = "Label is required";
    if (!formData.value.trim()) newErrors.value = "Value is required";
    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "displayOrder" ? parseInt(value) || 0 : value,
    }));
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
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Label Field */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Label
          </label>
          <input
            type="text"
            name="label"
            value={formData.label}
            onChange={handleChange}
            placeholder="e.g., Full HD, ₹5,000"
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition ${
              errors.label ? "border-red-500" : "border-gray-300"
            }`}
          />
          {errors.label && <p className="text-red-500 text-xs mt-1">{errors.label}</p>}
          <p className="text-gray-500 text-xs mt-1">Display text for customer</p>
        </div>

        {/* Value Field */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Value
          </label>
          <input
            type="text"
            name="value"
            value={formData.value}
            onChange={handleChange}
            placeholder="e.g., full_hd, 5000"
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition ${
              errors.value ? "border-red-500" : "border-gray-300"
            }`}
          />
          {errors.value && <p className="text-red-500 text-xs mt-1">{errors.value}</p>}
          <p className="text-gray-500 text-xs mt-1">Internal value (no spaces)</p>
        </div>
      </div>

      {/* Color Picker (for color filter type) */}
      {filterType === "color" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Color
            </label>
            <div className="flex gap-2 items-center">
              <input
                type="color"
                name="color"
                value={formData.color}
                onChange={handleChange}
                className="h-12 w-20 rounded-lg cursor-pointer border border-gray-300"
              />
              <input
                type="text"
                value={formData.color}
                readOnly
                className="flex-1 px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm font-mono"
              />
            </div>
          </div>
        </div>
      )}

      {/* Display Order Field */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Display Order
          </label>
          <input
            type="number"
            name="displayOrder"
            value={formData.displayOrder}
            onChange={handleChange}
            min="0"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition"
          />
          <p className="text-gray-500 text-xs mt-1">Order in which options appear (lower = first)</p>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex gap-3 pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors text-sm"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-300 text-white rounded-lg font-medium transition-colors text-sm"
        >
          {loading ? "Saving..." : initialData ? "Update Option" : "Create Option"}
        </button>
      </div>
    </form>
  );
}

export default FilterOptionForm;
