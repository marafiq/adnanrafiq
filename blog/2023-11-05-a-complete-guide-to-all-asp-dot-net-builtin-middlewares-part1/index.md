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

- [HostingFiltering](#host-filtering-middleware)
- [HeaderPropagation](#header-propagation-middleware)
- DeveloperExceptionPage
- ExceptionHandler
- UseStatusCodePages
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

### Purpose
Allow requests only from the allowed hosts using the host header of HTTP Request.

### Defaults
- AllowedHosts: *
- IncludeFailureDetails: true
- AllowEmptyHosts: true — HTTP 1.0 requests don't have a host header.

### Customization
- AllowedHosts can be a comma-separated list of host names or IP addresses.
- AllowedHosts can be a wildcard pattern like *.google.com.

### How to use it?

Default Minimal API template adds the following JSON property in the `appsettings.json` file.

```csharp Title="appsettings.json"
{
  "AllowedHosts": "*"
}
```

```csharp Title="Using HostFiltering Middleware"
var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();
//It Uses appsettings.json file to read the allowed host names. By default is is * which means all hosts are allowed.
app.UseHostFiltering(); 
app.MapGet("/", () => "Hello World!");
app.Run();
```
You can customize the JSON property in the `appsettings.json` file.
```csharp Title="appsettings.json"
{
  "AllowedHosts": "localhost,localhost:5000,localhost:5001,*.example.com,139.343.3434.3434"
}
```
```csharp Title="Add Options to HostFiltering Middleware"
services.AddOptions<HostFilteringOptions>()
.BindConfiguration(builder.Configuration.GetRequiredSection("HostFilteringOptions").Path);
/////////////// OR ////////////////
services.AddHostFiltering(options =>
{
    options.AllowedHosts = new List<string>() { "*" };
    options.AllowEmptyHosts = true;
    options.IncludeFailureMessage = true;
});

```
### Best Practices
- Should be added after the ExceptionHandler middleware.
- It should not be used as a replacement of security features. Attacker can easily manipulate the host header.
  - Example: If you ask your security to let only in person with the name of adnan. Anyone pretending to be adnan will be allowed.
- Read the source code in .NET repository [here](https://github.com/dotnet/aspnetcore/blob/main/src/Middleware/HostFiltering/src/HostFilteringMiddleware.cs).

## Header Propagation Middleware
### Purpose
It propagates the headers from the incoming request to the outgoing request.

Example: You have a service named Motto running behind a load balancer.
TLS termination is done at the load balancer.
The load balancer adds the header `X-Forwarded-Proto` to the request 
so the service named Motto can know if the request is coming from HTTP or HTTPS.
The service named Motto calls another service named `Greeting` using HTTP Client, 
you would like to forward the `X-Forwarded-Proto` header to the outgoing request.
That is Propagation of Headers.
:::info
Must install the package `Microsoft.AspNetCore.HeaderPropagation` from NuGet.
:::
### Defaults
- Allows to configure the headers to be propagated to the outgoing HTTP requests using `HttpClient`.
- Allows configuring the headers to be propagated with value provider function which does have access to `HTTPContext`.
- Allows changing the header name from incoming request to outgoing request.

### Customization
- You have to explicitly configure the headers to be propagated. No default.
### How to use it?
```csharp Title="Configure Header Propagation"
var builder = WebApplication.CreateBuilder(args);
builder.Services.AddHeaderPropagation(options =>
{
    //Add the header to be propagated.
    options.Headers.Add("X-Custom-Header");
    
    //Add the header to be propagated with value provider function.
    options.Headers.Add("CorelationId", context =>
    {
        var request = context.Request;
        var header = request.Headers["CorelationId"].FirstOrDefault();
        if (string.IsNullOrEmpty(header))
        {
            header = Guid.NewGuid().ToString();
        }
        return header;
    });
    options.Headers.Add("CorelationId", "X-CorelationId");
});
var app = builder.Build();
app.UseHeaderPropagation();
app.MapGet("/motto", async (HttpContext context, HttpClient client) =>
{
    //Now the outgoing request will have the header X-CorelationId and X-Custom-Header.
    // No need to add the header manually.
    var response = await client.GetAsync("http://localhost:5000/greeting");
    var content = await response.Content.ReadAsStringAsync();
    await context.Response.WriteAsync(content);
});
app.MapGet("/greeting", async (HttpContext context) =>
{
    //Read the header from the incoming request.
    var header = context.Request.Headers["X-CorelationId"].FirstOrDefault();
    await context.Response.WriteAsync($"Hello from Greeting Service. You are using {header}");
});
app.Run();
```
### Best Practices
- Should be added after the ExceptionHandler middleware.
- Every server receiving the request has a limit on the number of headers it can receive. It also has limit on the size of the header. Kestrel has a limit of 100 headers and 32KB size. You should take this into consideration when propagating headers.
- Keep the number of headers and size to the minimum. Minimum means only add if it is required. Do not violate the [YAGNI](https://en.wikipedia.org/wiki/You_aren%27t_gonna_need_it) principle.




## Feedback
I would love to hear your feedback, feel free to share it on [Twitter](https://twitter.com/madnan_rafiq). 

