import { format, parseISO } from 'date-fns';
import pt from 'date-fns/locale/pt';

import Mail from '../../lib/Mail';

class RegisterHelpOrderAnswer {
  get key() {
    return 'RegisterHelpOrderAnswer';
  }

  async handle({ data }) {
    const { help_order } = data;

    await Mail.sendMail({
      to: `${help_order.student.name} <${help_order.student.email}>`,
      subject: 'Dúvida Respondida',
      template: 'helporder',
      context: {
        student: help_order.student.name,
        question: help_order.question,
        answer: help_order.answer,
        answer_at: format(
          parseISO(help_order.answer_at),
          "'dia' dd 'de' MMMM', às' H:mm'h'",
          {
            locale: pt
          }
        )
      }
    });
  }
}

export default new RegisterHelpOrderAnswer();
