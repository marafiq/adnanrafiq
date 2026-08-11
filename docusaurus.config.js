// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

// prism-react-renderer v2 exposes all bundled themes from the package root
// (v1's `prism-react-renderer/themes/*` deep imports were removed).
const {themes: prismThemes} = require('prism-react-renderer');

const lightCodeTheme = prismThemes.github;
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

    /*plugins: [require.resolve("@cmfcmf/docusaurus-search-local")],https://github.com/cmfcmf/docusaurus-search-local*/
    presets: [
        [
            'classic',
            /** @type {import('@docusaurus/preset-classic').Options} */
            ({
                docs: false,
                blog: {
                    showReadingTime: true,
                    editUrl: 'https://github.com/marafiq/adnanrafiq/edit/main/',
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

                    {to: '/blog', label: 'Blog', position: 'left'},
                    {to: '/cards', label: 'Cards', position: 'left'},
                    {
                        href: 'https://youtube.com/@OpenSourcedotNET?sub_confirmation=1',
                        label: 'Subscribe to my YouTube Channel',
                        position: 'right',
                        className: 'subscribe-to-youtube',
                    },
                    {
                        href: 'https://github.com/marafiq',
                        label: 'GitHub',
                        position: 'right',
                    },
                    {
                        href: 'https://twitter.com/madnan_rafiq',
                        label: 'Twitter',
                        position: 'right',
                    },


                ],
            },
            footer: {
                style: 'dark',
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
            announcementBar: {
                id: 'SubscribeBanner',
                content:
                    'I have started a YouTube Channel, please show your support by subscribing <a target="_blank" rel="noopener noreferrer" href="https://youtube.com/@OpenSourcedotNET?sub_confirmation=1">Now</a>. It will be a great motivation for me.',
                backgroundColor: '#fafbfc',
                textColor: '#091E42',
                isCloseable: false,
            }
        }),
};

module.exports = config;
