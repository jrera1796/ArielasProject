// src/pages/ManagePets.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/ManagePets.css';

const ManagePets = () => {
  const [pets, setPets] = useState([]);
  const [petForm, setPetForm] = useState({
    pet_name: '',
    breed: '',
    size: '',
    about: '',
    socialization: '',
    care: '',
    health: '',
    notes: ''
  });
  const [error, setError] = useState('');
  const [editingPet, setEditingPet] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const navigate = useNavigate();

  // Fetch existing pets on mount and then fetch images for each pet
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      navigate('/login');
      return;
    }
    const fetchPets = async () => {
      try {
        const res = await fetch('/api/pets', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (!res.ok) throw new Error('Failed to fetch pets');
        const petData = await res.json();
        // Now, for each pet, fetch its images
        const petsWithImages = await Promise.all(
          petData.map(async (pet) => {
            try {
              const imgRes = await fetch(`/api/pet-images?pet_id=${pet.id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
              });
              if (imgRes.ok) {
                const imagesData = await imgRes.json();
                // Use the image marked as main if available, else the first image, else null
                const mainImg = Array.isArray(imagesData) && imagesData.length > 0
                  ? imagesData.find(img => img.is_main)?.image_url || imagesData[0].image_url
                  : null;
                return { ...pet, main_image_url: mainImg };
              }
            } catch (imgErr) {
              console.error(`Error fetching images for pet ${pet.id}:`, imgErr);
            }
            return pet; // return pet as is if images can't be fetched
          })
        );
        setPets(petsWithImages);
      } catch (err) {
        setError(err.message);
      }
    };
    fetchPets();
  }, [navigate]);

  // Handle input changes
  const handleInputChange = (e) => {
    setPetForm({ ...petForm, [e.target.name]: e.target.value });
  };

  // Add a new pet
  const handleAddPet = async (e) => {
    e.preventDefault();
    setError('');
    const token = localStorage.getItem('authToken');
    try {
      const res = await fetch('/api/pets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(petForm)
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to add pet');
      }
      const newPet = await res.json();
      // Optionally, fetch images for the new pet here if needed.
      setPets([...pets, newPet]);
      setPetForm({
        pet_name: '',
        breed: '',
        size: '',
        about: '',
        socialization: '',
        care: '',
        health: '',
        notes: ''
      });
      setShowForm(false);
    } catch (err) {
      setError(err.message);
    }
  };

  // Delete a pet
  // const handleDeletePet = async (petId) => {
  //   const token = localStorage.getItem('authToken');
  //   try {
  //     const res = await fetch(`/api/pets/${petId}`, {
  //       method: 'DELETE',
  //       headers: {
  //         'Authorization': `Bearer ${token}`
  //       }
  //     });
  //     if (!res.ok) {
  //       const data = await res.json();
  //       throw new Error(data.error || 'Failed to delete pet');
  //     }
  //     setPets(pets.filter(pet => pet.id !== petId));
  //   } catch (err) {
  //     setError(err.message);
  //   }
  // };

  // Begin editing a pet (toggles the form view)
  // const handleEditPet = (pet) => {
  //   setEditingPet(pet);
  //   setPetForm({
  //     pet_name: pet.pet_name,
  //     breed: pet.breed || '',
  //     size: pet.size || '',
  //     about: pet.about || '',
  //     socialization: pet.socialization || '',
  //     care: pet.care || '',
  //     health: pet.health || '',
  //     notes: pet.notes || ''
  //   });
  //   setShowForm(true);
  // };

  // Update an existing pet
  const handleUpdatePet = async (e) => {
    e.preventDefault();
    setError('');
    const token = localStorage.getItem('authToken');
    try {
      const res = await fetch(`/api/pets/${editingPet.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(petForm)
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to update pet');
      }
      const updatedPet = await res.json();
      setPets(pets.map(p => (p.id === updatedPet.id ? updatedPet : p)));
      setEditingPet(null);
      setPetForm({
        pet_name: '',
        breed: '',
        size: '',
        about: '',
        socialization: '',
        care: '',
        health: '',
        notes: ''
      });
      setShowForm(false);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="manage-pets-container">
      <h2>Manage Your Pets</h2>
      {error && <p className="error-msg">{error}</p>}

      {/* Toggle button to show/hide the add pet form */}
      {!showForm && (
        <button className="toggle-form-btn" onClick={() => setShowForm(true)}>
          Add New Pet
        </button>
      )}

      {/* Add / Edit Form */}
      {showForm && (
        <form className="pet-form" onSubmit={editingPet ? handleUpdatePet : handleAddPet}>
          <h3>{editingPet ? 'Edit Pet' : 'Add a New Pet'}</h3>
          <div className="form-group">
            <label>Pet Name</label>
            <input
              type="text"
              name="pet_name"
              value={petForm.pet_name}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Breed</label>
            <input
              type="text"
              name="breed"
              value={petForm.breed}
              onChange={handleInputChange}
            />
          </div>
          <div className="form-group">
            <label>Size</label>
            <input
              type="text"
              name="size"
              value={petForm.size}
              onChange={handleInputChange}
            />
          </div>
          <div className="form-group">
            <label>About</label>
            <textarea
              name="about"
              value={petForm.about}
              onChange={handleInputChange}
            />
          </div>
          <div className="form-group">
            <label>Socialization</label>
            <textarea
              name="socialization"
              value={petForm.socialization}
              onChange={handleInputChange}
            />
          </div>
          <div className="form-group">
            <label>Care</label>
            <textarea
              name="care"
              value={petForm.care}
              onChange={handleInputChange}
            />
          </div>
          <div className="form-group">
            <label>Health</label>
            <textarea
              name="health"
              value={petForm.health}
              onChange={handleInputChange}
            />
          </div>
          <div className="form-group">
            <label>Notes</label>
            <textarea
              name="notes"
              value={petForm.notes}
              onChange={handleInputChange}
            />
          </div>
          <button type="submit">{editingPet ? 'Update Pet' : 'Add Pet'}</button>
          <button type="button" onClick={() => { setEditingPet(null); setShowForm(false); }}>
            Cancel
          </button>
        </form>
      )}

      {/* Pet List */}
      <h3>Your Pets</h3>
      {pets.length === 0 ? (
        <p>No pets found. Add one above!</p>
      ) : (
        <ul className="pet-list">
          {pets.map((pet) => (
            <li
              key={pet.id}
              className="pet-item"
              onClick={() => navigate(`/client/pet/${pet.id}`)}
            >
              <div className="pet-image-container">
                {pet.main_image_url ? (
                  <img
                    src={pet.main_image_url}
                    alt={pet.pet_name}
                    className="pet-card-image"
                  />
                ) : (
                  <div className="pet-no-image">No Image</div>
                )}
                <div className="pet-name-overlay">
                  {pet.pet_name}
                </div>
              </div>
            </li>
          ))}
        </ul>

      )}
    </div>
  );
};

export default ManagePets;
