// ============================================================
// SITE CONFIG - Eventos SEGOPI / TELLING CONSULTING, S.L.
// ============================================================

export interface NavItem {
  label: string
  href: string
  children?: { label: string; href: string }[]
}

export interface SiteConfig {
  platformName: string
  companyName: string
  companyDescription: string
  yearFounded: number

  contact: {
    phone: string
    phoneDisplay: string
    email: string
    address: string
    city: string
    country: string
    officeHours: string
  }

  social: {
    facebook?: string
    instagram?: string
    linkedin?: string
    twitter?: string
  }

  navigation: {
    items: NavItem[]
  }

  hero: {
    headline: string
    subheadline: string
    ctaText: string
    ctaHref: string
  }

  seo: {
    siteTitle: string
    titleTemplate: string
    defaultDescription: string
    locale: string
    ogImageUrl?: string
  }

  legal: {
    privacyLastUpdated: string
    termsLastUpdated: string
    cookiesLastUpdated: string
    rgpdResponsible: string
    rgpdAddress: string
    rgpdEmail: string
  }
}

// ============================================================
// CONFIGURACION: Eventos SEGOPI - TELLING CONSULTING, S.L.
// ============================================================

export const siteConfig: SiteConfig = {
  platformName: 'Eventos SEGOPI',
  companyName: 'TELLING CONSULTING, S.L.',
  companyDescription:
    'Plataforma oficial de eventos para Profesionales de la Pintura y la Construcción. Formacion, networking y conocimiento para profesionales del sector.',
  yearFounded: 2018,

  contact: {
    phone: '+34629532423',
    phoneDisplay: '629 532 423',
    email: 'eventos@segopi.es',
    address: 'Calle Guadarrama 11',
    city: 'Segovia',
    country: 'España',
    officeHours: 'Lunes a Viernes, 9:00 a 18:00',
  },

  social: {
    linkedin: 'https://linkedin.com/company/segopi',
    twitter: 'https://twitter.com/segopi',
  },

  navigation: {
    items: [
      { label: 'Inicio', href: '/' },
      { label: 'Eventos', href: '/#eventos' },
      { label: 'Sobre Nosotros', href: 'https://www.segopi.es/content/4-sobre-nosotros' },
      { label: 'Contacto', href: '/contacto' },
    ],
  },

  hero: {
    headline: 'Vive la Experiencia Junto a Nuestro Equipo de Profesionales',
    subheadline:
      'Sumérgete en un evento donde la inspiración y la experiencia profesional se unen para acompañarte en la creación de nuevas oportunidades.',
    ctaText: 'Ver Proximos Eventos',
    ctaHref: '#eventos',
  },

  seo: {
    siteTitle: 'Eventos SEGOPI | Profesionales de la Pintura y la Construcción',
    titleTemplate: '%s | Eventos SEGOPI',
    defaultDescription:
      'Plataforma oficial de eventos del sector de la pintura y la construcción. Formacion, jornadas y congresos para profesionales del sector en Espana.',
    locale: 'es_ES',
  },

  legal: {
    privacyLastUpdated: '2026-01-01',
    termsLastUpdated: '2026-01-01',
    cookiesLastUpdated: '2026-01-01',
    rgpdResponsible: 'TELLING CONSULTING, S.L.',
    rgpdAddress: 'Calle Guadarrama 11, Segovia, España',
    rgpdEmail: 'eventos@segopi.es',
  },
}
