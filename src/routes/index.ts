import { Router } from 'express';
import { PingController } from '../controllers/PingController';
import { AcessoController } from '../controllers/AcessoController';
import { upload } from '../config/multer';

const routes = Router();
const pingController = new PingController();
const acessoController = new AcessoController();

// Nossa rota de teste
routes.get('/ping', pingController.ping);

routes.post('/acessos', upload.single('pdf'), acessoController.registrarEntrada);

routes.get('/acessos', acessoController.listarAcessos);

routes.get('/acessos/:id/pdf', acessoController.baixarPdf);

export { routes };