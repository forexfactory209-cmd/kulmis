import React, { useState, useEffect } from 'react';
import { getReviews } from '../../services/adminService';

const ReviewsPage = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await getReviews();
      setReviews(res.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating) => {
    return (
      <div className="flex gap-0.5">
        {[...Array(5)].map((_, i) => (
          <svg key={i} className={`h-4 w-4 ${i < rating ? 'text-[#F59E0B]' : 'text-slate-700'}`} fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    );
  };

  const filtered = reviews.filter(rev => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      rev.reviewer?.firstName?.toLowerCase().includes(q) ||
      rev.reviewer?.lastName?.toLowerCase().includes(q) ||
      rev.reviewee?.firstName?.toLowerCase().includes(q) ||
      rev.reviewee?.lastName?.toLowerCase().includes(q) ||
      rev.comment?.toLowerCase().includes(q) ||
      rev.project?.title?.toLowerCase().includes(q)
    );
  });

  // Stats
  const avgRating = reviews.length > 0 ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : '0.0';
  const fiveStars = reviews.filter(r => r.rating === 5).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Reviews</h1>
          <p className="text-sm text-slate-400 mt-1">Monitor platform reviews. {reviews.length} total reviews.</p>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="text-xs text-slate-500 uppercase font-semibold mb-2">Total Reviews</div>
          <div className="text-3xl font-bold text-white">{reviews.length}</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="text-xs text-slate-500 uppercase font-semibold mb-2">Average Rating</div>
          <div className="text-3xl font-bold text-amber-400 flex items-center gap-2">
            {avgRating}
            <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="text-xs text-slate-500 uppercase font-semibold mb-2">5-Star Reviews</div>
          <div className="text-3xl font-bold text-emerald-400">{fiveStars}</div>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
          <div className="flex items-center gap-4">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input 
                type="text" 
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search reviews..." 
                className="pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981] w-64 transition-all"
              />
            </div>
          </div>
          <span className="text-xs text-slate-500">{filtered.length} results</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-400">
            <thead className="bg-slate-950/50 text-xs uppercase font-semibold text-slate-500">
              <tr>
                <th className="px-6 py-4">Reviewer</th>
                <th className="px-6 py-4">Reviewee</th>
                <th className="px-6 py-4">Project</th>
                <th className="px-6 py-4">Rating</th>
                <th className="px-6 py-4 w-1/4">Comment</th>
                <th className="px-6 py-4">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-slate-500">
                    <div className="flex justify-center items-center gap-2">
                      <svg className="animate-spin h-5 w-5 text-[#10B981]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Loading reviews...
                    </div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-slate-500">
                    {search ? 'No reviews match your search.' : 'No reviews found.'}
                  </td>
                </tr>
              ) : (
                filtered.map((rev) => (
                  <tr key={rev.id} className="hover:bg-slate-800/30 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500/20 to-blue-600/20 flex items-center justify-center flex-shrink-0">
                          <span className="text-blue-400 font-bold text-xs">{rev.reviewer?.firstName?.[0]}</span>
                        </div>
                        <div>
                          <div className="font-medium text-white">{rev.reviewer?.firstName} {rev.reviewer?.lastName}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 flex items-center justify-center flex-shrink-0">
                          <span className="text-emerald-400 font-bold text-xs">{rev.reviewee?.firstName?.[0]}</span>
                        </div>
                        <div>
                          <div className="font-medium text-white">{rev.reviewee?.firstName} {rev.reviewee?.lastName}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-slate-300 text-xs font-medium">{rev.project?.title || '—'}</span>
                    </td>
                    <td className="px-6 py-4">
                      {renderStars(Math.round(rev.rating))}
                    </td>
                    <td className="px-6 py-4">
                      <p className="line-clamp-2 text-slate-300">{rev.comment || '—'}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs text-slate-500">{new Date(rev.createdAt).toLocaleDateString()}</span>
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

export default ReviewsPage;
