import { Router } from 'express';
import { getDoctors, getRecommendedDoctors, getDoctorById } from '../controllers/doctors.controller';

const router = Router();

router.get('/', getDoctors);
router.get('/recommended', getRecommendedDoctors);
router.get('/:id', getDoctorById);

export default router;

