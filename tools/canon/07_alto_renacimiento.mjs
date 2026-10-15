// Config de adquisición — 07 Alto Renacimiento (High Renaissance + maestros venecianos).
export default {
  titulo: 'Alto Renacimiento',
  artists: [
    'Leonardo da Vinci', 'Raphael', 'Michelangelo', 'Titian', 'Giorgione',
    'Correggio', 'Andrea del Sarto', 'Sebastiano del Piombo', 'Giovanni Bellini',
    'Sandro Botticelli', 'Parmigianino', 'Donatello', 'Giambologna',
    'Benvenuto Cellini', 'Andrea Mantegna', 'Piero della Francesca', 'Andrea del Verrocchio',
  ],
  perArtist: 16,   // top obras por autor que considera
  limit: 45,       // total NUEVAS (dedup quita lo ya bajado antes del corte)
  minFame: 6,      // piso de sitelinks (idiomas) para no traer obras menores
};
