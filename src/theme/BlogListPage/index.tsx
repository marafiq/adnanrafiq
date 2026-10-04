/**
 * Adapted from Docusaurus' BlogListPage (Meta Platforms, Inc.; MIT license).
 * Keep its metadata, structured data and pagination while adding writing search.
 */
import React, {useState} from 'react';
import Link from '@docusaurus/Link';
import {PageMetadata, HtmlClassNameProvider, ThemeClassNames} from '@docusaurus/theme-common';
import BlogLayout from '@theme/BlogLayout';
import BlogListPaginator from '@theme/BlogListPaginator';
import SearchMetadata from '@theme/SearchMetadata';
import BlogPostItems from '@theme/BlogPostItems';
import BlogListPageStructuredData from '@theme/BlogListPage/StructuredData';
import type {Props} from '@theme/BlogListPage';
import {ArticleList, usePosts} from '@site/src/components/Editorial';

export default function BlogListPage(props: Props): React.JSX.Element {
  const {metadata, items, sidebar} = props;
  const posts = usePosts();
  const [query, setQuery] = useState('');
  const terms = query.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
  const results = posts.filter(post => {
    const text = `${post.title} ${post.description} ${post.tags.map(tag => tag.label).join(' ')}`.toLocaleLowerCase();
    return terms.every(term => text.includes(term));
  });
  const searching = terms.length > 0;
  return <HtmlClassNameProvider className={`${ThemeClassNames.wrapper.blogPages} ${ThemeClassNames.page.blogListPage}`}>
    <PageMetadata title={metadata.blogTitle} description={metadata.blogDescription} />
    <SearchMetadata tag="blog_posts_list" />
    <BlogListPageStructuredData {...props} />
    <BlogLayout sidebar={sidebar}>
      <header className="writing-header">
        <p className="eyebrow">The notebook</p>
        <h1>Writing</h1>
        <p>.NET, software engineering, and the work around the code.</p>
        <div className="writing-tools"><nav aria-label="Browse writing">
          <Link to="/blog/tags/">Browse topics</Link><Link to="/blog/archive/">Archive</Link><a href="/blog/rss.xml">RSS feed</a>
        </nav><span className="post-meta">{posts.length} articles</span></div>
        <div className="writing-search">
          <label htmlFor="writing-search">Find an article</label>
          <input id="writing-search" type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Search titles, topics, and descriptions…" />
        </div>
        <div className="search-status" role="status" aria-live="polite">
          {searching && <>{results.length} {results.length === 1 ? 'article' : 'articles'} found<button className="search-clear" onClick={() => setQuery('')}>Clear search</button></>}
        </div>
      </header>
      {searching ? <><ArticleList posts={results} />{results.length === 0 && <p>No articles match “{query}”. Try a topic such as performance, middleware, or C#.</p>}</> : <><BlogPostItems items={items} /><BlogListPaginator metadata={metadata} /></>}
    </BlogLayout>
  </HtmlClassNameProvider>;
}
