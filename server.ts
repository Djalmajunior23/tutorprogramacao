import express, { Request, Response, NextFunction } from "express";
import path from "path";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { createServer as createViteServer } from "vite";
import { rateLimit } from 'express-rate-limit';
import { z } from "zod";

// Import Prisma client
import prisma from "./src/lib/prisma";
import { authenticateToken, authorizeRole, AuthRequest } from "./src/server/middlewares/auth";
import { errorHandler } from "./src/server/middlewares/error";
import studentRoutes from "./src/server/modules/students/students.routes";

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key';
const NODE_ENV = process.env.NODE_ENV || 'development';

// Validation Schemas
const LoginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres")
});

const RegisterSchema = z.object({
  name: z.string().min(2, "Nome muito curto"),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
  role: z.enum(["STUDENT", "TEACHER", "ADMIN"]).optional().default("STUDENT")
});

const VerifyEmailSchema = z.object({
  email: z.string().email("Email inválido")
});

const ResetPasswordSchema = z.object({
  email: z.string().email("Email inválido"),
  newPassword: z.string().min(6, "Senha deve ter no mínimo 6 caracteres")
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  // --- Strict Environment Validation ---
  const requiredEnv = ["DATABASE_URL", "JWT_SECRET", "CORS_ORIGIN"];
  
  // Normalize DATABASE_URL protocol if mistakenly set to https:// (typical when copying Neon URLs without protocol)
  if (process.env.DATABASE_URL && process.env.DATABASE_URL.startsWith("https://")) {
    console.log("🔄 Normalizing DATABASE_URL protocol from https:// to postgresql://");
    process.env.DATABASE_URL = process.env.DATABASE_URL.replace("https://", "postgresql://");
  }

  for (const key of requiredEnv) {
    if (!process.env[key]) {
      console.error(`❌ Variável de ambiente obrigatória ausente: ${key}`);
      if (NODE_ENV === 'production') {
        throw new Error(`Variável de ambiente obrigatória ausente: ${key}`);
      }
    }
  }

  // Configuration for proxy trust
  app.set('trust proxy', true);

  // Security Middlewares
  app.use(helmet({
    contentSecurityPolicy: false,
  }));
  
  // Robust CORS Configuration
  const allowedOrigins = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(",").map(origin => origin.trim())
    : [];

  app.use(cors({
    origin: (origin, callback) => {
      if (!origin || NODE_ENV === 'development' || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Origem não permitida pelo CORS"));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie']
  }));

  app.use(express.json());
  app.use(cookieParser());

  // Rate Limiting
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    limit: 200, 
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    validate: false,
    message: { error: "Muitas requisições. Tente novamente mais tarde." }
  });
  app.use("/api/", limiter);

  // --- API ROUTES ---

  // Health check for monitoring and Traefik
  app.get("/health", (req, res) => {
    res.status(200).json({ status: "ok", service: "Tutor Inteligente de Programação API" });
  });

  app.get("/api/health", (req, res) => {
    res.json({ 
      status: "online", 
      message: "Tutor Inteligente Prof. Djalma API is running",
      env: NODE_ENV,
      version: "1.0.0"
    });
  });

  // Auth Routes
  app.post("/api/auth/register", async (req, res, next) => {
    try {
      const { name, email, password, role } = RegisterSchema.parse(req.body);
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await prisma.user.create({
        data: { name, email, password: hashedPassword, role }
      });
      
      if (user.role === "STUDENT") {
        await prisma.studentProfile.create({ data: { userId: user.id } });
      } else if (user.role === "TEACHER") {
        await prisma.teacherProfile.create({ data: { userId: user.id } });
      }
      
      const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
      res.status(201).json({ token, user: { id: user.id, name: user.name, role: user.role } });
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/auth/login", async (req, res, next) => {
    try {
      console.log("Login attempt:", req.body.email);
      const { email, password } = LoginSchema.parse(req.body);
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        console.log("Login failed: User not found");
        return res.status(401).json({ error: "E-mail ou senha incorretos." });
      }
      
      const pwdMatch = await bcrypt.compare(password, user.password);
      if (!pwdMatch) {
         console.log("Login failed: Password mismatch");
         return res.status(401).json({ error: "E-mail ou senha incorretos." });
      }
      
      const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
      res.json({ token, user: { id: user.id, name: user.name, role: user.role } });
    } catch (error) {
      console.error("Login exception:", error);
      next(error);
    }
  });

  app.post("/api/auth/verify-email", async (req, res, next) => {
    try {
      const { email } = VerifyEmailSchema.parse(req.body);
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        return res.status(404).json({ error: "E-mail não encontrado em nossa base." });
      }
      res.json({ message: "E-mail verificado com sucesso." });
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/auth/reset-password", async (req, res, next) => {
    try {
      const { email, newPassword } = ResetPasswordSchema.parse(req.body);
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        return res.status(404).json({ error: "E-mail não encontrado." });
      }
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await prisma.user.update({
        where: { email },
        data: { password: hashedPassword }
      });
      res.json({ message: "Senha atualizada com sucesso." });
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/auth/me", authenticateToken, async (req: AuthRequest, res, next) => {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.user?.id },
        include: { 
          studentProfile: { 
            include: { 
              skills: { include: { concept: true } }, 
              achievements: { include: { achievement: true } } 
            } 
          }, 
          teacherProfile: true 
        }
      });
      if (!user) return res.status(404).json({ error: "Usuário não encontrado" });
      res.json(user);
    } catch (error) {
      next(error);
    }
  });

  // Content Routes
  app.use("/api/students", studentRoutes);

  app.get("/api/classes", authenticateToken, async (req, res, next) => {
    try {
      const classes = await prisma.class.findMany({
        orderBy: { name: 'asc' }
      });
      res.json(classes);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/languages", async (req, res, next) => {
    try {
      const langs = await prisma.programmingLanguage.findMany({ 
        include: { syntaxExamples: { include: { concept: true } } } 
      });
      res.json(langs);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/concepts", async (req, res, next) => {
    try {
      const concepts = await prisma.concept.findMany({ include: { syntaxExamples: true } });
      res.json(concepts);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/learning-paths", async (req, res, next) => {
    try {
      const paths = await prisma.learningPath.findMany({
        include: { modules: { include: { challenges: true, lessons: true } } },
        orderBy: { xpReward: 'asc' }
      });
      res.json(paths);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/challenges", authenticateToken, async (req, res) => {
    try {
      const challenges = await prisma.challenge.findMany({
        include: { concept: true, module: true },
        orderBy: {
          createdAt: "desc"
        }
      });
      res.json(challenges);
    } catch (error: any) {
      console.error("[GET /api/challenges] Prisma Error:", error);
      console.error("[GET /api/challenges] Error Code:", error.code);
      console.error("[GET /api/challenges] Error Message:", error.message);
      res.status(500).json({ 
        message: "Não foi possível carregar os desafios. Verifique a conexão com o banco de dados.",
        details: NODE_ENV === 'development' ? error.message : undefined
      });
    }
  });

  // Dashboard Specific Routes
  app.get("/api/student/dashboard", authenticateToken, authorizeRole(['STUDENT']), async (req: AuthRequest, res, next) => {
    try {
      const profile = await prisma.studentProfile.findUnique({
        where: { userId: req.user?.id },
        include: { 
          progress: { include: { module: true } },
          achievements: { include: { achievement: true } },
          recommendations: true
        }
      });
      res.json(profile);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/teacher/dashboard", authenticateToken, authorizeRole(['TEACHER', 'ADMIN']), async (req: AuthRequest, res, next) => {
    try {
      const profile = await prisma.teacherProfile.findUnique({
        where: { userId: req.user?.id },
        include: { classes: { include: { students: { include: { user: { select: { name: true } } } } } } }
      });
      res.json(profile);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/ranking", async (req, res, next) => {
    try {
      const students = await prisma.studentProfile.findMany({
        include: { user: { select: { name: true } } },
        orderBy: { xp: 'desc' },
        take: 50
      });
      res.json(students);
    } catch (error) {
      next(error);
    }
  });

  // Error Handling
  app.use(errorHandler);

  // Vite middleware for development
  if (NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Portal Multilíngue Server running on port ${PORT} [${NODE_ENV}]`);
  });
}

startServer().catch((err) => {
  console.error("Critical server failure:", err);
});

