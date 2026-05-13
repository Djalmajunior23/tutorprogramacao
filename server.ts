import express from "express";
import path from "path";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { createServer as createViteServer } from "vite";
import fs from "fs";

// Import Prisma client
import prisma from "./src/lib/prisma";
import { authenticateToken, authorizeRole, AuthRequest } from "./src/lib/auth";

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Basic Middleware
  app.use(helmet({
    contentSecurityPolicy: false,
  }));
  app.use(cors());
  app.use(express.json());
  app.use(cookieParser());

  // --- API AUTH ROUTES ---
  app.post("/api/auth/register", async (req, res) => {
    const { name, email, password, role, className } = req.body;
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role: role || "STUDENT"
        }
      });
      
      // Handle Student Profile
      if (user.role === "STUDENT") {
        await prisma.studentProfile.create({
          data: { 
            userId: user.id,
            // If class name provided, we could try to find/link it, 
            // but for now keeping it simple as per schema
          }
        });
      }
      
      // Handle Teacher Profile
      if (user.role === "TEACHER") {
        await prisma.teacherProfile.create({
          data: { userId: user.id }
        });
      }
      
      const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
      res.json({ token, user: { id: user.id, name: user.name, role: user.role } });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(400).json({ error: "Email já cadastrado ou dados inválidos" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    const { email, password } = req.body;
    try {
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ error: "Credenciais inválidas" });
      }
      const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
      res.json({ token, user: { id: user.id, name: user.name, role: user.role } });
    } catch (error) {
      res.status(500).json({ error: "Erro interno" });
    }
  });

  app.get("/api/auth/me", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.user?.id },
        include: { studentProfile: true, teacherProfile: true }
      });
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Falha ao recuperar perfil" });
    }
  });

  // --- EDUCATIONAL DATA ROUTES ---
  app.get("/api/learning-paths", async (req, res) => {
    try {
      const paths = await prisma.learningPath.findMany({
        include: { modules: { include: { challenges: true } } }
      });
      res.json(paths);
    } catch (error) {
      res.status(500).json({ error: "Erro ao buscar trilhas" });
    }
  });

  app.get("/api/ranking", async (req, res) => {
    try {
      const students = await prisma.studentProfile.findMany({
        include: { user: { select: { name: true } } },
        orderBy: { xp: 'desc' },
        take: 20
      });
      res.json(students);
    } catch (error) {
      res.status(500).json({ error: "Erro ao gerar ranking" });
    }
  });

  // --- TEACHER ONLY ROUTES ---
  app.post("/api/classes", authenticateToken, authorizeRole(['TEACHER', 'ADMIN']), async (req: AuthRequest, res) => {
    const { name, course } = req.body;
    try {
      const teacher = await prisma.teacherProfile.findUnique({ where: { userId: req.user?.id } });
      if (!teacher) return res.status(404).json({ error: "Perfil de professor não encontrado" });
      
      const newClass = await prisma.class.create({
        data: { name, course, teacherId: teacher.id }
      });
      res.json(newClass);
    } catch (error) {
      res.status(500).json({ error: "Erro ao criar turma" });
    }
  });

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", mode: "ORM", timestamp: new Date().toISOString() });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
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
    console.log(`🚀 Portal Server running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Critical server failure:", err);
});
