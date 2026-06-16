import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';

const ProjectDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchProject();
  }, [id]);

  const fetchProject = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/admin/projects/${id}`);
      setProject(res.data?.data || null);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (newStatus) => {
    if (!window.confirm(`Are you sure you want to change status to ${newStatus}?`)) return;
    try {
      await api.put(`/admin/projects/${id}/status`, { status: newStatus });
      fetchProject();
    } catch (e) {
      alert('Failed to update status');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="flex flex-col items-center gap-3">
          <svg className="animate-spin h-8 w-8 text-[#10B981]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="text-slate-400 font-medium">Loading project details...</span>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl text-white font-bold mb-2">Project Not Found</h2>
        <button onClick={() => navigate('/jobs-monitoring')} className="text-[#10B981] hover:underline">Return to Jobs Monitoring</button>
      </div>
    );
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'OPEN': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'IN_PROGRESS': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'COMPLETED': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'CANCELLED': return 'bg-red-500/10 text-red-400 border-red-500/20';
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  const acceptedProposal = project.proposals?.find(p => p.status === 'ACCEPTED');

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <button onClick={() => navigate(-1)} className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-400 transition-colors">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            </button>
            <h1 className="text-2xl font-bold text-white tracking-tight">{project.title}</h1>
          </div>
          <p className="text-sm text-slate-400 pl-11 flex items-center gap-4">
            <span>Posted: {new Date(project.createdAt).toLocaleDateString()}</span>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusBadge(project.status)}`}>
              {project.status.replace('_', ' ')}
            </span>
          </p>
        </div>
        <div className="flex gap-2">
          {project.status !== 'COMPLETED' && (
            <button onClick={() => updateStatus('COMPLETED')} className="px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 rounded-xl font-medium text-sm transition-colors">
              Mark Completed
            </button>
          )}
          {project.status !== 'CANCELLED' && (
            <button onClick={() => updateStatus('CANCELLED')} className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-xl font-medium text-sm transition-colors">
              Cancel Project
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-6 border-b border-slate-800">
        {['overview', 'participants', 'proposals', 'activity'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 text-sm font-medium transition-colors relative ${
              activeTab === tab ? 'text-[#10B981]' : 'text-slate-400 hover:text-slate-300'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
            {activeTab === tab && (
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#10B981] rounded-t-full"></span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Description</h3>
                <p className="text-slate-300 whitespace-pre-wrap text-sm leading-relaxed">{project.description}</p>
                
                {project.skills && project.skills.length > 0 && (
                  <div className="mt-6">
                    <h4 className="text-sm font-medium text-slate-400 mb-2">Required Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {project.skills.map((s, i) => (
                        <span key={i} className="px-3 py-1 bg-slate-800 text-slate-300 rounded-lg text-xs">{s}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {project.milestones && project.milestones.length > 0 && (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Project Milestones</h3>
                  <div className="space-y-4">
                    {project.milestones.map((m, i) => (
                      <div key={i} className="flex justify-between items-center p-4 bg-slate-950 rounded-xl border border-slate-800">
                        <div>
                          <div className="text-white font-medium text-sm">{m.title}</div>
                          <div className="text-slate-500 text-xs mt-1">{m.description || 'No description'}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-[#10B981] font-semibold">${m.amount}</div>
                          <div className={`text-xs mt-1 ${m.status === 'COMPLETED' ? 'text-emerald-400' : 'text-amber-400'}`}>
                            {m.status || 'PENDING'}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-6">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Project Details</h3>
                <dl className="space-y-4 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-slate-500">Category</dt>
                    <dd className="text-white font-medium">{project.category || 'N/A'}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-slate-500">Budget</dt>
                    <dd className="text-[#10B981] font-bold">${project.budget}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-slate-500">Type</dt>
                    <dd className="text-white font-medium">{project.projectType || 'Fixed Price'}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-slate-500">Total Proposals</dt>
                    <dd className="text-white font-medium">{project.proposals?.length || 0}</dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'participants' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-6">Client Details</h3>
              {project.client ? (
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 bg-slate-800 rounded-full flex items-center justify-center text-xl font-bold text-slate-300">
                    {project.client.firstName?.[0]}{project.client.lastName?.[0]}
                  </div>
                  <div>
                    <h4 className="text-white font-semibold text-lg">{project.client.firstName} {project.client.lastName}</h4>
                    <p className="text-slate-400 text-sm">{project.client.email}</p>
                    <button className="mt-2 text-xs text-[#10B981] hover:underline">View Full Profile</button>
                  </div>
                </div>
              ) : (
                <p className="text-slate-500 text-sm">Client data not available.</p>
              )}
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-6">Hired Freelancer</h3>
              {acceptedProposal ? (
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 bg-slate-800 rounded-full flex items-center justify-center text-xl font-bold text-slate-300">
                    {acceptedProposal.freelancer?.user?.firstName?.[0]}{acceptedProposal.freelancer?.user?.lastName?.[0]}
                  </div>
                  <div>
                    <h4 className="text-white font-semibold text-lg">{acceptedProposal.freelancer?.user?.firstName} {acceptedProposal.freelancer?.user?.lastName}</h4>
                    <p className="text-slate-400 text-sm">{acceptedProposal.freelancer?.user?.email}</p>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="text-xs text-amber-400 font-medium">Hired for ${acceptedProposal.bidAmount}</span>
                    </div>
                    <button className="mt-2 text-xs text-[#10B981] hover:underline">View Full Profile</button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 bg-slate-950 rounded-xl border border-slate-800 border-dashed">
                  <p className="text-slate-500 text-sm">No freelancer has been hired for this project yet.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'proposals' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-400">
                <thead className="bg-slate-950/50 text-xs uppercase font-semibold text-slate-500">
                  <tr>
                    <th className="px-6 py-4">Freelancer</th>
                    <th className="px-6 py-4">Bid Amount</th>
                    <th className="px-6 py-4">Delivery Time</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Submitted</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {!project.proposals || project.proposals.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-8 text-center text-slate-500">
                        No proposals submitted yet.
                      </td>
                    </tr>
                  ) : (
                    project.proposals.map((prop) => (
                      <tr key={prop.id} className={`hover:bg-slate-800/30 transition-colors group ${prop.status === 'ACCEPTED' ? 'bg-emerald-500/5' : ''}`}>
                        <td className="px-6 py-4 font-medium text-white">
                          {prop.freelancer?.user?.firstName} {prop.freelancer?.user?.lastName}
                        </td>
                        <td className="px-6 py-4 font-semibold text-white">${prop.bidAmount}</td>
                        <td className="px-6 py-4">{prop.estimatedTime} days</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
                            prop.status === 'ACCEPTED' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                            prop.status === 'REJECTED' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 
                            'bg-amber-500/10 text-amber-400 border-amber-500/20'
                          }`}>
                            {prop.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">{new Date(prop.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'activity' && (() => {
          const projectSubmissions = project.projectSubmissions || (project.files && project.files.length > 0 ? [{
            createdAt: project.createdAt,
            notes: 'Project files and attachments',
            files: project.files
          }] : []);

          return (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
             <div className="flex justify-between items-center mb-6">
               <h3 className="text-lg font-semibold text-white">Full Project Activity</h3>
               <span className="text-xs text-slate-400 bg-slate-800 px-2.5 py-1 rounded-full">Secure & Confidential</span>
             </div>
             
             {/* Initial Project Files */}
             {project.files && project.files.length > 0 && (
               <div className="mb-8 p-4 bg-slate-950 rounded-xl border border-slate-800">
                 <h4 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
                   <svg className="h-4 w-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
                   Initial Client Requirements & Files
                 </h4>
                 <div className="flex flex-wrap gap-2">
                   {project.files.map((file, idx) => (
                     <a key={idx} href={file.url} target="_blank" rel="noreferrer" className="text-xs bg-slate-800 hover:bg-slate-700 text-blue-400 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-2">
                       {file.name || `Attachment ${idx + 1}`}
                     </a>
                   ))}
                 </div>
               </div>
             )}

             {/* Chronological Timeline */}
             {project.timeline && project.timeline.length > 0 ? (
                <div className="space-y-6 border-l-2 border-slate-800 ml-3 pl-6">
                  {project.timeline.map((event, i) => (
                    <div key={i} className="relative">
                      <div className="absolute -left-[31px] top-1 h-3 w-3 bg-[#10B981] rounded-full border-4 border-slate-900"></div>
                      <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="text-sm font-medium text-white flex items-center gap-2">
                            {event.title.includes('Review') || event.title.includes('Approve') ? 'Client Action:' : 'Update:'} {event.title}
                          </h4>
                          <span className="text-xs text-slate-400">{new Date(event.time).toLocaleString()}</span>
                        </div>
                        <p className="text-sm text-slate-300 whitespace-pre-wrap">{event.description || event.desc || event.notes || 'No description provided.'}</p>
                        
                        {event.files && event.files.length > 0 && (
                          <div className="mt-3 flex gap-2">
                            {event.files.map((file, idx) => (
                              <a key={idx} href={file.url} target="_blank" rel="noreferrer" className="text-xs bg-slate-800 hover:bg-slate-700 text-emerald-400 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-2">
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
                                Attached File {idx + 1}
                              </a>
                            ))}
                          </div>
                        )}
                        {event.link && (
                          <div className="mt-2">
                            <a href={event.link} target="_blank" rel="noreferrer" className="text-xs text-blue-400 hover:underline">
                              View Submission Link
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
             ) : (
                <div className="text-center py-8">
                  <p className="text-slate-500">No activity timeline available for this project yet.</p>
                </div>
             )}

             {/* Milestones / Progress Steps Breakdown */}
             {project.milestones && project.milestones.length > 0 && (
               <div className="mt-8 pt-8 border-t border-slate-800">
                 <div className="flex justify-between items-center mb-4">
                   <h3 className="text-lg font-semibold text-white">Milestones Progress</h3>
                   <span className="text-xs font-bold text-[#10B981]">{project.progress || 0}% Complete</span>
                 </div>
                 <div className="w-full h-2 bg-slate-800 rounded-full mb-6 overflow-hidden">
                   <div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-500" style={{ width: `${project.progress || 0}%` }}></div>
                 </div>
                 <div className="space-y-3">
                   {project.milestones.map((m, i) => {
                     const statusColors = {
                       'Completed': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
                       'In Progress': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
                       'Submitted': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
                       'Revision': 'bg-orange-500/10 text-orange-400 border-orange-500/20',
                       'Pending': 'bg-slate-500/10 text-slate-400 border-slate-500/20',
                     };
                     const colorClass = statusColors[m.status] || statusColors['Pending'];
                     return (
                       <div key={m.id || i} className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-800">
                         <div className="flex items-center gap-3">
                           <span className="text-xs text-slate-500 font-mono w-5">{i + 1}.</span>
                           <div>
                             <div className="text-sm text-white font-medium">{m.title}</div>
                             {m.price && <div className="text-xs text-slate-500 mt-0.5">${Number(m.price).toFixed(2)}</div>}
                           </div>
                         </div>
                         <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${colorClass}`}>
                           {m.status || 'Pending'}
                         </span>
                       </div>
                     );
                   })}
                 </div>
               </div>
             )}

             {project.disputes && project.disputes.length > 0 && (
               <div className="mt-8 pt-8 border-t border-slate-800">
                 <h3 className="text-lg font-semibold text-white mb-6">Disputes</h3>
                 <div className="space-y-4">
                   {project.disputes.map(dispute => (
                     <div key={dispute.id} className="bg-slate-950 p-4 rounded-xl border border-red-500/20">
                       <div className="flex justify-between items-start mb-2">
                         <div className="flex items-center gap-2">
                           <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20">
                             {dispute.status}
                           </span>
                           <span className="text-slate-400 text-xs">
                             Opened by: {dispute.initiator?.firstName} {dispute.initiator?.lastName}
                           </span>
                         </div>
                         <span className="text-slate-500 text-xs">{new Date(dispute.createdAt).toLocaleDateString()}</span>
                       </div>
                       <h4 className="text-white font-medium text-sm mt-2">Reason: {dispute.reason}</h4>
                       <p className="text-slate-400 text-sm mt-1">{dispute.description}</p>
                       {dispute.resolution && (
                         <div className="mt-3 p-3 bg-emerald-500/5 rounded-lg border border-emerald-500/10">
                           <h5 className="text-xs font-semibold text-emerald-400 mb-1">Resolution</h5>
                           <p className="text-slate-300 text-sm">{dispute.resolution}</p>
                         </div>
                       )}
                       {dispute.status === 'PENDING' && (
                         <div className="mt-4 flex gap-2">
                           <button onClick={() => navigate('/disputes')} className="text-xs px-3 py-1.5 bg-slate-800 text-slate-300 rounded hover:bg-slate-700 transition-colors">
                             Manage Dispute
                           </button>
                         </div>
                       )}
                     </div>
                   ))}
                 </div>
               </div>
             )}

             <div className="mt-8 pt-8 border-t border-slate-800">
               <h3 className="text-lg font-semibold text-white mb-6">Reviews</h3>
               {project.reviews && project.reviews.length > 0 ? (
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   {project.reviews.map(review => (
                     <div key={review.id} className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                       <div className="flex justify-between items-start mb-2">
                         <div className="font-medium text-sm text-white">
                           {review.reviewer?.firstName} → {review.reviewee?.firstName}
                         </div>
                         <div className="flex gap-0.5">
                           {[...Array(5)].map((_, i) => (
                             <svg key={i} className={`h-3 w-3 ${i < review.rating ? 'text-amber-400' : 'text-slate-700'}`} fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                           ))}
                         </div>
                       </div>
                       <p className="text-slate-400 text-sm">{review.comment}</p>
                     </div>
                   ))}
                 </div>
               ) : (
                 <p className="text-slate-500 text-sm">No reviews yet.</p>
               )}
             </div>
          </div>
          );
        })()}
      </div>
    </div>
  );
};

export default ProjectDetailsPage;
