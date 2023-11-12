---
title: Part 3 of the series on the ASP.NET Middlewares
description: A series to explore all the builtin middlewares in ASP.NET 8. This post covers Developer Exception, Exception Middleware and Exception Handlers.
slug: a-complete-guide-to-all-asp-dot-net-builtin-middlewares-part3
authors: adnan 
tags: [C#,CSharp,ASP.NET,Middlewares]
image : ./middlewares.png
keywords: [ASP.NET,ASP.NET Core,Middlewares,HostFiltering,HeaderPropagation,ForwardedHeaders,Spoofing,AllowedHosts,CIDR,Logging,HTTPLogging,PII,RedactPII,Interceptor,CombineLogs,LogLevel,HttpLoggingMiddleware,HttpLoggingInterceptor,W3CLoggingMiddleware,W3CLoggerOptions]
---
<head>
<meta property="og:image:width" content="1200"/>
<meta property="og:image:height" content="500"/>  
<meta name="twitter:creator" content="@madnan_rafiq" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="Forwarded Headers, HTTP Logging and W3C Logging Middlewares - Part 2 of the series on the ASP.NET Middlewares" />
<meta name="twitter:description" content="A series to explore all the builtin middlewares in ASP.NET 8. This post covers Forwarded Headers, HTTP Logging, and W3C Logging Middlewares. " />
</head>

<img src={require('./middlewares.png').default} alt="Title Image of the blog" border="1"/>

# A Complete Guide to all ASP.NET Builtin Middlewares

Middleware is a function in then ASP.NET 8,
when many functions are invoked one after the other like a chain;
it becomes a middleware pipeline.
The middleware pipeline is responsible for handling the incoming HTTP request and outgoing HTTP response.

For in depth understanding of the middleware
you can read my blog post [here](https://adnanrafiq.com/blog/develop-intuitive-understanding-of-middleware-in-asp-net8/).

This is a series of blog posts in which I will cover all the builtin middlewares in ASP.NET 8.

<!--truncate-->

## How many Middlewares are in ASP.NET 8?

There are 16 builtin middlewares in ASP.NET 8 to build a REST API. This post will cover three of them.

- [Welcome Page Middleware](#Welcome-Page-Middleware)


You can read about Host Filtering and Header Propagation middlewares in the [Part 1](https://adnanrafiq.com/blog/a-complete-guide-to-all-asp-dot-net-builtin-middlewares-part1/).

## Welcome Page Middleware
I am starting the series with the Welcome Middleware. 
### Purpose
To display a welcome message on the route of your choosing. 
It displays a page with a welcome message but the page is not customizable.

Great, but why do you need it?

You do not need it, really. It's for feels. 

I included it because it is an example of terminal middleware.

> Terminal middleware does not call the next delegate, it short-circuits the middleware pipeline.

### How to use it?

```csharp title="Welcome Middleware"
var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();
app.UseWelcomePage("/welcome");
app.UseWelcomePage(new WelcomePageOptions
{
    Path = "/"
});
app.Run();
```
You can read the [Source Code](https://github.com/dotnet/aspnetcore/blob/main/src/Middleware/Diagnostics/src/WelcomePage/WelcomePageMiddleware.cs) of the middleware.

## Developer Exception Middleware
Meant for developers only and only.
### Purpose
To improve the developer experience (DX).
It displays a detailed error page with stack trace so that you won't have to read the logs or attach a debugger.
As all nice things in life come with a cost, so does this middleware.
If you enable an application environment other than **Development**, 
it will leak sensitive information and become a security risk.
### How to use it?
The development lifecycle of any application mostly passes through three environments.
1. Development
2. Staging
3. Production

To address it, .NET comes with extension methods on `IWebHostEnvironemnt` to check the environment,
it can be accessed via `app.Environment.IsDevelopment()` or `builder.Environment.IsDevelopment()`.

You can set the application environment using the `ASPNETCORE_ENVIRONMENT` environment variable.

```csharp title="Use Developer Exception Page Middleware in Development Environment"
var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();
if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();
}

app.UseWelcomePage(new WelcomePageOptions
{
    Path = "welcome"
});

app.Run();

```

### Best Practices
- Do not log the request and response body in production because:
  - It degrades performance.
  - It will leak PII (Personal Identifiable Information) if the request or response payload contains it. It is a violation of GDPR.
- Carefully choose fields to log, do not log all fields in production just because you can.
- Redact sensitive information but not limited to PII
  - Redact the Authorization header.
  - Redact the authentication cookies.

## Exception Handler Middleware


### Purpose

### How to use it?


### Best Practices
- If you are inclined to log all fields, be sure to check with your legal team to log IP Addresses.
- Use one logging middleware either HTTP Logging or W3C Logging unless you have an exceptional reason to use both.

### Challenge to read the code
The .NET team has done amazing work to make the code easy to read. 
You can read the source code of the [W3C Logging Middleware](https://github.com/dotnet/aspnetcore/blob/main/src/Middleware/HttpLogging/src/W3CLoggingMiddleware.cs).

## HTTP Logging vs W3C Logging Performance
I have not done any performance testing, but 
my gut says after reading the code that W3C Logging Middleware will be faster than HTTP Logging Middleware.

Do not trust my gut as it should be in all performance investigation.
If there is a lot of interest in this topic, I may try to run local benchmarks and share the results.

## Feedback
I would love to hear your feedback, feel free to share it on [Twitter](https://twitter.com/madnan_rafiq). 

