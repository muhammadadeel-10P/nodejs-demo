const path = require('path');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const swaggerUi = require('swagger-ui-express');
const env = require('./config/env');
const swaggerSpec = require('./config/swagger');
const requestLogger = require('./middlewares/requestLogger.middleware');
const { notFound, errorHandler } = require('./middlewares/error.middleware');

const helloRoutes = require('./routes/hello.routes');
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const uploadRoutes = require('./routes/upload.routes');

const app = express();

// CSP off so the Swagger UI page can load its inline scripts/styles
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
if (env.nodeEnv !== 'test') {
  app.use(requestLogger);
}

app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get('/api-docs.json', (req, res) => res.json(swaggerSpec));

app.use('/', helloRoutes);
app.use('/', authRoutes);
app.use('/users', userRoutes);
app.use('/upload', uploadRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
