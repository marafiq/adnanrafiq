---
title: A tale of migrating an ASP.NET Framework 4.x application to ASP.NET 6
description: Thread Starvation Detection or Hangs in ASP.NET 6 and beyond are tricky and require understanding of few concepts and tools. If you migrating an ASP.NET Framework 4.x application to .NET6+ and con not convert all paths to async then you should definitely keep reading.
slug: a-tale-of-migrating-aspnet4x-to-aspnet6
authors: adnan 
tags: [C#,CSharp]
image : ./2023-07-21-a-tale-of-migration-from-netframework-to-net6.png
keywords: [.NET6,ASP.NET6,KestrelHangs,ThreadStarvation,DiagnosticTools]
---
<head>

<meta property="og:image:width" content="1200"/>
<meta property="og:image:height" content="670"/>  
<meta name="twitter:creator" content="@madnan_rafiq" />
</head>

<img src={require('./2023-07-21-a-tale-of-migration-from-netframework-to-net6.png').default} alt="Title Image of the blog"/>

The .NET migration from ASP.NET Framework 4.x to ASP.NET6 or upcoming ASP.NET8 is going
to be on the rise in the next few years due to different reasons. 
Your reasons may vary from pure business value to upgrading the stack to use better tools & resources.
Some teams may even do it to reduce the bill or for the heck of it.
All are valid reasons.

One of the team with my current Employer is migrating a .NET Framework 4.x web application to .NET6
which serves up to 4K concurrent users. 
Before going to production,
there is a process
to certify the release
by running a load test for at least 1X of the expected load which is 4K concurrent users in this application.

During the load test application started to experience a huge number of errors, mainly two types:
- Sql Connection pool ran out of connections.
- A key web service started throwing exceptions while communicating with the service. It is a SOAP service which is consumed using WCF Core Client Proxy with `basicHttpBinding`.

The ASP.NET Framework 4.x version of the application did not experience these problems.
So what changed in .NET6 and how will you find out what is wrong?
Because there are thousands of different requests at play.

## Youtube Video

I have recorded a detailed YouTube video if you prefer the video content.

[Unlock the Powers of C# Record](https://youtu.be/8E12kEeLOKg)

<!--truncate-->

## How do you diagnose the unhealthy state of application?

You have nice structured logging enabled such as Serilog,
which is providing you insights about the kind of errors happening in your application.
But if it is not logical errors, then logs are not going to be great help but still provide you some context.
For example, your application depends upon an important WCF Core Service,
and it is throwing error like 'Send time out exceeded' but some operations are succeeding at the same time.
At this point, it is very tempting to play the guess game based on the overall knowledge & context you have.
You may even get it right to fix the issue.
But `dotnet` comes with diagnostic tools which are tailor-made for such situations.

Some of these Cross-platform CLI tools are:

1. `dotnet-trace` - Collects traces by watching the process, and usefully in CPU profiling.
2. `dotnet-counters` - Monitor and Collect a variety of counters including .NET GC.
3. `dotnet-dump` - Captures and has the ability to analyze a process dump (full, mini, and triage)
4. `dotnet-gcdump` - Captures a dump focused on .NET Garbage Collection Behavior
5. `dotnet-stack` - Captures the stack traces of threads in running.NET process which is similar to what you see when you debug in your IDE

::: tip
You can install the above tools by running the following command `dotnet tool install --global tool-name`
::: 

If your organization has monitoring tools at scale like DynaTrace or Datadog,
those can be really handy in diagnosing issues,
but they sometime have limited trace information, so these tools will come handy.

## Migrating a Legacy .NET Framework Application

The most common examples of technical debt in .NET applications are:

1. Using `sync` methods with communicating with a service like database, WCF Service etc. 
2. Using `async` methods in `sync` way like using `.Result` property of the `Task`.
3. Chatty communication with the database. 

The application in question was/is doing all of the above.
You might be thinking that you must pay all the debt at once.
But it is not feasible in the context of this application like many others.

You must be thinking why?
Not all features of the application are equal.
Neither in value nor in performance expectations.
If your application have say 10 different end points,
 only a few of them are going to be on hot path unless all of them are which is not the case most of the time.
For example, a LinkedIn hot path is viewing the profiles,
so you would optimize the hot path first as per your user expectations. 

### Chatty communication with the database

The DynaTrace trace showed
that .NET6 distributed SQL Server Session was the chatty part, so it was easy fix
to use the memory cache to reduce the chattiness.

Two observations on Sql Server Distributed Session Package

1. SQL InMemory OLTP script will be handy to get the maximum out of the full stack.
2. It uses lock to clear up the expired entries which could be done in the background hosted service at the specified interval.

### Use of `sync` operations of WCF Client Proxy

It takes considerate effort to convert the whole path of stack to `async` in other words all the way down async.
It also requires regression testing or use of feature flags
to incrementally release it especially when legacy application is stable.  

#### What is the problem with sync operations?
It is an important question as the answer will reveal the concept of "Hill Climbing" algorithm.
Hill Climbing is the way .NET Thread Pool adjusts the number of concurrent threads available to execute.
It makes new threads available after x milliseconds based on multiple factors like the number of threads
completing the work, and when the max thread count is reached.

Consider if the application end point is concurrently consumed by 1000 users.
Then the question is that can your hosted application handle it
if all requests land on the same host with the default thead pool config. 

The answer is it depends? To understand that we will have to look at two key things:

1. Configurations of your host.
2. Latency of the said operation.

If your host has two processors,
then the default configuration of .NET Thread Pool will have threads configured like below.

-- table 





## Feedback
I would love to hear your feedback, feel free to share it on [Twitter](https://twitter.com/madnan_rafiq). 

