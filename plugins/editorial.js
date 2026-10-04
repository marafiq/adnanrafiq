// Share resolved Docusaurus metadata; authored posts remain the source of truth.
module.exports = function editorial() {
  return {
    name: 'editorial',
    allContentLoaded({allContent, actions}) {
      const blog = allContent['docusaurus-plugin-content-blog'].default;
      const posts = blog.blogPosts
        .filter(({metadata}) => !metadata.unlisted)
        .map(({metadata}) => ({
          title: metadata.title,
          description: metadata.description,
          permalink: metadata.permalink,
          date: metadata.date,
          readingTime: metadata.readingTime,
          tags: metadata.tags,
        }));
      actions.setGlobalData({posts});
    },
  };
};
