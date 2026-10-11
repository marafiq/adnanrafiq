import React from 'react';
import Link from '@docusaurus/Link';
import styles from './styles.module.css';

const articlePath = '/blog/complete-guide-to-hosted-or-background-or-worker-services-in-dot-net-using-csharp';

export function isPerformanceOfferArticle(pathname: string): boolean {
  return pathname.replace(/\/$/, '') === articlePath;
}

export default function PersonalPerformanceOffer(): React.JSX.Element {
  const headingId = React.useId();
  return <section className={styles.card} aria-labelledby={headingId}>
    <h2 id={headingId}>Performance issues in your .NET stack?</h2>
    <p>I help diagnose and resolve bottlenecks across .NET applications and SQL Server. We agree on a measurable target, scope, test conditions and fixed fee upfront. You pay when the agreed target is met.</p>
    <a className={styles.cta} href="https://x.com/madnan_rafiq">DM me on X <span aria-hidden="true">↗</span></a>
    <p className={styles.support}>Tell me what you’re seeing and what needs to improve.</p>
    <Link className={styles.videoLink} to="/#performance-offer">Offer and diagnostics video <span aria-hidden="true">↗</span></Link>
  </section>;
}
