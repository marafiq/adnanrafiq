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

<img src={require('./DiagnositcMiddlewares.jpeg').default} alt="Diagnostic Middlewares" border="1"/>

Middleware is a function in then ASP.NET 8,
when many functions are invoked one after the other like a chain;
it becomes a middleware pipeline.
The middleware pipeline is responsible for handling the incoming HTTP request and outgoing HTTP response.

For in depth understanding of the middleware
you can read my blog post [here](https://adnanrafiq.com/blog/develop-intuitive-understanding-of-middleware-in-asp-net8/).

This is a series of blog posts in which I will cover all the builtin middlewares in ASP.NET 8.

<!--truncate-->

## Overview

There are 16 builtin middlewares in ASP.NET 8 to build a REST API. This post will cover four of them.

- [Welcome Page Middleware](#welcome-page-middleware)
- [Developer Exception Middleware](#developer-exception-middleware)
- [Exception Handler Middleware](#exception-handler-middleware)
- [Status Code Pages Middleware](#status-code-pages-middleware)


You can read about Host Filtering and Header Propagation middlewares in the [Part 1](https://adnanrafiq.com/blog/a-complete-guide-to-all-asp-dot-net-builtin-middlewares-part1/).
You can read about the Forwarded Header, Http Logging, W3C Logging middlewares in the [Part 2](https://adnanrafiq.com/blog/a-complete-guide-to-all-asp-dot-net-builtin-middlewares-part2/).

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
it will leak sensitive information and become a security risk because it does display:
- Stack Trace
- Exception Message
- Source Code
- Request and Response Headers
- Routing Information
- Query String
### How to use it?
The development lifecycle of any application mostly passes through three environments.
1. Development
2. Staging
3. Production

To address it, .NET comes with extension methods on `IWebHostEnvironemnt` to check the environment,
it can be accessed via `app.Environment.IsDevelopment()` or `builder.Environment.IsDevelopment()`.

You can set the application environment using the `ASPNETCORE_ENVIRONMENT` environment variable.

:::tip
You can configure the number of lines of source code 
to display in the stack trace using the `SourceCodeLineCount` property of `DeveloperExceptionPageOptions`.
:::

```csharp title="Use Developer Exception Page Middleware in Development Environment"
var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();
if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();
    //OR 
    app.UseDeveloperExceptionPage(new DeveloperExceptionPageOptions()
    {
        SourceCodeLineCount = 10
    });
}

app.UseWelcomePage(new WelcomePageOptions
{
    Path = "/"
});

app.Run();

```
:::note
When you create a new ASP.NET 8 project, the `UseDeveloperExceptionPage` is already added to the pipeline.
:::

## Exception Handler Middleware
In an ideal application in which unhandled exceptions will never ever occur, you do not need this middleware.
But such an application does not exist in the real world.

To gracefully handle the unhandled exceptions, you need this middleware.

### Purpose
Handle the unhandled exceptions and return an appropriate response to the client.
But make it observable so that you can log it and monitor it.
It does so by allowing you to do the following:
- Logs the exception to logger, diagnostic listener, and diagnostic meter.
- Allows you to provide a custom route to display a custom error page.
- Allows you to provide a custom delegate to handle the exception.
- Allows customizing the response with the help of `IProblemDetails` service.
- Allows you to add custom exception handlers to handle specific exceptions.

### How to use it?

#### Use Exception Handler with Custom Route
Errors will be logged to the logger, diagnostic listener, and diagnostic meter.
The response will be returned from the custom route.

```csharp title="Use Exception Handler with Custom Route"
var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();
app.UseExceptionHandler("/error");
app.MapGet("/error", (context) => {
    context.Response.ContentType = "text/html";
    return context.Response.WriteAsync("<h1>Error Page</h1><p>Something went wrong!</p>");
});
app.Run();
```
#### Use Exception Handler with Custom Route with Options

```csharp title="Use Exception Handler with Custom Route with Options"
var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();
app.UseExceptionHandler(new ExceptionHandlerOptions()
{
    CreateScopeForErrors = true
    ExceptionHandlingPath = "/error"
});
app.MapGet("/error", (context) => {
    context.Response.ContentType = "text/html";
    return context.Response.WriteAsync("<h1>Error Page</h1><p>Something went wrong!</p>");
});
app.Run();
```

#### Use Exception Handler with Handler Delegate

```csharp title="Use Exception Handler with Handler Delegate"
var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();
app.UseExceptionHandler(new ExceptionHandlerOptions()
{
    ExceptionHandler = async context =>
    {
        var exceptionHandlerPathFeature = context.Features.GetRequiredFeature<IExceptionHandlerPathFeature>();
        var exception = exceptionHandlerPathFeature.Error;

        var problemDetails = new ProblemDetails
        {
            Title = "An error occurred",
            Status = 500,
            Detail = exception.Message,
            Instance = context.Request.Path
        };

        context.Response.StatusCode = problemDetails.Status.Value;
        context.Response.ContentType = "application/problem+json";

        var jsonProblemDetails = JsonSerializer.Serialize(problemDetails);

        await context.Response.WriteAsync(jsonProblemDetails);
    }
});
app.Run();

```

#### Use Exception Handler with `IExceptionHandler` implementations
You have to add your implementation of `IExceptionHandler` to the service collection. 
If the exception is handled by your implementation, it will not call the delegate provided via options.
But if the exception is not handled by your implementation, it will call the delegate provided via options.

```csharp title="Use Exception Handler with IExceptionHandler implementations"
var builder = WebApplication.CreateBuilder(args);
builder.Services.AddExceptionHandler<TimeoutExceptionHandler>();
var app = builder.Build();
app.UseExceptionHandler(new ExceptionHandlerOptions()
{
    ExceptionHandler = async context =>
    {
        var exceptionHandlerPathFeature = context.Features.GetRequiredFeature<IExceptionHandlerPathFeature>();
        var exception = exceptionHandlerPathFeature.Error;

        var problemDetails = new ProblemDetails
        {
            Title = "An error occurred",
            Status = 500,
            Detail = exception.Message,
            Instance = context.Request.Path
        };

        context.Response.StatusCode = problemDetails.Status.Value;
        context.Response.ContentType = "application/problem+json";

        var jsonProblemDetails = JsonSerializer.Serialize(problemDetails);

        await context.Response.WriteAsync(jsonProblemDetails);
    }
});
app.MapGet("/timeoutexception", () =>
    {
        throw new TimeoutException();
    });
app.MapGet("/overflowexception", () =>
{
    throw new OverflowException();
});
app.Run();

class TimeoutExceptionHandler(ILogger<TimeoutExceptionHandler> logger) : IExceptionHandler
{
    public ValueTask<bool> TryHandleAsync(HttpContext httpContext, Exception exception,
        CancellationToken cancellationToken)
    {
        if (exception is not TimeoutException) return ValueTask.FromResult(false);
        logger.LogError(exception, "Timeout occurred for {@HttpRequest}", httpContext.Request);
        httpContext.Response.StatusCode = StatusCodes.Status408RequestTimeout;
        return ValueTask.FromResult(true);
    }
}
```
#### Use Exception Handler with `IProblemDetails` service 
All the exceptions will be handled by the `IProblemDetails` service.

```csharp title="Use Exception Handler with IProblemDetails"
var builder = WebApplication.CreateBuilder(args);
//If you do not add problem details, you server will not start
builder.Services.AddProblemDetails();
var app = builder.Build();
app.UseExceptionHandler();
app.MapGet("/timeoutexception", () =>
    {
        throw new TimeoutException();
    });
app.MapGet("/overflowexception", () =>
{
    throw new OverflowException();
});
app.Run();
```

### Inner Workings of Exception Handler Middleware
Let's start by taking a look at the Exception Handler Middleware.

```csharp title="Exception Handler Middleware"
public class ExceptionHandlerMiddleware
{
    private readonly ExceptionHandlerMiddlewareImpl _innerMiddlewareImpl;

    public ExceptionHandlerMiddleware(
        RequestDelegate next,
        ILoggerFactory loggerFactory,
        IOptions<ExceptionHandlerOptions> options,
        DiagnosticListener diagnosticListener)
    {
        _innerMiddlewareImpl = new(
            next,
            loggerFactory,
            options,
            diagnosticListener,
            Enumerable.Empty<IExceptionHandler>(),
            new DummyMeterFactory(),
            problemDetailsService: null);
    }

    public Task Invoke(HttpContext context)
        => _innerMiddlewareImpl.Invoke(context);
}
```

The `ExceptionHandlerMiddleware` is a wrapper around `ExceptionHandlerMiddlewareImpl` which does the actual work.
The `ExceptionHandlerMiddlewareImpl` is not used when calling the `UseExceptionHandler` extension method.

The constructor of `ExceptionHandlerMiddlewareImpl` takes the following dependencies. 
The list and brief description of each dependency are as follows:
- `RequestDelegate next` - The next middleware in the pipeline.
- `ILoggerFactory loggerFactory` - The logger factory to create the logger
- `IOptions<ExceptionHandlerOptions> options` - The options of the exception handler middleware configured by you.
- `DiagnosticListener diagnosticListener` - The diagnostic listener to listen to the exceptions.
- `IEnumerable<IExceptionHandler> exceptionHandlers` - The list of exception handlers to handle specific exceptions.
- `IMeterFactory meterFactory` - The meter factory to log that exception has occurred.
- `IProblemDetailsFactory problemDetailsService` - The problem details service to customize the response.

By the list of dependencies, you can tell that it does a lot of things but customizable.

You are aware that every middleware receives the next middleware in the pipeline as a dependency. 
Let's take a look at how the next middleware is invoked in `ExceptionHandlerMiddlewareImpl`.

#### How `next` middleware is invoked?
The next middleware is invoked in try catch block so that any exception thrown by it can be caught and handled.
Few things to note here:
- The performance trick to avoid `await` to check if the task is completed or not.
- The `Awaited` local function to await the task and capture the exception.
- The [`ExceptionDispatchInfo`](https://learn.microsoft.com/en-us/dotnet/api/system.runtime.exceptionservices.exceptiondispatchinfo?view=net-8.0) to capture the exception and rethrow it.
- The `HandleException` method to handle the exception when the exception is observed without `await`.

The below source code is from the [ExceptionHandlerMiddlewareImpl.cs](https://github.dev/dotnet/aspnetcore/blob/main/src/Middleware/Diagnostics/src/ExceptionHandler/ExceptionHandlerMiddlewareImpl.cs) 
 with a few additional comments from me.

```csharp title="How next middleware is invoked and exception is captured?"
public Task Invoke(HttpContext context)
{
    ExceptionDispatchInfo edi;
    try
    {
        //task for the next middleware starts
        var task = _next(context);
        //check if it already completed
        if (!task.IsCompletedSuccessfully)
        {
            //if not completed return the task so it can be awaited
            return Awaited(this, context, task);
        }

        return Task.CompletedTask;
    }
    catch (Exception exception)
    {
        // Get the Exception, but don't continue processing in the catch block as its bad for stack usage.
        edi = ExceptionDispatchInfo.Capture(exception);
    }

    return HandleException(context, edi);
    // Local function to await a task and capture any resulting exception.
    static async Task Awaited(ExceptionHandlerMiddlewareImpl middleware, HttpContext context, Task task)
    {
        ExceptionDispatchInfo? edi = null;
        try
        {
            await task;
        }
        catch (Exception exception)
        {
            // Get the Exception, but don't continue processing in the catch block as its bad for stack usage.
            edi = ExceptionDispatchInfo.Capture(exception);
        }

        if (edi != null)
        {
            // If we have an exception, handle it.
            await middleware.HandleException(context, edi);
        }
    }
}
```
#### How exception is handled?

The `handleException` method does make use of all the dependencies, you have seen in the constructor.

The first thing it does is to check if the exception belongs to `OperationCanceledException` or `IOException` 
or the request is aborted.
It logs the exception to multiple destinations and returns a response with status code 499
(500 will be returned if the response is already started because it is the default status).

:::note
In case of the above-mentioned exceptions,
the exception middleware will not invoke the `IExceptionHandler` implementations,
no custom response when you have added your implementation of `IProblemDetails` 
service and no custom route to display the error page.
:::

```csharp title="1 - How exception is handled?"
private async Task HandleException(HttpContext context, ExceptionDispatchInfo edi)
{
    var exceptionName = edi.SourceException.GetType().FullName!;

    if ((edi.SourceException is OperationCanceledException || edi.SourceException is IOException) && context.RequestAborted.IsCancellationRequested)
    {
        _logger.RequestAbortedException();

        if (!context.Response.HasStarted)
        {
            context.Response.StatusCode = StatusCodes.Status499ClientClosedRequest;
        }

        _metrics.RequestException(exceptionName, ExceptionResult.Aborted, handler: null);
        return;
    }
    //More Code removed for brevity
}
```

Why do you need to check if the response is already started?
HTTP messages must follow the [HTTP Message Format](https://datatracker.ietf.org/doc/html/rfc7230#section-3.1.2).
> The first line of a response message is the status-line, consisting
of the protocol version, a space (SP), the status code, another
space, a possibly empty textual phrase describing the status code,
and ending with CRLF.

> status-line = HTTP-version SP status-code SP reason-phrase CRLF

When a client interprets the response, it expects the status line to be the first line of the response. 
If you notice that by sending status code to the client, 
you have already conveyed to the client about the status of the request.
Thus, any changes to the status code are not allowed, even if they were it will be meaningless.

The next part of the `HandleException` method tries to check if the response is already started.
If yes, it logs the exception and rethrows it.

```csharp title="2 - How exception is handled?"
private async Task HandleException(HttpContext context, ExceptionDispatchInfo edi)
{
    var exceptionName = edi.SourceException.GetType().FullName!;
    //More Code removed for brevity
    DiagnosticsTelemetry.ReportUnhandledException(_logger, context, edi.SourceException);

    // We can't do anything if the response has already started, just abort.
    if (context.Response.HasStarted)
    {
        _logger.ResponseStartedErrorHandler();

        _metrics.RequestException(exceptionName, ExceptionResult.Skipped, handler: null);
        edi.Throw();
    }
    //More Code removed for brevity
}
```

The next part of the `HandleException` method tries to check and call the `IExceptionHandler` implementations.
If the exception is handled by any of the implementations,
it won't try to call the `ExceptionHandler` provided on the options during `UseExceptionHander` middleware.
The exception handlers will be called in the order they are added.

```csharp title="3 - How exception is handled?"
private async Task HandleException(HttpContext context, ExceptionDispatchInfo edi)
{
    //More Code removed for brevity
    string? handler = null;
    var handled = false;
    foreach (var exceptionHandler in _exceptionHandlers)
    {
        handled = await exceptionHandler.TryHandleAsync(context, edi.SourceException, context.RequestAborted);
        if (handled)
        {
            handler = exceptionHandler.GetType().FullName;
            break;
        }
    }
    //More Code removed for brevity
}
```
It will also log the exception to the diagnostic listener and diagnostic meter. 

But at what point, 
it will try to call the `ExceptionHandler` provided on the options during `UseExceptionHander` middleware?

If the exception is not handled by any of the `IExceptionHandler` implementations,
then it will try to call the delegate provided via options.
But if the delegate is not provided, it will try to call the `IProblemDetails` service.
You can add your implementation of `IProblemDetails` service to customize the response.
This is only possible if you use the middleware like `app.UseExceptionHandler(new ExceptionHandlerOptions())`.
```csharp title="4 - How exception is handled?"
//more code removed for brevity
if (!handled)
{
    if (_options.ExceptionHandler is not null)
    {
        await _options.ExceptionHandler!(context);
    }
    else
    {
        handled = await _problemDetailsService!.TryWriteAsync(new()
        {
            HttpContext = context,
            AdditionalMetadata = exceptionHandlerFeature.Endpoint?.Metadata,
            ProblemDetails = { Status = DefaultStatusCode },
            Exception = edi.SourceException,
        });
        if (handled)
        {
            handler = _problemDetailsService.GetType().FullName;
        }
    }
}
//More Code removed for brevity
```


But when it will execute the route for custom error page?

It will execute the route for custom error page
if the response is not started
by creating a new scope based on the options on `CreateScopeForErrors` property
only if the exceptions are not handled by:
- `OperationCanceledException` or `IOException` or the request is aborted.
- `IExceptionHandler` implementations.
- The Response has not started.
- `ExceptionHandler` provided on the options during `UseExceptionHander` middleware.

When you use the middleware by calling `UseExceptionHandler` extension method, it does the following:

```csharp title="5 - How exception is handled?"
private static IApplicationBuilder SetExceptionHandlerMiddleware(IApplicationBuilder app, IOptions<ExceptionHandlerOptions>? options)
{
    var problemDetailsService = app.ApplicationServices.GetService<IProblemDetailsService>();

    app.Properties["analysis.NextMiddlewareName"] = "Microsoft.AspNetCore.Diagnostics.ExceptionHandlerMiddleware";

    // Only use this path if there's a global router (in the 'WebApplication' case).
    if (app.Properties.TryGetValue(RerouteHelper.GlobalRouteBuilderKey, out var routeBuilder) && routeBuilder is not null)
    {
        return app.Use(next =>
        {
            var loggerFactory = app.ApplicationServices.GetRequiredService<ILoggerFactory>();
            var diagnosticListener = app.ApplicationServices.GetRequiredService<DiagnosticListener>();
            var exceptionHandlers = app.ApplicationServices.GetRequiredService<IEnumerable<IExceptionHandler>>();
            var meterFactory = app.ApplicationServices.GetRequiredService<IMeterFactory>();

            if (options is null)
            {
                options = app.ApplicationServices.GetRequiredService<IOptions<ExceptionHandlerOptions>>();
            }

            //highlight-start
            if (!string.IsNullOrEmpty(options.Value.ExceptionHandlingPath) && options.Value.ExceptionHandler is null)
            {
                var newNext = RerouteHelper.Reroute(app, routeBuilder, next);
                // store the pipeline for the error case
                options.Value.ExceptionHandler = newNext;
            }
            //highlight-end
            return new ExceptionHandlerMiddlewareImpl(next, loggerFactory, options, diagnosticListener, exceptionHandlers, meterFactory, problemDetailsService).Invoke;
        });
    }

    if (options is null)
    {
        return app.UseMiddleware<ExceptionHandlerMiddlewareImpl>();
    }

    return app.UseMiddleware<ExceptionHandlerMiddlewareImpl>(options);
}
```
Notice the highlighted code above.
It is assigning a terminal `RequestDelegate` to the `ExceptionHandler` property on the options.
So the exception handler delegate will never be null
unless you have not provided the exception handling path or the delegate when calling `UseExceptionHandler` extension method.

#### Order of Exception Handling
In the end order of execution is as follows:
- Special case exceptions handling - `OperationCanceledException` or `IOException` or the request is aborted.
- Handle response already started.
- Call `IExceptionHandler` implementations in order implementations are added.
- Call `ExceptionHandler` provided on the options during `UseExceptionHander` middleware.
- Call `IProblemDetails` service on the provided route via Options.
### Best Practices
- Always use the middleware in the production environment.
- Always use the middleware as the first middleware in the pipeline.
- Return Problem details when using exception handler delegate when you are writing the REST API. [Problem Details RFC](https://datatracker.ietf.org/doc/html/rfc7807) can be read here.
- There are multiple ways to handle the exception which one to use depends on the use case. But you can use the following as a rule of thumb:
    - Use `IProblemDetails` by adding to the services and `UseExceptionHandler()` without any options should be default option unless you have a specific requirement.
    - Use `ExceptionHandler` delegate when you want to handle all the exceptions and perform some work other than logging.
    - Use `IExceptionHandler` implementations when you want to handle specific exceptions and perform some work other than logging.
## Status Code Pages Middleware
### Purpose
To include the content-type header and body in the response when the status code is between 400 and 599.
But why?
Let's say you are returning a `Results.BadRequest()` from one of your endpoints under some condition.
It will send back a response like below:
```text
HTTP/1.1 400 Bad Request
Content-Length: 0
Date: Wed, 15 Nov 2023 01:15:09 GMT
Server: Kestrel
```
It is a valid response, but it does not include the content-type header and body.
If you are requesting the endpoint from the browser,
it will display the browser's default error page, which can be confusing to understand.

Now consider a different scenario, where you are consuming the endpoint from the JavaScript client. 
It always expects the response with a body and content-type header, 
so it can parse the response to understand the error.

Well, you can say that it must rely on the status code to understand the error.

But won't it be a good idea to include a reason in the body and content-type header 
so that the client can parse it properly?

That is where the status code pages middleware comes into play.
But it will only act if the response body is empty and the status code is between 400 and 599.

### How to use it?
The below example by default uses `text/plain` content type in the response header.

```csharp title="01 - Use Status Code Pages Middleware with text/plain"
var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();
app.UseStatusCodePages();
app.MapGet("/badrequest", () =>
{
    return Results.BadRequest();
});
app.Run();

```

:::tip
Run the above code, and hit the end point from your browser, once with `app.UseStatusCodePages()` and once without it.
You will see the difference, also observe the response headers from the browser network tab in developer tools.
:::

But if you would like return the response as per the `ProblemDetails` schema. 
You can add the `ProblemDetails` service to the service collection. 
Now the middleware will return the response with `application/problem+json` content type.

```csharp title="02 - Use Status Code Pages Middleware with Problem Details Service"
var builder = WebApplication.CreateBuilder(args);
builder.Services.AddProblemDetails();
var app = builder.Build();
app.UseStatusCodePages();
app.MapGet("/badrequest", () =>
{
    return Results.BadRequest();
});
app.Run();
```

The `Status Code Pages Middleware` provides multiple extension methods to customize the response.
- `UseStatusCodePagesWithReExecute` - Re-execute the request pipeline with the given path.
- `UseStatusCodePagesWithRedirects` - Redirect to the given path.
- `UseStatusCodePages` - With the given handler as delegate.

Lastly,
you can disable the `Status Code Pages Middleware` on any endpoint
by getting `IStatusCodePagesFeature` from context features and set the enabled property like 
`context.Features.GetRequiredFeature<IStatusCodePagesFeature>().Enabled = false;`.

## Feedback
I would love to hear your feedback, feel free to share it on [Twitter](https://twitter.com/madnan_rafiq). 

