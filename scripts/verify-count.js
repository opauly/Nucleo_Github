// Verify the count of distritos in our current seeding data
const distritos = {
  'San José-San José': ['Carmen', 'Merced', 'Hospital', 'Catedral', 'Zapote', 'San Francisco de Dos Ríos', 'Uruca', 'Mata Redonda', 'Pavas', 'Hatillo', 'San Sebastián'],
  'San José-Escazú': ['Escazú', 'San Antonio', 'San Rafael'],
  'San José-Desamparados': ['Desamparados', 'San Miguel', 'San Juan de Dios', 'San Rafael Arriba', 'San Antonio', 'Frailes', 'Patarra', 'San Cristobal', 'Rosario', 'Damas', 'San Rafael Abajo', 'Gravilias', 'Los Guido'],
  'San José-Puriscal': ['Santiago', 'Mercedes Sur', 'Barbacoas', 'Grifo Alto', 'San Rafael', 'Candelarita', 'Desamparaditos', 'San Antonio', 'Chires'],
  'San José-Tarrazú': ['San Marcos', 'San Lorenzo', 'San Carlos'],
  'San José-Aserrí': ['Aserrí', 'Tarbaca', 'Vuelta de Jorco', 'San Gabriel', 'Legua', 'Monterrey', 'Salitrillos'],
  'San José-Mora': ['Colón', 'Guayabo', 'Tabarcia', 'Piedras Negras', 'Picagres', 'Jaris', 'Quitirrisí'],
  'San José-Goicoechea': ['Guadalupe', 'San Francisco', 'Calle Blancos', 'Mata de Plátano', 'Ipis', 'Rancho Redondo', 'Purral'],
  'San José-Santa Ana': ['Santa Ana', 'Salitral', 'Pozos', 'Uruca', 'Piedades', 'Brasil'],
  'San José-Alajuelita': ['Alajuelita', 'San Josecito', 'San Antonio', 'Concepción', 'San Felipe'],
  'San José-Vazquez de Coronado': ['San Isidro', 'San Rafael', 'Dulce Nombre de Jesús', 'Patalillo', 'Cascajal'],
  'San José-Acosta': ['San Ignacio', 'Guaitil', 'Palmichal', 'Cangrejal', 'Sabanillas'],
  'San José-Tibás': ['San Juan', 'Cinco Esquinas', 'Anselmo Llorente', 'León XIII', 'Colima'],
  'San José-Moravia': ['San Vicente', 'San Jerónimo', 'La Trinidad'],
  'San José-Montes de Oca': ['San Pedro', 'Sabanilla', 'Mercedes', 'San Rafael'],
  'San José-Turrubares': ['San Pablo', 'San Pedro', 'San Juan de Mata', 'San Luis', 'Carara'],
  'San José-Dota': ['Santa María', 'Jardín', 'Copey'],
  'San José-Curridabat': ['Curridabat', 'Granadilla', 'Sánchez', 'Tirrases'],
  'San José-Pérez Zeledón': ['San Isidro de El General', 'El General', 'Daniel Flores', 'Rivas', 'San Pedro', 'Platanares', 'Pejibaye', 'Cajón', 'Barú', 'Río Nuevo', 'Paramo', 'La  Amistad'],
  'San José-León Cortés Castro': ['San Pablo', 'San Andrés', 'Llano Bonito', 'San Isidro', 'Santa Cruz', 'San Antonio'],
  'Alajuela-Alajuela': ['Alajuela', 'San José', 'Carrizal', 'San Antonio', 'Guácima', 'San Isidro', 'Sabanilla', 'San Rafael', 'Río Segundo', 'Desamparados', 'Turrucares', 'Tambor', 'Garita', 'Sarapiquí'],
  'Alajuela-San Ramón': ['San Ramón', 'Santiago', 'San Juan', 'Piedades Norte', 'Piedades Sur', 'San Rafael', 'San Isidro', 'Ángeles', 'Alfaro', 'Volio', 'Concepción', 'Zapotal', 'Peñas Blancas', 'San Lorenzo'],
  'Alajuela-Grecia': ['Grecia', 'San Isidro', 'San José', 'San Roque', 'Tacares', 'Puente de Piedra', 'Bolivar'],
  'Alajuela-San Mateo': ['San Mateo', 'Desmonte', 'Jesús María', 'Labrador'],
  'Alajuela-Atenas': ['Atenas', 'Jesús', 'Mercedes', 'San Isidro', 'Concepción', 'San José', 'Santa Eulalia', 'Escobal'],
  'Alajuela-Naranjo': ['Naranjo', 'San Miguel', 'San José', 'Cirrí Sur', 'San Jerónimo', 'San Juan', 'El Rosario', 'Palmitos'],
  'Alajuela-Palmares': ['Palmares', 'Zaragoza', 'Buenos Aires', 'Santiago', 'Candelaria', 'Esquipulas', 'La Granja'],
  'Alajuela-Poás': ['San Pedro', 'San Juan', 'San Rafael', 'Carrillos', 'Sabana Redonda'],
  'Alajuela-Orotina': ['Orotina', 'El Mastate', 'Hacienda Vieja', 'Coyolar', 'La Ceiba'],
  'Alajuela-San Carlos': ['Quesada', 'Florencia', 'Buenavista', 'Aguas Zarcas', 'Venecia', 'Pital', 'La Fortuna', 'La Tigra', 'La Palmera', 'Venado', 'Cutris', 'Monterrey', 'Pocosol'],
  'Alajuela-Zarcero': ['Zarcero', 'Laguna', 'Tapesco', 'Guadalupe', 'Palmira', 'Zapote', 'Brisas'],
  'Alajuela-Sarchí': ['Sarchí Norte', 'Sarchí Sur', 'Toro Amarillo', 'San Pedro', 'Rodríguez'],
  'Alajuela-Upala': ['Upala', 'Aguas Claras', 'San José O Pizote', 'Bijagua', 'Delicias', 'Dos Ríos', 'Yolillal', 'Canalete'],
  'Alajuela-Los Chiles': ['Los Chiles', 'Caño Negro', 'El Amparo', 'San Jorge'],
  'Alajuela-Guatuso': ['San Rafael', 'Buenavista', 'Cote', 'Katira'],
  'Alajuela-Río Cuarto': ['Río Cuarto', 'Santa Rita', 'Santa Isabel'],
  'Cartago-Cartago': ['Oriental', 'Occidental', 'Carmen', 'San Nicolás', 'Aguacaliente o San Francisco', 'Guadalupe o Arenilla', 'Corralillo', 'Tierra Blanca', 'Dulce Nombre', 'Llano Grande', 'Quebradilla'],
  'Cartago-Paraíso': ['Paraíso', 'Santiago', 'Orosi', 'Cachí', 'Llanos de Santa Lucía', 'Birrisito'],
  'Cartago-La Unión': ['Tres Ríos', 'San Diego', 'San Juan', 'San Rafael', 'Concepción', 'Dulce Nombre', 'San Ramón', 'Río Azul'],
  'Cartago-Jiménez': ['Juan Viñas', 'Tucurrique', 'Pejibaye', 'La Victoria'],
  'Cartago-Turrialba': ['Turrialba', 'La Suiza', 'Peralta', 'Santa Cruz', 'Santa Teresita', 'Pavones', 'Tuis', 'Tayutic', 'Santa Rosa', 'Tres Equis', 'La Isabel', 'Chirripó'],
  'Cartago-Alvarado': ['Pacayas', 'Cervantes', 'Capellades'],
  'Cartago-Oreamuno': ['San Rafael', 'Cot', 'Potrero Cerrado', 'Cipreses', 'Santa Rosa'],
  'Cartago-El Guarco': ['El Tejar', 'San Isidro', 'Tobosi', 'Patio de Agua'],
  'Heredia-Heredia': ['Heredia', 'Mercedes', 'San Francisco', 'Ulloa', 'Varablanca'],
  'Heredia-Barva': ['Barva', 'San Pedro', 'San Pablo', 'San Roque', 'Santa Lucía', 'San José de la Montaña', 'Puente Salas'],
  'Heredia-Santo Domingo': ['Santo Domingo', 'San Vicente', 'San Miguel', 'Paracito', 'Santo Tomás', 'Santa Rosa', 'Tures', 'Pará'],
  'Heredia-Santa Bárbara': ['Santa Bárbara', 'San Pedro', 'San Juan', 'Jesús', 'Santo Domingo', 'Purabá'],
  'Heredia-San Rafael': ['San Rafael', 'San Josecito', 'Santiago', 'Ángeles', 'Concepción'],
  'Heredia-San Isidro': ['San Isidro', 'San José', 'Concepción', 'San Francisco'],
  'Heredia-Belén': ['San Antonio', 'La Ribera', 'La Asunción'],
  'Heredia-Flores': ['San Joaquín', 'Barrantes', 'Llorente'],
  'Heredia-San Pablo': ['San Pablo', 'Rincón de Sabanilla'],
  'Heredia-Sarapiquí': ['Puerto Viejo', 'La Virgen', 'Las Horquetas', 'Llanuras del Gaspar', 'Cureña'],
  'Guanacaste-Liberia': ['Liberia', 'Cañas Dulces', 'Mayorga', 'Nacascolo', 'Curubandé'],
  'Guanacaste-Nicoya': ['Nicoya', 'Mansión', 'San Antonio', 'Quebrada Honda', 'Sámara', 'Nosara', 'Belén de Nosarita'],
  'Guanacaste-Santa Cruz': ['Santa Cruz', 'Bolsón', 'Veintisiete de Abril', 'Tempate', 'Cartagena', 'Cuajiniquil', 'Diriá', 'Cabo Velas', 'Tamarindo'],
  'Guanacaste-Bagaces': ['Bagaces', 'La Fortuna', 'Mogote', 'Río Naranjo'],
  'Guanacaste-Carrillo': ['Filadelfia', 'Palmira', 'Sardinal', 'Belén'],
  'Guanacaste-Cañas': ['Cañas', 'Palmira', 'San Miguel', 'Bebedero', 'Porozal'],
  'Guanacaste-Abangares': ['Las Juntas', 'Sierra', 'San Juan', 'Colorado'],
  'Guanacaste-Tilarán': ['Tilarán', 'Quebrada Grande', 'Tronadora', 'Santa Rosa', 'Líbano', 'Tierras Morenas', 'Arenal', 'Cabeceras'],
  'Guanacaste-Nandayure': ['Carmona', 'Santa Rita', 'Zapotal', 'San Pablo', 'Porvenir', 'Bejuco'],
  'Guanacaste-La Cruz': ['La Cruz', 'Santa Cecilia', 'La Garita', 'Santa Elena'],
  'Guanacaste-Hojancha': ['Hojancha', 'Monte Romo', 'Puerto Carrillo', 'Huacas', 'Matambú'],
  'Puntarenas-Puntarenas': ['Puntarenas', 'Pitahaya', 'Chomes', 'Lepanto', 'Paquera', 'Manzanillo', 'Guacimal', 'Barranca', 'Isla del Coco', 'Cóbano', 'Chacarita', 'Chira', 'Acapulco', 'El Roble', 'Arancibia'],
  'Puntarenas-Esparza': ['Espíritu Santo', 'San Juan Grande', 'Macacona', 'San Rafael', 'San Jerónimo', 'Caldera'],
  'Puntarenas-Buenos Aires': ['Buenos Aires', 'Volcán', 'Potrero Grande', 'Boruca', 'Pilas', 'Colinas', 'Chánguena', 'Biolley', 'Brunka'],
  'Puntarenas-Montes de Oro': ['Miramar', 'La Unión', 'San Isidro'],
  'Puntarenas-Osa': ['Puerto Cortés', 'Palmar', 'Sierpe', 'Bahía Ballena', 'Piedras Blancas', 'Bahía Drake'],
  'Puntarenas-Quepos': ['Quepos', 'Savegre', 'Naranjito'],
  'Puntarenas-Golfito': ['Golfito', 'Guaycará', 'Pavón'],
  'Puntarenas-Coto Brus': ['San Vito', 'Sabalito', 'Aguabuena', 'Limoncito', 'Pittier', 'Gutiérrez Braun'],
  'Puntarenas-Parrita': ['Parrita'],
  'Puntarenas-Corredores': ['Corredor', 'La Cuesta', 'Canoas', 'Laurel'],
  'Puntarenas-Garabito': ['Jacó', 'Tárcoles', 'Lagunillas'],
  'Puntarenas-Monteverde': ['Monteverde'],
  'Puntarenas-Puerto Jiménez': ['Puerto Jiménez'],
  'Limón-Limón': ['Limón', 'Valle La Estrella', 'Río Blanco', 'Matama'],
  'Limón-Pococí': ['Guápiles', 'Jiménez', 'Rita', 'Roxana', 'Cariari', 'Colorado', 'La Colonia'],
  'Limón-Siquirres': ['Siquirres', 'Pacuarito', 'Florida', 'Germania', 'El Cairo', 'Alegría', 'Reventazón'],
  'Limón-Talamanca': ['Bratsi', 'Sixaola', 'Cahuita', 'Telire'],
  'Limón-Matina': ['Matina', 'Batán', 'Carrandí'],
  'Limón-Guácimo': ['Guácimo', 'Mercedes', 'Pocora', 'Río Jiménez', 'Duacarí']
};

// Count total distritos
let totalDistritos = 0;
Object.values(distritos).forEach(distritosList => {
  totalDistritos += distritosList.length;
});

console.log('📊 VERIFICATION RESULTS:');
console.log('Total canton-distrito relationships:', Object.keys(distritos).length);
console.log('Total distritos:', totalDistritos);
console.log('✅ Status:', totalDistritos === 492 ? 'PERFECT - Exactly 492 distritos!' : `❌ Wrong count - Expected 492, got ${totalDistritos}`);

// Show some examples of duplicate distrito names across cantones
console.log('\n🔍 EXAMPLES OF DUPLICATE DISTRITO NAMES ACROSS CANTONES:');
const allDistritos = [];
Object.entries(distritos).forEach(([canton, distritosList]) => {
  distritosList.forEach(distrito => {
    allDistritos.push({ distrito, canton });
  });
});

// Find duplicates
const distritoCounts = {};
allDistritos.forEach(({ distrito }) => {
  distritoCounts[distrito] = (distritoCounts[distrito] || 0) + 1;
});

const duplicates = Object.entries(distritoCounts)
  .filter(([distrito, count]) => count > 1)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 10); // Show top 10

console.log('Top duplicate distrito names:');
duplicates.forEach(([distrito, count]) => {
  const cantones = allDistritos
    .filter(d => d.distrito === distrito)
    .map(d => d.canton.split('-')[1])
    .join(', ');
  console.log(`  "${distrito}" appears ${count} times in: ${cantones}`);
});





