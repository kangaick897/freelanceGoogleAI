import { useState } from 'react';
import { useStore, ThemeColor } from '@/store/useStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Palette, User, LogOut, Tags, Plus, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export function Settings() {
  const { theme, setTheme, user, setUser, categories, addCategory, removeCategory } = useStore();
  
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryColor, setNewCategoryColor] = useState('bg-blue-500');

  const themes: { id: ThemeColor; color: string; name: string }[] = [
    { id: 'blue', color: 'bg-blue-500', name: 'Blue' },
    { id: 'pink', color: 'bg-pink-500', name: 'Pink' },
    { id: 'green', color: 'bg-green-500', name: 'Green' },
    { id: 'purple', color: 'bg-purple-500', name: 'Purple' },
    { id: 'orange', color: 'bg-orange-500', name: 'Orange' },
  ];

  const categoryColors = [
    'bg-blue-500', 'bg-pink-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500',
    'bg-red-500', 'bg-yellow-500', 'bg-teal-500', 'bg-indigo-500', 'bg-rose-500'
  ];

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return;
    
    await addCategory({
      id: Math.random().toString(36).substr(2, 9),
      name: newCategoryName.trim(),
      color: newCategoryColor
    });
    
    setNewCategoryName('');
    setIsAddingCategory(false);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="pb-24 space-y-6"
    >
      <h1 className="text-2xl font-bold text-slate-800">Settings</h1>

      {/* Profile Section */}
      <div className="glass rounded-3xl p-6 space-y-4">
        <div className="flex items-center gap-2 text-slate-800 font-bold mb-2">
          <User size={20} className="text-primary" />
          Profile
        </div>
        
        <div className="flex items-center gap-4">
          <img 
            src={user.avatarUrl} 
            alt="Profile" 
            className="w-16 h-16 rounded-full border-2 border-white shadow-sm bg-white"
          />
          <div className="flex-1">
            <label className="text-xs font-bold text-slate-500 block mb-1">Display Name</label>
            <input 
              type="text" 
              value={user.name}
              onChange={(e) => setUser({ name: e.target.value })}
              className="w-full bg-white/50 border border-white/60 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium"
            />
          </div>
        </div>
        
        <div>
          <label className="text-xs font-bold text-slate-500 block mb-1">Avatar URL</label>
          <input 
            type="text" 
            value={user.avatarUrl}
            onChange={(e) => setUser({ avatarUrl: e.target.value })}
            className="w-full bg-white/50 border border-white/60 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm"
          />
        </div>
      </div>

      {/* Theme Engine */}
      <div className="glass rounded-3xl p-6">
        <div className="flex items-center gap-2 text-slate-800 font-bold mb-4">
          <Palette size={20} className="text-primary" />
          Theme Engine
        </div>
        
        <div className="flex justify-between">
          {themes.map((t) => (
            <button
              key={t.id}
              onClick={() => setTheme(t.id)}
              className={`flex flex-col items-center gap-2 transition-transform active:scale-95`}
            >
              <div className={`w-10 h-10 rounded-full ${t.color} ${theme === t.id ? 'ring-4 ring-offset-2 ring-offset-bg-app ring-primary shadow-lg' : 'shadow-sm'}`} />
              <span className={`text-[10px] font-bold ${theme === t.id ? 'text-primary' : 'text-slate-400'}`}>
                {t.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Categories */}
      <div className="glass rounded-3xl p-6">
        <div className="flex items-center gap-2 text-slate-800 font-bold mb-4">
          <Tags size={20} className="text-primary" />
          Categories
        </div>
        
        <div className="space-y-2">
          {categories.map(cat => (
            <div key={cat.id} className="flex items-center justify-between bg-white/40 px-3 py-2 rounded-xl">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${cat.color}`} />
                <span className="text-sm font-medium text-slate-700">{cat.name}</span>
              </div>
              <button 
                onClick={() => removeCategory(cat.id)}
                className="text-slate-400 hover:text-red-500 transition-colors p-1"
              >
                <X size={16} />
              </button>
            </div>
          ))}

          <AnimatePresence>
            {isAddingCategory ? (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-white/60 p-3 rounded-xl space-y-3 border border-white"
              >
                <input 
                  type="text" 
                  autoFocus
                  value={newCategoryName}
                  onChange={e => setNewCategoryName(e.target.value)}
                  placeholder="Category Name"
                  className="w-full bg-white/50 border border-white/60 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                />
                <div className="flex flex-wrap gap-2">
                  {categoryColors.map(color => (
                    <button
                      key={color}
                      onClick={() => setNewCategoryColor(color)}
                      className={`w-6 h-6 rounded-full ${color} ${newCategoryColor === color ? 'ring-2 ring-offset-1 ring-slate-400' : ''}`}
                    />
                  ))}
                </div>
                <div className="flex gap-2 pt-1">
                  <button 
                    onClick={handleAddCategory}
                    disabled={!newCategoryName.trim()}
                    className="flex-1 bg-primary text-white text-xs font-bold py-2 rounded-lg disabled:opacity-50"
                  >
                    Save
                  </button>
                  <button 
                    onClick={() => setIsAddingCategory(false)}
                    className="flex-1 bg-slate-200 text-slate-600 text-xs font-bold py-2 rounded-lg"
                  >
                    Cancel
                  </button>
                </div>
              </motion.div>
            ) : (
              <button 
                onClick={() => setIsAddingCategory(true)}
                className="w-full py-2 border-2 border-dashed border-slate-300 rounded-xl text-sm font-bold text-slate-500 hover:text-primary hover:border-primary/50 transition-colors flex items-center justify-center gap-1"
              >
                <Plus size={16} /> Add Category
              </button>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Logout */}
      <button 
        onClick={async () => {
          await supabase.auth.signOut();
        }}
        className="w-full glass-button rounded-2xl p-4 flex items-center justify-center gap-2 text-red-500 font-bold"
      >
        <LogOut size={20} />
        Sign Out
      </button>
    </motion.div>
  );
}
