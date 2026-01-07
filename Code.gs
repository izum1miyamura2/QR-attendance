/**
 * TREADS'25 QR Attendance System - Google Apps Script Backend
 * 
 * This script handles POST requests from the QR scanner frontend
 * and marks attendance by checking off existing rows in a Google Sheet.
 * 
 * SETUP INSTRUCTIONS:
 * 1. Open Google Sheets and create a new spreadsheet
 * 2. Name the first sheet "Participants" (or update SHEET_NAME below)
 * 3. Add headers in Row 1: Unique ID, Name, Team Name, Status, Venue, Timestamp
 * 4. Populate rows 2+ with participant data (Unique ID, Name, Team Name)
 * 5. Go to Extensions > Apps Script
 * 6. Paste this code into the script editor
 * 7. Save the project
 * 8. Deploy > New deployment > Type: Web app
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 9. Copy the Web App URL and use it in scanner.html
 */

// Configuration - Column positions in your sheet
const SHEET_NAME = "Participants";
const UNIQUE_ID_COL = 1;    // Column A: Unique ID
const NAME_COL = 2;         // Column B: Name
const TEAM_COL = 3;         // Column C: Team Name
const STATUS_COL = 4;       // Column D: Status (checkmark goes here)
const VENUE_COL = 5;        // Column E: Venue (where scanned)
const TIMESTAMP_COL = 6;    // Column F: Timestamp

/**
 * Main POST handler - receives data from the scanner frontend
 * 
 * Expected JSON payload:
 * {
 *   "id": "U001",
 *   "venue": "Canteen"
 * }
 */
function doPost(e) {
  try {
    // Parse the incoming JSON data
    const requestData = JSON.parse(e.postData.contents);
    const id = requestData.id;
    const venue = requestData.venue;
    
    // Validate required fields
    if (!id || !venue) {
      return ContentService
        .createTextOutput(JSON.stringify({
          success: false,
          error: "Missing required fields: id or venue"
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
    
    // Search for the participant in the sheet by Unique ID
    const foundRow = findParticipant(sheet, id);
    
    if (!foundRow) {
      return ContentService
        .createTextOutput(JSON.stringify({
          success: false,
          error: `Participant not found for ID: ${id}`
        }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    // Check if already scanned at this venue
    const existingVenue = sheet.getRange(foundRow, VENUE_COL).getValue();
    const existingStatus = sheet.getRange(foundRow, STATUS_COL).getValue();
    
    if (existingStatus && existingVenue && 
        existingVenue.toString().toLowerCase() === venue.toLowerCase()) {
      return ContentService
        .createTextOutput(JSON.stringify({
          success: false,
          error: `${name} has already been checked at ${venue}`
        }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    // Get current timestamp
    const timestamp = new Date();
    
    // Read some info for logging / response
    const name = sheet.getRange(foundRow, NAME_COL).getValue();
    const team = sheet.getRange(foundRow, TEAM_COL).getValue();
    
    // Mark the participant as checked
    sheet.getRange(foundRow, STATUS_COL).setValue("✓"); // Checkmark
    sheet.getRange(foundRow, VENUE_COL).setValue(venue);
    sheet.getRange(foundRow, TIMESTAMP_COL).setValue(timestamp);
    
    // Return success response
    return ContentService
      .createTextOutput(JSON.stringify({
        success: true,
        message: `Checked ID: ${id} (${name} - ${team}) at ${venue}`,
        timestamp: timestamp.toISOString(),
        row: foundRow
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
 * Find a participant in the sheet by Unique ID
 * 
 * @param {Sheet} sheet - The Google Sheet object
 * @param {string} id - Participant's unique ID
 * @return {number|null} - Row number if found, null otherwise
 */
function findParticipant(sheet, id) {
  // Get all data from the sheet
  const dataRange = sheet.getDataRange();
  const data = dataRange.getValues();
  
  // Skip header row (row 1, index 0)
  for (let i = 1; i < data.length; i++) {
    const rowId = data[i][UNIQUE_ID_COL - 1];    // Column A (index 0)
    
    // Match by ID (case-insensitive)
    if (rowId && rowId.toString().trim().toLowerCase() === id.toString().trim().toLowerCase()) {
      return i + 1; // Return row number (i is 0-based, sheet rows are 1-based)
    }
  }
  
  return null; // Participant not found
}

/**
 * Test function - can be run manually to test the script
 * Uncomment and modify to test locally
 * 
 * IMPORTANT: Make sure the participant exists in your sheet first!
 */
/*
function testDoPost() {
  const mockEvent = {
    postData: {
      contents: JSON.stringify({
        id: "U001",
        venue: "Canteen"
      })
    }
  };
  
  const result = doPost(mockEvent);
  Logger.log(result.getContent());
}
*/

