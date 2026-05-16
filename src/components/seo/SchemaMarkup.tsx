import React from "react";
import { SITE } from "@/lib/constants";

export const OrganizationSchema = () => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE.name,
    url: SITE.url,
    logo: `${SITE.url}/favicon.svg`,
    description: SITE.description,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Chicago",
      addressRegion: "IL",
      addressCountry: "US",
    },
    sameAs: [SITE.skoolUrl, SITE.beaconsUrl],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
};

export const WebSiteSchema = () => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE.name,
    url: SITE.url,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
};

export const CourseSchema = ({
  title,
  description,
}: {
  title: string;
  description: string;
}) => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: title,
    description: description,
    provider: {
      "@type": "Organization",
      name: SITE.name,
      sameAs: SITE.url,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
};

export const ServiceSchema = ({
  title,
  description,
}: {
  title: string;
  description: string;
}) => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: title,
    description: description,
    provider: {
      "@type": "Organization",
      name: SITE.name,
      address: {
        "@type": "PostalAddress",
        addressLocality: "Chicago",
        addressRegion: "IL",
        addressCountry: "US",
      },
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
};

export const ProfilePageSchema = ({
  name,
  description,
}: {
  name: string;
  description: string;
}) => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    name: name,
    description: description,
    mainEntity: {
      "@type": "Person",
      name: SITE.name,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
};

export const EventSchema = ({
  name,
  description,
  url,
  startDate,
  endDate,
}: {
  name: string;
  description: string;
  url?: string;
  startDate?: string;
  endDate?: string;
}) => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Event",
    name,
    description,
    url: url || SITE.url,
    startDate: startDate || new Date().toISOString(),
    endDate: endDate || new Date(new Date().getTime() + 2 * 60 * 60 * 1000).toISOString(),
    eventAttendanceMode: "https://schema.org/OnlineEventAttendanceMode",
    eventStatus: "https://schema.org/EventScheduled",
    location: {
      "@type": "VirtualLocation",
      url: url || SITE.url,
    },
    organizer: {
      "@type": "Organization",
      name: SITE.name,
      url: SITE.url,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
};
