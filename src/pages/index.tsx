import React from 'react';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';
import Link from '@docusaurus/Link';
import {ArticleList, PostMeta, usePosts} from '@site/src/components/Editorial';
import styles from './index.module.css';

const journey = [
  {
    "title": "I am from Pakistan",
    "image": "/img/pakistan-home-picture.jpg",
    "alt": "Fields Outside My Home in Pakistan",
    "text": "I grew up in a small village in Pakistan. I passed my 10th-grade using Laltein. A place where my parents, sisters, and extended family live."
  },
  {
    "title": "The Lahore.",
    "image": "/img/lahore.jpg",
    "alt": "Lahore Minar-e-Pakistan Picture",
    "text": "The city of Lahore, where I studied and landed my first job as a Software Developer. A city with beautiful nightlife, food, and culture. A place where friends live."
  },
  {
    "title": "Dubai - UAE",
    "image": "/img/dubai.jpg",
    "alt": "Dubai",
    "text": "One day I packed my bags and landed in Dubai for Job Hunt. I worked for musafir.com and Ajman Municipality. If you can afford to move, it's a place to experience."
  },
  {
    "title": "Boston",
    "image": "/img/boston.jpg",
    "alt": "Boston",
    "text": "It's been more than seven years; I am working as a VP of Technology. A place where I live with my beautiful wife and kids."
  }
];

export default function Home(): React.JSX.Element {
  const posts = usePosts();
  const latest = posts[0];
  const selected = ['dot-net-performance-tools-and-resources', 'a-tale-of-migrating-aspnet4x-to-aspnet6', 'does-dotnet-gc-calls-dispose-and-how-finalization-works']
    .map(slug => posts.find(post => post.permalink.replace(/\/$/, '').endsWith(`/${slug}`)))
    .filter(post => post !== undefined);
  return <Layout title="Adnan Rafiq - A Developer Blog" description="Adnan is a blogger, developer, freelancer, and caretaker. ">
    <main className={styles.home}>
      <header className={styles.intro}>
        <div>
          <p className="eyebrow">A developer’s notebook</p>
          <h1>👋🏽 Hi, I am Adnan Rafiq.</h1>
          <p className={styles.bio}>A VP of Technology. I love building applications using Microsoft Technology Stack. You can find me on <a href="https://x.com/madnan_rafiq">X</a>.</p>
        </div>
        <img className={styles.portrait} src="/img/profile-avatar.jpg" alt="Adnan Rafiq" width="120" height="144" />
      </header>
      <nav className={styles.topics} aria-label="Explore writing">
        <span className="eyebrow">Explore</span>
        <Link to="/blog/tags/performance/">.NET performance <span aria-hidden="true">↗</span></Link>
        <Link to="/blog/tags/asp-net-8/">ASP.NET <span aria-hidden="true">↗</span></Link>
        <Link to="/blog/tags/patterns/">Engineering patterns <span aria-hidden="true">↗</span></Link>
        <Link to="/blog/tags/agents/">AI & agents <span aria-hidden="true">↗</span></Link>
      </nav>
      <section className={styles.featured} aria-label="Featured writing">
        <article className={styles.latest}>
          <p className="eyebrow">The latest</p>
          <PostMeta post={latest} />
          <h2><Link to={latest.permalink}>{latest.title}</Link></h2>
          <p>{latest.description}</p>
          <Link className="text-link" to={latest.permalink}>Read the article <span aria-hidden="true">↗</span></Link>
        </article>
        <div className={styles.selected}>
          <p className="eyebrow">Start here</p>
          {selected.map((post, index) => <article key={post.permalink}>
            <span className={styles.number} aria-hidden="true">0{index + 1}</span>
            <div><h3><Link to={post.permalink}>{post.title}</Link></h3><PostMeta post={post} /></div>
          </article>)}
        </div>
      </section>
      <section className={styles.recent} aria-labelledby="recent-heading">
        <div className="section-heading"><h2 id="recent-heading">More from the notebook</h2><Link className="text-link" to="/blog/">All writing <span aria-hidden="true">↗</span></Link></div>
        <ArticleList posts={posts.slice(1, 4)} />
      </section>
      <aside className={styles.delivery} aria-label="Mottobits">
        <div><p className="eyebrow">Mottobits</p><h2>Move your .NET backlog forward</h2></div>
        <a className="text-link" href="https://mottobits.com/ai-delivery">Explore dedicated development and QA <span aria-hidden="true">↗</span></a>
      </aside>
      <section className={styles.journey} aria-labelledby="journey">
        <div className="section-heading"><Heading as="h2" id="journey">My Journey</Heading><span className="eyebrow">Pakistan / Lahore / Dubai / Boston</span></div>
        <div className={styles.journeyGrid}>{journey.map(place => <article key={place.title}>
          <img src={place.image} alt={place.alt} title={place.alt} loading="lazy" width="480" height="360" />
          <h3>{place.title}</h3><p>{place.text}</p>
        </article>)}</div>
      </section>
    </main>
  </Layout>;
}
