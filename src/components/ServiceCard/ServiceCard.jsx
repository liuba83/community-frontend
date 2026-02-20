import { useState } from 'react';
import { ImageGallery } from './ImageGallery';
import { SocialLinks } from './SocialLinks';
import { MapPinIcon, PhoneIcon, EmailIcon, GlobeIcon, ChevronDownIcon } from '../UI/Icon';
import { getSafeHref, getDomain } from '../../utils/validation';
import { parseImageUrls } from '../../utils/imageUrl';
import { useLanguage } from '../../hooks/useLanguage';

const DESCRIPTION_LIMIT = 150;

export function ServiceCard({ service }) {
  const [expanded, setExpanded] = useState(false);
  const { t } = useLanguage();

  const description = service.description || '';
  const isLong = description.length > DESCRIPTION_LIMIT;
  const displayDescription = expanded ? description : description.slice(0, DESCRIPTION_LIMIT);

  const tags = service.category
    ? service.category.split(',').map((tag) => tag.trim()).filter(Boolean)
    : [];

  const hasImages = parseImageUrls(service.images).length > 0;

  return (
    <div className="bg-white rounded-[30px] shadow-card p-5 flex flex-col gap-5">
      <ImageGallery images={service.images} />

      {/* Name + optional avatar + tags */}
      <div className="flex items-start gap-3.75">
        {!hasImages && (
          <div className="w-14.75 h-14.75 rounded-full bg-light-gray flex items-center justify-center shrink-0 text-xl font-bold text-dark-blue/50">
            {service.title?.[0]?.toUpperCase() || '?'}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-dark-blue text-xl leading-tight mb-2.5">
            {service.title}
          </h3>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.25">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center px-3 py-0.5 border border-stroke rounded-full text-base text-text"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Contact info */}
      <div className="flex flex-col gap-3">
        {service.address && (
          <div className="flex items-center gap-1.25">
            <MapPinIcon className="w-4 h-4 shrink-0 text-dark-blue" />
            <span className="text-base text-dark-blue">{service.address}</span>
          </div>
        )}
        {service.phone && (
          <div className="flex items-center gap-1.25">
            <PhoneIcon className="w-4 h-4 shrink-0 text-dark-blue" />
            <a href={`tel:${service.phone}`} className="text-base text-brand-blue underline">
              {service.phone}
            </a>
          </div>
        )}
        {service.email && (
          <div className="flex items-center gap-1.25">
            <EmailIcon className="w-4 h-4 shrink-0 text-dark-blue" />
            <a href={`mailto:${service.email}`} className="text-base text-brand-blue underline">
              {service.email}
            </a>
          </div>
        )}
        {service.website && (
          <div className="flex items-center gap-1.25">
            <GlobeIcon className="w-4 h-4 shrink-0 text-dark-blue" />
            <a
              href={getSafeHref(service.website)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-base text-brand-blue underline"
            >
              {getDomain(service.website)}
            </a>
          </div>
        )}
      </div>

      {/* Description + show more/less + social links */}
      <div>
        {description && (
          <p className="text-base text-text leading-6">
            {displayDescription}
            {isLong && !expanded && '…'}
          </p>
        )}
        <div className={`flex items-center ${isLong ? 'justify-between' : 'justify-end'}`}>
          {isLong && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-1 text-brand-blue text-base cursor-pointer hover:opacity-80"
            >
              {expanded ? t('services.showLess') : t('services.showMore')}
              <ChevronDownIcon
                className={`w-6 h-6 transition-transform ${expanded ? 'rotate-180' : ''}`}
              />
            </button>
          )}
          <SocialLinks service={service} />
        </div>
      </div>
    </div>
  );
}
