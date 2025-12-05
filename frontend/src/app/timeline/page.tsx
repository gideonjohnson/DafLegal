"use client"
import Image from 'next/image'

import { useState, useCallback, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import { Navigation } from '@/components/Navigation'

interface Matter {
  matter_id: string
  name: string
  description?: string
  created_at: string
  document_count: number
  event_count: number
  hot_docs_count: number
}

interface TimelineEvent {
  date: string
  date_precision: string
  event_type: string
  description: string
  parties_involved: string[]
  significance: string
  quote?: string
  source_doc_id: string
  source_filename: string
  source_is_hot: boolean
}

interface TimelineEntry {
  date: string
  events: TimelineEvent[]
  source_docs: string[]
  event_count: number
  has_hot_doc: boolean
}

interface HotDoc {
  doc_id: string
  filename: string
  importance: string
  reason: string
  doc_type: string
  doc_date?: string
  summary: string
}

interface DocumentInfo {
  doc_id: string
  filename: string
  doc_type: string
  doc_date?: string
  importance: string
  is_hot_doc: boolean
  hot_doc_reason: string
  summary: string
  event_count: number
  uploaded_at: string
}

interface TimelineData {
  matter_id: string
  matter_name: string
  date_range: { start?: string; end?: string }
  key_parties: string[]
  hot_docs: HotDoc[]
  timeline: TimelineEntry[]
  documents: DocumentInfo[]
  statistics: {
    total_events: number
    total_documents: number
    hot_docs_count: number
    date_range_days: number
  }
  matter_summary?: string
}

export default function TimelinePage() {
  const [matters, setMatters] = useState<Matter[]>([])
  const [selectedMatter, setSelectedMatter] = useState<string | null>(null)
  const [timelineData, setTimelineData] = useState<TimelineData | null>(null)
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [newMatterName, setNewMatterName] = useState('')
  const [showNewMatter, setShowNewMatter] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [selectedDoc, setSelectedDoc] = useState<string | null>(null)
  const [docDetails, setDocDetails] = useState<any>(null)
  const [activeView, setActiveView] = useState<'timeline' | 'documents' | 'hotdocs'>('timeline')
  const [filterParty, setFilterParty] = useState<string>('')

  useEffect(() => {
    loadMatters()
  }, [])

  useEffect(() => {
    if (selectedMatter) {
      loadTimeline()
    }
  }, [selectedMatter])

  const loadMatters = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/v1/timeline/matters', {
        headers: { 'Authorization': 'Bearer demo-key' }
      })
      const data = await res.json()
      setMatters(data)
    } catch (err) {
      console.error('Failed to load matters:', err)
    }
  }

  const createMatter = async () => {
    if (!newMatterName.trim()) return
    setLoading(true)
    try {
      const res = await fetch('http://localhost:8000/api/v1/timeline/matters', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer demo-key',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name: newMatterName })
      })
      const matter = await res.json()
      setMatters([matter, ...matters])
      setSelectedMatter(matter.matter_id)
      setNewMatterName('')
      setShowNewMatter(false)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const loadTimeline = async () => {
    if (!selectedMatter) return
    setLoading(true)
    try {
      const res = await fetch(`http://localhost:8000/api/v1/timeline/matters/${selectedMatter}/timeline`, {
        headers: { 'Authorization': 'Bearer demo-key' }
      })
      const data = await res.json()
      setTimelineData(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (!selectedMatter || acceptedFiles.length === 0) return

    setUploading(true)
    setError('')

    for (const file of acceptedFiles) {
      try {
        const formData = new FormData()
        formData.append('file', file)

        await fetch(`http://localhost:8000/api/v1/timeline/matters/${selectedMatter}/documents`, {
          method: 'POST',
          headers: { 'Authorization': 'Bearer demo-key' },
          body: formData
        })
      } catch (err) {
        console.error(`Failed to upload ${file.name}:`, err)
      }
    }

    setUploading(false)
    loadTimeline()
    loadMatters()
  }, [selectedMatter])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/msword': ['.doc'],
      'text/plain': ['.txt']
    },
    maxSize: 25 * 1024 * 1024
  })

  const handleSearch = async () => {
    if (!selectedMatter || !searchQuery.trim()) return
    try {
      const res = await fetch(
        `http://localhost:8000/api/v1/timeline/matters/${selectedMatter}/search?query=${encodeURIComponent(searchQuery)}`,
        { headers: { 'Authorization': 'Bearer demo-key' } }
      )
      const data = await res.json()
      setSearchResults(data.results || [])
    } catch (err) {
      console.error('Search failed:', err)
    }
  }

  const loadDocDetails = async (docId: string) => {
    if (!selectedMatter) return
    try {
      const res = await fetch(
        `http://localhost:8000/api/v1/timeline/matters/${selectedMatter}/documents/${docId}`,
        { headers: { 'Authorization': 'Bearer demo-key' } }
      )
      const data = await res.json()
      setDocDetails(data)
      setSelectedDoc(docId)
    } catch (err) {
      console.error('Failed to load document:', err)
    }
  }

  const deleteDocument = async (docId: string) => {
    if (!selectedMatter) return
    try {
      await fetch(`http://localhost:8000/api/v1/timeline/matters/${selectedMatter}/documents/${docId}`, {
        method: 'DELETE',
        headers: { 'Authorization': 'Bearer demo-key' }
      })
      loadTimeline()
      loadMatters()
      if (selectedDoc === docId) {
        setSelectedDoc(null)
        setDocDetails(null)
      }
    } catch (err) {
      console.error('Failed to delete document:', err)
    }
  }

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case 'communication': return '📧'
      case 'agreement': return '🤝'
      case 'breach': return '⚠️'
      case 'payment': return '💰'
      case 'filing': return '📋'
      case 'meeting': return '👥'
      case 'deadline': return '⏰'
      case 'notice': return '📢'
      default: return '📌'
    }
  }

  const getSignificanceBadge = (sig: string) => {
    switch (sig) {
      case 'high': return 'badge-error'
      case 'medium': return 'badge-warning'
      default: return 'badge'
    }
  }

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    } catch {
      return dateStr
    }
  }

  const filteredTimeline = timelineData?.timeline.filter(entry => {
    if (!filterParty) return true
    return entry.events.some(e => e.parties_involved.includes(filterParty))
  }) || []

  return (
    <div className="min-h-screen leather-bg relative overflow-hidden">
      {/* Background Image with Green Blend */}
      <div className="fixed inset-0 z-0">
        <Image
          src="/webimg2.jpeg"
          alt="Background"
          fill
          className="object-cover opacity-20"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a2e1a]/70 via-[#234023]/65 to-[#2d5a2d]/70"></div>
      </div>

      <div className="relative z-10">
        <Navigation />
      <Navigation />
      <main className="py-12 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <div className="icon-box w-14 h-14 rounded-xl">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h1 className="heading-lg">Matter Timeline</h1>
                <p className="text-[#d4c4a8] text-lg mt-1">Build fact chronologies from your case documents</p>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-4 gap-6">
            {/* Sidebar - Matters & Upload */}
            <div className="lg:col-span-1 space-y-4">
              {/* New Matter */}
              <div className="card-dark p-4">
                {showNewMatter ? (
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={newMatterName}
                      onChange={(e) => setNewMatterName(e.target.value)}
                      placeholder="Matter name..."
                      className="input w-full"
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <button onClick={createMatter} className="btn-primary flex-1 text-sm" disabled={loading}>
                        Create
                      </button>
                      <button onClick={() => setShowNewMatter(false)} className="btn-ghost text-sm">
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button onClick={() => setShowNewMatter(true)} className="btn-primary w-full">
                    + New Matter
                  </button>
                )}
              </div>

              {/* Matters List */}
              <div className="card-dark p-4">
                <h3 className="font-bold text-[#f2e8d5] mb-3">Your Matters</h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {matters.length === 0 ? (
                    <p className="text-sm text-[#d4c4a8] text-center py-4">No matters yet</p>
                  ) : (
                    matters.map((m) => (
                      <button
                        key={m.matter_id}
                        onClick={() => setSelectedMatter(m.matter_id)}
                        className={`w-full text-left p-3 rounded-xl transition-all ${
                          selectedMatter === m.matter_id
                            ? 'bg-[#d4c4a8]/20 border border-[#d4c4a8]/30'
                            : 'hover:bg-[#d4c4a8]/10'
                        }`}
                      >
                        <p className="font-semibold text-[#f2e8d5] text-sm truncate">{m.name}</p>
                        <div className="flex gap-3 mt-1 text-xs text-[#d4c4a8]">
                          <span>{m.document_count} docs</span>
                          <span>{m.event_count} events</span>
                          {m.hot_docs_count > 0 && (
                            <span className="text-red-400">🔥 {m.hot_docs_count}</span>
                          )}
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>

              {/* Upload Area */}
              {selectedMatter && (
                <div className="card-dark p-4">
                  <h3 className="font-bold text-[#f2e8d5] mb-3">Add Documents</h3>
                  <div
                    {...getRootProps()}
                    className={`dropzone p-6 text-center ${isDragActive ? 'active' : ''}`}
                  >
                    <input {...getInputProps()} />
                    {uploading ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="spinner" />
                        <span className="text-[#d4c4a8]">Uploading...</span>
                      </div>
                    ) : (
                      <>
                        <svg className="w-8 h-8 mx-auto mb-2 text-[#d4c4a8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <p className="text-sm text-[#d4c4a8]">
                          {isDragActive ? 'Drop files here' : 'Drag files or click'}
                        </p>
                        <p className="text-xs text-[#d4c4a8]/60 mt-1">PDF, DOCX, TXT</p>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              {!selectedMatter ? (
                <div className="card-dark p-12 text-center">
                  <div className="icon-box-outline w-20 h-20 rounded-2xl mx-auto mb-6">
                    <svg className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-bold text-[#f2e8d5] mb-2">Select or Create a Matter</h2>
                  <p className="text-[#d4c4a8]">Choose an existing matter or create a new one to start building your timeline</p>
                </div>
              ) : loading ? (
                <div className="card-dark p-12 text-center">
                  <div className="spinner mx-auto mb-4" />
                  <span className="text-[#d4c4a8]">Loading timeline...</span>
                </div>
              ) : timelineData && timelineData.documents.length === 0 ? (
                <div className="card-dark p-12 text-center">
                  <div className="icon-box-outline w-20 h-20 rounded-2xl mx-auto mb-6">
                    <svg className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-bold text-[#f2e8d5] mb-2">Upload Documents</h2>
                  <p className="text-[#d4c4a8]">Add emails, contracts, and other documents to build your chronology</p>
                </div>
              ) : timelineData && (
                <div className="space-y-6">
                  {/* Stats Row */}
                  <div className="grid grid-cols-4 gap-4">
                    <div className="card-glass p-4 text-center">
                      <p className="text-3xl font-bold text-[#f2e8d5]">{timelineData.statistics.total_documents}</p>
                      <p className="text-sm text-[#d4c4a8]">Documents</p>
                    </div>
                    <div className="card-glass p-4 text-center">
                      <p className="text-3xl font-bold text-[#f2e8d5]">{timelineData.statistics.total_events}</p>
                      <p className="text-sm text-[#d4c4a8]">Events</p>
                    </div>
                    <div className="card-glass p-4 text-center">
                      <p className="text-3xl font-bold text-red-400">{timelineData.statistics.hot_docs_count}</p>
                      <p className="text-sm text-[#d4c4a8]">Hot Docs</p>
                    </div>
                    <div className="card-glass p-4 text-center">
                      <p className="text-3xl font-bold text-[#f2e8d5]">{timelineData.statistics.date_range_days}</p>
                      <p className="text-sm text-[#d4c4a8]">Days Span</p>
                    </div>
                  </div>

                  {/* Search */}
                  <div className="card-dark p-4">
                    <div className="flex gap-3">
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        placeholder="Search events, parties, documents..."
                        className="input flex-1"
                      />
                      <button onClick={handleSearch} className="btn-primary px-6">Search</button>
                    </div>
                    {searchResults.length > 0 && (
                      <div className="mt-4 space-y-2 max-h-48 overflow-y-auto">
                        {searchResults.map((r, idx) => (
                          <div key={idx} className="card-glass p-3 text-sm">
                            {r.type === 'event' ? (
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="text-[#d4c4a8]">{r.date}</span>
                                  {r.is_hot_doc && <span className="text-red-400">🔥</span>}
                                </div>
                                <p className="text-[#f2e8d5]">{r.description}</p>
                                <p className="text-xs text-[#d4c4a8]">From: {r.source_filename}</p>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <span className="text-[#f2e8d5]">{r.filename}</span>
                                {r.is_hot_doc && <span className="text-red-400">🔥</span>}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* View Tabs */}
                  <div className="tabs inline-flex">
                    <button onClick={() => setActiveView('timeline')} className={`tab ${activeView === 'timeline' ? 'active' : ''}`}>
                      Timeline
                    </button>
                    <button onClick={() => setActiveView('hotdocs')} className={`tab ${activeView === 'hotdocs' ? 'active' : ''}`}>
                      Hot Docs ({timelineData.hot_docs.length})
                    </button>
                    <button onClick={() => setActiveView('documents')} className={`tab ${activeView === 'documents' ? 'active' : ''}`}>
                      All Documents ({timelineData.documents.length})
                    </button>
                  </div>

                  {/* Party Filter */}
                  {activeView === 'timeline' && timelineData.key_parties.length > 0 && (
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm text-[#d4c4a8]">Filter by party:</span>
                      <button
                        onClick={() => setFilterParty('')}
                        className={`badge text-xs ${!filterParty ? 'badge-warning' : ''}`}
                      >
                        All
                      </button>
                      {timelineData.key_parties.slice(0, 8).map((party) => (
                        <button
                          key={party}
                          onClick={() => setFilterParty(party)}
                          className={`badge text-xs ${filterParty === party ? 'badge-warning' : ''}`}
                        >
                          {party}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Timeline View */}
                  {activeView === 'timeline' && (
                    <div className="relative">
                      {/* Timeline line */}
                      <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-[#d4c4a8]/20" />

                      <div className="space-y-6">
                        {filteredTimeline.map((entry, idx) => (
                          <div key={idx} className="relative pl-20">
                            {/* Date marker */}
                            <div className={`absolute left-0 w-16 h-16 rounded-xl flex items-center justify-center text-center ${
                              entry.has_hot_doc ? 'bg-red-400/20 border-2 border-red-400' : 'icon-box'
                            }`}>
                              <div>
                                <div className="text-xs font-bold text-[#d4c4a8]">
                                  {new Date(entry.date).toLocaleDateString('en-US', { month: 'short' })}
                                </div>
                                <div className="text-lg font-bold text-[#f2e8d5]">
                                  {new Date(entry.date).getDate()}
                                </div>
                              </div>
                            </div>

                            {/* Events card */}
                            <div className={`card-dark p-5 ${entry.has_hot_doc ? 'border-l-4 border-red-400' : ''}`}>
                              <div className="flex items-center justify-between mb-3">
                                <span className="text-sm font-bold text-[#d4c4a8]">{formatDate(entry.date)}</span>
                                <span className="badge text-xs">{entry.event_count} event{entry.event_count !== 1 ? 's' : ''}</span>
                              </div>

                              <div className="space-y-4">
                                {entry.events.map((event, eIdx) => (
                                  <div key={eIdx} className="card-glass p-4">
                                    <div className="flex items-start gap-3">
                                      <span className="text-2xl">{getEventTypeIcon(event.event_type)}</span>
                                      <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                          <span className={getSignificanceBadge(event.significance)}>
                                            {event.significance}
                                          </span>
                                          <span className="badge text-xs">{event.event_type}</span>
                                          {event.source_is_hot && <span className="text-red-400">🔥</span>}
                                        </div>
                                        <p className="text-[#f2e8d5] mb-2">{event.description}</p>
                                        {event.quote && (
                                          <blockquote className="text-sm text-[#d4c4a8] italic border-l-2 border-[#d4c4a8]/30 pl-3 mb-2">
                                            "{event.quote}"
                                          </blockquote>
                                        )}
                                        <div className="flex items-center justify-between text-xs text-[#d4c4a8]">
                                          <div className="flex gap-2">
                                            {event.parties_involved.map((p, pIdx) => (
                                              <span key={pIdx} className="badge">{p}</span>
                                            ))}
                                          </div>
                                          <button
                                            onClick={() => loadDocDetails(event.source_doc_id)}
                                            className="hover:text-[#f2e8d5] underline"
                                          >
                                            {event.source_filename}
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Hot Docs View */}
                  {activeView === 'hotdocs' && (
                    <div className="space-y-4">
                      {timelineData.hot_docs.length === 0 ? (
                        <div className="card-dark p-8 text-center">
                          <p className="text-[#d4c4a8]">No hot documents identified yet</p>
                        </div>
                      ) : (
                        timelineData.hot_docs.map((doc) => (
                          <div key={doc.doc_id} className="card-dark p-5 border-l-4 border-red-400">
                            <div className="flex items-start justify-between">
                              <div>
                                <div className="flex items-center gap-3 mb-2">
                                  <span className="text-2xl">🔥</span>
                                  <h4 className="font-bold text-[#f2e8d5]">{doc.filename}</h4>
                                  <span className="badge-error">{doc.importance.toUpperCase()}</span>
                                </div>
                                <p className="text-[#e5d9c3] mb-3">{doc.summary}</p>
                                <div className="card-glass p-3 mb-3">
                                  <p className="text-sm font-bold text-red-400 mb-1">Why this is important:</p>
                                  <p className="text-sm text-[#d4c4a8]">{doc.reason}</p>
                                </div>
                                <div className="flex gap-4 text-sm text-[#d4c4a8]">
                                  <span>{doc.doc_type}</span>
                                  {doc.doc_date && <span>{formatDate(doc.doc_date)}</span>}
                                </div>
                              </div>
                              <button
                                onClick={() => loadDocDetails(doc.doc_id)}
                                className="btn-ghost text-sm"
                              >
                                View
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}

                  {/* Documents View */}
                  {activeView === 'documents' && (
                    <div className="space-y-3">
                      {timelineData.documents.map((doc) => (
                        <div key={doc.doc_id} className={`card-dark p-4 ${doc.is_hot_doc ? 'border-l-4 border-red-400' : ''}`}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              {doc.is_hot_doc && <span>🔥</span>}
                              <div>
                                <p className="font-bold text-[#f2e8d5]">{doc.filename}</p>
                                <div className="flex gap-3 text-xs text-[#d4c4a8]">
                                  <span>{doc.doc_type}</span>
                                  <span>{doc.event_count} events</span>
                                  {doc.doc_date && <span>{doc.doc_date}</span>}
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <button onClick={() => loadDocDetails(doc.doc_id)} className="btn-ghost text-sm">View</button>
                              <button onClick={() => deleteDocument(doc.doc_id)} className="btn-ghost text-sm text-red-400">Delete</button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Matter Summary */}
                  {timelineData.matter_summary && (
                    <div className="card-dark p-6">
                      <h3 className="text-lg font-bold text-[#f2e8d5] mb-3">Matter Summary</h3>
                      <p className="text-[#e5d9c3] whitespace-pre-line">{timelineData.matter_summary}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Document Details Modal */}
          {selectedDoc && docDetails && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedDoc(null)}>
              <div className="card-dark max-w-3xl w-full max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                <div className="p-6 border-b border-[#d4c4a8]/10 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {docDetails.is_hot_doc && <span className="text-2xl">🔥</span>}
                    <div>
                      <h2 className="text-xl font-bold text-[#f2e8d5]">{docDetails.filename}</h2>
                      <p className="text-sm text-[#d4c4a8]">{docDetails.doc_type} | {docDetails.word_count} words</p>
                    </div>
                  </div>
                  <button onClick={() => setSelectedDoc(null)} className="btn-ghost">Close</button>
                </div>
                <div className="p-6 space-y-6">
                  {docDetails.summary && (
                    <div>
                      <h3 className="font-bold text-[#f2e8d5] mb-2">Summary</h3>
                      <p className="text-[#e5d9c3]">{docDetails.summary}</p>
                    </div>
                  )}
                  {docDetails.is_hot_doc && docDetails.hot_doc_reason && (
                    <div className="card-glass p-4 border-l-4 border-red-400">
                      <p className="font-bold text-red-400 mb-1">Hot Document</p>
                      <p className="text-[#d4c4a8]">{docDetails.hot_doc_reason}</p>
                    </div>
                  )}
                  {docDetails.events?.length > 0 && (
                    <div>
                      <h3 className="font-bold text-[#f2e8d5] mb-3">Extracted Events ({docDetails.events.length})</h3>
                      <div className="space-y-3">
                        {docDetails.events.map((e: any, idx: number) => (
                          <div key={idx} className="card-glass p-3">
                            <div className="flex items-center gap-2 mb-1">
                              <span>{getEventTypeIcon(e.event_type)}</span>
                              <span className="text-sm text-[#d4c4a8]">{e.date}</span>
                              <span className={getSignificanceBadge(e.significance)}>{e.significance}</span>
                            </div>
                            <p className="text-[#f2e8d5]">{e.description}</p>
                            {e.quote && (
                              <p className="text-sm text-[#d4c4a8] italic mt-1">"{e.quote}"</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {docDetails.content_preview && (
                    <div>
                      <h3 className="font-bold text-[#f2e8d5] mb-2">Content Preview</h3>
                      <div className="card-glass p-4 max-h-64 overflow-y-auto">
                        <pre className="text-sm text-[#d4c4a8] whitespace-pre-wrap font-mono">{docDetails.content_preview}</pre>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
      </div>
  )
}
