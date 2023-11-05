---
title: A Complete Guide to all ASP.NET Builtin Middlewares - Part 2
description: A Complete Guide to all ASP.NET Builtin Middlewares. How to use them and what are the best practices.
slug: a-complete-guide-to-all-asp-dot-net-builtin-middlewares-part2
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
<meta name="twitter:title" content="A Complete Guide to all ASP.NET Builtin Middlewares - Part 2" />
<meta name="twitter:description" content="A Complete Guide to all ASP.NET Builtin Middlewares. How to use them and what are the best practices? " />
</head>

<img src={require('./middlewares.png').default} alt="Title Image of the blog" border="1"/>

# A Complete Guide to all ASP.NET Builtin Middlewares

You will learn about all the builtin middlewares in ASP.NET Core. 
How to use them and what are the best practices?

<!--truncate-->

## How many Middlewares are in ASP.NET 8?

There are 16 builtin middlewares in ASP.NET 8 to build a REST API. This post will cover two of them.

- [HostingFiltering](#host-filtering-middleware)
- [HeaderPropagation](#header-propagation-middleware)

## Forwarded Headers Middleware
Forwards the cross-cutting concerns headers like `X-Forwarded-For`,
`X-Forwarded-Host`, `X-Forwarded-Proto` to the services behind the proxy. 

Example: You have a service named Motto running behind a load balancer.
TLS termination is done at the load balancer.
The load balancer adds the header `X-Forwarded-Proto` to the request
so the service named Motto can know if the request is coming from HTTP or HTTPS.
The service named Motto calls another service named `Greeting` using HTTP Client,
you would like to forward the `X-Forwarded-Proto` header to the outgoing request.

- `X-Forwarded-For` - The IP address of the client.
- `X-Forwarded-Host` - The original host requested by the client in the Host HTTP request header.
- `X-Forwarded-Proto` - The original scheme (HTTP or HTTPS) of the request.
- `X-Forwarded-Prefix` - The original path of the request.




## Feedback
I would love to hear your feedback, feel free to share it on [Twitter](https://twitter.com/madnan_rafiq). 

