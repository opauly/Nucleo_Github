/**
 * Script to import historical attendance data from CSV
 * Run with: node scripts/import-attendance-history.js
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Load environment variables (try .env.local first, then .env)
try {
  require('dotenv').config({ path: path.join(__dirname, '../.env.local') });
} catch (e) {
  try {
    require('dotenv').config({ path: path.join(__dirname, '../.env') });
  } catch (e2) {
    // If dotenv is not available, environment variables should be set manually
    console.warn('dotenv not found. Make sure environment variables are set.');
  }
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase configuration. Please check your .env.local file.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Parse CSV file
function parseCSV(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n').filter(line => line.trim());
  
  // Skip header lines (first 2 lines)
  const dataLines = lines.slice(2);
  
  const records = [];
  
  for (const line of dataLines) {
    if (!line.trim()) continue;
    
    // Parse CSV line (handle commas in values)
    const values = line.split(',').map(v => v.trim());
    
    if (values.length < 2) continue;
    
    const fecha = values[0].trim();
    const adultos = parseInt(values[1]) || 0;
    const ninos = parseInt(values[2]) || 0;
    const personasNuevas = parseInt(values[3]) || 0;
    const bebes = parseInt(values[4]) || 0;
    const teens = parseInt(values[5]) || 0;
    
    // Skip if no date
    if (!fecha) continue;
    
    // Convert date from DD/MM/YY or DD/MM/YYYY to YYYY-MM-DD
    let attendanceDate;
    try {
      // Remove leading spaces from date
      const cleanFecha = fecha.trim();
      const dateParts = cleanFecha.split('/');
      
      if (dateParts.length === 3) {
        const day = parseInt(dateParts[0]);
        const month = parseInt(dateParts[1]);
        let year = parseInt(dateParts[2]);
        
        // Handle 2-digit year (assume 20xx for years < 50, 19xx otherwise)
        // Handle 4-digit year (already full year)
        if (year < 100) {
          year = year < 50 ? 2000 + year : 1900 + year;
        }
        
        attendanceDate = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      } else {
        console.warn(`Skipping invalid date format: ${fecha}`);
        continue;
      }
    } catch (error) {
      console.warn(`Error parsing date ${fecha}:`, error.message);
      continue;
    }
    
    records.push({
      attendance_date: attendanceDate,
      adults_count: adultos,
      kids_count: ninos,
      new_people_count: personasNuevas,
      babies_count: bebes,
      teens_count: teens
    });
  }
  
  return records;
}

// Import records to database
async function importRecords(records) {
  console.log(`\nImporting ${records.length} attendance records...\n`);
  
  let successCount = 0;
  let updateCount = 0;
  let insertCount = 0;
  let errorCount = 0;
  
  for (const record of records) {
    try {
      // Check if record exists
      const { data: existing } = await supabase
        .from('service_attendance')
        .select('id')
        .eq('attendance_date', record.attendance_date)
        .single();
      
      if (existing) {
        // Update existing record
        const { error } = await supabase
          .from('service_attendance')
          .update({
            adults_count: record.adults_count,
            teens_count: record.teens_count,
            kids_count: record.kids_count,
            babies_count: record.babies_count,
            new_people_count: record.new_people_count
          })
          .eq('attendance_date', record.attendance_date);
        
        if (error) {
          console.error(`Error updating ${record.attendance_date}:`, error.message);
          errorCount++;
        } else {
          updateCount++;
          console.log(`✓ Updated: ${record.attendance_date} - Adults: ${record.adults_count}, Teens: ${record.teens_count}, Kids: ${record.kids_count}, Babies: ${record.babies_count}, New: ${record.new_people_count}`);
        }
      } else {
        // Insert new record
        const { error } = await supabase
          .from('service_attendance')
          .insert({
            ...record,
            recorded_by: null // Historical data, no recorder
          });
        
        if (error) {
          console.error(`Error inserting ${record.attendance_date}:`, error.message);
          errorCount++;
        } else {
          insertCount++;
          console.log(`✓ Inserted: ${record.attendance_date} - Adults: ${record.adults_count}, Teens: ${record.teens_count}, Kids: ${record.kids_count}, Babies: ${record.babies_count}, New: ${record.new_people_count}`);
        }
      }
      
      successCount++;
    } catch (error) {
      console.error(`Error processing ${record.attendance_date}:`, error.message);
      errorCount++;
    }
  }
  
  console.log(`\n=== Import Summary ===`);
  console.log(`Total records processed: ${records.length}`);
  console.log(`Successfully imported: ${successCount}`);
  console.log(`  - Updated: ${updateCount}`);
  console.log(`  - Inserted: ${insertCount}`);
  console.log(`Errors: ${errorCount}`);
}

// Main execution
async function main() {
  const csvPath = path.join(__dirname, '../references/Asistencia Núcleo - 2025.csv');
  
  if (!fs.existsSync(csvPath)) {
    console.error(`CSV file not found: ${csvPath}`);
    process.exit(1);
  }
  
  console.log('Parsing CSV file...');
  const records = parseCSV(csvPath);
  
  if (records.length === 0) {
    console.error('No records found in CSV file');
    process.exit(1);
  }
  
  console.log(`Found ${records.length} records to import`);
  
  // Confirm before proceeding
  console.log('\nThis will update/insert attendance records for 2025.');
  console.log('Press Ctrl+C to cancel, or wait 3 seconds to proceed...\n');
  
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  await importRecords(records);
  
  console.log('\nImport completed!');
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});

