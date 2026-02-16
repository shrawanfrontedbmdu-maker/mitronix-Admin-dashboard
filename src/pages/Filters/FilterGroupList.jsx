import { FiEdit2, FiTrash2, FiSettings } from "react-icons/fi";

function FilterGroupList({ groups, onEdit, onDelete, onManageOptions, loading }) {
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin">
          <div className="h-12 w-12 border-4 border-yellow-500 border-t-transparent rounded-full"></div>
        </div>
      </div>
    );
  }

  if (groups.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-12 text-center">
        <p className="text-gray-500 text-lg mb-2">No filter groups created yet</p>
        <p className="text-gray-400 text-sm">Click "Create Filter Group" to get started</p>
      </div>
    );
  }

  const filterTypeLabels = {
    checkbox: "Checkbox",
    range: "Range Slider",
    dropdown: "Dropdown",
    color: "Color",
    size: "Size",
  };

  return (
    <div className="grid gap-4">
      {groups.map((group) => (
        <div
          key={group._id}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                {group.displayName}
              </h3>
              <p className="text-sm text-gray-600 mb-3">{group.description || "No description"}</p>
              
              <div className="flex gap-4 items-center">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-gray-500 uppercase">Type:</span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {filterTypeLabels[group.filterType] || group.filterType}
                  </span>
                </div>

                {group.status && (
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium"
                      style={{
                        backgroundColor: group.status === "active" ? "#ecfdf5" : "#fef2f2",
                        color: group.status === "active" ? "#165e4d" : "#991b1b",
                      }}
                    >
                      {group.status === "active" ? "✓ Active" : "✗ Inactive"}
                    </span>
                  </div>
                )}

                {group.options?.length > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-gray-500">Options:</span>
                    <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-gray-100 text-xs font-semibold text-gray-700">
                      {group.options.length}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-100">
            <button
              onClick={() => onManageOptions(group)}
              className="flex items-center gap-2 flex-1 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg font-medium transition-colors text-sm"
              title="Manage filter options"
            >
              <FiSettings size={16} />
              Manage Options
            </button>

            <button
              onClick={() => onEdit(group)}
              className="flex items-center gap-2 px-4 py-2 bg-yellow-50 hover:bg-yellow-100 text-yellow-700 rounded-lg font-medium transition-colors text-sm"
              title="Edit filter group"
            >
              <FiEdit2 size={16} />
              Edit
            </button>

            <button
              onClick={() => onDelete(group._id)}
              className="flex items-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg font-medium transition-colors text-sm"
              title="Delete filter group"
            >
              <FiTrash2 size={16} />
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default FilterGroupList;
