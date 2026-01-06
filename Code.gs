/**
 * TREADS'25 QR Attendance System - Google Apps Script Backend
 * 
 * This script handles POST requests from the QR scanner frontend
 * and appends attendance data to a Google Sheet.
 * 
 * SETUP INSTRUCTIONS:
 * 1. Open Google Sheets and create a new spreadsheet
 * 2. Name the first sheet "Attendance" (or update SHEET_NAME below)
 * 3. Add headers in Row 1: Timestamp, Name, Team, Venue
 * 4. Go to Extensions > Apps Script
 * 5. Paste this code into the script editor
 * 6. Save the project
 * 7. Deploy > New deployment > Type: Web app
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 8. Copy the Web App URL and use it in scanner.html
 */

// Configuration
const SHEET_NAME = "Attendance";
const TIMESTAMP_COL = 1;  // Column A
const NAME_COL = 2;        // Column B
const TEAM_COL = 3;        // Column C
const VENUE_COL = 4;       // Column D

/**
 * Main POST handler - receives data from the scanner frontend
 * 
 * Expected JSON payload:
 * {
 *   "name": "Adithya",
 *   "team": "CodeWarriors",
 *   "venue": "Canteen"
 * }
 */
function doPost(e) {
  try {
    // Parse the incoming JSON data
    const requestData = JSON.parse(e.postData.contents);
    const name = requestData.name;
    const team = requestData.team;
    const venue = requestData.venue;
    
    // Validate required fields
    if (!name || !team || !venue) {
      return ContentService
        .createTextOutput(JSON.stringify({
          success: false,
          error: "Missing required fields: name, team, or venue"
        }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    // Get the active spreadsheet and sheet
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
    
    if (!sheet) {
      return ContentService
        .createTextOutput(JSON.stringify({
          success: false,
          error: `Sheet "${SHEET_NAME}" not found. Please create it first.`
        }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    // Check for duplicate scan (same person at same venue)
    if (isDuplicateScan(sheet, name, venue)) {
      return ContentService
        .createTextOutput(JSON.stringify({
          success: false,
          error: `${name} has already been scanned at ${venue}`
        }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    // Get the next empty row
    const nextRow = sheet.getLastRow() + 1;
    
    // Get current timestamp
    const timestamp = new Date();
    
    // Append data to the sheet
    sheet.getRange(nextRow, TIMESTAMP_COL).setValue(timestamp);
    sheet.getRange(nextRow, NAME_COL).setValue(name);
    sheet.getRange(nextRow, TEAM_COL).setValue(team);
    sheet.getRange(nextRow, VENUE_COL).setValue(venue);
    
    // Return success response
    return ContentService
      .createTextOutput(JSON.stringify({
        success: true,
        message: `Attendance recorded: ${name} (${team}) at ${venue}`,
        timestamp: timestamp.toISOString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    // Handle any errors
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        error: error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Check if a person has already been scanned at a specific venue
 * 
 * @param {Sheet} sheet - The Google Sheet object
 * @param {string} name - Participant's name
 * @param {string} venue - Venue name
 * @return {boolean} - True if duplicate, False otherwise
 */
function isDuplicateScan(sheet, name, venue) {
  // Get all data from the sheet (skip header row)
  const dataRange = sheet.getDataRange();
  const data = dataRange.getValues();
  
  // Skip header row (row 1, index 0)
  for (let i = 1; i < data.length; i++) {
    const rowName = data[i][NAME_COL - 1];  // Column B (index 1)
    const rowVenue = data[i][VENUE_COL - 1]; // Column D (index 3)
    
    // Check if name and venue match (case-insensitive)
    if (rowName && rowVenue && 
        rowName.toString().toLowerCase() === name.toLowerCase() &&
        rowVenue.toString().toLowerCase() === venue.toLowerCase()) {
      return true; // Duplicate found
    }
  }
  
  return false; // No duplicate
}

/**
 * Test function - can be run manually to test the script
 * Uncomment and modify to test locally
 */
/*
function testDoPost() {
  const mockEvent = {
    postData: {
      contents: JSON.stringify({
        name: "Test User",
        team: "Test Team",
        venue: "Canteen"
      })
    }
  };
  
  const result = doPost(mockEvent);
  Logger.log(result.getContent());
}
*/

