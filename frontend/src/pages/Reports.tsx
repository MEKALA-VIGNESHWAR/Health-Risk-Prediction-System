import { useEffect, useState, useMemo, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FileText,
  AlertTriangle,
  Calendar,
  FileUp,
  Activity,
  ShieldCheck,
} from 'lucide-react'
import { useAuth } from '@/auth/AuthContext'
import { Card, Badge, Spinner, GlassCard } from '@/components/ui'
import { PageHeader } from '@/components/layout/PageHeader'
import {
  fetchReports,
  uploadReport,
  type MedicalReport,
} from '@/features/dashboard/reportsApi'
import { cn } from '@/lib/cn'

export function Reports() {
  const { user } = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Data states
  const [reports, setReports] = useState<MedicalReport[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedReport, setSelectedReport] = useState<MedicalReport | null>(null)

  // Upload state
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [isDragOver, setIsDragOver] = useState(false)

  const loadData = async () => {
    if (!user?.userId) return
    setLoading(true)
    try {
      const fetchedReports = await fetchReports(user.userId)
      setReports(fetchedReports)
      
      // Auto-select the first completed report if none is selected
      if (fetchedReports.length > 0 && !selectedReport) {
        const completed = fetchedReports.find((r) => r.status === 'COMPLETED')
        setSelectedReport(completed || fetchedReports[0])
      }
    } catch (err) {
      console.error('Failed to load reports', err)
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
      const newReport = await uploadReport(file, user.userId)
      // Reload reports
      const fetchedReports = await fetchReports(user.userId)
      setReports(fetchedReports)
      setSelectedReport(newReport)
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

  // Selected report parsed details mapping
  const parsedReportDetails = useMemo(() => {
    if (!selectedReport) return null
    
    const params = parseJsonSafe<any[]>(selectedReport.structuredData) || []
    const guidelines = parseJsonSafe<string[]>(selectedReport.recommendations) || []
    const abnormalities = parseJsonSafe<any[]>(selectedReport.abnormalities) || []
    const summary = selectedReport.extractedText || ''
    
    return {
      summary,
      parameters: params,
      guidelines,
      abnormalities,
    }
  }, [selectedReport])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-6"
    >
      <PageHeader
        title="Medical Report Analysis"
        subtitle="Upload your blood test results or clinical reports and let AI structure them into dynamic biomarkers."
        eyebrow="Clinical Intelligence"
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Side: Upload Zone & History List */}
        <div className="space-y-6 lg:col-span-1">
          {/* Upload Card */}
          <Card className="overflow-hidden border border-line bg-card shadow-soft">
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                'group border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition flex flex-col items-center justify-center min-h-[160px]',
                isDragOver
                  ? 'border-brand-500 bg-brand-50/5 dark:bg-brand-900/5'
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
                <div className="space-y-3">
                  <Spinner size={32} className="mx-auto text-brand-600 dark:text-brand-400" />
                  <p className="text-sm font-semibold text-ink">AI Vision is parsing...</p>
                  <p className="text-xs text-ink-muted leading-relaxed">
                    Extracting values, ranges, and abnormalities
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400 mx-auto group-hover:scale-105 transition-transform duration-200">
                    <FileUp className="h-5.5 w-5.5" />
                  </div>
                  <p className="text-sm font-bold text-ink">Upload Lab Report</p>
                  <p className="text-xs text-ink-muted max-w-[220px] mx-auto leading-relaxed">
                    Drag & drop or browse. Supports JPG, PNG, JPEG images.
                  </p>
                </div>
              )}
            </div>

            {uploadError && (
              <div className="m-4 flex gap-2.5 rounded-xl border border-danger-100 bg-danger-50/15 p-3.5 text-xs text-danger-700 dark:text-danger-400">
                <AlertTriangle className="h-4.5 w-4.5 shrink-0" />
                <span>{uploadError}</span>
              </div>
            )}
          </Card>

          {/* History List */}
          <GlassCard className="border border-line shadow-soft">
            <h2 className="text-sm font-bold uppercase tracking-wider text-ink-subtle mb-4">
              Your Reports ({reports.length})
            </h2>

            {loading ? (
              <div className="py-10 flex justify-center">
                <Spinner size={24} />
              </div>
            ) : reports.length === 0 ? (
              <div className="text-center py-10">
                <FileText className="h-8 w-8 text-ink-subtle mx-auto mb-2" />
                <p className="text-xs font-semibold text-ink">No reports uploaded yet</p>
                <p className="text-xs text-ink-muted mt-1">Upload a lab image above to start.</p>
              </div>
            ) : (
              <div className="max-h-[360px] overflow-y-auto pr-1 space-y-2.5 custom-scrollbar">
                {reports.map((report) => {
                  const isSelected = selectedReport?.id === report.id
                  return (
                    <button
                      key={report.id}
                      onClick={() => setSelectedReport(report)}
                      className={cn(
                        'w-full flex items-center justify-between rounded-xl border p-3 text-left transition duration-200',
                        isSelected
                          ? 'border-brand-500 bg-brand-500/8 text-brand-700 dark:text-brand-300'
                          : 'border-line bg-surface/40 hover:border-brand-300 hover:bg-surface/70',
                      )}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={cn(
                            'grid h-9 w-9 place-items-center rounded-lg transition',
                            isSelected
                              ? 'bg-brand-500 text-white'
                              : 'bg-brand-500/10 text-brand-600 dark:text-brand-400',
                          )}
                        >
                          <FileText className="h-4.5 w-4.5" />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-xs font-bold text-ink">{report.fileName}</p>
                          <p className="text-[10px] text-ink-muted mt-0.5 flex items-center gap-1">
                            <Calendar className="h-2.5 w-2.5" />
                            {new Date(report.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="shrink-0 ml-2">
                        {report.status === 'PROCESSING' && (
                          <Badge tone="warning">
                            <span className="flex items-center gap-1">
                              <Spinner size={10} />
                            </span>
                          </Badge>
                        )}
                        {report.status === 'FAILED' && <Badge tone="danger">Fail</Badge>}
                        {report.status === 'COMPLETED' && <Badge tone="brand">Done</Badge>}
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </GlassCard>
        </div>

        {/* Right Side: Detailed View */}
        <div className="lg:col-span-2">
          <AnimatePresence mode="wait">
            {!selectedReport ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="h-full min-h-[300px]"
              >
                <Card className="h-full flex flex-col items-center justify-center text-center p-8 border border-line bg-card shadow-soft">
                  <div className="grid h-14 w-14 place-items-center rounded-2xl bg-brand-500/10 text-brand-600 dark:text-brand-400 mb-4 animate-float">
                    <Activity className="h-7 w-7" />
                  </div>
                  <h3 className="text-lg font-bold text-ink">Clinical Workspace</h3>
                  <p className="text-sm text-ink-muted max-w-sm mt-1">
                    Select a report from your history or upload a new one to run AI extraction and check biomarkers.
                  </p>
                </Card>
              </motion.div>
            ) : (
              <motion.div
                key={selectedReport.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                {/* General Summary */}
                <Card className="border border-line bg-card shadow-soft overflow-hidden">
                  <div className="border-b border-line bg-surface/30 px-6 py-4 flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-bold text-ink">{selectedReport.fileName}</h3>
                      <p className="text-xs text-ink-muted mt-0.5">
                        Uploaded on {new Date(selectedReport.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      {selectedReport.status === 'PROCESSING' && (
                        <Badge tone="warning" dot>Processing</Badge>
                      )}
                      {selectedReport.status === 'FAILED' && (
                        <Badge tone="danger">Processing Failed</Badge>
                      )}
                      {selectedReport.status === 'COMPLETED' && (
                        <Badge tone="brand" dot>Analysis Ready</Badge>
                      )}
                    </div>
                  </div>

                  <div className="p-6">
                    {selectedReport.status === 'PROCESSING' ? (
                      <div className="py-12 text-center space-y-4">
                        <Spinner size={36} className="mx-auto text-brand-600 dark:text-brand-400" />
                        <h4 className="font-bold text-ink">Running AI Extraction</h4>
                        <p className="text-sm text-ink-muted max-w-md mx-auto leading-relaxed">
                          We are extracting standard patient values, detecting ranges, and matching normal scales.
                          This typically takes 10-15 seconds.
                        </p>
                      </div>
                    ) : selectedReport.status === 'FAILED' ? (
                      <div className="py-12 text-center space-y-4">
                        <div className="grid h-12 w-12 place-items-center rounded-full bg-danger/10 text-danger mx-auto">
                          <AlertTriangle className="h-6 w-6" />
                        </div>
                        <h4 className="font-bold text-ink">Failed to Parse Report</h4>
                        <p className="text-sm text-ink-muted max-w-md mx-auto leading-relaxed">
                          {selectedReport.extractedText ||
                            'The AI model could not process this image. Please make sure the text is clearly legible and try uploading again.'}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {/* Medical Summary Blurb */}
                        <div className="rounded-2xl bg-surface/50 border border-line p-5">
                          <h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-ink-subtle">
                            <ShieldCheck className="h-4.5 w-4.5 text-brand-600" />
                            Clinical Summary
                          </h4>
                          <p className="mt-3 text-sm leading-relaxed text-ink">
                            {parsedReportDetails?.summary}
                          </p>
                        </div>

                        {/* Abnormalities highlight cards */}
                        {parsedReportDetails && parsedReportDetails.abnormalities.length > 0 && (
                          <div className="space-y-3">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-ink-subtle">
                              Flagged Vitals ({parsedReportDetails.abnormalities.length})
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {parsedReportDetails.abnormalities.map((ab, idx) => (
                                <div
                                  key={idx}
                                  className="flex items-center justify-between rounded-xl border border-danger/20 bg-danger/5 px-4 py-3 text-xs"
                                >
                                  <div>
                                    <p className="font-bold text-ink">{ab.name}</p>
                                    <p className="text-[10px] text-ink-muted mt-0.5">Value: {ab.value}</p>
                                  </div>
                                  <Badge
                                    tone={
                                      ab.status === 'CRITICAL' || ab.status === 'HIGH'
                                        ? 'danger'
                                        : 'warning'
                                    }
                                  >
                                    {ab.status}
                                  </Badge>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Biomarkers structured table */}
                        <div className="space-y-3">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-ink-subtle">
                            Extracted Biomarkers
                          </h4>
                          {parsedReportDetails && parsedReportDetails.parameters.length === 0 ? (
                            <p className="text-sm text-ink-muted italic">No biomarkers extracted.</p>
                          ) : (
                            <div className="overflow-hidden border border-line rounded-2xl bg-surface/20">
                              <table className="min-w-full divide-y divide-line text-left text-xs">
                                <thead className="bg-line/25 font-bold text-ink-subtle">
                                  <tr>
                                    <th className="px-5 py-3">Biomarker</th>
                                    <th className="px-5 py-3">Value</th>
                                    <th className="px-5 py-3">Reference Range</th>
                                    <th className="px-5 py-3 text-center">Status</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-line font-medium text-ink">
                                  {parsedReportDetails?.parameters.map((param, idx) => (
                                    <tr key={idx} className="hover:bg-line/10 transition duration-150">
                                      <td className="px-5 py-3 font-semibold text-ink">{param.name}</td>
                                      <td className="px-5 py-3">{param.value}</td>
                                      <td className="px-5 py-3 text-ink-muted">{param.normalRange || 'N/A'}</td>
                                      <td className="px-5 py-3 text-center">
                                        <Badge
                                          tone={
                                            param.status === 'CRITICAL' || param.status === 'HIGH'
                                              ? 'danger'
                                              : param.status === 'ELEVATED' ||
                                                  param.status === 'LOW' ||
                                                  param.status === 'WARNING'
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

                        {/* AI Recommendations */}
                        {parsedReportDetails && parsedReportDetails.guidelines.length > 0 && (
                          <div className="space-y-3">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-ink-subtle">
                              Guidelines & Actionable Steps
                            </h4>
                            <div className="rounded-2xl border border-brand-500/10 bg-brand-500/5 p-5">
                              <ul className="space-y-2.5 pl-4 list-disc text-sm text-brand-900/80 dark:text-brand-300">
                                {parsedReportDetails.guidelines.map((rec, idx) => (
                                  <li key={idx} className="leading-relaxed">
                                    {rec}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  )
}
