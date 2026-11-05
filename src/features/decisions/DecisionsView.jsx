import { useState, useEffect, useRef } from 'react'
import { AlertTriangle, UserCheck, CheckCircle2, FileSignature, Check, RotateCcw } from 'lucide-react'
import { Modal } from '../../components/common/Modal.jsx'
import { PageHeader } from '../../components/common/PageHeader.jsx'
import { Panel } from '../../components/common/Panel.jsx'
import { StatusBadge } from '../../components/common/StatusBadge.jsx'
import {
  DECISION_PERMISSION,
  latestDecision,
  recordDecision,
  countApproved,
} from '@shared/domain/decisions/approval.js'
import { deriveRecommendations } from '@shared/domain/decisions/recommendations.js'

export function DecisionsView({
  calculationRun,
  activePeriod,
  residents,
  candidates,
  decisions,
  currentUser,
  onRecordDecision,
}) {
  const [selectedCandidateId, setSelectedCandidateId] = useState(null)
  const [outcome, setOutcome] = useState('APPROVED')
  const [reason, setReason] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const containerRef = useRef(null)

  const hasPermission = currentUser?.permissions?.includes(DECISION_PERMISSION) || currentUser?.permissions?.includes('all')

  useEffect(() => {
    const anime = typeof window !== 'undefined' ? window.anime : null
    if (anime && containerRef.current) {
      anime({
        targets: containerRef.current.querySelectorAll('.decision-card-item'),
        opacity: [0, 1],
        translateY: [14, 0],
        delay: anime.stagger(50),
        duration: 500,
        easing: 'easeOutBack',
      })
    }
  }, [calculationRun, decisions])

  function handleOpenDecisionModal(candidateId) {
    setSelectedCandidateId(candidateId)
    const current = calculationRun ? latestDecision(decisions, calculationRun.id, candidateId) : null
    if (current && current.outcome !== 'REVOKED') {
      setOutcome('REVOKED')
      setReason('')
    } else {
      setOutcome('APPROVED')
      setReason('')
    }
    setErrorMsg('')
  }

  function handleSaveDecision(e) {
    e.preventDefault()
    if (!calculationRun) return
    setErrorMsg('')

    try {
      const timestamp = new Date().toISOString()
      const newDecision = recordDecision({
        decisions,
        run: calculationRun,
        recommendations,
        quota,
        actor: currentUser,
        context: {
          decisionId: `dec-${timestamp.replace(/[-:.]/g, '')}`,
          decidedAt: timestamp,
        },
        command: {
          candidateId: selectedCandidateId,
          outcome,
          reason,
        },
      })

      onRecordDecision(newDecision)
      setSelectedCandidateId(null)
      setReason('')
    } catch (err) {
      setErrorMsg(err.message || 'Gagal menyimpan keputusan.')
    }
  }

  if (!calculationRun) {
    return (
      <div>
        <PageHeader
          featureNum={15}
          title="Validasi dan Persetujuan Penerima"
          description="Persetujuan atau penolakan manusia dengan alasan wajib, aktor pencatat, dan jejak keputusan append-only."
        />
        <Panel>
          <div className="clay-item" style={{ padding: '32px', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '14px' }}>
            Belum ada hasil kalkulasi SAW untuk periode aktif. Jalankan kalkulasi terlebih dahulu.
          </div>
        </Panel>
      </div>
    )
  }

  const quota = activePeriod?.quota ?? 0
  const recommendations = deriveRecommendations({ run: calculationRun, quota })
  const approvedCount = countApproved(decisions, calculationRun.id)

  return (
    <div ref={containerRef}>
      <PageHeader
        featureNum={15}
        title="Persetujuan Penerima Bansos"
        description="Lembar penetapan persetujuan resmi penerima bantuan sosial."
      />

      {/* Top 3 Squircle Metric Cards with Claymorphism */}
      <div
        className="responsive-kpi-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))',
          gap: '18px',
          marginBottom: '26px',
        }}
      >
        <div
          className="clay-card"
          style={{
            padding: '22px 24px',
            borderRadius: '24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
          }}
        >
          <div>
            <div style={{ fontSize: '12px', fontWeight: '800', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
              ALTERNATIF PERINGKAT
            </div>
            <div style={{ fontSize: '30px', fontWeight: '800', fontFamily: 'var(--font-heading)', color: 'var(--color-green-950)', marginTop: '6px', lineHeight: 1.1 }}>
              {calculationRun.results.length} <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--color-text-muted)' }}>Calon</span>
            </div>
            <div style={{ fontSize: '12px', color: 'var(--color-text-subtle)', marginTop: '4px' }}>
              Siap diverifikasi penetapan
            </div>
          </div>
          <div
            className="clay-bubble"
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '16px',
              backgroundColor: '#e0f2fe',
              color: '#0284c7',
            }}
          >
            <UserCheck size={22} />
          </div>
        </div>

        <div
          className="clay-card"
          style={{
            padding: '22px 24px',
            borderRadius: '24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '12px', fontWeight: '800', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                RESMI DISETUJUI
              </span>
              <span className="pulse-indicator" />
            </div>
            <div style={{ fontSize: '30px', fontWeight: '800', fontFamily: 'var(--font-heading)', color: 'var(--color-green-700)', marginTop: '6px', lineHeight: 1.1 }}>
              {approvedCount} / {quota} <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--color-text-muted)' }}>Pagu</span>
            </div>
            <div style={{ fontSize: '12px', color: 'var(--color-text-subtle)', marginTop: '4px' }}>
              Ketetapan pejabat desa
            </div>
          </div>
          <div
            className="clay-bubble"
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '16px',
              backgroundColor: '#edf8f3',
              color: 'var(--color-green-700)',
            }}
          >
            <CheckCircle2 size={22} />
          </div>
        </div>

        <div
          className="clay-card"
          style={{
            padding: '22px 24px',
            borderRadius: '24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
          }}
        >
          <div>
            <div style={{ fontSize: '12px', fontWeight: '800', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
              OTORISASI AKTIF
            </div>
            <div style={{ fontSize: '20px', fontWeight: '800', color: hasPermission ? 'var(--color-green-700)' : 'var(--color-warning)', marginTop: '8px', lineHeight: 1.1 }}>
              {hasPermission ? 'Akses Penuh' : 'Hanya Lihat'}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--color-text-subtle)', marginTop: '4px' }}>
              {currentUser.displayName} ({currentUser.role})
            </div>
          </div>
          <div
            className="clay-bubble"
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '16px',
              backgroundColor: hasPermission ? '#edf8f3' : '#fef3c7',
              color: hasPermission ? 'var(--color-green-700)' : 'var(--color-warning)',
            }}
          >
            <FileSignature size={22} />
          </div>
        </div>
      </div>

      {!hasPermission && (
        <div
          className="clay-badge"
          style={{
            backgroundColor: '#fef8ee',
            color: '#b45309',
            padding: '14px 22px',
            borderRadius: '20px',
            marginBottom: '22px',
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            width: '100%',
          }}
        >
          <AlertTriangle size={20} style={{ flexShrink: 0 }} />
          <div>
            <strong>Akses Terbatas:</strong> Peran saat ini ({currentUser.displayName}) hanya memiliki izin baca. Gunakan peran <strong>Penyetuju / Kepala Desa</strong> untuk menetapkan keputusan.
          </div>
        </div>
      )}

      <Panel title="Daftar Alternatif & Status Penetapan Resmi">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {calculationRun.results.map((row) => {
            const cand = candidates.find((c) => c.id === row.candidateId)
            const res = residents.find((r) => r.id === cand?.residentId)
            const rec = recommendations.items.find((i) => i.candidateId === row.candidateId)
            const dec = latestDecision(decisions, calculationRun.id, row.candidateId)

            return (
              <div
                key={row.candidateId}
                className="decision-card-item clay-item"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '18px 22px',
                  backgroundColor: '#ffffff',
                  flexWrap: 'wrap',
                  gap: '14px',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: '800', fontSize: '16px', color: 'var(--color-green-950)' }}>
                      #{row.rank} {res?.name || row.candidateId}
                    </span>
                    <StatusBadge status={rec?.status} customLabel={`Rekomendasi: ${rec?.status}`} />
                    {rec?.status === 'RECOMMENDED' && (
                      <span
                        className="clay-badge"
                        style={{
                          fontSize: '11px',
                          fontWeight: '800',
                          backgroundColor: row.rank === 1 ? '#edf8f3' : row.rank === 2 ? '#e0f2fe' : '#f3e8ff',
                          color: row.rank === 1 ? 'var(--color-green-700)' : row.rank === 2 ? '#0284c7' : '#9333ea',
                          padding: '2px 8px',
                        }}
                      >
                        {row.rank === 1 ? 'Bantuan Sembako' : row.rank === 2 ? 'Bantuan PKH' : 'Bantuan PBI-JK'}
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                    NIK: <code>{res?.nikMasked || '—'}</code> · Alamat: {res?.addressRtRw || '—'}
                  </div>
                  {dec && (
                    <div
                      className="clay-item"
                      style={{
                        marginTop: '10px',
                        fontSize: '12.5px',
                        color: 'var(--color-green-950)',
                        backgroundColor: '#edf8f3',
                        padding: '10px 14px',
                        borderRadius: '14px',
                      }}
                    >
                      <strong>Keputusan Terkini:</strong> <StatusBadge status={dec.outcome} /> — &quot;{dec.reason}&quot;
                      <div style={{ fontSize: '11px', color: 'var(--color-text-subtle)', marginTop: '4px' }}>
                        Oleh: {dec.decidedBy} ({new Date(dec.decidedAt).toLocaleString('id-ID')})
                        {dec.isOverride && <span style={{ color: 'var(--color-warning)', fontWeight: 'bold' }}> [DISKRESI / OVERRIDE]</span>}
                      </div>
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <button
                    type="button"
                    disabled={!hasPermission}
                    onClick={() => handleOpenDecisionModal(row.candidateId)}
                    className={dec && dec.outcome !== 'REVOKED' ? 'clay-btn-danger' : 'clay-btn'}
                    style={{
                      padding: '9px 18px',
                      fontSize: '13px',
                      opacity: !hasPermission ? 0.5 : 1,
                      cursor: !hasPermission ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {dec && dec.outcome !== 'REVOKED' ? (
                      <>
                        <RotateCcw size={15} />
                        <span>Cabut Keputusan</span>
                      </>
                    ) : (
                      <>
                        <Check size={15} />
                        <span>Tetapkan Keputusan</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </Panel>

      {/* Modal Penetapan Keputusan */}
      <Modal
        isOpen={Boolean(selectedCandidateId)}
        onClose={() => setSelectedCandidateId(null)}
        title="Form Penetapan Keputusan Bantuan Sosial"
      >
        {errorMsg && (
          <div
            className="clay-badge"
            style={{
              backgroundColor: '#fee2e2',
              color: '#dc2626',
              padding: '10px 14px',
              fontSize: '12.5px',
              marginBottom: '16px',
              width: '100%',
              justifyContent: 'center',
            }}
          >
            {errorMsg}
          </div>
        )}
        <form onSubmit={handleSaveDecision}>
          <div style={{ marginBottom: '18px' }}>
            <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', marginBottom: '8px', color: 'var(--color-green-950)' }}>
              Jenis Keputusan
            </label>
            <select
              value={outcome}
              onChange={(e) => setOutcome(e.target.value)}
              style={{ width: '100%' }}
            >
              <option value="APPROVED">SETUJUI (Penerima Resmi Bansos)</option>
              <option value="REJECTED">TOLAK (Gugur / Tidak Ditetapkan)</option>
              <option value="REVOKED">CABUT KEPUTUSAN AKTIF (Untuk Koreksi Ulang)</option>
            </select>
          </div>

          <div style={{ marginBottom: '22px' }}>
            <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', marginBottom: '8px', color: 'var(--color-green-950)' }}>
              Alasan Penetapan (Wajib Diisi Secara Transparan)
            </label>
            <textarea
              rows={3}
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Contoh: Memenuhi kriteria kemiskinan ekstrem dan lansia tunggal sesuai hasil musyawarah desa..."
              style={{ width: '100%' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button
              type="button"
              onClick={() => setSelectedCandidateId(null)}
              className="clay-badge"
              style={{ padding: '9px 18px', backgroundColor: '#ffffff', color: 'var(--color-text-muted)', cursor: 'pointer', fontSize: '13px' }}
            >
              Batal
            </button>
            <button
              type="submit"
              className="clay-btn"
              style={{
                padding: '9px 22px',
                fontSize: '13px',
              }}
            >
              Simpan Keputusan Resmi
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
