// src/pages/home/CreateInfoSection.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MdAdd, MdClose } from "react-icons/md";
import { infoSectionService } from "../api/infoSectionServices.js";
import { categoryService } from "../api/categoryService.js";

function CreateInfoSection() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const [cards, setCards] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await categoryService.getCategories();
        setCategories(data);
      } catch (err) {
        console.error("Failed to load categories:", err);
      }
    };
    fetchCategories();
  }, []);

  const handleImageChange = (e) => setImage(e.target.files[0]);

  const addCard = () =>
    setCards((prev) => [...prev, { title: "", description: "", image: null }]);

  const handleCardChange = (index, field, value) => {
    setCards((prev) => {
      const updated = [...prev];
      updated[index][field] = value;
      return updated;
    });
  };

  const removeCard = (index) =>
    setCards((prev) => prev.filter((_, i) => i !== index));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title) return alert("Title is required");

    const formData = new FormData();
    formData.append("title", title);
    formData.append("subtitle", subtitle);
    formData.append("description", description);
    if (image) formData.append("image", image);
    if (selectedCategory) formData.append("category", selectedCategory);

    formData.append(
      "cards",
      JSON.stringify(cards.map(({ title, description }) => ({ title, description })))
    );
    cards.forEach((card, i) => {
      if (card.image) formData.append(`cardImage_${i}`, card.image);
    });

    setLoading(true);
    try {
      await infoSectionService.createInfoSection(formData);
      alert("InfoSection created successfully!");
      navigate("/infosections");
    } catch (err) {
      console.error(err);
      alert("Creation failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-5">
      <h1 className="text-2xl font-bold mb-6 text-center">Create InfoSection</h1>

      <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
        {/* Main Info Section */}
        <div className="bg-white p-6 rounded-xl shadow-md flex flex-col gap-4">
          <label className="flex flex-col font-medium">
            Title* 
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="mt-2 p-2 border rounded-lg border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </label>

          <label className="flex flex-col font-medium">
            Subtitle
            <input
              type="text"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              className="mt-2 p-2 border rounded-lg border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </label>

          <label className="flex flex-col font-medium">
            Description
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="mt-2 p-2 border rounded-lg border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </label>

          <label className="flex flex-col font-medium">
            Category
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="mt-2 p-2 border rounded-lg border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="">Select a Category</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.pageTitle}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col font-medium">
            Image
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="mt-2"
            />
          </label>
        </div>

        {/* Cards Section */}
        <div className="flex flex-col gap-4">
          <h3 className="text-lg font-semibold">Cards</h3>
          {cards.map((card, i) => (
            <div
              key={i}
              className="bg-gray-50 p-4 rounded-xl shadow-sm relative flex flex-col gap-3"
            >
              <button
                type="button"
                onClick={() => removeCard(i)}
                className="absolute top-2 right-2 text-red-500 hover:text-red-600"
              >
                <MdClose size={20} />
              </button>

              <label className="flex flex-col font-medium">
                Card Title
                <input
                  type="text"
                  value={card.title}
                  onChange={(e) => handleCardChange(i, "title", e.target.value)}
                  className="mt-1 p-2 border rounded-lg border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </label>

              <label className="flex flex-col font-medium">
                Card Description
                <input
                  type="text"
                  value={card.description}
                  onChange={(e) =>
                    handleCardChange(i, "description", e.target.value)
                  }
                  className="mt-1 p-2 border rounded-lg border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </label>

              <label className="flex flex-col font-medium">
                Card Image
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleCardChange(i, "image", e.target.files[0])}
                  className="mt-1"
                />
              </label>
            </div>
          ))}

          <button
            type="button"
            onClick={addCard}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 font-medium text-gray-700"
          >
            <MdAdd size={20} /> Add Card
          </button>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3 rounded-lg text-white font-semibold ${
            loading ? "bg-blue-300 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {loading ? "Creating..." : "Create InfoSection"}
        </button>
      </form>
    </div>
  );
}

export default CreateInfoSection;
