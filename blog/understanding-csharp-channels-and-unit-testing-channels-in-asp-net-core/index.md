---
title: Understanding C# Channels and testing Channels in ASP.NET Core Application
description: A channel is a shared path where information flows from one point to another. The producer(s) and consumer(s) of information are decoupled from each other.
slug: how-to-test-cors-in-asp-net-6-api 
authors: adnan 
tags: [C#, .NET6, ASP.NET6]
image : ./startandfinish.jpg
keywords: [Channels,ASP.NET6,Testing,BackgroundProcessng,Producer,Consumer]
---
<head>

<meta property="og:image:width" content="1200"/>
<meta property="og:image:height" content="670"/>  
<meta name="twitter:creator" content="@madnan_rafiq" />
<meta name="twitter:title" content="Understanding C# Channels and testing Channels in ASP.NET Core Application" />
<meta name="twitter:description" content="A channel is a shared path where information flows from one point to another. The producer(s) and consumer(s) of information are decoupled from each other." />
</head>

<img src={require('./startandfinish.jpg').default} alt="Start and Finish Image"/>

Image by [awcreativeut](https://unsplash.com/@awcreativeut)

A blog post is in progress.

A Channel by [merriam-webster](https://www.merriam-webster.com/dictionary/channel) refers to among other meaings

> the bed where a natural stream of water runs

I will start this post by adopting the water channel analogy to explore how it relates with C# `System.Threading.Channels`.

## Analogy

Channel is the path where information flows from one point to another, like a water channel. If you observe the water channel, it is made up of multiple things. The first thing you will observe is water; second, water is produced by source(s), you can think of glaciers, Rain, etc., and thirdly the water ends up at the destination(s), you can think of the Sea, River, etc.

In .NET terminology, the source(s) are referred to as Producer(s), and the destination(s) are referred to as Consumer(s). And the water is referred to as Message(s) or the .NET object. 

For a moment, think about the water channel that how it runs. You will observe that one or multiple consumers and producers are concurrently at work in the water channel meaning produced by rains, melting of galciers, and consumed by many in different forms.

## Edge Case of flooding and Channel Types

The flood can happen in the water channel for many reasons, such as:

- The glaciers are melting at a high pace.
- The river is at capacity.

In .NET, you can map the analogies to Backpressure, which means the consumer is not consuming the messages at the same pace that the producer(s) are producing.   

That brings us to mainly two types of channels in the .NET

1. Bounded Channel
The Bounded Channel has a defined capacity based on your application needs. It allows you to configure the behavior of what to do in case flooding happens.
2. UnBounded Channel
The UnBounded Channel has no defined capacity, but the limitation of memory availability will apply. 

Both channels allow you to define if there will be one or many producers and consumers. 

## The case of Decoupling

The sea (consumer) does not care about how the water is produced. It just consumes it metaphorically. Neither the sea knows about the production source, the glacier metaphorically.

Similarly, the producer and consumer in the .NET channel do not know about each other yet operate on the shared resource, the messages. 

## Many canals of the River and .NET Concurrency

Without going into the chemistry of water molecules, the producers put water into the river (Channel), a distinct function performed concurrently. Similarly, the river is divided into canals (consumers) that consume the water concurrently. 

The important thing to notice here, the same water drop is not shared among any involved parties; this complexity is hidden behind the .NET Channel abstraction.

## Technical Details

Channel is made up of Channel Reader and Channel Writer. Channel class acts as a Facade to synchronize the access to the shared data structure. 

Channel class offers two factory methods to create the typed channel. You can configure the channel behavior using options classes. 

## Background processing

A web application API is a multi-threaded process with which many users interact concurrently. If an API logic involves an operation to perform a long-running or directly unrelated task, that will not impact the response returned to the user. You would like to offload or perform the task in the background. This leads us to find a mechanism that enables offloading. Channel is the answer.

If you have worked with .NET Framework, such background tasks were usually queued using `HostingEnvironment.QueueBackgroundItem` method or queue on the Thread Pool. 

You can consider the below scenarios if you have yet to work with framework applications.

There are some commonly known requirements in traditional applications, such as: 

- Send out an email.
- Send an event to the analytics service.
- Sync the data to a third-party service.

## Feedback
I would love to hear your feedback, feel free to share it on [Twitter](https://twitter.com/madnan_rafiq). 

