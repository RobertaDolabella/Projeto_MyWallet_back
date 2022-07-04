import { Router } from 'express';
import { cadastro, login } from '../controllers/infoUsuarioControllers.js';

const router = Router();

router.post('/login', login);
router.post('/cadastrar', cadastro);

export default router;