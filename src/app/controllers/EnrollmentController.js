import * as Yup from 'yup';
import { startOfHour, parseISO, isBefore, addMonths } from 'date-fns';

import Enrollment from '../models/Enrollment';
import Student from '../models/Student';
import Plan from '../models/Plan';

class EnrollmentController {
  async index(req, res) {
    const schema = Yup.object().shape({
      page: Yup.number().positive()
    });

    if (!(await schema.isValid(req.query))) {
      return res.status(400).json({ error: 'Validation fails.' });
    }

    const { page = 1 } = req.query;

    const enrollments = await Enrollment.findAll({
      attributes: ['id', 'start_date', 'end_date', 'price'],
      include: [
        {
          model: Student,
          as: 'student',
          attributes: ['id', 'name']
        },
        {
          model: Plan,
          as: 'plan',
          attributes: ['id', 'title']
        }
      ],
      limit: 20,
      offset: (page - 1) * 20
    });

    return res.json(enrollments);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      student_id: Yup.number().required(),
      plan_id: Yup.number().required(),
      start_date: Yup.date().required()
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails.' });
    }

    const { student_id, plan_id, start_date } = req.body;

    // Check Plan
    const plan = await Plan.findOne({
      attributes: ['id', 'duration', 'price'],
      where: { id: plan_id }
    });

    if (!plan) {
      return res.status(400).json({ error: 'Plan does not exist.' });
    }

    // Check for past Dates
    const date = parseISO(start_date);

    if (isBefore(date, new Date())) {
      return res.status(400).json({ error: 'Past dates are not permitted.' });
    }

    const end_date = addMonths(date, plan.duration);

    const enrollment = await Enrollment.create({
      student_id,
      plan_id,
      start_date: date,
      end_date,
      price: plan.price
    });

    return res.json(enrollment);
  }

  async update(req, res) {
    return res.json();
  }

  async delete(req, res) {
    return res.json();
  }
}

export default new EnrollmentController();
