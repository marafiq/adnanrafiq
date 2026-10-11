import React from 'react';
import {useBlogPost} from '@docusaurus/plugin-content-blog/client';
import OriginalBlogPostItem from '@theme-original/BlogPostItem';
import type {Props} from '@theme/BlogPostItem';
import PersonalPerformanceOffer, {isPerformanceOfferArticle} from '@site/src/components/PersonalPerformanceOffer';
import styles from './styles.module.css';

export default function BlogPostItem(props: Props): React.JSX.Element {
  const {metadata, isBlogPostPage} = useBlogPost();
  const showOffer = isBlogPostPage && isPerformanceOfferArticle(metadata.permalink);
  return <>
    <OriginalBlogPostItem {...props} />
    {showOffer && <div className={styles.mobile}><PersonalPerformanceOffer /></div>}
  </>;
}
