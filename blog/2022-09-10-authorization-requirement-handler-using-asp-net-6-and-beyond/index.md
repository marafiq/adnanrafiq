---
title: How to Authorize in ASP.NET API using Authorization Policy with Requirements and Handler
description: Authorize in ASP.NET API using Authorization Policy with Requirements and Handler
slug: authorization-requirement-handler-using-asp-net-6-and-beyond 
authors: adnan 
tags: [C#, .NET6, ASP.NET6]
image : ./yougood.jpg
keywords: [Fundamentals, ASP.NET6,Authorization]
---
<head>

<meta property="og:image:width" content="1200"/>
<meta property="og:image:height" content="670"/>  
<meta name="twitter:creator" content="@madnan_rafiq" />
<meta name="twitter:title" content="How to Authorize in ASP.NET API using Authorization Policy with Requirements and Handler" />
<meta name="twitter:description" content="Authorize in ASP.NET API using Authorization Policy with Requirements and Handler" />
</head>

<img src={require('./yougood.jpg').default} alt="Start and Finish Image"/>

Image by [@claybanks](https://unsplash.com/@claybanks)

## Authorization Policy
Authorizing the resource access is essential part of any API. The .NET provides you a perfect mental model which is easier to reason about. It has this flow:
1. What is the name of your policy as string. 
2. What requirement the user must satisfy to qualify which implements the `IAuthorizationRequirement` interface.
3. What is your handler responsible to evaluate, which inherits the `AuthorizationHandler<UniqueIdHeaderRequirement>` and register it.

Then `Authorize` attribute allows you to set a policy name when used on controller or action method. 
But if you are fan of Minimal API then fluent style is the way to go using `RequireAuthorization`.


<!--truncate-->

## How to define Authorization Policy?
The `AuthorizationOptions` allows you to add policies with requirements using the `AddAuthorization`. 
Once the policy is defined and configured, it can be applied to the end point referred as resource.

~~~csharp title="Authorize using a Policy to verify that http header exists"

using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authorization;

var builder = WebApplication.CreateBuilder(args);
var services = builder.Services;

services.AddSingleton<IAuthorizationHandler, UniqueIdHeaderRequirement.UniqueIdHeaderRequirementAuthorizationHandler>();
// Required otherwise failure of auth handler will throw exception
services.AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme).AddCookie();
// highlight-start
services.AddAuthorization(options =>
{
    options.InvokeHandlersAfterFailure = false;
    options.AddPolicy("VerifyXUniqueIdHeader",
        policyBuilder => { 
            policyBuilder.AddRequirements(new UniqueIdHeaderRequirement()); 
        });
});
// highlight-end
services.AddRouting();
var app = builder.Build();
app.UseHttpsRedirection();
app.UseRouting();
app.UseAuthorization();
app.UseEndpoints(routeBuilder =>
{
    // highlight-start
    //Fluent style
    routeBuilder.MapGet("/", () => Results.Ok()).RequireAuthorization("VerifyXUniqueIdHeader");
    //Attribute style - Same be done MVC controller or action
    routeBuilder.MapGet("/hello", [Authorize(Policy = "VerifyXUniqueIdHeader")]() => Results.Ok());
    // highlight-end
});

app.Run();

internal class UniqueIdHeaderRequirement : IAuthorizationRequirement //IAuthorizationRequirement is a marker interface 
{
    // Handler gets called when the user is trying to access the resource. 
    internal class UniqueIdHeaderRequirementAuthorizationHandler : AuthorizationHandler<UniqueIdHeaderRequirement>
    {
        protected override Task HandleRequirementAsync(AuthorizationHandlerContext context,
            UniqueIdHeaderRequirement requirement)
        {
            //for mvc filter context cast it to - AuthorizationFilterContext
            if (context.Resource is HttpContext httpContext && !httpContext.Request.Headers.ContainsKey("x-unique-id"))
            {
                context.Fail();
                return Task.CompletedTask;
            }

            context.Succeed(requirement);
            return Task.CompletedTask;
        }
    }
}

~~~

## Feedback
I would love to hear your feedback, feel free to share it on [Twitter](https://twitter.com/madnan_rafiq). 

