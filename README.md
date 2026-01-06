# TREADS'25 QR Attendance System

A complete end-to-end QR code-based attendance system for hackathons, built with Python, Google Apps Script, and HTML5.

## 📋 Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Setup Instructions](#setup-instructions)
4. [File Structure](#file-structure)
5. [Detailed Explanations](#detailed-explanations)
6. [Troubleshooting](#troubleshooting)

---

## 🎯 Overview

This system allows volunteers to scan participant QR codes using their mobile phones and automatically record attendance in a Google Sheet. The system prevents duplicate scans at the same venue.

### Key Features

- ✅ QR codes contain participant name and team (embedded as JSON)
- ✅ Real-time attendance recording to Google Sheets
- ✅ Duplicate prevention (same person at same venue)
- ✅ Multiple venue support
- ✅ Mobile-friendly scanner interface
- ✅ Automatic timestamp recording

---

## 🏗️ Architecture

```
┌─────────────────┐
│  participants   │
│     .csv        │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Python Script  │  Generates QR codes
│ generate_qr_    │  with JSON data
│ codes.py        │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   QR Images     │  Shared with participants
│  (qr_codes/)    │
└─────────────────┘

         │
         │ (Volunteer scans QR)
         ▼

┌─────────────────┐
│  scanner.html   │  Frontend scanner
│  (Mobile Web)   │  Reads QR → Sends data
└────────┬────────┘
         │
         │ HTTP POST (JSON)
         ▼
┌─────────────────┐
│ Google Apps     │  Backend handler
│ Script (Code.gs)│  Validates & writes
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Google Sheet   │  Database
│   (Attendance)  │  Stores all records
└─────────────────┘
```

---

## 🚀 Setup Instructions

### Part 1: Python QR Code Generator

#### Step 1: Install Dependencies

```bash
pip install pandas qrcode[pil] pillow
```

#### Step 2: Prepare Participant Data

Edit `participants.csv` with your participant data:

```csv
name,team
Adithya,CodeWarriors
Priya,TechNinjas
Rahul,DataDynamos
```

#### Step 3: Generate QR Codes

```bash
python generate_qr_codes.py
```

This will:
- Read `participants.csv`
- Generate QR code images in the `qr_codes/` folder
- Each QR code contains JSON: `{"name": "Adithya", "team": "CodeWarriors"}`

**Output:** QR code images saved as `qr_codes/Name_Team.png`

---

### Part 2: Google Apps Script Backend

#### Step 1: Create Google Sheet

1. Go to [Google Sheets](https://sheets.google.com)
2. Create a new spreadsheet
3. Name it "TREADS'25 Attendance" (or any name)
4. In the first sheet, add headers in Row 1:
   ```
   A1: Timestamp
   B1: Name
   C1: Team
   D1: Venue
   ```

#### Step 2: Set Up Apps Script

1. In your Google Sheet, go to **Extensions → Apps Script**
2. Delete any default code
3. Copy and paste the entire contents of `Code.gs`
4. Click **Save** (💾 icon) or press `Ctrl+S`
5. Name your project: "Attendance Handler"

#### Step 3: Deploy as Web App

1. Click **Deploy → New deployment**
2. Click the gear icon ⚙️ next to "Select type"
3. Choose **Web app**
4. Configure:
   - **Description:** "TREADS'25 Attendance API"
   - **Execute as:** Me (your email)
   - **Who has access:** Anyone
5. Click **Deploy**
6. **IMPORTANT:** Copy the **Web App URL** (looks like: `https://script.google.com/macros/s/.../exec`)
7. Click **Done**

#### Step 4: Authorize the Script

- On first deployment, you'll be asked to authorize
- Click **Review Permissions**
- Choose your Google account
- Click **Advanced → Go to [Project Name] (unsafe)**
- Click **Allow**

---

### Part 3: HTML Scanner Frontend

#### Step 1: Open the Scanner

1. Open `scanner.html` in a text editor
2. **Option A:** Host it on a web server (recommended for production)
   - Upload to GitHub Pages, Netlify, or any web hosting
   - Access via URL: `https://yourdomain.com/scanner.html`
   
   **Option B:** Open locally (for testing)
   - Simply open `scanner.html` in a web browser
   - Note: Some browsers may block camera access for local files

#### Step 2: Configure the Scanner

1. Open `scanner.html` in a browser (preferably on a mobile device)
2. Paste your **Google Apps Script Web App URL** in the configuration field
3. The URL will be saved in browser localStorage

#### Step 3: Use the Scanner

1. Select a venue from the dropdown
2. Click **Start Scanner**
3. Allow camera permissions when prompted
4. Point camera at participant's QR code
5. Attendance is automatically recorded!

---

## 📁 File Structure

```
qr_cursor/
│
├── generate_qr_codes.py    # Python script to generate QR codes
├── participants.csv         # Participant data (name, team)
├── Code.gs                  # Google Apps Script backend
├── scanner.html             # Frontend scanner web app
├── README.md               # This file
│
└── qr_codes/               # Generated QR code images (created after running Python script)
    ├── Adithya_CodeWarriors.png
    ├── Priya_TechNinjas.png
    └── ...
```

---

## 📚 Detailed Explanations

### Part 1: Python QR Code Generator

#### How It Works

1. **CSV Reading:**
   ```python
   df = pd.read_csv(CSV_FILE)
   ```
   - Uses `pandas` to read the CSV file
   - Validates that required columns (`name`, `team`) exist

2. **JSON Encoding:**
   ```python
   data = {"name": name, "team": team}
   json_string = json.dumps(data, ensure_ascii=False)
   ```
   - Creates a Python dictionary
   - Converts to JSON string (e.g., `{"name": "Adithya", "team": "CodeWarriors"}`)
   - `ensure_ascii=False` allows Unicode characters (for international names)

3. **QR Code Generation:**
   ```python
   qr.add_data(json_string)
   qr.make(fit=True)
   img = qr.make_image(fill_color="black", back_color="white")
   ```
   - Embeds the JSON string into the QR code
   - Generates a PNG image
   - Saves to `qr_codes/` folder

**Why JSON?** JSON is a standard format that's easy to parse in JavaScript. When the scanner reads the QR code, it gets a string that can be directly parsed into an object.

---

### Part 2: Google Apps Script Backend

#### How `doPost(e)` Works

```javascript
function doPost(e) {
  const requestData = JSON.parse(e.postData.contents);
  // ... process data ...
}
```

1. **Receiving Data:**
   - `doPost` is automatically called by Google Apps Script when a POST request arrives
   - `e.postData.contents` contains the raw JSON string from the frontend
   - `JSON.parse()` converts it to a JavaScript object

2. **Data Validation:**
   ```javascript
   if (!name || !team || !venue) {
     return error response;
   }
   ```
   - Ensures all required fields are present

3. **Duplicate Check:**
   ```javascript
   if (isDuplicateScan(sheet, name, venue)) {
     return error response;
   }
   ```
   - Reads all existing records
   - Checks if the same name + venue combination exists
   - Prevents duplicate scans

4. **Writing to Sheet:**
   ```javascript
   sheet.getRange(nextRow, TIMESTAMP_COL).setValue(timestamp);
   sheet.getRange(nextRow, NAME_COL).setValue(name);
   // ... etc
   ```
   - Gets the next empty row
   - Writes data to specific columns
   - Timestamp is automatically generated

5. **Response:**
   ```javascript
   return ContentService.createTextOutput(JSON.stringify({
     success: true,
     message: "..."
   })).setMimeType(ContentService.MimeType.JSON);
   ```
   - Returns JSON response to the frontend
   - Indicates success or failure

---

### Part 3: HTML Scanner Frontend

#### How the Scanner Works

1. **Library: html5-qrcode**
   - Uses the `html5-qrcode` library (loaded from CDN)
   - Provides camera access and QR code detection
   - Works on mobile browsers

2. **Initialization:**
   ```javascript
   html5QrcodeScanner = new Html5Qrcode("reader");
   ```
   - Creates scanner instance targeting the `#reader` div

3. **Starting Scanner:**
   ```javascript
   await html5QrcodeScanner.start(
     { facingMode: "environment" }, // Back camera
     { fps: 10, qrbox: { width: 250, height: 250 } },
     onScanSuccess, // Callback when QR is detected
     onScanError    // Callback for errors
   );
   ```
   - Requests camera access
   - `facingMode: "environment"` uses the back camera (better for scanning)
   - `fps: 10` = 10 frames per second (good balance of speed/battery)

4. **QR Code Detection:**
   ```javascript
   function onScanSuccess(decodedText) {
     const qrData = JSON.parse(decodedText);
     // qrData = { name: "Adithya", team: "CodeWarriors" }
   }
   ```
   - When a QR code is detected, `decodedText` contains the JSON string
   - Parse it to get name and team

5. **Sending Data to Google Sheets:**
   ```javascript
   const attendanceData = {
     name: qrData.name,
     team: qrData.team,
     venue: document.getElementById('venueSelect').value
   };
   
   await fetch(apiUrl, {
     method: 'POST',
     mode: 'no-cors',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify(attendanceData)
   });
   ```

---

### 🔄 The API Handshake: Frontend → Google Sheets

This is the **most important part** to understand:

#### Step-by-Step Communication Flow

1. **Frontend Prepares Data:**
   ```javascript
   const data = {
     name: "Adithya",
     team: "CodeWarriors",
     venue: "Canteen"
   };
   ```

2. **Frontend Sends HTTP POST Request:**
   ```javascript
   fetch('https://script.google.com/macros/s/.../exec', {
     method: 'POST',
     body: JSON.stringify(data)
   });
   ```
   - Uses the **Fetch API** (built into browsers)
   - Sends JSON data in the request body
   - **Note:** `mode: 'no-cors'` is required because Google Apps Script Web Apps don't support CORS properly

3. **Google Apps Script Receives Request:**
   - Google's servers receive the POST request
   - Automatically call the `doPost(e)` function
   - `e.postData.contents` contains: `'{"name":"Adithya","team":"CodeWarriors","venue":"Canteen"}'`

4. **Script Processes Data:**
   ```javascript
   const requestData = JSON.parse(e.postData.contents);
   // requestData = { name: "Adithya", team: "CodeWarriors", venue: "Canteen" }
   ```

5. **Script Writes to Sheet:**
   ```javascript
   sheet.getRange(row, col).setValue(value);
   ```

6. **Script Returns Response:**
   ```javascript
   return ContentService.createTextOutput(JSON.stringify({
     success: true,
     message: "Attendance recorded"
   }));
   ```

#### Why `mode: 'no-cors'`?

- Google Apps Script Web Apps have CORS (Cross-Origin Resource Sharing) limitations
- With `no-cors`, the browser sends the request but **cannot read the response**
- This is okay for our use case because:
  - The data is still sent successfully
  - We show a success message based on the request being sent
  - For production, you could use a proxy or enable CORS properly

#### Alternative: Reading the Response

If you want to read the actual response from Google Apps Script, you need to:

1. Remove `mode: 'no-cors'`
2. In Google Apps Script, add CORS headers:
   ```javascript
   return ContentService
     .createTextOutput(JSON.stringify({ success: true }))
     .setMimeType(ContentService.MimeType.JSON)
     .setHeaders({ 'Access-Control-Allow-Origin': '*' });
   ```

However, Google Apps Script Web Apps have limitations, so `no-cors` is the simpler approach.

---

## 🔧 Troubleshooting

### Python Script Issues

**Problem:** `ModuleNotFoundError: No module named 'qrcode'`
- **Solution:** Run `pip install qrcode[pil] pillow pandas`

**Problem:** CSV file not found
- **Solution:** Ensure `participants.csv` is in the same folder as the Python script

**Problem:** QR codes are too small/large
- **Solution:** Adjust `QR_SIZE` and `QR_BORDER` constants in the script

---

### Google Apps Script Issues

**Problem:** "Script function not found"
- **Solution:** Ensure the function is named exactly `doPost` (case-sensitive)

**Problem:** "Sheet not found"
- **Solution:** Check that the sheet name matches `SHEET_NAME` constant in `Code.gs`

**Problem:** "Permission denied"
- **Solution:** Re-authorize the script: Deploy → Manage deployments → Edit → Authorize

**Problem:** Data not appearing in sheet
- **Solution:** 
  1. Check the execution log: View → Executions
  2. Ensure headers are in Row 1
  3. Check that column indices match your sheet structure

---

### Scanner Frontend Issues

**Problem:** Camera not working
- **Solution:** 
  - Ensure HTTPS (required for camera access)
  - Check browser permissions
  - Try a different browser (Chrome/Firefox work best)

**Problem:** "Invalid QR code"
- **Solution:** Ensure QR codes were generated with this system (contain JSON format)

**Problem:** Data not being sent
- **Solution:**
  - Verify the Web App URL is correct
  - Check browser console for errors (F12)
  - Ensure Google Apps Script is deployed and authorized

**Problem:** Duplicate scans not being prevented
- **Solution:** Check that `isDuplicateScan()` function is working in Apps Script

---

## 🎓 Learning Points for Students

### 1. **JSON as Data Format**
- JSON is lightweight and easy to parse
- Used for: QR code data, HTTP request/response bodies
- Learn more: [JSON.org](https://www.json.org/)

### 2. **HTTP POST Requests**
- POST is used to send data to a server
- Fetch API is the modern way to make HTTP requests in JavaScript
- Learn more: [MDN Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)

### 3. **Serverless Backend (Google Apps Script)**
- No server setup required!
- Google handles hosting, scaling, and security
- Perfect for small projects and hackathons

### 4. **QR Code Technology**
- QR codes are just encoded text/images
- Can store up to ~3KB of data
- Error correction allows scanning even if partially damaged

### 5. **Mobile-First Design**
- Scanner is designed for mobile devices
- Uses responsive CSS
- Camera API works best on mobile browsers

---

## 🚀 Next Steps & Enhancements

### Possible Improvements:

1. **Real-time Dashboard:**
   - Create a separate Google Sheet with live attendance stats
   - Use Google Apps Script triggers to update dashboard

2. **Admin Panel:**
   - Add a web interface to view attendance
   - Filter by venue, team, time range

3. **Export Features:**
   - Export attendance to PDF
   - Generate reports by team/venue

4. **Enhanced Security:**
   - Add authentication for scanner access
   - Encrypt QR code data

5. **Offline Support:**
   - Cache scans when offline
   - Sync when connection restored

---

## 📝 License

This project is created for educational purposes. Feel free to modify and use for your hackathon!

---

## 👨‍💻 Support

If you encounter issues:
1. Check the Troubleshooting section
2. Review browser console for errors (F12)
3. Check Google Apps Script execution logs
4. Verify all setup steps were followed correctly

---

**Good luck with TREADS'25! 🎉**

