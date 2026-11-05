import { useState } from 'react'
import { AppShell } from './components/layout/AppShell.jsx'
import { Toast } from './components/common/Toast.jsx'

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
  // Authentication state
  const [currentUser, setCurrentUser] = useState(DEMO_USERS[0]) // default logged in to Super Admin preview
  const [isLoggedIn, setIsLoggedIn] = useState(true)

  // Navigation state
  const [activeView, setActiveView] = useState('dashboard')

  // Domain Data States
  const [activePeriod, setActivePeriod] = useState(DEMO_PERIODS[0])
  const [periods, setPeriods] = useState(DEMO_PERIODS)
  const [residents, setResidents] = useState(DEMO_RESIDENTS)
  const [candidates, setCandidates] = useState(DEMO_CANDIDATES)
  const [assessments] = useState(DEMO_ASSESSMENTS)
  const [calculationRun, setCalculationRun] = useState(() => {
    try {
      return createDemoCalculationRun()
    } catch {
      return null
    }
  })
  const [decisions, setDecisions] = useState([])
  const [auditLogs, setAuditLogs] = useState(DEMO_AUDIT_LOGS)
  const [backupJobs, setBackupJobs] = useState(DEMO_BACKUP_JOBS)

  // Toast feedback state
  const [toast, setToast] = useState(null)

  function showToast(message, type = 'info') {
    setToast({ message, type })
    setTimeout(() => {
      setToast((prev) => (prev?.message === message ? null : prev))
    }, 4000)
  }

  function handleRecordAudit({ action, targetType, targetId, requestSummary }) {
    const newLog = {
      id: `aud-${Date.now()}`,
      actorId: currentUser.id,
      actorName: currentUser.displayName.split(' ')[0],
      role: currentUser.role,
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

  function handleRunCalculated(newRun) {
    setCalculationRun(newRun)
    handleRecordAudit({
      action: 'CALCULATION_RUN_CREATED',
      targetType: 'CalculationRun',
      targetId: newRun.id,
      requestSummary: `Kalkulasi SAW baru dieksekusi (${newRun.counts.eligible} alternatif).`,
    })
    showToast(`Kalkulasi SAW berhasil! ${newRun.results.length} alternatif masuk ranking.`, 'success')
    setActiveView('saw-ranking')
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

  if (!isLoggedIn) {
    return (
      <LoginView
        onLoginSuccess={(user) => {
          setCurrentUser(user)
          setIsLoggedIn(true)
          showToast(`Selamat datang kembali, ${user.displayName}!`, 'success')
        }}
      />
    )
  }

  return (
    <AppShell
      activeView={activeView}
      onViewChange={setActiveView}
      activePeriod={activePeriod}
      currentUser={currentUser}
      onLogoutClick={() => {
        setIsLoggedIn(false)
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
          onNavigate={setActiveView}
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

      {activeView === 'criteria' && <CriteriaView />}

      {activeView === 'subcriteria' && <SubcriteriaView />}

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
        />
      )}

      {activeView === 'saw-matrix' && (
        <SawMatrixView
          calculationRun={calculationRun}
          residents={residents}
          candidates={candidates}
        />
      )}

      {activeView === 'saw-preference' && (
        <SawPreferenceView
          calculationRun={calculationRun}
          residents={residents}
          candidates={candidates}
        />
      )}

      {activeView === 'saw-ranking' && (
        <SawRankingView
          calculationRun={calculationRun}
          activePeriod={activePeriod}
          residents={residents}
          candidates={candidates}
          onNavigate={setActiveView}
        />
      )}

      {activeView === 'recommendations' && (
        <RecommendationsView
          calculationRun={calculationRun}
          activePeriod={activePeriod}
          residents={residents}
          candidates={candidates}
          onNavigate={setActiveView}
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
          onNavigate={setActiveView}
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
