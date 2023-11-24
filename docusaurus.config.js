// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const lightCodeTheme = require('prism-react-renderer/themes/github');
const darkCodeTheme = require('prism-react-renderer/themes/dracula');

/** @type {import('@docusaurus/types').Config} */
const config = {
    title: "Adnan Rafiq - A Developer Blog",
    tagline: 'Developer Insights',
    url: 'https://adnanrafiq.com',
    baseUrl: '/',
    onBrokenLinks: 'throw',
    onBrokenMarkdownLinks: 'warn',
    favicon: 'img/favicon.ico',
    trailingSlash: true,
    i18n: {
        defaultLocale: 'en',
        locales: ['en'],
    },

    /*plugins: [require.resolve("@cmfcmf/docusaurus-search-local")],https://github.com/cmfcmf/docusaurus-search-local*/
    presets: [
        [
            'classic',
            /** @type {import('@docusaurus/preset-classic').Options} */
            ({
                docs: false,
                blog: {
                    remarkPlugins: [[require('mdx-mermaid'), {mermaid: {config: {sequence: {showSequenceNumbers: true}}}}]],
                    showReadingTime: true,
                    editUrl: 'https://github.com/marafiq/adnanrafiq/edit/main/',
                    feedOptions: {
                        title: "Adnan Rafiq Blog",
                        language: "en-US",
                        type: "all",
                        description: "A blog written by Adnan Rafiq - A Senior Software Engineer",
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
                        label: 'Show Support by Subscribing to my YouTube Channel',
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
            prism: {
                theme: darkCodeTheme,
                darkTheme: darkCodeTheme,
                additionalLanguages: ['sql', 'csharp', 'powershell'],
                defaultLanguage: 'csharp'
            },
        }),
};

module.exports = config;
