---
title: Validate Options<T> on Startup in Hosted Services in .NET8 
description: Validate Options<T> on Startup in stand alone hosted Services in .NET8 and hosted services in ASP.NET8
slug: validation-options-on-startup-in-hosted-services-in-net8 
authors: adnan 
tags: [C#, .NET8, ASP.NET8,HostedServices]
image : ./validationonstartup.jpeg
keywords: [Fundamentals, ASP.NET8,OptionsPattern,Configuration,ValidateOptionsOnStartup]
---
<head>

<meta property="og:image:width" content="1200"/>
<meta property="og:image:height" content="500"/>  
<meta name="twitter:creator" content="@madnan_rafiq" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="Validate Options<T> on Startup in Hosted Services in .NET8" />
<meta name="twitter:description" content="Validate Options<T> on Startup in stand alone hosted Services in .NET8 and hosted services in ASP.NET8" />
</head>

<img src={require('./validationonstartup.jpeg').default} alt="Validate Options on Startup"/>


# Validate `Options<T>` on Startup

The .NET 8 Host Builder allows you
to bind configuration with C# objects by using `AddOptions<T>` and binding to the configuration.

It provides you an opportunity to validate the configuration values when the host (WebApplication or Hosted Server) 
is starting by using `ValidateOnStart`.

But there are two interesting aspects of it, which I will explain in this post. 

<!--truncate-->


## Validate Complex Types On Startup

## Named Options

## Feedback
I would love to hear your feedback, feel free to share it on [Twitter](https://twitter.com/madnan_rafiq). 

