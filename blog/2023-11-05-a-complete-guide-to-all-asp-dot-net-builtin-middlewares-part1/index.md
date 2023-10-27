---
title: A Complete Guide to all ASP.NET Builtin Middlewares - Part 1
description: A Complete Guide to all ASP.NET Builtin Middlewares. How to use them and what are the best practices.
slug: a-complete-guide-to-all-asp-dot-net-builtin-middlewares-part1
authors: adnan 
tags: [C#,CSharp,ASP.NET,Middlewares]
image : ./middlewares.png
keywords: [ASP.NET,ASP.NET Core,Middlewares,Routing,CORS,StaticFiles,Authentication,Authorization,Session,ResponseCaching,ResponseCompression,RequestLocalization,EndpointRouting,HealthChecks,DeveloperExceptionPage,ExceptionHandler,StatusCodePages,StatusCodePagesWithReExec]
draft: true
---
<head>
<meta property="og:image:width" content="1200"/>
<meta property="og:image:height" content="500"/>  
<meta name="twitter:creator" content="@madnan_rafiq" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="A Complete Guide to all ASP.NET Builtin Middlewares - Part 1" />
<meta name="twitter:description" content="A Complete Guide to all ASP.NET Builtin Middlewares. How to use them and what are the best practices? " />
</head>

<img src={require('./middlewares.png').default} alt="Title Image of the blog" border="1"/>

# A Complete Guide to all ASP.NET Builtin Middlewares

You will learn about all the builtin middlewares in ASP.NET Core. 
How to use them and what are the best practices?

<!--truncate-->

## How many Middlewares are in ASP.NET 8?

There are 16 builtin middlewares in ASP.NET 8 to build a REST API.

- HostingFiltering
- DeveloperExceptionPage
- ExceptionHandler
- RequestDecompression
- Routing
- CORS
- StaticFiles
- RateLimiting
- Authentication
- Authorization
- Session
- ResponseCaching
- ResponseCompression
- RequestLocalization
- EndpointRouting
- HealthChecks
- StatusCodePages
- StatusCodePagesWithReExecute
- ServerTiming
- ForwardedHeaders
- Hsts
- HttpsRedirection

## Host Filtering Middleware

The Host Filtering Middleware is used to filter the request based on the host header value. 
By default, all the hosts are allowed.
But you can add the allowed hosts in the `appsettings.json` file.
If you remove the `AllowedHosts` from the `appsettings.json` file, then it will still allow all the hosts.

```csharp Title="appsettings.json"
{
  "AllowedHosts": "*"
}
```
```csharp Title="Using Middleware"
var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();
//It Uses appsettings.json file to read the allowed host names. By default is is * which means all hosts are allowed.
app.UseHostFiltering(); 
app.MapGet("/", () => "Hello World!");
app.Run();
```
But you can add the allowed hosts in the `appsettings.json` file.
```csharp Title="appsettings.json"
{
  "AllowedHosts": "localhost,localhost:5000,localhost:5001,*.example.com,139.343.3434.3434"
}
```

There are two other properties of the `HostFilteringOptions` class
which allows you set whether to allow the requests with empty host header or not.
And the other property is to include fault details.


## Feedback
I would love to hear your feedback, feel free to share it on [Twitter](https://twitter.com/madnan_rafiq). 

