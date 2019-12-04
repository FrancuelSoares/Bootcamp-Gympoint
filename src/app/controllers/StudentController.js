import * as Yup from 'yup';

import Student from '../models/Student';

class StudentController {
  async store(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      email: Yup.string()
        .required()
        .email(),
      age: Yup.number()
        .required()
        .min(10),
      weight: Yup.number()
        .required()
        .positive(),
      height: Yup.number()
        .required()
        .positive()
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails.' });
    }

    const { email } = req.body;

    const studentExists = await Student.findOne({
      attributes: ['id'],
      where: { email }
    });

    if (studentExists) {
      return res.status(400).json({ error: 'Student already exists.' });
    }

    const { id, name, age, weight, height } = await Student.create(req.body);

    return res.json({
      id,
      name,
      email,
      age,
      weight,
      height
    });
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string(),
      email: Yup.string().email(),
      age: Yup.number().min(10),
      weight: Yup.number().positive(),
      height: Yup.number().positive()
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails.' });
    }

    const { email } = req.body;

    const student = await Student.findByPk(req.params.id);

    if (!student) {
      return res.status(400).json({ error: 'Student does not exist.' });
    }

    if (email && email !== student.email) {
      const studentExists = await Student.findOne({
        attributes: ['id'],
        where: { email }
      });

      if (studentExists) {
        return res.status(401).json({ error: 'Student already exists.' });
      }
    }

    const { id, name, age, weight, height } = await student.update(req.body);

    return res.json({
      id,
      name,
      email,
      age,
      weight,
      height
    });
  }
}

export default new StudentController();
