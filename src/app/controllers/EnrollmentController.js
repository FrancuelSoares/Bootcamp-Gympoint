import * as Yup from 'yup';
import { format, parseISO, isBefore, addMonths } from 'date-fns';

import Queue from '../../lib/Queue';
import RegisterEnrollmenteEmail from '../jobs/RegisterEnrollmenteEmail';

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

    // Check for past Dates
    const date = parseISO(start_date);

    if (isBefore(date, new Date())) {
      return res.status(401).json({ error: 'Past dates are not permitted.' });
    }

    // Check Student
    const student = await Student.findOne({
      attributes: ['id', 'name', 'email'],
      where: { id: student_id }
    });

    if (!student) {
      return res.status(400).json({ error: 'Student does not exist.' });
    }

    // Check Plan
    const plan = await Plan.findOne({
      attributes: ['id', 'title', 'duration', 'price'],
      where: { id: plan_id }
    });

    if (!plan) {
      return res.status(400).json({ error: 'Plan does not exist.' });
    }

    const end_date = addMonths(date, plan.duration);

    const enrollment = await Enrollment.create({
      student_id,
      plan_id,
      start_date: date,
      end_date,
      price: plan.price
    });

    /**
     * Send Email
     *
     * Adding in Background Job
     */
    await Queue.add(RegisterEnrollmenteEmail.key, {
      student,
      plan,
      enrollment
    });

    return res.json(enrollment);
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      student_id: Yup.number().required(),
      plan_id: Yup.number().required(),
      start_date: Yup.date().required()
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails.' });
    }

    // Check Enrollment
    const enrollment = await Enrollment.findByPk(req.params.id);

    if (!enrollment) {
      return res.status(400).json({ error: 'Enrollment does not exist.' });
    }

    // Check Student
    const student = await Student.findOne({
      attributes: ['id', 'name'],
      where: { id: req.body.student_id }
    });

    if (!student) {
      return res.status(400).json({ error: 'Student does not exist.' });
    }

    // Check Plan
    const plan = await Plan.findOne({
      attributes: ['id', 'duration', 'price'],
      where: { id: req.body.plan_id }
    });

    if (!plan) {
      return res.status(400).json({ error: 'Plan does not exist.' });
    }

    // Check for past Dates
    const date = parseISO(req.body.start_date);

    if (date !== enrollment.start_date) {
      if (isBefore(date, new Date())) {
        return res.status(400).json({ error: 'Past dates are not permitted.' });
      }
    }

    // Last Check
    req.body.start_date = date;
    req.body.end_date = addMonths(date, plan.duration);
    req.body.price = plan.price;

    const updated = await enrollment.update(req.body);

    return res.json(updated);
  }

  async delete(req, res) {
    const schema = Yup.object().shape({
      id: Yup.number().required()
    });

    if (!(await schema.isValid(req.params))) {
      return res.status(400).json({ error: 'Validation fails.' });
    }

    const enrollment = await Enrollment.destroy({
      where: {
        id: req.params.id
      }
    });

    return res.json(enrollment);
  }
}

export default new EnrollmentController();
