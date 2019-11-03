import Student from '../models/Student';

class StudentController {
  async store(req, res) {
    return res.json({ ok: 'Ok!' });
  }

  async update(req, res) {
    return res.json({ ok: 'Ok!' });
  }
}

export default new StudentController();
