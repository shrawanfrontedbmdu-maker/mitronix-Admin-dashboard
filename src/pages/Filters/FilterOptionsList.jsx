import { FiEdit2, FiTrash2} from "react-icons/fi";

function FilterOptionsList({ options, filterType, onEdit, onDelete, loading }) {
  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="animate-spin">
          <div className="h-8 w-8 border-3 border-yellow-500 border-t-transparent rounded-full"></div>
        </div>
      </div>
    );
  }

  if (options.length === 0) {
    return (
      <div className="bg-gray-50 rounded-lg border border-gray-200 p-8 text-center">
        <p className="text-gray-500 text-sm">No filter options created yet</p>
        <p className="text-gray-400 text-xs mt-1">Click "Add Option" to create one</p>
      </div>
    );
  }

  const sortedOptions = [...options].sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));

  return (
    <div className="grid gap-3">
      {sortedOptions.map((option, index) => (
        <div
          key={option._id}
          className="bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg p-4 flex items-center justify-between transition-colors group"
        >
          {/* Drag Handle + Content */}
          <div className="flex items-center gap-4 flex-1">
            <div className="text-gray-400 group-hover:text-gray-600 cursor-grab active:cursor-grabbing">
              {/* <FiDragVertical size={18} /> */}
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-3">
                {/* Color preview for color filter type */}
                {filterType === "color" && option.color && (
                  <div
                    className="h-8 w-8 rounded-lg border-2 border-gray-300 shadow-sm"
                    style={{ backgroundColor: option.color }}
                    title={option.color}
                  />
                )}

                <div>
                  <p className="font-medium text-gray-900">{option.label}</p>
                  <p className="text-xs text-gray-500">Value: {option.value}</p>
                </div>
              </div>
            </div>

            {/* Display Order Badge */}
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center justify-center h-7 w-7 rounded-full bg-white border border-gray-300 text-xs font-semibold text-gray-700">
                {option.displayOrder || 0}
              </span>
            </div>

            {/* Status Badge */}
            {option.status && (
              <div
                className="inline-flex items-center px-2 py-1 rounded text-xs font-medium"
                style={{
                  backgroundColor: option.status === "active" ? "#ecfdf5" : "#fef2f2",
                  color: option.status === "active" ? "#165e4d" : "#991b1b",
                }}
              >
                {option.status === "active" ? "✓" : "✗"}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 ml-4">
            <button
              onClick={() => onEdit(option)}
              className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
              title="Edit option"
            >
              <FiEdit2 size={18} />
            </button>
            <button
              onClick={() => onDelete(option._id)}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Delete option"
            >
              <FiTrash2 size={18} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default FilterOptionsList;
