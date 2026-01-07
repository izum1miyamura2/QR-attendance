import pandas as pd
import qrcode
import json
import os
from pathlib import Path

# Configuration
CSV_FILE = "Actual_checkin_participants.csv"  # Source file that has the Unique ID column
OUTPUT_DIR = "qr_codes"
QR_SIZE = 10
QR_BORDER = 4

def create_output_directory():
    """Create the output directory if it doesn't exist."""
    Path(OUTPUT_DIR).mkdir(exist_ok=True)
    print(f"[OK] Output directory '{OUTPUT_DIR}' ready")

def generate_qr_code(data, filename):
    """Generate a QR code from JSON data and save it."""
    # ensure_ascii=True prevents crashes with special characters on Windows
    json_string = json.dumps(data, ensure_ascii=True)
    
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_L,
        box_size=QR_SIZE,
        border=QR_BORDER,
    )
    
    qr.add_data(json_string)
    qr.make(fit=True)
    
    img = qr.make_image(fill_color="black", back_color="white")
    
    filepath = os.path.join(OUTPUT_DIR, f"{filename}.png")
    img.save(filepath)
    
    return filepath, json_string

def main():
    print("=" * 60)
    print("TREADS'25 QR Code Generator")
    print("=" * 60)
    print()
    
    if not os.path.exists(CSV_FILE):
        print(f"[ERROR] '{CSV_FILE}' not found!")
        print(f"   Please create CSV with a 'Unique ID' column (and optional Name/Team columns).")
        return
    
    create_output_directory()
    
    try:
        # Try reading as CSV first (comma-separated)
        try:
            df = pd.read_csv(CSV_FILE)
        except:
            # If that fails, try tab-separated
            df = pd.read_csv(CSV_FILE, sep='\t')
        
        # Normalize headers to lowercase to avoid case-sensitivity issues
        df.columns = [c.strip().lower() for c in df.columns]
        print(f"[OK] Loaded {len(df)} participants")
    except Exception as e:
        print(f"[ERROR] Error reading CSV: {e}")
        return
    
    # Check for required columns
    # CSV headers must include: Unique ID (case insensitive)
    # You can also have Name / Team columns, but they are not required for QR content now.
    required_columns = ['unique id']
    missing = [col for col in required_columns if col not in df.columns]
    
    if missing:
        print(f"[ERROR] Missing columns: {missing}")
        print(f"   Your CSV must have: Name, Team Name")
        return
    
    print()
    print("Generating QR codes...")
    print("-" * 60)
    
    generated_count = 0
    
    for index, row in df.iterrows():
        try:
            # 1. Extract Data
            # Columns were normalized to lowercase, so we access 'unique id'
            unique_id_val = str(row['unique id']).strip()
            
            if not unique_id_val:
                continue

            # 2. Build Payload (The data inside the QR)
            # We keep the JSON payload simple: { "id": "<Unique ID value>" }
            data = {
                "id": unique_id_val
            }
            
            # 3. Create Safe Filename (Name only)
            # Replace spaces and special chars with underscores
            safe_name = "".join(c for c in unique_id_val if c.isalnum() or c in ('_', '-'))
            safe_name = safe_name.replace(' ', '_')
            filename = safe_name
            
            filepath, _ = generate_qr_code(data, filename)
            generated_count += 1
            
            print(f"[OK] ID: {unique_id_val}")
            print(f"    File: {filepath}")
            print()
            
        except Exception as e:
            print(f"[ERROR] Row {index + 2}: {e}")
    
    print("=" * 60)
    print(f"[DONE] Generated {generated_count} QR codes in '{OUTPUT_DIR}'")

if __name__ == "__main__":
    main()