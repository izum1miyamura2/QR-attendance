# Setup Guide: Check-Off Attendance System

This guide explains how to set up the **Check-Off Attendance System** where scanned participants are marked with a checkmark (✓) in your Google Sheet.

---

## 📋 Overview

Instead of creating new rows, this system:
1. Searches for the participant in your existing Google Sheet
2. Adds a checkmark (✓) in the Status column
3. Records the venue and timestamp

---

## 🗂️ Step 1: Prepare Your Google Sheet

### Create the Sheet Structure

1. Open [Google Sheets](https://sheets.google.com) and create a new spreadsheet
2. Name it "TREADS'25 Attendance" (or any name you prefer)
3. Name the first sheet **"Participants"** (important: must match `SHEET_NAME` in Code.gs)

### Add Headers (Row 1)

In Row 1, add these exact column headers:

| Column A | Column B | Column C | Column D | Column E |
|----------|----------|----------|----------|----------|
| **Name** | **Team Name** | **Status** | **Venue** | **Timestamp** |

### Populate Participant Data

Starting from Row 2, add your participant data:

| Name | Team Name | Status | Venue | Timestamp |
|------|-----------|--------|-------|-----------|
| izumi | horimiya | | | |
| hori | horimiya | | | |
| kaito | SAO | | | |
| pashuuuuu | GODPASHUUU | | | |
| jashdgvgas | napaser | | | |

**Important Notes:**
- Fill in **Name** and **Team Name** columns
- Leave **Status**, **Venue**, and **Timestamp** empty (they'll be filled automatically when scanned)
- The system searches by **Name** (case-insensitive matching)

---

## 🔧 Step 2: Set Up Google Apps Script

### 2.1 Open Apps Script

1. In your Google Sheet, go to **Extensions → Apps Script**
2. Delete any default code
3. Copy the entire contents of `Code.gs` and paste it

### 2.2 Configure Column Positions (if needed)

If your sheet has different column positions, update these constants in `Code.gs`:

```javascript
const NAME_COL = 1;         // Column A
const TEAM_COL = 2;         // Column B
const STATUS_COL = 3;       // Column C (checkmark goes here)
const VENUE_COL = 4;        // Column D
const TIMESTAMP_COL = 5;    // Column E
```

### 2.3 Save the Script

1. Click **Save** (💾 icon) or press `Ctrl+S`
2. Name your project: "Attendance Check-Off Handler"

### 2.4 Deploy as Web App

1. Click **Deploy → New deployment**
2. Click the gear icon ⚙️ next to "Select type"
3. Choose **Web app**
4. Configure:
   - **Description:** "TREADS'25 Check-Off Attendance API"
   - **Execute as:** Me (your email)
   - **Who has access:** Anyone
5. Click **Deploy**
6. **IMPORTANT:** Copy the **Web App URL** (looks like: `https://script.google.com/macros/s/.../exec`)
7. Click **Done**

### 2.5 Authorize the Script

- On first deployment, you'll be asked to authorize
- Click **Review Permissions**
- Choose your Google account
- Click **Advanced → Go to [Project Name] (unsafe)**
- Click **Allow**

---

## 📱 Step 3: Use the Scanner

1. Open `scanner.html` in a browser (mobile recommended)
2. Paste your **Google Apps Script Web App URL** in the configuration field
3. Select a venue from the dropdown
4. Click **Start Scanner**
5. Allow camera permissions
6. Scan participant QR codes

### What Happens When You Scan:

1. Scanner reads QR code → Gets: `{"name": "izumi", "team": "horimiya"}`
2. System searches Google Sheet for matching Name (case-insensitive)
3. If found:
   - Adds **✓** in Status column
   - Records venue in Venue column
   - Records timestamp in Timestamp column
4. If not found: Shows error "Participant not found"
5. If already checked at same venue: Shows error "Already checked"

---

## 🔍 How the Check-Off System Works

### Search Logic

The system searches for participants by:

- **Name:** Exact match (case-insensitive)
- Example: "Izumi" will match "izumi", "IZUMI", or "Izumi"

### Example Flow

**Before Scan:**
```
Row 2: izumi | horimiya | [empty] | [empty] | [empty]
```

**After Scanning QR for "izumi" at "Canteen":**
```
Row 2: izumi | horimiya | ✓ | Canteen | 2025-01-15 10:30:00
```

### Duplicate Prevention

- If the same person is scanned again at the **same venue**, it will show an error
- If scanned at a **different venue**, it will update the venue and timestamp (but keep the checkmark)

---

## 🐛 Troubleshooting

### "Participant not found"

**Possible causes:**
- Name in QR code doesn't match the sheet
- Participant data not in the sheet
- Sheet name doesn't match (should be "Participants")
- Extra spaces or typos in names

**Solution:**
- Verify the participant exists in your sheet
- Check that Name matches exactly (case-insensitive, but spelling must match)
- Ensure sheet name is "Participants"
- Check for extra spaces before/after names

### "Sheet not found"

**Solution:**
- Check that your sheet is named "Participants" (or update `SHEET_NAME` in Code.gs)
- Ensure you're using the correct Google Sheet

### Checkmark not appearing

**Solution:**
- Check Google Apps Script execution logs: View → Executions
- Verify column positions match your sheet structure
- Ensure the script has write permissions

### Wrong row being checked

**Solution:**
- The system matches by Name only (case-insensitive)
- Ensure names are unique in your sheet
- If two people have the same name, add a distinguishing identifier (e.g., "John Smith A" and "John Smith B")

---

## 📊 Viewing Attendance

After scanning, you can:

1. **Filter by Status:** Filter Column D for "✓" to see all checked participants
2. **Filter by Venue:** Filter Column E to see who attended each venue
3. **Sort by Timestamp:** Sort Column F to see scan order

### Example Queries

- **Who hasn't been scanned?** Filter Status column for empty cells
- **Who attended Canteen?** Filter Venue column for "Canteen"
- **Latest scans:** Sort Timestamp column descending

---

## 🎯 Tips for Best Results

1. **Unique Names:** Ensure participant names are unique (or add identifiers if duplicates exist)
2. **Keep Sheet Updated:** Add new participants to the sheet before generating QR codes
3. **Test First:** Scan a test QR code to verify everything works
4. **Backup Sheet:** Make a copy of your sheet before the event
5. **Consistent Naming:** Use the same name format in CSV and Google Sheet

---

## 🔄 Resetting Attendance

To reset attendance for a new session:

1. Select the Status, Venue, and Timestamp columns (D, E, F)
2. Right-click → Clear contents
3. Or use: `=IF(TRUE,"","")` formula and copy down

---

**You're all set! Good luck with TREADS'25! 🎉**

