import { Router } from 'express';

import SessionController from './app/controllers/SessionController';
import UserController from './app/controllers/UserController';
import StudentController from './app/controllers/StudentController';
import PlanController from './app/controllers/PlanController';
import EnrollmentController from './app/controllers/EnrollmentController';
import CheckinController from './app/controllers/CheckinController';

import authMiddleare from './app/middlewares/auth';

const routes = new Router();

// Session
routes.post('/sessions', SessionController.store);

// Middleware Auth
routes.use(authMiddleare);

// User
routes.post('/users', UserController.store);
routes.put('/users', UserController.update);

// Students
routes.post('/students', StudentController.store);
routes.put('/students/:id', StudentController.update);

// -- Checkins
routes.get('/students/:id/checkins', CheckinController.index);
routes.post('/students/:id/checkins', CheckinController.store);

// Plans
routes.get('/plans', PlanController.index);
routes.post('/plans', PlanController.store);
routes.put('/plans/:id', PlanController.update);
routes.delete('/plans/:id', PlanController.delete);

// Enrollments
routes.get('/enrollments', EnrollmentController.index);
routes.post('/enrollments', EnrollmentController.store);
routes.put('/enrollments/:id', EnrollmentController.update);
routes.delete('/enrollments/:id', EnrollmentController.delete);

export default routes;
