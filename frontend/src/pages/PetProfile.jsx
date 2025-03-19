import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../css/PetProfile.css';

const PetProfile = () => {
  const { petId } = useParams();
  const navigate = useNavigate();

  const [pet, setPet] = useState(null);
  const [images, setImages] = useState([]);
  const [error, setError] = useState('');
  
  // Tabs: "about", "care", "gallery"
  const [activeTab, setActiveTab] = useState('about');
  
  // Modal state for full-screen gallery view
  const [modalOpen, setModalOpen] = useState(false);
  const [modalIndex, setModalIndex] = useState(0);

  useEffect(() => {
    console.log("PetProfile mounted. Pet ID:", petId);

    // Fetch pet details
    const fetchPet = async () => {
      try {
        console.log("Fetching pet details from /api/pets/" + petId);
        const res = await fetch(`/api/pets/${petId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          }
        });
        if (!res.ok) {
          throw new Error(`Failed to fetch pet details. Status: ${res.status}`);
        }
        const petData = await res.json();
        console.log("Fetched pet data:", petData);
        setPet(petData);
      } catch (err) {
        console.error("Error fetching pet details:", err);
        setError(err.message);
      }
    };

    // Fetch pet images
    const fetchImages = async () => {
      try {
        console.log("Fetching pet images from /api/pet-images?pet_id=" + petId);
        const res = await fetch(`/api/pet-images?pet_id=${petId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          }
        });
        if (!res.ok) {
          console.warn("No pet images found or error. Status:", res.status);
          setImages([]);
          return;
        }
        const imagesData = await res.json();
        console.log("Fetched pet images:", imagesData);
        if (Array.isArray(imagesData)) {
          setImages(imagesData);
        } else {
          console.warn("Pet images data is not an array. Defaulting to empty array.");
          setImages([]);
        }
      } catch (err) {
        console.error("Error fetching pet images:", err);
        setImages([]);
      }
    };

    fetchPet();
    fetchImages();
  }, [petId]);

  // When the user selects a file, immediately upload it
  const handleFileChange = async (e) => {
    const fileSelected = e.target.files[0];
    if (!fileSelected) return;
    console.log("File selected:", fileSelected);
    await handleUpload(fileSelected);
  };

  const handleUpload = async (fileSelected) => {
    console.log("Uploading image...", fileSelected);
    const formData = new FormData();
    formData.append('image', fileSelected);
    formData.append('pet_id', petId);
    // (Remove the is_main checkbox for simplicity in this version)

    try {
      const res = await fetch('/api/pet-images', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: formData
      });
      if (!res.ok) {
        throw new Error(`Upload failed. Status: ${res.status}`);
      }
      const newImage = await res.json();
      console.log("Image uploaded successfully:", newImage);
      setImages((prevImages) => [...prevImages, newImage]);
    } catch (err) {
      console.error("Error uploading image:", err);
    }
  };

  // Trigger file selection via the "Add Photos" button
  const openFilePicker = () => {
    document.getElementById('hiddenFileInput')?.click();
  };

  // Modal (full-screen gallery view) handlers
  const openModal = (index) => {
    setModalIndex(index);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  // Determine the hero image: use the main image if available, otherwise the first image, else a placeholder
  const placeholderUrl = '/icons/SFTailsLogo.png';
  const mainImage = images.find((img) => img.is_main) || images[0];
  const heroImageUrl = mainImage ? mainImage.image_url : placeholderUrl;
  const heroImageClass = mainImage ? 'pet-hero-image' : 'pet-hero-image placeholder-image';

  return (
    <div className="pet-profile-card">
      {/* Back Button */}
      <button className="back-button" onClick={() => navigate('/client/manage-pets')}>
        ← Back
      </button>

      {error && <p className="error-msg">{error}</p>}

      {pet ? (
        <>
          {/* Hero Section */}
          <div className="pet-profile-hero">
            <img
              src={heroImageUrl}
              alt={pet.pet_name || 'Pet'}
              className={heroImageClass}
            />
            <div className="pet-hero-overlay">
              <h2 className="pet-name">{pet.pet_name}</h2>
              <p className="pet-breed-size">
                {pet.breed} • {pet.size}
              </p>
            </div>
          </div>

          {/* Tabs */}
          <div className="tabs">
            <button onClick={() => setActiveTab('about')} className={activeTab === 'about' ? 'active' : ''}>
              About
            </button>
            <button onClick={() => setActiveTab('care')} className={activeTab === 'care' ? 'active' : ''}>
              Care Details
            </button>
            <button onClick={() => setActiveTab('gallery')} className={activeTab === 'gallery' ? 'active' : ''}>
              Gallery
            </button>
          </div>

          {/* "Add Photos" button – visible only on the Gallery tab, positioned right above tab-content */}
          {activeTab === 'gallery' && (
            <div className="gallery-upload-container">
              <button className="add-photos-button" onClick={openFilePicker}>
                Add Photos
              </button>
              {/* Hidden file input */}
              <input
                type="file"
                id="hiddenFileInput"
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />
            </div>
          )}

          {/* Tab Content */}
          <div className="tab-content">
            {activeTab === 'about' && (
              <div>
                <h3>About</h3>
                <p>{pet.about || 'No information about this pet.'}</p>
              </div>
            )}

            {activeTab === 'care' && (
              <div>
                <h3>Socialization</h3>
                <p>{pet.socialization || 'No socialization info available.'}</p>
                <h3>Care</h3>
                <p>{pet.care || 'No care info available.'}</p>
                <h3>Health</h3>
                <p>{pet.health || 'No health info available.'}</p>
                <h3>Notes</h3>
                <p>{pet.notes || 'No notes available.'}</p>
              </div>
            )}

            {activeTab === 'gallery' && (
              <div>
                {images.length > 0 ? (
                  <div className="gallery-grid">
                    {images.map((img, index) => (
                      <img
                        key={img.id}
                        src={img.image_url}
                        alt={pet.pet_name}
                        className={`gallery-image ${img.is_main ? 'main-photo' : ''}`}
                        onClick={() => openModal(index)}
                      />
                    ))}
                  </div>
                ) : (
                  <p>No images yet.</p>
                )}
              </div>
            )}
          </div>

          {/* Modal for full-screen gallery view */}
          {modalOpen && (
            <div className="modal" onClick={closeModal}>
              <button
                className="modal-prev"
                onClick={(e) => {
                  e.stopPropagation();
                  setModalIndex((modalIndex - 1 + images.length) % images.length);
                }}
              >
                ‹
              </button>
              <img
                src={images[modalIndex].image_url}
                alt="Full view"
                className="modal-image"
                onClick={(e) => e.stopPropagation() && closeModal()}
              />
              <button
                className="modal-next"
                onClick={(e) => {
                  e.stopPropagation();
                  setModalIndex((modalIndex + 1) % images.length);
                }}
              >
                ›
              </button>
            </div>
          )}
        </>
      ) : (
        <p>Loading pet profile...</p>
      )}
    </div>
  );
};

export default PetProfile;
