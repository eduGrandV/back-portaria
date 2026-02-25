
import type { Request, Response } from "express";

export class PingController {
  async ping(req: Request, res: Response) {
    return res.json({
      status: "ok",
      message: "API da Portaria Grand Valle rodando perfeitamente!",
      timestamp: new Date(),
    });
  }
}
