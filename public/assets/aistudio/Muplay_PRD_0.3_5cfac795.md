# Muplay — Product Requirements Document (PRD) 0.3

**Status:** Draft revisi berdasarkan arahan UI/UX terbaru

**Tanggal:** 29 Oktober 2026

**Tahap:** Web app untuk validasi UI/UX dan fungsi dasar → aplikasi native

**Penggunaan:** Pribadi; tidak dipasarkan

**Prinsip:** Offline-first, private-by-default, extreme brutalism, berbagi kode UI/domain, adapter audio/file per platform

> PRD ini menyatukan kebutuhan produk dan arahan desain terbaru. Framework, kompatibilitas audio, serta fitur yang membutuhkan validasi teknis tetap berstatus rekomendasi atau terbuka sampai diuji.

## 1. Ringkasan Produk

Muplay adalah pemutar musik offline pribadi dengan antarmuka **extreme brutalism**: gelap, tegas, misterius, penuh kontras, dan minim teks penjelas. Tahap pertama adalah web app untuk memvalidasi UI/UX serta playback dasar. Setelah fondasi itu stabil, kode UI dan logika domain akan digunakan kembali semaksimal mungkin untuk aplikasi Android/iOS. Audio engine, izin file, dan background playback dapat memakai implementasi khusus per platform.

Muplay tidak dirancang untuk layanan publik atau bisnis. Scope awal tidak membutuhkan akun, backend aplikasi, iklan, telemetri, sinkronisasi cloud, pembayaran, atau layanan streaming.

| Atribut | Keputusan |
|---|---|
| Nama | Muplay |
| Penggunaan | Pribadi; tidak dipasarkan |
| Tahap pertama | Web app untuk validasi UI/UX dan fungsi dasar |
| Tahap berikutnya | Android/iOS native setelah proof-of-concept |
| Sumber audio | File lokal; tidak ada streaming dalam scope saat ini |
| Visual | Extreme brutalism, dominan gelap dan misterius |
| Motion | Smooth dengan intensitas tinggi; tetap menghormati reduced-motion |
| Navigasi | Menu sidebar kiri; tidak ada bottom navigation |
| Metadata | Detail metadata audio ditampilkan di bawah artwork |
| Equalizer | Grafik 10 band responsif, bukan deretan slider |
| Library | Satu baris ringkas per lagu; tanpa carousel atau slider |
| Penyimpanan | Referensi file asli dan opsi salinan lokal |
| Privasi | Local-first; tidak mengunggah file atau metadata ke server |

## 2. Tujuan dan Prinsip Produk

### 2.1 Tujuan

1. Memutar musik lokal dengan kontrol yang jelas, responsif, dan andal.
2. Mengelola library, playlist kustom, antrean lagu, dan lirik lokal dalam satu aplikasi.
3. Menggunakan tampilan brutalist yang kuat tanpa memenuhi setiap komponen dengan penjelasan.
4. Menampilkan metadata sumber secara transparan, tanpa mengklaim bahwa metadata file membuktikan output Hi-Res.
5. Mengakomodasi koleksi musik dalam jumlah besar tanpa batas jumlah impor buatan aplikasi; batas nyata tetap berasal dari penyimpanan, memori, format, atau OS/browser.
6. Memprioritaskan berbagi kode UI dan logika domain tanpa memaksa audio engine web dan native menjadi identik.

### 2.2 Prinsip

- **Private by default:** tidak ada akun, analitik, telemetri, iklan, backend bisnis, atau cloud sync.
- **Offline-first:** musik, metadata, playlist, antrean, dan lirik diproses lokal.
- **Less copy, more signal:** label pendek; gunakan ikon dengan tooltip/accessible label bila perlu.
- **Brutalist by design:** grid keras, garis tegas, tipografi dominan, sudut tajam, komposisi asimetris terkontrol.
- **Motion with purpose:** gerak terasa kuat dan ekspresif, tetapi tidak menghambat kontrol atau keterbacaan.
- **Evidence over claims:** dukungan format dan pemrosesan audio hanya dinyatakan jika diuji.
- **No slider controls:** tidak ada slider scrubber, carousel slider, atau input slider generik dalam scope PRD ini.

## 3. Pengguna dan Batas Scope

### 3.1 Pengguna sasaran

Satu pengguna utama: pemilik koleksi musik lokal yang ingin memutar dan mengatur musik untuk penggunaan pribadi.

### 3.2 Skenario utama

1. Memilih banyak file musik atau folder yang didukung, lalu mengimpor semuanya tanpa batas jumlah buatan aplikasi.
2. Menemukan lagu melalui library satu-baris dan pencarian lokal.
3. Membuat playlist, memberi nama dan ikon, kemudian menambahkan atau menghapus lagu.
4. Memutar lagu dan melihat antrean lagu selanjutnya langsung pada layar Now Playing.
5. Membaca serta menyesuaikan sinkronisasi lirik lokal dari panel di samping artwork.
6. Melihat detail metadata audio di bawah artwork.
7. Mengatur EQ 10 band melalui grafik yang ukurannya menyesuaikan viewport.
8. Memilih referensi file asli atau salinan ke penyimpanan Muplay.

### 3.3 Non-goals

- Streaming, radio daring, katalog musik daring, login, multi-user, cloud sync, atau berbagi playlist.
- Monetisasi, iklan, pembayaran, atau langganan.
- Upload otomatis file, artwork, metadata, atau lirik ke layanan eksternal.
- Klaim bit-perfect atau output Hi-Res terverifikasi tanpa metode pengujian yang sesuai.
- Batas jumlah lagu buatan aplikasi; hanya batas teknis perangkat/platform yang berlaku.

## 4. Design System — Extreme Brutalism

### 4.1 Arah visual

- **Mood:** gelap, misterius, industrial, eksperimental, kontras tinggi.
- **Bentuk:** sudut persegi; radius 0–4 px hanya bila diperlukan. Hindari UI yang terlalu rounded, glass effects, soft neumorphism, dan gradient dekoratif.
- **Struktur:** garis tegas, border yang terlihat, grid tegas, komposisi asimetris yang tetap teratur, tipografi besar pada area penting.
- **Komponen:** satu komponen menyampaikan satu fungsi; jangan menambahkan paragraf deskriptif pada kartu/toolbar. Gunakan judul pendek, metadata inti, dan ikon.
- **Warna:** dark mode menjadi default dan identitas visual utama. Light mode tetap tersedia dengan struktur brutalist yang sama, bukan menjadi tema desain yang berbeda.

### 4.2 Palet warna awal

Palet ini merupakan draft token, dapat disempurnakan saat wireframe dan contrast testing.

| Token | Nilai awal | Penggunaan |
|---|---|---|
| `bg` | `#09090C` | Latar utama paling dominan |
| `surface` | `#13131A` | Panel/area kerja |
| `surface-raised` | `#1C1C26` | Panel terpilih atau overlay |
| `text-primary` | `#F0EFEA` | Teks utama |
| `text-muted` | `#A3A1AD` | Metadata sekunder |
| `border` | `#454450` | Garis pemisah dan outline |
| `accent` | `#D7FF3F` | Status aktif dan aksi utama |
| `accent-secondary` | `#9B72FF` | Aksen sekunder terbatas |
| `danger` | `#FF5A63` | Error/destructive state |

Jangan menggunakan semua aksen secara merata. Accent utama harus menjadi sinyal fungsional, bukan dekorasi di setiap elemen. Warna final wajib diuji untuk kontras teks, fokus keyboard, disabled state, dan status error.

### 4.3 Font

Gunakan tiga keluarga font untuk karakter brutalist yang konsisten:

1. **Archivo Black** — heading besar, nama track utama, nomor/penanda visual yang dominan.
2. **Space Grotesk** — label UI, navigasi, button, dan teks antarmuka.
3. **IBM Plex Mono** — metadata audio, frekuensi EQ, timestamp, angka teknis.

Aset font sebaiknya dibundel lokal dengan lisensi yang sesuai agar UI tidak bergantung pada layanan font daring dan tetap dapat digunakan offline. Sediakan fallback font sistem jika font utama tidak tersedia.

### 4.4 Aturan teks dan metadata

- Jangan menampilkan uraian panjang di setiap komponen.
- Gunakan label singkat dan hierarki tipografi; ikon interaktif tetap memiliki accessible name dan tooltip singkat bila dibutuhkan.
- Judul lagu/artis boleh dipotong dengan ellipsis jika ruang tidak cukup; jangan membungkus item library ke baris kedua.
- Detail metadata audio ditempatkan di bawah artwork, bukan tersebar sebagai keterangan pada seluruh layar.
- Informasi teknis tambahan hanya muncul di tempat yang relevan, misalnya detail track atau EQ.

## 5. Motion Design — Smooth & Extreme

### 5.1 Karakter gerak

Motion memiliki intensitas tinggi, sekitar **8/10**, tetapi tetap presisi dan tidak membuat pengguna kehilangan konteks. Extreme berarti transisi terasa tegas dan penuh energi — bukan animasi terus-menerus pada semua elemen.

### 5.2 Pola animasi

| Interaksi | Perilaku yang diharapkan |
|---|---|
| Berpindah menu | Panel keluar/masuk dengan translasi tegas, easing halus, tanpa menggeser layout secara acak |
| Membuka panel lirik | Artwork berpindah ke kanan; panel lirik masuk di sampingnya dengan transisi terkoordinasi |
| Menambah lagu ke queue | Baris baru masuk dengan gerak singkat; urutan tetap jelas |
| Berpindah track | Artwork dan metadata berubah dengan transisi tajam tetapi tidak menghambat kontrol |
| Mengubah EQ | Kurva grafik bergerak langsung mengikuti input; tidak ada animasi yang tertinggal dari nilai aktual |
| Hover/focus/press | Respons visual kuat, singkat, dan konsisten |

### 5.3 Motion budget dan aksesibilitas

- Target awal: micro-interaction 100–180 ms; transisi panel/layar 180–320 ms. Durasi dapat disesuaikan lewat pengujian.
- Gunakan easing yang tegas dan smooth; hindari bounce berlebihan yang menurunkan presisi kontrol.
- Jangan menganimasikan elemen dekoratif tanpa tujuan.
- `prefers-reduced-motion: reduce` harus mengganti translasi besar dengan fade/instant state dan mengurangi durasi secara signifikan.
- Animasi tidak boleh menunda play/pause, perubahan queue, atau respons kontrol utama.

## 6. Information Architecture dan Navigasi

### 6.1 Sidebar kiri

Semua navigasi utama berada di sidebar kiri. Tidak ada bottom navigation.

| Menu | Isi |
|---|---|
| Library | Semua lagu, pencarian, sumber/file, dan akses impor |
| Playlists | Daftar playlist kustom dan pembuatan playlist baru |
| Now Playing | Artwork, metadata, kontrol playback, panel lirik, dan antrean lagu berikutnya |
| Equalizer | Grafik EQ 10 band, preset bila ada, dan reset |
| Settings | Tema, mode penyimpanan, preferensi playback, dan informasi aplikasi yang ringkas |

Lyrics tidak memerlukan halaman navigasi terpisah dalam MVP; panel lirik dibuka dari layar Now Playing. Detail file/format dapat dibuka dari metadata di bawah artwork.

### 6.2 Footer dan strip playlist

Tidak ada footer halaman konvensional, footer berisi tautan, atau footer navigasi. Satu pengecualian visual yang diminta adalah strip kecil di bagian bawah yang **hanya menampilkan ikon dan nama playlist aktif yang sedang diputar**. Tidak boleh ada tautan, deskripsi, menu sekunder, atau komponen promosi di area tersebut.

Kontrol playback utama tetap berada di layar Now Playing. Implementasi strip bawah harus tetap ringkas dan tidak mengambil ruang berlebihan dari konten. Jika strip ini berkonflik dengan target tinggi layar mobile, wireframe harus memprioritaskan artwork, queue, dan kontrol playback; perilaku adaptif final divalidasi sebelum coding.

## 7. Now Playing — Struktur Layar Utama

### 7.1 Komposisi desktop

- Area artwork menjadi fokus utama.
- Detail metadata audio ditampilkan tepat di bawah gambar/artwork.
- Ketika mode lirik dibuka, artwork bergerak ke sisi kanan dan panel lirik tampil di sampingnya.
- Ada tombol kecil mengambang di dekat artwork untuk membuka/menutup panel lirik.
- Antrean lagu selanjutnya terlihat langsung pada layar pemutar; bukan tersembunyi hanya di halaman atau drawer terpisah.
- Kontrol playback berada di layar ini. Tidak menggunakan slider seek.

### 7.2 Komposisi mobile

- Layout menyesuaikan ukuran viewport secara otomatis.
- Artwork tetap terlihat saat panel lirik dibuka; artwork dapat menyusut agar lirik tetap berada di sampingnya.
- Gunakan ukuran dan jarak yang cukup untuk lirik; teks boleh wrap pada panel lirik, tetapi item library tidak boleh wrap.
- Queue tetap menjadi bagian dari layar Now Playing, ditampilkan setelah area artwork/kontrol bila tinggi layar terbatas.
- Sidebar berubah menjadi panel navigasi yang dapat dibuka dari tombol menu; tidak membuat bottom navigation.

### 7.3 Metadata di bawah artwork

Metadata yang ditampilkan adalah data sumber yang tersedia, misalnya:

- Codec/container atau format (MP3, FLAC, WAV, AAC, dan format lain jika didukung).
- Sample rate dan bit depth jika benar-benar berhasil dibaca.
- Bitrate jika relevan dan tersedia.
- Durasi, ukuran file, serta informasi channel bila tersedia.

Metadata disajikan ringkas dengan IBM Plex Mono dan dipisahkan secara visual dari judul/artis. Jika data tidak tersedia, sembunyikan field tersebut atau tampilkan tanda kosong yang ringkas; jangan mengarang nilai. Metadata sumber tidak boleh dinyatakan sebagai bukti output aktual atau bit-perfect.

### 7.4 Seeking tanpa slider

Tidak ada slider scrubber atau control bar yang dapat digeser. Untuk menjaga kemampuan mencari posisi lagu, gunakan kontrol langkah seperti **−10 s** dan **+10 s**, timestamp saat ini/total, serta pintasan keyboard yang sesuai di web. Garis progres boleh ditampilkan sebagai indikator statis non-interaktif jika dibutuhkan; garis itu tidak boleh berperilaku seperti slider.

## 8. Library Lagu

### 8.1 Satu baris, satu komponen

Setiap lagu ditampilkan dalam satu komponen baris horizontal. Informasi tidak ditata sebagai beberapa kartu bertumpuk.

Urutan konten yang disarankan: artwork kecil/ikon file → judul → artis/album ringkas → durasi atau format → aksi kontekstual. Jumlah kolom dapat dipangkas pada layar sempit, tetapi setiap item tetap satu baris dan tidak menimbulkan horizontal scrolling.

### 8.2 Aturan library

- Satu track = satu row component.
- Judul/artis dipotong dengan ellipsis bila panjang; tidak wrap ke baris berikutnya.
- Tanpa carousel, card slider, atau horizontal slider untuk menelusuri lagu.
- Pencarian lokal, sort dasar, dan pemilihan track tersedia.
- Tambah ke playlist dan Tambah ke queue tersedia melalui aksi ringkas pada row/menu konteks.
- Track tidak dihapus dari library hanya karena dikeluarkan dari playlist.
- Pada layar kecil, kolom sekunder dapat disembunyikan secara responsif tanpa mengubah item menjadi dua baris.

## 9. Playlist Kustom dan Queue

### 9.1 Playlist

Pengguna dapat:

- Membuat playlist baru.
- Memberi dan mengubah nama playlist.
- Memilih ikon untuk mewakili playlist dari icon set lokal yang konsisten; dukungan emoji dapat dipertimbangkan saat implementasi.
- Mengganti ikon, menambah/menghapus lagu, dan menghapus playlist dengan konfirmasi.
- Menambahkan lagu dari Library atau dari layar Now Playing ke playlist.

Nama playlist tidak harus unik, namun UI sebaiknya membedakan playlist dengan ikon dan metadata lokal. Menghapus playlist tidak boleh menghapus file musik asli atau track dari library.

### 9.2 Queue pada layar pemutar

- Queue yang akan diputar selanjutnya tampil langsung pada layar Now Playing.
- Pengguna dapat menambahkan lagu dari library atau playlist ke akhir queue tanpa mengganti lagu aktif.
- Pengguna dapat menghapus item, mengubah urutan, atau memilih item untuk diputar berikutnya.
- Item queue harus memiliki ID sendiri agar track yang sama dapat muncul lebih dari sekali.
- Queue aktif tidak identik dengan playlist sumber. Penambahan lagu di luar playlist tidak boleh mengubah playlist sumber secara diam-diam.
- Tampilan queue ringkas, satu baris per lagu, tanpa slider.

## 10. Equalizer — Grafik 10 Band

### 10.1 Bentuk dan frekuensi

Equalizer ditampilkan sebagai satu grafik dengan 10 band, bukan sepuluh slider terpisah. Frekuensi pusat awal yang diusulkan:

**31 Hz · 62 Hz · 125 Hz · 250 Hz · 500 Hz · 1 kHz · 2 kHz · 4 kHz · 8 kHz · 16 kHz**

Frekuensi pusat ini merupakan konfigurasi rancangan yang umum dan masih harus diverifikasi terhadap implementasi EQ serta target audio engine.

### 10.2 Interaksi grafik

- Setiap band diwakili titik/node pada grafik respons frekuensi.
- Pengguna mengubah gain dengan memindahkan node secara langsung pada grafik; tidak ada slider linear di bawah/atas grafik.
- Tampilkan nilai gain per band saat node dipilih/fokus, bukan label panjang yang terus-menerus memenuhi layar.
- Sediakan aksi reset dan preset bernama jika preset diimplementasikan.
- Batas gain, step, frekuensi, dan algoritma filter dikunci saat audio engine dipilih.
- Grafik hanya boleh menunjukkan perubahan audio sebagai aktif jika audio processing node/engine benar-benar terhubung pada playback.

### 10.3 Responsivitas otomatis

- Grafik menggunakan lebar container, bukan ukuran piksel tetap.
- Ukuran plot, label, gap antar-node, dan tick frekuensi menyesuaikan mode desktop/mobile dan perubahan ukuran jendela.
- Gunakan ResizeObserver atau mekanisme responsif setara; hitung ulang layout setelah perubahan viewport/orientasi.
- Label boleh diringkas pada mobile, tetapi kesepuluh band tetap dapat dipilih tanpa saling menimpa.
- Tidak boleh ada horizontal overflow pada lebar 320 px.
- Interaksi grafis harus memiliki alternatif keyboard/accessibility untuk memilih band dan mengubah gain langkah demi langkah.

### 10.4 Batas teknis

Equalizer web memerlukan proof-of-concept dengan Web Audio API dan file uji. Audio bypass dan equalized playback harus dapat dibedakan dalam test. Dukungan native dapat menggunakan adapter audio berbeda. Apabila implementasi tidak benar-benar memengaruhi output, EQ harus dinonaktifkan atau ditandai belum tersedia, bukan memberikan ilusi kontrol.

## 11. Lirik Lokal dan Sinkronisasi

### 11.1 Format awal

- `.lrc`: lirik bertimestamp, disinkronkan dengan posisi playback.
- `.txt`: lirik teks biasa tanpa sinkronisasi waktu.
- Pencocokan awal berdasarkan nama file/track; pengguna dapat memasangkan berkas secara manual.

### 11.2 Panel lirik di samping artwork

- Tombol kecil mengambang di dekat artwork membuka/menutup panel lirik.
- Ketika dibuka, artwork berpindah ke kanan; panel lirik muncul di sampingnya.
- Baris lirik aktif mengikuti playback untuk `.lrc`.
- Penyesuaian sync dilakukan langsung di panel lirik, bukan di Settings terpisah.
- Pengguna dapat mempercepat atau memperlambat offset dengan tombol langkah, misalnya −100 ms/+100 ms, serta reset. Nilai langkah final dapat disesuaikan saat test.
- Tidak ada slider untuk offset lirik.
- Offset dapat disimpan per track/lirik pair secara lokal.
- `.txt` ditampilkan tanpa indikator sinkronisasi.
- Tidak mengunduh lirik dari internet.

### 11.3 Error handling

Jika lirik tidak ditemukan, timestamp rusak, atau file tidak cocok, tampilkan status yang singkat dan tindakan berikutnya. Kegagalan lirik tidak boleh menghentikan pemutaran.

## 12. Import dan Penyimpanan Musik

### 12.1 Impor tanpa batas jumlah buatan aplikasi

Muplay tidak menetapkan batas jumlah lagu yang boleh dipilih atau dimasukkan ke library. Import batch harus mendukung jumlah besar dan memprosesnya secara bertahap agar UI tidak membeku.

Batas perangkat/browser tetap berlaku pada kapasitas penyimpanan, memori, akses file, durasi parsing, atau ukuran file. PRD tidak menjanjikan penyimpanan tak terbatas secara fisik.

- Tampilkan progres dan jumlah berhasil/gagal saat import besar, tanpa teks penjelas berlebihan.
- Deduplikasi dilakukan berdasarkan fingerprint/identitas file yang tersedia, bukan hanya judul lagu.
- Sediakan pilihan mengabaikan duplikat atau menambahkan salinan sebagai track terpisah bila perilaku itu memang diperlukan.
- Proses parsing metadata secara bertahap; jangan memuat seluruh file besar ke memori sekaligus jika dapat dihindari.
- Kegagalan satu file tidak boleh membatalkan semua file lain.

### 12.2 Dua mode penyimpanan

**Mode A — Referensi file asli:** Muplay menyimpan referensi/izin yang tersedia ke file di lokasi asal. Referensi dapat perlu dipilih ulang sesuai kemampuan platform.

**Mode B — Salinan lokal:** pengguna memilih menyalin file ke penyimpanan aplikasi. Muplay harus memperlihatkan konsekuensi kapasitas, progres salin, dan kegagalan dengan jelas.

### 12.3 Aturan keselamatan data

- Jangan menghapus, mengubah, atau memindahkan file asli tanpa tindakan eksplisit.
- Jika referensi file hilang, sediakan aksi relink/pilih ulang.
- Jika storage tidak cukup, hentikan salin secara aman dan pertahankan metadata yang sudah ada.
- Data library, playlist, queue, lirik, dan preferensi disimpan lokal sesuai kemampuan platform.
- Penghapusan data browser dapat menghapus metadata atau file salinan; jangan mengklaim backup otomatis.

## 13. Persyaratan Fungsional

| ID | Persyaratan | Prioritas |
|---|---|---|
| FR-01 | Pilih/import file audio lokal dalam batch tanpa batas jumlah buatan aplikasi. | P0 |
| FR-02 | Pemrosesan import berjalan bertahap dengan status berhasil/gagal dan tanpa memblokir UI secara berlebihan. | P0 |
| FR-03 | Tampilkan library sebagai satu row satu baris per track. | P0 |
| FR-04 | Sediakan pencarian metadata lokal. | P0 |
| FR-05 | Playback mendukung play/pause, previous/next, indikator progres, dan seek via tombol langkah tanpa slider. | P0 |
| FR-06 | Queue tampil langsung pada layar Now Playing dan mendukung add/remove/reorder/play-next. | P0 |
| FR-07 | Playlist dapat dibuat, diubah namanya, diberi ikon, diubah ikonnya, dan dikelola secara lokal. | P0 |
| FR-08 | Detail metadata sumber ditampilkan di bawah artwork. | P0 |
| FR-09 | Panel lirik lokal muncul di samping artwork; artwork bergerak ke kanan saat panel dibuka. | P1 |
| FR-10 | Lirik `.lrc` mengikuti timestamp dan mendukung offset adjustment langsung di panel lirik; `.txt` ditampilkan tanpa sinkronisasi. | P1 |
| FR-11 | EQ memiliki 10 band yang berinteraksi sebagai grafik, bukan slider, dan ukurannya responsif. | P1/validasi audio |
| FR-12 | Sidebar kiri menjadi navigasi utama; tidak ada bottom navigation atau footer konvensional. | P0 |
| FR-13 | Strip bawah, bila dipakai, hanya menampilkan ikon dan nama playlist aktif. | P1 UX |
| FR-14 | Tema dominan gelap tersedia; Light Mode tetap didukung. | P0 |
| FR-15 | Gerakan UI smooth dan intens, dengan reduced-motion fallback. | P0 UX |
| FR-16 | Pengguna dapat memilih referensi file asli atau salinan lokal. | P1 |
| FR-17 | Aplikasi tidak mengunggah file, metadata, atau lirik secara otomatis. | P0 privacy |
| FR-18 | Error file rusak/tidak didukung, izin, dan penyimpanan memiliki pesan ringkas serta actionable. | P0 |

## 14. Batasan Teknis per Platform dan Arsitektur

### 14.1 Rekomendasi arsitektur

React + TypeScript + Vite untuk web dan Capacitor sebagai kandidat native tetap menjadi rekomendasi awal, belum keputusan final. Shared core mencakup model track, queue, playlist, asosiasi lirik, preferensi, dan state UI. File access, local storage, playback, background media, serta audio route disediakan melalui adapter platform.

### 14.2 Platform capability matrix

| Kapabilitas | Web | Android native | iOS native |
|---|---|---|---|
| Pilih file | File picker; folder bergantung API/browser | API pemilih file/URI sistem | Document picker dan akses berizin |
| Persistensi file | Bergantung browser, handle, izin, storage quota | Bergantung URI/izin dan file sistem | Bergantung URL/izin dan file sistem |
| Format audio | Bergantung browser/OS | Bergantung decoder/player/OS | Bergantung decoder/player/OS |
| Background | Tidak dijamin jika tab ditangguhkan/ditutup | Butuh media service/session sesuai platform | Butuh audio session/background mode sesuai platform |
| EQ | Web Audio API bila jalur playback mendukung | Audio engine/efek yang tersedia | Audio engine/jalur pemrosesan |
| Gapless | Uji per browser/format | Uji per engine/decoder | Uji per engine/decoder |
| Output Hi-Res | Metadata sumber tidak menjamin output | Di luar target awal tanpa validasi khusus | Di luar target awal tanpa validasi khusus |

### 14.3 Aturan berbagi kode

- UI dan design tokens berbagi sebanyak mungkin.
- Queue, playlist, data model, validasi, dan state domain platform-agnostic.
- Audio engine tidak dipaksa identik lintas platform.
- Fitur native harus punya proof-of-concept dan test di perangkat fisik.
- Build web harus dapat dijalankan dan diuji terpisah dari native.

## 15. Persyaratan Non-Fungsional

| Area | Persyaratan |
|---|---|
| Privasi | Tidak ada akun, telemetry, iklan, cloud sync, atau upload otomatis. |
| Keandalan | File rusak, metadata kosong, izin gagal, atau storage penuh tidak menyebabkan crash tak tertangani. |
| Kinerja | Import besar diproses bertahap; library responsif untuk fixture jumlah besar yang ditentukan saat test. |
| Responsive | 320 px, 390 px, tablet, desktop; tanpa horizontal overflow yang tak disengaja. |
| Aksesibilitas | Kontras memadai, keyboard navigation, accessible labels, EQ graph dapat dioperasikan dengan keyboard. |
| Motion | Mengikuti prefers-reduced-motion dan tidak menunda kontrol playback. |
| Pemeliharaan | TypeScript strict jika framework tersebut dipilih, lint/typecheck, modular adapter, automated tests. |
| Transparansi | Tidak mengklaim codec/output/Hi-Res/gapless/EQ didukung sebelum diuji. |

## 16. Acceptance Criteria

| ID | Kriteria lulus | Gerbang |
|---|---|---|
| AC-01 | Batch import menerima jumlah file tanpa batas aplikasi buatan; setiap file diproses atau dilaporkan gagal secara individual. | MVP |
| AC-02 | Import skala besar tidak memblokir interaksi UI secara berkepanjangan dan menunjukkan progres ringkas. | MVP |
| AC-03 | Setiap track tampil satu baris, tidak wrap, tidak membuat horizontal scroll, dan tidak memakai carousel/slider. | MVP UX |
| AC-04 | Playback dasar bekerja pada file uji yang didukung; seek dilakukan dengan tombol langkah, tidak ada slider scrubber. | P0 |
| AC-05 | Queue terlihat langsung di layar Now Playing dan add/remove/reorder/play-next bekerja. | P0 |
| AC-06 | Playlist bisa dibuat, diganti nama, diberi ikon, dan diubah ikonnya; penghapusan playlist tidak menghapus file asli. | MVP |
| AC-07 | Metadata audio yang terbaca tampil di bawah artwork; field yang tidak tersedia tidak diada-adakan. | MVP |
| AC-08 | Membuka panel lirik memindahkan artwork ke kanan dan menampilkan lirik di sampingnya; perilaku responsif diverifikasi di desktop/mobile. | MVP UX |
| AC-09 | `.lrc` mengikuti playback dengan target toleransi ±500 ms pada fixture pengujian; offset diubah lewat tombol, disimpan lokal, dan dapat di-reset. | MVP lyrics |
| AC-10 | EQ memiliki tepat 10 band; ukuran grafik dan label menyesuaikan ukuran viewport; node dapat dioperasikan dengan pointer dan keyboard. | P1/proof-of-concept |
| AC-11 | EQ hanya dinyatakan aktif jika perubahan grafik benar-benar mengubah pemrosesan audio pada konfigurasi uji. | P1 audio |
| AC-12 | Sidebar kiri berisi navigasi utama; tidak ada bottom nav/footer konvensional; strip bawah hanya menunjukkan playlist aktif jika ditampilkan. | MVP UX |
| AC-13 | Light/Dark Mode mencakup library, Now Playing, EQ, lirik, playlist, dialog, dan error states. | MVP UX |
| AC-14 | Motion utama smooth/intens namun tidak menunda kontrol; reduced-motion mengurangi gerak secara nyata. | MVP UX |
| AC-15 | Referensi file asli dan salinan lokal dibedakan; file hilang/storage penuh ditangani tanpa menghapus data lain. | MVP storage |
| AC-16 | Tidak ada upload otomatis file/audio metadata/lirik, akun, atau telemetri di build awal. | Privacy |
| AC-17 | Tidak ada kegagalan pada tes kritis playback/queue; format yang didukung dibatasi pada kombinasi yang benar-benar diuji. | Release gate |

## 17. Rencana Pengujian

1. **UI/UX:** audit sidebar, layout extreme brutalist, hierarki teks minim, posisi metadata di bawah artwork, layout lirik samping, queue di Now Playing, playlist strip, Light/Dark Mode.
2. **Responsive:** 320 px, 390 px, tablet, desktop; uji resize/orientasi dan EQ auto layout; pastikan library satu baris dan tidak horizontal overflow.
3. **Motion:** track/perubahan panel, open/close lyrics, add queue, focus/press; pastikan gerakan halus, terasa tegas, dan reduced-motion bekerja.
4. **Unit test:** queue operations, playlist CRUD, custom name/icon, metadata fallback, lyrics offset, import state, deduplication, preferences.
5. **Integration test:** import banyak file, playback, seek via buttons, queue mutation while playing, playlist assignment, lyric sync, relink file, copy storage.
6. **EQ test:** 10 band tepat, node interaction pointer/keyboard, resize; band changes must alter actual processed audio for supported test setup.
7. **Storage test:** akses file hilang, izin dicabut, storage penuh, salinan gagal sebagian, data browser dihapus.
8. **Audio compatibility:** MP3, AAC/M4A, FLAC, WAV as candidate fixtures; record browser/OS/device/results. This is a test list, not a blanket compatibility promise.
9. **Native test:** saat fase native tersedia, uji background, lock-screen, headset, interruption, output route, gapless di perangkat fisik.
10. **Regression/release gate:** 100% tes kritis playback dan queue lulus; tidak ada blocker; klaim format/EQ/gapless harus terikat ke hasil dan perangkat yang diuji.

## 18. Roadmap

| Fase | Hasil | Definition of Done |
|---|---|---|
| F0 — Wireframe | Layout extreme brutalist, sidebar, Now Playing, library row, EQ graph, lyric panel, active playlist strip | Semua requirement visual terpetakan; review desktop/mobile |
| F1 — Fondasi web | App shell, design tokens, fonts, motion tokens, domain models | Build lokal, lint/typecheck dan unit tests lulus |
| F2 — Core playback | Import, library, search, playback, queue | AC-01–AC-05 lulus pada browser target |
| F3 — Playlist & lyrics | Playlist kustom, ikon, LRC/TXT, offset sync, metadata bawah artwork | AC-06–AC-09 lulus |
| F4 — EQ & polish | EQ grafis 10 band jika proof-of-concept lulus, responsive layout, motion/reduced motion | AC-10–AC-14 lulus untuk feature yang aktif |
| F5 — Storage & privacy | File reference/copy, error states, private/offline review | AC-15–AC-16 lulus |
| F6 — Native proof-of-concept | Kandidat runtime/native audio, background playback | Hasil uji perangkat fisik; arsitektur final diputuskan |
| F7 — Native roadmap | Native library, media controls, EQ/gapless jika feasible | Acceptance criteria dan test khusus per fitur |

## 19. Risiko dan Mitigasi

| Risiko | Mitigasi |
|---|---|
| Extreme motion mengganggu penggunaan | Batasi durasi, gunakan gerak yang bermakna, hormati reduced motion, uji dengan penggunaan nyata. |
| Metadata banyak membuat layout penuh | Detail metadata hanya di bawah artwork; gunakan field ringkas dan sembunyikan field kosong. |
| Import besar membebani browser | Proses batch secara bertahap, worker jika layak, deduplikasi, dan status ringkas. |
| Browser tak memberi akses folder permanen | Sediakan file picker fallback dan alur relink. |
| EQ terlihat bekerja tetapi tidak mengubah audio | Validasi graph/audio pipeline dengan fixture; nonaktifkan EQ bila jalur pemrosesan tidak terbukti. |
| Seek tanpa slider kurang cepat | Tombol langkah dan keyboard shortcut; evaluasi usability sebelum mengunci desain. |
| Footer strip bertentangan dengan kebutuhan layar kecil | Jaga hanya nama/ikon playlist aktif; adaptasikan atau sembunyikan ketika ruang kritis berdasarkan hasil wireframe. |
| Sharing terlalu agresif menghambat audio native | UI/domain shared, audio engine dan file adapter dipisahkan per platform. |
| Klaim Hi-Res berlebihan | Bedakan metadata sumber dari kemampuan decoder/output dan batasi klaim pada hasil pengujian. |

## 20. Keputusan Terbuka

| Topik | Status | Cara menetapkan |
|---|---|---|
| Framework final | React + TypeScript + Vite dan Capacitor adalah kandidat, belum dikunci. | Proof-of-concept web/native, khususnya file access, audio, background. |
| Native priority | Android/iOS adalah arah berikutnya; urutan perangkat belum dipilih. | Pilih berdasarkan perangkat uji dan prioritas pribadi. |
| Format audio final | MP3, AAC/M4A, FLAC, WAV adalah kandidat uji awal. | Matriks browser/OS/engine nyata. |
| EQ gain range/filter type | Belum dikunci. | Tentukan bersama engine setelah proof-of-concept. |
| Playlist icon set | Kandidat icon pack lokal; perlu dipilih. | Wireframe dan uji tampilan. |
| Penyimpanan copy web | IndexedDB/OPFS atau alternatif yang kompatibel. | Uji kapasitas, persistensi dan file besar. |
| Strip playlist bawah | Ada sebagai pengecualian minimal; respons mobile divalidasi saat wireframe. | Uji ruang layar dan hierarki. |
| Gapless/native output | Roadmap, bukan jaminan MVP. | Validasi decoder/engine dan fixture audio. |
| Hi-Res/bit-perfect | Tidak masuk target awal. | Tambahkan hanya bila kebutuhan dan metode verifikasi ditentukan. |

## 21. Referensi Teknis

Referensi ini membantu memahami kandidat arsitektur dan batasan platform. Kapabilitas tetap wajib diverifikasi pada toolchain, browser, OS, dan perangkat yang benar-benar digunakan.

- Capacitor: https://capacitorjs.com/docs
- Capacitor plugins: https://capacitorjs.com/docs/plugins
- MDN File System API: https://developer.mozilla.org/en-US/docs/Web/API/File_System_API
- Android Media3 background playback: https://developer.android.com/media/media3/session/background-playback
- Apple media playback configuration: https://developer.apple.com/documentation/avfoundation/configuring-your-app-for-media-playback
- Apple AVAudioSession: https://developer.apple.com/documentation/avfaudio/avaudiosession

---

**Status dokumen:** PRD 0.3 memperbarui arah UI/UX dan interaksi berdasarkan arahan terbaru. Isi teknis yang belum dibuktikan tetap ditandai sebagai kandidat atau keputusan terbuka. Dokumen ini tidak menyatakan bahwa aplikasi telah diimplementasikan atau diuji.
