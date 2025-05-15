import { getHours } from 'date-fns';

export const greeting = () => {
  const currentDate = new Date();
  const currentHour = getHours(currentDate);

  if (currentHour < 12) {
    return 'Bom dia';
  } else if (currentHour >= 12 && currentHour < 18) {
    return 'Boa tarde';
  } else {
    return 'Boa noite'
  }
};

