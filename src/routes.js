import { Router } from 'express';

import SessionController from './app/controllers/SessionController';
import UserController from './app/controllers/UserController';
import StudentController from './app/controllers/StudentController';

import authMiddleare from './app/middlewares/auth';

const routes = new Router();

// Session
routes.post('/sessions', SessionController.store);

// Middlewares
routes.use(authMiddleare);

// User
routes.post('/users', UserController.store);
routes.put('/users', UserController.update);

// Students
routes.post('/students', StudentController.store);
routes.put('/students/:id', StudentController.update);

export default routes;
