const XLSX = require('xlsx');
const path = require('path');

// Path to the Excel file
const excelFilePath = path.join(__dirname, '../references/DTA-TABLA POR PROVINCIA-CANTÓN-DISTRITO 2024.xlsx');

function parseLocationData() {
  try {
    console.log('📊 Parsing Excel file:', excelFilePath);
    
    // Read the Excel file
    const workbook = XLSX.readFile(excelFilePath);
    
    console.log('📋 Available sheets:', workbook.SheetNames);
    
    // Focus on the "DTA OFICIALIZACION" sheet which has the most data
    const sheetName = 'DTA OFICIALIZACION';
    console.log(`\n📋 PARSING SHEET: ${sheetName}`);
    
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    
    console.log(`📊 Total rows in ${sheetName}:`, data.length);
    
    // Show first 10 rows to understand the structure
    console.log('\n📋 First 10 rows:');
    data.slice(0, 10).forEach((row, index) => {
      console.log(`Row ${index + 1}:`, row);
    });
    
    // Parse the location data
    parseSheetData(data, sheetName);
    
  } catch (error) {
    console.error('❌ Error parsing Excel file:', error.message);
  }
}

function parseSheetData(data, sheetName) {
  console.log(`\n📊 PARSING SHEET: ${sheetName}`);
  
  // Extract unique values
  const provincias = new Set();
  const cantones = new Set();
  const distritos = new Set();
  const provinciaCantonMap = new Map();
  const cantonDistritoMap = new Map();
  
  // Find the data rows (skip headers)
  let startRow = 0;
  for (let i = 0; i < Math.min(20, data.length); i++) {
    const row = data[i];
    if (row && row.length >= 8) {
      const provinciaCell = row[2]?.toString().trim(); // Column 2: PROVINCIA
      // Look for a row that has a provincia name (not header text)
      if (provinciaCell && provinciaCell.length > 0 && 
          !provinciaCell.includes('PROVINCIA') &&
          !provinciaCell.includes('CÓDIGO') &&
          !provinciaCell.includes('REGISTRO') && 
          !provinciaCell.includes('INSTITUTO') && 
          !provinciaCell.includes('DIVISIÓN')) {
        startRow = i;
        break;
      }
    }
  }
  
  console.log(`📋 Starting data extraction from row ${startRow + 1}`);
  
  const dataRows = data.slice(startRow);
  
  dataRows.forEach((row, index) => {
    if (row && row.length >= 8) {
      // Based on the Excel structure:
      // Column 2: PROVINCIA
      // Column 4: CANTÓN  
      // Column 8: DISTRITO
      const provincia = row[2]?.toString().trim();
      const canton = row[4]?.toString().trim();
      const distrito = row[8]?.toString().trim();
      
      if (provincia && provincia !== 'undefined' && provincia.length > 0) {
        provincias.add(provincia);
        
        if (!provinciaCantonMap.has(provincia)) {
          provinciaCantonMap.set(provincia, new Set());
        }
        
        if (canton && canton !== 'undefined' && canton.length > 0) {
          provinciaCantonMap.get(provincia).add(canton);
          cantones.add(canton);
          
          if (!cantonDistritoMap.has(canton)) {
            cantonDistritoMap.set(canton, new Set());
          }
          
          if (distrito && distrito !== 'undefined' && distrito.length > 0) {
            cantonDistritoMap.get(canton).add(distrito);
            distritos.add(distrito);
          }
        }
      }
    }
  });
  
  console.log('\n📊 EXTRACTED DATA:');
  console.log('🏛️ Provincias:', provincias.size);
  console.log('🏘️ Cantones:', cantones.size);
  console.log('🏠 Distritos:', distritos.size);
  
  if (provincias.size > 0) {
    console.log('\n🏛️ PROVINCIAS:');
    Array.from(provincias).sort().forEach(provincia => {
      console.log(`  - ${provincia}`);
    });
    
    console.log('\n🔗 PROVINCIA -> CANTONES RELATIONSHIPS:');
    Array.from(provinciaCantonMap.entries()).sort().forEach(([provincia, cantonesSet]) => {
      console.log(`\n${provincia} (${cantonesSet.size} cantones):`);
      Array.from(cantonesSet).sort().forEach(canton => {
        console.log(`  - ${canton}`);
      });
    });
    
    console.log('\n🔗 CANTON -> DISTRITOS RELATIONSHIPS (first 3 cantones):');
    let count = 0;
    Array.from(cantonDistritoMap.entries()).sort().forEach(([canton, distritosSet]) => {
      if (count < 3) {
        console.log(`\n${canton} (${distritosSet.size} distritos):`);
        Array.from(distritosSet).sort().forEach(distrito => {
          console.log(`  - ${distrito}`);
        });
        count++;
      }
    });
    
    // Generate SQL-like structure for comparison
    console.log('\n📋 SUGGESTED TABLE STRUCTURE:');
    console.log(`
-- Provincias table
CREATE TABLE provincias (
  id SERIAL PRIMARY KEY,
  nombre TEXT NOT NULL UNIQUE
);

-- Cantones table  
CREATE TABLE cantones (
  id SERIAL PRIMARY KEY,
  nombre TEXT NOT NULL,
  provincia_id INTEGER REFERENCES provincias(id),
  UNIQUE(nombre, provincia_id)
);

-- Distritos table
CREATE TABLE distritos (
  id SERIAL PRIMARY KEY,
  nombre TEXT NOT NULL,
  canton_id INTEGER REFERENCES cantones(id),
  UNIQUE(nombre, canton_id)
);
    `);
    
    // Generate sample data
    console.log('\n📊 SAMPLE DATA FOR COMPARISON:');
    console.log('\n-- Sample Provincias:');
    Array.from(provincias).sort().slice(0, 3).forEach(provincia => {
      console.log(`INSERT INTO provincias (nombre) VALUES ('${provincia}');`);
    });
    
    console.log('\n-- Sample Cantones for San José:');
    const sanJoseCantones = provinciaCantonMap.get('San José');
    if (sanJoseCantones) {
      Array.from(sanJoseCantones).sort().slice(0, 3).forEach(canton => {
        console.log(`INSERT INTO cantones (nombre, provincia_id) VALUES ('${canton}', (SELECT id FROM provincias WHERE nombre = 'San José'));`);
      });
    }
    
    console.log('\n-- Sample Distritos for San José canton:');
    const sanJoseCantonDistritos = cantonDistritoMap.get('San José');
    if (sanJoseCantonDistritos) {
      Array.from(sanJoseCantonDistritos).sort().slice(0, 3).forEach(distrito => {
        console.log(`INSERT INTO distritos (nombre, canton_id) VALUES ('${distrito}', (SELECT id FROM cantones WHERE nombre = 'San José' AND provincia_id = (SELECT id FROM provincias WHERE nombre = 'San José')));`);
      });
    }
    
  } else {
    console.log('❌ No location data found in this sheet');
  }
}

// Run the parser
parseLocationData();
