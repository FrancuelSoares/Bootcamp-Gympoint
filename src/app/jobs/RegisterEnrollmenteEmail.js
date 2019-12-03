import { format, parseISO } from 'date-fns';
import pt from 'date-fns/locale/pt';

import Mail from '../../lib/Mail';

class RegisterEnrollmenteEmail {
  get key() {
    return 'RegisterEnrollmenteEmail';
  }

  async handle({ data }) {
    const { student, plan, enrollment } = data;

    await Mail.sendMail({
      to: `${student.name} <${student.email}>`,
      subject: 'Matrícula Cadastrada',
      template: 'enrollment',
      context: {
        student: student.name,
        plan: plan.title,
        price: plan.price,
        start_date: format(
          parseISO(enrollment.start_date),
          "'dia' dd 'de' MMMM', às' H:mm'h'",
          {
            locale: pt
          }
        ),
        end_date: format(
          parseISO(enrollment.end_date),
          "'dia' dd 'de' MMMM', às' H:mm'h'",
          {
            locale: pt
          }
        )
      }
    });
  }
}

export default new RegisterEnrollmenteEmail();
