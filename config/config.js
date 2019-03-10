module.exports = {
  PORT: process.env.PORT || 5001,
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/todo-list',
  CLOUDINARY_URL: process.env.CLOUDINARY_URL,
  SENDGRID_API_KEY: process.env.SENDGRID_API_KEY,
  DOMAINS_WHITE_LIST: ['http://localhost:5000', 'http://localhost:5001',
    'https://nl-static-www.herokuapp.com',
    'http://nl-hapi-www.herokuapp.com', 'http://nl-hapi-api.herokuapp.com',
    'https://nl-hapi-www.herokuapp.com', 'https://nl-hapi-api.herokuapp.com',
    'https://nl-hapi-www-prod.herokuapp.com', 'https://nl-hapi-api-prod.herokuapp.com',
    'http://nl-hapi-www-prod.herokuapp.com', 'http://nl-hapi-api-prod.herokuapp.com']
};