// EditInfoSection.jsx
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { MdAdd, MdClose } from "react-icons/md";
import { infoSectionService } from "../api/infoSectionServices.js";

function EditInfoSection() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchSection = async () => {
      try {
        const data = await infoSectionService.getInfoSectionById(id);
        setTitle(data.title);
        setSubtitle(data.subtitle || "");
        setDescription(data.description || "");
        setImage(null); // keep null, user can change
        setCards(data.cards?.map((c) => ({ ...c, image: null })) || []);
      } catch (err) {
        console.error(err);
        alert("Failed to fetch info section");
        navigate("/infosections");
      } finally {
        setLoading(false);
      }
    };
    fetchSection();
  }, [id, navigate]);

  const handleCardChange = (index, field, value) => {
    setCards((prev) => {
      const updated = [...prev];
      updated[index][field] = value;
      return updated;
    });
  };

  const addCard = () => setCards((prev) => [...prev, { title: "", description: "", image: null }]);
  const removeCard = (index) => setCards((prev) => prev.filter((_, i) => i !== index));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title) return alert("Title is required");

    const formData = new FormData();
    formData.append("title", title);
    formData.append("subtitle", subtitle);
    formData.append("description", description);
    if (image) formData.append("image", image);

    formData.append("cards", JSON.stringify(cards.map(({ title, description }) => ({ title, description }))));
    cards.forEach((card, i) => {
      if (card.image) formData.append(`cardImage_${i}`, card.image);
    });

    setSaving(true);
    try {
      await infoSectionService.updateInfoSection(id, formData);
      alert("InfoSection updated successfully!");
      navigate("/infosections");
    } catch (err) {
      console.error(err);
      alert("Update failed. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={{ padding: "40px", textAlign: "center" }}>Loading info section...</div>;

  return (
  <div className="page-container" style={{ maxWidth: "800px", margin: "0 auto", padding: "20px" }}>
    <h1 style={{ fontSize: "2rem", fontWeight: "700", marginBottom: "20px", textAlign: "center" }}>
      Edit InfoSection
    </h1>

    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      
      {/* Main Form Card */}
      <div style={{
        background: "#fff",
        padding: "20px",
        borderRadius: "12px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        display: "flex",
        flexDirection: "column",
        gap: "15px"
      }}>
        <label style={{ display: "flex", flexDirection: "column", fontWeight: "500" }}>
          Title* 
          <input 
            type="text" 
            value={title} 
            onChange={(e) => setTitle(e.target.value)} 
            required
            style={{ padding: "10px", borderRadius: "8px", border: "1px solid #ccc", marginTop: "5px" }}
          />
        </label>

        <label style={{ display: "flex", flexDirection: "column", fontWeight: "500" }}>
          Subtitle
          <input 
            type="text" 
            value={subtitle} 
            onChange={(e) => setSubtitle(e.target.value)} 
            style={{ padding: "10px", borderRadius: "8px", border: "1px solid #ccc", marginTop: "5px" }}
          />
        </label>

        <label style={{ display: "flex", flexDirection: "column", fontWeight: "500" }}>
          Description
          <textarea 
            value={description} 
            onChange={(e) => setDescription(e.target.value)} 
            rows={4}
            style={{ padding: "10px", borderRadius: "8px", border: "1px solid #ccc", marginTop: "5px" }}
          />
        </label>

        <label style={{ display: "flex", flexDirection: "column", fontWeight: "500" }}>
          Main Image (Upload to replace)
          <input 
            type="file" 
            accept="image/*" 
            onChange={(e) => setImage(e.target.files[0])} 
            style={{ marginTop: "5px" }}
          />
        </label>
      </div>

      {/* Cards Section */}
      <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
        <h3 style={{ fontSize: "1.25rem", fontWeight: "600" }}>Cards</h3>
        {cards.map((card, i) => (
          <div key={i} style={{
            background: "#f9f9f9",
            padding: "15px",
            borderRadius: "12px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
            position: "relative",
            display: "flex",
            flexDirection: "column",
            gap: "10px"
          }}>
            <button 
              type="button" 
              onClick={() => removeCard(i)} 
              style={{
                position: "absolute",
                top: "10px",
                right: "10px",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                color: "#f56565",
                fontSize: "1.2rem"
              }}
            >
              <MdClose />
            </button>

            <label style={{ display: "flex", flexDirection: "column", fontWeight: "500" }}>
              Card Title
              <input 
                type="text" 
                value={card.title} 
                onChange={(e) => handleCardChange(i, "title", e.target.value)} 
                style={{ padding: "8px", borderRadius: "8px", border: "1px solid #ccc", marginTop: "5px" }}
              />
            </label>

            <label style={{ display: "flex", flexDirection: "column", fontWeight: "500" }}>
              Card Description
              <input 
                type="text" 
                value={card.description} 
                onChange={(e) => handleCardChange(i, "description", e.target.value)} 
                style={{ padding: "8px", borderRadius: "8px", border: "1px solid #ccc", marginTop: "5px" }}
              />
            </label>

            <label style={{ display: "flex", flexDirection: "column", fontWeight: "500" }}>
              Card Image (Upload to replace)
              <input 
                type="file" 
                accept="image/*" 
                onChange={(e) => handleCardChange(i, "image", e.target.files[0])} 
                style={{ marginTop: "5px" }}
              />
            </label>
          </div>
        ))}

        <button 
          type="button" 
          className="btn btn-secondary" 
          onClick={addCard} 
          style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 15px", borderRadius: "8px", background: "#edf2f7", border: "1px solid #ccc", cursor: "pointer", fontWeight: "500" }}
        >
          <MdAdd /> Add Card
        </button>
      </div>

      {/* Submit Button */}
      <button 
        type="submit" 
        className="btn btn-primary" 
        disabled={saving} 
        style={{ padding: "12px 20px", borderRadius: "8px", background: "#3182ce", color: "#fff", fontWeight: "600", cursor: saving ? "not-allowed" : "pointer", marginTop: "10px" }}
      >
        {saving ? "Saving..." : "Update InfoSection"}
      </button>
    </form>
  </div>
);

}

export default EditInfoSection;
