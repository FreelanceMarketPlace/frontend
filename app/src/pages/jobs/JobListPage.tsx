import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import * as jobApi from '../../api/jobApi'
import type { JobListItem } from '../../types/job'

type SortOption = 'NEWEST' | 'BUDGET_ASC' | 'BUDGET_DESC'
type BudgetTypeOption = '' | 'FIXED' | 'HOURLY'

const PAGE_SIZE = 12

const SORT_LABELS: Record<SortOption, string> = {
  NEWEST: 'Mới nhất',
  BUDGET_ASC: 'Ngân sách ↑',
  BUDGET_DESC: 'Ngân sách ↓',
}

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
  const diffDays = Math.ceil((d.getTime() - now.getTime()) / 86400000)
  if (diffDays < 0) return 'Đã hết hạn'
  if (diffDays === 0) return 'Hôm nay'
  if (diffDays === 1) return 'Còn 1 ngày'
  if (diffDays <= 7) return `Còn ${diffDays} ngày`
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function formatRelative(iso?: string | null): string {
  if (!iso) return ''
  const d = new Date(iso)
  const now = new Date()
  const diffMin = Math.floor((now.getTime() - d.getTime()) / 60000)
  if (diffMin < 1) return 'Vừa đăng'
  if (diffMin < 60) return `${diffMin} phút trước`
  const diffH = Math.floor(diffMin / 60)
  if (diffH < 24) return `${diffH} giờ trước`
  const diffD = Math.floor(diffH / 24)
  if (diffD < 30) return `${diffD} ngày trước`
  return d.toLocaleDateString('vi-VN')
}

const STATUS_STYLE: Record<string, { bg: string; color: string; label: string }> = {
  OPEN:        { bg: '#d1fae5', color: '#065f46', label: 'Đang mở' },
  IN_PROGRESS: { bg: '#dbeafe', color: '#1e40af', label: 'Đang làm' },
  COMPLETED:   { bg: '#f3f4f6', color: '#374151', label: 'Hoàn thành' },
  CANCELLED:   { bg: '#fee2e2', color: '#991b1b', label: 'Đã hủy' },
}

export function JobListPage() {
  // ── Search & filters ──────────────────────────────────────────────
  const [q, setQ]                       = useState('')
  const [skillInput, setSkillInput]     = useState('')
  const [skills, setSkills]             = useState<string[]>([])
  const [budgetType, setBudgetType]     = useState<BudgetTypeOption>('')
  const [minBudget, setMinBudget]       = useState('')
  const [maxBudget, setMaxBudget]       = useState('')
  const [deadlineBefore, setDeadlineBefore] = useState('')
  const [sort, setSort]                 = useState<SortOption>('NEWEST')
  const [filtersOpen, setFiltersOpen]   = useState(false)

  // ── Pagination ────────────────────────────────────────────────────
  const [page, setPage]             = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)

  // ── Data state ────────────────────────────────────────────────────
  const [items, setItems]   = useState<JobListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError]   = useState<string | null>(null)

  const abortRef = useRef<AbortController | null>(null)

  // ── Derived: is any filter active? ───────────────────────────────
  const hasActiveFilters =
    skills.length > 0 || budgetType !== '' || minBudget !== '' || maxBudget !== '' || deadlineBefore !== ''

  async function load(p = 0) {
    abortRef.current?.abort()
    abortRef.current = new AbortController()

    setLoading(true)
    setError(null)
    try {
      const params: Record<string, any> = {
        page: p,
        size: PAGE_SIZE,
        sort,
      }
      if (q.trim())        params.q            = q.trim()
      if (skills.length)   params.skills       = skills
      if (budgetType)      params.budgetType   = budgetType
      if (minBudget)       params.minBudget    = Number(minBudget)
      if (maxBudget)       params.maxBudget    = Number(maxBudget)
      if (deadlineBefore)  params.deadlineBefore = new Date(deadlineBefore).toISOString()

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

  useEffect(() => { load(0) }, [])  // eslint-disable-line react-hooks/exhaustive-deps

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    load(0)
  }

  function handlePageChange(p: number) {
    setPage(p)
    load(p)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function addSkill() {
    const s = skillInput.trim()
    if (s && !skills.includes(s)) setSkills(prev => [...prev, s])
    setSkillInput('')
  }

  function removeSkill(s: string) {
    setSkills(prev => prev.filter(x => x !== s))
  }

  function clearFilters() {
    setSkills([])
    setBudgetType('')
    setMinBudget('')
    setMaxBudget('')
    setDeadlineBefore('')
    setSort('NEWEST')
  }

  // ─────────────────────────────────────────────────────────────────
  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 16px' }}>

      {/* ── Page header ── */}
      <div style={{ padding: '32px 0 24px', borderBottom: '1px solid var(--border, #e5e7eb)', marginBottom: 24 }}>
        <h1 className="page-title" style={{ margin: 0 }}>Tìm việc làm</h1>
        <p className="page-subtitle" style={{ margin: '6px 0 0' }}>
          Danh sách công việc công khai — chỉ hiển thị trạng thái{' '}
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            padding: '1px 8px', borderRadius: 99, fontSize: 12, fontWeight: 600,
            background: STATUS_STYLE.OPEN.bg, color: STATUS_STYLE.OPEN.color,
          }}>OPEN</span>
        </p>
      </div>

      {/* ── Search bar ── */}
      <form onSubmit={handleSearch} style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <input
          className="input"
          value={q}
          onChange={e => setQ(e.target.value)}
          placeholder="Tìm theo tiêu đề, mô tả… (ví dụ: React, Java, Designer)"
          style={{ flex: 1, minWidth: 0 }}
        />
        <button className="btn btn-primary" type="submit" disabled={loading} style={{ whiteSpace: 'nowrap' }}>
          {loading ? 'Đang tìm…' : 'Tìm kiếm'}
        </button>
        <button
          className="btn"
          type="button"
          onClick={() => setFiltersOpen(v => !v)}
          style={{
            display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap',
            position: 'relative',
          }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
          </svg>
          Bộ lọc
          {hasActiveFilters && (
            <span style={{
              position: 'absolute', top: 6, right: 6,
              width: 7, height: 7, borderRadius: '50%',
              background: '#ef4444',
            }} />
          )}
        </button>
      </form>

      {/* ── Expandable filter panel ── */}
      {filtersOpen && (
        <div className="card card-pad" style={{
          marginBottom: 16, display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 16,
          animation: 'slideDown 0.18s ease',
        }}>
          {/* Skills */}
          <div className="stack" style={{ gap: 8 }}>
            <label style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', opacity: 0.6 }}>
              Kỹ năng
            </label>
            <div style={{ display: 'flex', gap: 6 }}>
              <input
                className="input"
                value={skillInput}
                onChange={e => setSkillInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSkill() } }}
                placeholder="Nhập & Enter…"
                style={{ flex: 1, minWidth: 0, fontSize: 13 }}
              />
              <button className="btn" type="button" onClick={addSkill} style={{ padding: '0 10px', fontSize: 18, lineHeight: 1 }}>+</button>
            </div>
            {skills.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {skills.map(s => (
                  <span key={s} style={{
                    display: 'inline-flex', alignItems: 'center', gap: 4,
                    padding: '3px 8px', borderRadius: 99, fontSize: 12, fontWeight: 500,
                    background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe',
                  }}>
                    {s}
                    <button
                      type="button" onClick={() => removeSkill(s)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, lineHeight: 1, color: '#93c5fd', fontWeight: 700 }}
                    >×</button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Budget type */}
          <div className="stack" style={{ gap: 8 }}>
            <label style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', opacity: 0.6 }}>
              Loại ngân sách
            </label>
            <div style={{ display: 'flex', gap: 6 }}>
              {(['', 'FIXED', 'HOURLY'] as BudgetTypeOption[]).map(v => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setBudgetType(v)}
                  style={{
                    flex: 1, padding: '7px 4px', borderRadius: 8, fontSize: 12, fontWeight: 600,
                    border: '1.5px solid',
                    borderColor: budgetType === v ? '#3b82f6' : 'var(--border, #e5e7eb)',
                    background: budgetType === v ? '#eff6ff' : 'transparent',
                    color: budgetType === v ? '#1d4ed8' : 'inherit',
                    cursor: 'pointer', transition: 'all 0.15s',
                  }}
                >
                  {v === '' ? 'Tất cả' : v}
                </button>
              ))}
            </div>
          </div>

          {/* Budget range */}
          <div className="stack" style={{ gap: 8 }}>
            <label style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', opacity: 0.6 }}>
              Khoảng ngân sách ($)
            </label>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <input
                className="input" type="number" min={0}
                value={minBudget} onChange={e => setMinBudget(e.target.value)}
                placeholder="Tối thiểu"
                style={{ flex: 1, minWidth: 0, fontSize: 13 }}
              />
              <span style={{ opacity: 0.4, fontSize: 13 }}>–</span>
              <input
                className="input" type="number" min={0}
                value={maxBudget} onChange={e => setMaxBudget(e.target.value)}
                placeholder="Tối đa"
                style={{ flex: 1, minWidth: 0, fontSize: 13 }}
              />
            </div>
          </div>

          {/* Deadline before */}
          <div className="stack" style={{ gap: 8 }}>
            <label style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', opacity: 0.6 }}>
              Deadline trước ngày
            </label>
            <input
              className="input" type="date"
              value={deadlineBefore} onChange={e => setDeadlineBefore(e.target.value)}
              style={{ fontSize: 13 }}
            />
          </div>

          {/* Sort */}
          <div className="stack" style={{ gap: 8 }}>
            <label style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', opacity: 0.6 }}>
              Sắp xếp
            </label>
            <div className="stack" style={{ gap: 4 }}>
              {(Object.entries(SORT_LABELS) as [SortOption, string][]).map(([val, label]) => (
                <button
                  key={val} type="button"
                  onClick={() => setSort(val)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px',
                    borderRadius: 8, fontSize: 13, fontWeight: sort === val ? 600 : 400,
                    border: '1.5px solid',
                    borderColor: sort === val ? '#3b82f6' : 'var(--border, #e5e7eb)',
                    background: sort === val ? '#eff6ff' : 'transparent',
                    color: sort === val ? '#1d4ed8' : 'inherit',
                    cursor: 'pointer', transition: 'all 0.15s', textAlign: 'left',
                  }}
                >
                  {sort === val && <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#3b82f6', flexShrink: 0 }} />}
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', gap: 8 }}>
            <button
              className="btn btn-primary" type="button"
              onClick={() => { load(0); setFiltersOpen(false) }}
              disabled={loading}
            >
              Áp dụng bộ lọc
            </button>
            {hasActiveFilters && (
              <button
                className="btn" type="button"
                onClick={() => { clearFilters(); setTimeout(() => load(0), 0) }}
                style={{ color: '#ef4444', borderColor: '#fca5a5' }}
              >
                Xóa bộ lọc
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── Active filter chips ── */}
      {hasActiveFilters && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12, alignItems: 'center' }}>
          <span style={{ fontSize: 12, opacity: 0.5, marginRight: 2 }}>Đang lọc:</span>
          {budgetType && (
            <Chip label={`Loại: ${budgetType}`} onRemove={() => setBudgetType('')} />
          )}
          {minBudget && (
            <Chip label={`≥ $${minBudget}`} onRemove={() => setMinBudget('')} />
          )}
          {maxBudget && (
            <Chip label={`≤ $${maxBudget}`} onRemove={() => setMaxBudget('')} />
          )}
          {deadlineBefore && (
            <Chip label={`Trước ${new Date(deadlineBefore).toLocaleDateString('vi-VN')}`} onRemove={() => setDeadlineBefore('')} />
          )}
          {skills.map(s => (
            <Chip key={s} label={s} onRemove={() => removeSkill(s)} color="blue" />
          ))}
        </div>
      )}

      {/* ── Error ── */}
      {error && (
        <div className="alert alert-error" style={{ marginBottom: 16 }}>
          {error}
        </div>
      )}

      {/* ── Result summary ── */}
      {!loading && !error && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <span className="hint">
            {totalElements > 0
              ? `${totalElements.toLocaleString()} công việc được tìm thấy — trang ${page + 1} / ${totalPages}`
              : 'Không tìm thấy công việc nào'}
          </span>
        </div>
      )}

      {/* ── Loading skeleton ── */}
      {loading && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: 14,
        }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="card card-pad" style={{ gap: 12, display: 'flex', flexDirection: 'column' }}>
              <div style={{ height: 16, borderRadius: 6, background: 'var(--border, #e5e7eb)', width: '70%', animation: 'pulse 1.5s ease infinite' }} />
              <div style={{ height: 12, borderRadius: 6, background: 'var(--border, #e5e7eb)', width: '45%', animation: 'pulse 1.5s ease infinite' }} />
              <div style={{ height: 12, borderRadius: 6, background: 'var(--border, #e5e7eb)', width: '55%', animation: 'pulse 1.5s ease infinite' }} />
            </div>
          ))}
        </div>
      )}

      {/* ── Empty state ── */}
      {!loading && items.length === 0 && !error && (
        <div style={{
          textAlign: 'center', padding: '64px 24px',
          border: '2px dashed var(--border, #e5e7eb)',
          borderRadius: 16, color: 'var(--text-muted, #9ca3af)',
        }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
          <div style={{ fontWeight: 600, marginBottom: 6 }}>Không tìm thấy công việc</div>
          <div style={{ fontSize: 14 }}>Thử thay đổi từ khóa hoặc xóa bớt bộ lọc</div>
          {hasActiveFilters && (
            <button
              className="btn" type="button"
              onClick={() => { clearFilters(); load(0) }}
              style={{ marginTop: 16 }}
            >
              Xóa tất cả bộ lọc
            </button>
          )}
        </div>
      )}

      {/* ── Job grid ── */}
      {!loading && items.length > 0 && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: 14,
        }}>
          {items.map(j => {
            const statusStyle = STATUS_STYLE[j.status] ?? STATUS_STYLE.OPEN
            const deadline = formatDeadline((j as any).deadline)
            const deadlineUrgent = deadline.startsWith('Còn') && parseInt(deadline.replace('Còn ', '')) <= 3

            return (
              <div
                key={j.id}
                className="card card-pad"
                style={{
                  display: 'flex', flexDirection: 'column', gap: 0,
                  transition: 'box-shadow 0.15s, transform 0.15s',
                  cursor: 'default',
                }}
                onMouseEnter={e => {
                  const el = e.currentTarget
                  el.style.transform = 'translateY(-2px)'
                  el.style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)'
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget
                  el.style.transform = ''
                  el.style.boxShadow = ''
                }}
              >
                {/* Card header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                  <span style={{
                    display: 'inline-block', padding: '2px 8px', borderRadius: 99, fontSize: 11, fontWeight: 700,
                    background: statusStyle.bg, color: statusStyle.color,
                    letterSpacing: '0.04em', textTransform: 'uppercase',
                  }}>
                    {statusStyle.label}
                  </span>
                  <span className="hint" style={{ fontSize: 11 }}>
                    {formatRelative((j as any).createdAt)}
                  </span>
                </div>

                {/* Title */}
                <div style={{ fontWeight: 700, fontSize: 15, lineHeight: 1.35, marginBottom: 8, letterSpacing: '-0.2px' }}>
                  {j.title}
                </div>

                {/* Skills */}
                {j.requiredSkills?.length ? (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 12 }}>
                    {j.requiredSkills.slice(0, 4).map(sk => (
                      <span key={sk} style={{
                        padding: '2px 8px', borderRadius: 99, fontSize: 11, fontWeight: 500,
                        background: 'var(--bg-subtle, #f9fafb)', border: '1px solid var(--border, #e5e7eb)',
                      }}>
                        {sk}
                      </span>
                    ))}
                    {j.requiredSkills.length > 4 && (
                      <span style={{ padding: '2px 6px', fontSize: 11, opacity: 0.5 }}>
                        +{j.requiredSkills.length - 4}
                      </span>
                    )}
                  </div>
                ) : (
                  <div style={{ marginBottom: 12 }} />
                )}

                {/* Stats row */}
                <div style={{
                  display: 'grid', gridTemplateColumns: '1fr 1fr',
                  gap: 8, marginBottom: 14,
                  padding: '10px 12px', borderRadius: 10,
                  background: 'var(--bg-subtle, #f9fafb)',
                  border: '1px solid var(--border, #e5e7eb)',
                }}>
                  <StatCell
                    icon="💰"
                    label={j.budgetType === 'FIXED' ? 'Cố định' : 'Theo giờ'}
                    value={formatBudget(j)}
                  />
                  <StatCell
                    icon="📅"
                    label="Deadline"
                    value={deadline}
                    valueStyle={deadlineUrgent ? { color: '#dc2626', fontWeight: 700 } : undefined}
                  />
                  <StatCell
                    icon="📝"
                    label="Đề xuất"
                    value={`${(j as any).proposalCount ?? 0} người`}
                  />
                  <StatCell
                    icon="💼"
                    label="Hình thức"
                    value={j.budgetType}
                  />
                </div>

                {/* Action */}
                <Link
                  className="btn btn-primary"
                  to={`/jobs/${j.id}`}
                  style={{ textAlign: 'center', marginTop: 'auto', textDecoration: 'none' }}
                >
                  Xem chi tiết →
                </Link>
              </div>
            )
          })}
        </div>
      )}

      {/* ── Pagination ── */}
      {!loading && totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 32, flexWrap: 'wrap' }}>
          <button
            className="btn" disabled={page === 0}
            onClick={() => handlePageChange(page - 1)}
          >← Trước</button>

          {Array.from({ length: totalPages }, (_, i) => {
            const show = i === 0 || i === totalPages - 1 || Math.abs(i - page) <= 1
            if (!show) {
              if (i === 1 && page > 3)        return <span key={i} style={{ padding: '0 4px', opacity: 0.4, alignSelf: 'center' }}>…</span>
              if (i === totalPages - 2 && page < totalPages - 4) return <span key={i} style={{ padding: '0 4px', opacity: 0.4, alignSelf: 'center' }}>…</span>
              return null
            }
            return (
              <button
                key={i}
                className="btn"
                onClick={() => handlePageChange(i)}
                style={{
                  minWidth: 38,
                  fontWeight: i === page ? 700 : 400,
                  background: i === page ? 'var(--color-primary, #3b82f6)' : undefined,
                  color: i === page ? '#fff' : undefined,
                  borderColor: i === page ? 'var(--color-primary, #3b82f6)' : undefined,
                }}
              >
                {i + 1}
              </button>
            )
          })}

          <button
            className="btn" disabled={page >= totalPages - 1}
            onClick={() => handlePageChange(page + 1)}
          >Tiếp →</button>
        </div>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1 }
          50% { opacity: 0.4 }
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-8px) }
          to   { opacity: 1; transform: translateY(0) }
        }
      `}</style>
    </div>
  )
}

// ── Helper components ────────────────────────────────────────────────

function StatCell({
  icon, label, value, valueStyle,
}: {
  icon: string
  label: string
  value: string
  valueStyle?: React.CSSProperties
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <span style={{ fontSize: 10, opacity: 0.45, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
        {icon} {label}
      </span>
      <span style={{ fontSize: 13, fontWeight: 600, ...valueStyle }}>{value}</span>
    </div>
  )
}

function Chip({ label, onRemove, color }: { label: string; onRemove: () => void; color?: 'blue' }) {
  const isBlue = color === 'blue'
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '3px 8px', borderRadius: 99, fontSize: 12, fontWeight: 500,
      background: isBlue ? '#eff6ff' : 'var(--bg-subtle, #f3f4f6)',
      border: `1px solid ${isBlue ? '#bfdbfe' : 'var(--border, #e5e7eb)'}`,
      color: isBlue ? '#1d4ed8' : 'inherit',
    }}>
      {label}
      <button
        type="button" onClick={onRemove}
        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, lineHeight: 1, opacity: 0.5, fontSize: 14 }}
      >×</button>
    </span>
  )
}