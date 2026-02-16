import { useEffect, useState } from "react";
import axios from "axios";

const StoreInventory = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stockFilter, setStockFilter] = useState("");

  const fetchInventory = async () => {
    try {
      setLoading(true);

      const { data } = await axios.get(
        `/api/store/inventory?page=${page}&limit=10${
          stockFilter ? `&stockStatus=${stockFilter}` : ""
        }`
      );

      setInventory(data.inventory || data.inventory || []);
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

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">My Inventory</h2>

      {/* Filter */}
      <div className="mb-4 flex gap-3">
        <select
          value={stockFilter}
          onChange={(e) => {
            setPage(1);
            setStockFilter(e.target.value);
          }}
          className="border p-2 rounded"
        >
          <option value="">All</option>
          <option value="in-stock">In Stock</option>
          <option value="low-stock">Low Stock</option>
          <option value="out-of-stock">Out of Stock</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white shadow rounded overflow-hidden">
        {loading ? (
          <div className="p-6 text-center">Loading...</div>
        ) : inventory.length === 0 ? (
          <div className="p-6 text-center">No inventory found</div>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3">Product</th>
                <th className="p-3">Stock</th>
                <th className="p-3">Status</th>
                <th className="p-3">Price</th>
              </tr>
            </thead>
            <tbody>
              {inventory.map((item) => (
                <tr key={item._id} className="border-t">
                  <td className="p-3 flex items-center gap-3">
                    <img
                      src={item.product?.images?.[0]?.url}
                      alt={item.product?.name}
                      className="w-12 h-12 object-cover rounded"
                    />
                    <div>
                      <p className="font-medium">
                        {item.product?.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {item.product?.brand}
                      </p>
                    </div>
                  </td>

                  <td className="p-3">
                    {item.stockQuantity}
                  </td>

                  <td className="p-3">
                    <span
                      className={`px-2 py-1 text-sm rounded ${
                        item.stockStatus === "in-stock"
                          ? "bg-green-100 text-green-600"
                          : item.stockStatus === "low-stock"
                          ? "bg-yellow-100 text-yellow-600"
                          : "bg-red-100 text-red-600"
                      }`}
                    >
                      {item.stockStatus}
                    </span>
                  </td>

                  <td className="p-3">
                    ₹{item.price}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      <div className="flex justify-center mt-4 gap-3">
        <button
          disabled={page === 1}
          onClick={() => setPage(page - 1)}
          className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
        >
          Prev
        </button>

        <span className="px-3 py-1">
          {page} / {totalPages}
        </span>

        <button
          disabled={page === totalPages}
          onClick={() => setPage(page + 1)}
          className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default StoreInventory;
