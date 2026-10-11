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
    <h2 id={headingId}>Your team has features to ship. Performance problems keep pulling them back.</h2>
    <ul className={styles.painPoints}>
      <li>Slow screens and reports that frustrate customers</li>
      <li>SQL timeouts and recurring failures that erode trust</li>
      <li>Applications that struggle when demand peaks</li>
    </ul>
    <p>I help your team resolve performance and stability problems across .NET and SQL Server, without hiring a dedicated performance engineer. I investigate the underlying causes, implement targeted fixes and measure the improvement.</p>
    <p>I also build AI guardrails into your codebase to help prevent the same problems from returning.</p>
    <a className={styles.cta} href="https://x.com/madnan_rafiq">DM me on X and tell me what keeps coming back. <span aria-hidden="true">↗</span></a>
    <Link className={styles.videoLink} to="/#performance-offer">Offer and diagnostics video <span aria-hidden="true">↗</span></Link>
  </section>;
}
