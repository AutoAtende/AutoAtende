// Adicione estas configurações no seu backend (backend.autoatende.com)

// CORS Configuration
const corsOptions = {
  origin: [
    'https://sac.autoatende.com',
    'http://localhost:3000', // Para desenvolvimento
    'http://localhost:8080'  // Para desenvolvimento
  ],
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With', 
    'Content-Type',
    'Accept',
    'Authorization',
    'Cache-Control'
  ]
};

// Socket.io CORS
const io = new Server(server, {
  cors: {
    origin: [
      'https://sac.autoatende.com',
      'http://localhost:3000'
    ],
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Express CORS
app.use(cors(corsOptions));