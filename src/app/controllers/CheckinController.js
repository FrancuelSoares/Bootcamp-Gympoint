import * as Yup from 'yup';

import { subDays } from 'date-fns';
import { Op } from 'sequelize';

import Checkin from '../models/Checkin';
import Student from '../models/Student';

class CheckinController {
  async index(req, res) {
    const schemaParams = Yup.object().shape({
      id: Yup.number().positive()
    });

    const schemaQuery = Yup.object().shape({
      page: Yup.number().positive()
    });

    if (
      !(await schemaParams.isValid(req.query)) ||
      !(await schemaQuery.isValid(req.query))
    ) {
      return res.status(400).json({ error: 'Validation fails.' });
    }

    const { page = 1 } = req.query;

    const checkins = await Checkin.findAll({
      attributes: ['id', 'created_at'],
      include: [
        {
          model: Student,
          as: 'student',
          attributes: ['id', 'name']
        }
      ],
      where: { student_id: req.params.id },
      limit: 20,
      offset: (page - 1) * 20
    });

    return res.json(checkins);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      id: Yup.number()
        .required()
        .positive()
    });

    if (!(await schema.isValid(req.params))) {
      return res.status(400).json({ error: 'Validation fails.' });
    }

    // Check total checkins
    const checkins_count = await Checkin.count({
      where: {
        student_id: req.params.id,
        created_at: {
          [Op.between]: [subDays(new Date(), 7), new Date()]
        }
      }
    });

    if (checkins_count >= 5) {
      return res.status(401).json({ error: 'Checkin limit reached' });
    }

    const { id, student_id } = await Checkin.create({
      student_id: req.params.id
    });

    return res.json({
      id,
      student_id
    });
  }
}

export default new CheckinController();
