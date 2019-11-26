import * as Yup from 'yup';

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
    return res.json();
  }

  async update(req, res) {
    return res.json();
  }

  async delete(req, res) {
    return res.json();
  }
}

export default new EnrollmentController();
