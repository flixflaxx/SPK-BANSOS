import {
  Activity,
  Calculator,
  Calendar,
  CheckCircle2,
  ClipboardList,
  Database,
  FileCheck,
  FileEdit,
  FileText,
  History,
  Layers,
  LayoutDashboard,
  Lightbulb,
  Printer,
  Scale,
  Search,
  ShieldCheck,
  Sliders,
  TableProperties,
  Target,
  TrendingUp,
  Trophy,
  Users,
} from 'lucide-react'

export const NAVIGATION_GROUPS = [
  {
    id: 'workspace',
    title: 'Dashboard',
    icon: LayoutDashboard,
    single: true,
    items: [
      { id: 'dashboard', label: 'Dashboard Utama', icon: LayoutDashboard, featureNum: 2 },
    ],
  },
  {
    id: 'data-verifikasi',
    title: 'Data & Verifikasi',
    icon: Users,
    items: [
      { id: 'residents', label: 'Data Warga', icon: Users, featureNum: 3 },
      { id: 'desil', label: 'Tingkat Desil DTKS', icon: Layers, featureNum: '3B' },
      { id: 'candidates', label: 'Calon Penerima', icon: ClipboardList, featureNum: 4 },
      { id: 'verification', label: 'Verifikasi Berkas', icon: CheckCircle2, featureNum: 5 },
    ],
  },
  {
    id: 'konfigurasi-saw',
    title: 'Konfigurasi SAW',
    icon: Sliders,
    items: [
      { id: 'criteria', label: 'Kriteria', icon: Sliders, featureNum: 6 },
      { id: 'subcriteria', label: 'Subkriteria & Bobot', icon: Scale, featureNum: 7 },
      { id: 'periods', label: 'Periode Seleksi', icon: Calendar, featureNum: 8 },
    ],
  },
  {
    id: 'mesin-perhitungan',
    title: 'Perhitungan SAW',
    icon: Calculator,
    items: [
      { id: 'assessments', label: 'Input Penilaian', icon: FileEdit, featureNum: 9 },
      { id: 'saw-calc', label: 'Kalkulasi SAW', icon: Calculator, featureNum: 10 },
      { id: 'saw-matrix', label: 'Matriks Normalisasi', icon: TableProperties, featureNum: 11 },
      { id: 'saw-preference', label: 'Nilai Preferensi', icon: TrendingUp, featureNum: 12 },
      { id: 'saw-ranking', label: 'Perangkingan', icon: Trophy, featureNum: 13 },
    ],
  },
  {
    id: 'keputusan-laporan',
    title: 'Keputusan & Laporan',
    icon: FileCheck,
    items: [
      { id: 'recommendations', label: 'Rekomendasi', icon: Lightbulb, featureNum: 14 },
      { id: 'decisions', label: 'Persetujuan', icon: FileCheck, featureNum: 15 },
      { id: 'quota', label: 'Kuota Bantuan', icon: Target, featureNum: 16 },
      { id: 'history', label: 'Riwayat Seleksi', icon: History, featureNum: 17 },
      { id: 'reports', label: 'Laporan Resmi', icon: FileText, featureNum: 18 },
      { id: 'exports', label: 'Cetak & Ekspor', icon: Printer, featureNum: 19 },
    ],
  },
  {
    id: 'administrasi',
    title: 'Administrasi',
    icon: ShieldCheck,
    items: [
      { id: 'users', label: 'Pengguna & Peran', icon: ShieldCheck, featureNum: 20 },
      { id: 'audit', label: 'Log Audit', icon: Activity, featureNum: 21 },
      { id: 'search', label: 'Pencarian', icon: Search, featureNum: 22 },
      { id: 'backup', label: 'Backup Data', icon: Database, featureNum: 23 },
    ],
  },
]

export const ALL_NAV_ITEMS = NAVIGATION_GROUPS.flatMap((group) => group.items)
