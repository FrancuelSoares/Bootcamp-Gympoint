import * as Yup from 'yup';

import Queue from '../../lib/Queue';
import RegisterHelpOrderAnswer from '../jobs/RegisterHelpOrderAnswer';

import HelpOrder from '../models/HelpOrder';
import Student from '../models/Student';

class HelpOrderController {
  async index(req, res) {
    const schemaQuery = Yup.object().shape({
      page: Yup.number().positive()
    });

    if (!(await schemaQuery.isValid(req.query))) {
      return res.status(400).json({ error: 'Validation fails.' });
    }

    const { page = 1 } = req.query;

    const help = await HelpOrder.findAll({
      attributes: ['id', 'question', 'answer', 'answer_at'],
      include: [
        {
          model: Student,
          as: 'student',
          attributes: ['id', 'name']
        }
      ],
      where: { answer: null },
      limit: 20,
      offset: (page - 1) * 20
    });

    return res.json(help);
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      answer: Yup.string().required()
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails.' });
    }

    const help_order = await HelpOrder.findOne({
      include: [
        {
          model: Student,
          as: 'student',
          attributes: ['id', 'name', 'email']
        }
      ],
      where: { id: req.params.id }
    });

    if (!help_order) {
      return res.status(401).json({ error: 'Help Order does not exist.' });
    }

    const { id, question, answer, answer_at } = await help_order.update({
      answer: req.body.answer,
      answer_at: new Date()
    });

    /**
     * Send Email
     * - Adding in Background Job
     */
    await Queue.add(RegisterHelpOrderAnswer.key, {
      help_order
    });

    return res.json({
      id,
      question,
      answer,
      answer_at
    });
  }
}

export default new HelpOrderController();
