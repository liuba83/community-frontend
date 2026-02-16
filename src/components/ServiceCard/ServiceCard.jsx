import { useState } from 'react';
import { ImageGallery } from './ImageGallery';
import { SocialLinks } from './SocialLinks';
import { MapPinIcon, PhoneIcon, EmailIcon, GlobeIcon } from '../UI/Icon';
import { getSafeHref, getDomain } from '../../utils/validation';
import { useLanguage } from '../../hooks/useLanguage';

const DESCRIPTION_LIMIT = 150;

export function ServiceCard({ service }) {
  const [expanded, setExpanded] = useState(false);
  const { t } = useLanguage();

  const description = service.description || '';
  const isLong = description.length > DESCRIPTION_LIMIT;
  const displayDescription = expanded ? description : description.slice(0, DESCRIPTION_LIMIT);

  return (
    <div className="bg-white rounded-2xl shadow-card p-5 flex flex-col">
      <ImageGallery images={service.images} />

      <div className="flex items-start gap-3 mb-3">
        <div className="w-10 h-10 rounded-full bg-light-gray flex items-center justify-center shrink-0 text-lg">
          {service.title?.[0]?.toUpperCase() || '?'}
        </div>
        <div>
          <h3 className="font-bold text-dark-blue text-base leading-tight">{service.title}</h3>
          {service.category && (
            <span className="inline-block mt-1 px-2 py-0.5 bg-light-gray text-xs rounded-full text-text/70">
              {service.category}
            </span>
          )}
        </div>
      </div>

      {service.address && (
        <div className="flex items-start gap-2 text-sm text-text/70 mb-2">
          <MapPinIcon className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{service.address}</span>
        </div>
      )}

      {service.phone && (
        <div className="flex items-center gap-2 text-sm mb-1">
          <PhoneIcon className="w-4 h-4 shrink-0 text-text/70" />
          <a href={`tel:${service.phone}`} className="text-brand-blue hover:underline">
            {service.phone}
          </a>
        </div>
      )}

      {service.email && (
        <div className="flex items-center gap-2 text-sm mb-1">
          <EmailIcon className="w-4 h-4 shrink-0 text-text/70" />
          <a href={`mailto:${service.email}`} className="text-brand-blue hover:underline">
            {service.email}
          </a>
        </div>
      )}

      {service.website && (
        <div className="flex items-center gap-2 text-sm mb-1">
          <GlobeIcon className="w-4 h-4 shrink-0 text-text/70" />
          <a
            href={getSafeHref(service.website)}
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand-blue hover:underline"
          >
            {getDomain(service.website)}
          </a>
        </div>
      )}

      {description && (
        <p className="text-sm text-text/70 mt-3 leading-relaxed">
          {displayDescription}
          {isLong && !expanded && '... '}
          {isLong && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-brand-blue font-bold text-sm hover:underline cursor-pointer"
            >
              {expanded ? t('services.showLess') : t('services.showMore')}
            </button>
          )}
        </p>
      )}

      <SocialLinks service={service} />
    </div>
  );
}
