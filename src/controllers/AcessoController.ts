import type { Request, Response } from 'express';
import { prisma } from '../database/prisma';

export class AcessoController {
  async registrarEntrada(req: Request, res: Response) {
    try {
      const arquivoPdf = req.file;
      const { nomePorteiro, nomeMotorista, cpf, empresa, placa, setor } = req.body;

      if (!arquivoPdf) {
        return res.status(400).json({ error: 'O arquivo PDF do termo é obrigatório.' });
      }

      if (!nomePorteiro || !cpf || !nomeMotorista) {
        return res.status(400).json({ error: 'Faltam dados obrigatórios do porteiro ou motorista.' });
      }

      
      const porteiro = await prisma.porteiro.upsert({
        where: { nome: nomePorteiro },
        update: {}, 
        create: { nome: nomePorteiro }
      });

      
      const motorista = await prisma.motorista.upsert({
        where: { cpf: cpf },
        update: { nome: nomeMotorista, empresa: empresa },
        create: { cpf, nome: nomeMotorista, empresa }
      });

      
      const acesso = await prisma.acesso.create({
        data: {
          placa,
          setor,
          arquivoPdf: arquivoPdf.buffer, 
          porteiroId: porteiro.id,
          motoristaId: motorista.id
        }
      });

      return res.status(201).json({ 
        message: 'Acesso registrado com sucesso no banco de dados!',
        acessoId: acesso.id
      });

    } catch (error) {
      console.error("Erro ao registrar acesso no banco:", error);
      return res.status(500).json({ error: 'Erro interno no servidor.' });
    }
  }

  async listarAcessos(req: Request, res: Response) {
    try {
      const acessos = await prisma.acesso.findMany({
        orderBy: { dataEntrada: 'desc' }, 
        take: 50, 
        select: {
          
          id: true,
          dataEntrada: true,
          placa: true,
          setor: true,
          porteiro: { select: { nome: true } },
          motorista: { select: { nome: true, cpf: true, empresa: true } }
        }
      });

      return res.json(acessos);
    } catch (error) {
      console.error("Erro ao listar acessos:", error);
      return res.status(500).json({ error: 'Erro interno no servidor.' });
    }
  }

  
 
  async baixarPdf(req: Request, res: Response) {
    try {
      
      const id = String(req.params.id);

      const acesso = await prisma.acesso.findUnique({
        where: { id: id },
        
        include: { motorista: true }
      });

      if (!acesso || !acesso.arquivoPdf) {
        return res.status(404).json({ error: 'PDF não encontrado para este acesso.' });
      }

      
      res.setHeader('Content-Type', 'application/pdf');
      
      res.setHeader('Content-Disposition', `inline; filename="termo-${acesso.motorista.nome}.pdf"`);

      
      return res.send(acesso.arquivoPdf);

    } catch (error) {
      console.error("Erro ao baixar PDF:", error);
      return res.status(500).json({ error: 'Erro interno no servidor.' });
    }
  }
}