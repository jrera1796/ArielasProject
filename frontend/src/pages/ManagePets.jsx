// src/pages/ManagePets.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/ManagePets.css';

const ManagePets = () => {
  const [pets, setPets] = useState([]);
  const [petName, setPetName] = useState('');
  const [breed, setBreed] = useState('');
  const [size, setSize] = useState('');
  const [notes, setNotes] = useState('');
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
        body: JSON.stringify({ pet_name: petName, breed, size, notes })
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to add pet');
      }
      const newPet = await res.json();
      setPets([...pets, newPet]);
      setPetName('');
      setBreed('');
      setSize('');
      setNotes('');
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
    setPetName(pet.pet_name);
    setBreed(pet.breed || '');
    setSize(pet.size || '');
    setNotes(pet.notes || '');
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
        body: JSON.stringify({ pet_name: petName, breed, size, notes })
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to update pet');
      }
      const updatedPet = await res.json();
      setPets(pets.map(p => (p.id === updatedPet.id ? updatedPet : p)));
      // Clear editing state
      setEditingPet(null);
      setPetName('');
      setBreed('');
      setSize('');
      setNotes('');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="manage-pets-container">
      <h2>Manage Your Pets</h2>
      {error && <p className="error-msg">{error}</p>}

      {/* If editing a pet, show the edit form; otherwise, show add form */}
      {editingPet ? (
        <form className="pet-form" onSubmit={handleUpdatePet}>
          <h3>Edit Pet</h3>
          <div className="form-group">
            <label>Pet Name</label>
            <input
              type="text"
              value={petName}
              onChange={(e) => setPetName(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Breed</label>
            <input
              type="text"
              value={breed}
              onChange={(e) => setBreed(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Size</label>
            <input
              type="text"
              value={size}
              onChange={(e) => setSize(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
          <button type="submit">Update Pet</button>
          <button type="button" onClick={() => setEditingPet(null)}>
            Cancel
          </button>
        </form>
      ) : (
        <form className="pet-form" onSubmit={handleAddPet}>
          <h3>Add a New Pet</h3>
          <div className="form-group">
            <label>Pet Name</label>
            <input
              type="text"
              value={petName}
              onChange={(e) => setPetName(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Breed</label>
            <input
              type="text"
              value={breed}
              onChange={(e) => setBreed(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Size</label>
            <input
              type="text"
              value={size}
              onChange={(e) => setSize(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
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
            <li key={pet.id} className="pet-item">
              <div className="pet-info">
                <strong>{pet.pet_name}</strong> ({pet.breed || 'Unknown Breed'})
                <div>Size: {pet.size || 'N/A'}</div>
                {pet.notes && <div>Notes: {pet.notes}</div>}
              </div>
              <div className="pet-actions">
                <button onClick={() => handleEditPet(pet)}>Edit</button>
                <button onClick={() => handleDeletePet(pet.id)}>Delete</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ManagePets;
