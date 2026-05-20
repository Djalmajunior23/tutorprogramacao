import { NextFunction, Response } from "express";
import bcrypt from "bcryptjs";
import { AuthRequest } from "../../middlewares/auth";
import prisma from "../../../lib/prisma";
import { CreateStudentSchema, UpdateStudentSchema, ResetPasswordSchema } from "./students.schemas";

export const getStudentStats = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const isTeacher = req.user?.role === "TEACHER";
    let teacherClassIds: string[] = [];

    if (isTeacher) {
      const teacherProfile = await prisma.teacherProfile.findUnique({
        where: { userId: req.user!.id },
        include: { classes: true }
      });
      teacherClassIds = teacherProfile?.classes.map(c => c.id) || [];
    }

    // Base filter for students
    const studentFilter: any = { role: "STUDENT" };
    if (isTeacher) {
      studentFilter.studentProfile = {
        OR: [
          { classId: { in: teacherClassIds } },
          { enrollments: { some: { classId: { in: teacherClassIds } } } }
        ]
      };
    }

    const [total, active, recent] = await Promise.all([
      prisma.user.count({ where: studentFilter }),
      prisma.user.count({ where: { ...studentFilter, active: true } }),
      prisma.user.findMany({
        where: studentFilter,
        take: 5,
        orderBy: { createdAt: "desc" },
        include: { studentProfile: { include: { class: true } } }
      })
    ]);

    // For "Alunos por Turma"
    const classes = await prisma.class.findMany({
      where: isTeacher ? { id: { in: teacherClassIds } } : {},
      include: {
        _count: {
          select: { enrollments: true }
        }
      }
    });

    const studentsByClass = classes.map(c => ({
      name: c.name,
      count: c._count.enrollments
    }));

    res.json({
      total,
      active,
      recent: recent.map(({ password, ...u }) => u),
      studentsByClass
    });
  } catch (error) {
    next(error);
  }
};

export const getStudents = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { search, classId, active, page = "1", limit = "10" } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Build filter conditions
    const where: any = { role: "STUDENT" };

    if (search) {
      where.OR = [
        { name: { contains: search as string } },
        { email: { contains: search as string } },
      ];
    }
    if (active !== undefined) {
      where.active = active === "true";
    }

    if (classId) {
      // Must have this specific class in their enrollments or as classId
      where.studentProfile = {
        OR: [
          { classId: classId as string },
          { enrollments: { some: { classId: classId as string } } }
        ]
      };
    }

    // Teacher visibility logic
    if (req.user?.role === "TEACHER") {
      // Fetch teacher's classes to restrict their view
      const teacherProfile = await prisma.teacherProfile.findUnique({
        where: { userId: req.user.id },
        include: { classes: true }
      });
      const teacherClassIds = teacherProfile?.classes.map(c => c.id) || [];
      
      // Override: Teachers only see students from their own classes
      where.studentProfile = {
        ...where.studentProfile,
        OR: [
          { classId: { in: teacherClassIds } },
          { enrollments: { some: { classId: { in: teacherClassIds } } } }
        ]
      };
    }

    const [items, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limitNum,
        include: {
          studentProfile: {
            include: {
              class: true,
              enrollments: { include: { class: true } }
            }
          }
        },
        orderBy: { createdAt: "desc" }
      }),
      prisma.user.count({ where })
    ]);

    // Omit passwords
    const safeItems = items.map(user => {
      const { password, ...rest } = user;
      return rest;
    });

    res.json({
      items: safeItems,
      page: pageNum,
      total,
      totalPages: Math.ceil(total / limitNum)
    });
  } catch (error) {
    next(error);
  }
};

export const createStudent = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const data = CreateStudentSchema.parse(req.body);

    const existingUser = await prisma.user.findUnique({ where: { email: data.email } });
    if (existingUser) {
      return res.status(400).json({ error: "Este e-mail já está em uso." });
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        role: "STUDENT",
        active: data.active,
        studentProfile: {
          create: {
            phone: data.phone,
            registration: data.registration,
            classId: data.classId || null,
          }
        }
      },
      include: { studentProfile: true }
    });

    // Handle enrollment
    if (data.classId && user.studentProfile?.id) {
      await prisma.enrollment.create({
        data: {
          studentId: user.studentProfile.id,
          classId: data.classId
        }
      });
    }

    const { password, ...safeUser } = user;
    res.status(201).json(safeUser);
  } catch (error) {
    next(error);
  }
};

export const getStudentById = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = await prisma.user.findFirst({
      where: { id: req.params.id, role: "STUDENT" },
      include: {
        studentProfile: {
          include: {
            class: true,
            enrollments: { include: { class: true } }
          }
        }
      }
    });

    if (!user) return res.status(404).json({ error: "Aluno não encontrado." });

    const { password, ...safeUser } = user;
    res.json(safeUser);
  } catch (error) {
    next(error);
  }
};

export const updateStudent = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const data = UpdateStudentSchema.parse(req.body);

    // Verify student exists
    const existing = await prisma.user.findFirst({
      where: { id: req.params.id, role: "STUDENT" },
      include: { studentProfile: true }
    });

    if (!existing) return res.status(404).json({ error: "Aluno não encontrado." });

    if (data.email && data.email !== existing.email) {
      const emailCheck = await prisma.user.findUnique({ where: { email: data.email } });
      if (emailCheck) return res.status(400).json({ error: "Este e-mail já está em uso." });
    }

    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: {
        name: data.name,
        email: data.email,
        active: data.active,
        studentProfile: {
          update: {
            phone: data.phone,
            registration: data.registration,
            classId: data.classId
          }
        }
      },
      include: { studentProfile: true }
    });

    // Update enrollment if classId changes
    if (data.classId !== undefined && existing.studentProfile?.id) {
      // First, check if the enrollment already exists
      const profileId = existing.studentProfile.id;
      if (data.classId) {
        await prisma.enrollment.upsert({
          where: {
            classId_studentId: { classId: data.classId, studentId: profileId }
          },
          update: {},
          create: { classId: data.classId, studentId: profileId }
        });
      }
    }

    const { password, ...safeUser } = user;
    res.json(safeUser);
  } catch (error) {
    next(error);
  }
};

export const updateStudentStatus = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { active } = req.body;
    if (typeof active !== "boolean") return res.status(400).json({ error: "Status inválido." });

    const user = await prisma.user.update({
      where: { id: req.params.id, role: "STUDENT" },
      data: { active }
    });

    res.json({ id: user.id, active: user.active });
  } catch (error) {
    next(error);
  }
};

export const resetStudentPassword = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { password } = ResetPasswordSchema.parse(req.body);
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.update({
      where: { id: req.params.id, role: "STUDENT" },
      data: { password: hashedPassword }
    });

    res.json({ message: "Senha redefinida com sucesso." });
  } catch (error) {
    next(error);
  }
};

export const deleteStudent = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    // Usually soft-delete (update active to false) is preferred. But since they asked for DELETE:
    // First, verify student
    const existing = await prisma.user.findFirst({
      where: { id: req.params.id, role: "STUDENT" },
      include: { studentProfile: true }
    });

    if (!existing) return res.status(404).json({ error: "Aluno não encontrado." });

    // Actually delete the student profile. Note that user deletion cascades if set up, but let's delete manually to be safe.
    if (existing.studentProfile) {
      await prisma.enrollment.deleteMany({ where: { studentId: existing.studentProfile.id } });
      await prisma.studentProfile.delete({ where: { id: existing.studentProfile.id } });
    }
    
    await prisma.user.delete({ where: { id: req.params.id } });

    res.json({ message: "Aluno removido com sucesso." });
  } catch (error) {
    next(error);
  }
};
