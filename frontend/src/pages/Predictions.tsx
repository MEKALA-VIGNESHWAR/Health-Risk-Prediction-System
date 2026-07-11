import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Activity,
  Heart,
  Sparkles,
  AlertTriangle,
  Database,
  ArrowRight,
} from 'lucide-react'
import { Card, Badge, Button, GlassCard } from '@/components/ui'
import { PageHeader } from '@/components/layout/PageHeader'
import { useAuth } from '@/auth/AuthContext'
import {
  predictDiabetes,
  predictHeart,
  type DiabetesPredictionResponse,
  type HeartPredictionResponse,
  type DiabetesPredictionRequest,
  type HeartPredictionRequest,
} from '@/features/dashboard/dashboardApi'
import { cn } from '@/lib/cn'
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts'

// Pre-defined sample profiles from the CSV datasets
const DIABETES_SAMPLES = [
  {
    name: 'Sample 1: High Risk (50yo, 148 Glucose)',
    data: {
      pregnancies: 6,
      glucose: 148,
      bloodPressure: 72,
      skinThickness: 35,
      insulin: 0,
      bmi: 33.6,
      diabetesPedigreeFunction: 0.627,
      age: 50,
    },
  },
  {
    name: 'Sample 2: Low Risk (31yo, 85 Glucose)',
    data: {
      pregnancies: 1,
      glucose: 85,
      bloodPressure: 66,
      skinThickness: 29,
      insulin: 0,
      bmi: 26.6,
      diabetesPedigreeFunction: 0.351,
      age: 31,
    },
  },
  {
    name: 'Sample 3: Critical Risk (53yo, 197 Glucose)',
    data: {
      pregnancies: 2,
      glucose: 197,
      bloodPressure: 70,
      skinThickness: 45,
      insulin: 543,
      bmi: 30.5,
      diabetesPedigreeFunction: 0.158,
      age: 53,
    },
  },
]

const HEART_SAMPLES = [
  {
    name: 'Sample 1: High Risk (67yo, Asymptomatic CP)',
    data: {
      age: 67,
      sex: 1,
      cp: 0, // Asymptomatic
      trestbps: 160,
      chol: 286,
      fbs: 0,
      restecg: 0,
      thalach: 108,
      exang: 1,
      oldpeak: 1.5,
      slope: 1,
      ca: 2,
      thal: 2,
    },
  },
  {
    name: 'Sample 2: Low Risk (37yo, Non-anginal CP)',
    data: {
      age: 37,
      sex: 1,
      cp: 2, // Non-anginal
      trestbps: 130,
      chol: 250,
      fbs: 0,
      restecg: 1,
      thalach: 187,
      exang: 0,
      oldpeak: 0.0,
      slope: 0,
      ca: 0,
      thal: 0,
    },
  },
  {
    name: 'Sample 3: High Risk (62yo, Asymptomatic CP)',
    data: {
      age: 62,
      sex: 0,
      cp: 0,
      trestbps: 140,
      chol: 268,
      fbs: 0,
      restecg: 0,
      thalach: 160,
      exang: 0,
      oldpeak: 3.6,
      slope: 2,
      ca: 1,
      thal: 1,
    },
  },
]

export function Predictions() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<'diabetes' | 'heart'>('diabetes')

  // Form States - Diabetes
  const [diabetesForm, setDiabetesForm] = useState<Required<Omit<DiabetesPredictionRequest, 'userId'>>>({
    pregnancies: 0,
    glucose: 100,
    bloodPressure: 70,
    skinThickness: 20,
    insulin: 80,
    bmi: 25.0,
    diabetesPedigreeFunction: 0.47,
    age: 30,
  })

  // Form States - Heart
  const [heartForm, setHeartForm] = useState<Required<Omit<HeartPredictionRequest, 'userId'>>>({
    age: 45,
    sex: 1, // Male
    cp: 1,  // Atypical Angina
    trestbps: 120,
    chol: 200,
    fbs: 0,
    restecg: 1,
    thalach: 150,
    exang: 0,
    oldpeak: 0.0,
    slope: 1,
    ca: 0,
    thal: 1,
  })

  // Submit / Processing States
  const [loading, setLoading] = useState(false)
  const [diabetesResult, setDiabetesResult] = useState<DiabetesPredictionResponse | null>(null)
  const [heartResult, setHeartResult] = useState<HeartPredictionResponse | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // Load sample profiles
  const handleLoadDiabetesSample = (idx: number) => {
    const sample = DIABETES_SAMPLES[idx].data
    setDiabetesForm({ ...sample })
    setDiabetesResult(null)
    setErrorMsg(null)
  }

  const handleLoadHeartSample = (idx: number) => {
    const sample = HEART_SAMPLES[idx].data
    setHeartForm({ ...sample })
    setHeartResult(null)
    setErrorMsg(null)
  }

  // Submit Handlers
  const handleDiabetesSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg(null)
    setDiabetesResult(null)
    try {
      const response = await predictDiabetes({
        ...diabetesForm,
        userId: user?.userId,
      })
      setDiabetesResult(response)
    } catch (err: any) {
      setErrorMsg(err.message || 'Diabetes prediction model execution failed.')
    } finally {
      setLoading(false)
    }
  }

  const handleHeartSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg(null)
    setHeartResult(null)
    try {
      const response = await predictHeart({
        ...heartForm,
        userId: user?.userId,
      })
      setHeartResult(response)
    } catch (err: any) {
      setErrorMsg(err.message || 'Cardiovascular prediction model execution failed.')
    } finally {
      setLoading(false)
    }
  }

  // Parse feature importances for Recharts SHAP display
  const parsedFeatureImportance = useMemo(() => {
    if (activeTab === 'diabetes' && diabetesResult?.featureImportance) {
      try {
        const parsed = JSON.parse(diabetesResult.featureImportance)
        return Object.entries(parsed).map(([name, val]) => ({
          name: name.replace('DiabetesPedigreeFunction', 'Pedigree').replace('BloodPressure', 'BP'),
          value: Math.round((Number(val) || 0) * 100),
        })).sort((a, b) => b.value - a.value)
      } catch {
        return []
      }
    }
    
    if (activeTab === 'heart' && heartResult?.topFactors) {
      const list = heartResult.topFactors as Array<{ factor: string; importance: number }>
      return list.map((item) => ({
        name: item.factor,
        value: Math.round(item.importance * 100),
      })).sort((a, b) => b.value - a.value)
    }

    return []
  }, [activeTab, diabetesResult, heartResult])

  // Parse recommendations safely
  const parsedRecommendations = useMemo(() => {
    if (activeTab === 'diabetes' && diabetesResult?.recommendations) {
      try {
        const parsed = typeof diabetesResult.recommendations === 'string'
          ? JSON.parse(diabetesResult.recommendations)
          : diabetesResult.recommendations
        return Array.isArray(parsed) ? parsed : []
      } catch {
        return []
      }
    }

    if (activeTab === 'heart' && heartResult?.recommendations) {
      const recs = heartResult.recommendations
      return Array.isArray(recs)
        ? recs.map((r: any) => typeof r === 'string' ? { title: 'Recommendation', description: r, icon: '💡' } : r)
        : []
    }

    return []
  }, [activeTab, diabetesResult, heartResult])

  // Score metrics
  const riskScore = activeTab === 'diabetes'
    ? Math.round(diabetesResult?.riskPercentage ?? 0)
    : Math.round((heartResult?.diseaseProbability ?? 0) * 100)

  const riskLevel = activeTab === 'diabetes'
    ? diabetesResult?.riskLevel ?? 'LOW'
    : heartResult?.risk ?? 'LOW'

  const scoreColor = (score: number) => {
    if (score <= 30) return 'text-brand-600 stroke-brand-500'
    if (score <= 60) return 'text-yellow-500 stroke-yellow-500'
    if (score <= 80) return 'text-orange-500 stroke-orange-500'
    return 'text-danger stroke-danger'
  }

  const scoreBadgeTone = (score: number) => {
    if (score <= 30) return 'brand'
    if (score <= 60) return 'warning'
    if (score <= 80) return 'warning'
    return 'danger'
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-6"
    >
      <PageHeader
        title="Clinical Predictions Workspace"
        subtitle="Evaluate disease risk using advanced calibrated machine learning models. Pre-fill records using verified dataset samples."
        eyebrow="Machine Learning Engine"
      />

      {/* Tabs config */}
      <div className="flex border-b border-line">
        <button
          onClick={() => {
            setActiveTab('diabetes')
            setErrorMsg(null)
          }}
          className={cn(
            'flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition duration-200',
            activeTab === 'diabetes'
              ? 'border-brand-500 text-brand-600 dark:text-brand-400 font-bold'
              : 'border-transparent text-ink-muted hover:text-ink hover:border-line',
          )}
        >
          <Activity className="h-4.5 w-4.5" />
          Diabetes Predictor
        </button>
        <button
          onClick={() => {
            setActiveTab('heart')
            setErrorMsg(null)
          }}
          className={cn(
            'flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition duration-200',
            activeTab === 'heart'
              ? 'border-brand-500 text-brand-600 dark:text-brand-400 font-bold'
              : 'border-transparent text-ink-muted hover:text-ink hover:border-line',
          )}
        >
          <Heart className="h-4.5 w-4.5" />
          Cardiovascular Predictor
        </button>
      </div>

      {errorMsg && (
        <div className="flex gap-2.5 rounded-xl border border-danger-100 bg-danger-50/15 p-3.5 text-xs text-danger-700 dark:text-danger-400">
          <AlertTriangle className="h-4.5 w-4.5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        {/* Left Form Panel */}
        <div className="lg:col-span-3 space-y-6">
          <Card className="border border-line bg-card shadow-soft p-5">
                {/* Load Sample Profiles */}
            <div className="mb-5 flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between border-b border-line pb-4">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-600">
                <Database className="h-4.5 w-4.5" />
                Pre-load Dataset Profile
              </div>
              <div className="flex flex-wrap gap-1.5">
                {(activeTab === 'diabetes' ? DIABETES_SAMPLES : HEART_SAMPLES).map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => activeTab === 'diabetes' ? handleLoadDiabetesSample(idx) : handleLoadHeartSample(idx)}
                    className="rounded-lg border border-line bg-surface px-2.5 py-1 text-xs font-semibold text-ink-muted hover:border-brand-300 hover:text-ink hover:bg-surface-active transition"
                  >
                    Sample {idx + 1}
                  </button>
                ))}
              </div>
            </div>

            {/* Diabetes Form */}
            {activeTab === 'diabetes' && (
              <form onSubmit={handleDiabetesSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-ink-muted block mb-1.5">Fasting Glucose (mg/dL)</label>
                    <input
                      type="number"
                      required
                      min={40}
                      max={400}
                      value={diabetesForm.glucose}
                      onChange={(e) => setDiabetesForm({ ...diabetesForm, glucose: parseInt(e.target.value) || 0 })}
                      className="w-full border border-line rounded-xl px-3 py-2 bg-surface text-sm text-ink focus:outline-none focus:ring-1 focus:ring-brand-500"
                    />
                    <span className="text-[10px] text-ink-subtle mt-1 block">Healthy standard: 70-100 mg/dL</span>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-ink-muted block mb-1.5">Body Mass Index (BMI)</label>
                    <input
                      type="number"
                      required
                      step="0.1"
                      min={10}
                      max={60}
                      value={diabetesForm.bmi}
                      onChange={(e) => setDiabetesForm({ ...diabetesForm, bmi: parseFloat(e.target.value) || 0 })}
                      className="w-full border border-line rounded-xl px-3 py-2 bg-surface text-sm text-ink focus:outline-none focus:ring-1 focus:ring-brand-500"
                    />
                    <span className="text-[10px] text-ink-subtle mt-1 block">Healthy: 18.5 - 24.9</span>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-ink-muted block mb-1.5">Blood Pressure (mmHg)</label>
                    <input
                      type="number"
                      required
                      min={40}
                      max={200}
                      value={diabetesForm.bloodPressure}
                      onChange={(e) => setDiabetesForm({ ...diabetesForm, bloodPressure: parseInt(e.target.value) || 0 })}
                      className="w-full border border-line rounded-xl px-3 py-2 bg-surface text-sm text-ink focus:outline-none focus:ring-1 focus:ring-brand-500"
                    />
                    <span className="text-[10px] text-ink-subtle mt-1 block">Normal: Under 120 mmHg</span>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-ink-muted block mb-1.5">Insulin (µU/mL)</label>
                    <input
                      type="number"
                      required
                      min={0}
                      max={900}
                      value={diabetesForm.insulin}
                      onChange={(e) => setDiabetesForm({ ...diabetesForm, insulin: parseInt(e.target.value) || 0 })}
                      className="w-full border border-line rounded-xl px-3 py-2 bg-surface text-sm text-ink focus:outline-none focus:ring-1 focus:ring-brand-500"
                    />
                    <span className="text-[10px] text-ink-subtle mt-1 block">Fasting normal: 16-166 µU/mL</span>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-ink-muted block mb-1.5">Skin Thickness (mm)</label>
                    <input
                      type="number"
                      required
                      min={0}
                      max={99}
                      value={diabetesForm.skinThickness}
                      onChange={(e) => setDiabetesForm({ ...diabetesForm, skinThickness: parseInt(e.target.value) || 0 })}
                      className="w-full border border-line rounded-xl px-3 py-2 bg-surface text-sm text-ink focus:outline-none focus:ring-1 focus:ring-brand-500"
                    />
                    <span className="text-[10px] text-ink-subtle mt-1 block">Triceps fold caliper standard</span>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-ink-muted block mb-1.5">Diabetes Pedigree Function</label>
                    <input
                      type="number"
                      required
                      step="0.001"
                      min={0.01}
                      max={3.0}
                      value={diabetesForm.diabetesPedigreeFunction}
                      onChange={(e) => setDiabetesForm({ ...diabetesForm, diabetesPedigreeFunction: parseFloat(e.target.value) || 0 })}
                      className="w-full border border-line rounded-xl px-3 py-2 bg-surface text-sm text-ink focus:outline-none focus:ring-1 focus:ring-brand-500"
                    />
                    <span className="text-[10px] text-ink-subtle mt-1 block">Genetic score range: 0.08 - 2.42</span>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-ink-muted block mb-1.5">Pregnancies (If applicable)</label>
                    <input
                      type="number"
                      required
                      min={0}
                      max={20}
                      value={diabetesForm.pregnancies}
                      onChange={(e) => setDiabetesForm({ ...diabetesForm, pregnancies: parseInt(e.target.value) || 0 })}
                      className="w-full border border-line rounded-xl px-3 py-2 bg-surface text-sm text-ink focus:outline-none focus:ring-1 focus:ring-brand-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-ink-muted block mb-1.5">Age (Years)</label>
                    <input
                      type="number"
                      required
                      min={1}
                      max={120}
                      value={diabetesForm.age}
                      onChange={(e) => setDiabetesForm({ ...diabetesForm, age: parseInt(e.target.value) || 0 })}
                      className="w-full border border-line rounded-xl px-3 py-2 bg-surface text-sm text-ink focus:outline-none focus:ring-1 focus:ring-brand-500"
                    />
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <Button type="submit" loading={loading} rightIcon={<ArrowRight className="h-4.5 w-4.5" />}>
                    Calculate Diabetes Risk
                  </Button>
                </div>
              </form>
            )}

            {/* Heart Disease Form */}
            {activeTab === 'heart' && (
              <form onSubmit={handleHeartSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-bold text-ink-muted block mb-1.5">Age</label>
                    <input
                      type="number"
                      required
                      min={1}
                      max={120}
                      value={heartForm.age}
                      onChange={(e) => setHeartForm({ ...heartForm, age: parseInt(e.target.value) || 0 })}
                      className="w-full border border-line rounded-xl px-3 py-2 bg-surface text-sm text-ink focus:outline-none focus:ring-1 focus:ring-brand-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-ink-muted block mb-1.5">Biological Sex</label>
                    <select
                      value={heartForm.sex}
                      onChange={(e) => setHeartForm({ ...heartForm, sex: parseInt(e.target.value) || 0 })}
                      className="w-full border border-line rounded-xl px-3 py-2 bg-surface text-sm text-ink focus:outline-none focus:ring-1 focus:ring-brand-500"
                    >
                      <option value={1}>Male</option>
                      <option value={0}>Female</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-ink-muted block mb-1.5">Chest Pain Type (cp)</label>
                    <select
                      value={heartForm.cp}
                      onChange={(e) => setHeartForm({ ...heartForm, cp: parseInt(e.target.value) || 0 })}
                      className="w-full border border-line rounded-xl px-3 py-2 bg-surface text-sm text-ink focus:outline-none focus:ring-1 focus:ring-brand-500"
                    >
                      <option value={0}>Asymptomatic</option>
                      <option value={1}>Typical Angina</option>
                      <option value={2}>Atypical Angina</option>
                      <option value={3}>Non-anginal Pain</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-ink-muted block mb-1.5">Resting BP (mmHg)</label>
                    <input
                      type="number"
                      required
                      min={50}
                      max={240}
                      value={heartForm.trestbps}
                      onChange={(e) => setHeartForm({ ...heartForm, trestbps: parseInt(e.target.value) || 0 })}
                      className="w-full border border-line rounded-xl px-3 py-2 bg-surface text-sm text-ink focus:outline-none focus:ring-1 focus:ring-brand-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-ink-muted block mb-1.5">Serum Cholesterol (mg/dL)</label>
                    <input
                      type="number"
                      required
                      min={80}
                      max={600}
                      value={heartForm.chol}
                      onChange={(e) => setHeartForm({ ...heartForm, chol: parseInt(e.target.value) || 0 })}
                      className="w-full border border-line rounded-xl px-3 py-2 bg-surface text-sm text-ink focus:outline-none focus:ring-1 focus:ring-brand-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-ink-muted block mb-1.5">Fasting Blood Sugar</label>
                    <select
                      value={heartForm.fbs}
                      onChange={(e) => setHeartForm({ ...heartForm, fbs: parseInt(e.target.value) || 0 })}
                      className="w-full border border-line rounded-xl px-3 py-2 bg-surface text-sm text-ink focus:outline-none focus:ring-1 focus:ring-brand-500"
                    >
                      <option value={0}>Fasting Glucose &lt;= 120 mg/dL</option>
                      <option value={1}>Fasting Glucose &gt; 120 mg/dL</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-ink-muted block mb-1.5">Resting ECG Results</label>
                    <select
                      value={heartForm.restecg}
                      onChange={(e) => setHeartForm({ ...heartForm, restecg: parseInt(e.target.value) || 0 })}
                      className="w-full border border-line rounded-xl px-3 py-2 bg-surface text-sm text-ink focus:outline-none focus:ring-1 focus:ring-brand-500"
                    >
                      <option value={0}>Normal</option>
                      <option value={1}>ST-T Wave Abnormality</option>
                      <option value={2}>Left Ventricular Hypertrophy</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-ink-muted block mb-1.5">Max Heart Rate (thalach)</label>
                    <input
                      type="number"
                      required
                      min={60}
                      max={220}
                      value={heartForm.thalach}
                      onChange={(e) => setHeartForm({ ...heartForm, thalach: parseInt(e.target.value) || 0 })}
                      className="w-full border border-line rounded-xl px-3 py-2 bg-surface text-sm text-ink focus:outline-none focus:ring-1 focus:ring-brand-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-ink-muted block mb-1.5">Exercise Angina (exang)</label>
                    <select
                      value={heartForm.exang}
                      onChange={(e) => setHeartForm({ ...heartForm, exang: parseInt(e.target.value) || 0 })}
                      className="w-full border border-line rounded-xl px-3 py-2 bg-surface text-sm text-ink focus:outline-none focus:ring-1 focus:ring-brand-500"
                    >
                      <option value={0}>No exercise chest pain</option>
                      <option value={1}>Yes, chest pain during workout</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-ink-muted block mb-1.5">ST Depression (oldpeak)</label>
                    <input
                      type="number"
                      required
                      step="0.1"
                      min={0.0}
                      max={10.0}
                      value={heartForm.oldpeak}
                      onChange={(e) => setHeartForm({ ...heartForm, oldpeak: parseFloat(e.target.value) || 0 })}
                      className="w-full border border-line rounded-xl px-3 py-2 bg-surface text-sm text-ink focus:outline-none focus:ring-1 focus:ring-brand-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-ink-muted block mb-1.5">ST Peak Slope</label>
                    <select
                      value={heartForm.slope}
                      onChange={(e) => setHeartForm({ ...heartForm, slope: parseInt(e.target.value) || 0 })}
                      className="w-full border border-line rounded-xl px-3 py-2 bg-surface text-sm text-ink focus:outline-none focus:ring-1 focus:ring-brand-500"
                    >
                      <option value={0}>Upsloping</option>
                      <option value={1}>Flat</option>
                      <option value={2}>Downsloping</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-ink-muted block mb-1.5">Colored Vessels (ca)</label>
                    <select
                      value={heartForm.ca}
                      onChange={(e) => setHeartForm({ ...heartForm, ca: parseInt(e.target.value) || 0 })}
                      className="w-full border border-line rounded-xl px-3 py-2 bg-surface text-sm text-ink focus:outline-none focus:ring-1 focus:ring-brand-500"
                    >
                      <option value={0}>0 vessels colored</option>
                      <option value={1}>1 vessel colored</option>
                      <option value={2}>2 vessels colored</option>
                      <option value={3}>3 vessels colored</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-ink-muted block mb-1.5">Thalassemia Type (thal)</label>
                    <select
                      value={heartForm.thal}
                      onChange={(e) => setHeartForm({ ...heartForm, thal: parseInt(e.target.value) || 0 })}
                      className="w-full border border-line rounded-xl px-3 py-2 bg-surface text-sm text-ink focus:outline-none focus:ring-1 focus:ring-brand-500"
                    >
                      <option value={1}>Normal</option>
                      <option value={2}>Fixed Defect</option>
                      <option value={3}>Reversible Defect</option>
                    </select>
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <Button type="submit" loading={loading} rightIcon={<ArrowRight className="h-4.5 w-4.5" />}>
                    Calculate Heart Risk
                  </Button>
                </div>
              </form>
            )}
          </Card>
        </div>

        {/* Right Results Panel */}
        <div className="lg:col-span-2">
          <AnimatePresence mode="wait">
            {!(activeTab === 'diabetes' ? diabetesResult : heartResult) ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="h-full min-h-[350px]"
              >
                <GlassCard className="h-full flex flex-col items-center justify-center text-center p-8 border border-line bg-surface/30">
                  <div className="grid h-14 w-14 place-items-center rounded-2xl bg-brand-500/10 text-brand-600 dark:text-brand-400 mb-4 animate-float">
                    <Sparkles className="h-7 w-7" />
                  </div>
                  <h3 className="text-base font-bold text-ink">Risk Dashboard</h3>
                  <p className="text-xs text-ink-muted max-w-xs mt-1.5 leading-relaxed">
                    Submit the clinical form on the left or select a verified dataset sample to generate calibrated risk predictions and explainable AI insights.
                  </p>
                </GlassCard>
              </motion.div>
            ) : (
              <motion.div
                key={activeTab === 'diabetes' ? diabetesResult?.predictionId : heartResult?.predictionId}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                {/* Risk score gauge */}
                <Card className="border border-line bg-card shadow-soft p-5 text-center flex flex-col items-center justify-center">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-ink-subtle">Calculated Risk</h3>
                  
                  {/* Gauge indicator */}
                  <div className="relative my-4 flex items-center justify-center">
                    <svg className="w-32 h-32 transform -rotate-90">
                      <circle
                        cx="64"
                        cy="64"
                        r="52"
                        className="stroke-line"
                        strokeWidth="8"
                        fill="transparent"
                      />
                      <circle
                        cx="64"
                        cy="64"
                        r="52"
                        className={cn('transition-all duration-1000', scoreColor(riskScore))}
                        strokeWidth="8"
                        strokeDasharray={326}
                        strokeDashoffset={326 - (326 * riskScore) / 100}
                        strokeLinecap="round"
                        fill="transparent"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-2xl font-extrabold text-ink">{riskScore}%</span>
                      <span className="text-[9px] uppercase tracking-wide text-ink-muted">Risk Score</span>
                    </div>
                  </div>

                  <div className="mt-2.5 flex items-center gap-2">
                    <Badge tone={scoreBadgeTone(riskScore)} dot>{riskLevel} Severity</Badge>
                    <span className="text-[10px] text-ink-subtle">
                      ({activeTab === 'diabetes' ? diabetesResult?.modelUsed : heartResult?.modelUsed})
                    </span>
                  </div>

                  {activeTab === 'heart' && heartResult?.riskDescription && (
                    <p className="mt-3.5 text-xs text-ink-muted leading-relaxed italic">
                      "{heartResult.riskDescription}"
                    </p>
                  )}
                </Card>

                {/* SHAP Feature Contribution Chart */}
                {parsedFeatureImportance.length > 0 && (
                  <Card className="border border-line bg-card shadow-soft p-5">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-ink-subtle mb-4">
                      SHAP Feature Influence (%)
                    </h3>
                    <div className="h-48 text-[10px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart
                          layout="vertical"
                          data={parsedFeatureImportance}
                          margin={{ top: 5, right: 10, left: 15, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" horizontal={true} stroke="rgba(0,0,0,0.06)" />
                          <XAxis type="number" unit="%" tickLine={false} stroke="rgba(0,0,0,0.4)" />
                          <YAxis dataKey="name" type="category" tickLine={false} width={60} stroke="rgba(0,0,0,0.4)" />
                          <Tooltip
                            content={({ active, payload }) => {
                              if (!active || !payload?.length) return null
                              const item = payload[0].payload
                              return (
                                <div className="rounded-xl border border-line bg-card p-2 shadow-lift text-[11px] font-bold text-ink">
                                  {item.name}: {item.value}% Impact
                                </div>
                              )
                            }}
                          />
                          <Bar dataKey="value" fill="#10b981" radius={[0, 4, 4, 0]} barSize={12} />
                        </ComposedChart>
                      </ResponsiveContainer>
                    </div>
                  </Card>
                )}

                {/* Vitals Anomalies Alerts */}
                {((activeTab === 'diabetes' ? diabetesResult?.abnormalValues : heartResult?.abnormalValues)) && 
                  Object.keys(activeTab === 'diabetes' ? diabetesResult?.abnormalValues : heartResult?.abnormalValues).length > 0 && (
                  <Card className="border border-line bg-card shadow-soft p-4 space-y-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-ink-subtle">
                      Vitals Exceeding Safety Limits
                    </h3>
                    <div className="space-y-2">
                      {Object.entries(activeTab === 'diabetes' ? diabetesResult?.abnormalValues : heartResult?.abnormalValues).map(([key, val]: any) => (
                        <div
                          key={key}
                          className="flex items-center justify-between rounded-xl border border-danger-200/20 bg-danger/5 px-3 py-2 text-xs"
                        >
                          <div>
                            <span className="font-bold capitalize text-ink">{key}</span>
                            <span className="text-ink-subtle ml-1">({val.value})</span>
                          </div>
                          <Badge tone="danger">{val.status}</Badge>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}

                {/* Recommendations */}
                {parsedRecommendations.length > 0 && (
                  <Card className="border border-line bg-card shadow-soft p-5">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-ink-subtle mb-3.5">
                      Clinical Guidelines & Action Items
                    </h3>
                    <div className="space-y-3">
                      {parsedRecommendations.map((reco, idx) => (
                        <div
                          key={idx}
                          className="flex items-start gap-3 rounded-xl border border-line bg-surface/30 p-3 text-xs"
                        >
                          <div className="text-lg leading-none mt-0.5">{reco.icon || reco.emoji || '💡'}</div>
                          <div className="space-y-0.5">
                            <h4 className="font-bold text-ink">{reco.title || 'Guideline'}</h4>
                            <p className="text-ink-muted leading-relaxed">{reco.description || reco.text}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  )
}
