export const REGULATIONS = {
    US: {
        name: 'United States',
        code: 'US',
        authority: 'CDC/USDA Select Agent Program',
        flagIcon: '🇺🇸',
        rules: [
            {
                keywords: ['anthracis', 'anthrax', 'b.anthracis'],
                status: 'TIER_1_RESTRICTED',
                severity: 'CRITICAL',
                description: 'Bacillus anthracis (Tier 1 Select Agent)',
                citation: '42 CFR Part 73',
                guidance: 'Possession requires FBI security risk assessment and CDC/USDA registration.',
                link: 'https://www.ecfr.gov/current/title-42/chapter-I/subchapter-F/part-73'
            },
            {
                keywords: ['variola', 'smallpox'],
                status: 'PROHIBITED',
                severity: 'CRITICAL',
                description: 'Variola virus (Prohibited)',
                citation: '42 CFR Part 73.3',
                guidance: 'Possession strictly prohibited except at WHO-designated facilities (CDC Atlanta, VECTOR Russia).',
                link: 'https://www.ecfr.gov/current/title-42/chapter-I/subchapter-F/part-73/section-73.3'
            },
            {
                keywords: ['botulinum', 'clostridium botulinum neurotoxin'],
                status: 'TIER_1_RESTRICTED',
                severity: 'CRITICAL',
                description: 'Botulinum neurotoxin (Tier 1)',
                citation: '42 CFR Part 73',
                guidance: 'Requires high-level registration and security measures.',
                link: 'https://www.ecfr.gov/current/title-42/chapter-I/subchapter-F/part-73'
            },
            {
                keywords: ['ebola', 'ebolavirus'],
                status: 'TIER_1_RESTRICTED',
                severity: 'CRITICAL',
                description: 'Ebola virus (Tier 1)',
                citation: '42 CFR Part 73',
                guidance: 'BSL-4 containment required. Possession requires federal registration.',
                link: 'https://www.ecfr.gov/current/title-42/chapter-I/subchapter-F/part-73'
            },
            {
                keywords: ['pestis', 'y.pestis', 'yersinia pestis'],
                status: 'TIER_1_RESTRICTED',
                severity: 'CRITICAL',
                description: 'Yersinia pestis (Plague - Tier 1)',
                citation: '42 CFR Part 73',
                guidance: 'Select Agent registration mandatory.',
                link: 'https://www.ecfr.gov/current/title-42/chapter-I/subchapter-F/part-73'
            },
            {
                keywords: ['francisella', 'tularensis'],
                status: 'TIER_1_RESTRICTED',
                severity: 'CRITICAL',
                description: 'Francisella tularensis (Tier 1)',
                citation: '42 CFR Part 73',
                guidance: 'Requires federal oversight.',
                link: 'https://www.ecfr.gov/current/title-42/chapter-I/subchapter-F/part-73'
            },
            {
                keywords: ['marburg', 'marburgvirus'],
                status: 'TIER_1_RESTRICTED',
                severity: 'CRITICAL',
                description: 'Marburg virus (Tier 1)',
                citation: '42 CFR Part 73',
                guidance: 'BSL-4 required.',
                link: 'https://www.ecfr.gov/current/title-42/chapter-I/subchapter-F/part-73'
            }
        ]
    },

    EU: {
        name: 'European Union',
        code: 'EU',
        authority: 'EU Dual-Use Regulation (2021/821)',
        flagIcon: '🇪🇺',
        rules: [
            {
                keywords: ['anthracis', 'anthrax', 'b.anthracis'],
                status: 'EXPORT_CONTROLLED',
                severity: 'HIGH',
                description: 'Bacillus anthracis (Dual-Use Item)',
                citation: 'Regulation (EU) 2021/821, Annex I',
                guidance: 'Export license required. Intra-EU transfer restrictions apply.',
                link: 'https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A32021R0821'
            },
            {
                keywords: ['variola', 'smallpox'],
                status: 'PROHIBITED',
                severity: 'CRITICAL',
                description: 'Variola virus (Prohibited)',
                citation: 'EU Dual-Use Regulation',
                guidance: 'Strictly prohibited for all member states.',
                link: 'https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A32021R0821'
            },
            {
                keywords: ['botulinum', 'clostridium botulinum'],
                status: 'EXPORT_CONTROLLED',
                severity: 'HIGH',
                description: 'Botulinum toxin (Dual-Use)',
                citation: 'Regulation (EU) 2021/821',
                guidance: 'License required for export and certain research activities.',
                link: 'https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A32021R0821'
            },
            {
                keywords: ['ebola', 'ebolavirus', 'marburg', 'marburgvirus'],
                status: 'EXPORT_CONTROLLED',
                severity: 'HIGH',
                description: 'Filoviruses (Ebola, Marburg) - Dual-Use',
                citation: 'Regulation (EU) 2021/821',
                guidance: 'Export and transfer restrictions apply.',
                link: 'https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A32021R0821'
            }
        ]
    },

    UK: {
        name: 'United Kingdom',
        code: 'UK',
        authority: 'Export Control Joint Unit (ECJU)',
        flagIcon: '🇬🇧',
        rules: [
            {
                keywords: ['anthracis', 'anthrax'],
                status: 'EXPORT_CONTROLLED',
                severity: 'HIGH',
                description: 'Bacillus anthracis (Strategic Export Control)',
                citation: 'Export Control Order 2008',
                guidance: 'Export license required under UK Strategic Export Controls.',
                link: 'https://www.legislation.gov.uk/uksi/2008/3231/contents/made'
            },
            {
                keywords: ['variola', 'smallpox'],
                status: 'PROHIBITED',
                severity: 'CRITICAL',
                description: 'Variola virus (Prohibited)',
                citation: 'Export Control Order 2008',
                guidance: 'Prohibited under all circumstances.',
                link: 'https://www.legislation.gov.uk/uksi/2008/3231/contents/made'
            },
            {
                keywords: ['botulinum', 'ebola', 'marburg', 'pestis', 'francisella'],
                status: 'EXPORT_CONTROLLED',
                severity: 'HIGH',
                description: 'High-consequence pathogens (Export Controlled)',
                citation: 'Export Control Order 2008',
                guidance: 'License required for possession and transfer.',
                link: 'https://www.legislation.gov.uk/uksi/2008/3231/contents/made'
            }
        ]
    },

    IN: {
        name: 'India',
        code: 'IN',
        authority: 'DGFT & Biological Weapons Convention',
        flagIcon: '🇮🇳',
        rules: [
            {
                keywords: ['anthracis', 'anthrax', 'variola', 'smallpox', 'ebola', 'pestis'],
                status: 'RESTRICTED',
                severity: 'HIGH',
                description: 'Schedule 1 Biological Agents',
                citation: 'Foreign Trade Policy & SCOMET List',
                guidance: 'Import/Export requires DGFT license. Research use subject to approval.',
                link: 'https://content.dgft.gov.in/Website/SCOMET_List.pdf'
            },
            {
                keywords: ['botulinum'],
                status: 'RESTRICTED',
                severity: 'HIGH',
                description: 'Toxins under SCOMET',
                citation: 'SCOMET (Special Chemicals, Organisms, Materials, Equipment, and Technologies)',
                guidance: 'License mandatory for handling and transfer.',
                link: 'https://content.dgft.gov.in/Website/SCOMET_List.pdf'
            }
        ]
    },

    CN: {
        name: 'China',
        code: 'CN',
        authority: 'Ministry of Commerce (MOFCOM)',
        flagIcon: '🇨🇳',
        rules: [
            {
                keywords: ['anthracis', 'variola', 'ebola', 'botulinum', 'pestis', 'francisella'],
                status: 'STRICTLY_CONTROLLED',
                severity: 'CRITICAL',
                description: 'Class 1 Pathogenic Microorganisms',
                citation: 'Biosecurity Law of the People\'s Republic of China (2021)',
                guidance: 'Requires approval from national health and security authorities. Export/import forbidden without explicit state approval.',
                link: 'http://www.vpc.org.cn/Law/Content/1'
            }
        ]
    },

    AU: {
        name: 'Australia',
        code: 'AU',
        authority: 'Department of Defence (Export Controls)',
        flagIcon: '🇦🇺',
        rules: [
            {
                keywords: ['anthracis', 'variola', 'ebola', 'botulinum', 'pestis'],
                status: 'EXPORT_CONTROLLED',
                severity: 'HIGH',
                description: 'Security Sensitive Biological Agents (SSBAs)',
                citation: 'Defence Trade Controls Act 2012',
                guidance: 'Export permit required. Governed by Australia Group controls.',
                link: 'https://www.legislation.gov.au/Details/C2012A00153'
            }
        ]
    },

    GLOBAL: {
        name: 'Global (Default)',
        code: 'GLOBAL',
        authority: 'WHO & Biological Weapons Convention',
        flagIcon: '🌍',
        rules: [
            {
                keywords: ['anthracis', 'variola', 'ebola', 'botulinum', 'pestis', 'francisella', 'marburg', 'lassa'],
                status: 'BIOSECURITY_CONCERN',
                severity: 'HIGH',
                description: 'WHO Risk Group 4 Pathogens',
                citation: 'WHO Laboratory Biosafety Manual (4th Edition)',
                guidance: 'Maximum containment (BSL-4/PC4) required. International transport governed by IATA regulations.',
                link: 'https://www.who.int/publications/i/item/9789240011311'
            }
        ]
    }
};

/**
 * Severity levels for UI color coding
 */
export const SEVERITY_LEVELS = {
    CRITICAL: { color: 'red', label: 'Critical', priority: 1 },
    HIGH: { color: 'orange', label: 'High', priority: 2 },
    MEDIUM: { color: 'yellow', label: 'Medium', priority: 3 },
    LOW: { color: 'blue', label: 'Low', priority: 4 }
};

/**
 * Status types and their user-facing labels
 */
export const STATUS_LABELS = {
    PROHIBITED: '🚫 PROHIBITED',
    TIER_1_RESTRICTED: '⚠️ TIER 1 RESTRICTED',
    STRICTLY_CONTROLLED: '🔒 STRICTLY CONTROLLED',
    EXPORT_CONTROLLED: '📋 EXPORT LICENSE REQUIRED',
    RESTRICTED: '⚡ RESTRICTED USE',
    BIOSECURITY_CONCERN: '⚠️ BIOSECURITY RISK'
};
