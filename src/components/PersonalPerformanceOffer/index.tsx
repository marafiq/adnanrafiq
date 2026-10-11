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
    <h2 id={headingId}>Your team has features to ship. Production problems keep pulling them back.</h2>
    <ul className={styles.painPoints}>
      <li>Slow screens and reports frustrate users</li>
      <li>The same timeouts and failures keep coming back</li>
      <li>Your application struggles when demand peaks</li>
    </ul>
    <p>I find and fix performance and stability problems across .NET and SQL Server, and use the causes we uncover to build AI guardrails that help catch those patterns in new code.</p>
    <a className={styles.cta} href="https://x.com/madnan_rafiq">DM me on X with the problem taking the most time from your team. <span aria-hidden="true">↗</span></a>
    <Link className={styles.videoLink} to="/#performance-offer">Watch my diagnostics walkthrough on On .NET Live. <span aria-hidden="true">↗</span></Link>
  </section>;
}
