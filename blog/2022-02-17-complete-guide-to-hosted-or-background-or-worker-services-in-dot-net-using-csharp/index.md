---
title: A Complete Guide to Hosted Service(s) in .NET 6 using C# 10 
description: A Complete Guide to Background Worker Service(s) in .NET 6 using C# 10. It explains the Hosted Service LifeTime, Start and Stop Behavior, Exception Handling, Best Suited Use Cases, Host Options and flavors of Hosted Services. 
slug: complete-guide-to-hosted-or-background-or-worker-services-in-dot-net-using-csharp 
authors: adnan 
tags: [C#, .NET6, BackgroundWorkerService]
image : ./startandfinish.jpg
keywords: [Background,Worker,IHosted,Hosted,Service,.NET6,LongRunningTasks]
---
<head>

<meta property="og:image:width" content="1200"/>
<meta property="og:image:height" content="670"/>  
<meta name="twitter:creator" content="@madnan_rafiq" />
<meta name="twitter:title" content="A Complete Guide to Hosted Service(s) in .NET 6 using C# 10" />
<meta name="twitter:description" content="A Complete Guide to Background Worker Service(s) in .NET 6 using C# 10. It explains the Hosted Service LifeTime, Start and Stop Behavior, Exception Handling, Best Suited Use Cases, Host Options and flavors of Hosted Services. " />
</head>

<img src={require('./startandfinish.jpg').default} alt="Start and Finish Image"/>

Image by [awcreativeut](https://unsplash.com/@awcreativeut)

:::tip
I would appreciate
if you can subscribe to my [YouTube Channel](https://youtube.com/@OpenSourcedotNET?sub_confirmation=1).

I know it's a big ask, but it will help me to keep writing and producing awesome content for you.
:::

The word Host will repeatedly appear in the post so let's briefly understand what it means?

## What is Host?
The Host is a container which offers rich built-in services such as Dependency Injection, Configuration, Logging, Host Services and others. The NET 6 offers Generic DefaultHost which can be configured to handle the activities as per your use case. Two major variations of the Host are:
- Console Host - CLI based applications.
- Web Host - Web API & Applications.

Think of it as Airbnb Host who keeps the property ready to serve when the guests arrive.
The property offers a different set of services and allows you to bring your own services. The lifetime of such services depends upon the contract, which the Host controls.

~~~csharp title="Basic Host Example : Create, configure, build, and run the Host"
var host = Host.CreateDefaultBuilder(args) //WebHost.CreateDefaultBuilder(args)  
    .ConfigureLogging( (context, builder) => builder.AddConsole())
    .Build(); // Build the host, as per configurations.

await host.RunAsync();
~~~


## What is Hosted Service?
A service that performs the work in the background mostly does not offer an interface to interact. In technical terms, any reference type object which implements the `IHostedService` interface is a background/hosted/worker service.

Terms such as Worker, Windows Service, and Background Task refer to HostedService based on context.
In Windows Server, Widows Service is how you deploy a Hosted Service. Background Task or Hosted service runs as part of .NET Web Host, and it runs in the same operating system process.
<!--truncate-->
```csharp title="IHostedService Example"
public class LongRunningTaskService : IHostedService
{
    public Task StartAsync(CancellationToken cancellationToken)
    {
        // Start the work
        throw new NotImplementedException();
    }

    public Task StopAsync(CancellationToken cancellationToken)
    {
        //Graceful shutdown from the Host
        throw new NotImplementedException();
    }
}
```
:::note
The `StartAsync` method should not block the execution because if multiple hosted services exist in the Host, the following services will not start until the first service finish the start. We will see a demo of such behavior later in the post. If your task is long-running, you can use a `await Task.Yield()` to unblock the `StartAsync` method. The .NET will move to the next service as soon as the task becomes awaitable.
:::
## Flavors of Hosted Service
There are two flavors of Hosted Service and abstract BackgroundService calls from `Microsoft.Extensions.Hosting`; let's explore these 3 things below below:
### 1. BackgroundService
`BackgroundService` is an abstract class, and implements `IHostedService`.
The `BackgroundService` encapsulates the implementation of `StartAsync`, `StopAsync`, creation of `CancellationTokenSource` and disposal of resources. In other words, it is an excellent example of the Template Method Pattern.

The ExecuteAsync is an abstract method which will be called when the hosted service starts with the CancellationToken, which offers us to complete our work when Token cancellation is not requested. 
The cancellation can happen if you press ctrl + c or if the Host decides to stop the Hosted Services gracefully. 

The completion of `ExecuteAsync` method means that the service has finished its work.  
So if the requirement is to poll continuously, then use the infinite loop until token is cancelled, for example, processing the messages from the queue as they arrive.

:::note
You do not need to inherit from BackgroundService if your use case does not need the behavior it provides. It is a helper class.
:::

<details>
<summary>BackgroundService abstract class copied from Microsoft.Extensions.Hosting</summary>

```csharp title="BackgroundService"
// Licensed to the .NET Foundation under one or more agreements.
// The .NET Foundation licenses this file to you under the MIT license.

using System;
using System.Threading;
using System.Threading.Tasks;

namespace Microsoft.Extensions.Hosting
{
/// <summary>
/// Base class for implementing a long running <see cref="IHostedService"/>.
/// </summary>
public abstract class BackgroundService : IHostedService, IDisposable
{
private Task _executeTask;
private CancellationTokenSource _stoppingCts;

        /// <summary>
        /// Gets the Task that executes the background operation.
        /// </summary>
        /// <remarks>
        /// Will return <see langword="null"/> if the background operation hasn't started.
        /// </remarks>
        public virtual Task ExecuteTask => _executeTask;

        /// <summary>
        /// This method is called when the <see cref="IHostedService"/> starts. The implementation should return a task that represents
        /// the lifetime of the long running operation(s) being performed.
        /// </summary>
        /// <param name="stoppingToken">Triggered when <see cref="IHostedService.StopAsync(CancellationToken)"/> is called.</param>
        /// <returns>A <see cref="Task"/> that represents the long running operations.</returns>
        protected abstract Task ExecuteAsync(CancellationToken stoppingToken);

        /// <summary>
        /// Triggered when the application host is ready to start the service.
        /// </summary>
        /// <param name="cancellationToken">Indicates that the start process has been aborted.</param>
        public virtual Task StartAsync(CancellationToken cancellationToken)
        {
            // Create linked token to allow cancelling executing task from provided token
            _stoppingCts = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken);

            // Store the task we're executing
            _executeTask = ExecuteAsync(_stoppingCts.Token);

            // If the task is completed then return it, this will bubble cancellation and failure to the caller
            if (_executeTask.IsCompleted)
            {
                return _executeTask;
            }

            // Otherwise it's running
            return Task.CompletedTask;
        }

        /// <summary>
        /// Triggered when the application host is performing a graceful shutdown.
        /// </summary>
        /// <param name="cancellationToken">Indicates that the shutdown process should no longer be graceful.</param>
        public virtual async Task StopAsync(CancellationToken cancellationToken)
        {
            // Stop called without start
            if (_executeTask == null)
            {
                return;
            }

            try
            {
                // Signal cancellation to the executing method
                _stoppingCts.Cancel();
            }
            finally
            {
                // Wait until the task completes or the stop token triggers
                await Task.WhenAny(_executeTask, Task.Delay(Timeout.Infinite, cancellationToken)).ConfigureAwait(false);
            }

        }

        public virtual void Dispose()
        {
            _stoppingCts?.Cancel();
        }
    }
}
```
</details>

### 2. Worker Process
Worker Process is an independent deployable .NET package. You can create worker process using .NET CLI command `dotnet new worker` with default template.
You will find the following code in `Program.cs`.
~~~csharp title="Notice the highlighted line"
var host = Host.CreateDefaultBuilder(args)   
    .ConfigureLogging( (context, builder) => builder.AddConsole())
    // highlight-next-line
    .ConfigureServices(services => { services.AddHostedService<Worker>(); })
    .Build(); // Build the host, as per configurations.

await host.RunAsync();
~~~

`services.AddHostedService<Worker>()` adds the Hosted Service to the collection of the Host Services as Singleton. Since it implements IHostedService interface, the Host knows how to start it and gracefully shutdown if required.

You will find the following code in `Worker.cs`.
```csharp title="Code generated by default template"
// highlight-next-line
public class Worker : BackgroundService
{
    private readonly ILogger<Worker> _logger;

    public Worker(ILogger<Worker> logger)
    {
        _logger = logger;
    }
    // highlight-next-line
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        // highlight-next-line
        while (!stoppingToken.IsCancellationRequested)
        {
            _logger.LogInformation("Worker running at: {time}", DateTimeOffset.Now);
            await Task.Delay(1000, stoppingToken);
        }
        //Once execution leaves this method, it will not be called again.
    }
}
```
The `Worker` inherits from [`BackgroundService`](https://gist.github.com/marafiq/c3e08c1892600cda1a0af8df00358a2e) which is abstract class, and implements `IHostedService`.
We have already explored about BackgroundService above. Notice the infinite while loop until token is cancelled, we can keep doing the work. 
The worker is useful in the following use cases but not limited to:
- Reading messages from the queue.
- Migrating data from DataCenter to Cloud.
- Sending emails.

### 3. ASP.NET Hosted Service
ASP.NET hosted service implements the `IHostedSerivce` interface. It is different from the worker process only where it resides in memory, and it's part of the ASP.NET webserver process, which means it can access the memory of the process. 
Sharing the same process memory makes it very powerful because it can manipulate objects in the memory space.

The ASP.NET Hosted Service is useful in the following use cases but not limited to:
- Priming and Invalidating the Cache.
- Listening to messages from the queue.
- Performing Long Running Operation in the Background.


<details>
<summary>How to add the Hosted Service in ASP.NET Web Api</summary>

```csharp title="Adding the Hosted Service in ASP.NET Services - Lines Highlight below"

var builder = WebApplication.CreateBuilder(args);
//highlight-start
//PrimeCache implements IHostedService interface
builder.Services.AddHostedService<PrimeCache>();
//highlight-end

build.Build().Run();

```
</details>

## How to make it observable and resilient?
Observability is about telling how service is performing the given task from the outside. Logs are an excellent way to make a running process observable, `IHostApplicationLifetime` offers extension points to achieve it.

Resiliency is about making the service tolerant to failure and recovery from failure. Configuring the HostOptions related to the Hosted Service allows it. 
### Listen to HostService Lifetime events and stop programmatically
The Host provides `IHostApplicationLifetime` service which allows consumers to listen to changes in lifetime of the Hosted Services and stop the hosted service programmatically.
You can inject `IHostApplicationLifetime` into the Hosted Service constructor and register a callback function to listen to those events and take appropriate action such as logging. 
An example of how to log these events in the Hosted Service is below.

<details>

<summary>IHostApplicationLifetime interface contract with detail comments.</summary>

```csharp
/// <summary>
/// Allows consumers to be notified of application lifetime events. This interface is not intended to be user-replaceable.
/// </summary>
public interface IHostApplicationLifetime
{
    /// <summary>
    /// Triggered when the application host has fully started.
    /// </summary>
    CancellationToken ApplicationStarted { get; }

    /// <summary>
    /// Triggered when the application host is starting a graceful shutdown.
    /// Shutdown will block until all callbacks registered on this token have completed.
    /// </summary>
    CancellationToken ApplicationStopping { get; }

    /// <summary>
    /// Triggered when the application host has completed a graceful shutdown.
    /// The application will not exit until all callbacks registered on this token have completed.
    /// </summary>
    CancellationToken ApplicationStopped { get; }

    /// <summary>
    /// Requests termination of the current application.
    /// </summary>
    void StopApplication();
}
```

</details>

<details>

<summary>How to log IHostApplicationLifetime events and stop the hosted service programmatically.</summary>

```csharp title="Highlghted lines show the usage of IHostApplicationLifetime."
public class Worker : BackgroundService
{
    private readonly ILogger<Worker> _logger;
    private readonly IHostApplicationLifetime _hostApplicationLifetime;

    public Worker(ILogger<Worker> logger, IHostApplicationLifetime hostApplicationLifetime)
    {
        _logger = logger;
        _hostApplicationLifetime = hostApplicationLifetime;
        //highlight-start
        // callback methods when host is gracefully shutting down the service
        _hostApplicationLifetime.ApplicationStarted.Register(() => _logger.LogInformation("started"));
        _hostApplicationLifetime.ApplicationStopping.Register(() => _logger.LogInformation("stopping"));
        _hostApplicationLifetime.ApplicationStopped.Register(() => _logger.LogInformation("stopped"));
        //highlight-end
    }

    public override Task StartAsync(CancellationToken cancellationToken)
    {
        try
        {
            return base.StartAsync(cancellationToken);
        }
        catch (Exception e)
        {
            _logger.LogError(e.Message);
            return Task.CompletedTask;
        }
    }

    public override async Task StopAsync(CancellationToken cancellationToken)
    {
        var stopWatch = Stopwatch.StartNew();
        await base.StopAsync(cancellationToken);
        // it will print 30 seconds if stopped with ctrl + c
        _logger.LogInformation($"Worker Service Stopped in : {stopWatch.ElapsedMilliseconds}");
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        stoppingToken.Register(() => _logger.LogInformation($"Worker service token is canceled"));

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await DoWork();
            }
            catch (Exception e)
            {
                _logger.LogCritical(e, "I can not work anymore!");
            }
            finally
            {
                //highlight-start
                // if you can not recover, stop it.
                // All hosted services in host will be stopped in reverse order of registration
                _hostApplicationLifetime.StopApplication();
                //highlight-end
            }
        }
    }

    private async Task<bool> DoWork()
    {
        _logger.LogInformation("I started doing work!");
        // press ctrl + c - after above message - ctrl + c is equal to StopService from Windows Host
        // defualt graceful shutdown is 6 seconds
        // work will never complete
        await Task.Delay(50000);
        _logger.LogInformation("I am done with work.");
        return true;
    }
}
```
</details>


### Control Behavior of Hosted Service
Default graceful stop time is 5 seconds. If the Hosted Service requires more than 5 seconds to complete the in-progress work, then you can extend it by setting the ShutdownTimeout value.

If an unhandled exception occurs in the Hosted Service implementation, it will stop the Host, which might not be desirable, depending on your context. 
You can override it by setting the BackgroundServiceExceptionBehavior value.
```csharp title="How to extend the graceful shtudown time. Notice the highlighted lines below."
IHost host = Host.CreateDefaultBuilder(args)
    .ConfigureLogging( (context, builder) => builder.AddConsole())
    .ConfigureServices(services =>
    {
        services.Configure<HostOptions>(options =>
        {
            // highlight-start
            //Service Behavior in case of exceptions - defautls to StopHost
            options.BackgroundServiceExceptionBehavior = BackgroundServiceExceptionBehavior.Ignore;
          	//Host will try to wait 30 seconds before stopping the service. 
            options.ShutdownTimeout = TimeSpan.FromSeconds(30);
            // highlight-end
        });
        services.AddHostedService<Worker>();
    })
    .Build();
```

:::tip
If you are passing cancellation token to the downstream tasks correctly, then it is very likely that you do not need to extend the default shutdown time because Task from Background Service will be cancelled gracefully within 5 seconds.
:::
## Exercise Caution

### Use Scoped Services in Worker
`AddHostedService<Worker>()` adds a Singleton Instance of Worker to the default .NET DI Container which means any scoped service injected into the constructor of Worker will also be Singleton.

:::caution
Do not inject EF Context Instance into the constructor of the Hosted Service unless it is intentional.
If you are querying many records using the EF Context, it will cause memory saturation and an eventual crash.
Because all records will be held in memory.
:::

If your use case involves using a scoped type instance of any object, you will have to access the Instance using IServiceProvider. An example is below.

```csharp title="How to utilize scoped services inside the Hosted Service."
IHost host = Host.CreateDefaultBuilder(args)
    .ConfigureLogging( (context, builder) => builder.AddConsole())
    .ConfigureServices(services =>
    {
        // highlight-next-line
        services.AddScoped<IAnyScopeService>();
        services.AddHostedService<Worker>();
    })
    .Build();
await host.RunAsync();
public class Worker : BackgroundService
{
    private readonly IServiceScopeFactory _serviceScopeFactory;
    /* Do not do this. IAnyScopeService will be singleton instance.
    private readonly IAnyScopeService _anyScopeService;
    public Worker(IAnyScopeService anyScopeService)
    {
        _anyScopeService = anyScopeService;
    }
    */
    //Injecting the IServiceScopeFactory to create scope.
    public Worker(IServiceScopeFactory serviceScopeFactory)
    {
        _serviceScopeFactory = serviceScopeFactory;
    }
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        
        while (stoppingToken.IsCancellationRequested == false)
        {
            //Using the scoped service
            //highlight-start
            using var scope = _serviceScopeFactory.CreateScope();
            var anyScopeService = scope.ServiceProvider.GetService<IAnyScopeService>();
            await anyScopeService!.DoWork();
            //highlight-end
        }
        
    }
}

public interface IAnyScopeService
{
    Task<bool> DoWork();
}

public class AnyScopeService : IAnyScopeService
{
    public Task<bool> DoWork() => Task.FromResult(true);
}

```



### Start & stop behavior of hosted services?
If the Host contains multiple hosted services, it will start those services serially in order they are registered, but stops will happen in reverse order serially.
It can be essential to control the gracefully shut time behavior & how these services will stop so that business operation does not end up inconsistent. 

Consider, a hosted service is writing to a channel, and another hosted service is reading from that channel. If writer service is registered first, then it will stop last. It means the writer service may have written some data to channel, while there is no reader to read it.
So when using multiple hosted services using shared memory data, consider the order of their registration.    
Let's explore a quick example below:

~~~csharp title="Start & Stop Behavior - Copy the code, run and observe the log."
using System.Diagnostics;

IHost host = Host.CreateDefaultBuilder(args)
    .ConfigureServices(services =>
    {
        services.Configure<HostOptions>(options =>
        {
            options.ShutdownTimeout = TimeSpan.FromSeconds(15);
        });
        services.AddHostedService<WriterWorker>();
        services.AddHostedService<ReaderWorker>();
    })
    .Build();

await host.RunAsync();


public class WriterWorker : BackgroundService
{
    private readonly ILogger<WriterWorker> _logger;
    private readonly IHostApplicationLifetime _hostApplicationLifetime;

    public WriterWorker(ILogger<WriterWorker> logger, IHostApplicationLifetime hostApplicationLifetime)
    {
        _logger = logger;
        _hostApplicationLifetime = hostApplicationLifetime;
        _hostApplicationLifetime.ApplicationStarted.Register(() => _logger.LogInformation(
            "In WriterWorker - host application started at: {time}.",
            DateTimeOffset.Now));
        _hostApplicationLifetime.ApplicationStopping.Register(() => _logger.LogInformation(
            "In WriterWorker - host application stopping at: {time}.",
            DateTimeOffset.Now));
        _hostApplicationLifetime.ApplicationStopped.Register(() => _logger.LogInformation(
            "In WriterWorker - host application stopped at: {time}.",
            DateTimeOffset.Now));
    }

    public override async Task StartAsync(CancellationToken cancellationToken)
    {
        _logger.LogInformation("WriterWorker started at: {time} and will take 5 seconds to complete.",
            DateTimeOffset.Now);
        
        await Task.Delay(TimeSpan.FromSeconds(5), cancellationToken);
        await base.StartAsync(cancellationToken);
    }

    public override async Task StopAsync(CancellationToken cancellationToken)
    {
        var stopWatch = Stopwatch.StartNew();
        _logger.LogInformation("WriterWorker stopped at: {time}", DateTimeOffset.Now);
        await base.StopAsync(cancellationToken);
        _logger.LogInformation("WriterWorker took {ms} ms to stop.", stopWatch.ElapsedMilliseconds);
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        stoppingToken.Register(() => _logger.LogInformation(
            "In WriterWorker - token was cancelled at: {time}.",
            DateTimeOffset.Now));
        while (!stoppingToken.IsCancellationRequested)
        {
            _logger.LogInformation("Worker running at: {time}", DateTimeOffset.Now);
            //If you pass cancellation token here or to your work task
            //then tasks will be completed and you will not observe extended shutdown time.
            //try this same code but pass cancellation token
            //await Task.Delay(TimeSpan.FromSeconds(120), stoppingToken); 
            await Task.Delay(TimeSpan.FromSeconds(120));
        }
    }
}

public class ReaderWorker : BackgroundService
{
    private readonly ILogger<ReaderWorker> _logger;
    private readonly IHostApplicationLifetime _hostApplicationLifetime;

    public ReaderWorker(ILogger<ReaderWorker> logger, IHostApplicationLifetime hostApplicationLifetime)
    {
        _logger = logger;
        _hostApplicationLifetime = hostApplicationLifetime;
        
        _hostApplicationLifetime.ApplicationStarted.Register(() => _logger.LogInformation(
            "In ReaderWorker - host application started at: {time}.",
            DateTimeOffset.Now));
        _hostApplicationLifetime.ApplicationStopping.Register(() => _logger.LogInformation(
            "In ReaderWorker - host application stopping at: {time}.",
            DateTimeOffset.Now));
        _hostApplicationLifetime.ApplicationStopped.Register(() => _logger.LogInformation(
            "In ReaderWorker - host application stopped at: {time}.",
            DateTimeOffset.Now));
    }

    public override Task StartAsync(CancellationToken cancellationToken)
    {
        _logger.LogInformation("ReaderWorker started at: {time}", DateTimeOffset.Now);
        
        return base.StartAsync(cancellationToken);
    }

    public override async Task StopAsync(CancellationToken cancellationToken)
    {
        var stopWatch = Stopwatch.StartNew();
        _logger.LogInformation("ReaderWorker stopped at: {time}", DateTimeOffset.Now);
        await base.StopAsync(cancellationToken);
        _logger.LogInformation("ReaderWorker took {ms} ms to stop.", stopWatch.ElapsedMilliseconds);
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            _logger.LogInformation("Worker running at: {time}", DateTimeOffset.Now);
            await Task.Delay(TimeSpan.FromSeconds(120));
        }
    }
}
~~~

### Exception Handling 

The Hosted Service exceptions can stop the Host, which is not desirable in ASP.NET. I encourage you to handle exceptions and unwrap the `AggregateException` so you can diagnose using logs. 

```csharp title="Handle Exception & Unwrap Aggregate Exceptions"
class ParallelTasksHostedService : BackgroundService
{
    private readonly ILogger<ParallelTasksHostedService> _logger;

    public ParallelTasksHostedService(ILogger<ParallelTasksHostedService> _logger)
    {
        this._logger = _logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        try
        {
            while (!stoppingToken.IsCancellationRequested)
            {
                //Handle exceptions or make sure downstream calls do not throw at all.
                await Task.WhenAll(Task.Delay(1000, stoppingToken), Task.Delay(1000, stoppingToken));    
            }
        }
        catch (Exception e)
        {
            //UnWrap aggregate exceptions
            if (e is AggregateException aggregateException)
            {
                foreach (var innerException in aggregateException.Flatten().InnerExceptions)
                {
                    _logger.LogError(innerException, "One or many tasks failed.");
                }
            }
            else
            {
                _logger.LogError(e, "Exception executing tasks.");
            }
        }
    }
}

```

## Hosted Services Used inside ASP.NET Core 
How .NET WebHost start hosted service can be seen in source code on [GitHub](https://github.com/dotnet/aspnetcore/blob/259ff381eb80b197eb9d9d2421251e3e1edd40ae/src/Hosting/Hosting/src/Internal/WebHost.cs#L149).
ASP.NET Core uses few hosted services. Below are few examples to peak your curiosity.
- [Health Check Publisher Service](https://github.com/dotnet/aspnetcore/blob/ed1ac4285213158a85f69449dba448ef0c65fbf4/src/HealthChecks/HealthChecks/src/HealthCheckPublisherHostedService.cs#L16)
- [Connection Counter Service](https://github.com/dotnet/aspnetcore/blob/8b30d862de6c9146f466061d51aa3f1414ee2337/src/SignalR/perf/benchmarkapps/Crankier/Server/ConnectionCounterHostedService.cs)
- [Data Protection Service](https://github.com/dotnet/aspnetcore/blob/a450cb69b5e4549f5515cdb057a68771f56cefd7/src/DataProtection/DataProtection/src/Internal/DataProtectionHostedService.cs)
## Deployment
The .NET is a cross-platform, open-source developer platform. Thus Hosted Service can be deployed as a Windows Service on Windows Server, for other Operating System's you can use Docker.  
## Would you buy it anyway, NO?
I am running an experiment to make few bucks and take it more seriously. If you curious follow the link? [Would you Buy It, NO?](https://madnan.gumroad.com/l/a-complete-guide-to-windows-hosted-services-in-dotnet-using-csharp10)
## Feedback
I would love to hear your feedback, feel free to share it on [Twitter](https://twitter.com/madnan_rafiq). 

