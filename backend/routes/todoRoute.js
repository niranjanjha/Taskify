import express from 'express';
import authMiddleware from '../middleware/auth.js';
import {
  createToDo,
  getToDos,
  getToDoById,
  updateToDo,
  deleteToDo
} from '../controllers/todoController.js';

const todoRouter = express.Router();

// All routes are protected by auth middleware
todoRouter.route('/gp')
  .get(authMiddleware, getToDos)
  .post(authMiddleware, createToDo);

todoRouter.route('/:id/gp')
  .get(authMiddleware, getToDoById)
  .put(authMiddleware, updateToDo)
  .delete(authMiddleware, deleteToDo);

export default todoRouter;