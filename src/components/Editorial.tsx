import React from 'react';
import Link from '@docusaurus/Link';
import {usePluginData} from '@docusaurus/useGlobalData';

export type Post = {
  title: string;
  description: string;
  permalink: string;
  date: string;
  readingTime?: number;
  tags: {label: string; permalink: string}[];
};

export function usePosts(): Post[] {
  return (usePluginData('editorial') as {posts: Post[]}).posts;
}

export function PostMeta({post}: {post: Post}): React.JSX.Element {
  const date = new Intl.DateTimeFormat('en-US', {
    month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC',
  }).format(new Date(post.date));
  return <div className="post-meta">
    <time dateTime={post.date}>{date}</time>
    {post.readingTime != null && <><span aria-hidden="true">/</span><span>{Math.ceil(post.readingTime)} min read</span></>}
  </div>;
}

export function ArticleList({posts}: {posts: readonly Post[]}): React.JSX.Element {
  return <div className="article-list">
    {posts.map(post => <article className="article-row" key={post.permalink}>
      <PostMeta post={post} />
      <div>
        <h2><Link to={post.permalink}>{post.title}</Link></h2>
        <p>{post.description}</p>
        <div className="article-tags">{post.tags.slice(0, 3).map(tag =>
          <Link to={tag.permalink} key={tag.permalink}>{tag.label}</Link>)}</div>
      </div>
      <Link className="article-arrow" to={post.permalink} aria-label={`Read ${post.title}`}><span aria-hidden="true">↗</span></Link>
    </article>)}
  </div>;
}
