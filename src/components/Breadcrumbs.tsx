'use client';

import Link from 'next/link';
import { ChevronRightIcon, HomeIcon } from '@heroicons/react/24/outline';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
  const baseUrl = 'https://www.camimob.ro';

  // Generate JSON-LD for breadcrumbs
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Acasă',
        item: baseUrl,
      },
      ...items.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 2,
        name: item.label,
        ...(item.href && { item: `${baseUrl}${item.href}` }),
      })),
    ],
  };

  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      {/* Visual Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="flex items-center space-x-2 text-sm mb-6">
        <Link
          href="/"
          className="flex items-center text-gray-600 hover:text-primary-600 transition-colors"
        >
          <HomeIcon className="h-4 w-4" />
          <span className="sr-only">Acasă</span>
        </Link>

        {items.map((item, index) => (
          <div key={index} className="flex items-center space-x-2">
            <ChevronRightIcon className="h-4 w-4 text-gray-400" />
            {item.href ? (
              <Link
                href={item.href}
                className="text-gray-600 hover:text-primary-600 transition-colors"
              >
                {item.label}
              </Link>
            ) : (
              <span className="text-gray-900 font-medium">{item.label}</span>
            )}
          </div>
        ))}
      </nav>
    </>
  );
}
