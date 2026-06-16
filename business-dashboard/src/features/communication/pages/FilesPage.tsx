import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../../store/useAuthStore';

interface FileItem {
  id: string;
  name: string;
  type: string;
  size: string;
  uploaded: string;
  by: string;
  avatar: number;
  color: string;
}

const FilesPage: React.FC = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [files, setFiles] = useState<FileItem[]>([]);
  const [search, setSearch] = useState('');
  const { user } = useAuthStore();

  useEffect(() => {
    const saved = localStorage.getItem('business_files');
    if (saved) {
      setFiles(JSON.parse(saved));
    } else {
      const defaultFiles = [
        { id: '1', name: 'Website Promo v3.mp4', type: 'video', size: '124 MB', uploaded: 'May 12, 2024', by: 'Hassan Ali', avatar: 45, color: '#8B5CF6' },
        { id: '2', name: 'Brand Guidelines.pdf', type: 'document', size: '4.2 MB', uploaded: 'May 11, 2024', by: 'Abdi Rahman', avatar: 42, color: '#EF4444' },
      ];
      setFiles(defaultFiles);
      localStorage.setItem('business_files', JSON.stringify(defaultFiles));
    }
  }, []);

  const saveFiles = (newFiles: FileItem[]) => {
    setFiles(newFiles);
    localStorage.setItem('business_files', JSON.stringify(newFiles));
  };

  const handleUploadClick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.onchange = (e: any) => {
      const file = e.target.files[0];
      if (file) {
        const type = file.type.includes('video') ? 'video' : file.type.includes('image') ? 'image' : 'document';
        const color = type === 'video' ? '#8B5CF6' : type === 'image' ? '#3B82F6' : '#EF4444';
        const newFile: FileItem = {
          id: Date.now().toString(),
          name: file.name,
          type,
          size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
          uploaded: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          by: user?.firstName ? `${user.firstName} ${user.lastName}` : 'You',
          avatar: 40,
          color
        };
        saveFiles([newFile, ...files]);
      }
    };
    input.click();
  };

  const handleDelete = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (window.confirm('Are you sure you want to delete this file?')) {
      saveFiles(files.filter(f => f.id !== id));
    }
  };

  const typeIcons: Record<string, string> = {
    video: 'M23 7l-7 5 7 5V7z M1 5h15v14H1z',
    document: 'M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8',
    spreadsheet: 'M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z M14 2v6h6 M8 13h2 M8 17h2 M14 13h2 M14 17h2',
    image: 'M5 3h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2z M8.5 10a1.5 1.5 0 100-3 1.5 1.5 0 000 3z M21 15l-5-5L5 21',
    design: 'M12 19l7-7 3 3-7 7-3-3z M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z M2 2l7.586 7.586',
  };

  const filteredFiles = files.filter(f => f.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ color: '#0F172A', fontSize: 24, fontWeight: 700 }}>Files</h1>
          <p style={{ color: '#64748B', marginTop: 4 }}>Centralized file management for all project deliverables.</p>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <svg style={{ position: 'absolute', left: 12, top: 10, color: '#94A3B8' }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search files..." style={{ width: 200, padding: '8px 12px 8px 36px', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 8, fontSize: 13 }} />
          </div>
          <div style={{ display: 'flex', border: '1px solid #E2E8F0', borderRadius: 8, overflow: 'hidden' }}>
            <button onClick={() => setViewMode('grid')} style={{ padding: '6px 10px', background: viewMode === 'grid' ? '#F1F5F9' : '#FFFFFF', border: 'none', cursor: 'pointer', color: viewMode === 'grid' ? '#0F172A' : '#94A3B8' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
            </button>
            <button onClick={() => setViewMode('list')} style={{ padding: '6px 10px', background: viewMode === 'list' ? '#F1F5F9' : '#FFFFFF', border: 'none', borderLeft: '1px solid #E2E8F0', cursor: 'pointer', color: viewMode === 'list' ? '#0F172A' : '#94A3B8' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
            </button>
          </div>
          <button onClick={handleUploadClick} style={{ background: '#10B981', color: 'white', border: 'none', padding: '8px 16px', borderRadius: 8, fontWeight: 600, cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg>
            Upload
          </button>
        </div>
      </div>

      {/* File Grid/List */}
      {viewMode === 'grid' ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 20, overflowY: 'auto', paddingBottom: 40 }} className="custom-scrollbar">
          {filteredFiles.map((file) => (
            <div key={file.id} style={{
              background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 16, padding: 20,
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)', cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s',
              position: 'relative'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 12px rgba(0,0,0,0.08)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)'; }}
            >
              <button onClick={(e) => handleDelete(file.id, e)} style={{ position: 'absolute', top: 12, right: 12, background: 'rgba(239, 68, 68, 0.1)', color: '#EF4444', border: 'none', width: 24, height: 24, borderRadius: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: `${file.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={file.color} strokeWidth="2"><path d={typeIcons[file.type] || typeIcons.document} /></svg>
              </div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{file.name}</div>
              <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 4 }}>{file.size}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12, paddingTop: 12, borderTop: '1px solid #E2E8F0' }}>
                <div style={{ width: 20, height: 20, borderRadius: 10, backgroundImage: `url(https://i.pravatar.cc/150?u=${file.avatar})`, backgroundSize: 'cover' }} />
                <span style={{ fontSize: 12, color: '#64748B' }}>{file.by}</span>
                <span style={{ marginLeft: 'auto', fontSize: 11, color: '#CBD5E1' }}>{file.uploaded}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 16, overflow: 'hidden', flex: 1, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
            <thead style={{ background: '#F8FAFC' }}>
              <tr style={{ borderBottom: '1px solid #E2E8F0' }}>
                <th style={{ padding: '16px 24px', color: '#64748B', fontSize: 12, fontWeight: 600, textTransform: 'uppercase' }}>File</th>
                <th style={{ padding: '16px 16px', color: '#64748B', fontSize: 12, fontWeight: 600, textTransform: 'uppercase' }}>Type</th>
                <th style={{ padding: '16px 16px', color: '#64748B', fontSize: 12, fontWeight: 600, textTransform: 'uppercase' }}>Size</th>
                <th style={{ padding: '16px 16px', color: '#64748B', fontSize: 12, fontWeight: 600, textTransform: 'uppercase' }}>Uploaded By</th>
                <th style={{ padding: '16px 16px', color: '#64748B', fontSize: 12, fontWeight: 600, textTransform: 'uppercase' }}>Date</th>
                <th style={{ padding: '16px 24px', color: '#64748B', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredFiles.map((file) => (
                <tr key={file.id} style={{ borderBottom: '1px solid #E2E8F0', cursor: 'pointer' }} onMouseEnter={(e) => e.currentTarget.style.background = '#F8FAFC'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 36, height: 36, borderRadius: 8, background: `${file.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={file.color} strokeWidth="2"><path d={typeIcons[file.type] || typeIcons.document} /></svg>
                      </div>
                      <span style={{ fontWeight: 600, color: '#0F172A', fontSize: 14 }}>{file.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: '16px 16px' }}><span style={{ background: '#F1F5F9', color: '#475569', padding: '3px 8px', borderRadius: 6, fontSize: 12, fontWeight: 600, textTransform: 'capitalize' }}>{file.type}</span></td>
                  <td style={{ padding: '16px 16px', color: '#475569', fontSize: 13 }}>{file.size}</td>
                  <td style={{ padding: '16px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{ width: 20, height: 20, borderRadius: 10, backgroundImage: `url(https://i.pravatar.cc/150?u=${file.avatar})`, backgroundSize: 'cover' }} />
                      <span style={{ fontSize: 13, color: '#475569' }}>{file.by}</span>
                    </div>
                  </td>
                  <td style={{ padding: '16px 16px', color: '#94A3B8', fontSize: 13 }}>{file.uploaded}</td>
                  <td style={{ padding: '16px 24px', textAlign: 'right', display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                    <button style={{ background: 'transparent', border: '1px solid #E2E8F0', color: '#0F172A', padding: '5px 10px', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>Download</button>
                    <button onClick={(e) => handleDelete(file.id, e)} style={{ background: 'rgba(239, 68, 68, 0.1)', border: 'none', color: '#EF4444', padding: '5px 10px', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default FilesPage;
