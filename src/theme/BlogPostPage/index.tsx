import React from 'react';
import OriginalBlogPostPage from '@theme-original/BlogPostPage';
import type {Props} from '@theme/BlogPostPage';
import {BlogPostOfferProvider} from '@site/src/components/PersonalPerformanceOffer';

export default function BlogPostPage(props: Props): React.JSX.Element {
  return <BlogPostOfferProvider><OriginalBlogPostPage {...props} /></BlogPostOfferProvider>;
}
