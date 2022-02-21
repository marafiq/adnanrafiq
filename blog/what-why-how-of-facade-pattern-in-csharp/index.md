---
title: What, Why and How of Facade Pattern in C#
description: What is Facade Pattern? Why or what problem it solves? How to implement it in C#.
slug: what-why-how-of-facade-pattern-in-csharp 
authors: adnan 
tags: [C#, .NET6, ASP.NET6]
image : ./startandfinish.jpg
keywords: [Fundamentals, ASP.NET6]
draft: true
---
<head>

<meta property="og:image:width" content="1200"/>
<meta property="og:image:height" content="670"/>  
<meta name="twitter:creator" content="@madnan_rafiq" />
<meta name="twitter:title" content="What, Why and How of Facade Pattern in C#" />
<meta name="twitter:description" content="What is Facade Pattern? Why or what problem it solves? How to implement it in C#." />
</head>

<img src={require('./startandfinish.jpg').default} alt="Start and Finish Image"/>

Image by [awcreativeut](https://unsplash.com/@awcreativeut)

The word Host will repeatedly appear in the post so let's briefly understand what it means?

## What is Host?
The Host is a container which offers rich built-in services such as Dependency Injection, Configuration, Logging, Host Services and others. The NET 6 offers Generic DefaultHost which can be configured to handle the activities as per your use case. Two major variations of the Host are:
- Console Host - CLI based applications.
- Web Host - Web API & Applications.

Think of it as Airbnb Host who keeps the property ready to serve when the guests arrive.
The property offers a different set of services and allows you to bring your own services. The lifetime of such services depends upon the contract, which the Host controls.

<!--truncate-->


~~~csharp title="Basic Host Example : Create, configure, build, and run the Host"
var host = Host.CreateDefaultBuilder(args) //WebHost.CreateDefaultBuilder(args)  
    .ConfigureLogging( (context, builder) => builder.AddConsole())
    .Build(); // Build the host, as per configurations.

await host.RunAsync();
~~~



## Feedback
I would love to hear your feedback, feel free to share it on [Twitter](https://twitter.com/madnan_rafiq). 

