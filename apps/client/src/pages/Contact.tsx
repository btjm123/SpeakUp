import ContactForm from '../components/ContactForm';
import { FC } from 'react';

const Contact: FC = () => {
  return <ContactForm />;
};

export default Contact;
export const Component = Contact;
Component.displayName = 'Contact';
