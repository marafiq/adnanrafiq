---
title: ASP.NET Core 8 Request Timeout Control
description: Configure Request Timeout in ASP.NET Core 8
slug: aspnet-core-8-request-timeout-control
authors: adnan 
tags: [C#, .NET8,ASP.NET8]
image : ./timeout.png
keywords: [C#, .NET8,ASP.NET8, Request Timeout, Timeout, ASP.NET Core 8 Request Timeout Control]
---
<head>

<meta property="og:image:width" content="1200"/>
<meta property="og:image:height" content="500"/>  
<meta name="twitter:creator" content="@madnan_rafiq" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="ASP.NET Core 8 Request Timeout Control" />
<meta name="twitter:description" content="Configure Request Timeout in ASP.NET Core 8" />
</head>

<img src={require('./timeout.png').default} alt="Timeout in ASP.NET Core 8"/>


# No built-in support for Request Timeout before .NET 8

There is no default way to control the request timeout in ASP.NET Core 6.0 or 7.0. 
But the ASP.NET Core 8.0 introduces a RequestTimeout Middleware.
It supports policy convention/pattern to apply the timeout options on a specific endpoint or globally.
You will find it familiar if you have configured CORS using the CORS middleware or any other middleware. 
But if you love extension methods, you are in luck, as it supports extension methods on the Builder.

<!--truncate-->

Let's read about the features it offers.

## Features

- Default Global Timeout Policy

- Specific Policy

- Disable Policy on Specific endpoint

- Cancel already started timeout via Features.

The Request Timeout Policy allows you to customize three things as in the below code.

1. Timeout 
2. StatusCode — Defaults to 504 - Gateway Timeout 
3. WriteTimeoutResponse — Defaults to Empty Response

## Default Global Timeout Policy

One policy to rule them all. You can configure a default policy that will be applied to all endpoints.

```csharp title="Global Default Policy"
builder.Services.AddRequestTimeouts(options => {
    options.DefaultPolicy = new RequestTimeoutPolicy {
        Timeout = TimeSpan.FromMilliseconds(1000),
        TimeoutStatusCode = 408,
        WriteTimeoutResponse = async (HttpContext context) => {
            context.Response.ContentType = "text/plain";
            await context.Response.WriteAsync("Response Output");
        }
    };
});
```

## Specific Use Case Policy
Your app usually contains more than one endpoint.
And one of those may require more time to process the request. 
You can apply a specific policy to that endpoint.

```csharp title="Specific Policy"
builder.Services.AddRequestTimeouts(options => {
    options.AddPolicy ("LongRequest",new RequestTimeoutPolicy {
        Timeout = TimeSpan.FromMilliseconds(5000),
        TimeoutStatusCode = 504,
        WriteTimeoutResponse = async (HttpContext context) => {
            context.Response.ContentType = "text/plain";
            await context.Response.WriteAsync("Response Output");
        }
    });
});

//Apply policy 
app.MapGet("/longrequest", async (HttpContext context) => {
        await Task.Delay(TimeSpan.FromSeconds(6000),
        context.RequestAborted);
    return Results.Content("No timeout!", "text/plain");
}).WithRequestTimeout("LongRequest");

//Will observe timeout as per the policy
```

## Disable Policy
You can disable the timeout policy on any endpoint using an extension method or attribute [DisableRequestTimeout].

```csharp

app.MapGet("/disablebyext", async (HttpContext context) => {
    try
    {
        await Task.Delay(TimeSpan.FromSeconds(10), context.RequestAborted);
    }
    catch
    {
        return Results.Content("Timeout!", "text/plain");
    }

    return Results.Content("No timeout!", "text/plain");
}).DisableRequestTimeout();

```
## How to Specify a Timeout for previous versions of ASP.NET 

There is no default way in ASP.NET 6 & 7, but you can still control the timeout using the RequestAborted token and the CancellationTokenSource.

```csharp title="ASP.NET 6 & 7 request timeout"
app.MapGet("/timeout", async (HttpContext ctx) =>
{
    var token = ctx.RequestAborted;
    CancellationTokenSource tokenSource = CancellationTokenSource.CreateLinkedTokenSource(token);
    //timeout after 10 seconds
    tokenSource.CancelAfter(10000);
    try
    {
        await Task.Delay(1000, tokenSource.Token);
    }
    catch (TaskCanceledException e)
    {
        return Results.StatusCode(408);
    }

    return Results.Ok("Allow All!");
})
```


## Feedback
I would love to hear your feedback, feel free to share it on [Twitter](https://twitter.com/madnan_rafiq). 

