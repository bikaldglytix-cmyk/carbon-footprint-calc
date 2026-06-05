"use client";
import { useState, useEffect, useMemo, Fragment } from 'react';
import { supabase } from '../../lib/supabase';
import { questions } from '../../data/questions';

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

  const handleToggleVerification = async (id, currentStatus) => {
    const newStatus = currentStatus === 'verified' ? 'pending' : 'verified';
    try {
      const { error } = await supabase
        .from('calculator_submissions')
        .update({ payment_status: newStatus })
        .eq('id', id);

      if (error) throw error;

      // Update local state without fetching all
      setSubmissions(submissions.map(sub => 
        sub.id === id ? { ...sub, payment_status: newStatus } : sub
      ));
    } catch (err) {
      console.error('Error updating status:', err);
      alert('Failed to update status. Check permissions.');
    }
  };

  const toggleRow = (id) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  // Separate standard calculator submissions from support pledges
  const calculatorSubmissions = submissions.filter(sub => sub.location !== 'Donation/Support');
  const supportSubmissions = submissions.filter(sub => sub.location === 'Donation/Support');

  // Derived / Filtered Data for Reports
  const filteredSubmissions = useMemo(() => {
    return calculatorSubmissions.filter(sub => {
      const matchesSearch = sub.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            sub.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            sub.phone?.includes(searchQuery);
      
      const matchesLoc = filterLoc === 'all' || sub.location?.toLowerCase().includes(filterLoc.toLowerCase());
      
      let matchesLevel = true;
      if (filterLevel === 'high') matchesLevel = sub.total_emissions > 2.0;
      if (filterLevel === 'low') matchesLevel = sub.total_emissions <= 2.0;

      return matchesSearch && matchesLoc && matchesLevel;
    });
  }, [calculatorSubmissions, searchQuery, filterLoc, filterLevel]);

  // Overview Stats (Calculated ONLY on actual calculator submissions)
  const totalSubmissions = calculatorSubmissions.length;
  const avgEmissions = totalSubmissions ? (calculatorSubmissions.reduce((acc, sub) => acc + (sub.total_emissions || 0), 0) / totalSubmissions).toFixed(2) : 0;
  
  // Total Verified Funds Raised
  const verifiedFunds = supportSubmissions
    .filter(sub => sub.payment_status === 'verified')
    .reduce((acc, sub) => acc + (sub.amount || 0), 0);

  const locDistribution = calculatorSubmissions.reduce((acc, sub) => {
    const loc = sub.location || 'Unknown';
    acc[loc] = (acc[loc] || 0) + 1;
    return acc;
  }, {});


  if (isAuthChecking) {
    return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F4F7F5' }}>Loading...</div>;
  }

  if (!session) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F4F7F5', fontFamily: 'sans-serif' }}>
        <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', width: '100%', maxWidth: '400px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px', color: '#1f2937' }}>Admin Login</h1>
          <p style={{ color: '#6b7280', marginBottom: '24px', fontSize: '14px' }}>Sign in with your ATL Supabase administrator credentials.</p>
          
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>Email Address</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '14px' }} placeholder="admin@example.com" required autoFocus />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '14px' }} placeholder="Enter password..." required />
            </div>
            {error && <div style={{ color: '#ef4444', fontSize: '14px' }}>{error}</div>}
            <button type="submit" disabled={isLoading} style={{ padding: '12px', backgroundColor: '#3A5A40', color: 'white', border: 'none', borderRadius: '4px', fontWeight: '500', cursor: isLoading ? 'not-allowed' : 'pointer', opacity: isLoading ? 0.7 : 1 }}>
              {isLoading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F4F7F5', display: 'flex', fontFamily: 'sans-serif' }}>
      
      {/* Sidebar Navigation */}
      <div style={{ width: '250px', backgroundColor: 'white', borderRight: '1px solid #e5e7eb', padding: '24px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ marginBottom: '40px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#3A5A40' }}>ATL Carbon</h2>
          <p style={{ fontSize: '12px', color: '#6b7280' }}>Admin Dashboard</p>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px', flexGrow: 1 }}>
          <button 
            onClick={() => setActiveTab('overview')}
            style={{ textAlign: 'left', padding: '12px 16px', borderRadius: '6px', border: 'none', backgroundColor: activeTab === 'overview' ? '#ecfdf5' : 'transparent', color: activeTab === 'overview' ? '#065f46' : '#4b5563', fontWeight: activeTab === 'overview' ? '600' : '400', cursor: 'pointer', transition: 'all 0.2s' }}
          >
            Overview
          </button>
          <button 
            onClick={() => setActiveTab('reports')}
            style={{ textAlign: 'left', padding: '12px 16px', borderRadius: '6px', border: 'none', backgroundColor: activeTab === 'reports' ? '#ecfdf5' : 'transparent', color: activeTab === 'reports' ? '#065f46' : '#4b5563', fontWeight: activeTab === 'reports' ? '600' : '400', cursor: 'pointer', transition: 'all 0.2s' }}
          >
            Detailed Reports
          </button>
          <button 
            onClick={() => setActiveTab('supporters')}
            style={{ textAlign: 'left', padding: '12px 16px', borderRadius: '6px', border: 'none', backgroundColor: activeTab === 'supporters' ? '#ecfdf5' : 'transparent', color: activeTab === 'supporters' ? '#065f46' : '#4b5563', fontWeight: activeTab === 'supporters' ? '600' : '400', cursor: 'pointer', transition: 'all 0.2s' }}
          >
            Supporters
          </button>
        </nav>

        <button 
          onClick={handleLogout}
          style={{ padding: '12px', backgroundColor: '#fee2e2', border: 'none', borderRadius: '6px', color: '#991b1b', fontWeight: '500', cursor: 'pointer' }}
        >
          Log Out
        </button>
      </div>

      {/* Main Content Area */}
      <div style={{ flex: 1, padding: '40px', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#1f2937' }}>
            {activeTab === 'overview' && 'Dashboard Overview'}
            {activeTab === 'reports' && 'Detailed Report Submissions'}
            {activeTab === 'supporters' && 'Campaign Supporters'}
          </h1>
          <button 
            onClick={fetchSubmissions}
            style={{ padding: '8px 16px', backgroundColor: 'white', border: '1px solid #d1d5db', borderRadius: '4px', cursor: 'pointer', fontSize: '14px', color: '#374151' }}
          >
            {isLoading ? 'Refreshing...' : 'Refresh Data'}
          </button>
        </div>

        {error && <div style={{ backgroundColor: '#fee2e2', color: '#991b1b', padding: '16px', borderRadius: '8px', marginBottom: '24px' }}>{error}</div>}

        {activeTab === 'overview' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px' }}>
            <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <h3 style={{ fontSize: '14px', textTransform: 'uppercase', color: '#6b7280', fontWeight: '600', marginBottom: '8px' }}>Total Submissions</h3>
              <p style={{ fontSize: '36px', fontWeight: 'bold', color: '#1f2937' }}>{totalSubmissions}</p>
            </div>
            <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <h3 style={{ fontSize: '14px', textTransform: 'uppercase', color: '#6b7280', fontWeight: '600', marginBottom: '8px' }}>Average Emissions</h3>
              <p style={{ fontSize: '36px', fontWeight: 'bold', color: '#065f46' }}>{avgEmissions} <span style={{fontSize: '16px', fontWeight: 'normal', color: '#6b7280'}}>t CO2e</span></p>
            </div>
            <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <h3 style={{ fontSize: '14px', textTransform: 'uppercase', color: '#6b7280', fontWeight: '600', marginBottom: '8px' }}>Support Pledges</h3>
              <p style={{ fontSize: '36px', fontWeight: 'bold', color: '#d97706' }}>{supportSubmissions.length}</p>
            </div>
            <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <h3 style={{ fontSize: '14px', textTransform: 'uppercase', color: '#6b7280', fontWeight: '600', marginBottom: '8px' }}>Verified Funds</h3>
              <p style={{ fontSize: '36px', fontWeight: 'bold', color: '#047857' }}>Rs. {verifiedFunds.toLocaleString()}</p>
            </div>
            <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <h3 style={{ fontSize: '14px', textTransform: 'uppercase', color: '#6b7280', fontWeight: '600', marginBottom: '16px' }}>By Location</h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {Object.entries(locDistribution).map(([loc, count]) => (
                  <li key={loc} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '15px' }}>
                    <span style={{ color: '#4b5563' }}>{loc}</span>
                    <span style={{ fontWeight: '600', color: '#1f2937' }}>{count}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {activeTab === 'supporters' && (
          <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
            <div style={{ padding: '24px', borderBottom: '1px solid #e5e7eb' }}>
              <p style={{ color: '#4b5563', fontSize: '14px' }}>
                These are individuals who clicked through the "Help the Cause" flow and successfully confirmed their support for Climate Literacy in Nepal.
              </p>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                    <th style={{ padding: '16px', fontSize: '12px', textTransform: 'uppercase', color: '#6b7280', fontWeight: '600' }}>Date</th>
                    <th style={{ padding: '16px', fontSize: '12px', textTransform: 'uppercase', color: '#6b7280', fontWeight: '600' }}>Name</th>
                    <th style={{ padding: '16px', fontSize: '12px', textTransform: 'uppercase', color: '#6b7280', fontWeight: '600' }}>Email</th>
                    <th style={{ padding: '16px', fontSize: '12px', textTransform: 'uppercase', color: '#6b7280', fontWeight: '600' }}>Phone (eSewa ID)</th>
                    <th style={{ padding: '16px', fontSize: '12px', textTransform: 'uppercase', color: '#6b7280', fontWeight: '600' }}>Amount</th>
                    <th style={{ padding: '16px', fontSize: '12px', textTransform: 'uppercase', color: '#6b7280', fontWeight: '600' }}>Status</th>
                    <th style={{ padding: '16px', fontSize: '12px', textTransform: 'uppercase', color: '#6b7280', fontWeight: '600', textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {supportSubmissions.length === 0 ? (
                    <tr>
                      <td colSpan="7" style={{ padding: '32px', textAlign: 'center', color: '#6b7280' }}>
                        No support pledges yet.
                      </td>
                    </tr>
                  ) : (
                    supportSubmissions.map((sub) => (
                      <tr key={sub.id} style={{ borderBottom: '1px solid #e5e7eb', backgroundColor: sub.payment_status === 'verified' ? '#f0fdf4' : 'transparent' }}>
                        <td style={{ padding: '16px', fontSize: '14px', color: '#374151' }}>
                          {new Date(sub.created_at).toLocaleDateString()}
                        </td>
                        <td style={{ padding: '16px', fontWeight: '500', color: '#111827', fontSize: '14px' }}>
                          {sub.name}
                        </td>
                        <td style={{ padding: '16px', fontSize: '14px', color: '#374151' }}>
                          {sub.email || '-'}
                        </td>
                        <td style={{ padding: '16px', fontSize: '14px', color: '#374151', fontFamily: 'monospace' }}>
                          {sub.phone}
                        </td>
                        <td style={{ padding: '16px', fontSize: '14px', fontWeight: '600', color: '#047857' }}>
                          Rs. {sub.amount || 0}
                        </td>
                        <td style={{ padding: '16px' }}>
                          <span style={{ 
                            padding: '4px 8px', 
                            borderRadius: '9999px', 
                            fontSize: '12px', 
                            fontWeight: '500',
                            backgroundColor: sub.payment_status === 'verified' ? '#dcfce3' : '#fef3c7',
                            color: sub.payment_status === 'verified' ? '#166534' : '#92400e',
                            textTransform: 'capitalize'
                          }}>
                            {sub.payment_status || 'pending'}
                          </span>
                        </td>
                        <td style={{ padding: '16px', textAlign: 'right' }}>
                          <button 
                            onClick={() => handleToggleVerification(sub.id, sub.payment_status || 'pending')}
                            style={{ 
                              padding: '6px 12px', 
                              backgroundColor: sub.payment_status === 'verified' ? 'white' : '#3A5A40', 
                              color: sub.payment_status === 'verified' ? '#4b5563' : 'white', 
                              border: sub.payment_status === 'verified' ? '1px solid #d1d5db' : 'none',
                              borderRadius: '4px', 
                              fontSize: '12px', 
                              fontWeight: '600', 
                              cursor: 'pointer' 
                            }}
                          >
                            {sub.payment_status === 'verified' ? 'Unverify' : 'Verify'}
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

        {activeTab === 'reports' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Search & Filters */}
            <div style={{ display: 'flex', gap: '16px', backgroundColor: 'white', padding: '16px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <input 
                type="text" 
                placeholder="Search by name, email, or phone..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ flex: 1, padding: '10px 14px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px' }}
              />
              <select value={filterLoc} onChange={(e) => setFilterLoc(e.target.value)} style={{ padding: '10px 14px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px', backgroundColor: 'white' }}>
                <option value="all">All Locations</option>
                <option value="mountain">Mountain</option>
                <option value="hilly">Hilly</option>
                <option value="terai">Terai</option>
              </select>
              <select value={filterLevel} onChange={(e) => setFilterLevel(e.target.value)} style={{ padding: '10px 14px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px', backgroundColor: 'white' }}>
                <option value="all">All Emission Levels</option>
                <option value="high">High (&gt; 2.0t)</option>
                <option value="low">Low (&lt;= 2.0t)</option>
              </select>
            </div>

            {/* Data Table */}
            <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                      <th style={{ padding: '16px', fontSize: '12px', textTransform: 'uppercase', color: '#6b7280', fontWeight: '600' }}>Date</th>
                      <th style={{ padding: '16px', fontSize: '12px', textTransform: 'uppercase', color: '#6b7280', fontWeight: '600' }}>User</th>
                      <th style={{ padding: '16px', fontSize: '12px', textTransform: 'uppercase', color: '#6b7280', fontWeight: '600' }}>Contact</th>
                      <th style={{ padding: '16px', fontSize: '12px', textTransform: 'uppercase', color: '#6b7280', fontWeight: '600' }}>Total (t CO2e)</th>
                      <th style={{ padding: '16px', fontSize: '12px', textTransform: 'uppercase', color: '#6b7280', fontWeight: '600' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSubmissions.length === 0 ? (
                      <tr>
                        <td colSpan="5" style={{ padding: '32px', textAlign: 'center', color: '#6b7280' }}>
                          {isLoading ? 'Loading submissions...' : 'No matching records found.'}
                        </td>
                      </tr>
                    ) : (
                      filteredSubmissions.map((sub) => (
                        <Fragment key={sub.id}>
                          <tr style={{ borderBottom: expandedRow === sub.id ? 'none' : '1px solid #e5e7eb', backgroundColor: expandedRow === sub.id ? '#f9fafb' : 'transparent', transition: 'background-color 0.2s' }}>
                            <td style={{ padding: '16px', fontSize: '14px', color: '#374151' }}>
                              {new Date(sub.created_at).toLocaleDateString()}
                            </td>
                            <td style={{ padding: '16px' }}>
                              <div style={{ fontWeight: '500', color: '#111827', fontSize: '14px' }}>{sub.name}</div>
                              <div style={{ color: '#6b7280', fontSize: '13px', textTransform: 'capitalize' }}>{sub.location}</div>
                            </td>
                            <td style={{ padding: '16px' }}>
                              <div style={{ fontSize: '14px', color: '#374151' }}>{sub.email}</div>
                              <div style={{ fontSize: '13px', color: '#6b7280' }}>{sub.phone}</div>
                            </td>
                            <td style={{ padding: '16px' }}>
                              <span style={{ display: 'inline-block', padding: '4px 8px', backgroundColor: sub.total_emissions > 2.0 ? '#fee2e2' : '#ecfdf5', color: sub.total_emissions > 2.0 ? '#991b1b' : '#065f46', borderRadius: '9999px', fontSize: '13px', fontWeight: '600' }}>
                                {sub.total_emissions.toFixed(2)}
                              </span>
                            </td>
                            <td style={{ padding: '16px' }}>
                              <button 
                                onClick={() => toggleRow(sub.id)}
                                style={{ padding: '6px 12px', backgroundColor: 'white', border: '1px solid #d1d5db', borderRadius: '4px', cursor: 'pointer', fontSize: '13px', fontWeight: '500', color: '#374151' }}
                              >
                                {expandedRow === sub.id ? 'Close Report' : 'View Detailed Report'}
                              </button>
                            </td>
                          </tr>
                          
                          {/* Expanded Detailed Report View */}
                          {expandedRow === sub.id && (
                            <tr style={{ borderBottom: '1px solid #e5e7eb', backgroundColor: '#f9fafb' }}>
                              <td colSpan="5" style={{ padding: '0 24px 24px' }}>
                                <div style={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '24px', display: 'flex', gap: '32px' }}>
                                  
                                  {/* Left Col: High Level Breakdown */}
                                  <div style={{ minWidth: '200px', borderRight: '1px solid #e5e7eb', paddingRight: '24px' }}>
                                    <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '16px' }}>Emissions Breakdown</h4>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}><span>Home:</span> <strong>{sub.breakdown_home?.toFixed(2)}t</strong></div>
                                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}><span>Transport:</span> <strong>{sub.breakdown_transport?.toFixed(2)}t</strong></div>
                                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}><span>Food:</span> <strong>{sub.breakdown_food?.toFixed(2)}t</strong></div>
                                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}><span>Goods:</span> <strong>{sub.breakdown_goods?.toFixed(2)}t</strong></div>
                                    </div>
                                  </div>

                                  {/* Right Col: Exact Quiz Answers */}
                                  <div style={{ flex: 1 }}>
                                    <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '16px' }}>Quiz Responses</h4>
                                    {sub.answers_data && Object.keys(sub.answers_data).length > 0 ? (
                                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
                                        {Object.entries(sub.answers_data).map(([qId, ansId]) => {
                                          // Map raw IDs to English strings using our questions data
                                          const qData = questions.find(q => q.id === qId);
                                          const aData = qData?.options?.find(o => o.id === ansId);
                                          const questionText = qData ? qData.q.en : qId;
                                          const answerText = aData ? aData.label.en : ansId;

                                          return (
                                            <div key={qId} style={{ backgroundColor: '#f3f4f6', padding: '12px', borderRadius: '6px' }}>
                                              <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px', lineHeight: 1.4 }}>{questionText}</div>
                                              <div style={{ fontSize: '14px', fontWeight: '500', color: '#1f2937' }}>{answerText}</div>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    ) : (
                                      <div style={{ color: '#6b7280', fontSize: '14px', fontStyle: 'italic', padding: '12px', backgroundColor: '#f9fafb', borderRadius: '6px', border: '1px solid #e5e7eb' }}>
                                        No detailed quiz data was saved for this submission. This usually happens if the user used the "Skip to Results" developer button.
                                      </div>
                                    )}
                                  </div>

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
      </div>
    </div>
  );
}
