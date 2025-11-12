const XLSX = require('xlsx');
const path = require('path');

// Path to the Excel file
const excelFilePath = path.join(__dirname, '../references/DTA-TABLA POR PROVINCIA-CANTÓN-DISTRITO 2024.xlsx');

function extractExactDistritos() {
  try {
    console.log('📊 Extracting exact distritos from Excel file...');
    
    // Read the Excel file
    const workbook = XLSX.readFile(excelFilePath);
    const sheetName = 'DTA OFICIALIZACION';
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    
    // Find the data rows (skip headers)
    let startRow = 0;
    for (let i = 0; i < Math.min(20, data.length); i++) {
      const row = data[i];
      if (row && row.length >= 8) {
        const provinciaCell = row[2]?.toString().trim();
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
    
    const dataRows = data.slice(startRow);
    
    // Extract exact distritos
    const exactDistritos = new Map();
    
    dataRows.forEach((row) => {
      if (row && row.length >= 8) {
        const provincia = row[2]?.toString().trim();
        const canton = row[4]?.toString().trim();
        const distrito = row[8]?.toString().trim();
        
        if (provincia && canton && distrito && 
            provincia !== 'undefined' && canton !== 'undefined' && distrito !== 'undefined') {
          const key = `${provincia}-${canton}`;
          if (!exactDistritos.has(key)) {
            exactDistritos.set(key, []);
          }
          exactDistritos.get(key).push(distrito);
        }
      }
    });
    
    console.log('\n📊 EXACT DISTRITOS FROM EXCEL:');
    console.log('Total canton-distrito relationships:', exactDistritos.size);
    
    let totalDistritos = 0;
    exactDistritos.forEach((distritos) => {
      totalDistritos += distritos.length;
    });
    console.log('Total distritos:', totalDistritos);
    
    console.log('\n📋 EXACT DISTRITOS BY CANTON:');
    exactDistritos.forEach((distritos, key) => {
      console.log(`${key}: [${distritos.map(d => `'${d}'`).join(', ')}]`);
    });
    
    // Generate the exact seeding data
    console.log('\n📋 EXACT SEEDING DATA:');
    console.log('const distritos = {');
    exactDistritos.forEach((distritos, key) => {
      console.log(`  '${key}': [${distritos.map(d => `'${d}'`).join(', ')}],`);
    });
    console.log('};');
    
  } catch (error) {
    console.error('❌ Error extracting distritos:', error.message);
  }
}

extractExactDistritos();





