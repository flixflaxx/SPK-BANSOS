import { useState, useEffect } from 'react'
import { AppShell } from './components/layout/AppShell.jsx'
import { Toast } from './components/common/Toast.jsx'
import { DEFAULT_CRITERIA, DEFAULT_SUBCRITERIA_RULES, buildRunFromCriteria } from './features/criteria/criteriaConstants.js'
import { ALL_NAV_ITEMS } from './app/navigation.js'

// Features
import { LoginView } from './features/auth/LoginView.jsx'
import { DashboardView } from './features/dashboard/DashboardView.jsx'
import { ResidentsView } from './features/residents/ResidentsView.jsx'
import { DesilView } from './features/residents/DesilView.jsx'
import { CandidatesView } from './features/candidates/CandidatesView.jsx'
import { VerificationView } from './features/verification/VerificationView.jsx'
import { CriteriaView } from './features/criteria/CriteriaView.jsx'
import { SubcriteriaView } from './features/criteria/SubcriteriaView.jsx'
import { PeriodsView } from './features/periods/PeriodsView.jsx'
import { AssessmentsView } from './features/assessments/AssessmentsView.jsx'
import { SawCalculationView } from './features/saw/SawCalculationView.jsx'
import { SawMatrixView } from './features/saw/SawMatrixView.jsx'
import { SawPreferenceView } from './features/saw/SawPreferenceView.jsx'
import { SawRankingView } from './features/saw/SawRankingView.jsx'
import { RecommendationsView } from './features/decisions/RecommendationsView.jsx'
import { DecisionsView } from './features/decisions/DecisionsView.jsx'
import { QuotaView } from './features/decisions/QuotaView.jsx'
import { HistoryView } from './features/history/HistoryView.jsx'
import { ReportsView } from './features/reports/ReportsView.jsx'
import { ExportsView } from './features/reports/ExportsView.jsx'
import { UsersView } from './features/users/UsersView.jsx'
import { AuditView } from './features/audit/AuditView.jsx'
import { SearchView } from './features/search/SearchView.jsx'
import { BackupView } from './features/backup/BackupView.jsx'

// Seed & Mock Data
import {
  DEMO_USERS,
  DEMO_PERIODS,
  DEMO_RESIDENTS,
  DEMO_CANDIDATES,
  DEMO_ASSESSMENTS,
  DEMO_AUDIT_LOGS,
  DEMO_BACKUP_JOBS,
  createDemoCalculationRun,
} from './services/mockData.js'

export function App() {
  // Authentication state - Default: wajib login terlebih dahulu saat pertama kali buka
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = sessionStorage.getItem('spk_auth_user_v1')
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  })
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    try {
      return sessionStorage.getItem('spk_is_logged_in_v1') === 'true'
    } catch {
      return false
    }
  })

  // Navigation state - disinkronkan dengan URL Hash untuk mendukung tombol Back/Forward browser
  const [activeView, setActiveView] = useState(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.replace(/^#\/?/, '').trim()
      if (hash && ALL_NAV_ITEMS.some((item) => item.id === hash)) {
        return hash
      }
    }
    return 'dashboard'
  })

  // Fungsi navigasi yang mencatat riwayat history ke browser
  function handleNavigate(viewId) {
    if (!viewId) return
    setActiveView(viewId)
    if (typeof window !== 'undefined') {
      const currentHash = window.location.hash.replace(/^#\/?/, '').trim()
      if (currentHash !== viewId) {
        window.history.pushState({ view: viewId }, '', `#/${viewId}`)
      }
    }
  }

  // Listener untuk tombol Back & Forward browser (Google Chrome, Firefox, dsb.)
  useEffect(() => {
    if (typeof window === 'undefined') return

    function handleLocationChange() {
      const hash = window.location.hash.replace(/^#\/?/, '').trim()
      if (hash && ALL_NAV_ITEMS.some((item) => item.id === hash)) {
        setActiveView(hash)
      } else if (!hash) {
        setActiveView('dashboard')
      }
    }

    window.addEventListener('popstate', handleLocationChange)
    window.addEventListener('hashchange', handleLocationChange)

    // Inisialisasi hash di URL saat pertama kali load jika sudah login
    if (isLoggedIn) {
      const currentHash = window.location.hash.replace(/^#\/?/, '').trim()
      if (!currentHash) {
        window.history.replaceState({ view: activeView }, '', `#/${activeView}`)
      } else if (ALL_NAV_ITEMS.some((item) => item.id === currentHash)) {
        setActiveView(currentHash)
      }
    }

    return () => {
      window.removeEventListener('popstate', handleLocationChange)
      window.removeEventListener('hashchange', handleLocationChange)
    }
  }, [isLoggedIn, activeView])

  // Domain Data States
  const [activePeriod, setActivePeriod] = useState(DEMO_PERIODS[0])
  const [periods, setPeriods] = useState(DEMO_PERIODS)
  const [residents, setResidents] = useState(DEMO_RESIDENTS)
  const [candidates, setCandidates] = useState(DEMO_CANDIDATES)
  const [assessments, setAssessments] = useState(() => {
    try {
      const saved = localStorage.getItem('spk_assessments_list_v1')
      return saved ? JSON.parse(saved) : DEMO_ASSESSMENTS
    } catch {
      return DEMO_ASSESSMENTS
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem('spk_assessments_list_v1', JSON.stringify(assessments))
    } catch {
      // Ignore in private browsing
    }
  }, [assessments])

  // Criteria & Subcriteria States (Single Source of Truth)
  const [criteria, setCriteria] = useState(() => {
    try {
      const saved = localStorage.getItem('spk_criteria_list_v1')
      return saved ? JSON.parse(saved) : DEFAULT_CRITERIA
    } catch {
      return DEFAULT_CRITERIA
    }
  })

  const [calculationRun, setCalculationRun] = useState(() => {
    try {
      const savedCriteria = (() => {
        try {
          const saved = localStorage.getItem('spk_criteria_list_v1')
          return saved ? JSON.parse(saved) : DEFAULT_CRITERIA
        } catch {
          return DEFAULT_CRITERIA
        }
      })()
      const run = buildRunFromCriteria({
        criteria: savedCriteria,
        candidates: DEMO_CANDIDATES,
        residents: DEMO_RESIDENTS,
        assessments: DEMO_ASSESSMENTS,
        period: DEMO_PERIODS[0],
        currentUser: null,
      })
      return run || createDemoCalculationRun()
    } catch {
      return null
    }
  })
  const [decisions, setDecisions] = useState([])
  const [auditLogs, setAuditLogs] = useState(DEMO_AUDIT_LOGS)
  const [backupJobs, setBackupJobs] = useState(DEMO_BACKUP_JOBS)

  const [subcriteriaRules, setSubcriteriaRules] = useState(() => {
    try {
      const saved = localStorage.getItem('spk_subcriteria_rules_v1')
      return saved ? JSON.parse(saved) : DEFAULT_SUBCRITERIA_RULES
    } catch {
      return DEFAULT_SUBCRITERIA_RULES
    }
  })

  // Persist Criteria & Subcriteria
  useEffect(() => {
    try {
      localStorage.setItem('spk_criteria_list_v1', JSON.stringify(criteria))
    } catch {
      // Ignore in private browsing
    }
  }, [criteria])

  useEffect(() => {
    try {
      localStorage.setItem('spk_subcriteria_rules_v1', JSON.stringify(subcriteriaRules))
    } catch {
      // Ignore in private browsing
    }
  }, [subcriteriaRules])

  // Otomatis sinkronisasi perhitungan SAW saat kriteria atau bobot di halaman kriteria berubah
  useEffect(() => {
    try {
      const updatedRun = buildRunFromCriteria({
        criteria,
        candidates,
        residents,
        assessments,
        period: activePeriod,
        currentUser,
      })
      if (updatedRun) {
        setCalculationRun(updatedRun)
      }
    } catch (e) {
      console.warn('Otomatis kalkulasi ulang SAW saat perubahan kriteria:', e)
    }
  }, [criteria, candidates, residents, assessments, activePeriod, currentUser])

  // Toast feedback state
  const [toast, setToast] = useState(null)

  function showToast(message, type = 'info') {
    setToast({ message, type })
    setTimeout(() => {
      setToast((prev) => (prev?.message === message ? null : prev))
    }, 4000)
  }

  function handleRecordAudit({ action, targetType, targetId, requestSummary }) {
    const actor = currentUser || DEMO_USERS[0]
    const newLog = {
      id: `aud-${Date.now()}`,
      actorId: actor.id,
      actorName: actor.displayName.split(' ')[0],
      role: actor.role,
      action,
      targetType,
      targetId,
      outcome: 'SUCCESS',
      occurredAt: new Date().toISOString(),
      requestSummary,
    }
    setAuditLogs((prev) => [newLog, ...prev])
  }

  // Feature Handlers
  function handleAddResident(newResident) {
    setResidents((prev) => [newResident, ...prev])
    handleRecordAudit({
      action: 'RESIDENT_CREATED',
      targetType: 'Resident',
      targetId: newResident.id,
      requestSummary: `Menambahkan warga baru: ${newResident.name}`,
    })
    showToast(`Warga ${newResident.name} berhasil ditambahkan.`, 'success')
  }

  function handleUpdateResident(updatedResident) {
    setResidents((prev) =>
      prev.map((r) => (r.id === updatedResident.id ? { ...r, ...updatedResident } : r))
    )
    handleRecordAudit({
      action: 'RESIDENT_UPDATED',
      targetType: 'Resident',
      targetId: updatedResident.id,
      requestSummary: `Profil warga ${updatedResident.name} berhasil diperbarui`,
    })
    showToast(`Data profil warga ${updatedResident.name} berhasil diperbarui.`, 'success')
  }

  function handleUpdateResidentDesil(updatedResident) {
    setResidents((prev) => prev.map((r) => (r.id === updatedResident.id ? updatedResident : r)))
    handleRecordAudit({
      action: 'RESIDENT_DESIL_UPDATED',
      targetType: 'Resident',
      targetId: updatedResident.id,
      requestSummary: `Memperbarui klasifikasi desil ${updatedResident.name} menjadi ${updatedResident.desilLabel}`,
    })
    showToast(`Klasifikasi ${updatedResident.name} diperbarui ke ${updatedResident.desilLabel}.`, 'success')
  }

  function handleRegisterCandidate(newCandidate) {
    setCandidates((prev) => [newCandidate, ...prev])
    const res = residents.find((r) => r.id === newCandidate.residentId)
    handleRecordAudit({
      action: 'CANDIDATE_REGISTERED',
      targetType: 'Candidate',
      targetId: newCandidate.id,
      requestSummary: `Mendaftarkan calon ${res?.name || newCandidate.id} ke periode ${activePeriod.name}`,
    })
    showToast('Calon alternatif berhasil didaftarkan.', 'success')
  }

  function handleUpdateVerification({ candidateId, status, notes, verifierId, verifiedAt }) {
    setCandidates((prev) =>
      prev.map((c) =>
        c.id === candidateId
          ? { ...c, verificationStatus: status, verificationNotes: notes, verifiedBy: verifierId, verifiedAt }
          : c
      )
    )
    handleRecordAudit({
      action: 'CANDIDATE_VERIFIED',
      targetType: 'Candidate',
      targetId: candidateId,
      requestSummary: `Memperbarui status verifikasi calon ${candidateId} menjadi ${status}`,
    })
    showToast(`Status verifikasi berhasil diperbarui (${status}).`, 'success')
  }

  function handleSaveAssessments(candidateId, newValuesMap) {
    setAssessments((prev) => {
      const filtered = prev.filter((a) => a.candidateId !== candidateId)
      const updated = [...filtered]
      Object.entries(newValuesMap).forEach(([code, val]) => {
        if (val !== '' && val !== null && val !== undefined) {
          updated.push({
            id: `ass-${candidateId}-${code}-${Date.now()}`,
            candidateId,
            criterionCode: code,
            rawValue: String(val),
            status: 'VALID',
            authorId: currentUser?.id || 'usr-operator',
            createdAt: new Date().toISOString(),
          })
        }
      })
      return updated
    })
    const cand = candidates.find((c) => c.id === candidateId)
    const res = residents.find((r) => r.id === cand?.residentId)
    handleRecordAudit({
      action: 'ASSESSMENT_UPDATED',
      targetType: 'Assessment',
      targetId: candidateId,
      requestSummary: `Menyimpan penilaian kriteria calon ${res?.name || candidateId}`,
    })
    showToast('Nilai kriteria calon berhasil disimpan dan matriks diperbarui.', 'success')
  }

  function handleRunCalculated(newRun) {
    setCalculationRun(newRun)
    handleRecordAudit({
      action: 'CALCULATION_RUN_CREATED',
      targetType: 'CalculationRun',
      targetId: newRun.id,
      requestSummary: `Kalkulasi SAW baru dieksekusi (${newRun.counts.eligible} alternatif).`,
    })
    showToast(`Kalkulasi SAW berhasil! ${newRun.results.length} alternatif masuk ranking.`, 'success')
    handleNavigate('saw-ranking')
  }

  function handleRecordDecision(newDecision) {
    setDecisions((prev) => [...prev, newDecision])
    handleRecordAudit({
      action: `DECISION_${newDecision.outcome}`,
      targetType: 'ApprovalDecision',
      targetId: newDecision.id,
      requestSummary: `Keputusan ${newDecision.outcome} untuk calon ${newDecision.candidateId}: "${newDecision.reason}"`,
    })
    showToast(`Keputusan ${newDecision.outcome} berhasil dicatat.`, 'success')
  }

  function handleUpdateQuota(payload) {
    const isObj = typeof payload === 'object' && payload !== null
    const newQuota = isObj ? payload.total : payload
    const breakdown = isObj
      ? payload.breakdown
      : {
          sembako: Math.ceil(newQuota / 2),
          pkh: Math.floor(newQuota / 4),
          pbijk: Math.max(0, newQuota - Math.ceil(newQuota / 2) - Math.floor(newQuota / 4)),
        }
    const updated = { ...activePeriod, quota: newQuota, quotaBreakdown: breakdown }
    setActivePeriod(updated)
    setPeriods((prev) => prev.map((p) => (p.id === updated.id ? updated : p)))
    handleRecordAudit({
      action: 'QUOTA_UPDATED',
      targetType: 'SelectionPeriod',
      targetId: activePeriod.id,
      requestSummary: `Pagu kuota periode diperbarui menjadi ${newQuota} calon (Sembako: ${breakdown.sembako}, PKH: ${breakdown.pkh}, PBI-JK: ${breakdown.pbijk}).`,
    })
    showToast(`Pagu kuota diperbarui: ${newQuota} calon (Sembako: ${breakdown.sembako}, PKH: ${breakdown.pkh}, PBI-JK: ${breakdown.pbijk}).`, 'success')
  }

  function handleTriggerBackup(newJob) {
    setBackupJobs((prev) => [newJob, ...prev])
    showToast('Snapshot backup berhasil dibuat dan diuji restore.', 'success')
  }

  // Criteria & Subcriteria Handlers (Synchronized)
  function handleUpdateCriteria(updatedCriteria, reason = 'CRITERIA_UPDATED') {
    setCriteria(updatedCriteria)

    // Automatically ensure all active criteria have subcriteria rules initialized
    setSubcriteriaRules((prev) => {
      const nextRules = { ...prev }
      updatedCriteria.forEach((c) => {
        if (!nextRules[c.code] || nextRules[c.code].length === 0) {
          nextRules[c.code] = [
            { category: `Kategori Sangat Tinggi (Level 4)`, rawScore: '4', priorityImpact: c.type === 'COST' ? 'Prioritas Rendah (Cost)' : 'Prioritas Tertinggi (Benefit)' },
            { category: `Kategori Tinggi (Level 3)`, rawScore: '3', priorityImpact: c.type === 'COST' ? 'Prioritas Sedang' : 'Prioritas Tinggi' },
            { category: `Kategori Sedang (Level 2)`, rawScore: '2', priorityImpact: c.type === 'COST' ? 'Prioritas Tinggi' : 'Prioritas Sedang' },
            { category: `Kategori Rendah (Level 1)`, rawScore: '1', priorityImpact: c.type === 'COST' ? 'Prioritas Paling Utama (Cost: nilai kecil)' : 'Prioritas Rendah' },
          ]
        }
      })
      return nextRules
    })

    handleRecordAudit({
      action: reason,
      targetType: 'Criteria',
      targetId: 'criteria-active',
      requestSummary: `Pembaruan konfigurasi kriteria penilaian SAW (${updatedCriteria.length} kriteria aktif)`,
    })
    showToast('Kriteria dan subkriteria berhasil disinkronkan.', 'success')
  }

  function handleResetCriteria() {
    setCriteria(DEFAULT_CRITERIA)
    setSubcriteriaRules(DEFAULT_SUBCRITERIA_RULES)
    handleRecordAudit({
      action: 'CRITERIA_RESET',
      targetType: 'Criteria',
      targetId: 'criteria-active',
      requestSummary: 'Reset kriteria dan subkriteria ke konfigurasi awal standar',
    })
    showToast('Kriteria dan subkriteria berhasil direset ke standar awal.', 'info')
  }

  function handleAddSubcriteriaRule(criterionCode, newRule) {
    setSubcriteriaRules((prev) => ({
      ...prev,
      [criterionCode]: [...(prev[criterionCode] || []), newRule],
    }))
    handleRecordAudit({
      action: 'SUBCRITERIA_RULE_ADDED',
      targetType: 'Subcriteria',
      targetId: criterionCode,
      requestSummary: `Menambahkan aturan subkriteria baru untuk ${criterionCode}: ${newRule.category}`,
    })
    showToast(`Aturan subkriteria baru untuk ${criterionCode} berhasil ditambahkan.`, 'success')
  }

  function handleDeleteSubcriteriaRule(criterionCode, ruleIndex) {
    setSubcriteriaRules((prev) => {
      const existing = prev[criterionCode] || []
      return {
        ...prev,
        [criterionCode]: existing.filter((_, idx) => idx !== ruleIndex),
      }
    })
    handleRecordAudit({
      action: 'SUBCRITERIA_RULE_DELETED',
      targetType: 'Subcriteria',
      targetId: criterionCode,
      requestSummary: `Menghapus aturan subkriteria pada ${criterionCode}`,
    })
    showToast(`Aturan subkriteria pada ${criterionCode} berhasil dihapus.`, 'info')
  }

  if (!isLoggedIn) {
    return (
      <LoginView
        onLoginSuccess={(user) => {
          setCurrentUser(user)
          setIsLoggedIn(true)
          handleNavigate(activeView || 'dashboard')
          try {
            sessionStorage.setItem('spk_is_logged_in_v1', 'true')
            sessionStorage.setItem('spk_auth_user_v1', JSON.stringify(user))
          } catch {
            // Ignore in private browsing
          }
          showToast(`Selamat datang kembali, ${user.displayName}!`, 'success')
        }}
      />
    )
  }

  return (
    <AppShell
      activeView={activeView}
      onViewChange={handleNavigate}
      activePeriod={activePeriod}
      currentUser={currentUser || DEMO_USERS[0]}
      onLogoutClick={() => {
        setIsLoggedIn(false)
        setCurrentUser(null)
        setActiveView('dashboard')
        if (typeof window !== 'undefined') {
          window.history.replaceState(null, '', window.location.pathname)
        }
        try {
          sessionStorage.removeItem('spk_is_logged_in_v1')
          sessionStorage.removeItem('spk_auth_user_v1')
        } catch {
          // Ignore
        }
        showToast('Anda telah keluar dari aplikasi.', 'info')
      }}
    >
      {/* 23 Features Routing Switch */}
      {activeView === 'dashboard' && (
        <DashboardView
          activePeriod={activePeriod}
          residents={residents}
          candidates={candidates}
          calculationRun={calculationRun}
          auditLogs={auditLogs}
          onNavigate={handleNavigate}
        />
      )}

      {activeView === 'residents' && (
        <ResidentsView
          residents={residents}
          onAddResident={handleAddResident}
          onUpdateResident={handleUpdateResident}
        />
      )}

      {activeView === 'desil' && (
        <DesilView
          residents={residents}
          onUpdateResidentDesil={handleUpdateResidentDesil}
        />
      )}

      {activeView === 'candidates' && (
        <CandidatesView
          candidates={candidates}
          residents={residents}
          activePeriod={activePeriod}
          onRegisterCandidate={handleRegisterCandidate}
        />
      )}

      {activeView === 'verification' && (
        <VerificationView
          candidates={candidates}
          residents={residents}
          currentUser={currentUser}
          onUpdateVerification={handleUpdateVerification}
        />
      )}

      {activeView === 'criteria' && (
        <CriteriaView
          criteria={criteria}
          subcriteriaRules={subcriteriaRules}
          onUpdateCriteria={handleUpdateCriteria}
          onResetCriteria={handleResetCriteria}
          onNavigate={handleNavigate}
        />
      )}

      {activeView === 'subcriteria' && (
        <SubcriteriaView
          criteria={criteria}
          subcriteriaRules={subcriteriaRules}
          onAddRule={handleAddSubcriteriaRule}
          onDeleteRule={handleDeleteSubcriteriaRule}
          onNavigate={handleNavigate}
        />
      )}

      {activeView === 'periods' && (
        <PeriodsView
          periods={periods}
          activePeriod={activePeriod}
          onSelectPeriod={(p) => {
            setActivePeriod(p)
            showToast(`Periode aktif beralih ke: ${p.name}`, 'info')
          }}
        />
      )}

      {activeView === 'assessments' && (
        <AssessmentsView
          candidates={candidates}
          residents={residents}
          assessments={assessments}
          criteria={criteria}
          subcriteriaRules={subcriteriaRules}
          onSaveAssessments={handleSaveAssessments}
        />
      )}

      {activeView === 'saw-calc' && (
        <SawCalculationView
          activePeriod={activePeriod}
          candidates={candidates}
          residents={residents}
          assessments={assessments}
          calculationRun={calculationRun}
          currentUser={currentUser}
          onRunCalculated={handleRunCalculated}
          criteria={criteria}
        />
      )}

      {activeView === 'saw-matrix' && (
        <SawMatrixView
          calculationRun={calculationRun}
          residents={residents}
          candidates={candidates}
          criteria={criteria}
        />
      )}

      {activeView === 'saw-preference' && (
        <SawPreferenceView
          calculationRun={calculationRun}
          residents={residents}
          candidates={candidates}
          criteria={criteria}
        />
      )}

      {activeView === 'saw-ranking' && (
        <SawRankingView
          calculationRun={calculationRun}
          activePeriod={activePeriod}
          residents={residents}
          candidates={candidates}
          onNavigate={handleNavigate}
          criteria={criteria}
        />
      )}

      {activeView === 'recommendations' && (
        <RecommendationsView
          calculationRun={calculationRun}
          activePeriod={activePeriod}
          residents={residents}
          candidates={candidates}
          onNavigate={handleNavigate}
        />
      )}

      {activeView === 'decisions' && (
        <DecisionsView
          calculationRun={calculationRun}
          activePeriod={activePeriod}
          residents={residents}
          candidates={candidates}
          decisions={decisions}
          currentUser={currentUser}
          onRecordDecision={handleRecordDecision}
        />
      )}

      {activeView === 'quota' && (
        <QuotaView
          key={activePeriod?.id}
          activePeriod={activePeriod}
          calculationRun={calculationRun}
          decisions={decisions}
          onUpdateQuota={handleUpdateQuota}
        />
      )}

      {activeView === 'history' && (
        <HistoryView
          calculationRun={calculationRun}
          activePeriod={activePeriod}
          periods={periods}
        />
      )}

      {activeView === 'reports' && (
        <ReportsView
          calculationRun={calculationRun}
          activePeriod={activePeriod}
          residents={residents}
          candidates={candidates}
          decisions={decisions}
        />
      )}

      {activeView === 'exports' && (
        <ExportsView
          calculationRun={calculationRun}
          activePeriod={activePeriod}
          residents={residents}
          candidates={candidates}
          onRecordAudit={handleRecordAudit}
        />
      )}

      {activeView === 'users' && <UsersView users={DEMO_USERS} />}

      {activeView === 'audit' && <AuditView auditLogs={auditLogs} />}

      {activeView === 'search' && (
        <SearchView
          residents={residents}
          candidates={candidates}
          auditLogs={auditLogs}
          onNavigate={handleNavigate}
        />
      )}

      {activeView === 'backup' && (
        <BackupView
          backupJobs={backupJobs}
          onTriggerBackup={handleTriggerBackup}
          onRecordAudit={handleRecordAudit}
        />
      )}

      <Toast toast={toast} onDismiss={() => setToast(null)} />
    </AppShell>
  )
}
export default App
