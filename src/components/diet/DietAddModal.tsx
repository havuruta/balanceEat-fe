import React, { useState } from 'react';
import axios from 'axios';

const DietAddModal: React.FC = () => {
  const [selectedFoods, setSelectedFoods] = useState([]);
  const [selectedMealType, setSelectedMealType] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');

  const handleSubmit = async () => {
    try {
      const diets = selectedFoods.map(food => ({
        nutritionId: food.id,
        foodName: food.name,
        amount: food.amount,
        note: food.note,
        mealType: selectedMealType,
        dietDate: selectedDate,
        mealTime: selectedTime
      }));

      const response = await axios.post('/diet/batch-add', { diets });
      // ... existing code ...
    } catch (error) {
      // ... existing code ...
    }
  };

  return (
    // ... existing code ...
  );
};

export default DietAddModal; 