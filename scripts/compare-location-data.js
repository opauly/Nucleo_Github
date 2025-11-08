const XLSX = require('xlsx');
const path = require('path');

// Path to the Excel file
const excelFilePath = path.join(__dirname, '../references/DTA-TABLA POR PROVINCIA-CANTÓN-DISTRITO 2024.xlsx');

// Our current seeding data (exact from Excel)
const ourDistritos = {
  'Alajuela-Alajuela': ['Alajuela', 'Carrizal', 'Desamparados', 'Garita', 'Guácima', 'Río Segundo', 'Sabanilla', 'San Antonio', 'San Isidro', 'San José', 'San Rafael', 'Sarapiquí', 'Tambor', 'Turrucares'],
  'Alajuela-Atenas': ['Atenas', 'Jesús', 'Mercedes', 'San Isidro', 'Concepción', 'San José', 'Santa Eulalia', 'Escobal'],
  'Alajuela-Grecia': ['Grecia', 'San Isidro', 'San José', 'San Roque', 'Tacares', 'Río Cuarto', 'Puente de Piedra', 'Bolívar', 'Bolivar'],
  'Alajuela-Guatuso': ['San Rafael', 'Buenavista', 'Cote', 'Katira'],
  'Alajuela-Los Chiles': ['Los Chiles', 'Caño Negro', 'El Amparo', 'San Jorge'],
  'Alajuela-Naranjo': ['Naranjo', 'San Miguel', 'San José', 'Cirrí Sur', 'San Jerónimo', 'San Juan', 'El Rosario', 'Palmitos'],
  'Alajuela-Orotina': ['Orotina', 'El Mastate', 'Hacienda Vieja', 'Coyolar', 'La Ceiba'],
  'Alajuela-Palmares': ['Palmares', 'Zaragoza', 'Buenos Aires', 'Santiago', 'Candelaria', 'Esquipulas', 'La Granja'],
  'Alajuela-Poás': ['San Pedro', 'San Juan', 'San Rafael', 'Carrillos', 'Sabana Redonda'],
  'Alajuela-Río Cuarto': ['Río Cuarto', 'Santa Rita', 'Santa Isabel'],
  'Alajuela-San Carlos': ['Quesada', 'Florencia', 'Buenavista', 'Aguas Zarcas', 'Venecia', 'Pital', 'La Fortuna', 'La Tigra', 'La Palmera', 'Venado', 'Cutris', 'Monterrey', 'Pocosol'],
  'Alajuela-San Mateo': ['San Mateo', 'Desmonte', 'Jesús María', 'Labrador'],
  'Alajuela-San Ramón': ['San Ramón', 'Santiago', 'San Juan', 'Piedades Norte', 'Piedades Sur', 'San Rafael', 'San Isidro', 'Ángeles', 'Alfaro', 'Volio', 'Concepción', 'Zapotal', 'Peñas Blancas', 'San Lorenzo'],
  'Alajuela-Sarchí': ['Sarchí Norte', 'Sarchí Sur', 'Toro Amarillo', 'San Pedro', 'Rodríguez'],
  'Alajuela-Upala': ['Upala', 'Aguas Claras', 'San José (Pizote)', 'Bijagua', 'Delicias', 'Dos Ríos', 'Yolillal', 'Canalete', 'San José O Pizote'],
  'Alajuela-Zarcero': ['Zarcero', 'Laguna', 'Tapezco', 'Guadalupe', 'Palmira', 'Zapote', 'Brisas', 'Tapesco'],
  
  'Cartago-Alvarado': ['Pacayas', 'Cervantes', 'Capellades'],
  'Cartago-Cartago': ['Oriental', 'Occidental', 'Carmen', 'San Nicolás', 'Aguacaliente (San Francisco)', 'Guadalupe (Arenilla)', 'Corralillo', 'Tierra Blanca', 'Dulce Nombre', 'Llano Grande', 'Quebradilla', 'Aguacaliente o San Francisco', 'Guadalupe o Arenilla'],
  'Cartago-El Guarco': ['El Tejar', 'San Isidro', 'Tobosi', 'Patio de Agua'],
  'Cartago-Jiménez': ['Juan Viñas', 'Tucurrique', 'Pejibaye', 'La Victoria'],
  'Cartago-La Unión': ['Tres Ríos', 'San Diego', 'San Juan', 'San Rafael', 'Concepción', 'Dulce Nombre', 'San Ramón', 'Río Azul'],
  'Cartago-Oreamuno': ['San Rafael', 'Cot', 'Potrero Cerrado', 'Cipreses', 'Santa Rosa'],
  'Cartago-Paraíso': ['Paraíso', 'Santiago', 'Orosi', 'Cachí', 'Llanos de Santa Lucía', 'Birrisito'],
  'Cartago-Turrialba': ['Turrialba', 'La Suiza', 'Peralta', 'Santa Cruz', 'Santa Teresita', 'Pavones', 'Tuis', 'Tayutic', 'Santa Rosa', 'Tres Equis', 'La Isabel', 'Chirripó'],
  
  'Guanacaste-Abangares': ['Las Juntas', 'Sierra', 'San Juan', 'Colorado'],
  'Guanacaste-Bagaces': ['Bagaces', 'Fortuna', 'Mogote', 'Río Naranjo'],
  'Guanacaste-Carrillo': ['Filadelfia', 'Palmira', 'Sardinal', 'Belén'],
  'Guanacaste-Cañas': ['Cañas', 'Palmira', 'San Miguel', 'Bebedero', 'Porozal'],
  'Guanacaste-Hojancha': ['Hojancha', 'Monte Romo', 'Puerto Carrillo', 'Huacas'],
  'Guanacaste-La Cruz': ['La Cruz', 'Santa Cecilia', 'Garita', 'Santa Elena'],
  'Guanacaste-Liberia': ['Liberia', 'Cañas Dulces', 'Mayorga', 'Nacascolo', 'Curubandé'],
  'Guanacaste-Nandayure': ['Carmona', 'Santa Rita', 'Zapotal', 'San Pablo', 'Porvenir', 'Bejuco'],
  'Guanacaste-Nicoya': ['Nicoya', 'Mansion', 'San Antonio', 'Quebrada Honda', 'Sámara', 'Nosara', 'Belén de Nosarita'],
  'Guanacaste-Santa Cruz': ['Santa Cruz', 'Bolson', 'Veintisiete de Abril', 'Tempate', 'Cartagena', 'Cuajiniquil', 'Diriá', 'Cabo Velas', 'Tamarindo'],
  'Guanacaste-Tilarán': ['Tilarán', 'Quebrada Grande', 'Tronadora', 'Santa Rosa', 'Líbano', 'Tierras Morenas', 'Arenal'],
  
  'Heredia-Barva': ['Barva', 'San Pedro', 'San Pablo', 'San Roque', 'Santa Lucía', 'San José de la Montaña'],
  'Heredia-Belén': ['San Antonio', 'La Ribera', 'La Asunción'],
  'Heredia-Flores': ['San Joaquín', 'Barrantes', 'Llorente'],
  'Heredia-Heredia': ['Heredia', 'Mercedes', 'San Francisco', 'Ulloa', 'Varablanca'],
  'Heredia-San Isidro': ['San Isidro', 'San José', 'Concepción', 'San Francisco'],
  'Heredia-San Pablo': ['San Pablo', 'Rincón de Sabanilla'],
  'Heredia-San Rafael': ['San Rafael', 'Santiago', 'Ángeles', 'Concepción'],
  'Heredia-Santa Bárbara': ['Santa Bárbara', 'San Pedro', 'San Juan', 'Jesús', 'Santo Domingo', 'Puraba'],
  'Heredia-Santo Domingo': ['Santo Domingo', 'San Vicente', 'San Miguel', 'Paracito', 'Santo Tomás', 'Santa Rosa', 'Tures', 'Pará'],
  'Heredia-Sarapiquí': ['Puerto Viejo', 'La Virgen', 'Horquetas', 'Llanuras del Gaspar', 'Cureña'],
  
  'Limón-Guácimo': ['Guácimo', 'Mercedes', 'Pocora', 'Río Jiménez', 'Duacarí'],
  'Limón-Limón': ['Limón', 'Valle La Estrella', 'Río Blanco', 'Matama'],
  'Limón-Matina': ['Matina', 'Batán', 'Carrandi'],
  'Limón-Pococí': ['Guápiles', 'Jiménez', 'Rita', 'Roxana', 'Cariari', 'Colorado', 'La Colonia'],
  'Limón-Siquirres': ['Siquirres', 'Pacuarito', 'Florida', 'Germania', 'El Cairo', 'Alegría'],
  'Limón-Talamanca': ['Bratsi', 'Sixaola', 'Cahuita', 'Telire'],
  
  'Puntarenas-Buenos Aires': ['Palmar', 'Sierpe', 'Bahía Ballena', 'Piedras Blancas', 'Bahía Drake'],
  'Puntarenas-Corredores': ['Corredor', 'La Cuesta', 'Canoas', 'Laurel'],
  'Puntarenas-Coto Brus': ['San Vito', 'Sabalito', 'Aguabuena', 'Limoncito', 'Pittier', 'Gutiérrez Braun'],
  'Puntarenas-Esparza': ['Espíritu Santo', 'San Juan Grande', 'Macacona', 'San Rafael', 'San Jerónimo'],
  'Puntarenas-Garabito': ['Jacó', 'Tárcoles'],
  'Puntarenas-Golfito': ['Golfito', 'Puerto Jiménez', 'Guaycará', 'Pavón'],
  'Puntarenas-Montes de Oro': ['Miramar', 'La Unión', 'San Isidro'],
  'Puntarenas-Monteverde': ['Monteverde'],
  'Puntarenas-Osa': ['Puerto Cortés', 'Palmar', 'Sierpe', 'Bahía Ballena', 'Piedras Blancas', 'Bahía Drake', 'Golfito', 'Puerto Jiménez', 'Guaycará', 'Pavón'],
  'Puntarenas-Parrita': ['Parrita'],
  'Puntarenas-Puerto Jiménez': ['Puerto Jiménez', 'La Palma', 'Carate', 'Río Claro'],
  'Puntarenas-Puntarenas': ['Puntarenas', 'Pitahaya', 'Chomes', 'Lepanto', 'Paquera', 'Manzanillo', 'Guacimal', 'Barranca', 'Monte Verde', 'Isla del Coco', 'Cobano', 'Chacarita', 'Chira', 'Acapulco', 'El Roble', 'Arancibia'],
  'Puntarenas-Quepos': ['Quepos', 'Savegre', 'Naranjito'],
  
  'San José-Acosta': ['San Ignacio', 'Guaitil', 'Palmichal', 'Cangrejal', 'Sabanillas'],
  'San José-Alajuelita': ['Alajuelita', 'San Josecito', 'San Antonio', 'Concepción', 'San Felipe'],
  'San José-Aserrí': ['Aserrí', 'Tarbaca', 'Vuelta de Jorco', 'San Gabriel', 'La Legua', 'Monterrey', 'Salitrillos', 'Legua'],
  'San José-Curridabat': ['Curridabat', 'Granadilla', 'Sánchez', 'Tirrases'],
  'San José-Desamparados': ['Desamparados', 'San Miguel', 'San Juan de Dios', 'San Rafael Arriba', 'San Antonio', 'Frailes', 'Patarrá', 'San Cristóbal', 'Rosario', 'Damas', 'San Rafael Abajo', 'Gravilias', 'Los Guidos', 'Patarra', 'San Cristobal', 'Los Guido'],
  'San José-Dota': ['Santa María', 'Jardín', 'Copey'],
  'San José-Escazú': ['Escazú', 'San Antonio', 'San Rafael'],
  'San José-Goicoechea': ['Guadalupe', 'San Francisco', 'Calle Blancos', 'Mata de Plátano', 'Ipís', 'Rancho Redondo', 'Purral', 'Ipis'],
  'San José-León Cortés Castro': ['San Pablo', 'San Andrés', 'Llano Bonito', 'San Isidro', 'Santa Cruz', 'San Antonio'],
  'San José-Montes de Oca': ['San Pedro', 'Sabanilla', 'Mercedes', 'San Rafael'],
  'San José-Mora': ['Colón', 'Guayabo', 'Tabarcia', 'Piedras Negras', 'Picagres', 'Jaris', 'Quitirrisí'],
  'San José-Moravia': ['San Vicente', 'San Jerónimo', 'La Trinidad'],
  'San José-Puriscal': ['Santiago', 'Mercedes Sur', 'Barbacoas', 'Grifo Alto', 'San Rafael', 'Candelarita', 'Desamparaditos', 'San Antonio', 'Chires'],
  'San José-Pérez Zeledón': ['San Isidro de El General', 'El General', 'Daniel Flores', 'Rivas', 'San Pedro', 'Platanares', 'Pejibaye', 'Cajón', 'Barú', 'Río Nuevo', 'Páramo', 'La Amistad', 'Paramo', 'La  Amistad'],
  'San José-San José': ['Carmen', 'Merced', 'Hospital', 'Catedral', 'Zapote', 'San Francisco de Dos Ríos', 'Uruca', 'Mata Redonda', 'Pavas', 'Hatillo', 'San Sebastián'],
  'San José-Santa Ana': ['Santa Ana', 'Salitral', 'Pozos', 'Uruca', 'Piedades', 'Brasil'],
  'San José-Tarrazú': ['San Marcos', 'San Lorenzo', 'San Carlos'],
  'San José-Tibás': ['San Juan', 'Cinco Esquinas', 'Anselmo Llorente', 'León XIII', 'Colima'],
  'San José-Turrubares': ['San Pablo', 'San Pedro', 'San Juan de Mata', 'San Luis', 'Carara'],
  'San José-Vazquez de Coronado': ['San Isidro', 'San Rafael', 'Dulce Nombre', 'Patalillo', 'Cascajal', 'Dulce Nombre de Jesús']
};

function compareData() {
  try {
    console.log('📊 Comparing our data with Excel file...');
    
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
    
    // Extract Excel data
    const excelDistritos = new Map();
    
    dataRows.forEach((row) => {
      if (row && row.length >= 8) {
        const provincia = row[2]?.toString().trim();
        const canton = row[4]?.toString().trim();
        const distrito = row[8]?.toString().trim();
        
        if (provincia && canton && distrito && 
            provincia !== 'undefined' && canton !== 'undefined' && distrito !== 'undefined') {
          const key = `${provincia}-${canton}`;
          if (!excelDistritos.has(key)) {
            excelDistritos.set(key, new Set());
          }
          excelDistritos.get(key).add(distrito);
        }
      }
    });
    
    console.log('\n📊 COMPARISON RESULTS:');
    console.log('Excel file has', excelDistritos.size, 'canton-distrito relationships');
    
    // Count total distritos in Excel
    let totalExcelDistritos = 0;
    excelDistritos.forEach((distritos) => {
      totalExcelDistritos += distritos.size;
    });
    console.log('Total distritos in Excel:', totalExcelDistritos);
    
    // Count our distritos
    let totalOurDistritos = 0;
    Object.values(ourDistritos).forEach((distritos) => {
      totalOurDistritos += distritos.length;
    });
    console.log('Total distritos in our data:', totalOurDistritos);
    
    console.log('\n🔍 MISSING CANTONES:');
    let missingCantones = 0;
    excelDistritos.forEach((distritos, key) => {
      if (!ourDistritos[key]) {
        console.log(`❌ Missing: ${key}`);
        missingCantones++;
      }
    });
    
    console.log('\n🔍 EXTRA CANTONES IN OUR DATA:');
    let extraCantones = 0;
    Object.keys(ourDistritos).forEach((key) => {
      if (!excelDistritos.has(key)) {
        console.log(`❌ Extra: ${key}`);
        extraCantones++;
      }
    });
    
    console.log('\n🔍 MISSING DISTRITOS BY CANTON:');
    excelDistritos.forEach((excelDistritosSet, key) => {
      if (ourDistritos[key]) {
        const ourDistritosSet = new Set(ourDistritos[key]);
        const missingDistritos = [...excelDistritosSet].filter(d => !ourDistritosSet.has(d));
        if (missingDistritos.length > 0) {
          console.log(`❌ ${key} missing distritos: ${missingDistritos.join(', ')}`);
        }
      }
    });
    
    console.log('\n📋 SUMMARY:');
    console.log(`Excel distritos: ${totalExcelDistritos}`);
    console.log(`Our distritos: ${totalOurDistritos}`);
    console.log(`Missing cantones: ${missingCantones}`);
    console.log(`Extra cantones: ${extraCantones}`);
    console.log(`Difference: ${totalExcelDistritos - totalOurDistritos}`);
    
  } catch (error) {
    console.error('❌ Error comparing data:', error.message);
  }
}

compareData();
