import { Router } from 'express';
import { getSpecializations } from '../controllers/specializations.controller';

const router = Router();

router.get('/', getSpecializations);

export default router;

