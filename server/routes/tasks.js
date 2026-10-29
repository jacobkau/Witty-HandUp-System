import express from 'express';
import { 
  getTasks, createTask, placeBid, acceptBid, 
  submitPayment, confirmPayment, rateTask, updateTask, deleteTask, getMyTasks
} from '../controllers/tasks.js';
import { protect } from '../middleware/auth.js'; 

const router = express.Router();

router.route('/')
  .get(getTasks)
  .post(protect, createTask);

router.post('/:id/bid', protect, placeBid);
router.put('/:id/accept-bid', protect, acceptBid);
router.put('/:id/submit-payment', protect, submitPayment);
router.put('/:id/confirm-payment', protect, confirmPayment);
router.post('/:id/rate', protect, rateTask);

router.route('/my-tasks').get(protect, getMyTasks);

router.route('/:id')
  .put(protect, updateTask) 
  .delete(protect, deleteTask); 

export default router;
