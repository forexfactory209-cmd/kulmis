import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCategories, createCategory, deleteCategory, renameCategory } from '../../services/adminService';

const CategoriesPage = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [addLoading, setAddLoading] = useState(false);
  const [editingCat, setEditingCat] = useState(null);
  const [editName, setEditName] = useState('');
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await getCategories();
      setCategories(res.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!newCatName.trim()) return;
    try {
      setAddLoading(true);
      await createCategory(newCatName.trim());
      setNewCatName('');
      setShowAdd(false);
      fetchData();
    } catch (e) {
      alert(e.response?.data?.error?.message || 'Failed to create category');
    } finally {
      setAddLoading(false);
    }
  };

  const handleDelete = async (name) => {
    if (!window.confirm(`Delete category "${name}"? Projects using this category won't lose their data, but the category won't appear in new project forms.`)) return;
    try {
      setActionLoading(name);
      await deleteCategory(name);
      fetchData();
    } catch (e) {
      alert('Failed to delete category');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRename = async (oldName) => {
    if (!editName.trim() || editName.trim() === oldName) {
      setEditingCat(null);
      return;
    }
    try {
      setActionLoading(oldName);
      await renameCategory(oldName, editName.trim());
      setEditingCat(null);
      fetchData();
    } catch (e) {
      alert(e.response?.data?.error?.message || 'Failed to rename category');
    } finally {
      setActionLoading(null);
    }
  };

  const filtered = categories.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Categories</h1>
          <p className="text-sm text-slate-400 mt-1">Manage project categories. {categories.length} total categories.</p>
        </div>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="bg-[#10B981] hover:bg-[#059669] text-white px-4 py-2 rounded-xl font-medium transition-colors shadow-lg shadow-emerald-500/25 flex items-center gap-2 cursor-pointer"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Add Category
        </button>
      </div>

      {/* Add Category Form */}
      {showAdd && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 animate-fade-in">
          <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4">New Category</h3>
          <div className="flex gap-3">
            <input
              type="text"
              value={newCatName}
              onChange={e => setNewCatName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAdd()}
              placeholder="Enter category name..."
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981] transition-all"
              autoFocus
            />
            <button
              onClick={handleAdd}
              disabled={addLoading || !newCatName.trim()}
              className="px-6 py-2.5 bg-[#10B981] hover:bg-[#059669] text-white rounded-xl font-medium text-sm transition-colors disabled:opacity-50 cursor-pointer"
            >
              {addLoading ? 'Adding...' : 'Add'}
            </button>
            <button
              onClick={() => { setShowAdd(false); setNewCatName(''); }}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-medium text-sm transition-colors cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search categories..."
              className="pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981] w-64 transition-all"
            />
          </div>
          <span className="text-xs text-slate-500">{filtered.length} results</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-400">
            <thead className="bg-slate-950/50 text-xs uppercase font-semibold text-slate-500">
              <tr>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Total Projects</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {loading ? (
                <tr>
                  <td colSpan="4" className="px-6 py-8 text-center text-slate-500">
                    <div className="flex justify-center items-center gap-2">
                      <svg className="animate-spin h-5 w-5 text-[#10B981]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Loading...
                    </div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-8 text-center text-slate-500">
                    {search ? 'No categories match your search.' : 'No categories found. Add one above!'}
                  </td>
                </tr>
              ) : (
                filtered.map((cat, i) => (
                  <tr key={cat.name || i} className="hover:bg-slate-800/30 transition-colors group cursor-pointer" onClick={() => navigate(`/categories/${encodeURIComponent(cat.name)}`)}>
                    <td className="px-6 py-4">
                      {editingCat === cat.name ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={editName}
                            onChange={e => setEditName(e.target.value)}
                            onKeyDown={e => {
                              if (e.key === 'Enter') handleRename(cat.name);
                              if (e.key === 'Escape') setEditingCat(null);
                            }}
                            className="bg-slate-950 border border-[#10B981] rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none w-48"
                            autoFocus
                          />
                          <button
                            onClick={() => handleRename(cat.name)}
                            disabled={actionLoading === cat.name}
                            className="text-[#10B981] hover:text-emerald-300 transition-colors text-xs font-medium cursor-pointer"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingCat(null)}
                            className="text-slate-500 hover:text-slate-300 transition-colors text-xs cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center">
                            <span className="text-emerald-400 font-bold text-xs">{cat.name?.[0]?.toUpperCase()}</span>
                          </div>
                          <span className="font-medium text-white">{cat.name}</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-slate-800 text-slate-300 px-2.5 py-1 rounded-lg text-xs font-semibold">
                        {cat.activeJobs}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                        cat.activeJobs > 0
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : 'bg-slate-500/10 text-slate-400 border-slate-500/20'
                      }`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${cat.activeJobs > 0 ? 'bg-emerald-400' : 'bg-slate-400'}`}></span>
                        {cat.activeJobs > 0 ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => { setEditingCat(cat.name); setEditName(cat.name); }}
                          className="text-slate-400 hover:text-[#10B981] transition-colors p-1.5 rounded-lg hover:bg-slate-800 cursor-pointer"
                          title="Rename"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(cat.name)}
                          disabled={actionLoading === cat.name}
                          className="text-slate-400 hover:text-red-400 transition-colors p-1.5 rounded-lg hover:bg-slate-800 cursor-pointer"
                          title="Delete"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CategoriesPage;
