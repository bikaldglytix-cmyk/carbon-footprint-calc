"use client";
import { useState, useEffect, useMemo, Fragment } from 'react';
import { supabase } from '../../lib/supabase';
import { questions } from '../../data/questions';
import { asset } from '../../lib/asset';

// Load the ATL logo once and cache it as a data URI for embedding in the
// client-generated PDFs (mirrors what the old server route did via fs).
let _logoPromise;
function loadLogoDataUri() {
  if (!_logoPromise) {
    _logoPromise = fetch(asset('/atl-logo.png'))
      .then((res) => (res.ok ? res.blob() : null))
      .then((blob) =>
        blob
          ? new Promise((resolve) => {
              const reader = new FileReader();
              reader.onloadend = () => resolve(reader.result);
              reader.onerror = () => resolve(null);
              reader.readAsDataURL(blob);
            })
          : null
      )
      .catch(() => null);
  }
  return _logoPromise;
}

// Trigger a browser download for a generated Blob.
function triggerDownload(blob, filename) {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}

const safeName = (name) => (name || 'Traveler').replace(/\s+/g, '_');

const CURRENCY_SYMBOLS = { NPR: 'Rs', INR: '₹', USD: '$', EUR: '€', GBP: '£', AUD: 'A$' };
const formatAmount = (sub) => {
  let amt = Number(sub.amount) || 0;
  // Legacy rows for detailed reports before amount column existed should default to 200
  if (amt === 0 && sub.location !== 'Donation/Support' && sub.payment_status !== 'general') {
    amt = 200;
  }
  return `${CURRENCY_SYMBOLS[sub.currency || 'NPR'] || 'Rs'} ${amt.toLocaleString()}`;
};

const METHOD_LABELS = { fonepay: 'Fonepay', bank: 'Bank', international: 'International' };
const METHOD_COLORS = {
  fonepay: { bg: '#F5F3FF', fg: '#6D28D9', border: '#DDD6FE' },
  bank: { bg: '#EFF6FF', fg: '#1D4ED8', border: '#BFDBFE' },
  international: { bg: '#FFF7ED', fg: '#C2410C', border: '#FED7AA' },
};

// How a non-donation row entered the funnel: finished the quiz only, asked
// for the paid report, or had that payment verified.
const USER_NATURE = {
  general: { label: 'Check-up only', bg: '#F1F5F9', fg: '#475569', border: '#E2E8F0' },
  pending: { label: 'Report requested', bg: '#FEF3C7', fg: '#92400E', border: '#FDE68A' },
  verified: { label: 'Report verified', bg: '#DCFCE7', fg: '#166534', border: '#BBF7D0' },
};
const natureOf = (sub) => USER_NATURE[sub.payment_status] || USER_NATURE.general;

export default function AdminPage() {
  const [session, setSession] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submissions, setSubmissions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  // Dashboard state
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterLoc, setFilterLoc] = useState('all');
  const [filterLevel, setFilterLevel] = useState('all');
  const [expandedRow, setExpandedRow] = useState(null);
  
  // Sorting state
  const [sortConfig, setSortConfig] = useState({ key: 'created_at', direction: 'desc' });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setIsAuthChecking(false);
      if (session) fetchSubmissions();
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchSubmissions();
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
    } catch (err) {
      setError(err.message || 'Invalid login credentials');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const fetchSubmissions = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('calculator_submissions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSubmissions(data || []);
    } catch (err) {
      console.error('Error fetching submissions:', err);
      setError('Failed to load data. Ensure the table exists and RLS allows reading.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    if (newStatus === 'verified') {
      if (!window.confirm('Are you sure the payment is verified?')) return;
    } else if (newStatus === 'pending') {
      if (!window.confirm('Are you sure you want to revert this payment to pending?')) return;
    }

    try {
      const updateData = { payment_status: newStatus };
      const targetSub = submissions.find(s => s.id === id);
      
      if (newStatus === 'verified' && !targetSub.cert_id) {
        const existingIds = submissions
          .map(s => s.cert_id)
          .filter(cid => cid && cid.startsWith('CFC-'))
          .map(cid => parseInt(cid.replace('CFC-', ''), 10))
          .filter(n => !isNaN(n));
        const maxId = existingIds.length > 0 ? Math.max(...existingIds) : 0;
        updateData.cert_id = `CFC-${String(maxId + 1).padStart(4, '0')}`;
      }

      const { error } = await supabase
        .from('calculator_submissions')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;
      setSubmissions(submissions.map(sub => 
        sub.id === id ? { ...sub, ...updateData } : sub
      ));
    } catch (err) {
      console.error('Error updating status:', err);
      alert('Failed to update status. Check permissions.');
    }
  };

  // Supporters tab: one-click verify / revoke for donation rows.
  const handleToggleVerification = (id, currentStatus) => {
    handleStatusChange(id, currentStatus === 'verified' ? 'pending' : 'verified');
  };

  // Detailed Reports tab: track whether the report email went out.
  const handleEmailSentChange = async (id, sent) => {
    try {
      const { error } = await supabase
        .from('calculator_submissions')
        .update({ email_sent: sent })
        .eq('id', id);
      if (error) throw error;
      setSubmissions(submissions.map(sub =>
        sub.id === id ? { ...sub, email_sent: sent } : sub
      ));
    } catch (err) {
      console.error('Error updating email status:', err);
      alert('Failed to update email status. If the email_sent column is missing, run setup_public_access.sql in the Supabase SQL editor.');
    }
  };

  const toggleRow = (id) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this submission?')) return;
    try {
      const { error } = await supabase.from('calculator_submissions').delete().eq('id', id);
      if (error) throw error;
      setSubmissions(submissions.filter(sub => sub.id !== id));
      if (expandedRow === id) setExpandedRow(null);
    } catch (err) {
      console.error('Error deleting:', err);
      alert('Failed to delete submission.');
    }
  };
  
  const handleSort = (key) => {
    let direction = 'desc';
    if (sortConfig.key === key && sortConfig.direction === 'desc') {
      direction = 'asc';
    }
    setSortConfig({ key, direction });
  };

  const [isDownloading, setIsDownloading] = useState(false);
  const [isDownloadingMin, setIsDownloadingMin] = useState(false);
  const [isDownloadingCert, setIsDownloadingCert] = useState(false);
  const [isDownloadingCertPng, setIsDownloadingCertPng] = useState(false);

  const handleDownloadPdf = async (sub) => {
    setIsDownloading(true);
    try {
      const [reactPdfModule, { default: ClimateReportPDF }, logoDataUri] = await Promise.all([
        import('@react-pdf/renderer'),
        import('../../components/ClimateReportPDF'),
        loadLogoDataUri(),
      ]);
      const pdf = reactPdfModule.pdf || reactPdfModule.default?.pdf || reactPdfModule.default;
      const blob = await pdf(<ClimateReportPDF submission={sub} logoDataUri={logoDataUri} />).toBlob();
      triggerDownload(blob, `Climate_Report_${safeName(sub.name)}.pdf`);
    } catch (err) {
      console.error(err);
      alert('Error downloading PDF');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDownloadMinimal = async (sub) => {
    setIsDownloadingMin(true);
    try {
      const [reactPdfModule, { default: ClimateReportMinimal }, logoDataUri] = await Promise.all([
        import('@react-pdf/renderer'),
        import('../../components/ClimateReportMinimal'),
        loadLogoDataUri(),
      ]);
      const pdf = reactPdfModule.pdf || reactPdfModule.default?.pdf || reactPdfModule.default;
      const blob = await pdf(<ClimateReportMinimal submission={sub} logoDataUri={logoDataUri} />).toBlob();
      triggerDownload(blob, `Climate_Report_Minimal_${safeName(sub.name)}.pdf`);
    } catch (err) {
      console.error(err);
      alert('Error downloading minimal report');
    } finally {
      setIsDownloadingMin(false);
    }
  };

  const handleDownloadCert = async (sub) => {
    setIsDownloadingCert(true);
    try {
      const [reactPdfModule, { default: CertificatePDF }, logoDataUri] = await Promise.all([
        import('@react-pdf/renderer'),
        import('../../components/CertificatePDF'),
        loadLogoDataUri(),
      ]);
      const pdf = reactPdfModule.pdf || reactPdfModule.default?.pdf || reactPdfModule.default;
      const blob = await pdf(<CertificatePDF submission={sub} logoDataUri={logoDataUri} />).toBlob();
      triggerDownload(blob, `Climate_Certificate_${safeName(sub.name)}.pdf`);
    } catch (err) {
      console.error(err);
      alert('Error downloading Certificate');
    } finally {
      setIsDownloadingCert(false);
    }
  };

  const handleDownloadCertPng = async (sub) => {
    setIsDownloadingCertPng(true);
    try {
      const [reactPdfModule, { default: CertificatePDF }, logoDataUri] = await Promise.all([
        import('@react-pdf/renderer'),
        import('../../components/CertificatePDF'),
        loadLogoDataUri(),
      ]);
      const pdf = reactPdfModule.pdf || reactPdfModule.default?.pdf || reactPdfModule.default;
      const blob = await pdf(<CertificatePDF submission={sub} logoDataUri={logoDataUri} />).toBlob();
      
      const pdfjsLib = await import('pdfjs-dist');
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

      const arrayBuffer = await blob.arrayBuffer();
      const pdfDoc = await pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;
      const page = await pdfDoc.getPage(1);

      const viewport = page.getViewport({ scale: 3.0 });
      const canvas = document.createElement('canvas');
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const ctx = canvas.getContext('2d');

      await page.render({ canvasContext: ctx, viewport }).promise;

      canvas.toBlob((pngBlob) => {
        triggerDownload(pngBlob, `Climate_Certificate_${safeName(sub.name)}.png`);
      }, 'image/png');

    } catch (err) {
      console.error(err);
      alert('Error downloading Certificate PNG');
    } finally {
      setIsDownloadingCertPng(false);
    }
  };

  const handleExportGeneralCsv = () => {
    if (sortedAndFilteredGeneral.length === 0) {
      alert("No data to export");
      return;
    }
    const headers = ["Date", "Name", "Location", "Email", "Phone", "Total Emissions (t CO2e)"];
    const rows = sortedAndFilteredGeneral.map(sub => [
      new Date(sub.created_at).toLocaleDateString(),
      `"${(sub.name || '').replace(/"/g, '""')}"`,
      `"${(sub.location || '').replace(/"/g, '""')}"`,
      `"${(sub.email || '').replace(/"/g, '""')}"`,
      `"${(sub.phone || '').replace(/"/g, '""')}"`,
      sub.total_emissions.toFixed(2)
    ]);
    const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    triggerDownload(blob, 'all_users_export.csv');
  };

  const calculatorSubmissions = submissions.filter(sub => sub.location !== 'Donation/Support' && sub.payment_status !== 'general');
  const allCheckupSubmissions = submissions.filter(sub => sub.location !== 'Donation/Support');
  const supportSubmissions = submissions.filter(sub => sub.location === 'Donation/Support');

  const sortedAndFilteredSubmissions = useMemo(() => {
    let filtered = calculatorSubmissions.filter(sub => {
      const matchesSearch = sub.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            sub.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            sub.phone?.includes(searchQuery);
      const matchesLoc = filterLoc === 'all' || sub.location?.toLowerCase().includes(filterLoc.toLowerCase());
      let matchesLevel = true;
      if (filterLevel === 'high') matchesLevel = sub.total_emissions > 2.0;
      if (filterLevel === 'low') matchesLevel = sub.total_emissions <= 2.0;
      return matchesSearch && matchesLoc && matchesLevel;
    });

    if (sortConfig) {
      filtered.sort((a, b) => {
        let valA = a[sortConfig.key];
        let valB = b[sortConfig.key];
        
        if (sortConfig.key === 'user') {
          valA = a.name;
          valB = b.name;
        }

        if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
        if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return filtered;
  }, [calculatorSubmissions, searchQuery, filterLoc, filterLevel, sortConfig]);

  const sortedAndFilteredGeneral = useMemo(() => {
    let filtered = allCheckupSubmissions.filter(sub => {
      const matchesSearch = sub.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            sub.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            sub.phone?.includes(searchQuery);
      return matchesSearch;
    });

    if (sortConfig) {
      filtered.sort((a, b) => {
        let valA = a[sortConfig.key];
        let valB = b[sortConfig.key];
        if (sortConfig.key === 'user') {
          valA = a.name;
          valB = b.name;
        }
        if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
        if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return filtered;
  }, [allCheckupSubmissions, searchQuery, sortConfig]);

  // Overview stats cover every check-up (the All Users data); detailed report
  // requests (pending + verified) are the paid subset shown as their own card.
  const totalSubmissions = allCheckupSubmissions.length;
  const reportSubmissions = calculatorSubmissions.length;
  const avgEmissions = totalSubmissions ? (allCheckupSubmissions.reduce((acc, sub) => acc + (sub.total_emissions || 0), 0) / totalSubmissions).toFixed(2) : 0;
  
  // Verified funds, kept separate per currency — mixed-currency sums are meaningless.
  const verifiedFundsByCurrency = submissions
    .filter(sub => sub.payment_status === 'verified')
    .reduce((acc, sub) => {
      const cur = sub.currency || 'NPR';
      let amt = Number(sub.amount) || 0;
      // Legacy rows for detailed reports before amount column existed should default to 200
      if (amt === 0 && sub.location !== 'Donation/Support' && sub.payment_status !== 'general') {
        amt = 200;
      }
      acc[cur] = (acc[cur] || 0) + amt;
      return acc;
    }, {});
  const revenueDisplay = Object.entries(verifiedFundsByCurrency)
    .filter(([, total]) => total > 0)
    .map(([cur, total]) => `${CURRENCY_SYMBOLS[cur] || cur} ${total.toLocaleString()}`)
    .join('  ·  ') || 'Rs 0';

  const locDistribution = allCheckupSubmissions.reduce((acc, sub) => {
    const loc = sub.location || 'Unknown';
    acc[loc] = (acc[loc] || 0) + 1;
    return acc;
  }, {});
  
  const maxLocCount = Math.max(...Object.values(locDistribution), 1);

  if (isAuthChecking) {
    return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F8FAFC' }}>Loading Secure Environment...</div>;
  }

  if (!session) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F8FAFC', fontFamily: 'Inter, sans-serif' }}>
        <div style={{ backgroundColor: 'white', padding: '48px', borderRadius: '16px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', width: '100%', maxWidth: '420px', border: '1px solid #E2E8F0' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: '#0F172A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
            </div>
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '8px', color: '#0F172A', textAlign: 'center' }}>Admin Portal</h1>
          <p style={{ color: '#64748B', marginBottom: '32px', fontSize: '14px', textAlign: 'center' }}>Enter your credentials to access the dashboard.</p>
          
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '600', color: '#334155', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Email Address</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} style={{ width: '100%', padding: '14px', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '14px', transition: 'border-color 0.2s', outline: 'none' }} placeholder="admin@atl.org" required autoFocus />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '600', color: '#334155', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} style={{ width: '100%', padding: '14px', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '14px', transition: 'border-color 0.2s', outline: 'none' }} placeholder="••••••••" required />
            </div>
            {error && <div style={{ color: '#EF4444', fontSize: '13px', backgroundColor: '#FEF2F2', padding: '12px', borderRadius: '6px', border: '1px solid #FECACA' }}>{error}</div>}
            <button type="submit" disabled={isLoading} style={{ marginTop: '8px', padding: '14px', backgroundColor: '#0F172A', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: isLoading ? 'not-allowed' : 'pointer', transition: 'background-color 0.2s', opacity: isLoading ? 0.8 : 1 }}>
              {isLoading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F8FAFC', display: 'flex', fontFamily: 'Inter, sans-serif' }}>
      
      {/* Sidebar Navigation */}
      <div style={{ width: '260px', backgroundColor: '#0F172A', color: 'white', padding: '32px 24px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ marginBottom: '48px', display: 'flex', alignItems: 'center', gap: '12px' }}>
           <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#38BDF8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
             <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path></svg>
           </div>
           <div>
             <h2 style={{ fontSize: '18px', fontWeight: '700', letterSpacing: '-0.02em', margin: 0 }}>ATL Carbon</h2>
             <p style={{ fontSize: '12px', color: '#94A3B8', margin: 0 }}>Analytics Portal</p>
           </div>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px', flexGrow: 1 }}>
          <button 
            onClick={() => setActiveTab('overview')}
            style={{ display: 'flex', alignItems: 'center', gap: '12px', textAlign: 'left', padding: '12px 16px', borderRadius: '8px', border: 'none', backgroundColor: activeTab === 'overview' ? 'rgba(255,255,255,0.1)' : 'transparent', color: activeTab === 'overview' ? 'white' : '#94A3B8', fontWeight: '500', cursor: 'pointer', transition: 'all 0.2s', fontSize: '14px' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
            Dashboard
          </button>
          <button 
            onClick={() => setActiveTab('reports')}
            style={{ display: 'flex', alignItems: 'center', gap: '12px', textAlign: 'left', padding: '12px 16px', borderRadius: '8px', border: 'none', backgroundColor: activeTab === 'reports' ? 'rgba(255,255,255,0.1)' : 'transparent', color: activeTab === 'reports' ? 'white' : '#94A3B8', fontWeight: '500', cursor: 'pointer', transition: 'all 0.2s', fontSize: '14px' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
            Detailed Reports
          </button>
          <button 
            onClick={() => setActiveTab('supporters')}
            style={{ display: 'flex', alignItems: 'center', gap: '12px', textAlign: 'left', padding: '12px 16px', borderRadius: '8px', border: 'none', backgroundColor: activeTab === 'supporters' ? 'rgba(255,255,255,0.1)' : 'transparent', color: activeTab === 'supporters' ? 'white' : '#94A3B8', fontWeight: '500', cursor: 'pointer', transition: 'all 0.2s', fontSize: '14px' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
            Campaign Supporters
          </button>
          <button 
            onClick={() => setActiveTab('general')}
            style={{ display: 'flex', alignItems: 'center', gap: '12px', textAlign: 'left', padding: '12px 16px', borderRadius: '8px', border: 'none', backgroundColor: activeTab === 'general' ? 'rgba(255,255,255,0.1)' : 'transparent', color: activeTab === 'general' ? 'white' : '#94A3B8', fontWeight: '500', cursor: 'pointer', transition: 'all 0.2s', fontSize: '14px' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
            All Users
          </button>
        </nav>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '24px' }}>
          <button 
            onClick={handleLogout}
            style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%', padding: '12px 16px', backgroundColor: 'transparent', border: 'none', color: '#F87171', fontWeight: '500', cursor: 'pointer', fontSize: '14px', borderRadius: '8px', transition: 'background-color 0.2s' }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(248,113,113,0.1)'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
            Sign Out
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        
        {/* Top Header Bar */}
        <header style={{ backgroundColor: 'white', padding: '20px 40px', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 10 }}>
          <h1 style={{ fontSize: '20px', fontWeight: '600', color: '#0F172A', margin: 0 }}>
            {activeTab === 'overview' && 'Dashboard Overview'}
            {activeTab === 'reports' && 'Detailed Report Submissions'}
            {activeTab === 'supporters' && 'Campaign Supporters'}
            {activeTab === 'general' && 'All Users'}
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button 
              onClick={fetchSubmissions}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', backgroundColor: 'white', border: '1px solid #CBD5E1', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '500', color: '#475569', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: isLoading ? 'spin 1s linear infinite' : 'none' }}><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>
              {isLoading ? 'Syncing...' : 'Refresh Data'}
            </button>
          </div>
        </header>

        <main style={{ flex: 1, padding: '40px', overflowY: 'auto' }}>
          {error && <div style={{ backgroundColor: '#FEF2F2', borderLeft: '4px solid #EF4444', color: '#991B1B', padding: '16px 20px', borderRadius: '4px', marginBottom: '24px', fontSize: '14px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>{error}</div>}

          {activeTab === 'overview' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px' }}>
                <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                    <h3 style={{ fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748B', fontWeight: '600', margin: 0 }}>Total Submissions</h3>
                    <div style={{ padding: '6px', backgroundColor: '#F1F5F9', borderRadius: '6px', color: '#475569' }}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg></div>
                  </div>
                  <p style={{ fontSize: '36px', fontWeight: '700', color: '#0F172A', margin: 0, lineHeight: 1 }}>{totalSubmissions}</p>
                </div>
                <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                    <h3 style={{ fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748B', fontWeight: '600', margin: 0 }}>Detailed Reports</h3>
                    <div style={{ padding: '6px', backgroundColor: '#FEF3C7', borderRadius: '6px', color: '#D97706' }}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg></div>
                  </div>
                  <p style={{ fontSize: '36px', fontWeight: '700', color: '#D97706', margin: 0, lineHeight: 1 }}>{reportSubmissions}</p>
                </div>
                <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                    <h3 style={{ fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748B', fontWeight: '600', margin: 0 }}>Avg Footprint</h3>
                    <div style={{ padding: '6px', backgroundColor: '#ECFDF5', borderRadius: '6px', color: '#10B981' }}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg></div>
                  </div>
                  <p style={{ fontSize: '36px', fontWeight: '700', color: '#10B981', margin: 0, lineHeight: 1 }}>{avgEmissions} <span style={{fontSize: '14px', fontWeight: '500', color: '#64748B'}}>t CO₂e</span></p>
                </div>
                <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                    <h3 style={{ fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748B', fontWeight: '600', margin: 0 }}>Verified Revenue</h3>
                    <div style={{ padding: '6px', backgroundColor: '#EFF6FF', borderRadius: '6px', color: '#3B82F6' }}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg></div>
                  </div>
                  <p style={{ fontSize: '28px', fontWeight: '700', color: '#3B82F6', margin: 0, lineHeight: 1.3, wordBreak: 'break-word' }}>{revenueDisplay}</p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
                <div style={{ backgroundColor: 'white', padding: '32px', borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                  <h3 style={{ fontSize: '16px', color: '#0F172A', fontWeight: '600', margin: '0 0 24px 0' }}>Demographic Distribution (Geographic)</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {Object.entries(locDistribution).sort((a,b) => b[1] - a[1]).map(([loc, count]) => {
                      const widthPct = (count / maxLocCount) * 100;
                      return (
                        <div key={loc} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: '500' }}>
                            <span style={{ color: '#475569', textTransform: 'capitalize' }}>{loc}</span>
                            <span style={{ color: '#0F172A' }}>{count} ({Math.round((count/totalSubmissions)*100)}%)</span>
                          </div>
                          <div style={{ height: '8px', backgroundColor: '#F1F5F9', borderRadius: '4px', overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${widthPct}%`, backgroundColor: '#38BDF8', borderRadius: '4px' }}></div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'reports' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              {/* Search & Filters */}
              <div style={{ display: 'flex', gap: '16px', backgroundColor: 'white', padding: '16px 20px', borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                <div style={{ flex: 1, position: 'relative' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2" style={{ position: 'absolute', left: '12px', top: '12px' }}><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                  <input 
                    type="text" 
                    placeholder="Search by name, email, or phone..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ width: '100%', padding: '10px 14px 10px 36px', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '14px', outline: 'none' }}
                  />
                </div>
                <select value={filterLoc} onChange={(e) => setFilterLoc(e.target.value)} style={{ padding: '10px 14px', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '14px', backgroundColor: 'white', color: '#475569', outline: 'none', cursor: 'pointer' }}>
                  <option value="all">All Locations</option>
                  <option value="mountain">Mountain</option>
                  <option value="hilly">Hilly</option>
                  <option value="terai">Terai</option>
                </select>
                <select value={filterLevel} onChange={(e) => setFilterLevel(e.target.value)} style={{ padding: '10px 14px', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '14px', backgroundColor: 'white', color: '#475569', outline: 'none', cursor: 'pointer' }}>
                  <option value="all">All Emission Levels</option>
                  <option value="high">High (&gt; 2.0t)</option>
                  <option value="low">Low (&lt;= 2.0t)</option>
                </select>
              </div>

              {/* Data Table */}
              <div style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                        <th onClick={() => handleSort('created_at')} style={{ padding: '16px 24px', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748B', fontWeight: '600', cursor: 'pointer' }}>
                          Date {sortConfig.key === 'created_at' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}
                        </th>
                        <th onClick={() => handleSort('user')} style={{ padding: '16px 24px', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748B', fontWeight: '600', cursor: 'pointer' }}>
                          User {sortConfig.key === 'user' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}
                        </th>
                        <th style={{ padding: '16px 24px', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748B', fontWeight: '600' }}>Contact</th>
                        <th onClick={() => handleSort('total_emissions')} style={{ padding: '16px 24px', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748B', fontWeight: '600', cursor: 'pointer' }}>
                          Total (t CO₂e) {sortConfig.key === 'total_emissions' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}
                        </th>
                        <th onClick={() => handleSort('payment_status')} style={{ padding: '16px 24px', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748B', fontWeight: '600', cursor: 'pointer' }}>
                          Payment {sortConfig.key === 'payment_status' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}
                        </th>
                        <th onClick={() => handleSort('email_sent')} style={{ padding: '16px 24px', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748B', fontWeight: '600', cursor: 'pointer' }}>
                          Report Email {sortConfig.key === 'email_sent' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}
                        </th>
                        <th style={{ padding: '16px 24px', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748B', fontWeight: '600', textAlign: 'right' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedAndFilteredSubmissions.length === 0 ? (
                        <tr>
                          <td colSpan="7" style={{ padding: '48px', textAlign: 'center', color: '#94A3B8', fontSize: '14px' }}>
                            {isLoading ? 'Loading submissions...' : 'No matching records found in the database.'}
                          </td>
                        </tr>
                      ) : (
                        sortedAndFilteredSubmissions.map((sub) => (
                          <Fragment key={sub.id}>
                            <tr style={{ borderBottom: expandedRow === sub.id ? 'none' : '1px solid #E2E8F0', backgroundColor: expandedRow === sub.id ? '#F8FAFC' : 'white', transition: 'background-color 0.2s' }}>
                              <td style={{ padding: '16px 24px', fontSize: '14px', color: '#475569' }}>
                                {new Date(sub.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                              </td>
                              <td style={{ padding: '16px 24px' }}>
                                <div style={{ fontWeight: '600', color: '#0F172A', fontSize: '14px' }}>{sub.name}</div>
                                <div style={{ color: '#64748B', fontSize: '12px', textTransform: 'capitalize', marginTop: '2px' }}>{sub.location}</div>
                              </td>
                              <td style={{ padding: '16px 24px' }}>
                                <div style={{ fontSize: '14px', color: '#475569' }}>{sub.email}</div>
                                <div style={{ fontSize: '12px', color: '#64748B', fontFamily: 'monospace', marginTop: '2px' }}>{sub.phone}</div>
                              </td>
                              <td style={{ padding: '16px 24px' }}>
                                <span style={{ display: 'inline-block', padding: '4px 10px', backgroundColor: sub.total_emissions > 2.0 ? '#FEF2F2' : '#F0FDF4', color: sub.total_emissions > 2.0 ? '#991B1B' : '#166534', border: `1px solid ${sub.total_emissions > 2.0 ? '#FECACA' : '#BBF7D0'}`, borderRadius: '9999px', fontSize: '13px', fontWeight: '600' }}>
                                  {sub.total_emissions.toFixed(2)}
                                </span>
                              </td>
                              <td style={{ padding: '16px 24px' }} onClick={(e) => e.stopPropagation()}>
                                <select
                                  value={sub.payment_status || 'pending'}
                                  onChange={(e) => handleStatusChange(sub.id, e.target.value)}
                                  style={{ padding: '6px 10px', borderRadius: '6px', border: `1px solid ${sub.payment_status === 'verified' ? '#86EFAC' : '#CBD5E1'}`, backgroundColor: sub.payment_status === 'verified' ? '#DCFCE7' : '#F8FAFC', color: sub.payment_status === 'verified' ? '#166534' : '#475569', fontSize: '12px', fontWeight: '600', outline: 'none', cursor: 'pointer' }}
                                >
                                  <option value="pending">Pending</option>
                                  <option value="verified">Verified</option>
                                </select>
                                {sub.payment_method && (
                                  <div style={{ marginTop: '4px', fontSize: '11px', color: '#64748B' }}>
                                    via {METHOD_LABELS[sub.payment_method] || sub.payment_method} · {formatAmount(sub)}
                                  </div>
                                )}
                              </td>
                              <td style={{ padding: '16px 24px' }} onClick={(e) => e.stopPropagation()}>
                                <select
                                  value={sub.email_sent ? 'sent' : 'not_sent'}
                                  onChange={(e) => handleEmailSentChange(sub.id, e.target.value === 'sent')}
                                  style={{ padding: '6px 10px', borderRadius: '6px', border: `1px solid ${sub.email_sent ? '#93C5FD' : '#FCD34D'}`, backgroundColor: sub.email_sent ? '#DBEAFE' : '#FEF3C7', color: sub.email_sent ? '#1D4ED8' : '#92400E', fontSize: '12px', fontWeight: '600', outline: 'none', cursor: 'pointer' }}
                                >
                                  <option value="not_sent">Not Sent</option>
                                  <option value="sent">Sent</option>
                                </select>
                              </td>
                              <td style={{ padding: '16px 24px', textAlign: 'right', display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                <button 
                                  onClick={() => handleDelete(sub.id)}
                                  style={{ padding: '8px 14px', backgroundColor: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '500', color: '#991B1B', transition: 'all 0.2s' }}
                                >
                                  Delete
                                </button>
                                <button 
                                  onClick={() => toggleRow(sub.id)}
                                  style={{ padding: '8px 14px', backgroundColor: 'white', border: '1px solid #CBD5E1', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '500', color: '#0F172A', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', transition: 'all 0.2s' }}
                                >
                                  {expandedRow === sub.id ? 'Close Report' : 'View Report'}
                                </button>
                              </td>
                            </tr>
                            
                            {/* Expanded Detailed Report View */}
                            {expandedRow === sub.id && (
                              <tr style={{ borderBottom: '1px solid #E2E8F0', backgroundColor: '#F8FAFC' }}>
                                <td colSpan="7" style={{ padding: '0 24px 24px' }}>
                                  <div style={{ backgroundColor: 'white', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '32px', display: 'flex', gap: '40px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', flexWrap: 'wrap' }}>

                                    {/* Left Col: High Level Breakdown + Payment verification info */}
                                    <div style={{ minWidth: '220px', borderRight: '1px solid #E2E8F0', paddingRight: '32px' }}>
                                      <h4 style={{ fontSize: '15px', fontWeight: '600', color: '#0F172A', margin: '0 0 20px 0' }}>Emissions Breakdown</h4>
                                      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}><span style={{color: '#64748B'}}>Home:</span> <strong style={{color: '#0F172A'}}>{sub.breakdown_home?.toFixed(2)}t</strong></div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}><span style={{color: '#64748B'}}>Transport:</span> <strong style={{color: '#0F172A'}}>{sub.breakdown_transport?.toFixed(2)}t</strong></div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}><span style={{color: '#64748B'}}>Food:</span> <strong style={{color: '#0F172A'}}>{sub.breakdown_food?.toFixed(2)}t</strong></div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}><span style={{color: '#64748B'}}>Goods:</span> <strong style={{color: '#0F172A'}}>{sub.breakdown_goods?.toFixed(2)}t</strong></div>
                                      </div>

                                      <h4 style={{ fontSize: '15px', fontWeight: '600', color: '#0F172A', margin: '28px 0 16px' }}>Payment Verification</h4>
                                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', fontSize: '13px' }}><span style={{color: '#64748B'}}>Method:</span> <strong style={{color: '#0F172A'}}>{METHOD_LABELS[sub.payment_method] || '—'}</strong></div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', fontSize: '13px' }}><span style={{color: '#64748B'}}>Amount:</span> <strong style={{color: '#0F172A'}}>{formatAmount(sub)}</strong></div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', fontSize: '13px' }}><span style={{color: '#64748B'}}>Payer Account:</span> <strong style={{color: '#0F172A', textAlign: 'right'}}>{sub.account_name || '—'}</strong></div>
                                        {sub.cert_id && (
                                          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', fontSize: '13px' }}><span style={{color: '#64748B'}}>Certificate:</span> <strong style={{color: '#0F172A', fontFamily: 'monospace'}}>{sub.cert_id}</strong></div>
                                        )}
                                      </div>
                                    </div>
  
                                    {/* Right Col: Exact Quiz Answers */}
                                    <div style={{ flex: 1 }}>
                                      <h4 style={{ fontSize: '15px', fontWeight: '600', color: '#0F172A', margin: '0 0 20px 0' }}>Quiz Responses</h4>
                                      {sub.answers_data && Object.keys(sub.answers_data).length > 0 ? (
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                                          {Object.entries(sub.answers_data).map(([qId, ansId]) => {
                                            const qData = questions.find(q => q.id === qId);
                                            const aData = qData?.options?.find(o => o.id === ansId);
                                            const questionText = qData ? qData.q.en : qId;
                                            const answerText = aData ? aData.label.en : ansId;
  
                                            return (
                                              <div key={qId} style={{ backgroundColor: '#F8FAFC', padding: '16px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                                                <div style={{ fontSize: '12px', color: '#64748B', marginBottom: '8px', lineHeight: 1.5 }}>{questionText}</div>
                                                <div style={{ fontSize: '14px', fontWeight: '600', color: '#0F172A' }}>{answerText}</div>
                                              </div>
                                            );
                                          })}
                                        </div>
                                      ) : (
                                        <div style={{ color: '#64748B', fontSize: '14px', padding: '24px', backgroundColor: '#F8FAFC', borderRadius: '8px', border: '1px dashed #CBD5E1', textAlign: 'center' }}>
                                          No granular quiz data was saved for this submission.
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                                    <button 
                                      onClick={() => handleDownloadCertPng(sub)}
                                      disabled={isDownloadingCertPng || sub.payment_status !== 'verified'}
                                      title={sub.payment_status !== 'verified' ? 'Payment must be verified to download' : ''}
                                      style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', backgroundColor: 'white', color: sub.payment_status !== 'verified' ? '#94A3B8' : '#0F172A', border: '1px solid #CBD5E1', borderRadius: '8px', fontWeight: '600', cursor: (isDownloadingCertPng || sub.payment_status !== 'verified') ? 'not-allowed' : 'pointer', fontSize: '14px', opacity: (isDownloadingCertPng || sub.payment_status !== 'verified') ? 0.6 : 1, transition: 'all 0.2s' }}
                                    >
                                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                                      {isDownloadingCertPng ? 'Generating...' : 'Download Cert (PNG)'}
                                    </button>
                                    <button 
                                      onClick={() => handleDownloadCert(sub)}
                                      disabled={isDownloadingCert || sub.payment_status !== 'verified'}
                                      title={sub.payment_status !== 'verified' ? 'Payment must be verified to download' : ''}
                                      style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', backgroundColor: 'white', color: sub.payment_status !== 'verified' ? '#94A3B8' : '#0F172A', border: '1px solid #CBD5E1', borderRadius: '8px', fontWeight: '600', cursor: (isDownloadingCert || sub.payment_status !== 'verified') ? 'not-allowed' : 'pointer', fontSize: '14px', opacity: (isDownloadingCert || sub.payment_status !== 'verified') ? 0.6 : 1, transition: 'all 0.2s' }}
                                    >
                                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="7"></circle><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline></svg>
                                      {isDownloadingCert ? 'Generating...' : 'Download Cert (PDF)'}
                                    </button>
                                    <button
                                      onClick={() => handleDownloadMinimal(sub)}
                                      disabled={isDownloadingMin || sub.payment_status !== 'verified'}
                                      title={sub.payment_status !== 'verified' ? 'Payment must be verified to download' : 'Clean, minimalist single-accent template'}
                                      style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', backgroundColor: 'white', color: sub.payment_status !== 'verified' ? '#94A3B8' : '#0F172A', border: '1px solid #CBD5E1', borderRadius: '8px', fontWeight: '600', cursor: (isDownloadingMin || sub.payment_status !== 'verified') ? 'not-allowed' : 'pointer', fontSize: '14px', opacity: (isDownloadingMin || sub.payment_status !== 'verified') ? 0.6 : 1, transition: 'all 0.2s' }}
                                    >
                                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="6" x2="20" y2="6"></line><line x1="4" y1="12" x2="14" y2="12"></line><line x1="4" y1="18" x2="18" y2="18"></line></svg>
                                      {isDownloadingMin ? 'Generating...' : 'Download Minimal Report'}
                                    </button>
                                    <button
                                      onClick={() => handleDownloadPdf(sub)}
                                      disabled={isDownloading || sub.payment_status !== 'verified'}
                                      title={sub.payment_status !== 'verified' ? 'Payment must be verified to download' : 'Editorial, full-colour template'}
                                      style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', backgroundColor: sub.payment_status !== 'verified' ? '#E2E8F0' : '#0F172A', color: sub.payment_status !== 'verified' ? '#94A3B8' : 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: (isDownloading || sub.payment_status !== 'verified') ? 'not-allowed' : 'pointer', fontSize: '14px', opacity: (isDownloading || sub.payment_status !== 'verified') ? 0.6 : 1, transition: 'background-color 0.2s' }}
                                    >
                                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                                      {isDownloading ? 'Generating Print File...' : 'Download Premium PDF Report'}
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </Fragment>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'general' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ display: 'flex', gap: '16px', backgroundColor: 'white', padding: '16px 20px', borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                <div style={{ flex: 1, position: 'relative' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2" style={{ position: 'absolute', left: '12px', top: '12px' }}><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                  <input 
                    type="text" 
                    placeholder="Search by name, email, or phone..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ width: '100%', padding: '10px 14px 10px 36px', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '14px', outline: 'none' }}
                  />
                </div>
                <button 
                  onClick={handleExportGeneralCsv}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', backgroundColor: '#10B981', border: '1px solid #059669', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '500', color: 'white', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', transition: 'background-color 0.2s' }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                  Export CSV
                </button>
              </div>
              <div style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                        <th onClick={() => handleSort('created_at')} style={{ padding: '16px 24px', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748B', fontWeight: '600', cursor: 'pointer' }}>Date {sortConfig.key === 'created_at' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}</th>
                        <th onClick={() => handleSort('user')} style={{ padding: '16px 24px', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748B', fontWeight: '600', cursor: 'pointer' }}>User {sortConfig.key === 'user' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}</th>
                        <th style={{ padding: '16px 24px', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748B', fontWeight: '600' }}>Contact</th>
                        <th onClick={() => handleSort('total_emissions')} style={{ padding: '16px 24px', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748B', fontWeight: '600', cursor: 'pointer' }}>Total (t CO₂e) {sortConfig.key === 'total_emissions' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}</th>
                        <th onClick={() => handleSort('payment_status')} style={{ padding: '16px 24px', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748B', fontWeight: '600', cursor: 'pointer' }}>Status {sortConfig.key === 'payment_status' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}</th>
                        <th style={{ padding: '16px 24px', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748B', fontWeight: '600', textAlign: 'right' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedAndFilteredGeneral.length === 0 ? (
                        <tr><td colSpan="6" style={{ padding: '48px', textAlign: 'center', color: '#94A3B8', fontSize: '14px' }}>
                          {isLoading ? 'Loading users...' : 'No users found yet. Completed check-ups appear here automatically.'}
                        </td></tr>
                      ) : (
                        sortedAndFilteredGeneral.map((sub) => (
                          <tr key={sub.id} style={{ borderBottom: '1px solid #E2E8F0', backgroundColor: 'white', transition: 'background-color 0.2s' }}>
                            <td style={{ padding: '16px 24px', fontSize: '14px', color: '#475569' }}>{new Date(sub.created_at).toLocaleDateString()}</td>
                            <td style={{ padding: '16px 24px' }}><div style={{ fontWeight: '600', color: '#0F172A', fontSize: '14px' }}>{sub.name}</div><div style={{ color: '#64748B', fontSize: '12px', textTransform: 'capitalize', marginTop: '2px' }}>{sub.location}</div></td>
                            <td style={{ padding: '16px 24px' }}><div style={{ fontSize: '14px', color: '#475569' }}>{sub.email || '-'}</div><div style={{ fontSize: '12px', color: '#64748B', fontFamily: 'monospace', marginTop: '2px' }}>{sub.phone || '-'}</div></td>
                            <td style={{ padding: '16px 24px' }}><span style={{ display: 'inline-block', padding: '4px 10px', backgroundColor: sub.total_emissions > 2.0 ? '#FEF2F2' : '#F0FDF4', color: sub.total_emissions > 2.0 ? '#991B1B' : '#166534', border: `1px solid ${sub.total_emissions > 2.0 ? '#FECACA' : '#BBF7D0'}`, borderRadius: '9999px', fontSize: '13px', fontWeight: '600' }}>{sub.total_emissions.toFixed(2)}</span></td>
                            <td style={{ padding: '16px 24px' }}>
                              <span style={{ display: 'inline-block', padding: '4px 10px', backgroundColor: natureOf(sub).bg, color: natureOf(sub).fg, border: `1px solid ${natureOf(sub).border}`, borderRadius: '9999px', fontSize: '12px', fontWeight: '600', whiteSpace: 'nowrap' }}>
                                {natureOf(sub).label}
                              </span>
                            </td>
                            <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                              <button onClick={() => handleDelete(sub.id)} style={{ padding: '8px 14px', backgroundColor: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '500', color: '#991B1B', transition: 'all 0.2s' }}>Delete</button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'supporters' && (
            <div style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
              <div style={{ padding: '24px', borderBottom: '1px solid #E2E8F0', backgroundColor: '#F8FAFC' }}>
                <p style={{ color: '#475569', fontSize: '14px', margin: 0, lineHeight: 1.5 }}>
                  These are individuals who successfully confirmed their support for Climate Literacy in Nepal via the "Help the Cause" flow.
                </p>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ backgroundColor: 'white', borderBottom: '1px solid #E2E8F0' }}>
                      <th style={{ padding: '16px 24px', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748B', fontWeight: '600' }}>Date</th>
                      <th style={{ padding: '16px 24px', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748B', fontWeight: '600' }}>Name</th>
                      <th style={{ padding: '16px 24px', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748B', fontWeight: '600' }}>Email</th>
                      <th style={{ padding: '16px 24px', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748B', fontWeight: '600' }}>Phone</th>
                      <th style={{ padding: '16px 24px', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748B', fontWeight: '600' }}>Amount</th>
                      <th style={{ padding: '16px 24px', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748B', fontWeight: '600' }}>Method</th>
                      <th style={{ padding: '16px 24px', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748B', fontWeight: '600' }}>Payer Account</th>
                      <th style={{ padding: '16px 24px', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748B', fontWeight: '600' }}>Status</th>
                      <th style={{ padding: '16px 24px', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748B', fontWeight: '600', textAlign: 'right' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {supportSubmissions.length === 0 ? (
                      <tr>
                        <td colSpan="9" style={{ padding: '48px', textAlign: 'center', color: '#94A3B8', fontSize: '14px' }}>
                          No support pledges recorded yet.
                        </td>
                      </tr>
                    ) : (
                      supportSubmissions.map((sub) => (
                        <tr key={sub.id} style={{ borderBottom: '1px solid #E2E8F0', backgroundColor: sub.payment_status === 'verified' ? '#F0FDF4' : 'white', transition: 'background-color 0.2s' }}>
                          <td style={{ padding: '16px 24px', fontSize: '14px', color: '#475569' }}>
                            {new Date(sub.created_at).toLocaleDateString()}
                          </td>
                          <td style={{ padding: '16px 24px', fontWeight: '600', color: '#0F172A', fontSize: '14px' }}>
                            {sub.name}
                          </td>
                          <td style={{ padding: '16px 24px', fontSize: '14px', color: '#475569' }}>
                            {sub.email || '-'}
                          </td>
                          <td style={{ padding: '16px 24px', fontSize: '13px', color: '#64748B', fontFamily: 'monospace' }}>
                            {sub.phone}
                          </td>
                          <td style={{ padding: '16px 24px', fontSize: '14px', fontWeight: '700', color: '#059669', whiteSpace: 'nowrap' }}>
                            {formatAmount(sub)}
                          </td>
                          <td style={{ padding: '16px 24px' }}>
                            {(() => {
                              const mc = METHOD_COLORS[sub.payment_method];
                              return (
                                <span style={{ display: 'inline-block', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: '600', backgroundColor: mc ? mc.bg : '#F1F5F9', color: mc ? mc.fg : '#64748B', border: `1px solid ${mc ? mc.border : '#E2E8F0'}`, whiteSpace: 'nowrap' }}>
                                  {METHOD_LABELS[sub.payment_method] || '—'}
                                </span>
                              );
                            })()}
                          </td>
                          <td style={{ padding: '16px 24px', fontSize: '13px', color: '#475569' }}>
                            {sub.account_name || '—'}
                          </td>
                          <td style={{ padding: '16px 24px' }}>
                            <span style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              padding: '4px 10px', 
                              borderRadius: '9999px', 
                              fontSize: '12px', 
                              fontWeight: '600',
                              backgroundColor: sub.payment_status === 'verified' ? '#DCFCE7' : '#FEF3C7',
                              color: sub.payment_status === 'verified' ? '#166534' : '#92400E',
                              border: `1px solid ${sub.payment_status === 'verified' ? '#BBF7D0' : '#FDE68A'}`,
                              textTransform: 'capitalize'
                            }}>
                              {sub.payment_status === 'verified' && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>}
                              {sub.payment_status || 'pending'}
                            </span>
                          </td>
                          <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                            <button 
                              onClick={() => handleToggleVerification(sub.id, sub.payment_status || 'pending')}
                              style={{ 
                                padding: '8px 14px', 
                                backgroundColor: sub.payment_status === 'verified' ? 'white' : '#0F172A', 
                                color: sub.payment_status === 'verified' ? '#475569' : 'white', 
                                border: sub.payment_status === 'verified' ? '1px solid #CBD5E1' : 'none',
                                borderRadius: '6px', 
                                fontSize: '13px', 
                                fontWeight: '600', 
                                cursor: 'pointer',
                                boxShadow: sub.payment_status === 'verified' ? 'none' : '0 1px 2px rgba(0,0,0,0.05)'
                              }}
                            >
                              {sub.payment_status === 'verified' ? 'Revoke' : 'Mark Verified'}
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
