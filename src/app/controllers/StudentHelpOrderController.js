import * as Yup from 'yup';

import HelpOrder from '../models/HelpOrder';
import Student from '../models/Student';

class HelpOrderController {
  async index(req, res) {
    const schemaParams = Yup.object().shape({
      id: Yup.number()
        .required()
        .positive()
    });

    const schemaQuery = Yup.object().shape({
      page: Yup.number().positive()
    });

    if (
      !(await schemaParams.isValid(req.params)) ||
      !(await schemaQuery.isValid(req.query))
    ) {
      return res.status(400).json({ error: 'Validation fails.' });
    }

    const { page = 1 } = req.query;

    // Check Student
    const student = await Student.findOne({
      attributes: ['id', 'name'],
      where: { id: req.params.id }
    });

    if (!student) {
      return res.status(400).json({ error: 'Student does not exist.' });
    }

    const help = await HelpOrder.findAll({
      attributes: ['id', 'question', 'answer', 'answer_at'],
      include: [
        {
          model: Student,
          as: 'student',
          attributes: ['id', 'name']
        }
      ],
      where: { student_id: student.id },
      limit: 20,
      offset: (page - 1) * 20
    });

    return res.json(help);
  }

  async store(req, res) {
    const schemaParams = Yup.object().shape({
      id: Yup.number()
        .required()
        .positive()
    });

    const schemaBody = Yup.object().shape({
      question: Yup.string().required()
    });

    if (
      !(await schemaParams.isValid(req.params)) ||
      !(await schemaBody.isValid(req.body))
    ) {
      console.log(req.params);
      console.log(req.body);
      return res.status(400).json({ error: 'Validation fails.' });
    }

    // Check Student
    const student = await Student.findOne({
      attributes: ['id'],
      where: { id: req.params.id }
    });

    if (!student) {
      return res.status(400).json({ error: 'Student does not exist.' });
    }

    const { id, student_id, question } = await HelpOrder.create({
      student_id: req.params.id,
      question: req.body.question
    });

    return res.json({
      id,
      student_id,
      question
    });
  }
}

export default new HelpOrderController();
