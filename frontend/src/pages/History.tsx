import { useEffect, useState, useMemo, useRef } from 'react'
import {
  Search,
  Filter,
  FileText,
  AlertTriangle,
  Calendar,
  Activity,
  FileUp,
} from 'lucide-react'
import { useAuth } from '@/auth/AuthContext'
import { Card, Badge, Button, Modal, Spinner } from '@/components/ui'
import {
  fetchReports,
  uploadReport,
  type MedicalReport,
  type ParsedReportData,
} from '@/features/dashboard/reportsApi'
import {
  fetchDashboard,
  type DiabetesPrediction,
  type HeartPrediction,
} from '@/features/dashboard/dashboardApi'
import { cn } from '@/lib/cn'

export function History() {
  const { user } = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Data states
  const [reports, setReports] = useState<MedicalReport[]>([])
  const [diabetesList, setDiabetesList] = useState<DiabetesPrediction[]>([])
  const [heartList, setHeartList] = useState<HeartPrediction[]>([])
  const [loading, setLoading] = useState(true)

  // UI state
  const [activeTab, setActiveTab] = useState<'reports' | 'diabetes' | 'heart'>('reports')
  const [searchQuery, setSearchQuery] = useState('')
  const [riskFilter, setRiskFilter] = useState('ALL')
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest')

  // Upload state
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [isDragOver, setIsDragOver] = useState(false)

  // Details Modal state
  const [selectedReport, setSelectedReport] = useState<MedicalReport | null>(null)
  const [selectedDiabetes, setSelectedDiabetes] = useState<DiabetesPrediction | null>(null)
  const [selectedHeart, setSelectedHeart] = useState<HeartPrediction | null>(null)

  const loadData = async () => {
    if (!user?.userId) return
    setLoading(true)
    try {
      const [fetchedReports, dashboardData] = await Promise.all([
        fetchReports(user.userId),
        fetchDashboard(user.userId),
      ])
      setReports(fetchedReports)
      setDiabetesList(dashboardData.diabetes || [])
      setHeartList(dashboardData.heart || [])
    } catch (err) {
      console.error('Failed to load history data', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [user?.userId])

  // File Upload Handlers
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    await processUpload(file)
  }

  const processUpload = async (file: File) => {
    if (!user?.userId) return
    setUploading(true)
    setUploadError(null)
    try {
      await uploadReport(file, user.userId)
      // Reload lists
      await loadData()
    } catch (err: any) {
      setUploadError(err.message || 'Failed to analyze lab report. Please check the file format.')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  // Drag and Drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = () => {
    setIsDragOver(false)
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file) {
      await processUpload(file)
    }
  }

  // Helper parsers for JSON columns
  const parseJsonSafe = <T = any>(str?: string): T | null => {
    if (!str) return null
    try {
      return JSON.parse(str) as T
    } catch {
      return null
    }
  }

  // Filtering & Sorting
  const filteredReports = useMemo(() => {
    let result = [...reports]
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      result = result.filter(
        (r) => r.fileName.toLowerCase().includes(q) || r.extractedText?.toLowerCase().includes(q),
      )
    }
    if (riskFilter !== 'ALL') {
      result = result.filter((r) => {
        const parsed = parseJsonSafe<ParsedReportData>(r.extractedText)
        return parsed?.status === riskFilter
      })
    }
    result.sort((a, b) => {
      const timeA = new Date(a.createdAt).getTime()
      const timeB = new Date(b.createdAt).getTime()
      return sortOrder === 'newest' ? timeB - timeA : timeA - timeB
    })
    return result
  }, [reports, searchQuery, riskFilter, sortOrder])

  const filteredDiabetes = useMemo(() => {
    let result = [...diabetesList]
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      result = result.filter(
        (d) =>
          d.riskLevel.toLowerCase().includes(q) ||
          d.glucose.toString().includes(q) ||
          d.bmi.toString().includes(q),
      )
    }
    if (riskFilter !== 'ALL') {
      result = result.filter((d) => d.riskLevel === riskFilter)
    }
    result.sort((a, b) => {
      const timeA = new Date(a.createdAt).getTime()
      const timeB = new Date(b.createdAt).getTime()
      return sortOrder === 'newest' ? timeB - timeA : timeA - timeB
    })
    return result
  }, [diabetesList, searchQuery, riskFilter, sortOrder])

  const filteredHeart = useMemo(() => {
    let result = [...heartList]
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      result = result.filter(
        (h) => h.riskLevel.toLowerCase().includes(q) || h.age.toString().includes(q),
      )
    }
    if (riskFilter !== 'ALL') {
      result = result.filter((h) => h.riskLevel === riskFilter)
    }
    result.sort((a, b) => {
      const timeA = new Date(a.createdAt).getTime()
      const timeB = new Date(b.createdAt).getTime()
      return sortOrder === 'newest' ? timeB - timeA : timeA - timeB
    })
    return result
  }, [heartList, searchQuery, riskFilter, sortOrder])

  // Selected report parsed details mapping
  const parsedReportDetails = useMemo(() => {
    if (!selectedReport) return null
    
    // Extract parameters
    const params = parseJsonSafe<any[]>(selectedReport.structuredData) || []
    const guidelines = parseJsonSafe<string[]>(selectedReport.recommendations) || []
    const summary = selectedReport.extractedText || ''
    
    return {
      summary,
      parameters: params,
      guidelines,
    }
  }, [selectedReport])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">Health History</h1>
        <p className="mt-1 text-sm text-ink-muted">
          Access your past predictions, metrics, and upload lab reports for automated extraction.
        </p>
      </div>

      {/* Tabs list */}
      <div className="flex border-b border-line">
        <button
          onClick={() => setActiveTab('reports')}
          className={cn(
            'px-5 py-3 text-sm font-medium border-b-2 transition',
            activeTab === 'reports'
              ? 'border-brand-500 text-brand-600 dark:text-brand-400 font-semibold'
              : 'border-transparent text-ink-muted hover:text-ink hover:border-line',
          )}
        >
          Lab Reports
        </button>
        <button
          onClick={() => setActiveTab('diabetes')}
          className={cn(
            'px-5 py-3 text-sm font-medium border-b-2 transition',
            activeTab === 'diabetes'
              ? 'border-brand-500 text-brand-600 dark:text-brand-400 font-semibold'
              : 'border-transparent text-ink-muted hover:text-ink hover:border-line',
          )}
        >
          Diabetes Checks
        </button>
        <button
          onClick={() => setActiveTab('heart')}
          className={cn(
            'px-5 py-3 text-sm font-medium border-b-2 transition',
            activeTab === 'heart'
              ? 'border-brand-500 text-brand-600 dark:text-brand-400 font-semibold'
              : 'border-transparent text-ink-muted hover:text-ink hover:border-line',
          )}
        >
          Cardio Checks
        </button>
      </div>

      {/* Toolbar filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-ink-subtle" />
          <input
            type="text"
            placeholder="Search records..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-line rounded-xl bg-surface/50 text-sm focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-ink-muted">
            <Filter className="h-3.5 w-3.5" />
            <span>Risk Level:</span>
          </div>
          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            className="border border-line rounded-xl bg-surface/50 px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-brand-500"
          >
            <option value="ALL">All Levels</option>
            <option value="NORMAL">Normal / Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="CRITICAL">Critical</option>
          </select>

          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as any)}
            className="border border-line rounded-xl bg-surface/50 px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-brand-500"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </select>
        </div>
      </div>

      {/* Main Tab Panels */}
      {activeTab === 'reports' && (
        <div className="space-y-6">
          {/* Dropzone area */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              'border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition flex flex-col items-center justify-center min-h-[160px]',
              isDragOver
                ? 'border-brand-500 bg-brand-50/5'
                : 'border-line hover:border-brand-300 hover:bg-surface/30',
            )}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
            {uploading ? (
              <div className="space-y-3.5">
                <Spinner size={32} className="mx-auto text-brand-600" />
                <p className="text-sm font-semibold text-ink">Analyzing your document with AI Vision...</p>
                <p className="text-xs text-ink-muted">Extracting structured vitals and cross-referencing ranges</p>
              </div>
            ) : (
              <div className="space-y-2 max-w-sm">
                <div className="grid h-12 w-12 place-items-center rounded-xl bg-brand-500/10 text-brand-600 mx-auto">
                  <FileUp className="h-6 w-6" />
                </div>
                <p className="text-sm font-bold text-ink">Upload Medical Lab Report</p>
                <p className="text-xs text-ink-muted leading-relaxed">
                  Drag and drop a lab report photo/screenshot, or browse files.
                  Supports PNG, JPG, JPEG.
                </p>
              </div>
            )}
          </div>

          {uploadError && (
            <div className="flex gap-2.5 rounded-xl border border-danger-100 bg-danger-50/15 p-3.5 text-xs text-danger-700 dark:text-danger-400">
              <AlertTriangle className="h-4.5 w-4.5 shrink-0" />
              <span>{uploadError}</span>
            </div>
          )}

          {/* List panel */}
          {loading ? (
            <div className="py-12 flex justify-center">
              <Spinner size={32} />
            </div>
          ) : filteredReports.length === 0 ? (
            <Card className="text-center py-12">
              <FileText className="h-10 w-10 text-ink-subtle mx-auto mb-3" />
              <h3 className="font-semibold text-ink text-sm">No lab reports found</h3>
              <p className="text-xs text-ink-muted mt-1">Upload a report screenshot to parse values dynamically.</p>
            </Card>
          ) : (
            <div className="grid gap-3.5">
              {filteredReports.map((report) => (
                <button
                  key={report.id}
                  onClick={() => setSelectedReport(report)}
                  className="flex items-center justify-between rounded-xl border border-line bg-surface/50 p-4 hover:border-brand-300 transition text-left w-full"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="grid h-10 w-10 place-items-center rounded-xl bg-brand-500/10 text-brand-600">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-ink">{report.fileName}</p>
                      <p className="text-xs text-ink-muted mt-0.5 flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(report.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {report.status === 'PROCESSING' && (
                      <Badge tone="warning">
                        <span className="flex items-center gap-1">
                          <Spinner size={14} /> Parsing
                        </span>
                      </Badge>
                    )}
                    {report.status === 'FAILED' && <Badge tone="danger">Failed</Badge>}
                    {report.status === 'COMPLETED' && <Badge tone="brand">Success</Badge>}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'diabetes' && (
        <div>
          {loading ? (
            <div className="py-12 flex justify-center">
              <Spinner size={32} />
            </div>
          ) : filteredDiabetes.length === 0 ? (
            <Card className="text-center py-12">
              <Activity className="h-10 w-10 text-ink-subtle mx-auto mb-3" />
              <h3 className="font-semibold text-ink text-sm">No diabetes checks found</h3>
              <p className="text-xs text-ink-muted mt-1">Run a prediction on the Dashboard to populate.</p>
            </Card>
          ) : (
            <div className="grid gap-3.5">
              {filteredDiabetes.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setSelectedDiabetes(item)}
                  className="flex items-center justify-between rounded-xl border border-line bg-surface/50 p-4 hover:border-brand-300 transition text-left w-full"
                >
                  <div>
                    <p className="text-sm font-semibold text-ink">Diabetes Risk Evaluation</p>
                    <p className="text-xs text-ink-muted mt-1 flex items-center gap-1.5">
                      <span>Glucose: {item.glucose} mg/dL</span>
                      <span>•</span>
                      <span>BMI: {item.bmi}</span>
                      <span>•</span>
                      <span>Age: {item.age}</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-ink">{Math.round(item.riskPercentage)}%</span>
                    <Badge
                      tone={
                        item.riskLevel === 'CRITICAL' || item.riskLevel === 'HIGH'
                          ? 'danger'
                          : item.riskLevel === 'MEDIUM'
                            ? 'warning'
                            : 'brand'
                      }
                    >
                      {item.riskLevel}
                    </Badge>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'heart' && (
        <div>
          {loading ? (
            <div className="py-12 flex justify-center">
              <Spinner size={32} />
            </div>
          ) : filteredHeart.length === 0 ? (
            <Card className="text-center py-12">
              <Activity className="h-10 w-10 text-ink-subtle mx-auto mb-3" />
              <h3 className="font-semibold text-ink text-sm">No cardio checks found</h3>
              <p className="text-xs text-ink-muted mt-1">Run a prediction on the Dashboard to populate.</p>
            </Card>
          ) : (
            <div className="grid gap-3.5">
              {filteredHeart.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setSelectedHeart(item)}
                  className="flex items-center justify-between rounded-xl border border-line bg-surface/50 p-4 hover:border-brand-300 transition text-left w-full"
                >
                  <div>
                    <p className="text-sm font-semibold text-ink">Cardiovascular Risk Evaluation</p>
                    <p className="text-xs text-ink-muted mt-1 flex items-center gap-1.5">
                      <span>Age: {item.age} years</span>
                      {item.chol && (
                        <>
                          <span>•</span>
                          <span>Cholesterol: {item.chol} mg/dL</span>
                        </>
                      )}
                      {item.trestbps && (
                        <>
                          <span>•</span>
                          <span>BP: {item.trestbps} mm Hg</span>
                        </>
                      )}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-ink">{Math.round(item.riskPercentage)}%</span>
                    <Badge
                      tone={
                        item.riskLevel === 'CRITICAL' || item.riskLevel === 'HIGH'
                          ? 'danger'
                          : item.riskLevel === 'MEDIUM'
                            ? 'warning'
                            : 'brand'
                      }
                    >
                      {item.riskLevel}
                    </Badge>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Report details Modal ────────────────────────────────────────────── */}
      <Modal
        open={selectedReport !== null}
        onClose={() => setSelectedReport(null)}
        title="Parsed Lab Report Details"
        description={selectedReport?.fileName}
        size="lg"
        footer={
          <Button onClick={() => setSelectedReport(null)} variant="primary">
            Close Report
          </Button>
        }
      >
        {selectedReport && parsedReportDetails && (
          <div className="space-y-6">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-ink-subtle">Report Summary</h4>
              <p className="mt-2 text-sm leading-relaxed text-ink">{parsedReportDetails.summary || 'Summary analysis pending...'}</p>
            </div>

            {/* Structured Table */}
            <div>
              <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-ink-subtle">
                Extracted Biomarkers
              </h4>
              {parsedReportDetails.parameters.length === 0 ? (
                <p className="text-sm text-ink-muted italic">No biomarkers extracted.</p>
              ) : (
                <div className="overflow-hidden border border-line rounded-xl bg-surface/50">
                  <table className="min-w-full divide-y divide-line text-left text-xs">
                    <thead className="bg-line/45 font-bold text-ink-subtle">
                      <tr>
                        <th className="px-4 py-3">Biomarker</th>
                        <th className="px-4 py-3">Value</th>
                        <th className="px-4 py-3">Reference Range</th>
                        <th className="px-4 py-3 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-line font-medium text-ink">
                      {parsedReportDetails.parameters.map((param, idx) => (
                        <tr key={idx} className="hover:bg-line/20">
                          <td className="px-4 py-3 font-semibold">{param.name}</td>
                          <td className="px-4 py-3">{param.value}</td>
                          <td className="px-4 py-3 text-ink-muted">{param.normalRange || 'N/A'}</td>
                          <td className="px-4 py-3 text-center">
                            <Badge
                              tone={
                                param.status === 'CRITICAL' || param.status === 'HIGH'
                                  ? 'danger'
                                  : param.status === 'ELEVATED' || param.status === 'LOW' || param.status === 'WARNING'
                                    ? 'warning'
                                    : 'brand'
                              }
                            >
                              {param.status}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Recommendations */}
            <div>
              <h4 className="mb-2.5 text-xs font-bold uppercase tracking-wider text-ink-subtle">
                AI Clinical Guidelines
              </h4>
              {parsedReportDetails.guidelines.length === 0 ? (
                <p className="text-sm text-ink-muted italic">No specific recommendations.</p>
              ) : (
                <ul className="space-y-1.5 list-disc pl-4 text-sm text-ink-muted">
                  {parsedReportDetails.guidelines.map((rec, idx) => (
                    <li key={idx} className="leading-relaxed">{rec}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* ── Diabetes Details Modal ────────────────────────────────────────── */}
      <Modal
        open={selectedDiabetes !== null}
        onClose={() => setSelectedDiabetes(null)}
        title="Diabetes Risk Report"
        description={`Evaluated on ${selectedDiabetes ? new Date(selectedDiabetes.createdAt).toLocaleString() : ''}`}
        size="md"
        footer={
          <Button onClick={() => setSelectedDiabetes(null)} variant="primary">
            Dismiss
          </Button>
        }
      >
        {selectedDiabetes && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-xl border border-line bg-surface/50 p-3 text-center">
                <span className="text-xs text-ink-subtle block font-semibold">Glucose</span>
                <span className="text-lg font-bold text-ink mt-0.5 block">{selectedDiabetes.glucose} mg/dL</span>
              </div>
              <div className="rounded-xl border border-line bg-surface/50 p-3 text-center">
                <span className="text-xs text-ink-subtle block font-semibold">BMI</span>
                <span className="text-lg font-bold text-ink mt-0.5 block">{selectedDiabetes.bmi}</span>
              </div>
            </div>

            <div className="rounded-xl border border-line bg-surface/50 p-4">
              <div className="flex justify-between items-baseline">
                <span className="text-sm font-semibold text-ink">Risk Score:</span>
                <span className="text-xl font-extrabold text-brand-600">
                  {Math.round(selectedDiabetes.riskPercentage)}%
                </span>
              </div>
              <div className="mt-2.5 flex items-center justify-between">
                <Badge
                  tone={
                    selectedDiabetes.riskLevel === 'CRITICAL' || selectedDiabetes.riskLevel === 'HIGH'
                      ? 'danger'
                      : selectedDiabetes.riskLevel === 'MEDIUM'
                        ? 'warning'
                        : 'brand'
                  }
                >
                  {selectedDiabetes.riskLevel} RISK
                </Badge>
                <span className="text-xs text-ink-subtle">
                  Confidence: {selectedDiabetes.probabilityDiabetes > 0.8 ? 'High' : 'Medium'}
                </span>
              </div>
            </div>

            {selectedDiabetes.recommendations && (
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-ink-subtle mb-2">Advice</h4>
                <ul className="space-y-1.5 list-disc pl-4 text-xs text-ink-muted">
                  {parseJsonSafe<any[]>(selectedDiabetes.recommendations)?.map((rec: any, idx: number) => (
                    <li key={idx}>{rec.text || rec}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* ── Heart Details Modal ───────────────────────────────────────────── */}
      <Modal
        open={selectedHeart !== null}
        onClose={() => setSelectedHeart(null)}
        title="Cardiovascular Risk Report"
        description={`Evaluated on ${selectedHeart ? new Date(selectedHeart.createdAt).toLocaleString() : ''}`}
        size="md"
        footer={
          <Button onClick={() => setSelectedHeart(null)} variant="primary">
            Dismiss
          </Button>
        }
      >
        {selectedHeart && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-xl border border-line bg-surface/50 p-3 text-center">
                <span className="text-[10px] text-ink-subtle block font-semibold uppercase">Age</span>
                <span className="text-base font-bold text-ink mt-0.5 block">{selectedHeart.age} yrs</span>
              </div>
              <div className="rounded-xl border border-line bg-surface/50 p-3 text-center">
                <span className="text-[10px] text-ink-subtle block font-semibold uppercase">Cholesterol</span>
                <span className="text-base font-bold text-ink mt-0.5 block">{selectedHeart.chol || 'N/A'}</span>
              </div>
              <div className="rounded-xl border border-line bg-surface/50 p-3 text-center">
                <span className="text-[10px] text-ink-subtle block font-semibold uppercase">Resting BP</span>
                <span className="text-base font-bold text-ink mt-0.5 block">{selectedHeart.trestbps || 'N/A'}</span>
              </div>
            </div>

            <div className="rounded-xl border border-line bg-surface/50 p-4">
              <div className="flex justify-between items-baseline">
                <span className="text-sm font-semibold text-ink">Risk Score:</span>
                <span className="text-xl font-extrabold text-brand-600">
                  {Math.round(selectedHeart.riskPercentage)}%
                </span>
              </div>
              <div className="mt-2.5 flex items-center justify-between">
                <Badge
                  tone={
                    selectedHeart.riskLevel === 'CRITICAL' || selectedHeart.riskLevel === 'HIGH'
                      ? 'danger'
                      : selectedHeart.riskLevel === 'MEDIUM'
                        ? 'warning'
                        : 'brand'
                  }
                >
                  {selectedHeart.riskLevel} RISK
                </Badge>
                <span className="text-xs text-ink-subtle">
                  Confidence: {selectedHeart.diseaseProbability > 0.8 ? 'High' : 'Medium'}
                </span>
              </div>
            </div>

            {selectedHeart.recommendations && (
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-ink-subtle mb-2">Advice</h4>
                <ul className="space-y-1.5 list-disc pl-4 text-xs text-ink-muted">
                  {parseJsonSafe<any[]>(selectedHeart.recommendations)?.map((rec: any, idx: number) => (
                    <li key={idx}>{rec.text || rec}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}
