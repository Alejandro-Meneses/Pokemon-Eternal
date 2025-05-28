const jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {
  try {
    // Obtener token del header
    const token = req.header('x-auth-token');
    
    console.log('middlewareAuth - Token recibido:', token ? 'Presente' : 'Ausente');
    
    // Verificar si no hay token
    if (!token) {
      return res.status(401).json({ msg: 'No hay token, autorización denegada' });
    }
    
    try {
      // Verificar token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Asegurar que el formato del token es correcto
      if (!decoded.user || !decoded.user.id) {
        console.error('middlewareAuth - Formato de token inválido:', decoded);
        return res.status(401).json({ msg: 'Formato de token inválido' });
      }
      
      // Añadir usuario al request
      req.user = decoded.user;
      console.log('middlewareAuth - Usuario autenticado:', req.user.id);
      next();
    } catch (jwtError) {
      console.error('middlewareAuth - Error al verificar JWT:', jwtError.message);
      return res.status(401).json({ msg: 'Token no válido' });
    }
  } catch (error) {
    console.error('middlewareAuth - Error general:', error);
    return res.status(500).json({ msg: 'Error del servidor en autenticación' });
  }
};