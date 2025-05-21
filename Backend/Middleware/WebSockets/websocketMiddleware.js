const websocketMiddleware = (req, res, next) => {
    try {
      req.io = req.app.get('io');
      req.connectedUsers = req.app.get('connectedUsers');
      
      if (!req.io) {
        console.warn('WebSocket server not available');
      }
      
      next();
    } catch (error) {
      console.error('WebSocket middleware error:', error);
      next(error);
    }
  };
  
  module.exports = websocketMiddleware;