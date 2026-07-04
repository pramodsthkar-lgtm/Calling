'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  BarChart3, Users, PhoneCall, CheckCircle2, XCircle, Clock,
  Mail, MessageSquare, ShieldAlert, Check, X,
  AlertTriangle, Building2, Globe, Smartphone,
  Settings, Send, Bot, FileCheck, PhoneOutgoing,
  ListTodo, History, ScanSearch, Calendar, DollarSign,
  Mic, PlayCircle, FileText, Activity, LayoutDashboard
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// --- Data Models ---
type LeadStatus = 'Scanned' | 'Issues Found' | 'Contacted' | 'Interested' | 'Not Interested' | 'Meeting Booked' | 'No Website';
type QualificationLevel = 'High' | 'Medium' | 'Low' | 'Pending';
type ServiceType = 'Website Management' | 'New Website';

interface Lead {
  id: string;
  website: string;
  auditStatus: 'Pending' | 'Issues Found' | 'Clean' | 'N/A';
  contactStatus: LeadStatus;
  detectedIssues: string[];
  score: number;
  qualification: QualificationLevel;
  serviceNeeded: ServiceType;
  details?: ClientDetails;
}

interface ClientDetails {
  name: string;
  companyName: string;
  mobile: string;
  email: string;
  serviceNeeded: ServiceType;
  monthlyManagement: boolean;
  meetingDate?: string;
}

interface LogEntry {
  id: string;
  timestamp: Date;
  type: 'Audit' | 'Interaction' | 'System' | 'VoiceCall';
  website: string;
  message: string;
}

// --- Initial Mock Data ---
const INITIAL_LEADS: Lead[] = [
  { id: '1', website: 'rk-enterprises.in', auditStatus: 'Pending', contactStatus: 'Scanned', detectedIssues: [], score: 0, qualification: 'Pending', serviceNeeded: 'Website Management' },
  { id: '2', website: 'sharmatraders.com', auditStatus: 'Issues Found', contactStatus: 'Issues Found', detectedIssues: ['Slow loading speed', 'Not mobile responsive'], score: 85, qualification: 'High', serviceNeeded: 'Website Management' },
  { id: '3', website: 'techsolindia.net', auditStatus: 'Clean', contactStatus: 'Scanned', detectedIssues: [], score: 20, qualification: 'Low', serviceNeeded: 'Website Management' },
  { id: '4', website: 'New Business (No Web)', auditStatus: 'N/A', contactStatus: 'No Website', detectedIssues: ['No Digital Presence'], score: 90, qualification: 'High', serviceNeeded: 'New Website' },
  { id: '5', website: 'national-builders.co.in', auditStatus: 'Issues Found', contactStatus: 'Issues Found', detectedIssues: ['Outdated design', 'Poor SEO structure'], score: 92, qualification: 'High', serviceNeeded: 'Website Management' },
];

export default function Dashboard() {
  // --- State ---
  const [leads, setLeads] = useState<Lead[]>(INITIAL_LEADS);
  const [logs, setLogs] = useState<LogEntry[]>([
    { id: 'log-1', timestamp: new Date(), type: 'System', website: 'System', message: 'AI Sales Agent initialized with Voice capabilities.' }
  ]);
  
  // Dashboard Toggles
  const [isAiActive, setIsAiActive] = useState(true);
  const [isVoiceAiActive, setIsVoiceAiActive] = useState(true);
  const [gmailNotif, setGmailNotif] = useState(true);
  const [whatsappNotif, setWhatsappNotif] = useState(true);
  
  // Navigation
  const [activeTab, setActiveTab] = useState<'overview' | 'scanner' | 'leads' | 'logs'>('overview');

  // Interaction Modal State
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [interactionStep, setInteractionStep] = useState<'preview' | 'calling' | 'form' | null>(null);
  const [clientForm, setClientForm] = useState<ClientDetails>({
    name: '', companyName: '', mobile: '', email: '', serviceNeeded: 'Website Management', monthlyManagement: true, meetingDate: ''
  });
  const [isScanning, setIsScanning] = useState(false);

  // --- Derived Stats ---
  const stats = {
    totalContacted: leads.filter(l => ['Contacted', 'Interested', 'Not Interested', 'Meeting Booked'].includes(l.contactStatus)).length,
    interested: leads.filter(l => ['Interested', 'Meeting Booked'].includes(l.contactStatus)).length,
    notInterested: leads.filter(l => l.contactStatus === 'Not Interested').length,
    meetingsBooked: leads.filter(l => l.contactStatus === 'Meeting Booked').length,
    followUpPending: leads.filter(l => ['Issues Found', 'No Website'].includes(l.contactStatus)).length,
    todaysCalls: logs.filter(l => l.type === 'VoiceCall').length,
    revenue: leads.filter(l => l.contactStatus === 'Meeting Booked').length * 15000 // Mock revenue: 15k INR per booked client
  };

  const upcomingMeetings = leads
    .filter(l => l.contactStatus === 'Meeting Booked' && l.details?.meetingDate)
    .map(l => ({ ...l, date: new Date(l.details!.meetingDate!) }))
    .sort((a, b) => a.date.getTime() - b.date.getTime());

  // --- Handlers ---
  const addLog = (type: LogEntry['type'], website: string, message: string) => {
    setLogs(prev => [{ id: `log-${Date.now()}`, timestamp: new Date(), type, website, message }, ...prev]);
  };

  const handleSimulateAudit = (id: string) => {
    if (!isAiActive) return alert("AI is currently turned off.");
    setLeads(prev => prev.map(lead => {
      if (lead.id === id) {
        if (lead.serviceNeeded === 'New Website') return lead;
        const issues = ['Missing contact form', 'No mobile viewport meta tag'];
        const score = Math.floor(Math.random() * 40) + 60; // 60-100
        const qual = score > 80 ? 'High' : (score > 50 ? 'Medium' : 'Low');
        addLog('Audit', lead.website, `Audit complete. Found ${issues.length} issues. Score: ${score}`);
        return { ...lead, auditStatus: 'Issues Found', contactStatus: 'Issues Found', detectedIssues: issues, score, qualification: qual };
      }
      return lead;
    }));
  };

  const runAutoScanner = () => {
    if (!isAiActive) return alert("AI is currently turned off.");
    setIsScanning(true);
    addLog('System', 'Auto Scanner', 'Started daily automated website discovery.');
    
    setTimeout(() => {
      const newLeads: Lead[] = [
        { id: `scan-${Date.now()}-1`, website: 'new-local-business.in', auditStatus: 'Issues Found', contactStatus: 'Issues Found', detectedIssues: ['No HTTPS', 'Slow Load'], score: 88, qualification: 'High', serviceNeeded: 'Website Management' },
        { id: `scan-${Date.now()}-2`, website: 'Local Bakery (No Web)', auditStatus: 'N/A', contactStatus: 'No Website', detectedIssues: ['No Digital Presence'], score: 95, qualification: 'High', serviceNeeded: 'New Website' }
      ];
      setLeads(prev => [...newLeads, ...prev]);
      addLog('System', 'Auto Scanner', 'Discovered and audited 2 new potential clients.');
      setIsScanning(false);
    }, 2000);
  };

  const openInteractionModal = (lead: Lead) => {
    if (!isAiActive) return alert("AI is currently turned off.");
    setSelectedLead(lead);
    setInteractionStep('preview');
    setClientForm({ name: '', companyName: '', mobile: '', email: '', serviceNeeded: lead.serviceNeeded, monthlyManagement: true, meetingDate: '' });
  };

  const startVoiceCall = () => {
    setInteractionStep('calling');
    addLog('VoiceCall', selectedLead!.website, `Voice AI initiated call with ${selectedLead!.website}.`);
  };

  const handleClientResponse = (isInterested: boolean) => {
    if (isInterested) {
      setInteractionStep('form');
    } else {
      setLeads(prev => prev.map(l => l.id === selectedLead?.id ? { ...l, contactStatus: 'Not Interested' } : l));
      addLog('VoiceCall', selectedLead!.website, `Client was not interested. Voice AI ended politely.`);
      setSelectedLead(null);
      setInteractionStep(null);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const isMeetingBooked = !!clientForm.meetingDate;
    
    setLeads(prev => prev.map(l => l.id === selectedLead?.id ? { 
      ...l, 
      contactStatus: isMeetingBooked ? 'Meeting Booked' : 'Interested',
      details: clientForm
    } : l));
    
    addLog('Interaction', selectedLead!.website, `Client Details captured. ${isMeetingBooked ? 'Meeting Booked for ' + new Date(clientForm.meetingDate!).toLocaleString() : ''}`);
    if (gmailNotif) addLog('System', 'Gmail', `Notification sent for ${clientForm.companyName}`);
    if (whatsappNotif) addLog('System', 'WhatsApp', `Notification sent for ${clientForm.companyName}`);
    
    setSelectedLead(null);
    setInteractionStep(null);
  };

  const handleSendProposal = (lead: Lead) => {
    addLog('System', 'WhatsApp', `Automated Proposal & Portfolio sent to ${lead.details?.companyName || lead.website} via WhatsApp.`);
    alert(`Proposal sent to ${lead.details?.mobile} on WhatsApp!`);
  };

  // --- Components ---
  const StatCard = ({ title, value, icon: Icon, colorClass, subtitle }: any) => (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm flex items-center space-x-4">
      <div className={`p-3 rounded-lg ${colorClass}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
        {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-gray-50 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col fixed h-full z-10">
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center space-x-3 mb-2">
            <Bot className="w-8 h-8 text-blue-400" />
            <h1 className="text-lg font-bold leading-tight">Pramod Singh<br/><span className="text-blue-400 font-medium">Website Mgmt</span></h1>
          </div>
          <p className="text-xs text-slate-400 font-medium tracking-wide">AI SALES AGENT</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          <button onClick={() => setActiveTab('overview')} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'overview' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800'}`}>
            <LayoutDashboard className="w-5 h-5" /><span>Overview Dashboard</span>
          </button>
          <button onClick={() => setActiveTab('scanner')} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'scanner' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800'}`}>
            <ScanSearch className="w-5 h-5" /><span>Auto Scanner</span>
          </button>
          <button onClick={() => setActiveTab('leads')} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'leads' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800'}`}>
            <ListTodo className="w-5 h-5" /><span>Qualified Leads</span>
          </button>
          <button onClick={() => setActiveTab('logs')} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'logs' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800'}`}>
            <History className="w-5 h-5" /><span>Conversation History</span>
          </button>
        </nav>

        <div className="p-6 border-t border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">System AI</span>
            <button onClick={() => setIsAiActive(!isAiActive)} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isAiActive ? 'bg-green-500' : 'bg-slate-600'}`}>
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isAiActive ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium flex items-center"><Mic className="w-4 h-4 mr-2"/> Voice AI</span>
            <button onClick={() => setIsVoiceAiActive(!isVoiceAiActive)} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isVoiceAiActive ? 'bg-purple-500' : 'bg-slate-600'}`}>
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isVoiceAiActive ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
          <div className="pt-2 mt-2 border-t border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-slate-400">Notifications</span>
            </div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-300 flex items-center"><Mail className="w-4 h-4 mr-2"/> Gmail</span>
              <button onClick={() => setGmailNotif(!gmailNotif)} className={`relative inline-flex h-4 w-8 items-center rounded-full transition-colors ${gmailNotif ? 'bg-blue-500' : 'bg-slate-600'}`}>
                <span className={`inline-block h-2.5 w-2.5 transform rounded-full bg-white transition-transform ${gmailNotif ? 'translate-x-4.5' : 'translate-x-1'}`} />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-300 flex items-center"><MessageSquare className="w-4 h-4 mr-2"/> WhatsApp</span>
              <button onClick={() => setWhatsappNotif(!whatsappNotif)} className={`relative inline-flex h-4 w-8 items-center rounded-full transition-colors ${whatsappNotif ? 'bg-emerald-500' : 'bg-slate-600'}`}>
                <span className={`inline-block h-2.5 w-2.5 transform rounded-full bg-white transition-transform ${whatsappNotif ? 'translate-x-4.5' : 'translate-x-1'}`} />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 p-8">
        <header className="mb-8 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 capitalize">{activeTab.replace('-', ' ')}</h2>
            <p className="text-gray-500 text-sm mt-1">
              {activeTab === 'overview' && 'High-level metrics and revenue tracking.'}
              {activeTab === 'scanner' && 'Automated daily discovery of new potential clients.'}
              {activeTab === 'leads' && 'AI qualified leads awaiting your manual approval.'}
              {activeTab === 'logs' && 'Full history of automated audits and Voice AI calls.'}
            </p>
          </div>
          {!isAiActive && (
            <div className="bg-red-50 text-red-700 px-4 py-2 rounded-lg border border-red-200 flex items-center">
              <ShieldAlert className="w-5 h-5 mr-2" />
              <span className="font-medium text-sm">AI Agent Paused</span>
            </div>
          )}
        </header>

        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard title="Est. Revenue" value={`₹${stats.revenue.toLocaleString('en-IN')}`} icon={DollarSign} colorClass="bg-emerald-100 text-emerald-600" subtitle="From booked meetings" />
              <StatCard title="Meetings Booked" value={stats.meetingsBooked} icon={Calendar} colorClass="bg-blue-100 text-blue-600" />
              <StatCard title="Qualified Leads" value={leads.filter(l => l.qualification === 'High').length} icon={CheckCircle2} colorClass="bg-purple-100 text-purple-600" subtitle="AI Score > 80" />
              <StatCard title="Voice Calls Made" value={stats.todaysCalls} icon={Mic} colorClass="bg-orange-100 text-orange-600" />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center"><Activity className="w-5 h-5 mr-2 text-gray-500" /> Pipeline Overview</h3>
                <div className="flex h-12 rounded-lg overflow-hidden">
                  <div style={{width: `${(stats.totalContacted / Math.max(leads.length, 1)) * 100}%`}} className="bg-blue-500 flex items-center justify-center text-xs font-bold text-white transition-all">Contacted</div>
                  <div style={{width: `${(stats.interested / Math.max(leads.length, 1)) * 100}%`}} className="bg-emerald-500 flex items-center justify-center text-xs font-bold text-white transition-all">Interested</div>
                  <div style={{width: `${(stats.followUpPending / Math.max(leads.length, 1)) * 100}%`}} className="bg-amber-400 flex items-center justify-center text-xs font-bold text-white transition-all">Pending</div>
                </div>
                <div className="mt-4 flex justify-between text-sm text-gray-600">
                  <span>Contacted: {stats.totalContacted}</span>
                  <span>Interested: {stats.interested}</span>
                  <span>Pending: {stats.followUpPending}</span>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center"><Calendar className="w-5 h-5 mr-2 text-blue-500" /> Upcoming Meetings</h3>
                {upcomingMeetings.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">No upcoming meetings scheduled.</p>
                ) : (
                  <div className="space-y-3">
                    {upcomingMeetings.slice(0, 3).map(lead => (
                      <div key={lead.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-100">
                        <div>
                          <p className="font-medium text-sm text-gray-900">{lead.details?.companyName || lead.website}</p>
                          <p className="text-xs text-gray-500">{lead.serviceNeeded}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-blue-600">{lead.date.toLocaleDateString()}</p>
                          <p className="text-xs text-gray-500">{lead.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'scanner' && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 text-center max-w-2xl mx-auto mt-10">
            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <ScanSearch className="w-10 h-10 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Auto Website Scanner</h3>
            <p className="text-gray-500 mb-8">The AI agent will search for local business websites, run a background audit on their performance, mobile responsiveness, and SEO, and then score them.</p>
            <button 
              onClick={runAutoScanner}
              disabled={isScanning || !isAiActive}
              className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isScanning ? (
                <><motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="mr-2"><Settings className="w-5 h-5"/></motion.div> Scanning Internet...</>
              ) : (
                <><ScanSearch className="w-5 h-5 mr-2" /> Start Daily Scan</>
              )}
            </button>
          </div>
        )}

        {activeTab === 'leads' && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/50 flex justify-between items-center">
              <h3 className="font-semibold text-gray-900 flex items-center"><ListTodo className="w-5 h-5 mr-2 text-gray-500" /> Actionable Leads</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-600">
                <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3">Website / Target</th>
                    <th className="px-6 py-3">Service</th>
                    <th className="px-6 py-3">AI Score</th>
                    <th className="px-6 py-3">Detected Issues</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {leads.map(lead => (
                    <tr key={lead.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-900 flex items-center">
                        <Globe className="w-4 h-4 mr-2 text-gray-400" />
                        {lead.website}
                      </td>
                      <td className="px-6 py-4 text-xs font-medium">
                        <span className={`px-2.5 py-1 rounded-md border ${lead.serviceNeeded === 'New Website' ? 'bg-purple-50 text-purple-700 border-purple-200' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>
                          {lead.serviceNeeded}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {lead.score > 0 ? (
                          <div className="flex items-center">
                            <span className={`font-bold mr-2 ${lead.qualification === 'High' ? 'text-emerald-600' : lead.qualification === 'Medium' ? 'text-amber-600' : 'text-gray-500'}`}>
                              {lead.score}
                            </span>
                            <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-medium ${lead.qualification === 'High' ? 'bg-emerald-100 text-emerald-700' : lead.qualification === 'Medium' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600'}`}>
                              {lead.qualification}
                            </span>
                          </div>
                        ) : <span className="text-gray-400">Unscored</span>}
                      </td>
                      <td className="px-6 py-4 max-w-xs truncate" title={lead.detectedIssues.join(', ')}>
                        {lead.detectedIssues.length > 0 ? (
                          <span className="text-red-600 text-xs bg-red-50 px-2 py-1 rounded border border-red-100">
                            {lead.detectedIssues.length} issue(s) detected
                          </span>
                        ) : <span className="text-gray-400">-</span>}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                          ${lead.contactStatus === 'Scanned' ? 'bg-gray-100 text-gray-600' : ''}
                          ${lead.contactStatus === 'Issues Found' ? 'bg-amber-100 text-amber-800' : ''}
                          ${lead.contactStatus === 'No Website' ? 'bg-purple-100 text-purple-800' : ''}
                          ${lead.contactStatus === 'Interested' ? 'bg-emerald-100 text-emerald-800' : ''}
                          ${lead.contactStatus === 'Meeting Booked' ? 'bg-blue-100 text-blue-800' : ''}
                          ${lead.contactStatus === 'Not Interested' ? 'bg-red-100 text-red-800' : ''}
                        `}>
                          {lead.contactStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {lead.auditStatus === 'Pending' && lead.serviceNeeded === 'Website Management' && (
                          <button onClick={() => handleSimulateAudit(lead.id)} className="text-blue-600 hover:text-blue-800 font-medium text-sm transition-colors">
                            Run Audit
                          </button>
                        )}
                        {['Issues Found', 'No Website'].includes(lead.contactStatus) && (
                          <button 
                            onClick={() => openInteractionModal(lead)} 
                            className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 transition-colors"
                          >
                            <FileText className="w-4 h-4 mr-1.5" />
                            Preview & Call
                          </button>
                        )}
                        {['Interested', 'Meeting Booked'].includes(lead.contactStatus) && lead.details && (
                           <div className="flex flex-col items-end gap-2">
                             <span className="text-emerald-600 font-medium text-xs flex items-center">
                               <Check className="w-3 h-3 mr-1" /> Secured
                             </span>
                             <button 
                               onClick={() => handleSendProposal(lead)}
                               className="inline-flex items-center text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2.5 py-1.5 rounded transition-colors"
                             >
                               <MessageSquare className="w-3 h-3 mr-1.5" /> Send Proposal
                             </button>
                           </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'logs' && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/50">
              <h3 className="font-semibold text-gray-900 flex items-center"><History className="w-5 h-5 mr-2 text-gray-500" /> Full Conversation History</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {logs.map(log => (
                  <div key={log.id} className="flex gap-4 p-4 rounded-lg bg-gray-50 border border-gray-100">
                    <div className="mt-1">
                      {log.type === 'System' && <Settings className="w-5 h-5 text-gray-400" />}
                      {log.type === 'Audit' && <AlertTriangle className="w-5 h-5 text-amber-500" />}
                      {log.type === 'Interaction' && <MessageSquare className="w-5 h-5 text-emerald-500" />}
                      {log.type === 'VoiceCall' && <Mic className="w-5 h-5 text-purple-500" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm text-gray-900">{log.website}</span>
                        <span className="text-xs text-gray-400">{log.timestamp.toLocaleTimeString()}</span>
                      </div>
                      <p className="text-sm text-gray-600">{log.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Interaction Modal (Manual Approval & Voice AI) */}
      <AnimatePresence>
        {selectedLead && interactionStep && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-xl overflow-hidden border border-gray-200"
            >
              <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <div className="flex items-center space-x-2">
                  <Bot className="w-5 h-5 text-blue-600" />
                  <h3 className="font-semibold text-gray-900">
                    {interactionStep === 'preview' && 'Review AI Script (Manual Approval)'}
                    {interactionStep === 'calling' && 'Voice AI Call in Progress'}
                    {interactionStep === 'form' && 'Client Onboarding & Meeting Booking'}
                  </h3>
                </div>
                <button onClick={() => { setSelectedLead(null); setInteractionStep(null); }} className="text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-6">
                <div className="mb-6 flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Target</p>
                    <p className="font-medium text-gray-900 flex items-center"><Globe className="w-4 h-4 mr-2 text-gray-400"/> {selectedLead.website}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">AI Score</p>
                    <p className="font-bold text-gray-900">{selectedLead.score} / 100</p>
                  </div>
                </div>

                {interactionStep === 'preview' && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                    <div className="bg-purple-50 border border-purple-100 rounded-xl p-5 relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-3 opacity-10">
                         <FileText className="w-16 h-16" />
                      </div>
                      <p className="text-xs text-purple-600 font-bold mb-3 uppercase tracking-wide flex items-center">
                        <PlayCircle className="w-4 h-4 mr-1.5" /> Generated Voice Script ({selectedLead.serviceNeeded})
                      </p>
                      
                      {selectedLead.serviceNeeded === 'Website Management' ? (
                        <p className="text-gray-800 text-sm leading-relaxed font-medium">
                          "नमस्ते! मैं Pramod Singh Website Management का AI Assistant हूँ। हमने आपकी वेबसाइट ({selectedLead.website}) का ऑडिट किया है और कुछ सुधार की ज़रूरत देखी है, जैसे: <span className="text-red-600">{selectedLead.detectedIssues.join(', ')}</span>। क्या मैं 2 मिनट में बता सकता हूँ कि हम इसे कैसे फिक्स कर सकते हैं?"
                        </p>
                      ) : (
                        <p className="text-gray-800 text-sm leading-relaxed font-medium">
                          "नमस्ते! मैं Pramod Singh Website Management का AI Assistant हूँ। हमने देखा कि आपके बिज़नेस की अभी कोई वेबसाइट नहीं है। <br/><br/>
                          एक प्रोफेशनल वेबसाइट होने से आपको कई बड़े फायदे होते हैं:<br/>
                          <span className="text-purple-700 font-bold">1.</span> <strong>24/7 ऑनलाइन दुकान:</strong> आपकी वेबसाइट हमेशा खुली रहती है, कस्टमर कभी भी जानकारी ले सकते हैं।<br/>
                          <span className="text-purple-700 font-bold">2.</span> <strong>कस्टमर का भरोसा:</strong> बिना वेबसाइट वाले बिज़नेस पर लोग कम भरोसा करते हैं।<br/>
                          <span className="text-purple-700 font-bold">3.</span> <strong>ज्यादा सेल्स और लीड्स:</strong> गूगल से नए कस्टमर आपको सीधे ढूंढ सकते हैं।<br/>
                          <span className="text-purple-700 font-bold">4.</span> <strong>ग्लोबल रीच:</strong> सिर्फ लोकल नहीं, आप कहीं भी सर्विस दे सकते हैं।<br/><br/>
                          क्या मैं आपको 2 मिनट में बता सकता हूँ कि हम आपके लिए एक शानदार और किफायती वेबसाइट कैसे बना सकते हैं?"
                        </p>
                      )}
                    </div>
                    
                    <div className="flex gap-3 pt-2">
                      <button 
                        onClick={() => { setSelectedLead(null); setInteractionStep(null); }}
                        className="flex-1 bg-white text-gray-700 border border-gray-300 px-4 py-3 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                      <button 
                        onClick={startVoiceCall}
                        disabled={!isVoiceAiActive}
                        className="flex-[2] bg-purple-600 text-white px-4 py-3 rounded-lg text-sm font-semibold hover:bg-purple-700 transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Mic className="w-4 h-4 mr-2" />
                        Approve & Start Voice Call
                      </button>
                    </div>
                    {!isVoiceAiActive && <p className="text-xs text-red-500 text-center">Voice AI is currently disabled in settings.</p>}
                  </motion.div>
                )}

                {interactionStep === 'calling' && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="text-center py-6">
                    <div className="mb-6 flex justify-center">
                       <div className="relative">
                          <div className="w-24 h-24 bg-purple-100 rounded-full flex items-center justify-center z-10 relative">
                             <Mic className="w-10 h-10 text-purple-600" />
                          </div>
                          <motion.div 
                            animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                            transition={{ repeat: Infinity, duration: 1.5 }}
                            className="absolute inset-0 bg-purple-400 rounded-full z-0"
                          />
                       </div>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">AI is speaking with the client...</h3>
                    <p className="text-gray-500 text-sm mb-6">Listen in on the conversation. Waiting for client response.</p>
                    
                    <div className="mb-6 p-4 bg-purple-50/50 rounded-xl border border-purple-100 text-left">
                      <p className="text-xs font-semibold text-purple-800 uppercase mb-3 flex items-center">
                        <Bot className="w-3 h-3 mr-1.5" /> AI Knowledge Base Capabilities (Test Questions)
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <button 
                          onClick={() => {
                            addLog('VoiceCall', selectedLead!.website, 'Client asked for benefits. AI Explained: 1. 24/7 Availability 2. Customer Trust 3. Google Search Visibility 4. Global Reach.');
                            alert('AI Voice Output: "वेबसाइट बनवाने के बहुत से फायदे हैं सर। पहला, आपकी दुकान इंटरनेट पर 24 घंटे खुली रहती है। दूसरा, कस्टमर को आप पर ज्यादा भरोसा होता है। तीसरा, गूगल से नए कस्टमर आपको सीधे ढूंढ सकते हैं और आपकी सेल्स बढ़ सकती है।"');
                          }} 
                          className="text-xs bg-white border border-purple-200 text-purple-700 px-3 py-2 rounded-lg hover:bg-purple-100 transition-colors font-medium shadow-sm"
                        >
                          "वेबसाइट बनवाने के क्या फायदे हैं?"
                        </button>
                        <button 
                          onClick={() => {
                            addLog('VoiceCall', selectedLead!.website, 'Client asked about pricing. AI Responded: Explained basic packages and monthly management.');
                            alert('AI Voice Output: "हम बहुत ही किफायती पैकेजेस ऑफर करते हैं। साथ ही हम मंथली मैनेजमेंट भी देते हैं ताकि आपको कोई टेक्निकल चिंता न करनी पड़े।"');
                          }} 
                          className="text-xs bg-white border border-purple-200 text-purple-700 px-3 py-2 rounded-lg hover:bg-purple-100 transition-colors font-medium shadow-sm"
                        >
                          "खर्चा कितना आएगा?"
                        </button>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-gray-100">
                      <p className="text-sm font-medium text-gray-700 mb-3 text-left">Simulate Call Outcome:</p>
                      <div className="flex gap-3">
                        <button 
                          onClick={() => handleClientResponse(true)}
                          className="flex-1 bg-emerald-600 text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-emerald-700 transition-colors flex items-center justify-center"
                        >
                          <CheckCircle2 className="w-4 h-4 mr-2" /> Client Interested
                        </button>
                        <button 
                          onClick={() => handleClientResponse(false)}
                          className="flex-1 bg-white text-red-600 border border-red-200 px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-red-50 transition-colors flex items-center justify-center"
                        >
                          <XCircle className="w-4 h-4 mr-2" /> Not Interested
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}

                {interactionStep === 'form' && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                    <div className="mb-4 bg-emerald-50 border border-emerald-100 p-3 rounded-lg flex items-start">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 mr-2 mt-0.5 shrink-0" />
                      <p className="text-sm text-emerald-800">Client showed interest on the call! Please log their details and book a follow-up meeting.</p>
                    </div>
                    <form onSubmit={handleFormSubmit} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                          <div className="relative">
                            <input required type="text" value={clientForm.name} onChange={e => setClientForm({...clientForm, name: e.target.value})} className="w-full rounded-lg border-gray-300 border px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500 outline-none" placeholder="Client Name" />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                          <div className="relative">
                            <input required type="text" value={clientForm.companyName} onChange={e => setClientForm({...clientForm, companyName: e.target.value})} className="w-full rounded-lg border-gray-300 border px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500 outline-none" placeholder="Company Name" />
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Mobile</label>
                          <div className="relative">
                            <input required type="tel" value={clientForm.mobile} onChange={e => setClientForm({...clientForm, mobile: e.target.value})} className="w-full rounded-lg border-gray-300 border px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500 outline-none" placeholder="+91..." />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                          <div className="relative">
                            <input required type="email" value={clientForm.email} onChange={e => setClientForm({...clientForm, email: e.target.value})} className="w-full rounded-lg border-gray-300 border px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500 outline-none" placeholder="email@example.com" />
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="pt-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Book Meeting (Optional)</label>
                          <div className="relative">
                            <Calendar className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input type="datetime-local" value={clientForm.meetingDate} onChange={e => setClientForm({...clientForm, meetingDate: e.target.value})} className="pl-9 w-full rounded-lg border-gray-300 border px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500 outline-none" />
                          </div>
                        </div>
                        <div className="pt-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Service Needed</label>
                          <select 
                            value={clientForm.serviceNeeded} 
                            onChange={e => setClientForm({...clientForm, serviceNeeded: e.target.value as ServiceType})}
                            className="w-full rounded-lg border-gray-300 border px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500 outline-none"
                          >
                            <option value="Website Management">Website Management</option>
                            <option value="New Website">New Website</option>
                          </select>
                        </div>
                      </div>

                      <div className="flex items-center mt-2">
                        <input 
                          type="checkbox" id="monthly" checked={clientForm.monthlyManagement} onChange={e => setClientForm({...clientForm, monthlyManagement: e.target.checked})}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="monthly" className="ml-2 block text-sm text-gray-700">
                          Interested in Monthly Website Management
                        </label>
                      </div>
                      
                      <div className="pt-4 mt-2 border-t border-gray-100 flex justify-end space-x-3">
                        <button type="submit" className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 flex items-center">
                          <Check className="w-4 h-4 mr-2" /> Save & Book
                        </button>
                      </div>
                    </form>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
