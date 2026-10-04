import React from 'react';
import type {Props} from '@theme/BlogPostItems';
import {ArticleList} from '@site/src/components/Editorial';

export default function BlogPostItems({items}: Props): React.JSX.Element {
  return <ArticleList posts={items.map(({content}) => content.metadata)} />;
}
