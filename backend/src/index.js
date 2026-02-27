const express = require('express');
const path = require('path');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const videoRoutes = require('./routes/videos');
const apiRoutes = require('./routes/index');
const uploadsRoutes = require('./routes/uploads');
const { errorHandler } = require('./middlewares/errorHandler');
const { init } = require('./setup');

const app = express();

app.use(cors());
app.use(express.json());

// Serve uploaded videos statically from /uploads
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// API routes
app.use('/api', apiRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/videos', videoRoutes);
app.use('/api/uploads', uploadsRoutes);

// Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 4000;

(async function start(){
	// Run DB schema and uploads checks before starting server
	try {
		await init({ expectedFiles: ['Introduction_German.mp4','Learning_German.mp4','Story_German.mp4'] });
	} catch (err) {
		console.error('Startup init failed (continuing):', err);
	}

	app.listen(PORT, () => console.log(`Server running on ${PORT}`));
})();

process.on('unhandledRejection', (reason, p) => {
	console.error('Unhandled Rejection at:', p, 'reason:', reason);
});

process.on('uncaughtException', (err) => {
	console.error('Uncaught Exception:', err);
});
