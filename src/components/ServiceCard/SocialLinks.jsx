import { getSafeHref } from '../../utils/validation';
import { InstagramIcon, FacebookIcon, LinkedInIcon, MessengerIcon } from '../UI/Icon';

const socialConfig = [
  { key: 'instagram', Icon: InstagramIcon, label: 'Instagram' },
  { key: 'facebook', Icon: FacebookIcon, label: 'Facebook' },
  { key: 'linkedin', Icon: LinkedInIcon, label: 'LinkedIn' },
  { key: 'messenger', Icon: MessengerIcon, label: 'Messenger' },
];

export function SocialLinks({ service }) {
  const links = socialConfig.filter(({ key }) => service[key]);

  if (links.length === 0) return null;

  return (
    <div className="flex items-center gap-2.5">
      {links.map((item) => (
        <a
          key={item.key}
          href={getSafeHref(service[item.key])}
          target="_blank"
          rel="noopener noreferrer"
          className="text-dark-blue/40 hover:text-brand-blue transition-colors"
          aria-label={item.label}
        >
          <item.Icon className="w-6 h-6" />
        </a>
      ))}
    </div>
  );
}
