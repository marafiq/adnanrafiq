import React from 'react';
import {useBlogPost} from '@docusaurus/plugin-content-blog/client';
import OriginalBlogPostItem from '@theme-original/BlogPostItem';
import type {Props} from '@theme/BlogPostItem';
import PersonalPerformanceOffer from '@site/src/components/PersonalPerformanceOffer';
import styles from './styles.module.css';

export default function BlogPostItem(props: Props): React.JSX.Element {
  const {isBlogPostPage} = useBlogPost();
  return <>
    <OriginalBlogPostItem {...props} />
    {isBlogPostPage && <div className={styles.mobile}><PersonalPerformanceOffer /></div>}
  </>;
}
