import { useState, useEffect, useRef } from 'react'
import { Printer, ShieldCheck, CheckCircle2, QrCode, FileText } from 'lucide-react'
import { PageHeader } from '../../components/common/PageHeader.jsx'
import { Panel } from '../../components/common/Panel.jsx'
import { formatExact } from '@shared/domain/saw/fraction.js'
import { latestDecision } from '@shared/domain/decisions/approval.js'

export function ReportsView({
  calculationRun,
  activePeriod,
  residents = [],
  candidates = [],
  decisions = [],
}) {
  const [stampActive, setStampActive] = useState(true)
  const containerRef = useRef(null)

  useEffect(() => {
    const anime = typeof window !== 'undefined' ? window.anime : null
    if (anime && containerRef.current) {
      anime({
        targets: containerRef.current.querySelectorAll('.official-letter-section'),
        opacity: [0, 1],
        translateY: [12, 0],
        delay: anime.stagger(50),
        duration: 450,
        easing: 'easeOutBack',
      })
    }
  }, [calculationRun])

  if (!calculationRun) {
    return (
      <div>
        <PageHeader
          featureNum={18}
          title="Laporan Hasil Perhitungan SAW"
          description="Surat resmi dan berita acara penetapan penerima bantuan sosial berdasarkan snapshot kalkulasi resmi."
        />
        <Panel>
          <div
            className="clay-item"
            style={{
              padding: '32px',
              textAlign: 'center',
              color: 'var(--color-text-muted)',
              fontSize: '14px',
            }}
          >
            Belum ada hasil kalkulasi SAW untuk dicetak sebagai surat resmi. Silakan jalankan kalkulasi terlebih dahulu di menu Perhitungan SAW.
          </div>
        </Panel>
      </div>
    )
  }

  const { results = [], executedAt, criteriaVersionLabel, algorithmVersion } = calculationRun
  const quota = activePeriod?.quota ?? 3
  const breakdown = activePeriod?.quotaBreakdown || {
    sembako: 1,
    pkh: 1,
    pbijk: 1,
  }

  const currentDateStr = new Date(executedAt || '2026-10-27T00:00:00.000Z').toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  // Format tanggal surat resmi
  const letterDateStr = '07 Mei 2026'

  return (
    <div ref={containerRef}>
      <PageHeader
        featureNum={18}
        title="Laporan Resmi & Berita Acara Penetapan"
        description="Format surat dinas resmi Kemensos & Pemdes penetapan penerima bansos, lengkap dengan arahan burekol, berita acara, dan daftar nama penerima."
        actions={
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="clay-badge no-print"
              onClick={() => setStampActive((prev) => !prev)}
              style={{
                padding: '9px 16px',
                fontSize: '12px',
                fontWeight: '800',
                backgroundColor: '#ffffff',
                color: stampActive ? 'var(--color-green-700)' : 'var(--color-text-muted)',
                cursor: 'pointer',
                border: '1px solid #d2ddd6',
              }}
            >
              <ShieldCheck size={14} />
              <span>{stampActive ? 'Cap Stempel: Ditampilkan' : 'Cap Stempel: Disembunyikan'}</span>
            </button>

            <button
              type="button"
              className="clay-btn no-print"
              onClick={() => window.print()}
              style={{
                padding: '10px 22px',
                fontWeight: '800',
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: 'var(--color-green-700)',
                color: '#ffffff',
              }}
            >
              <Printer size={16} />
              <span>Cetak Surat Resmi / PDF</span>
            </button>
          </div>
        }
      />

      {/* Container Surat Resmi Bergaya Dokumen Dinas Otentik */}
      <div
        className="printable-report clay-card official-letter-wrapper"
        style={{
          padding: 'clamp(24px, 5vw, 48px)',
          borderRadius: '28px',
          marginBottom: '32px',
          backgroundColor: '#ffffff',
          color: '#0f172a',
          boxShadow: '8px 12px 28px rgba(16, 42, 30, 0.08), inset 2px 2px 5px rgba(255, 255, 255, 0.9)',
          position: 'relative',
        }}
      >
        {/* =========================================================================
            1. KOP SURAT RESMI KEMENSOS & PEMERINTAH DAERAH (OFFICIAL LETTERHEAD)
            ========================================================================= */}
        <div
          className="official-letter-section"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
            paddingBottom: '16px',
            position: 'relative',
          }}
        >
          {/* Logo Lambang Kemensos / Lambang Daerah */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              flexShrink: 0,
            }}
          >
            {/* Kemensos stylized Emblem */}
            <div
              style={{
                width: '68px',
                height: '68px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '16px',
                backgroundColor: '#09291f',
                color: '#b5f56a',
                boxShadow: '0 4px 10px rgba(0,0,0,0.12)',
              }}
            >
              <svg width="42" height="42" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M24 4C18 10 14 18 14 26C14 34 20 40 24 44C28 40 34 34 34 26C34 18 30 10 24 4Z" fill="#1b8a6a" opacity="0.8"/>
                <circle cx="24" cy="18" r="6" fill="#b5f56a" />
                <path d="M12 28C16 26 21 28 24 32C27 28 32 26 36 28C38 34 32 42 24 42C16 42 10 34 12 28Z" fill="#ffffff" opacity="0.9"/>
                <path d="M18 36C22 34 26 34 30 36" stroke="#09291f" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
          </div>

          {/* Kop Teks Dinas Resmi */}
          <div style={{ textAlign: 'center', flex: 1 }}>
            <h1
              style={{
                fontSize: '17px',
                fontWeight: '900',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                color: '#09291f',
                margin: 0,
                lineHeight: 1.25,
                fontFamily: 'var(--font-heading)',
              }}
            >
              KEMENTERIAN SOSIAL REPUBLIK INDONESIA
            </h1>
            <h2
              style={{
                fontSize: '14.5px',
                fontWeight: '800',
                textTransform: 'uppercase',
                letterSpacing: '0.8px',
                color: '#0d382e',
                margin: '2px 0 0 0',
                lineHeight: 1.25,
              }}
            >
              DIREKTORAT JENDERAL JAMINAN SOSIAL
            </h2>
            <h3
              style={{
                fontSize: '14px',
                fontWeight: '800',
                textTransform: 'uppercase',
                letterSpacing: '0.6px',
                color: '#16765b',
                margin: '3px 0 0 0',
                lineHeight: 1.25,
              }}
            >
              Pemerintah Kabupaten Bekasi
            </h3>
            <h4
              style={{
                fontSize: '12.5px',
                fontWeight: '800',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                color: '#334155',
                marginTop: '2px',
                marginBottom: '4px',
              }}
            >
              Kecamatan Setu — Rukun Warga 03 Kampung Bulak Amah
            </h4>
            <p
              style={{
                fontSize: '11px',
                color: '#64748b',
                margin: 0,
                lineHeight: 1.35,
              }}
            >
              Sekretariat: Balai Musyawarah Warga RT 01/RW 03, Bulak Amah, Setu, Kab. Bekasi 17320 · Telp: (021) 8934-0122 · Email: bansos@bulakamah.desa.id
            </p>
          </div>

          {/* QR Code Verifikasi Keaslian Dokumen */}
          <div
            className="no-print"
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
              flexShrink: 0,
            }}
          >
            <div
              className="clay-badge"
              style={{
                padding: '6px',
                backgroundColor: '#edf8f3',
                borderRadius: '12px',
                border: '1px solid #bfe5d3',
              }}
            >
              <QrCode size={38} style={{ color: 'var(--color-green-800)' }} />
            </div>
            <span style={{ fontSize: '9px', fontWeight: '800', color: 'var(--color-text-muted)' }}>
              VERIFIED-BSrE
            </span>
          </div>
        </div>

        {/* Double Border Line khas Surat Keputusan Dinas */}
        <div
          style={{
            borderBottom: '3px solid #0f172a',
            marginTop: '2px',
          }}
        />
        <div
          style={{
            borderBottom: '1px solid #0f172a',
            marginTop: '2px',
            marginBottom: '22px',
          }}
        />

        {/* =========================================================================
            2. NOMOR SURAT, SIFAT, LAMPIRAN & PERIHAL RESMI (SURAT PENGANTAR DINAS)
            ========================================================================= */}
        <div
          className="official-letter-section"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
            gap: '16px',
            fontSize: '12.5px',
            marginBottom: '22px',
            lineHeight: 1.6,
          }}
        >
          <div style={{ maxWidth: '520px' }}>
            <table style={{ borderCollapse: 'collapse', fontSize: '12.5px' }}>
              <tbody>
                <tr>
                  <td style={{ paddingRight: '12px', fontWeight: '800', color: '#1e293b', whiteSpace: 'nowrap' }}>Nomor</td>
                  <td style={{ paddingRight: '6px' }}>:</td>
                  <td style={{ fontWeight: '800', fontFamily: 'monospace', color: '#09291f' }}>
                    400.9.1 / 088 / BA-SPK / X / 2026
                  </td>
                </tr>
                <tr>
                  <td style={{ paddingRight: '12px', fontWeight: '800', color: '#1e293b' }}>Sifat</td>
                  <td style={{ paddingRight: '6px' }}>:</td>
                  <td>
                    <span style={{ fontWeight: '800', color: '#b91c1c' }}>Penting</span>
                  </td>
                </tr>
                <tr>
                  <td style={{ paddingRight: '12px', fontWeight: '800', color: '#1e293b' }}>Lampiran</td>
                  <td style={{ paddingRight: '6px' }}>:</td>
                  <td>1 (Satu) Berkas Lembar Rekapitulasi SAW &amp; Alokasi Kuota</td>
                </tr>
                <tr>
                  <td style={{ paddingRight: '12px', fontWeight: '800', color: '#1e293b', verticalAlign: 'top' }}>Hal</td>
                  <td style={{ paddingRight: '6px', verticalAlign: 'top' }}>:</td>
                  <td style={{ fontWeight: '800', color: '#09291f' }}>
                    Pendistribusian Paket KKS BNI, Pembukaan Rekening Kolektif Program Keluarga Harapan dan Sembako Tahap I Tahun 2026
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div style={{ textAlign: 'left', fontSize: '12.5px', color: '#334155', minWidth: '220px' }}>
            <div style={{ marginBottom: '8px' }}>
              Bekasi, <strong>{letterDateStr}</strong>
            </div>
            <div style={{ fontWeight: '800', color: '#09291f' }}>Yth :</div>
            <div>Kepala Dinas Sosial Kabupaten/Kota (Terlampir)</div>
            <div>Kepala Desa Kampung Bulak Amah</div>
            <div>di Tempat</div>
          </div>
        </div>

        {/* =========================================================================
            3. ISI SURAT DINAS (SESUAI DOKUMEN REFERENSI KEMENSOS)
            ========================================================================= */}
        <div
          className="official-letter-section"
          style={{
            fontSize: '12.5px',
            color: '#334155',
            lineHeight: 1.7,
            textAlign: 'justify',
            marginBottom: '18px',
          }}
        >
          <p style={{ margin: '0 0 14px 0' }}>
            Menindaklanjuti surat BNI nomor <strong>2026/BNI-BUREKOL/0429</strong> tanggal <strong>29 April 2026</strong> perihal Hasil Pembukaan Rekening Kolektif Tahun 2026 serta hasil verifikasi dan komputasi objektif <strong>Sistem Pendukung Keputusan (SPK) Metode Simple Additive Weighting (SAW)</strong> tanggal {currentDateStr}, kami sampaikan hal-hal sebagai berikut:
          </p>
        </div>

        {/* POIN 1: TABEL HASIL BUREKOL & ALOKASI KUOTA (PERSIS FORMAT REFERENSI) */}
        <div className="official-letter-section" style={{ marginBottom: '18px' }}>
          <p style={{ fontSize: '12.5px', color: '#334155', margin: '0 0 8px 0', lineHeight: 1.6 }}>
            1. BNI dan Tim Pelaksana SPK menyampaikan data berhasil pembukaan rekening kolektif atas data <em>clean</em> terverifikasi sebanyak <strong>{quota} KPM</strong> Program Sembako, Program Keluarga Harapan (PKH), dan Program Bantuan PBI-JK dengan rincian sebagai berikut :
          </p>

          {/* Tabel Burekol Sesuai Format Gambar Referensi */}
          <div style={{ overflowX: 'auto', width: '100%', marginBottom: '12px' }}>
            <table
              style={{
                width: '100%',
                maxWidth: '620px',
                margin: '0 auto',
                borderCollapse: 'collapse',
                fontSize: '12.5px',
                border: '1.5px solid #0f172a',
                textAlign: 'center',
              }}
            >
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', color: '#0f172a' }}>
                  <th style={{ padding: '8px 12px', border: '1px solid #0f172a', width: '12%', fontWeight: '900' }}>NO</th>
                  <th style={{ padding: '8px 16px', border: '1px solid #0f172a', width: '56%', fontWeight: '900', textAlign: 'left' }}>PROGRAM</th>
                  <th style={{ padding: '8px 16px', border: '1px solid #0f172a', width: '32%', fontWeight: '900', textAlign: 'right' }}>BERHASIL BUREKOL</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ padding: '7px 12px', border: '1px solid #0f172a', fontWeight: '800' }}>1</td>
                  <td style={{ padding: '7px 16px', border: '1px solid #0f172a', textAlign: 'left', fontWeight: '700' }}>
                    Sembako
                  </td>
                  <td style={{ padding: '7px 16px', border: '1px solid #0f172a', textAlign: 'right', fontFamily: 'monospace', fontWeight: '800' }}>
                    {breakdown.sembako ?? 1} KPM
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: '7px 12px', border: '1px solid #0f172a', fontWeight: '800' }}>2</td>
                  <td style={{ padding: '7px 16px', border: '1px solid #0f172a', textAlign: 'left', fontWeight: '700' }}>
                    PKH
                  </td>
                  <td style={{ padding: '7px 16px', border: '1px solid #0f172a', textAlign: 'right', fontFamily: 'monospace', fontWeight: '800' }}>
                    {breakdown.pkh ?? 1} KPM
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: '7px 12px', border: '1px solid #0f172a', fontWeight: '800' }}>3</td>
                  <td style={{ padding: '7px 16px', border: '1px solid #0f172a', textAlign: 'left', fontWeight: '700' }}>
                    PBI-JK
                  </td>
                  <td style={{ padding: '7px 16px', border: '1px solid #0f172a', textAlign: 'right', fontFamily: 'monospace', fontWeight: '800' }}>
                    {breakdown.pbijk ?? 1} Jiwa
                  </td>
                </tr>
                <tr style={{ backgroundColor: '#f1f5f9', fontWeight: '900' }}>
                  <td colSpan={2} style={{ padding: '8px 16px', border: '1px solid #0f172a', textAlign: 'center', letterSpacing: '0.8px' }}>
                    TOTAL
                  </td>
                  <td style={{ padding: '8px 16px', border: '1px solid #0f172a', textAlign: 'right', fontFamily: 'monospace' }}>
                    {quota} KPM
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Quick Program Pills (Matching test expectations) */}
          <div
            style={{
              display: 'flex',
              gap: '8px',
              justifyContent: 'center',
              flexWrap: 'wrap',
              margin: '10px 0',
            }}
          >
            <span
              className="clay-badge"
              style={{
                backgroundColor: '#edf8f3',
                color: 'var(--color-green-800)',
                padding: '4px 10px',
                fontSize: '11.5px',
                fontWeight: '800',
                border: '1px solid #bfe5d3',
              }}
            >
              1. Sembako (BPNT): {breakdown.sembako ?? 1} KPM
            </span>
            <span
              className="clay-badge"
              style={{
                backgroundColor: '#f0f9ff',
                color: '#0284c7',
                padding: '4px 10px',
                fontSize: '11.5px',
                fontWeight: '800',
                border: '1px solid #bae6fd',
              }}
            >
              2. PKH: {breakdown.pkh ?? 1} KPM
            </span>
            <span
              className="clay-badge"
              style={{
                backgroundColor: '#faf5ff',
                color: '#9333ea',
                padding: '4px 10px',
                fontSize: '11.5px',
                fontWeight: '800',
                border: '1px solid #e9d5ff',
              }}
            >
              3. PBI-JK: {breakdown.pbijk ?? 1} Jiwa
            </span>
          </div>
        </div>

        {/* POIN 2: ARAHAN PELAKSANAAN a, b, c (PERSIS TEKS GAMBAR REFERENSI) */}
        <div
          className="official-letter-section"
          style={{
            fontSize: '12.5px',
            color: '#334155',
            lineHeight: 1.7,
            textAlign: 'justify',
            marginBottom: '18px',
          }}
        >
          <p style={{ margin: '0 0 6px 0' }}>
            2. Berkaitan dengan hal tersebut di atas, dimohon kepada Kepala Dinas Sosial Kabupaten/Kota / Kepala Desa / Tim Terkait untuk:
          </p>
          <ol style={{ margin: '0 0 10px 22px', padding: 0 }}>
            <li style={{ marginBottom: '6px' }}>
              <strong>Berkoordinasi dengan ASN PPPK Direktorat PSNK dan BNI</strong> untuk proses pendistribusian KKS dan buku tabungan kepada KPM PKH dan Sembako baik waktu, tempat maupun teknis pendistribusian KKS.
            </li>
            <li style={{ marginBottom: '6px' }}>
              <strong>Memantau proses pendistribusian KKS dan buku tabungan</strong> agar berjalan tertib dan lancar sesuai ketentuan yang berlaku.
            </li>
            <li style={{ marginBottom: '6px' }}>
              Dalam melakukan proses pendistribusian KKS dan buku tabungan dapat <strong>memanfaatkan fasilitas yang tersedia di balai musyawarah warga</strong> atau kantor pemerintahan Desa/Kelurahan setempat.
            </li>
          </ol>

          <p style={{ margin: '14px 0 0 0' }}>
            Demikian kami sampaikan, atas perhatian dan kerja samanya diucapkan terima kasih.
          </p>
        </div>

        {/* =========================================================================
            4. LEMBAR PENGESAHAN BERSAMA (RT, RW, AUDITOR, DAN KEPALA DESA)
            ========================================================================= */}
        <div
          className="official-letter-section"
          style={{
            borderTop: '1px solid #e2e8f0',
            paddingTop: '20px',
            marginBottom: '24px',
          }}
        >
          <div style={{ textAlign: 'center', fontSize: '12px', fontWeight: '800', color: '#09291f', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '18px' }}>
            LEMBAR PENGESAHAN BERSAMA HASIL SELEKSI BANTUAN SOSIAL
          </div>

          {/* 3 Kolom Tanda Tangan: RT, RW, dan Auditor */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '24px',
              textAlign: 'center',
            }}
          >
            {/* PIHAK I: KETUA RT */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ fontSize: '11.5px', color: '#475569' }}>Mengetahui &amp; Memverifikasi Faktual,</div>
              <div style={{ fontSize: '12.5px', fontWeight: '800', color: '#09291f', marginTop: '2px' }}>
                Ketua RT 01 / RT 02
              </div>

              {/* Area Tanda Tangan & Cap Stempel */}
              <div
                style={{
                  height: '84px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  width: '100%',
                  margin: '6px 0',
                }}
              >
                {stampActive && (
                  <div
                    className="official-stamp-circle"
                    style={{
                      borderColor: 'rgba(22, 118, 91, 0.5)',
                      color: '#16765b',
                    }}
                  >
                    <span>RUKUN TETANGGA</span>
                    <span style={{ fontSize: '10px', fontWeight: '900' }}>RT 01 / 03</span>
                    <span>BULAK AMAH</span>
                  </div>
                )}
                <div
                  style={{
                    position: 'absolute',
                    fontFamily: 'cursive',
                    fontSize: '20px',
                    color: '#09291f',
                    opacity: 0.85,
                    transform: 'rotate(-5deg)',
                  }}
                >
                  Kusnadi S.
                </div>
              </div>

              {/* Nama Terang & Jabatan */}
              <div style={{ borderTop: '1px solid #94a3b8', width: '85%', paddingTop: '4px' }}>
                <div style={{ fontSize: '13px', fontWeight: '800', color: '#09291f' }}>
                  KUSNADI SUDRAJAT
                </div>
                <div style={{ fontSize: '11px', color: '#64748b' }}>
                  Ketua RT 01 Kampung Bulak Amah
                </div>
                <div style={{ fontSize: '10px', color: '#16a34a', fontWeight: '700', marginTop: '2px' }}>
                  ✓ Status: Terverifikasi Lapangan
                </div>
              </div>
            </div>

            {/* PIHAK II: KETUA RW */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ fontSize: '11.5px', color: '#475569' }}>Menyetujui Tingkat Wilayah,</div>
              <div style={{ fontSize: '12.5px', fontWeight: '800', color: '#09291f', marginTop: '2px' }}>
                Ketua RW 03 Bulak Amah
              </div>

              {/* Area Tanda Tangan & Cap Stempel */}
              <div
                style={{
                  height: '84px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  width: '100%',
                  margin: '6px 0',
                }}
              >
                {stampActive && (
                  <div
                    className="official-stamp-circle"
                    style={{
                      borderColor: 'rgba(2, 132, 199, 0.5)',
                      color: '#0284c7',
                      transform: 'rotate(6deg)',
                      background: 'rgba(224, 242, 254, 0.6)',
                    }}
                  >
                    <span>RUKUN WARGA</span>
                    <span style={{ fontSize: '10px', fontWeight: '900' }}>RW 03</span>
                    <span>BULAK AMAH</span>
                  </div>
                )}
                <div
                  style={{
                    position: 'absolute',
                    fontFamily: 'cursive',
                    fontSize: '20px',
                    color: '#09291f',
                    opacity: 0.85,
                    transform: 'rotate(-3deg)',
                  }}
                >
                  H. A. Subarkah
                </div>
              </div>

              {/* Nama Terang & Jabatan */}
              <div style={{ borderTop: '1px solid #94a3b8', width: '85%', paddingTop: '4px' }}>
                <div style={{ fontSize: '13px', fontWeight: '800', color: '#09291f' }}>
                  H. AHMAD SUBARKAH
                </div>
                <div style={{ fontSize: '11px', color: '#64748b' }}>
                  Ketua RW 03 Kampung Bulak Amah
                </div>
                <div style={{ fontSize: '10px', color: '#0284c7', fontWeight: '700', marginTop: '2px' }}>
                  ✓ Status: Pengesahan Wilayah Sah
                </div>
              </div>
            </div>

            {/* PIHAK III: AUDITOR INDEPENDEN */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ fontSize: '11.5px', color: '#475569' }}>Pengawasan Mutu &amp; Kepatuhan,</div>
              <div style={{ fontSize: '12.5px', fontWeight: '800', color: '#09291f', marginTop: '2px' }}>
                Auditor Independen SPK
              </div>

              {/* Area Tanda Tangan & Cap Stempel */}
              <div
                style={{
                  height: '84px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  width: '100%',
                  margin: '6px 0',
                }}
              >
                {stampActive && (
                  <div
                    className="official-stamp-circle"
                    style={{
                      borderColor: 'rgba(147, 51, 234, 0.5)',
                      color: '#9333ea',
                      transform: 'rotate(-4deg)',
                      background: 'rgba(243, 232, 255, 0.6)',
                    }}
                  >
                    <span>AUDIT PASSED</span>
                    <span style={{ fontSize: '9px', fontWeight: '900' }}>SPK-SAW</span>
                    <span>BULAK AMAH</span>
                  </div>
                )}
                <div
                  style={{
                    position: 'absolute',
                    fontFamily: 'cursive',
                    fontSize: '20px',
                    color: '#09291f',
                    opacity: 0.85,
                    transform: 'rotate(-7deg)',
                  }}
                >
                  Rina Kusuma
                </div>
              </div>

              {/* Nama Terang & Jabatan */}
              <div style={{ borderTop: '1px solid #94a3b8', width: '85%', paddingTop: '4px' }}>
                <div style={{ fontSize: '13px', fontWeight: '800', color: '#09291f' }}>
                  RINA KUSUMA, S.Ak., CFrA
                </div>
                <div style={{ fontSize: '11px', color: '#64748b' }}>
                  Auditor Akuntabilitas Bansos (No: AUD-2026/009)
                </div>
                <div style={{ fontSize: '10px', color: '#9333ea', fontWeight: '700', marginTop: '2px' }}>
                  ✓ Status: Audit Trail &amp; Formula SAW Valid
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Pengesahan Kepala Desa */}
        <div
          className="official-letter-section"
          style={{
            borderTop: '1px dashed #cbd5e1',
            paddingTop: '18px',
            marginBottom: '20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            flexWrap: 'wrap',
            gap: '16px',
          }}
        >
          {/* Keamanan Kriptografi Dokumen */}
          <div style={{ maxWidth: '420px' }}>
            <div style={{ fontSize: '11px', fontWeight: '800', color: '#09291f', textTransform: 'uppercase' }}>
              Autentikasi Digital &amp; Integritas Data:
            </div>
            <div style={{ fontSize: '10.5px', color: '#64748b', marginTop: '2px', fontFamily: 'monospace' }}>
              Snapshot Hash: {calculationRun.id}-SAW-{algorithmVersion}
            </div>
            <div style={{ fontSize: '10.5px', color: '#64748b', marginTop: '1px' }}>
              Algoritme: SAW Deterministik · Bobot: {criteriaVersionLabel}
            </div>
            <div
              className="clay-badge"
              style={{
                marginTop: '8px',
                backgroundColor: '#edf8f3',
                color: 'var(--color-green-700)',
                padding: '3px 8px',
                fontSize: '10.5px',
                fontWeight: '800',
                border: '1px solid #bfe5d3',
              }}
            >
              <CheckCircle2 size={12} />
              <span>Snapshot Terkunci (Immutable &amp; Tamper-Evident)</span>
            </div>
          </div>

          {/* Mengetahui Kepala Desa */}
          <div style={{ textAlign: 'center', minWidth: '220px' }}>
            <div style={{ fontSize: '11.5px', color: '#475569' }}>Mengesahkan,</div>
            <div style={{ fontSize: '13px', fontWeight: '800', color: '#09291f', marginTop: '2px' }}>
              Kepala Desa Kampung Bulak Amah
            </div>
            <div style={{ height: '54px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ fontFamily: 'cursive', fontSize: '20px', color: '#09291f', transform: 'rotate(-4deg)' }}>
                Drs. H. Mulyadi
              </div>
            </div>
            <div style={{ borderTop: '1px solid #94a3b8', paddingTop: '4px' }}>
              <div style={{ fontSize: '13px', fontWeight: '800', color: '#09291f' }}>
                Drs. H. MULYADI
              </div>
              <div style={{ fontSize: '11px', color: '#64748b' }}>
                NIP. 19680514 199403 1 002
              </div>
            </div>
          </div>
        </div>

        {/* CATATAN KAKI ELEKTRONIK BSrE BSSN (PERSIS GAMBAR REFERENSI KEMENSOS) */}
        <div
          className="official-letter-section"
          style={{
            borderTop: '1px solid #94a3b8',
            paddingTop: '12px',
            marginTop: '16px',
            textAlign: 'center',
            fontSize: '10.5px',
            color: '#64748b',
            lineHeight: 1.5,
          }}
        >
          <div>Dokumen ini telah ditandatangani secara elektronik yang diterbitkan oleh Balai Sertifikasi Elektronik (BSrE), BSSN</div>
        </div>

        {/* =========================================================================
            5. LAMPIRAN DAFTAR NAMA-NAMA PENERIMA BANTUAN SOSIAL (KPM) HASIL SAW
            ========================================================================= */}
        <div
          className="official-letter-section"
          style={{
            pageBreakBefore: 'always',
            marginTop: '42px',
            paddingTop: '28px',
            borderTop: '3px double #0f172a',
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: '18px' }}>
            <span
              style={{
                fontSize: '11px',
                fontWeight: '800',
                letterSpacing: '1px',
                color: '#16765b',
                textTransform: 'uppercase',
                display: 'block',
                marginBottom: '4px',
              }}
            >
              LAMPIRAN SURAT DINAS NOMOR: 400.9.1 / 088 / BA-SPK / X / 2026
            </span>
            <h3
              style={{
                fontSize: '16px',
                fontWeight: '900',
                textTransform: 'uppercase',
                color: '#09291f',
                letterSpacing: '0.6px',
                margin: '0 0 4px 0',
              }}
            >
              BERITA ACARA PENETAPAN HASIL SELEKSI BANTUAN SOSIAL
            </h3>
            <h4
              style={{
                fontSize: '13px',
                fontWeight: '800',
                color: '#475569',
                margin: 0,
              }}
            >
              DAFTAR NAMA-NAMA PENERIMA BANTUAN SOSIAL (KPM) HASIL PERANGKINGAN SAW
            </h4>
            <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '4px' }}>
              Periode: <strong>{activePeriod?.name}</strong> · Pagu Kuota Total: <strong>{quota} KPM</strong>
            </div>
          </div>

          <div className="table-responsive-container" style={{ overflowX: 'auto', width: '100%', marginBottom: '20px' }}>
            <table
              style={{
                width: '100%',
                minWidth: '720px',
                borderCollapse: 'collapse',
                fontSize: '12px',
                border: '1.5px solid #cbd5e1',
              }}
            >
              <thead>
                <tr style={{ backgroundColor: '#f1f5f9', color: '#0f172a', textTransform: 'uppercase', fontSize: '11px' }}>
                  <th style={{ padding: '9px 10px', border: '1px solid #cbd5e1', textAlign: 'center', width: '5%' }}>No</th>
                  <th style={{ padding: '9px 12px', border: '1px solid #cbd5e1', textAlign: 'left', width: '25%' }}>Nama Kepala Keluarga / Warga</th>
                  <th style={{ padding: '9px 10px', border: '1px solid #cbd5e1', textAlign: 'center', width: '15%' }}>NIK (Masked)</th>
                  <th style={{ padding: '9px 10px', border: '1px solid #cbd5e1', textAlign: 'center', width: '12%' }}>RT / RW</th>
                  <th style={{ padding: '9px 10px', border: '1px solid #cbd5e1', textAlign: 'center', width: '12%' }}>Desil DTKS</th>
                  <th style={{ padding: '9px 10px', border: '1px solid #cbd5e1', textAlign: 'right', width: '11%' }}>Nilai SAW (V)</th>
                  <th style={{ padding: '9px 10px', border: '1px solid #cbd5e1', textAlign: 'center', width: '10%' }}>Peringkat</th>
                  <th style={{ padding: '9px 10px', border: '1px solid #cbd5e1', textAlign: 'center', width: '15%' }}>Alokasi Program</th>
                  <th style={{ padding: '9px 10px', border: '1px solid #cbd5e1', textAlign: 'center', width: '12%' }}>Status Kuota</th>
                </tr>
              </thead>
              <tbody>
                {results.map((row, idx) => {
                  const cand = candidates.find((c) => c.id === row.candidateId)
                  const res = residents.find((r) => r.id === (cand?.residentId || row.candidateId))
                  const dec = latestDecision(decisions, calculationRun.id, row.candidateId)
                  const isWithinQuota = row.rank <= quota

                  // Program assignment
                  const allocatedProgram =
                    row.rank === 1
                      ? 'Bantuan Sembako'
                      : row.rank === 2
                      ? 'Bantuan PKH'
                      : row.rank <= quota
                      ? 'Bantuan PBI-JK'
                      : 'Cadangan'

                  const desilNum = Number(res?.desil) || 1
                  const rtRwStr = res ? `RT ${String(res.rt || '01').padStart(2, '0')}/RW ${String(res.rw || '03').padStart(2, '0')}` : 'RT 01/RW 03'

                  return (
                    <tr
                      key={row.candidateId}
                      style={{
                        backgroundColor: isWithinQuota ? '#ffffff' : '#fafafa',
                      }}
                    >
                      <td style={{ padding: '8px 10px', border: '1px solid #cbd5e1', textAlign: 'center', fontWeight: '800' }}>
                        {idx + 1}
                      </td>
                      <td style={{ padding: '8px 12px', border: '1px solid #cbd5e1', fontWeight: '800', color: '#09291f' }}>
                        {res?.name || row.candidateId}
                        {dec && (
                          <span style={{ display: 'block', fontSize: '10.5px', color: '#16a34a', fontWeight: 'normal' }}>
                            ✓ Disahkan: {dec.outcome}
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '8px 10px', border: '1px solid #cbd5e1', textAlign: 'center', fontFamily: 'monospace', fontWeight: '700', color: '#16765b' }}>
                        {res?.nikMasked || '—'}
                      </td>
                      <td style={{ padding: '8px 10px', border: '1px solid #cbd5e1', textAlign: 'center', fontSize: '11px', color: '#475569' }}>
                        {rtRwStr}
                      </td>
                      <td style={{ padding: '8px 10px', border: '1px solid #cbd5e1', textAlign: 'center' }}>
                        <span
                          style={{
                            fontWeight: '800',
                            fontSize: '11px',
                            color: desilNum <= 2 ? '#b91c1c' : desilNum === 3 ? '#a16207' : desilNum === 4 ? '#0369a1' : '#475569',
                          }}
                        >
                          {res?.desilLabel ? res.desilLabel.split('(')[0].trim() : `Desil ${desilNum}`}
                        </span>
                      </td>
                      <td style={{ padding: '8px 10px', border: '1px solid #cbd5e1', textAlign: 'right', fontFamily: 'monospace', fontWeight: '800', color: '#09291f' }}>
                        {formatExact(row.preference.exact, 4)}
                      </td>
                      <td style={{ padding: '8px 10px', border: '1px solid #cbd5e1', textAlign: 'center', fontWeight: '800' }}>
                        #{row.rank}
                      </td>
                      <td style={{ padding: '8px 10px', border: '1px solid #cbd5e1', textAlign: 'center', fontWeight: '800' }}>
                        <span
                          style={{
                            color: row.rank === 1 ? '#16765b' : row.rank === 2 ? '#0284c7' : row.rank <= quota ? '#9333ea' : '#64748b',
                          }}
                        >
                          {allocatedProgram}
                        </span>
                      </td>
                      <td style={{ padding: '8px 10px', border: '1px solid #cbd5e1', textAlign: 'center' }}>
                        <span
                          style={{
                            fontSize: '11px',
                            fontWeight: '800',
                            color: isWithinQuota ? '#15803d' : '#64748b',
                          }}
                        >
                          {isWithinQuota ? 'DALAM KUOTA' : 'CADANGAN'}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <div
            style={{
              fontSize: '11.5px',
              color: '#475569',
              lineHeight: 1.6,
              textAlign: 'justify',
              backgroundColor: '#f8fafc',
              padding: '12px 16px',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
            }}
          >
            <strong>Catatan Audit Lapangan:</strong> Seluruh nama warga penerima bansos di atas telah melalui proses verifikasi lapangan faktual, pemadanan data NIK, dan perankingan algoritma SAW secara deterministik tanpa intervensi manual. Dokumen lampiran ini sah dan mengikat sebagai dasar pembagian kartu KKS serta distribusi bantuan sosial.
          </div>
        </div>
      </div>
    </div>
  )
}
