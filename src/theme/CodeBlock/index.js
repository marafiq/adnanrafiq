/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React, {useEffect, useState} from 'react';
import clsx from 'clsx';
import Highlight, {defaultProps} from 'prism-react-renderer';
import copy from 'copy-text-to-clipboard';
import Translate, {translate} from '@docusaurus/Translate';
import {
    parseCodeBlockTitle,
    parseLanguage,
    parseLines,
    ThemeClassNames,
    useThemeConfig,
} from '@docusaurus/theme-common';
import usePrismTheme from '@theme/hooks/usePrismTheme';
import styles from './styles.module.css';
import domtoimage from 'dom-to-image';
// @ts-ignore
import AvatarUrl from '@site/static/img/profile-avatar.jpg';

export default function CodeBlock({
                                      children,
                                      className: blockClassName,
                                      metastring,
                                      title,
                                      description,
                                      showFooter, index
                                  }) {
    const {prism} = useThemeConfig();
    const [showCopied, setShowCopied] = useState(false);
    const [mounted, setMounted] = useState(false); // The Prism theme on SSR is always the default theme but the site theme
    // can be in a different mode. React hydration doesn't update DOM styles
    // that come from SSR. Hence force a re-render after mounting to apply the
    // current relevant styles. There will be a flash seen of the original
    // styles seen using this current approach but that's probably ok. Fixing
    // the flash will require changing the theming approach and is not worth it
    // at this point.

    useEffect(() => {
        setMounted(true);
    }, []); // TODO: the title is provided by MDX as props automatically
    // so we probably don't need to parse the metastring
    // (note: title="xyz" => title prop still has the quotes)

    const codeBlockTitle = parseCodeBlockTitle(metastring) || title;

    const codeBlockDescRegex = /description=(["'])(.*?)\1/;
    const codeBlockDesc = (metastring?.match(codeBlockDescRegex)?.[2] ?? '') || description;
    const prismTheme = usePrismTheme(); // In case interleaved Markdown (e.g. when using CodeBlock as standalone component).

    const content = Array.isArray(children) ? children.join('') : children;
    const language = parseLanguage(blockClassName) ?? prism.defaultLanguage;
    const {highlightLines, code} = parseLines(content, metastring, language);

    const handleCopyCode = () => {
        copy(code);
        setShowCopied(true);
        setTimeout(() => setShowCopied(false), 2000);
    };

    return (

        <div
            className={clsx(
                styles.codeBlockContainer,
                blockClassName,
                ThemeClassNames.common.codeBlock,
            )}>

            <div className="card item shadow--sm" style={{background: `${showFooter?'linear-gradient(90deg, rgba(58, 82, 8, 1) 0%, rgba(15, 126, 139, 1) 64%, rgba(124, 0, 255, 0.9023984593837535) 100%)':'none'}`}} id={`card${index}`}>
                {<div className="card__header" style={{color:`${showFooter?'rgb(245, 246, 247)':''}`}}>
                    <h5>
                        <div style={{display: "flex", justifyContent: "space-between"}}>
                            <span>{codeBlockTitle || "Code Example"}</span>
                            <button type={"button"} id={`TweetAsPicture${index}`}
                                    style={{display: `${!showFooter ? 'none' : 'block'}`}} onClick={() => {
                                const card = document.getElementById(`card${index}`);
                                const cardButton = document.getElementById(`TweetAsPicture${index}`);
                                cardButton.style.display = 'none';
                                domtoimage.toJpeg(card, {quality: 0.95})
                                    .then(function (dataUrl) {
                                        var link = document.createElement('a');
                                        link.download = `${codeBlockTitle.replace(/ /g, "")}.jpeg`;
                                        link.href = dataUrl

                                        link.click();
                                        setTimeout(() => cardButton.style.display = 'block', 2000);
                                    });
                            }}>Download As Image
                            </button>

                        </div>

                    </h5>
                </div>}
                {codeBlockDesc && <div className="card__body"  style={{color:"rgb(245, 246, 247)"}}>
                    {codeBlockDesc}
                </div>}
                <div className="card__body" style={{paddingLeft: "5px", paddingRight: "5px"}}>
                    <Highlight
                        {...defaultProps}
                        key={String(mounted)}
                        theme={prismTheme}
                        code={code}
                        language={language}>
                        {({className, style, tokens, getLineProps, getTokenProps}) => (
                            <div className={clsx(styles.codeBlockContent, language, "card__body_padding")}>
            <pre
                /* eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex */
                tabIndex={0}
                className={clsx(className, styles.codeBlock, 'thin-scrollbar')}
                style={style}>
              <code className={styles.codeBlockLines}>
                {tokens.map((line, i) => {
                    if (line.length === 1 && line[0].content === '\n') {
                        line[0].content = '';
                    }

                    const lineProps = getLineProps({
                        line,
                        key: i,
                    });

                    if (highlightLines.includes(i)) {
                        lineProps.className += ' docusaurus-highlight-code-line';
                    }

                    return (
                        <span key={i} {...lineProps}>
                      {line.map((token, key) => (
                          <span
                              key={key}
                              {...getTokenProps({
                                  token,
                                  key,
                              })}
                          />
                      ))}
                            <br/>
                    </span>
                    );
                })}
              </code>
            </pre>

                                <button
                                    type="button"
                                    aria-label={translate({
                                        id: 'theme.CodeBlock.copyButtonAriaLabel',
                                        message: 'Copy code to clipboard',
                                        description: 'The ARIA label for copy code blocks button',
                                    })}
                                    className={clsx(styles.copyButton, 'clean-btn')}
                                    onClick={handleCopyCode}>
                                    {showCopied ? (
                                        <Translate
                                            id="theme.CodeBlock.copied"
                                            description="The copied button label on code blocks">
                                            Copied
                                        </Translate>
                                    ) : (
                                        <Translate
                                            id="theme.CodeBlock.copy"
                                            description="The copy button label on code blocks">
                                            Copy
                                        </Translate>
                                    )}
                                </button>
                            </div>)}</Highlight>
                </div>
                {showFooter && <div className="card__footer"  style={{color:"rgb(245, 246, 247)"}}>
                    <div className="avatar">
                        <a
                            className="avatar__photo-link avatar__photo avatar__photo--lg"
                            href="https://adnanrafiq.com"
                        >
                            <img
                                alt="Adnan Picture"
                                src={AvatarUrl}
                            />
                        </a>
                        <div className="avatar__intro">
                            <div className="avatar__name">Adnan Rafiq</div>
                            <small className="avatar__subtitle">
                                A Senior Software Engineer with more than 15 years of experience.
                            </small>
                            <small><a href={"https://adnanrafiq.com"}>https://adnanrafiq.com</a> </small>
                        </div>
                    </div>

                </div>}
            </div>


        </div>


    )
        ;
}
