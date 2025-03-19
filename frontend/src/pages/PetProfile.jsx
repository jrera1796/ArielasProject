import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import '../css/PetProfile.css';

const PetProfile = () => {
  const { petId } = useParams();
  const [pet, setPet] = useState(null);
  const [images, setImages] = useState([]);
  const [error, setError] = useState('');
  const [file, setFile] = useState(null);
  const [isMain, setIsMain] = useState(false);

  useEffect(() => {
    // Fetch pet details from API (you might create a dedicated endpoint for this)
    const fetchPet = async () => {
      try {
        const res = await fetch(`/api/pets/${petId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          }
        });
        if (!res.ok) throw new Error('Failed to fetch pet details');
        const petData = await res.json();
        setPet(petData);
      } catch (err) {
        setError(err.message);
      }
    };

    // Fetch pet images
    const fetchImages = async () => {
      try {
        const res = await fetch(`/api/pet-images?pet_id=${petId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          }
        });
        if (!res.ok) throw new Error('Failed to fetch pet images');
        const imagesData = await res.json();
        setImages(imagesData);
      } catch (err) {
        console.error(err);
      }
    };

    fetchPet();
    fetchImages();
  }, [petId]);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;
    const formData = new FormData();
    formData.append('image', file);
    formData.append('pet_id', petId);
    formData.append('is_main', isMain);

    try {
      const res = await fetch('/api/pet-images', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: formData
      });
      if (!res.ok) throw new Error('Upload failed');
      const newImage = await res.json();
      setImages([...images, newImage]);
      setFile(null);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="pet-profile-container">
      {error && <p className="error-msg">{error}</p>}
      {pet ? (
        <div>
          <h2>{pet.pet_name} Profile</h2>
          <p><strong>Breed:</strong> {pet.breed}</p>
          <p><strong>Size:</strong> {pet.size}</p>
          <p><strong>About:</strong> {pet.about}</p>
          <p><strong>Socialization:</strong> {pet.socialization}</p>
          <p><strong>Care:</strong> {pet.care}</p>
          <p><strong>Health:</strong> {pet.health}</p>
          <p><strong>Notes:</strong> {pet.notes}</p>

          <div className="pet-images">
            {images.map(img => (
              <img key={img.id} src={img.image_url} alt={pet.pet_name} className={img.is_main ? 'main-photo' : ''} />
            ))}
          </div>

          <form onSubmit={handleUpload}>
            <input type="file" onChange={handleFileChange} />
            <label>
              <input type="checkbox" checked={isMain} onChange={(e) => setIsMain(e.target.checked)} />
              Set as main photo
            </label>
            <button type="submit">Upload Image</button>
          </form>
        </div>
      ) : (
        <p>Loading pet profile...</p>
      )}
    </div>
  );
};

export default PetProfile;
