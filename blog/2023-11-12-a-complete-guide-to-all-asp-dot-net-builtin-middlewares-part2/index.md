---
title: Forwarded Headers, HTTP Logging and W3C Logging Middlewares - Part 2 of the series on the ASP.NET Middlewares
description: A series to explore all the builtin middlewares in ASP.NET 8. This post covers Forwarded Headers, HTTP Logging, and W3C Logging Middlewares.
slug: a-complete-guide-to-all-asp-dot-net-builtin-middlewares-part2
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

- [Forwarded Headers Middleware](#forwarded-headers-middleware)
- [HTTP Logging Middleware](#http-logging-middleware)
- [W3C Logging Middleware](#w3c-logging-middleware)

You can read about Host Filtering and Header Propagation middlewares in the [Part 1](https://adnanrafiq.com/blog/a-complete-guide-to-all-asp-dot-net-builtin-middlewares-part1/).

## Forwarded Headers Middleware

### Purpose
Accept the Forwarded http request headers from the known proxy or load balancer and set the `HttpContext`.

The headers are:
- `X-Forwarded-For` - The IP address of the client.
- `X-Forwarded-Host` - The original host requested by the client in the Host HTTP request header.
- `X-Forwarded-Proto` - The original scheme (HTTP or HTTPS) of the request.
- `X-Forwarded-Prefix` - The original path of the request.

<img src={require('./hostfilterandforwardedmiddleware.png').default} alt="Show the flow of HTTP request from public internet to nginx proxy to .NET Application and the use of Host Filtering and Forwarded Headers Middlewares"
border="1"/>

### Understanding the Problem
Your application DNS resolves to a reverse proxy or load balancer. 
The proxy or load balancer forwards the request to your application.

Now, when your application receives the request, what it will have in the request headers?
- The IP address of the proxy or load balancer.
- The host name of the proxy or load balancer.
- The scheme of the proxy or load balancer.
- The path of the proxy or load balancer.

But you want to know the IP address, host name, scheme, and path of the client who originally made the request.

Two things are required to achieve this:
1. Reverse Proxy or Load Balancer is configured to forward the client's IP address, host name, scheme, and path in the HTTP request headers.
2. Your application is configured to accept/trust the forwarded headers.

**First thing**:Once you configure the reverse proxy to forward the request headers, it will add the headers to the request 
using the prefix `X-Forwarded-{Name}` where {Name} can be `For`, `Host`, `Proto`, and `Path of request`.

**the 2nd thing**, does your application trust the forwarded headers?
Forwarded Headers Middleware has three properties to configure and each plays a role:
1. `ForwardedHeaders` - This property tells the middleware which headers to trust. 
    - `ForwardedHeaders.All` - Trust all the headers.
    - You can also specify the headers individually or any combination of them.
2. `KnownNetworks` - This property tells the middleware which networks are trusted. You can use the CIDR (A block of IP Addresses) notation to specify the network.
   - `KnownProxies` - This property tells the middleware which proxies are trusted. You can use the IP address or host name to specify the proxy.
3. `AllowedHosts` - This property tells the middleware which hosts are trusted. When empty, all hosts are trusted.

What does **Trust** mean?
It means that the middleware will use the forwarded headers to set the properties 
`RemoteIpAddress`, `Host`, `Scheme`, and `PathBase` on the `HttpContext` in your current request.

:::note
The request headers `X-Forward-{name*}` coming from unknown host will not get applied to the `HttpContext`. 
But the HTTP request payload will still have the headers.
:::

It is important to configure the host filtering middleware
to avoid spoofing attacks on your application so that the application can issue a response 400 - Bad Request.
You can read more about it in the [Host Filtering Middleware](https://adnanrafiq.com/blog/a-complete-guide-to-all-asp-dot-net-builtin-middlewares-part1/#host-filtering-middleware) section.

`AllowedHosts` is a **special case**. 
If the request is coming from a host which is not in the allowed list 
and a list is not empty then only the `Host` header of http request will not be modified.
But if you are using to generate the links using `LinkGenerator` then links will be generated
using the `Host` header of the http request which in this case will be the host of the proxy or load balancer.

### How to use it?
Below is the complete code of sample which correctly accepts headers from the proxy running using docker-compose.
<details aria-expanded="true">
<summary>Step by Step example of configuring ForwardedHeaderMiddleware with nginx proxy and .NET</summary>


```yaml title="Step 1: Create a file nginx.conf to configure nginx at the root"
events {
    worker_connections  1024;
}
http {
    server {
        listen 80;
        server_name localhost;
        location / {
            proxy_set_header    X-Forwarded-For $remote_addr;
            proxy_set_header    X-Forwarded-Host $host;
            proxy_set_header    X-Forwarded-Proto $scheme;
            proxy_set_header    X-Forwarded-Prefix /;  
            proxy_pass          http://hostfilteringmiddleware:8080;
        }
    }
}
```
```csharp title="Step 2: Create a .NET8 Application in folder 01_HostFiltering and replace the code in Program.cs"
var builder = WebApplication.CreateBuilder(args);
builder.Services.Configure<ForwardedHeadersOptions>(options =>
{
   //You can also specify the headers individually or any combination of them.
    options.ForwardedHeaders = ForwardedHeaders.All;
    
    options.KnownNetworks.Clear();
    //Supports CIDR notation - Range of IP Addresses
    options.KnownNetworks.Add(new IPNetwork(IPAddress.Parse("::"), 0)); //IPv6
    options.KnownNetworks.Add(new IPNetwork(IPAddress.Parse("0.0.0.0"), 0));//Ipv4

    options.KnownProxies.Clear();
    
    options.KnownProxies.Add(IPAddress.Any);
    options.AllowedHosts.Add("localhost");
});
var app = builder.Build();

//Add the middleware to the pipeline as early as possible.
app.UseForwardedHeaders();

app.MapGet("/", () => "Welcome to Middlewares!");
app.MapGet("/customers", (HttpContext httpContext,LinkGenerator linkGenerator) =>
    {
        var customers = new List<Customer>
        {
            new(1, "John Doe", linkGenerator.GetUriByName(httpContext,"CustomerAddresses", new { customerId = 1 })),
            new(2, "Jane Doe", linkGenerator.GetUriByName(httpContext,"CustomerAddresses", new { customerId = 2 })),
            new(3, "John Smith", linkGenerator.GetUriByName(httpContext,"CustomerAddresses", new { customerId = 3 })),
            new(4, "Jane Smith", linkGenerator.GetUriByName(httpContext,"CustomerAddresses", new { customerId = 4 })),
        };
        return customers;
    })
    .WithName("Customers");
app.MapGet("/customers/{customerId}/addresses", (int customerId) =>
{
    var addresses = new List<Address>
    {
        new(1, "123 Main St", "Seattle", "WA", "98101"),
        new(1, "123 Main St", "Seattle", "WA", "98101"),
        new(3, "123 Main St", "Seattle", "WA", "98101"),
        new(4, "123 Main St", "Seattle", "WA", "98101"),
    };
    return addresses.Where(a => a.Id == customerId);
}).WithName("CustomerAddresses");
app.Run();

record Customer(int Id, string Name, string? AddressUrl);
record Address(int Id, string Street, string City, string State, string ZipCode);
```
```csharp title="Step 3: Create a Dockerfile in the .NET Project to build the .NET Application"
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 8080

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["01-HostFiltering/HostFilteringMiddleware/HostFilteringMiddleware.csproj", "01-HostFiltering/HostFilteringMiddleware/"]
RUN dotnet restore "01-HostFiltering/HostFilteringMiddleware/HostFilteringMiddleware.csproj"
COPY . .
WORKDIR "/src/01-HostFiltering/HostFilteringMiddleware"
RUN dotnet build "HostFilteringMiddleware.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "HostFilteringMiddleware.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "HostFilteringMiddleware.dll"]

```

```yaml title="Step 4: Create the docker-compose.yml put it in the root"
version: '3.4'
services:
  hostfilteringmiddleware:
    image: hostfilteringmiddleware
    build:
      context: .
      dockerfile: 01_HostFiltering/Dockerfile
    ports:
      - "8080:8080"
    networks:
      - mynetwork
    environment:
      - ReverseProxyHostName=nginx

  nginx:
    image: nginx:latest
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
    ports:
      - "80:80"
    networks:
      - mynetwork
networks:
  mynetwork:
    driver: bridge
```
```shell title="Step 5: Run the docker-compose up command"
docker-compose up
```
```shell title="Step 6: Browse the endpoint /customers and notice the links to customer addresses"
curl http://localhost:8080/customers
```
```markdown title="Step 7: Run the docker-compose up command"
1. Delete the line `app.UseForwardedHeaders();`  in .NET application. 
2. Run `docker-compose down`
3. Run `docker-compose up`
4. Run `curl http://localhost:8080/customers`
5. Notice the links to customer addresses are not correct because they use the host header of the proxy.

```

</details>

### What about X-Original-* headers?
The `X-Original-For`, `X-Original-Host`, `X-Original-Proto`, and `X-Original-Prefix` are the headers
added by the forward headers middleware so that you can access the original values of the headers
after it gets applied to the `HttpContext` properties.

### What about when proxy is forwarding headers with different names?
If your proxy is forwarding the headers with different names,
then you can use the `ForwardedHeadersOptions.Forwarded{ForHeaderName}` properties to specify the name of the header 
when configuring `ForwardedHeaderOptions`.

Once you specify the name of the header, the middleware will use that header to set the `HttpContext` properties.

### How to diagnose when forwarded headers are not working?
You should set the logging to `Debug` level for the `Microsoft.AspNetCore` in 
`appsettings.json` and look for the logs from the middleware.
It will generate warning logs when the header criteria is not met.
Some log samples are:
- Unknown proxy: {RemoteIpAndPort}
- UnParsable IP: {IpAndPortText}

But if you cannot figure out and require help,
you can read the code of the middleware [here](https://github.com/dotnet/aspnetcore/blob/main/src/Middleware/HttpOverrides/src/ForwardedHeadersMiddleware.cs)
### What about Require Header Symmetry?
Header values are passed as strings —
for example, you can pass the value of `X-Forwarded-For` as `192.2.5.5, 58.65.65.5`.
But for the `X-Forwarded-Proto` header, you only passed the value as `http`. 
Now the middleware reads the comma seperated values of all the `X-Forwarded-*` headers
and compare the length of all the header values.
If all the host headers have the same number of values, then it will set the `HttpContext` properties otherwise it won't.
And that means it has header symmetry.

### What about the Forward Limit?
The `ForwardLimit` property of the `ForwardedHeadersOptions` is used
to limit the number of entries in the comma-separated list of values for the `X-Forwarded-*` headers.
The values are read from right to left, 
meaning the last value in the comma seperated value list will be used if the limit is 1. 
You can set to null to disable it.

### Best Practices
1. Accept the headers from the known proxies and networks only. It supports CIDR notation, you would be able to specify a range of IP addresses. It is helpful when you have multiple proxy instances.
2. Accept the headers from the known hosts only.
3. Use the Host filtering middleware to avoid spoofing attacks on your application.
4. Discard the `X-Forwarded-*` headers at the public proxy or load balancer.
5. If you are using `Kestrel` as public server then you should not use this middleware. Instead, if you intend to use `Kestrel` as a reverse proxy, then you should use the `YARP` reverse proxy which is written in .NET and allows you to configure the `X-Forwarded-*` headers.

:::note
CIDR notation is used to specify a range of IP addresses, for example `192.168.0.0/16` cover the IP addresses from `192.168.0.0` to `192.168.255.255`.
:::

### A question for you?
Should this middleware be added before or after the Host Filtering middleware? And Why?

Let me know your answer on [Twitter](https://twitter.com/madnan_rafiq).

## HTTP Logging Middleware
Logging gives you superpowers to observe your application in production. 
### Purpose
To log the HTTP request and response properties to get observability (visibility) into your production.
But it gives you powerful customization features such as:
- Customize the HTTP Request and Response fields to log. 
- Add interceptors to redact sensitive information (PII) or enrich (add) the information to the HTTP Request and Response Logging Context to log.
- Customize the HTTP Request and Response fields to log, and change request & response body size to log per endpoint using `.WithHttpLogging`.
- Combine multiple log lines belonging to one HTTP request and response to one log line.
- Provide control over the log level for the HTTP Request and Response by using `Microsoft.AspNetCore.HttpLogging.HttpLoggingMiddleware` in `appsettings.json`.

:::note
PII stands for Personal Identifiable Information.
Anything that can be used to identify a person is PII.
Avoiding logging PII is extremely important,
especially if the person closes the account on your application and request to be forgotten.
:::

### How to use it?
The sample below shows how to use the HTTP Logging Middleware.
It follows the convention
of adding the required services for the middleware to function correctly, and the use the middleware.

```csharp title="Http Loggin Middleware - With Options, Interceptor, and Endpoint Specific Logging"
using Microsoft.AspNetCore.HttpLogging;
using Microsoft.Net.Http.Headers;

var builder = WebApplication.CreateBuilder(args);
//If you would like change the logging middleware options using appsettings.json file.
// And expect the application behavior to change, you can use the below. Since LoggingMiddleware uses 
// IOptionsMonitor to get the current options, it will respond to it.

//builder.Services.Configure<HttpLoggingOptions>(builder.Configuration.GetSection("HttpLogging"));

//Add the required services for the middleware to function correctly.
builder.Services.AddHttpLogging(options =>
{
   //logging fields defaults to the below - shown for demo purpose
    options.LoggingFields =
        HttpLoggingFields.RequestPropertiesAndHeaders | HttpLoggingFields.ResponsePropertiesAndHeaders;
    
    options.CombineLogs = true;
});
builder.Services.AddHttpLoggingInterceptor<RedactKnownPII>();
var app = builder.Build();

//Use the middleware
app.UseHttpLogging();

app.MapGet("/", () => "Hello World!");

//Do not log all fields in production.
app.MapGet("/alllogs", () => "All Logs")
    .WithHttpLogging(HttpLoggingFields.All);

app.MapGet("/logs", () => "Logs")
    .WithHttpLogging(HttpLoggingFields.RequestMethod | HttpLoggingFields.RequestHeaders |
                     HttpLoggingFields.ResponseHeaders);
//Logging all fields, see how email and password is dumped into logs. 
//Not a good idea                    
app.MapPost("/login", (LoginRequest loginRequest, ILogger<LoginRequest> logger) =>
{
    logger.LogInformation("Login request received ");
    return Results.Ok();
}).WithHttpLogging(HttpLoggingFields.All);
app.Run();

record LoginRequest(string EmailAddress, string Password);

// ReSharper disable once InconsistentNaming
public class RedactKnownPII : IHttpLoggingInterceptor
{
    public ValueTask OnRequestAsync(HttpLoggingInterceptorContext logContext)
    {
        RedactPII(logContext);
        return default;
    }

    public ValueTask OnResponseAsync(HttpLoggingInterceptorContext logContext)
    {
        RedactPII(logContext);
        return default;
    }

    // ReSharper disable once InconsistentNaming
    private static void RedactPII(HttpLoggingInterceptorContext logContext)
    {
        logContext.AddParameter(HeaderNames.Authorization, "**********");
    }
}
```
```json title="appsettings.json -  Notice how you can control log level of the HttpLogging Middleware"
{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning",
      "Microsoft.AspNetCore.HttpLogging.HttpLoggingMiddleware": "Information"
    }
  }
}
```

### How to add an interceptor?
Interceptors are used to redact sensitive information (PII) or enrich (add)
the information to the HTTP Request and Response Logging Context to log.
You can implement the `IHttpLoggingInterceptor` interface
and register it as a service using `AddHttpLoggingInterceptor` extension method on `IServiceCollection`.

The interceptor requires implementing two methods:
- `OnRequestAsync` - You can add/remove/modify the HTTP Request Logging Context to log for the HTTP Request.
- `OnResponseAsync` - You can add/remove/modify the HTTP Response Logging Context to log for the HTTP Response.

The `HttpLoggingInterceptorContext` contains the current `HttpContext` and `HttpLoggingFields`.

<details>
<summary>Click to see the sample on how to add interceptor</summary>

```csharp title="How to add interceptor?"
using Microsoft.AspNetCore.HttpLogging;
using Microsoft.Net.Http.Headers;

builder.Services.AddHttpLogging(options =>{});
builder.Services.AddHttpLoggingInterceptor<RedactKnownPII>();

var app = builder.Build();
//Use the middleware
app.UseHttpLogging();

app.MapGet("/", () => "Hello World!");

app.Run();

public class RedactKnownPII : IHttpLoggingInterceptor
{
    public ValueTask OnRequestAsync(HttpLoggingInterceptorContext logContext)
    {
        RedactPII(logContext);
        return default;
    }

    public ValueTask OnResponseAsync(HttpLoggingInterceptorContext logContext)
    {
        RedactPII(logContext);
        return default;
    }

    // ReSharper disable once InconsistentNaming
    private static void RedactPII(HttpLoggingInterceptorContext logContext)
    {
        logContext.AddParameter(HeaderNames.Authorization, "**********");
    }
}
```
</details>

### Best Practices
- Do not log the request and response body in production because:
  - It degrades performance.
  - It will leak PII (Personal Identifiable Information) if the request or response payload contains it. It is a violation of GDPR.
- Carefully choose fields to log, do not log all fields in production just because you can.
- Redact sensitive information but not limited to PII
  - Redact the Authorization header.
  - Redact the authentication cookies.

### A question for you?
In the above sample, the logging options are configured at three different places
(Global before build, Interceptor, and Endpoint).
Which one will take precedence?

Hint: You can copy the code and use break points to find out, or 
you can read the source code of the [HTTP Logging Middleware](https://github.com/dotnet/aspnetcore/blob/main/src/Middleware/HttpLogging/src/HttpLoggingMiddleware.cs)
to find the answer.

## W3C Logging Middleware
Logging gives you powers to observe your application in production. 
W3C logging middleware logs in the [W3C](https://www.w3.org/TR/WD-logfile.html) format.

The reason I used powers instead of superpowers is that it is not as powerful as the HTTP Logging Middleware.
It logs what request is coming in and what response is going out.

### Purpose
To log the HTTP request and response properties to get observability (visibility) into your production.
But it gives you features such as:
- Compact log format and follows the W3C standard.
- Specify the file path to log to along with control over the file size etc and flush duration.
- Customize the fields to log and ability to add additional headers to log.

### How to use it?
The sample below shows how to use the HTTP Logging Middleware.
It follows the convention
of adding the required services for the middleware to function correctly, and the use the middleware.

```csharp title="Http Loggin Middleware - With Options, Interceptor, and Endpoint Specific Logging"

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddW3CLogging(options =>
{
    
    options.AdditionalRequestHeaders.Add("X-Correlation-Id");
});
var app = builder.Build();
app.UseW3CLogging();


app.MapGet("/", () => "Hello World!");

app.Run();
```

### How to use `appsettings.json` to control logging fields?

W3C Logging Middleware uses `IOptionsMonitor`
to get the current options that means you can control the logging fields using `appsettings.json` file.
As soon as you change app settings file, the application will start logging as per new settings without restarting the application.

<details>
<summary>Click to see the sample on how to control logging fields from config</summary>

```csharp title="Control logging fields and file settings via appsettings.json"

var builder = WebApplication.CreateBuilder(args);

var w3CLoggingConfigSection = builder.Configuration.GetRequiredSection(nameof(W3CLoggerOptions));
builder
    .Services
    .Configure<W3CLoggerOptions>(w3CLoggingConfigSection);
builder.Services.AddW3CLogging(options =>
{
    
    options.AdditionalRequestHeaders.Add("X-Correlation-Id");
});
var app = builder.Build();
app.UseW3CLogging();


app.MapGet("/", () => "Hello World!");

app.Run();

```
```json title="Include the section in appsettings.json"
{
"W3CLoggerOptions": {
    "FileSizeLimit": 10485760,
    "RetainedFileCountLimit": 4,
    "FileName": "w3clog-",
    "LogDirectory": "./logs/",
    "FlushInterval": "00:00:01",
    "LoggingFields": "Date,Time,ServerName,Method,UriStem,UriQuery,ProtocolStatus,TimeTaken,ProtocolVersion,Host,UserAgent,Referer,ConnectionInfoFields"
  }
}
```
</details>

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

