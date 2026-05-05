const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')
const Database = require('better-sqlite3')

const isDev = process.env.NODE_ENV === 'development'
let db
let mainWindow

function initDatabase() {
  const dbPath = isDev
    ? path.join(__dirname, '../crime_analysis.db')
    : path.join(app.getPath('userData'), 'crime_analysis.db')

  db = new Database(dbPath)
  db.pragma('journal_mode = WAL')
  db.pragma('foreign_keys = ON')

  db.exec(`
    CREATE TABLE IF NOT EXISTS user_account (
      ID INTEGER PRIMARY KEY AUTOINCREMENT,
      Username TEXT NOT NULL UNIQUE,
      Password TEXT NOT NULL,
      Role TEXT NOT NULL DEFAULT 'user',
      Full_Name TEXT
    );
    CREATE TABLE IF NOT EXISTS crime_type (
      Type_ID INTEGER PRIMARY KEY AUTOINCREMENT,
      Type_Name TEXT NOT NULL,
      Description TEXT
    );
    CREATE TABLE IF NOT EXISTS location (
      Location_ID INTEGER PRIMARY KEY AUTOINCREMENT,
      Location_Name TEXT NOT NULL,
      City TEXT,
      Area_Type TEXT
    );
    CREATE TABLE IF NOT EXISTS suspect (
      Suspect_ID INTEGER PRIMARY KEY AUTOINCREMENT,
      Suspect_Name TEXT NOT NULL,
      Age INTEGER,
      Gender TEXT
    );
    CREATE TABLE IF NOT EXISTS crime (
      Crime_ID INTEGER PRIMARY KEY AUTOINCREMENT,
      Type_ID INTEGER,
      Severity TEXT,
      Crime_Date TEXT,
      Location_ID INTEGER,
      FOREIGN KEY (Type_ID) REFERENCES crime_type(Type_ID) ON DELETE CASCADE,
      FOREIGN KEY (Location_ID) REFERENCES location(Location_ID) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS crime_suspect (
      ID INTEGER PRIMARY KEY AUTOINCREMENT,
      Crime_ID INTEGER,
      Suspect_ID INTEGER,
      FOREIGN KEY (Crime_ID) REFERENCES crime(Crime_ID) ON DELETE CASCADE,
      FOREIGN KEY (Suspect_ID) REFERENCES suspect(Suspect_ID) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS victim (
      Victim_ID INTEGER PRIMARY KEY AUTOINCREMENT,
      Victim_Name TEXT NOT NULL,
      Age INTEGER,
      Gender TEXT,
      Crime_ID INTEGER,
      FOREIGN KEY (Crime_ID) REFERENCES crime(Crime_ID) ON DELETE CASCADE
    );
  `)

  const adminExists = db.prepare('SELECT COUNT(*) AS n FROM user_account WHERE Username = ?').get('admin').n
  if (!adminExists) {
    db.prepare('INSERT INTO user_account (Username, Password, Role, Full_Name) VALUES (?, ?, ?, ?)').run('admin', 'admin123', 'admin', 'Administrator')
  }
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 820,
    minWidth: 960,
    minHeight: 600,
    backgroundColor: '#f5f5f5',
    titleBarStyle: 'hidden',
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  })

  if (isDev) {
    const devUrl = process.env.VITE_DEV_SERVER_URL || 'http://localhost:5173'
    mainWindow.loadURL(devUrl)
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
  }
}

// ── Helper Functions ───────────────────────────────────────
function handleDbOperation(operation) {
  return (event, ...args) => {
    try {
      return operation(...args)
    } catch (error) {
      console.error('Database operation error:', error)
      throw { success: false, error: error.message }
    }
  }
}

function validateInput(data, fields) {
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid input data')
  }
  for (const field of fields) {
    if (data[field] === null || data[field] === undefined || data[field] === '') {
      throw new Error(`Missing required field: ${field}`)
    }
  }
}

app.whenReady().then(() => {
  initDatabase()
  createWindow()
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

app.on('before-quit', () => {
  if (db) {
    db.close()
  }
})

// ── Crime Type ─────────────────────────────────────────────
ipcMain.handle('crime-type:getAll', handleDbOperation(() =>
  db.prepare('SELECT * FROM crime_type ORDER BY Type_ID').all()
))
ipcMain.handle('crime-type:create', handleDbOperation((d) => {
  validateInput(d, ['Type_Name'])
  return db.prepare('INSERT INTO crime_type (Type_Name, Description) VALUES (?,?)').run(d.Type_Name, d.Description || null)
}))
ipcMain.handle('crime-type:update', handleDbOperation((d) => {
  validateInput(d, ['Type_ID', 'Type_Name'])
  return db.prepare('UPDATE crime_type SET Type_Name=?, Description=? WHERE Type_ID=?').run(d.Type_Name, d.Description || null, d.Type_ID)
}))
ipcMain.handle('crime-type:delete', handleDbOperation((id) => {
  if (!id) throw new Error('ID is required')
  // Delete related crimes and their associations
  const crimes = db.prepare('SELECT Crime_ID FROM crime WHERE Type_ID = ?').all(id)
  for (const crime of crimes) {
    db.prepare('DELETE FROM crime_suspect WHERE Crime_ID = ?').run(crime.Crime_ID)
    db.prepare('DELETE FROM victim WHERE Crime_ID = ?').run(crime.Crime_ID)
  }
  db.prepare('DELETE FROM crime WHERE Type_ID = ?').run(id)
  return db.prepare('DELETE FROM crime_type WHERE Type_ID = ?').run(id)
}))

// ── Location ───────────────────────────────────────────────
ipcMain.handle('location:getAll', handleDbOperation(() =>
  db.prepare('SELECT * FROM location ORDER BY Location_ID').all()
))
ipcMain.handle('location:create', handleDbOperation((d) => {
  validateInput(d, ['Location_Name'])
  return db.prepare('INSERT INTO location (Location_Name, City, Area_Type) VALUES (?,?,?)').run(d.Location_Name, d.City || null, d.Area_Type || null)
}))
ipcMain.handle('location:update', handleDbOperation((d) => {
  validateInput(d, ['Location_ID', 'Location_Name'])
  return db.prepare('UPDATE location SET Location_Name=?, City=?, Area_Type=? WHERE Location_ID=?').run(d.Location_Name, d.City || null, d.Area_Type || null, d.Location_ID)
}))
ipcMain.handle('location:delete', handleDbOperation((id) => {
  if (!id) throw new Error('ID is required')
  // Delete crimes at this location and their associations
  const crimes = db.prepare('SELECT Crime_ID FROM crime WHERE Location_ID = ?').all(id)
  for (const crime of crimes) {
    db.prepare('DELETE FROM crime_suspect WHERE Crime_ID = ?').run(crime.Crime_ID)
    db.prepare('DELETE FROM victim WHERE Crime_ID = ?').run(crime.Crime_ID)
  }
  db.prepare('DELETE FROM crime WHERE Location_ID = ?').run(id)
  return db.prepare('DELETE FROM location WHERE Location_ID = ?').run(id)
}))

// ── Suspect ────────────────────────────────────────────────
ipcMain.handle('suspect:getAll', handleDbOperation(() =>
  db.prepare('SELECT * FROM suspect ORDER BY Suspect_ID').all()
))
ipcMain.handle('suspect:create', handleDbOperation((d) => {
  validateInput(d, ['Suspect_Name'])
  return db.prepare('INSERT INTO suspect (Suspect_Name, Age, Gender) VALUES (?,?,?)').run(d.Suspect_Name, d.Age || null, d.Gender || null)
}))
ipcMain.handle('suspect:update', handleDbOperation((d) => {
  validateInput(d, ['Suspect_ID', 'Suspect_Name'])
  return db.prepare('UPDATE suspect SET Suspect_Name=?, Age=?, Gender=? WHERE Suspect_ID=?').run(d.Suspect_Name, d.Age || null, d.Gender || null, d.Suspect_ID)
}))
ipcMain.handle('suspect:delete', handleDbOperation((id) => {
  if (!id) throw new Error('ID is required')
  // Delete crime-suspect associations
  db.prepare('DELETE FROM crime_suspect WHERE Suspect_ID = ?').run(id)
  return db.prepare('DELETE FROM suspect WHERE Suspect_ID=?').run(id)
}))

// ── Crime ──────────────────────────────────────────────────
ipcMain.handle('crime:getAll', handleDbOperation(() =>
  db.prepare(`
    SELECT c.*, ct.Type_Name, l.Location_Name
    FROM crime c
    LEFT JOIN crime_type ct ON c.Type_ID = ct.Type_ID
    LEFT JOIN location l ON c.Location_ID = l.Location_ID
    ORDER BY c.Crime_ID
  `).all()
))
ipcMain.handle('crime:create', handleDbOperation((d) => {
  validateInput(d, ['Crime_Date'])
  return db.prepare('INSERT INTO crime (Type_ID, Severity, Crime_Date, Location_ID) VALUES (?,?,?,?)').run(d.Type_ID || null, d.Severity || null, d.Crime_Date, d.Location_ID || null)
}))
ipcMain.handle('crime:update', handleDbOperation((d) => {
  validateInput(d, ['Crime_ID', 'Crime_Date'])
  return db.prepare('UPDATE crime SET Type_ID=?, Severity=?, Crime_Date=?, Location_ID=? WHERE Crime_ID=?').run(d.Type_ID || null, d.Severity || null, d.Crime_Date, d.Location_ID || null, d.Crime_ID)
}))
ipcMain.handle('crime:delete', handleDbOperation((id) => {
  if (!id) throw new Error('ID is required')
  // Delete crime-suspect and victim associations
  db.prepare('DELETE FROM crime_suspect WHERE Crime_ID = ?').run(id)
  db.prepare('DELETE FROM victim WHERE Crime_ID = ?').run(id)
  return db.prepare('DELETE FROM crime WHERE Crime_ID=?').run(id)
}))

// ── Crime-Suspect ──────────────────────────────────────────
ipcMain.handle('crime-suspect:getAll', handleDbOperation(() =>
  db.prepare(`
    SELECT cs.*, s.Suspect_Name, c.Crime_Date, ct.Type_Name AS Crime_Type
    FROM crime_suspect cs
    LEFT JOIN suspect s ON cs.Suspect_ID = s.Suspect_ID
    LEFT JOIN crime c ON cs.Crime_ID = c.Crime_ID
    LEFT JOIN crime_type ct ON c.Type_ID = ct.Type_ID
    ORDER BY cs.ID
  `).all()
))
ipcMain.handle('crime-suspect:create', handleDbOperation((d) => {
  validateInput(d, ['Crime_ID', 'Suspect_ID'])
  return db.prepare('INSERT INTO crime_suspect (Crime_ID, Suspect_ID) VALUES (?,?)').run(d.Crime_ID, d.Suspect_ID)
}))
ipcMain.handle('crime-suspect:update', handleDbOperation((d) => {
  validateInput(d, ['ID', 'Crime_ID', 'Suspect_ID'])
  return db.prepare('UPDATE crime_suspect SET Crime_ID=?, Suspect_ID=? WHERE ID=?').run(d.Crime_ID, d.Suspect_ID, d.ID)
}))
ipcMain.handle('crime-suspect:delete', handleDbOperation((id) => {
  if (!id) throw new Error('ID is required')
  return db.prepare('DELETE FROM crime_suspect WHERE ID=?').run(id)
}))

// ── Victim ─────────────────────────────────────────────────
ipcMain.handle('victim:getAll', handleDbOperation(() =>
  db.prepare(`
    SELECT v.*, c.Crime_Date, ct.Type_Name AS Crime_Type
    FROM victim v
    LEFT JOIN crime c ON v.Crime_ID = c.Crime_ID
    LEFT JOIN crime_type ct ON c.Type_ID = ct.Type_ID
    ORDER BY v.Victim_ID
  `).all()
))
ipcMain.handle('victim:create', handleDbOperation((d) => {
  validateInput(d, ['Victim_Name'])
  return db.prepare('INSERT INTO victim (Victim_Name, Age, Gender, Crime_ID) VALUES (?,?,?,?)').run(d.Victim_Name, d.Age || null, d.Gender || null, d.Crime_ID || null)
}))
ipcMain.handle('victim:update', handleDbOperation((d) => {
  validateInput(d, ['Victim_ID', 'Victim_Name'])
  return db.prepare('UPDATE victim SET Victim_Name=?, Age=?, Gender=?, Crime_ID=? WHERE Victim_ID=?').run(d.Victim_Name, d.Age || null, d.Gender || null, d.Crime_ID || null, d.Victim_ID)
}))
ipcMain.handle('victim:delete', handleDbOperation((id) => {
  if (!id) throw new Error('ID is required')
  return db.prepare('DELETE FROM victim WHERE Victim_ID=?').run(id)
}))

// ── Auth ───────────────────────────────────────────────────
ipcMain.handle('auth:login', handleDbOperation(({ username, password }) => {
  if (!username || !password) {
    throw new Error('Username and password are required')
  }
  const user = db.prepare('SELECT ID, Username, Password, Role, Full_Name FROM user_account WHERE Username = ?').get(username)
  if (!user || user.Password !== password) {
    return { success: false, error: 'Invalid username or password' }
  }
  return { success: true, user: { id: user.ID, username: user.Username, role: user.Role, name: user.Full_Name || user.Username } }
}))

ipcMain.handle('auth:register', handleDbOperation(({ username, password, fullName }) => {
  if (!username || !password) {
    throw new Error('Username and password are required')
  }
  const existing = db.prepare('SELECT COUNT(*) AS n FROM user_account WHERE Username = ?').get(username).n
  if (existing > 0) {
    return { success: false, error: 'Username already exists' }
  }
  db.prepare('INSERT INTO user_account (Username, Password, Role, Full_Name) VALUES (?, ?, ?, ?)').run(username, password, 'user', fullName || '')
  return { success: true }
}))

// ── Dashboard ──────────────────────────────────────────────
ipcMain.handle('dashboard:getStats', handleDbOperation(() => ({
  totalCrimes:    db.prepare('SELECT COUNT(*) AS n FROM crime').get().n,
  totalSuspects:  db.prepare('SELECT COUNT(*) AS n FROM suspect').get().n,
  totalVictims:   db.prepare('SELECT COUNT(*) AS n FROM victim').get().n,
  totalLocations: db.prepare('SELECT COUNT(*) AS n FROM location').get().n,
  recentCrimes: db.prepare(`
    SELECT c.Crime_ID, c.Crime_Date, c.Severity, ct.Type_Name, l.Location_Name
    FROM crime c
    LEFT JOIN crime_type ct ON c.Type_ID = ct.Type_ID
    LEFT JOIN location l ON c.Location_ID = l.Location_ID
    ORDER BY c.Crime_ID DESC LIMIT 5
  `).all(),
  crimesByType: db.prepare(`
    SELECT ct.Type_Name, COUNT(*) AS count
    FROM crime c LEFT JOIN crime_type ct ON c.Type_ID = ct.Type_ID
    GROUP BY c.Type_ID ORDER BY count DESC
  `).all(),
  crimesBySeverity: db.prepare(`
    SELECT Severity, COUNT(*) AS count FROM crime
    WHERE Severity IS NOT NULL GROUP BY Severity ORDER BY count DESC
  `).all()
})))
