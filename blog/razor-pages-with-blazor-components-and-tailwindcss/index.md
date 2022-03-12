---
title: Razor Pages with Blazor Components and tailwindcss 
description: SSR using Razor Pages with Blazor Components and tailwindcss in ASP.NET 6 
slug: razor-pages-with-blazor-components-and-tailwindcss 
authors: adnan 
tags: [C#, .NET6, Razor, SSR]
image : ./startandfinish.jpg
keywords: [SSR, ASP.NET6, Razor,tailwindcss]
draft: true
---
<head>

<meta property="og:image:width" content="1200"/>
<meta property="og:image:height" content="670"/>  
<meta name="twitter:creator" content="@madnan_rafiq" />
<meta name="twitter:title" content="Razor Pages with Blazor Components and tailwindcss" />
<meta name="twitter:description" content="SSR using Razor Pages with Blazor Components and tailwindcss in ASP.NET 6" />
</head>
<figure>
<img src={require('./startandfinish.jpg').default} alt="Start and Finish Image"/>
<figcaption >Image by [awcreativeut](https://unsplash.com/@awcreativeut)</figcaption>
</figure>




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

## Configuration and Options
## Environments
## Dependency Injection
## Middleware
## Logging
## Routing



## Feedback
I would love to hear your feedback, feel free to share it on [Twitter](https://twitter.com/madnan_rafiq). 

