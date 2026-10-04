// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

// prism-react-renderer v2 exposes all bundled themes from the package root
// (v1's `prism-react-renderer/themes/*` deep imports were removed).
const {themes: prismThemes} = require('prism-react-renderer');

const darkCodeTheme = prismThemes.dracula;

/** @type {import('@docusaurus/types').Config} */
const config = {
    title: "Adnan Rafiq - A Developer Blog",
    tagline: 'Developer Insights',
    url: 'https://adnanrafiq.com',
    baseUrl: '/',
    onBrokenLinks: 'throw',
    favicon: 'img/favicon.ico',
    trailingSlash: true,
    i18n: {
        defaultLocale: 'en',
        locales: ['en'],
    },

    markdown: {
        // Docusaurus 3 renders ```mermaid code fences natively via @docusaurus/theme-mermaid.
        // This replaces the mdx-mermaid remark plugin + standalone mermaid@8 dependency,
        // neither of which is compatible with Docusaurus 3 / MDX v3.
        mermaid: true,
        hooks: {
            // Moved here from the top-level `onBrokenMarkdownLinks`, which is
            // deprecated in Docusaurus 3 and removed in v4.
            onBrokenMarkdownLinks: 'warn',
        },
    },
    themes: ['@docusaurus/theme-mermaid'],
    plugins: [require.resolve('./plugins/editorial')],

    presets: [
        [
            'classic',
            /** @type {import('@docusaurus/preset-classic').Options} */
            ({
                docs: false,
                blog: {
                    showReadingTime: true,
                    feedOptions: {
                        title: "Adnan Rafiq Blog",
                        language: "en-US",
                        type: "all",
                        description: "A blog written by Adnan Rafiq - A VP of Technology",
                        copyright: `Copyright © ${new Date().getFullYear()} Adnan Rafiq`
                    },
                    sortPosts: "descending",
                    blogSidebarCount: "ALL"
                },
                theme: {
                    customCss: require.resolve('./src/css/custom.css'),
                },
                sitemap: {
                    changefreq: "weekly",
                    priority: 0.5
                },
                gtag: {
                    trackingID: 'G-DQ7K60J2EH',
                    anonymizeIP: true
                }

            }),
        ],
    ],

    themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
        ({
            navbar: {
                title: 'Adnan Rafiq',
                logo: {
                    alt: 'Adnan Rafiq Logo',
                    src: 'img/logo.png',

                },
                items: [

                    {to: '/blog', label: 'Writing', position: 'left'},
                    {to: '/cards', label: 'Code cards', position: 'left'},
                    {to: '/#journey', label: 'About', position: 'left', activeBaseRegex: '^/#journey$'},
                    {
                        href: 'https://mottobits.com/ai-delivery',
                        label: 'Move your .NET backlog forward',
                        position: 'right',
                        className: 'mottobits-delivery-cta',
                    },



                ],
            },
            footer: {
                style: 'light',
                links: [
                    {title: 'Explore', items: [
                        {label: 'All writing', to: '/blog/'},
                        {label: 'Topics', to: '/blog/tags/'},
                        {label: 'Archive', to: '/blog/archive/'},
                        {label: 'Code cards', to: '/cards/'},
                    ]},
                    {title: 'Stay connected', items: [
                        {label: 'RSS feed', href: 'https://adnanrafiq.com/blog/rss.xml'},
                        {label: 'GitHub', href: 'https://github.com/marafiq'},
                        {label: 'X', href: 'https://x.com/madnan_rafiq'},
                    ]},
                    {title: 'Mottobits', items: [
                        {label: 'Move your .NET backlog forward', href: 'https://mottobits.com/ai-delivery'},
                    ]},
                ],
                copyright: `Copyright © ${new Date().getFullYear()} Adnan Rafiq.`,
            },
            mermaid: {
                // Carried over from the previous mdx-mermaid plugin configuration.
                options: {
                    sequence: {showSequenceNumbers: true},
                },
            },
            prism: {
                theme: darkCodeTheme,
                darkTheme: darkCodeTheme,
                additionalLanguages: ['sql', 'csharp', 'powershell'],
                defaultLanguage: 'csharp'
            },

        }),
};

module.exports = config;
