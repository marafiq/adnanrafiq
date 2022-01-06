---
title: Thinking through Unlocking TypeScript in a monolithic Application
description: Thinking through Unlocking TypeScript in a monolithic Application
slug: thinking-through-on-how-to-unlocking-typescript-in-a-monolithic-application
authors: adnan
tags: [.NET Framework, Monolithic App, React, AngularJs, JavaScript]
image : ./heroImage.jpg
---
<head>
  <meta name="og:image" content="{require('./heroImage.jpg').default}" />
</head>

<img
src={require('./heroImage.jpg').default}
alt="Image of Hello"
/>

Image by [@brucemars](https://unsplash.com/@brucemars)


## Problem Statement
How to enable TypeScript in a monolith application developed using JQuery, angularjs 1.2.x, bootstrap, Jest, Karma, Jasmine, the latest react, and .NET Framework 4.7.1.
<!--truncate-->
## Context
Considering application is functional and making a good amount of money despite using old tools.
## Goal(s)
The goal is to add TypeScript, and it must not break any functionality. Remember the context, it is making money, and it’s useful. Your users don’t care what technology you have used to build it.

For example, do social media users know the technology of apps?

The answer is a significant majority don’t have a clue, and neither they care.

## Risk Assessment
Let’s start assessing the risks of adding support of TypeScript to angularjs 1.2.x.

1.2.x is important because later versions of it have significant breaking changes. To add TypeScript, we will have to upgrade it. If we do, what will stop working?

It’s hard to tell which features will break. But let’s ask the critical question. Does the application have complete until Test coverage? It is close to 1% coverage. But it does have a range of essential scenarios coverage in the shape of Selenium tests.

Keeping the above answers in mind, It’s easy to conclude that It’s not worth upgrading angularjs, especially when end-users are not getting any value.

The following key question is, how hard is it to add features and fix bugs?

The answer to this is ”quite hard.”

Does it impact your speed of shipping? Yes, but it’s manageable when you compare it with competitors. You have to stay pragmatic.

What to do then, the counterargument is if you keep using old technology, soon, it will be hard to find developers to work on it. It’s a fair concern.

The solution to this complex problem is migrating to better technology stack progressively. You sit with the team and agree on developing any newer features in React. Any enhancements & bugs will be developed in React only if they justify the value to the customers quickly; otherwise, keep using angularjs.

## How to approach the implementation?
You can unlock it by writing an integration wrapper around angularjs to open React application modules & vice versa. But keep the communication from React to angular js limited. It will reduce complexity.

This concept is also known as Strangler Pattern. In terms of enabling TypeScript for angularjs seems like no go.

But what about rewriting the whole application, you ask. Sure, if you have enough money to hire two teams, go ahead.

## How to add TypeScript to existing React modules?
Now, what about react modules? Do we don’t want TypeScript there as well? Of course, we do.

Since we are using the latest react version. It should be easy because we don’t risk breaking functionality. Wait, which tools you are using to bundle React Modules as small apps. We use WebPack 3.x and babel, which are pretty old versions. So why not upgrade those to the latest as well, along with using the newest TypeScript version.

The easiest route is to copy all dependencies in a new project and run the following commands in your terminal. I find [this](https://nodejs.dev/learn/update-all-the-nodejs-dependencies-to-their-latest-version) documentation very useful.



```bash
npm install -g npm-check-updates
ncu -u
npm update
```

Once dependencies are updated, bring a unique sample component of React to the new App one by one, and try bundling using npm scripts commands. Repeat the process until you are ready to use the old App. I find the [scripts](https://github.com/facebook/create-react-app/tree/main/packages/react-scripts) available via [Create React App (create-react-app)](https://create-react-app.dev/) helpful.

## Why small React Module Apps?

I encourage you to divide your one big React App into smaller App Modules by user role and feature. The Single Responsibility Principle (SRP) keeps things together that change together. WebPack allows you to specify multiple entry points & outputs. You can find details about how to configure it [here](https://webpack.js.org/concepts/#entry).

I explore Micro Apps, which uses the WebPack Module Federation feature to share functionality among different modules. I experimented with [WebPack Module Federation](https://webpack.js.org/concepts/module-federation/), [Single-Spa framework](https://single-spa.js.org/) Yarn workspaces, and Lerna packages, but I find it complex in our context as tech is about making trade-offs among multiple options.

I might publish 2nd blog post on this topic to think through the trade-offs of using Micro Apps. But the process of reaching a decision involves many constraints, as discussed above in detail.

I hope you have enjoyed the post. Would you mind leaving me feedback on [Twitter](https://twitter.com/madnan_rafiq)?
