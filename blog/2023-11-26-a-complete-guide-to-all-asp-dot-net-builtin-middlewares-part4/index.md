---
title: A Complete Guide to all ASP.NET Builtin Middlewares - Part 3
description: A series to explore all the builtin middlewares in ASP.NET 8. This post covers Developer Exception,  and Status Code Pages Middleware, Exception Middleware and Exception Handlers.
slug: a-complete-guide-to-all-asp-dot-net-builtin-middlewares-part3
authors: adnan 
tags: [C#,CSharp,ASP.NET,Middlewares]
image : ./middlewares.png
keywords: [ASP.NET,ASP.NET Core,Middlewares,DeveloperExceptionMiddleware,ExceptionHandlerMiddleware,WelcomePageMiddleware,InnerWorkingsOfExceptionMiddleware,HowToUseExceptionMiddleware,ExceptionHandlers,ExceptionHandling,StatusCodePages,ProblemDetailsWithStatusCodePages]
---
<head>
<meta property="og:image:width" content="1200"/>
<meta property="og:image:height" content="500"/>  
<meta name="twitter:creator" content="@madnan_rafiq" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="A Complete Guide to all ASP.NET Builtin Middlewares - Part 3" />
<meta name="twitter:description" content="A series to explore all the builtin middlewares in ASP.NET 8. This post covers Developer Exception, Exception Middleware and Exception Handlers and Status Code Pages Middleware. " />
</head>

Middleware is a function in then ASP.NET 8,
when many functions are invoked one after the other like a chain;
it becomes a middleware pipeline.
The middleware pipeline is responsible for handling the incoming HTTP request and outgoing HTTP response.

For in depth understanding of the middleware
you can read my blog post [here](https://adnanrafiq.com/blog/develop-intuitive-understanding-of-middleware-in-asp-net8/).

This is a series of blog posts in which I will cover all the builtin middlewares in ASP.NET 8.

<!--truncate-->

## Overview

There are 16 builtin middlewares in ASP.NET 8 to build a REST API. This post will cover the following.

- [HSTS Middleware](#hsts-middleware)
- [HTTPS Redirection Middleware](#https-redirection-middleware)


You can read about Host Filtering and Header Propagation middlewares in the [Part 1](https://adnanrafiq.com/blog/a-complete-guide-to-all-asp-dot-net-builtin-middlewares-part1/).
You can read about the Forwarded Header, Http Logging, W3C Logging middlewares in the [Part 2](https://adnanrafiq.com/blog/a-complete-guide-to-all-asp-dot-net-builtin-middlewares-part2/).
You can read about the Developer Exception, Exception Middleware and Exception Handlers and Status Code Pages middlewares in the [Part 3](https://adnanrafiq.com/blog/a-complete-guide-to-all-asp-dot-net-builtin-middlewares-part3/).

## HSTS Middleware

### Purpose
Add an HTTP Header (Strict Transport Security) to the response to instruct the browser to only use HTTPS for all future requests.
So that the user can be protected against protocol downgrade attacks (HTTPS -> HTTP) and cookie hijacking
(Intercept, read sensitive cookies, and use it to gain access).

:::tip
The browser will always send the requests over HTTPS, even if the user types HTTP in the address bar,
which is an awesome feature to protect non-technical users.
Always use this as the best practice.
:::

**You must visit the website at least once over HTTPS to get the HSTS header.**

Configurable options are as follows.
- MaxAge — Time Span for browser to only use HTTPS for all future requests. Default is 30 days.
- IncludeSubDomains — If true, the browser will only use HTTPS for all subdomains.
- Preload — Start Using HTTPS on the very first visit. Not supported by all browsers.
- ExcludeHosts — List of hosts to exclude from HSTS such as localhost — Intended for development purposes.

### How to use it?

```csharp title="How to configure and Use HSTS Middleware"
var builder = WebApplication.CreateBuilder(args);

builder.Services.AddHsts(options =>
{
    options.MaxAge = TimeSpan.FromDays(365);
    options.IncludeSubDomains = true;
    options.Preload = true;
    options.ExcludedHosts.Add("localhost");
});

var app = builder.Build();
app.UseHsts();

app.UseWelcomePage();

app.Run();

```
Run the application and navigate to https://localhost:5000 and inspect the response headers.
You will see the following header in the response.

```text title="Response Headers"
strict-transport-security: max-age=31536000; includeSubDomains; preload
```


## HTTPS Redirection Middleware

### Purpose

### How to use it?


## Feedback
I would love to hear your feedback, feel free to share it on [Twitter](https://twitter.com/madnan_rafiq). 

