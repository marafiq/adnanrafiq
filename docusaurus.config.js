// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const lightCodeTheme = require('prism-react-renderer/themes/github');
const darkCodeTheme = require('prism-react-renderer/themes/dracula');

/** @type {import('@docusaurus/types').Config} */
const config = {
    title: 'Personal Web Site of Adnan Rafiq',
    tagline: 'Developer Insights',
    url: 'https://adnanrafiq.com/',
    baseUrl: '/',
    onBrokenLinks: 'throw',
    onBrokenMarkdownLinks: 'warn',
    favicon: 'img/favicon.ico',
    trailingSlash: true,
    presets: [
        [
            'classic',
            /** @type {import('@docusaurus/preset-classic').Options} */
            ({
                docs: false,
                blog: {
                    showReadingTime: true,
                    editUrl: 'https://github.com/marafiq/adnanrafiq',
                    feedOptions: {
                        title: "Adnan Rafiq Blog",
                        language: "en-US",
                        type: "all",
                        description: "A blog written by Adnan Rafiq - A Senior Software Engineer",
                        copyright: `Copyright © ${new Date().getFullYear()} Adnan Rafiq`
                    },
                    sortPosts: "descending",
                },
                theme: {
                    customCss: require.resolve('./src/css/custom.css'),
                },
                sitemap: {
                    changefreq: "weekly",
                    priority: 0.5,
                    trailingSlash: true
                },
                gtag:{
                    trackingID:'UA-173098616-1',
                    anonymizeIP:true
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
                    src: 'https://avatars.githubusercontent.com/u/9109259?s=96&v=4',
                },
                items: [

                    {to: '/blog', label: 'Blog', position: 'left'},
                    {
                        href: 'https://github.com/marafiq',
                        label: 'GitHub',
                        position: 'right',
                    },
                ],
            },
            footer: {
                style: 'dark',
                copyright: `Copyright © ${new Date().getFullYear()} Adnan Rafiq.`,
            },
            prism: {
                theme: lightCodeTheme,
                darkTheme: darkCodeTheme,
            },
        }),
};

module.exports = config;
