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
  const navigate = useNavigate();

  // Fetch existing pets on mount
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      navigate('/login');
      return;
    }
    fetch('/api/pets', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch pets');
        return res.json();
      })
      .then(data => setPets(data))
      .catch(err => setError(err.message));
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
    } catch (err) {
      setError(err.message);
    }
  };

  // Delete a pet
  const handleDeletePet = async (petId) => {
    const token = localStorage.getItem('authToken');
    try {
      const res = await fetch(`/api/pets/${petId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to delete pet');
      }
      setPets(pets.filter(pet => pet.id !== petId));
    } catch (err) {
      setError(err.message);
    }
  };

  // Begin editing a pet
  const handleEditPet = (pet) => {
    setEditingPet(pet);
    setPetForm({
      pet_name: pet.pet_name,
      breed: pet.breed || '',
      size: pet.size || '',
      about: pet.about || '',
      socialization: pet.socialization || '',
      care: pet.care || '',
      health: pet.health || '',
      notes: pet.notes || ''
    });
  };

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
      // Clear editing state
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
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="manage-pets-container">
      <h2>Manage Your Pets</h2>
      {error && <p className="error-msg">{error}</p>}

      {/* Show add/edit form */}
      {editingPet ? (
        <form className="pet-form" onSubmit={handleUpdatePet}>
          <h3>Edit Pet</h3>
          <div className="form-group">
            <label>Pet Name</label>
            <input type="text" name="pet_name" value={petForm.pet_name} onChange={handleInputChange} required />
          </div>
          <div className="form-group">
            <label>Breed</label>
            <input type="text" name="breed" value={petForm.breed} onChange={handleInputChange} />
          </div>
          <div className="form-group">
            <label>Size</label>
            <input type="text" name="size" value={petForm.size} onChange={handleInputChange} />
          </div>
          <div className="form-group">
            <label>About</label>
            <textarea name="about" value={petForm.about} onChange={handleInputChange} />
          </div>
          <div className="form-group">
            <label>Socialization</label>
            <textarea name="socialization" value={petForm.socialization} onChange={handleInputChange} />
          </div>
          <div className="form-group">
            <label>Care</label>
            <textarea name="care" value={petForm.care} onChange={handleInputChange} />
          </div>
          <div className="form-group">
            <label>Health</label>
            <textarea name="health" value={petForm.health} onChange={handleInputChange} />
          </div>
          <div className="form-group">
            <label>Notes</label>
            <textarea name="notes" value={petForm.notes} onChange={handleInputChange} />
          </div>
          <button type="submit">Update Pet</button>
          <button type="button" onClick={() => setEditingPet(null)}>Cancel</button>
        </form>
      ) : (
        <form className="pet-form" onSubmit={handleAddPet}>
          <h3>Add a New Pet</h3>
          <div className="form-group">
            <label>Pet Name</label>
            <input type="text" name="pet_name" value={petForm.pet_name} onChange={handleInputChange} required />
          </div>
          <div className="form-group">
            <label>Breed</label>
            <input type="text" name="breed" value={petForm.breed} onChange={handleInputChange} />
          </div>
          <div className="form-group">
            <label>Size</label>
            <input type="text" name="size" value={petForm.size} onChange={handleInputChange} />
          </div>
          <div className="form-group">
            <label>About</label>
            <textarea name="about" value={petForm.about} onChange={handleInputChange} />
          </div>
          <div className="form-group">
            <label>Socialization</label>
            <textarea name="socialization" value={petForm.socialization} onChange={handleInputChange} />
          </div>
          <div className="form-group">
            <label>Care</label>
            <textarea name="care" value={petForm.care} onChange={handleInputChange} />
          </div>
          <div className="form-group">
            <label>Health</label>
            <textarea name="health" value={petForm.health} onChange={handleInputChange} />
          </div>
          <div className="form-group">
            <label>Notes</label>
            <textarea name="notes" value={petForm.notes} onChange={handleInputChange} />
          </div>
          <button type="submit">Add Pet</button>
        </form>
      )}

      <h3>Your Pets</h3>
      {pets.length === 0 ? (
        <p>No pets found. Add one above!</p>
      ) : (
        <ul className="pet-list">
          {pets.map((pet) => (
            <li 
              key={pet.id} 
              className="pet-item" 
              style={pet.main_image_url ? { backgroundImage: `url(${pet.main_image_url})` } : {}}
            >
              <div className="pet-overlay">
                <div className="pet-info">
                  <strong>{pet.pet_name}</strong> ({pet.breed || 'Unknown Breed'})
                  <div>Size: {pet.size || 'N/A'}</div>
                  {pet.notes && <div>Notes: {pet.notes}</div>}
                  {pet.about && <div>About: {pet.about}</div>}
                  {pet.socialization && <div>Socialization: {pet.socialization}</div>}
                  {pet.care && <div>Care: {pet.care}</div>}
                  {pet.health && <div>Health: {pet.health}</div>}
                </div>
                <div className="pet-actions">
                  <button onClick={() => handleEditPet(pet)}>Edit</button>
                  <button onClick={() => handleDeletePet(pet.id)}>Delete</button>
                  <button onClick={() => navigate(`/client/pet/${pet.id}`)}>View Profile</button>
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
