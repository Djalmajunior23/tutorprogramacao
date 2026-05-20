import { Request, Response, NextFunction } from "express";
import { z } from "zod";

const NODE_ENV = process.env.NODE_ENV || 'development';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(`[BACKEND ERROR] ${err.message}`);
  
  if (err instanceof z.ZodError) {
    return res.status(400).json({ 
      error: "Erro de validação nos dados enviados.", 
      details: err.issues 
    });
  }

  // Prisma / DB Errors
  if (err.code === 'P2002') {
    return res.status(409).json({ error: "Este e-mail já está em uso." });
  }
  if (err.message?.includes('datasource') || err.message?.includes('DATABASE_URL') || err.message?.includes('malformed') || err.code?.startsWith('P')) {
    return res.status(503).json({ 
      error: "O serviço de banco de dados está temporariamente indisponível ou corrompido. Por favor, contate o suporte.",
      type: "DATABASE_CONNECTION_ERROR"
    });
  }

  const status = err.status || 500;
  res.status(status).json({ 
    error: NODE_ENV === 'production' ? "Ocorreu um erro interno no servidor." : err.message 
  });
};
