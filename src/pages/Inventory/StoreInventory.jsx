import { useEffect, useState } from "react";
import instance from "../../api/axios.config";

const StoreInventory = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stockFilter, setStockFilter] = useState("");

  const fetchInventory = async () => {
    try {
      setLoading(true);

      const { data } = await instance.get(
        `/store-inventory/inventory?page=${page}&limit=10${
          stockFilter ? `&stockStatus=${stockFilter}` : ""
        }`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("storeToken")}`,
          },
        }
      );

      setInventory(data.inventory || []);
      setTotalPages(data.totalPages || 1);
    } catch (error) {
      console.error("Error fetching inventory:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, [page, stockFilter]);

  const getStatusStyle = (status) => {
    switch (status) {
      case "in-stock":
        return "bg-green-100 text-green-700";
      case "low-stock":
        return "bg-yellow-100 text-yellow-700";
      case "out-of-stock":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="bg-white p-6 rounded-2xl shadow-sm">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">
            My Inventory
          </h2>

          <select
            value={stockFilter}
            onChange={(e) => {
              setPage(1);
              setStockFilter(e.target.value);
            }}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Stock</option>
            <option value="in-stock">In Stock</option>
            <option value="low-stock">Low Stock</option>
            <option value="out-of-stock">Out of Stock</option>
          </select>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-xl border border-gray-200">
          {loading ? (
            <div className="p-8 text-center text-gray-500">
              Loading inventory...
            </div>
          ) : inventory.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No inventory found
            </div>
          ) : (
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
                <tr>
                  <th className="px-6 py-4">Product</th>
                  <th className="px-6 py-4">Variant SKU</th>
                  <th className="px-6 py-4">Stock Qty</th>
                  <th className="px-6 py-4">Lead Time</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>

              <tbody>
                {inventory.map((item) => (
                  <tr
                    key={item._id}
                    className="border-t hover:bg-gray-50 transition"
                  >
                    {/* Product */}
                    <td className="px-6 py-4 flex items-center gap-4">
                      <img
                        src={item.product?.images?.[0]?.url}
                        alt={item.product?.name}
                        className="w-14 h-14 object-cover rounded-lg border"
                      />
                      <div>
                        <p className="font-medium text-gray-800">
                          {item.product?.name}
                        </p>
                        <p className="text-gray-500 text-xs">
                          {item.product?.brand}
                        </p>
                      </div>
                    </td>

                    {/* SKU */}
                    <td className="px-6 py-4 font-mono text-gray-600">
                      {item.variantSku}
                    </td>

                    {/* Stock */}
                    <td className="px-6 py-4 font-semibold text-gray-800">
                      {item.stockQty}
                    </td>

                    {/* Lead Time */}
                    <td className="px-6 py-4 text-gray-600">
                      {item.leadTimeDays} days
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusStyle(
                          item.stockStatus
                        )}`}
                      >
                        {item.stockStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {!loading && inventory.length > 0 && (
          <div className="flex justify-between items-center mt-6">
            <button
              disabled={page === 1}
              onClick={() => setPage((prev) => prev - 1)}
              className="px-4 py-2 text-sm bg-gray-100 rounded-lg disabled:opacity-50 hover:bg-gray-200"
            >
              Previous
            </button>

            <span className="text-sm text-gray-600">
              Page <span className="font-semibold">{page}</span> of{" "}
              <span className="font-semibold">{totalPages}</span>
            </span>

            <button
              disabled={page === totalPages}
              onClick={() => setPage((prev) => prev + 1)}
              className="px-4 py-2 text-sm bg-gray-100 rounded-lg disabled:opacity-50 hover:bg-gray-200"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default StoreInventory;
