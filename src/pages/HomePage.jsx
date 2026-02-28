import { useState, useMemo } from 'react';
import { Header } from '../components/Header/Header';
import { Hero } from '../components/Hero/Hero';
import { ServiceList } from '../components/ServiceList/ServiceList';
import { Footer } from '../components/Footer/Footer';
import { useServices } from '../hooks/useServices';
import { useLanguage } from '../hooks/useLanguage';

export function HomePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const { services, loading, error, refetch } = useServices();
  const { t } = useLanguage();

  const filteredServices = useMemo(() => {
    let result = services;

    // Filter by selected subcategory
    if (selectedCategory) {
      result = result.filter((s) =>
        s.category?.split(',').map((c) => c.trim()).includes(selectedCategory)
      );
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (s) =>
          s.title?.toLowerCase().includes(query) ||
          s.description?.toLowerCase().includes(query) ||
          s.category?.toLowerCase().includes(query) ||
          s.address?.toLowerCase().includes(query)
      );
    }

    return result;
  }, [services, searchQuery, selectedCategory]);

  const isFiltering = searchQuery || selectedCategory;

  const highlightedServices = useMemo(() => {
    const featured = services.filter((s) => s.featured);
    const recentNonFeatured = services.filter((s) => !s.featured);
    return [...featured, ...recentNonFeatured].slice(0, 6);
  }, [services]);

  const restServices = useMemo(() => {
    const highlightedIds = new Set(highlightedServices.map((s) => s.id));
    return services.filter((s) => !highlightedIds.has(s.id));
  }, [services, highlightedServices]);

  function handleCategorySelect(subcategory) {
    setSelectedCategory(subcategory);
    setSearchQuery('');
  }

  function handleSearchChange(value) {
    setSearchQuery(value);
    if (value) {
      setSelectedCategory(null);
    }
  }

  function clearFilters() {
    setSearchQuery('');
    setSelectedCategory(null);
  }

  return (
    <div className="min-h-screen bg-white">
      <Header onSelectCategory={handleCategorySelect} />

      <Hero
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        selectedCategory={selectedCategory}
        onCategorySelect={handleCategorySelect}
      />

      {isFiltering && (
        <div className="max-w-[1440px] mx-auto px-4 pt-6">
          <div className="flex items-center gap-2 text-sm text-text/70">
            {selectedCategory && (
              <span className="bg-dark-blue text-white px-3 py-1 rounded-full text-xs font-bold">
                {t(`subcategories.${selectedCategory}`)}
              </span>
            )}
            <button
              onClick={clearFilters}
              className="text-brand-blue hover:underline cursor-pointer"
            >
              {t('services.clearFilters')}
            </button>
          </div>
        </div>
      )}

      {isFiltering ? (
        <ServiceList
          services={filteredServices}
          loading={loading}
          error={error}
          onRetry={refetch}
          onSubcategoryClick={handleCategorySelect}
        />
      ) : (
        <>
          <ServiceList
            services={highlightedServices}
            loading={loading}
            error={error}
            onRetry={refetch}
            title={t('services.highlighted')}
            onSubcategoryClick={handleCategorySelect}
          />
          {!loading && !error && restServices.length > 0 && (
            <ServiceList
              services={restServices}
              title={t('services.allSpecialists')}
              onSubcategoryClick={handleCategorySelect}
            />
          )}
        </>
      )}

      <Footer />
    </div>
  );
}
