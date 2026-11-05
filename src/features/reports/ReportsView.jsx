import { useState, useEffect, useRef } from 'react'
import { Printer, ShieldCheck, CheckCircle2, QrCode } from 'lucide-react'
import { PageHeader } from '../../components/common/PageHeader.jsx'
import { Panel } from '../../components/common/Panel.jsx'
import { formatExact } from '@shared/domain/saw/fraction.js'
import { latestDecision } from '@shared/domain/decisions/approval.js'

export function ReportsView({
  calculationRun,
  activePeriod,
  residents,
  candidates,
  decisions,
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
        delay: anime.stagger(60),
        duration: 500,
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

  const { results, executedAt, criteriaVersionLabel, algorithmVersion } = calculationRun
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

  return (
    <div ref={containerRef}>
      <PageHeader
        featureNum={18}
        title="Laporan Resmi & Berita Acara Penetapan"
        description="Format surat dinas resmi penetapan penerima bantuan sosial lengkap dengan lembar pengesahan tanda tangan Ketua RT, Ketua RW, dan Auditor."
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
            1. KOP SURAT RESMI PEMERINTAH DESA (OFFICIAL LETTERHEAD)
            ========================================================================= */}
        <div
          className="official-letter-section"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
            paddingBottom: '16px',
            borderBottom: '3px solid #0f172a',
            position: 'relative',
          }}
        >
          {/* Logo Lambang Daerah / Lambang Garuda */}
          <div
            className="clay-bubble"
            style={{
              width: '74px',
              height: '74px',
              borderRadius: '20px',
              backgroundColor: '#0d382e',
              color: 'var(--color-lime)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              boxShadow: '4px 6px 16px rgba(0,0,0,0.15)',
            }}
          >
            <span style={{ fontSize: '10px', fontWeight: '900', letterSpacing: '1px' }}>KAB.</span>
            <span style={{ fontSize: '18px', fontWeight: '900', fontFamily: 'var(--font-heading)' }}>BEKASI</span>
          </div>

          {/* Kop Teks Dinas */}
          <div style={{ textAlign: 'center', flex: 1 }}>
            <h2
              style={{
                fontSize: '18px',
                fontWeight: '900',
                textTransform: 'uppercase',
                letterSpacing: '1.2px',
                color: '#09291f',
                margin: 0,
                lineHeight: 1.2,
                fontFamily: 'var(--font-heading)',
              }}
            >
              Pemerintah Kabupaten Bekasi
            </h2>
            <h3
              style={{
                fontSize: '15.5px',
                fontWeight: '800',
                textTransform: 'uppercase',
                letterSpacing: '0.8px',
                color: '#16765b',
                marginTop: '4px',
                marginBottom: '2px',
              }}
            >
              Kecamatan Setu — Rukun Warga 03 Kampung Bulak Amah
            </h3>
            <h4
              style={{
                fontSize: '13px',
                fontWeight: '800',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                color: '#334155',
                marginTop: '3px',
                marginBottom: '4px',
              }}
            >
              Tim Koordinasi Penanggulangan Kemiskinan &amp; Penyaluran Bantuan Sosial
            </h4>
            <p
              style={{
                fontSize: '11px',
                color: '#64748b',
                margin: 0,
                lineHeight: 1.4,
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
              }}
            >
              <QrCode size={38} style={{ color: 'var(--color-green-800)' }} />
            </div>
            <span style={{ fontSize: '9px', fontWeight: '800', color: 'var(--color-text-muted)' }}>
              VERIFIED-E-SURAT
            </span>
          </div>
        </div>

        {/* Double Border Line khas Surat Keputusan Dinas */}
        <div
          style={{
            borderBottom: '1px solid #0f172a',
            marginTop: '2.5px',
            marginBottom: '24px',
          }}
        />

        {/* =========================================================================
            2. NOMOR SURAT, SIFAT, LAMPIRAN & PERIHAL RESMI
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
            marginBottom: '24px',
            lineHeight: 1.6,
          }}
        >
          <div style={{ maxWidth: '480px' }}>
            <table style={{ borderCollapse: 'collapse', fontSize: '12.5px' }}>
              <tbody>
                <tr>
                  <td style={{ paddingRight: '12px', fontWeight: '800', color: '#1e293b' }}>Nomor Surat</td>
                  <td style={{ paddingRight: '6px' }}>:</td>
                  <td style={{ fontWeight: '800', fontFamily: 'monospace', color: '#09291f' }}>
                    400.9.1 / 088 / BA-SPK / X / 2026
                  </td>
                </tr>
                <tr>
                  <td style={{ paddingRight: '12px', fontWeight: '800', color: '#1e293b' }}>Sifat</td>
                  <td style={{ paddingRight: '6px' }}>:</td>
                  <td>
                    <span style={{ fontWeight: '800', color: '#b91c1c' }}>PENTING / DOKUMEN RESMI TERSERTIFIKASI</span>
                  </td>
                </tr>
                <tr>
                  <td style={{ paddingRight: '12px', fontWeight: '800', color: '#1e293b' }}>Lampiran</td>
                  <td style={{ paddingRight: '6px' }}>:</td>
                  <td>1 (Satu) Berkas Lembar Rekapitulasi SAW &amp; Alokasi Kuota</td>
                </tr>
                <tr>
                  <td style={{ paddingRight: '12px', fontWeight: '800', color: '#1e293b', verticalAlign: 'top' }}>Perihal</td>
                  <td style={{ paddingRight: '6px', verticalAlign: 'top' }}>:</td>
                  <td style={{ fontWeight: '800', color: '#09291f' }}>
                    Berita Acara Penetapan dan Rekomendasi Resmi Penerima Bantuan Sosial Tahap I T.A. 2026
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div style={{ textAlign: 'right', fontSize: '12px', color: '#475569' }}>
            <div>Bulak Amah, {currentDateStr}</div>
            <div style={{ marginTop: '2px', fontWeight: '700', color: '#09291f' }}>
              Kepada Yth.
            </div>
            <div>Kepala Desa Kampung Bulak Amah</div>
            <div>di Tempat</div>
          </div>
        </div>

        {/* =========================================================================
            3. KONSIDERAN & PEMBUKA BERITA ACARA RESMI
            ========================================================================= */}
        <div
          className="official-letter-section"
          style={{
            textAlign: 'center',
            marginBottom: '20px',
          }}
        >
          <h3
            style={{
              fontSize: '16px',
              fontWeight: '900',
              textTransform: 'uppercase',
              color: '#09291f',
              textDecoration: 'underline',
              letterSpacing: '0.5px',
              margin: '0 0 4px 0',
            }}
          >
            BERITA ACARA PENETAPAN HASIL SELEKSI BANTUAN SOSIAL
          </h3>
          <span style={{ fontSize: '12px', fontWeight: '800', color: '#475569' }}>
            Nomor: BA.088/SPK-SAW/KBA/2026
          </span>
        </div>

        <div
          className="official-letter-section"
          style={{
            fontSize: '12.5px',
            color: '#334155',
            lineHeight: 1.7,
            textAlign: 'justify',
            marginBottom: '20px',
          }}
        >
          <p style={{ margin: '0 0 12px 0' }}>
            Pada hari ini, <strong>{currentDateStr}</strong>, bertempat di Balai Musyawarah Warga Kampung Bulak Amah, Kecamatan Setu, Kabupaten Bekasi, telah dilaksanakan rapat pleno gabungan antara Ketua RT 01 s.d. RT 03, Ketua RW 03, serta Auditor Akuntabilitas SPK untuk memverifikasi dan mengesahkan hasil seleksi calon penerima program <strong>{activePeriod?.name}</strong>.
          </p>
          <p style={{ margin: 0 }}>
            Penetapan rekomendasi ini didasarkan pada komputasi matematis <strong>Sistem Pendukung Keputusan (SPK) Metode Simple Additive Weighting (SAW)</strong> secara objektif, deterministik, dan dapat diaudit, yang diselaraskan dengan basis data <strong>Data Terpadu Kesejahteraan Sosial (DTKS) Kemensos RI</strong> dan pagu kuota yang disahkan.
          </p>
        </div>

        {/* =========================================================================
            4. RINCIAN ALOKASI KUOTA PER JENIS BANTUAN
            ========================================================================= */}
        <div
          className="official-letter-section clay-item"
          style={{
            padding: '16px 20px',
            borderRadius: '18px',
            backgroundColor: '#edf8f3',
            marginBottom: '24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div>
            <div style={{ fontSize: '12px', fontWeight: '800', color: '#16765b', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
              Alokasi Pagu Kuota Terbagi Per Jenis Bantuan:
            </div>
            <div style={{ fontSize: '13px', fontWeight: '800', color: '#09291f', marginTop: '3px' }}>
              Total Kapasitas: {quota} Keluarga Penerima Manfaat (KPM)
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <span
              className="clay-badge"
              style={{
                backgroundColor: '#ffffff',
                color: 'var(--color-green-800)',
                padding: '4px 10px',
                fontSize: '11.5px',
                fontWeight: '800',
              }}
            >
              1. Sembako (BPNT): {breakdown.sembako ?? 1} KPM
            </span>
            <span
              className="clay-badge"
              style={{
                backgroundColor: '#ffffff',
                color: '#0284c7',
                padding: '4px 10px',
                fontSize: '11.5px',
                fontWeight: '800',
              }}
            >
              2. PKH: {breakdown.pkh ?? 1} KPM
            </span>
            <span
              className="clay-badge"
              style={{
                backgroundColor: '#ffffff',
                color: '#9333ea',
                padding: '4px 10px',
                fontSize: '11.5px',
                fontWeight: '800',
              }}
            >
              3. PBI-JK: {breakdown.pbijk ?? 1} Jiwa
            </span>
          </div>
        </div>

        {/* =========================================================================
            5. TABEL DAFTAR NOMINATIF PENERIMA HASIL SAW (LAMPIRAN RESMI)
            ========================================================================= */}
        <div className="official-letter-section" style={{ marginBottom: '26px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <h4 style={{ fontSize: '13.5px', fontWeight: '900', color: '#09291f', margin: 0 }}>
              Lampiran: Daftar Nominatif Hasil Perangkingan SAW &amp; Alokasi Program
            </h4>
            <span style={{ fontSize: '11.5px', color: '#64748b' }}>
              Snapshot Immutable: <code>{calculationRun.id}</code>
            </span>
          </div>

          <div className="table-responsive-container" style={{ overflowX: 'auto', width: '100%' }}>
            <table
              style={{
                width: '100%',
                minWidth: '680px',
                borderCollapse: 'collapse',
                fontSize: '12px',
                border: '1.5px solid #cbd5e1',
              }}
            >
              <thead>
                <tr style={{ backgroundColor: '#f1f5f9', color: '#0f172a', textTransform: 'uppercase', fontSize: '11px' }}>
                  <th style={{ padding: '9px 10px', border: '1px solid #cbd5e1', textAlign: 'center', width: '6%' }}>No</th>
                  <th style={{ padding: '9px 12px', border: '1px solid #cbd5e1', textAlign: 'left', width: '25%' }}>Nama Kepala Keluarga / Warga</th>
                  <th style={{ padding: '9px 10px', border: '1px solid #cbd5e1', textAlign: 'center', width: '15%' }}>NIK (Masked)</th>
                  <th style={{ padding: '9px 10px', border: '1px solid #cbd5e1', textAlign: 'center', width: '14%' }}>Desil DTKS</th>
                  <th style={{ padding: '9px 10px', border: '1px solid #cbd5e1', textAlign: 'right', width: '12%' }}>Nilai SAW (V)</th>
                  <th style={{ padding: '9px 10px', border: '1px solid #cbd5e1', textAlign: 'center', width: '15%' }}>Alokasi Program</th>
                  <th style={{ padding: '9px 10px', border: '1px solid #cbd5e1', textAlign: 'center', width: '13%' }}>Status Kuota</th>
                </tr>
              </thead>
              <tbody>
                {results.map((row, idx) => {
                  const cand = candidates.find((c) => c.id === row.candidateId)
                  const res = residents.find((r) => r.id === cand?.residentId)
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
                        <span
                          style={{
                            color: row.rank === 1 ? '#16765b' : row.rank === 2 ? '#0284c7' : '#9333ea',
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
        </div>

        {/* Klausul Penutup Surat */}
        <div
          className="official-letter-section"
          style={{
            fontSize: '12.5px',
            color: '#334155',
            lineHeight: 1.7,
            textAlign: 'justify',
            marginBottom: '32px',
          }}
        >
          <p style={{ margin: 0 }}>
            Demikian Berita Acara Penetapan dan Surat Rekomendasi Resmi ini dibuat dengan sebenar-benarnya dalam keadaan sehat walafiat, penuh tanggung jawab, serta tanpa paksaan dari pihak manapun untuk dipergunakan sebagai dasar sah pencairan dan distribusi bantuan sosial oleh instansi berwenang.
          </p>
        </div>

        {/* =========================================================================
            6. BLOK TANDA TANGAN RESMI TIGA PIHAK (RT, RW, DAN AUDITOR)
            ========================================================================= */}
        <div
          className="official-letter-section"
          style={{
            borderTop: '1px solid #e2e8f0',
            paddingTop: '20px',
            marginBottom: '28px',
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
                {/* Simulated Signature Line */}
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
                {/* Simulated Signature Line */}
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
                {/* Simulated Signature Line */}
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

        {/* =========================================================================
            7. PENGESAHAN AKHIR OLEH KEPALA DESA & SECURITY HASH
            ========================================================================= */}
        <div
          className="official-letter-section"
          style={{
            borderTop: '1px dashed #cbd5e1',
            paddingTop: '20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            flexWrap: 'wrap',
            gap: '16px',
          }}
        >
          {/* Keamanan Kriptografi Dokumen */}
          <div style={{ maxWidth: '400px' }}>
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
      </div>
    </div>
  )
}
