import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("rt_management.db");

// Initialize database
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT,
    full_name TEXT,
    email TEXT,
    phone TEXT,
    address TEXT,
    role TEXT DEFAULT 'admin',
    photo_url TEXT
  );

  CREATE TABLE IF NOT EXISTS warga (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nama TEXT,
    nik TEXT UNIQUE,
    kk_id INTEGER,
    jenis_kelamin TEXT,
    tempat_lahir TEXT,
    tanggal_lahir TEXT,
    agama TEXT,
    pekerjaan TEXT,
    status_warga TEXT DEFAULT 'aktif' -- 'aktif', 'meninggal', 'pindah'
  );

  CREATE TABLE IF NOT EXISTS kartu_keluarga (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nomor_kk TEXT UNIQUE,
    kepala_keluarga TEXT,
    alamat TEXT,
    rt_rw TEXT
  );

  CREATE TABLE IF NOT EXISTS kas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tanggal TEXT,
    keterangan TEXT,
    jumlah INTEGER,
    tipe TEXT -- 'masuk' or 'keluar'
  );

  CREATE TABLE IF NOT EXISTS surat (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nomor_surat TEXT,
    jenis_surat TEXT,
    warga_id INTEGER,
    tanggal TEXT,
    keperluan TEXT
  );

  CREATE TABLE IF NOT EXISTS peristiwa (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    warga_id INTEGER,
    jenis_peristiwa TEXT, -- 'kelahiran', 'kematian'
    tanggal TEXT,
    keterangan TEXT
  );

  CREATE TABLE IF NOT EXISTS iuran (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    warga_id INTEGER,
    bulan TEXT,
    tahun TEXT,
    jumlah INTEGER,
    tanggal_bayar TEXT,
    status TEXT DEFAULT 'lunas'
  );

  CREATE TABLE IF NOT EXISTS pengaturan (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    nama_desa TEXT,
    rt TEXT,
    rw TEXT,
    kecamatan TEXT,
    kota TEXT,
    logo_url TEXT
  );

  -- Insert default settings if not exists
  INSERT OR IGNORE INTO pengaturan (id, nama_desa, rt, rw, kecamatan, kota) 
  VALUES (1, 'Desa Sukamaju', '001', '001', 'Kecamatan Ceria', 'Kota Bahagia');
`);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));

  // Auth API
  app.post("/api/auth/register", (req, res) => {
    const { username, password, full_name, email, phone } = req.body;
    try {
      const stmt = db.prepare("INSERT INTO users (username, password, full_name, email, phone) VALUES (?, ?, ?, ?, ?)");
      stmt.run(username, password, full_name, email, phone);
      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ error: "Username already exists" });
    }
  });

  app.post("/api/auth/login", (req, res) => {
    const { username, password } = req.body;
    const user = db.prepare("SELECT * FROM users WHERE username = ? AND password = ?").get(username, password);
    if (user) {
      res.json({ success: true, user: { 
        id: user.id, 
        username: user.username, 
        full_name: user.full_name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        photo_url: user.photo_url 
      } });
    } else {
      res.status(401).json({ error: "Invalid credentials" });
    }
  });

  app.post("/api/auth/update-profile", (req, res) => {
    const { id, full_name, email, phone, address, photo_url } = req.body;
    db.prepare(`
      UPDATE users 
      SET full_name = ?, email = ?, phone = ?, address = ?, photo_url = ? 
      WHERE id = ?
    `).run(full_name, email, phone, address, photo_url, id);
    res.json({ success: true });
  });

  // Dashboard Stats
  app.get("/api/stats", (req, res) => {
    const totalWarga = db.prepare("SELECT COUNT(*) as count FROM warga WHERE status_warga = 'aktif'").get().count;
    const totalKK = db.prepare("SELECT COUNT(*) as count FROM kartu_keluarga").get().count;
    const totalSurat = db.prepare("SELECT COUNT(*) as count FROM surat").get().count;
    const wargaAktif = db.prepare("SELECT COUNT(*) as count FROM warga WHERE status_warga = 'aktif'").get().count;
    
    const kasMasuk = db.prepare("SELECT SUM(jumlah) as total FROM kas WHERE tipe = 'masuk'").get().total || 0;
    const kasKeluar = db.prepare("SELECT SUM(jumlah) as total FROM kas WHERE tipe = 'keluar'").get().total || 0;
    const saldo = kasMasuk - kasKeluar;

    res.json({ totalWarga, totalKK, totalSurat, wargaAktif, saldo });
  });

  // Warga API
  app.get("/api/warga", (req, res) => {
    const data = db.prepare("SELECT * FROM warga").all();
    res.json(data);
  });

  app.post("/api/warga", (req, res) => {
    const { nama, nik, kk_id, jenis_kelamin, tempat_lahir, tanggal_lahir, agama, pekerjaan } = req.body;
    const stmt = db.prepare(`
      INSERT INTO warga (nama, nik, kk_id, jenis_kelamin, tempat_lahir, tanggal_lahir, agama, pekerjaan)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(nama, nik, kk_id, jenis_kelamin, tempat_lahir, tanggal_lahir, agama, pekerjaan);
    res.json({ success: true });
  });

  app.put("/api/warga/:id", (req, res) => {
    const { id } = req.params;
    const { nama, nik, kk_id, jenis_kelamin, tempat_lahir, tanggal_lahir, agama, pekerjaan, status_warga } = req.body;
    db.prepare(`
      UPDATE warga 
      SET nama = ?, nik = ?, kk_id = ?, jenis_kelamin = ?, tempat_lahir = ?, tanggal_lahir = ?, agama = ?, pekerjaan = ?, status_warga = ?
      WHERE id = ?
    `).run(nama, nik, kk_id, jenis_kelamin, tempat_lahir, tanggal_lahir, agama, pekerjaan, status_warga, id);
    res.json({ success: true });
  });

  app.delete("/api/warga/:id", (req, res) => {
    const { id } = req.params;
    db.prepare("DELETE FROM warga WHERE id = ?").run(id);
    res.json({ success: true });
  });

  // KK API
  app.get("/api/kk", (req, res) => {
    const data = db.prepare("SELECT * FROM kartu_keluarga").all();
    res.json(data);
  });

  app.post("/api/kk", (req, res) => {
    const { nomor_kk, kepala_keluarga, alamat, rt_rw } = req.body;
    const stmt = db.prepare("INSERT INTO kartu_keluarga (nomor_kk, kepala_keluarga, alamat, rt_rw) VALUES (?, ?, ?, ?)");
    stmt.run(nomor_kk, kepala_keluarga, alamat, rt_rw);
    res.json({ success: true });
  });

  app.put("/api/kk/:id", (req, res) => {
    const { id } = req.params;
    const { nomor_kk, kepala_keluarga, alamat, rt_rw } = req.body;
    db.prepare(`
      UPDATE kartu_keluarga 
      SET nomor_kk = ?, kepala_keluarga = ?, alamat = ?, rt_rw = ?
      WHERE id = ?
    `).run(nomor_kk, kepala_keluarga, alamat, rt_rw, id);
    res.json({ success: true });
  });

  app.delete("/api/kk/:id", (req, res) => {
    const { id } = req.params;
    db.prepare("DELETE FROM kartu_keluarga WHERE id = ?").run(id);
    res.json({ success: true });
  });

  // Kas API
  app.get("/api/kas", (req, res) => {
    const data = db.prepare("SELECT * FROM kas ORDER BY tanggal DESC").all();
    res.json(data);
  });

  app.post("/api/kas", (req, res) => {
    const { tanggal, keterangan, jumlah, tipe } = req.body;
    const stmt = db.prepare("INSERT INTO kas (tanggal, keterangan, jumlah, tipe) VALUES (?, ?, ?, ?)");
    stmt.run(tanggal, keterangan, jumlah, tipe);
    res.json({ success: true });
  });

  app.put("/api/kas/:id", (req, res) => {
    const { id } = req.params;
    const { tanggal, keterangan, jumlah, tipe } = req.body;
    db.prepare(`
      UPDATE kas 
      SET tanggal = ?, keterangan = ?, jumlah = ?, tipe = ?
      WHERE id = ?
    `).run(tanggal, keterangan, jumlah, tipe, id);
    res.json({ success: true });
  });

  app.delete("/api/kas/:id", (req, res) => {
    const { id } = req.params;
    db.prepare("DELETE FROM kas WHERE id = ?").run(id);
    res.json({ success: true });
  });

  // Surat API
  app.get("/api/surat", (req, res) => {
    const data = db.prepare(`
      SELECT s.*, w.nama as nama_warga 
      FROM surat s 
      JOIN warga w ON s.warga_id = w.id 
      ORDER BY s.tanggal DESC
    `).all();
    res.json(data);
  });

  app.post("/api/surat", (req, res) => {
    const { nomor_surat, jenis_surat, warga_id, tanggal, keperluan } = req.body;
    const stmt = db.prepare("INSERT INTO surat (nomor_surat, jenis_surat, warga_id, tanggal, keperluan) VALUES (?, ?, ?, ?, ?)");
    stmt.run(nomor_surat, jenis_surat, warga_id, tanggal, keperluan);
    res.json({ success: true });
  });

  app.put("/api/surat/:id", (req, res) => {
    const { id } = req.params;
    const { nomor_surat, jenis_surat, warga_id, tanggal, keperluan } = req.body;
    db.prepare(`
      UPDATE surat 
      SET nomor_surat = ?, jenis_surat = ?, warga_id = ?, tanggal = ?, keperluan = ?
      WHERE id = ?
    `).run(nomor_surat, jenis_surat, warga_id, tanggal, keperluan, id);
    res.json({ success: true });
  });

  app.delete("/api/surat/:id", (req, res) => {
    const { id } = req.params;
    db.prepare("DELETE FROM surat WHERE id = ?").run(id);
    res.json({ success: true });
  });

  // Peristiwa API
  app.get("/api/peristiwa", (req, res) => {
    const data = db.prepare(`
      SELECT p.*, w.nama as nama_warga 
      FROM peristiwa p 
      JOIN warga w ON p.warga_id = w.id 
      ORDER BY p.tanggal DESC
    `).all();
    res.json(data);
  });

  app.post("/api/peristiwa", (req, res) => {
    const { warga_id, jenis_peristiwa, tanggal, keterangan } = req.body;
    const stmt = db.prepare("INSERT INTO peristiwa (warga_id, jenis_peristiwa, tanggal, keterangan) VALUES (?, ?, ?, ?)");
    stmt.run(warga_id, jenis_peristiwa, tanggal, keterangan);
    
    // Update warga status if death
    if (jenis_peristiwa === 'kematian') {
      db.prepare("UPDATE warga SET status_warga = 'meninggal' WHERE id = ?").run(warga_id);
    }
    res.json({ success: true });
  });

  app.put("/api/peristiwa/:id", (req, res) => {
    const { id } = req.params;
    const { warga_id, jenis_peristiwa, tanggal, keterangan } = req.body;
    db.prepare(`
      UPDATE peristiwa 
      SET warga_id = ?, jenis_peristiwa = ?, tanggal = ?, keterangan = ?
      WHERE id = ?
    `).run(warga_id, jenis_peristiwa, tanggal, keterangan, id);
    res.json({ success: true });
  });

  app.delete("/api/peristiwa/:id", (req, res) => {
    const { id } = req.params;
    db.prepare("DELETE FROM peristiwa WHERE id = ?").run(id);
    res.json({ success: true });
  });

  // Iuran API
  app.get("/api/iuran", (req, res) => {
    const data = db.prepare(`
      SELECT i.*, w.nama as nama_warga 
      FROM iuran i 
      JOIN warga w ON i.warga_id = w.id 
      ORDER BY i.tanggal_bayar DESC
    `).all();
    res.json(data);
  });

  app.post("/api/iuran", (req, res) => {
    const { warga_id, bulan, tahun, jumlah, tanggal_bayar } = req.body;
    const stmt = db.prepare("INSERT INTO iuran (warga_id, bulan, tahun, jumlah, tanggal_bayar) VALUES (?, ?, ?, ?, ?)");
    stmt.run(warga_id, bulan, tahun, jumlah, tanggal_bayar);
    
    // Also add to Kas RT as income
    db.prepare("INSERT INTO kas (tanggal, keterangan, jumlah, tipe) VALUES (?, ?, ?, ?)")
      .run(tanggal_bayar, `Iuran Warga: ${bulan} ${tahun}`, jumlah, 'masuk');
      
    res.json({ success: true });
  });

  app.put("/api/iuran/:id", (req, res) => {
    const { id } = req.params;
    const { warga_id, bulan, tahun, jumlah, tanggal_bayar } = req.body;
    db.prepare(`
      UPDATE iuran 
      SET warga_id = ?, bulan = ?, tahun = ?, jumlah = ?, tanggal_bayar = ?
      WHERE id = ?
    `).run(warga_id, bulan, tahun, jumlah, tanggal_bayar, id);
    res.json({ success: true });
  });

  app.delete("/api/iuran/:id", (req, res) => {
    const { id } = req.params;
    db.prepare("DELETE FROM iuran WHERE id = ?").run(id);
    res.json({ success: true });
  });

  // Settings API
  app.get("/api/pengaturan", (req, res) => {
    try {
      const data = db.prepare("SELECT * FROM pengaturan WHERE id = 1").get();
      res.json(data || {});
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch settings" });
    }
  });

  app.post("/api/pengaturan", (req, res) => {
    try {
      const { nama_desa, rt, rw, kecamatan, kota, logo_url } = req.body;
      
      // Use REPLACE INTO to handle both insert and update
      const stmt = db.prepare(`
        REPLACE INTO pengaturan (id, nama_desa, rt, rw, kecamatan, kota, logo_url)
        VALUES (1, ?, ?, ?, ?, ?, ?)
      `);
      
      stmt.run(
        nama_desa || '', 
        rt || '', 
        rw || '', 
        kecamatan || '', 
        kota || '', 
        logo_url || ''
      );
      
      res.json({ success: true });
    } catch (error) {
      console.error("Settings update error:", error);
      res.status(500).json({ error: "Failed to update settings" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
