---
title: Dependency Injection in MVC Action Filters using .NET 6
description: Dependency Injection in MVC Action Filters using .NET 6
slug: dependency-injection-in-mvc-action-filters 
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
<meta name="twitter:title" content="Dependency Injection in MVC Action Filters using .NET 6" />
<meta name="twitter:description" content="Dependency Injection in MVC Action Filters using .NET 6" />
</head>

<img src={require('./startandfinish.jpg').default} alt="Start and Finish Image"/>

Image by [awcreativeut](https://unsplash.com/@awcreativeut)

MVC Filters are discussed in detail at [docs.microsoft.com](https://docs.microsoft.com/en-us/aspnet/core/mvc/controllers/filters?view=aspnetcore-6.0) 
> Filters in ASP.NET Core allow code to run before or after specific stages in the request processing pipeline.

<!--truncate-->

## Use case of TypeFilterAttribute?
Suppose you are writing a Filter Attribute of `IAsyncResultFilter` which gets executed when the action method completes unless the request response is short-circuited.  
~~~csharp title="A result filter to remove cached value"
public sealed class RemoveCacheResultFilter : Attribute, IAsyncResultFilter
{
    private readonly IDistributedCache _distributedCache;

    public RemoveCacheResultFilter(IDistributedCache distributedCache)
    {
        _distributedCache = distributedCache;
    }

    public async Task OnResultExecutionAsync(ResultExecutingContext context, ResultExecutionDelegate next)
    {
        await _distributedCache.RemoveAsync("x").ConfigureAwait(false);
        if (!context.Cancel) await next().ConfigureAwait(false);
    }
}

~~~
It can be applied to the controller or its action method's, but it has dependency on `IDistrubutedCache` which can not be specified. 
So to fix this problem `Microsoft.AspNetCore.Mvc` has special filter type `TypeFilterAttribute` which creates the underlying filter instance and resolves any dependencies. It can be achieved using the below two approaches:
~~~csharp title="1: A result filter to remove cached value with DI using TypeFilterAttribute"
[ApiController]
[Route("[controller]")]
public class UsersController : Controller
{
    private readonly ILogger<UsersController> _usersLogger;

    public UsersController(ILogger<UsersController> usersLogger)
    {
        _usersLogger = usersLogger;
    }

    [HttpGet(Name = "users/{userId:int}")]
    // highlight-start
    [TypeFilter(typeof(RemovePlayerInstanceCacheResultFilter))]
    // highlight-end
    [Produces(typeof(UserApiModel))]
    public async Task<IResult> Get(int userId, CancellationToken cancellationToken)
    {
        if (userId <= 0) return Results.BadRequest();
        _usersLogger.LogInformation("Sending query to the database for the user with Id {UserId}", userId);
        //code omittted
        return user is { } ? Results.Ok(user) : Results.NotFound();
    }

    internal record UserApiModel(int Id, [UsedImplicitly] string FirstName, string LastName);
}
~~~
~~~csharp title="2: A result filter to remove cached value with DI using classes"
public class RemoveCacheFilterAttribute : TypeFilterAttribute
{
    public RemoveCacheFilterAttribute() : base(
        typeof(RemovePlayerInstanceCacheResultFilter))
    {
    }

    // ReSharper disable once MemberCanBePrivate.Global
    public sealed class RemoveCacheResultFilter : IAsyncResultFilter
    {
        private readonly IDistributedCache _distributedCache;

        public RemoveCacheResultFilter(IDistributedCache distributedCache)
        {
            _distributedCache = distributedCache;
        }

        public async Task OnResultExecutionAsync(ResultExecutingContext context, ResultExecutionDelegate next)
        {
            await _distributedCache.RemoveAsync("x").ConfigureAwait(false);
            if (!context.Cancel) await next().ConfigureAwait(false);
        }
    }
}

~~~

~~~csharp title="A result filter to remove cached value with DI using classes"
public class RemoveCacheFilterAttribute : TypeFilterAttribute
{
    public RemoveCacheFilterAttribute() : base(
        typeof(RemovePlayerInstanceCacheResultFilter))
    {
    }

    // ReSharper disable once MemberCanBePrivate.Global
    public sealed class RemoveCacheResultFilter : IAsyncResultFilter
    {
        private readonly IDistributedCache _distributedCache;

        public RemoveCacheResultFilter(IDistributedCache distributedCache)
        {
            _distributedCache = distributedCache;
        }

        public async Task OnResultExecutionAsync(ResultExecutingContext context, ResultExecutionDelegate next)
        {
            await _distributedCache.RemoveAsync("x").ConfigureAwait(false);
            if (!context.Cancel) await next().ConfigureAwait(false);
        }
    }
}

~~~


## Feedback
I would love to hear your feedback, feel free to share it on [Twitter](https://twitter.com/madnan_rafiq). 

