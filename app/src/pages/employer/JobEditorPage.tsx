import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import * as jobApi from '../../api/jobApi'
import type { BudgetType, CreateJobRequest, JobDetail } from '../../types/job'

function splitSkills(value: string) {
  return value
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
}

export function JobEditorPage() {
  const { jobId } = useParams()
  const isEdit = Boolean(jobId)
  const nav = useNavigate()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [existing, setExisting] = useState<JobDetail | null>(null)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [skills, setSkills] = useState('')
  const [budgetType, setBudgetType] = useState<BudgetType>('FIXED')
  const [fixedBudget, setFixedBudget] = useState<number>(100)
  const [hourlyRate, setHourlyRate] = useState<number>(10)
  const [estimatedHours, setEstimatedHours] = useState<number>(10)
  const [deadline, setDeadline] = useState('')

  useEffect(() => {
    let cancelled = false
    if (!isEdit || !jobId) return

    ;(async () => {
      setLoading(true)
      try {
        const job = await jobApi.getJob(jobId)
        if (cancelled) return
        setExisting(job)
        setTitle(job.title)
        setDescription(job.description)
        setSkills(job.requiredSkills?.join(', ') ?? '')
        setBudgetType(job.budgetType)
        setFixedBudget(Number(job.fixedBudget ?? 100))
        setHourlyRate(Number(job.hourlyRate ?? 10))
        setEstimatedHours(Number(job.estimatedHours ?? 10))
        setDeadline(job.deadline ? job.deadline.slice(0, 10) : '')
      } catch (err: any) {
        if (!cancelled) setError(err?.response?.data?.message ?? err?.message ?? 'Failed to load job')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [isEdit, jobId])

  const payload: CreateJobRequest = useMemo(() => {
    const base: CreateJobRequest = {
      title,
      description,
      requiredSkills: splitSkills(skills),
      budgetType,
    }

    if (budgetType === 'FIXED') {
      base.fixedBudget = fixedBudget
    } else {
      base.hourlyRate = hourlyRate
      base.estimatedHours = estimatedHours
    }

    if (deadline) {
      base.deadline = new Date(deadline).toISOString()
    }

    return base
  }, [title, description, skills, budgetType, fixedBudget, hourlyRate, estimatedHours, deadline])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const res = isEdit && jobId ? await jobApi.updateJob(jobId, payload) : await jobApi.createJob(payload)
      nav(`/jobs/${res.id}`)
    } catch (err: any) {
      setError(err?.response?.data?.message ?? err?.message ?? 'Save failed')
    } finally {
      setLoading(false)
    }
  }

  async function onCloseJob() {
    if (!jobId) return
    setError(null)
    setLoading(true)
    try {
      const res = await jobApi.closeJob(jobId)
      nav(`/jobs/${res.id}`)
    } catch (err: any) {
      setError(err?.response?.data?.message ?? err?.message ?? 'Close failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="stack" style={{ gap: 14, maxWidth: 920 }}>
      <div className="row" style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div className="stack" style={{ gap: 6 }}>
          <h1 className="page-title">{isEdit ? 'Edit job' : 'Create job'}</h1>
          <p className="page-subtitle">Jobs must have a clear title, detailed description, and valid budget.</p>
          {existing ? (
            <div className="row">
              <span className="pill pill-primary">{existing.status}</span>
              <span className="pill">Job ID: {existing.id}</span>
            </div>
          ) : null}
        </div>
        <div className="row">
          <button className="btn" type="button" onClick={() => nav('/employer/jobs')} disabled={loading}>
            Back
          </button>
        </div>
      </div>

      <div className="card card-pad">
        <form className="stack" onSubmit={onSubmit}>
          <div className="stack" style={{ gap: 6 }}>
            <label className="hint" htmlFor="title">
              Title
            </label>
            <input
              id="title"
              className="input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              minLength={10}
              maxLength={100}
              required
              placeholder="e.g. Build a React dashboard for job posting"
            />
          </div>

          <div className="stack" style={{ gap: 6 }}>
            <label className="hint" htmlFor="desc">
              Description
            </label>
            <textarea
              id="desc"
              className="textarea"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              minLength={50}
              maxLength={20000}
              required
              placeholder="Describe scope, requirements, and deliverables…"
            />
            <div className="hint">{description.length}/20000 ký tự (tối thiểu 50)</div>
          </div>

          <div className="grid grid-2">
            <div className="stack" style={{ gap: 6 }}>
              <label className="hint" htmlFor="skills">
                Skills (comma-separated)
              </label>
              <input
                id="skills"
                className="input"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                placeholder="react, typescript, mongodb"
              />
            </div>

            <div className="stack" style={{ gap: 6 }}>
              <label className="hint" htmlFor="deadline">
                Deadline (optional)
              </label>
              <input id="deadline" className="input" type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
              <div className="hint">If set, deadline should be in the future.</div>
            </div>
          </div>

          <div className="grid grid-2">
            <div className="stack" style={{ gap: 6 }}>
              <label className="hint" htmlFor="budgetType">
                Budget type
              </label>
              <select id="budgetType" className="select" value={budgetType} onChange={(e) => setBudgetType(e.target.value as any)}>
                <option value="FIXED">FIXED</option>
                <option value="HOURLY">HOURLY</option>
              </select>
            </div>

            {budgetType === 'FIXED' ? (
              <div className="stack" style={{ gap: 6 }}>
                <label className="hint" htmlFor="fixed">
                  Fixed budget
                </label>
                <input
                  id="fixed"
                  className="input"
                  type="number"
                  min={0.01}
                  step={0.01}
                  value={fixedBudget}
                  onChange={(e) => setFixedBudget(Number(e.target.value))}
                  required
                />
              </div>
            ) : (
              <>
                <div className="stack" style={{ gap: 6 }}>
                  <label className="hint" htmlFor="rate">
                    Hourly rate
                  </label>
                  <input
                    id="rate"
                    className="input"
                    type="number"
                    min={0.01}
                    step={0.01}
                    value={hourlyRate}
                    onChange={(e) => setHourlyRate(Number(e.target.value))}
                    required
                  />
                </div>
                <div className="stack" style={{ gap: 6 }}>
                  <label className="hint" htmlFor="hours">
                    Estimated hours
                  </label>
                  <input
                    id="hours"
                    className="input"
                    type="number"
                    min={1}
                    value={estimatedHours}
                    onChange={(e) => setEstimatedHours(Number(e.target.value))}
                    required
                  />
                </div>
              </>
            )}
          </div>

          {error ? <div className="alert alert-error">{error}</div> : null}

          <div className="row" style={{ justifyContent: 'space-between' }}>
            <div className="hint">On success you will be redirected to job detail.</div>
            <div className="row">
              {isEdit ? (
                <button className="btn btn-danger" type="button" onClick={onCloseJob} disabled={loading}>
                  {loading ? 'Working…' : 'Close job'}
                </button>
              ) : null}
              <button className="btn btn-primary" type="submit" disabled={loading}>
                {loading ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
