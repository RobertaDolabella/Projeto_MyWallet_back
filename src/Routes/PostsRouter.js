import { Router } from 'express';
import { deteteTransacoes, getTransacoes, novoPostTrasacoes } from '../controllers/PostsTransacoesControllers.js';

const router = Router();

router.get('/mywallet', getTransacoes);
router.delete('/mywallet/:idDeletar',deteteTransacoes);
router.post('/adicionar',novoPostTrasacoes )


export default router;