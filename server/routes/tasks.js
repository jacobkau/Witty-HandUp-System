import express from 'express';
import { 
  getTasks,
  createTask,
  claimTask,
  completeTask,
  updateTask,
  getMyTasks,
  deleteTask
} from '../controllers/tasks.js';
import { protect, adminOnly } from '../middleware/auth.js'; 
import { rateTask } from '../controllers/tasks.js';
const router = express.Router();

router.route('/')
  .get(getTasks)
  .post(protect, createTask);

router.route('/:id/claim')
  .put(protect, claimTask);
  
router.route('/:id/complete')
  .put(protect, completeTask);
router.post('/:id/rate', protect, rateTask);
router.route('/my-tasks')
  .get(protect, getMyTasks);

router.route('/:id')
  .put(protect, updateTask) 
  .delete(protect, deleteTask); 

export default router;
