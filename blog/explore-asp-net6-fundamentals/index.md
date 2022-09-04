---
title: Explore ASP NET 6 Fundamentals 
description: Exploring fundamentals of ASP.NET 6 
slug: explore-asp-net6-fundamentals 
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
<meta name="twitter:title" content="Explore ASP NET 6 Fundamentals" />
<meta name="twitter:description" content="Exploring fundamentals of ASP.NET 6" />
</head>

<img src={require('./startandfinish.jpg').default} alt="Start and Finish Image"/>

Image by [awcreativeut](https://unsplash.com/@awcreativeut)

The word Host will repeatedly appear in the post so let's briefly understand what it means?

## What is Host?
The Web Host is a builder which offers rich built-in services such as Dependency Injection, Configuration, Logging, Host Services and others.
Think of it as Airbnb Host who keeps the property ready to serve when the guests arrive. The property offers a different set of services and allows you to bring your own services.
The .NET 6 offers a WebHost Builder `var builder = WebApplication.CreateBuilder(args)` which configures the defaults for you. One notable default is that Configuration are read and are available. 

<!--truncate-->



~~~csharp title="Basic Host Example : Create, configure, build, and run the Host"
var host = Host.CreateDefaultBuilder(args) //WebHost.CreateDefaultBuilder(args)  
    .ConfigureLogging( (context, builder) => builder.AddConsole())
    .Build(); // Build the host, as per configurations.

await host.RunAsync();
~~~
## Environments
## Configuration and Options
## Configure Logging and Exception Handling 
### Using Serilog
### Override Microsoft Logs Level
### Startup Exception Handling 
### Unhandled Exceptions Logs
### Mask Sensitive Data and PII - Personal Identifiable Information in Logs  
## Configure EFCore Database Options
## Configure Redis
## Authorization Requirements and Handlers
## MVC Action Filters
## Dependency Injection
## Middleware
## Routing
## Performance Monitoring
## API Conventions 
## Health Checks
### OpsGenie Integration
## Vault Configuration
## Security Headers

## Feedback
I would love to hear your feedback, feel free to share it on [Twitter](https://twitter.com/madnan_rafiq). 

