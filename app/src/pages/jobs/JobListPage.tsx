import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import * as jobApi from '../../api/jobApi'
import type { JobListItem } from '../../types/job'

type SortOption = 'NEWEST' | 'BUDGET_ASC' | 'BUDGET_DESC'
type BudgetTypeOption = '' | 'FIXED' | 'HOURLY'

const PAGE_SIZE = 12

const SORT_OPTIONS: { value: SortOption; label: string; icon: string }[] = [
  { value: 'NEWEST',     label: 'Mới nhất',      icon: '🕐' },
  { value: 'BUDGET_ASC', label: 'Ngân sách thấp', icon: '↑' },
  { value: 'BUDGET_DESC',label: 'Ngân sách cao',  icon: '↓' },
]

function formatBudget(j: JobListItem): string {
  if (j.budgetType === 'FIXED') {
    return j.fixedBudget != null ? `$${Number(j.fixedBudget).toLocaleString()}` : '—'
  }
  if (j.hourlyRate != null) {
    return j.estimatedHours != null
      ? `$${Number(j.hourlyRate).toLocaleString()}/h · ~${j.estimatedHours}h`
      : `$${Number(j.hourlyRate).toLocaleString()}/h`
  }
  return '—'
}

function formatDeadline(iso?: string | null): string {
  if (!iso) return '—'
  const d = new Date(iso)
  const now = new Date()
  const diff = Math.ceil((d.getTime() - now.getTime()) / 86400000)
  if (diff < 0)  return 'Đã hết hạn'
  if (diff === 0) return 'Hôm nay'
  if (diff === 1) return 'Còn 1 ngày'
  if (diff <= 7)  return `Còn ${diff} ngày`
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function formatRelative(iso?: string | null): string {
  if (!iso) return ''
  const d = new Date(iso)
  const diffMin = Math.floor((Date.now() - d.getTime()) / 60000)
  if (diffMin < 1)  return 'Vừa đăng'
  if (diffMin < 60) return `${diffMin} phút trước`
  const diffH = Math.floor(diffMin / 60)
  if (diffH < 24)   return `${diffH} giờ trước`
  const diffD = Math.floor(diffH / 24)
  if (diffD < 30)   return `${diffD} ngày trước`
  return d.toLocaleDateString('vi-VN')
}

const STATUS_STYLE: Record<string, { bg: string; color: string; label: string }> = {
  OPEN:        { bg: '#dcfce7', color: '#15803d', label: 'Đang mở' },
  IN_PROGRESS: { bg: '#dbeafe', color: '#1d4ed8', label: 'Đang làm' },
  COMPLETED:   { bg: '#f3f4f6', color: '#4b5563', label: 'Hoàn thành' },
  CANCELLED:   { bg: '#fee2e2', color: '#b91c1c', label: 'Đã hủy' },
}

export function JobListPage() {
  const [q, setQ]                           = useState('')
  const [skillInput, setSkillInput]         = useState('')
  const [skills, setSkills]                 = useState<string[]>([])
  const [budgetType, setBudgetType]         = useState<BudgetTypeOption>('')
  const [minBudget, setMinBudget]           = useState('')
  const [maxBudget, setMaxBudget]           = useState('')
  const [deadlineBefore, setDeadlineBefore] = useState('')
  const [sort, setSort]                     = useState<SortOption>('NEWEST')

  const [page, setPage]                   = useState(0)
  const [totalPages, setTotalPages]       = useState(0)
  const [totalElements, setTotalElements] = useState(0)

  const [items, setItems]     = useState<JobListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState<string | null>(null)

  const abortRef = useRef<AbortController | null>(null)

  const hasActiveFilters =
    skills.length > 0 || budgetType !== '' || minBudget !== '' || maxBudget !== '' || deadlineBefore !== ''

  async function load(p = 0) {
    abortRef.current?.abort()
    abortRef.current = new AbortController()
    setLoading(true)
    setError(null)
    try {
      const params: Record<string, any> = { page: p, size: PAGE_SIZE, sort }
      if (q.trim())       params.q              = q.trim()
      if (skills.length)  params.skills         = skills
      if (budgetType)     params.budgetType     = budgetType
      if (minBudget)      params.minBudget      = Number(minBudget)
      if (maxBudget)      params.maxBudget      = Number(maxBudget)
      if (deadlineBefore) params.deadlineBefore = new Date(deadlineBefore).toISOString()
      const res = await jobApi.listJobs(params)
      setItems(res.items)
      setPage(res.page ?? p)
      setTotalPages(res.totalPages ?? 0)
      setTotalElements(res.totalElements ?? 0)
    } catch (err: any) {
      if (err?.name === 'AbortError') return
      setError(err?.response?.data?.message ?? err?.message ?? 'Không thể tải danh sách việc làm')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load(0) }, []) // eslint-disable-line

  function handleSearch(e: React.FormEvent) { e.preventDefault(); load(0) }

  function handlePageChange(p: number) {
    setPage(p); load(p)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function addSkill() {
    const s = skillInput.trim()
    if (s && !skills.includes(s)) setSkills(prev => [...prev, s])
    setSkillInput('')
  }

  function removeSkill(s: string) { setSkills(prev => prev.filter(x => x !== s)) }

  function clearFilters() {
    setSkills([]); setBudgetType(''); setMinBudget(''); setMaxBudget(''); setDeadlineBefore('')
  }

  return (
    <>
      <style>{`
        .jl-root {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 16px 48px;
        }

        .jl-topbar {
          padding: 28px 0 20px;
          border-bottom: 1px solid var(--border, #e5e7eb);
          margin-bottom: 24px;
        }

        .jl-topbar-heading {
          font-size: 22px;
          font-weight: 700;
          letter-spacing: -0.4px;
          margin: 0 0 16px;
          color: var(--text, #111827);
        }

        .jl-search-row {
          display: flex;
          gap: 8px;
        }

        .jl-search-input {
          flex: 1;
          min-width: 0;
          padding: 11px 16px;
          border-radius: 10px;
          border: 1.5px solid var(--border, #e5e7eb);
          background: var(--bg-subtle, #f9fafb);
          
          font-size: 14px;
          color: var(--text, #111827);
          outline: none;
          transition: border-color 0.18s, box-shadow 0.18s, background 0.18s;
        }

        .jl-search-input:focus {
          border-color: #3b82f6;
          background: #fff;
          box-shadow: 0 0 0 3px rgba(59,130,246,0.1);
        }

        .jl-search-btn {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 11px 20px;
          border-radius: 10px;
          border: none;
          background: var(--color-primary, #2563eb);
          color: #fff;
          
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.15s, transform 0.12s;
          white-space: nowrap;
        }

        .jl-search-btn:hover:not(:disabled) { background: var(--color-primary-hover, #1d4ed8); }
        .jl-search-btn:active:not(:disabled) { transform: scale(0.98); }
        .jl-search-btn:disabled { opacity: 0.55; cursor: not-allowed; }

        .jl-body {
          display: grid;
          grid-template-columns: 256px 1fr;
          gap: 24px;
          align-items: start;
        }

        @media (max-width: 768px) {
          .jl-body { grid-template-columns: 1fr; }
          .jl-sidebar { position: static !important; }
        }

        /* ── Sidebar ── */
        .jl-sidebar {
          position: sticky;
          top: 16px;
          display: flex;
          flex-direction: column;
          border-radius: 14px;
          border: 1px solid var(--border, #e5e7eb);
          background: var(--bg-card, #fff);
          overflow: hidden;
        }

        .jl-sidebar-header {
          padding: 14px 16px 12px;
          background: var(--bg-subtle, #f9fafb);
          border-bottom: 1px solid var(--border, #e5e7eb);
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .jl-sidebar-title {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--text-muted, #6b7280);
          
        }

        .jl-clear-btn {
          font-size: 11px;
          font-weight: 600;
          color: #ef4444;
          background: none;
          border: none;
          cursor: pointer;
          padding: 2px 6px;
          border-radius: 5px;
          
          transition: background 0.15s;
        }

        .jl-clear-btn:hover { background: #fef2f2; }

        .jl-section {
          padding: 16px;
          border-bottom: 1px solid var(--border, #e5e7eb);
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .jl-section:last-child { border-bottom: none; }

        .jl-section-label {
          font-size: 10.5px;
          font-weight: 700;
          letter-spacing: 0.07em;
          text-transform: uppercase;
          color: var(--text-muted, #9ca3af);
          
        }

        .jl-sort-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          width: 100%;
          padding: 8px 10px;
          border-radius: 8px;
          border: 1px solid transparent;
          background: none;
          
          font-size: 13px;
          font-weight: 500;
          color: var(--text, #374151);
          cursor: pointer;
          text-align: left;
          transition: all 0.15s;
        }

        .jl-sort-btn:hover { background: var(--bg-subtle, #f9fafb); }

        .jl-sort-btn.active {
          background: #eff6ff;
          border-color: #bfdbfe;
          color: #1d4ed8;
          font-weight: 600;
        }

        .jl-sort-dot {
          width: 6px; height: 6px;
          border-radius: 50%;
          background: #3b82f6;
          flex-shrink: 0;
          margin-left: auto;
        }

        .jl-budget-type-row { display: flex; gap: 5px; }

        .jl-btype-btn {
          flex: 1;
          padding: 7px 4px;
          border-radius: 8px;
          border: 1.5px solid var(--border, #e5e7eb);
          background: none;
          
          font-size: 11.5px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s;
          color: var(--text-muted, #6b7280);
          text-align: center;
        }

        .jl-btype-btn:hover { border-color: #93c5fd; color: #1d4ed8; }

        .jl-btype-btn.active {
          border-color: #3b82f6;
          background: #eff6ff;
          color: #1d4ed8;
        }

        .jl-range-row { display: flex; align-items: center; gap: 6px; }

        .jl-range-input {
          flex: 1; min-width: 0;
          padding: 8px 10px;
          border-radius: 8px;
          border: 1.5px solid var(--border, #e5e7eb);
          background: var(--bg-subtle, #f9fafb);
          
          font-size: 13px;
          color: var(--text, #111827);
          outline: none;
          transition: border-color 0.15s;
          width: 100%;
          box-sizing: border-box;
        }

        .jl-range-input:focus { border-color: #3b82f6; background: #fff; }
        .jl-range-sep { color: var(--text-muted, #9ca3af); font-size: 13px; flex-shrink: 0; }

        .jl-skill-row { display: flex; gap: 5px; }

        .jl-skill-input {
          flex: 1; min-width: 0;
          padding: 8px 10px;
          border-radius: 8px;
          border: 1.5px solid var(--border, #e5e7eb);
          background: var(--bg-subtle, #f9fafb);
          
          font-size: 13px;
          color: var(--text, #111827);
          outline: none;
          transition: border-color 0.15s;
          box-sizing: border-box;
        }

        .jl-skill-input:focus { border-color: #3b82f6; background: #fff; }

        .jl-skill-add {
          padding: 0 12px;
          border-radius: 8px;
          border: 1.5px solid var(--border, #e5e7eb);
          background: none;
          font-size: 18px;
          line-height: 1;
          cursor: pointer;
          color: var(--text-muted, #6b7280);
          transition: all 0.15s;
          display: flex;
          align-items: center;
        }

        .jl-skill-add:hover { border-color: #3b82f6; color: #3b82f6; }

        .jl-skill-tags { display: flex; flex-wrap: wrap; gap: 5px; }

        .jl-skill-tag {
          display: inline-flex; align-items: center; gap: 4px;
          padding: 3px 8px; border-radius: 99px;
          font-size: 11.5px; font-weight: 500;
          background: #eff6ff; color: #1d4ed8; border: 1px solid #bfdbfe;
        }

        .jl-skill-tag button {
          background: none; border: none; cursor: pointer;
          padding: 0; line-height: 1; font-size: 14px;
          color: #93c5fd; font-weight: 700; display: flex;
        }

        .jl-skill-tag button:hover { color: #1d4ed8; }

        .jl-date-input {
          width: 100%; padding: 8px 10px; border-radius: 8px;
          border: 1.5px solid var(--border, #e5e7eb);
          background: var(--bg-subtle, #f9fafb);
           font-size: 13px;
          color: var(--text, #111827); outline: none;
          transition: border-color 0.15s; box-sizing: border-box;
        }

        .jl-date-input:focus { border-color: #3b82f6; background: #fff; }

        .jl-apply-btn {
          width: 100%; padding: 10px; border-radius: 8px; border: none;
          background: var(--color-primary, #2563eb); color: #fff;
           font-size: 13px; font-weight: 600;
          cursor: pointer; transition: background 0.15s;
        }

        .jl-apply-btn:hover:not(:disabled) { background: var(--color-primary-hover, #1d4ed8); }
        .jl-apply-btn:disabled { opacity: 0.55; cursor: not-allowed; }

        /* ── Main ── */
        .jl-main { min-width: 0; }

        .jl-results-bar {
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 16px; min-height: 24px;
        }

        .jl-results-count {
          font-size: 13px; color: var(--text-muted, #6b7280);
          
        }

        .jl-chips { display: flex; flex-wrap: wrap; gap: 5px; margin-bottom: 14px; }

        .jl-chip {
          display: inline-flex; align-items: center; gap: 5px;
          padding: 3px 10px; border-radius: 99px; font-size: 12px; font-weight: 500;
          background: var(--bg-subtle, #f3f4f6); border: 1px solid var(--border, #e5e7eb);
          color: var(--text, #374151);
        }

        .jl-chip button {
          background: none; border: none; cursor: pointer;
          padding: 0; line-height: 1; opacity: 0.45; font-size: 15px; display: flex;
        }

        .jl-chip button:hover { opacity: 1; }

        .jl-error {
          display: flex; align-items: flex-start; gap: 10px;
          padding: 12px 14px; border-radius: 10px;
          background: #fef2f2; border: 1px solid #fecaca;
          color: #b91c1c; font-size: 13.5px; margin-bottom: 16px;
        }

        /* ── Grid ── */
        .jl-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 12px;
        }

        /* ── Card ── */
        .jl-card {
          background: var(--bg-card, #fff);
          border: 1px solid var(--border, #e5e7eb);
          border-radius: 14px;
          padding: 18px;
          display: flex; flex-direction: column;
          transition: border-color 0.18s, box-shadow 0.18s, transform 0.18s;
        }

        .jl-card:hover {
          border-color: #93c5fd;
          box-shadow: 0 4px 20px rgba(59,130,246,0.1);
          transform: translateY(-2px);
        }

        .jl-card-top {
          display: flex; justify-content: space-between; align-items: center;
          margin-bottom: 12px;
        }

        .jl-status-badge {
          display: inline-block; padding: 2px 9px; border-radius: 99px;
          font-size: 10.5px; font-weight: 700; letter-spacing: 0.05em;
          text-transform: uppercase; 
        }

        .jl-timestamp {
          font-size: 11px; color: var(--text-muted, #9ca3af);
          
        }

        .jl-card-title {
          font-size: 14.5px; font-weight: 700; line-height: 1.35;
          letter-spacing: -0.2px; margin-bottom: 10px; color: var(--text, #111827);
        }

        .jl-skill-pills { display: flex; flex-wrap: wrap; gap: 4px; margin-bottom: 14px; }

        .jl-skill-pill {
          padding: 2px 8px; border-radius: 99px; font-size: 11px; font-weight: 500;
          background: var(--bg-subtle, #f3f4f6); border: 1px solid var(--border, #e5e7eb);
          color: var(--text-muted, #6b7280);
        }

        .jl-card-stats {
          display: grid; grid-template-columns: 1fr 1fr;
          gap: 1px; background: var(--border, #e5e7eb);
          border: 1px solid var(--border, #e5e7eb);
          border-radius: 10px; overflow: hidden; margin-bottom: 14px;
        }

        .jl-stat {
          background: var(--bg-subtle, #f9fafb);
          padding: 9px 11px; display: flex; flex-direction: column; gap: 3px;
        }

        .jl-stat-label {
          font-size: 9.5px; font-weight: 600; text-transform: uppercase;
          letter-spacing: 0.06em; color: var(--text-muted, #9ca3af);
          
        }

        .jl-stat-value {
          font-size: 12.5px; font-weight: 700; color: var(--text, #111827);
        }

        .jl-card-action {
          display: flex; align-items: center; justify-content: center; gap: 6px;
          padding: 9px; border-radius: 9px;
          background: var(--color-primary, #2563eb); color: #fff;
           font-size: 13px; font-weight: 600;
          text-decoration: none; transition: background 0.15s; margin-top: auto;
        }

        .jl-card-action:hover { background: var(--color-primary-hover, #1d4ed8); }

        /* ── Skeleton ── */
        .jl-skeleton-card {
          background: var(--bg-card, #fff);
          border: 1px solid var(--border, #e5e7eb);
          border-radius: 14px; padding: 18px;
          display: flex; flex-direction: column; gap: 10px;
        }

        .jl-skel {
          border-radius: 6px;
          background: linear-gradient(90deg, var(--border,#e5e7eb) 25%, #f3f4f6 50%, var(--border,#e5e7eb) 75%);
          background-size: 200% 100%;
          animation: shimmer 1.4s infinite;
        }

        @keyframes shimmer { from { background-position: 200% 0 } to { background-position: -200% 0 } }

        /* ── Empty ── */
        .jl-empty {
          text-align: center; padding: 72px 24px;
          border: 2px dashed var(--border, #e5e7eb);
          border-radius: 16px; color: var(--text-muted, #9ca3af);
        }

        /* ── Pagination ── */
        .jl-pagination {
          display: flex; justify-content: center;
          gap: 5px; margin-top: 32px; flex-wrap: wrap;
        }

        .jl-page-btn {
          min-width: 36px; height: 36px; padding: 0 8px;
          border-radius: 8px; border: 1px solid var(--border, #e5e7eb);
          background: var(--bg-card, #fff);
           font-size: 13px; font-weight: 500;
          color: var(--text, #374151); cursor: pointer; transition: all 0.15s;
          display: inline-flex; align-items: center; justify-content: center;
        }

        .jl-page-btn:hover:not(:disabled):not(.active) { border-color: #93c5fd; color: #1d4ed8; }
        .jl-page-btn:disabled { opacity: 0.4; cursor: not-allowed; }

        .jl-page-btn.active {
          background: var(--color-primary, #2563eb); border-color: var(--color-primary, #2563eb);
          color: #fff; font-weight: 700;
        }

        .jl-page-ellipsis {
          display: inline-flex; align-items: center;
          padding: 0 4px; color: var(--text-muted, #9ca3af);
          font-size: 13px; align-self: center;
        }
      `}</style>

      <div className="jl-root">

        {/* ── Top bar ── */}
        <div className="jl-topbar">
          <div className="jl-topbar-heading">Tìm việc làm</div>
          <form className="jl-search-row" onSubmit={handleSearch}>
            <input
              className="jl-search-input"
              value={q}
              onChange={e => setQ(e.target.value)}
              placeholder="Tìm theo tiêu đề, mô tả… (ví dụ: React, Java, Designer)"
            />
            <button className="jl-search-btn" type="submit" disabled={loading}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              {loading ? 'Đang tìm…' : 'Tìm kiếm'}
            </button>
          </form>
        </div>

        {/* ── Body ── */}
        <div className="jl-body">

          {/* ══ SIDEBAR ══ */}
          <aside className="jl-sidebar">
            <div className="jl-sidebar-header">
              <span className="jl-sidebar-title">Bộ lọc</span>
              {hasActiveFilters && (
                <button className="jl-clear-btn" onClick={() => { clearFilters(); setTimeout(() => load(0), 0) }}>
                  Xóa tất cả
                </button>
              )}
            </div>

            {/* Sort */}
            <div className="jl-section">
              <div className="jl-section-label">Sắp xếp</div>
              {SORT_OPTIONS.map(o => (
                <button
                  key={o.value}
                  className={`jl-sort-btn${sort === o.value ? ' active' : ''}`}
                  onClick={() => setSort(o.value)}
                >
                  <span style={{ fontSize: 14 }}>{o.icon}</span>
                  {o.label}
                  {sort === o.value && <span className="jl-sort-dot" />}
                </button>
              ))}
            </div>

            {/* Budget type */}
            <div className="jl-section">
              <div className="jl-section-label">Loại ngân sách</div>
              <div className="jl-budget-type-row">
                {(['', 'FIXED', 'HOURLY'] as BudgetTypeOption[]).map(v => (
                  <button
                    key={v}
                    className={`jl-btype-btn${budgetType === v ? ' active' : ''}`}
                    onClick={() => setBudgetType(v)}
                  >
                    {v === '' ? 'Tất cả' : v === 'FIXED' ? 'Cố định' : 'Theo giờ'}
                  </button>
                ))}
              </div>
            </div>

            {/* Budget range */}
            <div className="jl-section">
              <div className="jl-section-label">Khoảng ngân sách ($)</div>
              <div className="jl-range-row">
                <input
                  className="jl-range-input" type="number" min={0}
                  value={minBudget} onChange={e => setMinBudget(e.target.value)}
                  placeholder="Từ"
                />
                <span className="jl-range-sep">—</span>
                <input
                  className="jl-range-input" type="number" min={0}
                  value={maxBudget} onChange={e => setMaxBudget(e.target.value)}
                  placeholder="Đến"
                />
              </div>
            </div>

            {/* Skills */}
            <div className="jl-section">
              <div className="jl-section-label">Kỹ năng yêu cầu</div>
              <div className="jl-skill-row">
                <input
                  className="jl-skill-input"
                  value={skillInput}
                  onChange={e => setSkillInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSkill() } }}
                  placeholder="Nhập & Enter…"
                />
                <button className="jl-skill-add" type="button" onClick={addSkill}>+</button>
              </div>
              {skills.length > 0 && (
                <div className="jl-skill-tags">
                  {skills.map(s => (
                    <span key={s} className="jl-skill-tag">
                      {s}
                      <button onClick={() => removeSkill(s)}>×</button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Deadline */}
            <div className="jl-section">
              <div className="jl-section-label">Deadline trước ngày</div>
              <input
                className="jl-date-input" type="date"
                value={deadlineBefore} onChange={e => setDeadlineBefore(e.target.value)}
              />
            </div>

            {/* Apply */}
            <div className="jl-section">
              <button className="jl-apply-btn" onClick={() => load(0)} disabled={loading}>
                {loading ? 'Đang tìm…' : 'Áp dụng bộ lọc'}
              </button>
            </div>
          </aside>

          {/* ══ MAIN ══ */}
          <main className="jl-main">

            <div className="jl-results-bar">
              {!loading && !error && (
                <span className="jl-results-count">
                  {totalElements > 0
                    ? `${totalElements.toLocaleString()} kết quả — trang ${page + 1}/${totalPages}`
                    : 'Không tìm thấy kết quả'}
                </span>
              )}
            </div>

            {/* Active chips */}
            {hasActiveFilters && (
              <div className="jl-chips">
                {budgetType    && <FilterChip label={`Loại: ${budgetType === 'FIXED' ? 'Cố định' : 'Theo giờ'}`} onRemove={() => setBudgetType('')} />}
                {minBudget     && <FilterChip label={`≥ $${minBudget}`} onRemove={() => setMinBudget('')} />}
                {maxBudget     && <FilterChip label={`≤ $${maxBudget}`} onRemove={() => setMaxBudget('')} />}
                {deadlineBefore && <FilterChip label={`Trước ${new Date(deadlineBefore).toLocaleDateString('vi-VN')}`} onRemove={() => setDeadlineBefore('')} />}
                {skills.map(s => <FilterChip key={s} label={s} onRemove={() => removeSkill(s)} />)}
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="jl-error">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 1 }}>
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                {error}
              </div>
            )}

            {/* Skeleton */}
            {loading && (
              <div className="jl-grid">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="jl-skeleton-card">
                    <div className="jl-skel" style={{ height: 14, width: '40%' }} />
                    <div className="jl-skel" style={{ height: 18, width: '80%' }} />
                    <div className="jl-skel" style={{ height: 12, width: '60%' }} />
                    <div className="jl-skel" style={{ height: 72, borderRadius: 10 }} />
                    <div className="jl-skel" style={{ height: 36, borderRadius: 9 }} />
                  </div>
                ))}
              </div>
            )}

            {/* Empty */}
            {!loading && !error && items.length === 0 && (
              <div className="jl-empty">
                <div style={{ fontSize: 36, marginBottom: 12 }}>🔍</div>
                <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 6 }}>Không tìm thấy công việc</div>
                <div style={{ fontSize: 13 }}>Thử thay đổi từ khóa hoặc điều chỉnh bộ lọc</div>
                {hasActiveFilters && (
                  <button
                    className="jl-apply-btn"
                    style={{ maxWidth: 180, margin: '16px auto 0' }}
                    onClick={() => { clearFilters(); load(0) }}
                  >
                    Xóa bộ lọc
                  </button>
                )}
              </div>
            )}

            {/* Job grid */}
            {!loading && items.length > 0 && (
              <div className="jl-grid">
                {items.map(j => {
                  const ss = STATUS_STYLE[j.status] ?? STATUS_STYLE.OPEN
                  const deadline = formatDeadline((j as any).deadline)
                  const urgentDl = deadline.startsWith('Còn') && parseInt(deadline.replace('Còn ', '')) <= 3

                  return (
                    <div key={j.id} className="jl-card">
                      <div className="jl-card-top">
                        <span className="jl-status-badge" style={{ background: ss.bg, color: ss.color }}>
                          {ss.label}
                        </span>
                        <span className="jl-timestamp">{formatRelative((j as any).createdAt)}</span>
                      </div>

                      <div className="jl-card-title">{j.title}</div>

                      {j.requiredSkills?.length ? (
                        <div className="jl-skill-pills">
                          {j.requiredSkills.slice(0, 4).map(sk => (
                            <span key={sk} className="jl-skill-pill">{sk}</span>
                          ))}
                          {j.requiredSkills.length > 4 && (
                            <span className="jl-skill-pill" style={{ opacity: 0.5 }}>
                              +{j.requiredSkills.length - 4}
                            </span>
                          )}
                        </div>
                      ) : <div style={{ marginBottom: 14 }} />}

                      <div className="jl-card-stats">
                        <div className="jl-stat">
                          <span className="jl-stat-label">💰 Ngân sách</span>
                          <span className="jl-stat-value">{formatBudget(j)}</span>
                        </div>
                        <div className="jl-stat">
                          <span className="jl-stat-label">📅 Deadline</span>
                          <span className="jl-stat-value" style={urgentDl ? { color: '#dc2626' } : undefined}>
                            {deadline}
                          </span>
                        </div>
                        <div className="jl-stat">
                          <span className="jl-stat-label">📝 Đề xuất</span>
                          <span className="jl-stat-value">{(j as any).proposalCount ?? 0} người</span>
                        </div>
                        <div className="jl-stat">
                          <span className="jl-stat-label">💼 Hình thức</span>
                          <span className="jl-stat-value">{j.budgetType === 'FIXED' ? 'Cố định' : 'Theo giờ'}</span>
                        </div>
                      </div>

                      <Link className="jl-card-action" to={`/jobs/${j.id}`}>
                        Xem chi tiết
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M5 12h14M12 5l7 7-7 7"/>
                        </svg>
                      </Link>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Pagination */}
            {!loading && totalPages > 1 && (
              <div className="jl-pagination">
                <button className="jl-page-btn" disabled={page === 0} onClick={() => handlePageChange(page - 1)}>←</button>
                {Array.from({ length: totalPages }, (_, i) => {
                  const show = i === 0 || i === totalPages - 1 || Math.abs(i - page) <= 1
                  if (!show) {
                    if (i === 1 && page > 3)                           return <span key={i} className="jl-page-ellipsis">…</span>
                    if (i === totalPages - 2 && page < totalPages - 4) return <span key={i} className="jl-page-ellipsis">…</span>
                    return null
                  }
                  return (
                    <button key={i} className={`jl-page-btn${i === page ? ' active' : ''}`} onClick={() => handlePageChange(i)}>
                      {i + 1}
                    </button>
                  )
                })}
                <button className="jl-page-btn" disabled={page >= totalPages - 1} onClick={() => handlePageChange(page + 1)}>→</button>
              </div>
            )}
          </main>
        </div>
      </div>
    </>
  )
}

function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="jl-chip">
      {label}
      <button onClick={onRemove}>×</button>
    </span>
  )
}