import React from 'react';
import {useLocation} from '@docusaurus/router';
import OriginalBlogSidebarDesktop from '@theme-original/BlogSidebar/Desktop';
import type {Props} from '@theme/BlogSidebar/Desktop';
import PersonalPerformanceOffer, {isPerformanceOfferArticle} from '@site/src/components/PersonalPerformanceOffer';
import styles from './styles.module.css';

export default function BlogSidebarDesktop(props: Props): React.JSX.Element {
  const {pathname} = useLocation();
  if (!isPerformanceOfferArticle(pathname)) return <OriginalBlogSidebarDesktop {...props} />;

  // Use the existing three-column navigation rail; leave article and TOC widths intact.
  return <aside className={`col col--3 ${styles.desktop}`} aria-label="Performance consulting and writing navigation">
    <div className={`${styles.rail} thin-scrollbar`}>
      <PersonalPerformanceOffer />
      <div className={styles.navigation}><OriginalBlogSidebarDesktop {...props} /></div>
    </div>
  </aside>;
}
