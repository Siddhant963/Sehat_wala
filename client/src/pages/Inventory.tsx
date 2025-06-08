
import { useState } from 'react';
import { toast } from 'sonner';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import WeeklyCalendar from '../components/ui/calendar';
import InventoryCard from '@/components/ui/InventoryCard';

const Inventory = () => {
  const handleAddItems = () => {
    toast.success('Add items clicked');
  };

  const handleEditItems = () => {
    toast.info('Edit items clicked');
  };

  const handleExpandInventory = () => {
    toast.info('Expand inventory clicked');
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-6 animate-fade-in">
        <WeeklyCalendar className="mb-8" />
        
        <div className="grid grid-cols-2 gap-4 mb-6">
          <button className="btn-primary py-4">See Inventory</button>
          <button className="btn-primary py-4">Staff</button>
        </div>
        
        <InventoryCard 
          totalItems={150}
          available={120}
          used={30}
          onExpand={handleExpandInventory}
          className="mb-8"
        />
        
        <div className="card mb-4">
          <h2 className="text-2xl font-medium mb-4">Manage Inventory</h2>
          
          <div className="flex justify-between mt-6">
            <button 
              onClick={handleAddItems}
              className="bg-white text-neutral-dark px-8 py-4 rounded-full font-medium shadow-sm hover:bg-gray-100 transition-colors"
            >
              ADD ITEMS
            </button>
            
            <button 
              onClick={handleEditItems}
              className="bg-teal-600 text-white px-8 py-4 rounded-full font-medium shadow-sm hover:bg-teal-500 transition-colors"
            >
              EDIT ITEMS
            </button>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Inventory;
