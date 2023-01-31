---
title: Understanding C# Channels and testing Channels in ASP.NET Core Application
description: A channel is a shared path where information flows from one point to another. The producer(s) and consumer(s) of information are decoupled from each other.
slug: understanding-csharp-channels-and-unit-testing-channels-in-asp-net-core 
authors: adnan 
tags: [C#, .NET6, ASP.NET6]
image : ./startandfinish.jpg
keywords: [Channels,ASP.NET6,Testing,BackgroundProcessing,Producer,Consumer]
---
<head>

<meta property="og:image:width" content="1200"/>
<meta property="og:image:height" content="670"/>  
<meta name="twitter:creator" content="@madnan_rafiq" />
<meta name="twitter:title" content="Understanding C# Channels and testing Channels in ASP.NET Core Application" />
<meta name="twitter:description" content="A channel is a shared path where information flows from one point to another. The producer(s) and consumer(s) of information are decoupled from each other." />
</head>

<img src={require('./startandfinish.jpg').default} alt="Start and Finish Image"/>

Image by [awcreativeut](https://unsplash.com/@awcreativeut)

A blog post is in progress.

A Channel by [merriam-webster](https://www.merriam-webster.com/dictionary/channel) refers to among other meaings

> the bed where a natural stream of water runs

I will start this post by adopting the water channel analogy to explore how it relates with C# `System.Threading.Channels`.

## Analogy

Channel is the path where information flows from one point to another, like a water channel. If you observe the water channel, it is made up of multiple things. The first thing you will observe is water; second, water is produced by source(s), you can think of glaciers, Rain, etc., and thirdly the water ends up at the destination(s), you can think of the Sea, River, etc.

In .NET terminology, the source(s) are referred to as Producer(s), and the destination(s) are referred to as Consumer(s). And the water is referred to as Message(s) or the .NET object. 

For a moment, think about the water channel that how it runs. You will observe that one or multiple consumers and producers are concurrently at work in the water channel meaning produced by rains, melting of galciers, and consumed by many in different forms.

## Edge Case of flooding and Channel Types

The flood can happen in the water channel for many reasons, such as:

- The glaciers are melting at a high pace.
- The river is at capacity.

In .NET, you can map the analogies to Backpressure, which means the consumer is not consuming the messages at the same pace that the producer(s) are producing. 
The Backpressure is a technique to mitigate the flooding problem by configuring behavior on the producer to produce in a different way.    

That brings us to mainly two types of channels in the .NET

1. Bounded Channel
The Bounded Channel has a defined capacity based on your application needs. It allows you to configure the behavior of what to do in case flooding happens.
2. UnBounded Channel
The UnBounded Channel has no defined capacity, but the limitation of memory availability of the process will apply. 

Channel is made up of Channel Reader and Channel Writer. Channel class acts as a Facade to synchronize the access to the shared data structure of type `T`.
Channel class offers two factory methods to create the typed channel. You can configure the channel behavior using options classes. 

The below code snippet shows factory methods which are creating both types of channels. 

```csharp title="Channel Factory Methods to create bounded or unbounded channels "

//Create the bounded channel
Channel.CreateBounded<int>(new BoundedChannelOptions(capacity: 4)
{
    // This behavior will be triggered when channel writer tries to write
    FullMode = BoundedChannelFullMode.Wait, 
    SingleReader = true,
    SingleWriter = true,
    AllowSynchronousContinuations = false
});

//Create the unbounded channel
Channel.CreateUnbounded<int>(new UnboundedChannelOptions()
{
    SingleReader = true,
    SingleWriter = false,
    AllowSynchronousContinuations = false
});

```

<details>
<summary>Bounded Channel Mode when its full and backpressure</summary>

The bounded channel:
- Always have a capacity.
- Allows you to configure the mode of writer when the capacity is full.
- Allows you to register a callback function when an item is dropped as a result of `BoundedChannelFullMode` mode.

In the below code snippet, I have implemented `BackgroundBoundedProcessingQueue` to observe the different modes of the channel writer behavior in a unit test. 
The unit test `ShouldDropItemsWhenChannelIsAtCapacity` asserts the dropped items count in `DropNewest`, `DropWrite`, and `DropOldest` modes, and you will notice that there are items in the dropped list. But in `Wait` mode, the writer wait until the operation is cancelled or the channel capacity becomes available.

I encourage you to paste the whole snippet code in `xunit` project and observe the logs of the unit test.

```cshparp title="A unit test which shows how the bounded channel handles the writes when its full"

using System.Threading.Channels;
using Xunit.Abstractions;

namespace ChannelTests;

public class BackgroundBoundedProcessingQueue
{
    private readonly Channel<int> _channel;
    private readonly ITestOutputHelper _logger;
    public readonly List<int> DroppedItems = new();

    public BackgroundBoundedProcessingQueue(ITestOutputHelper logger, int capacity,
        BoundedChannelFullMode boundedChannelFullMode)
    {
        _logger = logger;
        _channel = Channel.CreateBounded<int>(new BoundedChannelOptions(capacity)
            {
                FullMode = boundedChannelFullMode
            },
            droppedItem =>
            {
                _logger.WriteLine($"{droppedItem} has been dropped.");
                DroppedItems.Add(droppedItem);
            });
    }

    public async ValueTask QueueItem(int item, CancellationToken cancellationToken)
    {
        await _channel.Writer.WriteAsync(item, cancellationToken);
        _logger.WriteLine($"{item} has been written to channel");
    }

    public ValueTask<int> DequeueItem(CancellationToken cancellationToken)
    {
        return _channel.Reader.ReadAsync(cancellationToken);
    }

    public async Task ProcessItems(CancellationToken cancellationToken)
    {
        var items = _channel.Reader.ReadAllAsync(cancellationToken);
        await foreach (var item in items.WithCancellation(cancellationToken))
            _logger.WriteLine($"{item} has been processed.");
    }
}

public class BoundedChannelTests
{
    private readonly ITestOutputHelper _testOutputHelper;

    public BoundedChannelTests(ITestOutputHelper testOutputHelper)
    {
        _testOutputHelper = testOutputHelper;
    }
    
    //highlight-start
    [Theory]
    [InlineData(BoundedChannelFullMode.DropNewest)]
    [InlineData(BoundedChannelFullMode.DropWrite)]
    [InlineData(BoundedChannelFullMode.DropOldest)]
    [InlineData(BoundedChannelFullMode.Wait)]
    public async Task ShouldDropItemsWhenChannelIsAtCapacity(BoundedChannelFullMode dropMode)
    {
        var tokenSource = new CancellationTokenSource(2000);
        _testOutputHelper.WriteLine($"Bounded Channel is operating in mode {dropMode}");
        BackgroundBoundedProcessingQueue queue = new(_testOutputHelper, 3, dropMode);
        if (dropMode == BoundedChannelFullMode.Wait)
        {
            await Assert.ThrowsAsync<OperationCanceledException>(async () =>
            {
                foreach (var i in Enumerable.Range(1, 5))
                {
                    //On fifth item it will wait until token is cancelled after 2000 ms
                    if (i == 5)
                        _testOutputHelper.WriteLine("5th item will never be written");
                    await queue.QueueItem(i, tokenSource.Token);
                    if (i == 3)
                    {
                        //Dequeuing the item so 4th item can be written
                        _testOutputHelper.WriteLine("Dequeuing the item so 4th item can be written");
                        await queue.DequeueItem(tokenSource.Token);
                    }
                }
            });
        }
        else
        {
            foreach (var i in Enumerable.Range(1, 5))
                await queue.QueueItem(i, tokenSource.Token);
            Assert.True(queue.DroppedItems.Count == 2);
        }
    }
    //highlight-end
}


```


</details>

<details>
<summary>UnBounded Channel has no capacity - A unit test to write for x amount of time to the unbounded channel
</summary>
The Unbounded Channel:

- Has no capacity but the available memory to the process.
- It allows you to configure the number of readers and writers using `UnboundedChannelOptions`. 

I encourage to try to run the code snippet to  observe the unbounded channel capacity. The below code snippet is a unit test, you can run it by copying the whole thing in xunit project.

```csharp

using System.Threading.Channels;
using Xunit.Abstractions;

namespace ChannelTests;

public class BackgroundUnBoundedProcessingQueue
{
    private readonly Channel<int> _channel;
    private readonly ITestOutputHelper _logger;
    public BackgroundUnBoundedProcessingQueue(ITestOutputHelper logger)
    {
        _logger = logger;
        _channel = Channel.CreateUnbounded<int>(new UnboundedChannelOptions()
        {
            SingleReader = true,
            SingleWriter = false,
            AllowSynchronousContinuations = false
        });
    }
    public async ValueTask QueueItem(int item, CancellationToken cancellationToken)
    {
        await _channel.Writer.WriteAsync(item, cancellationToken);
    }
    public ChannelReader<int> Reader => _channel.Reader;
}

public class UnBoundedChannelTests
{
    private readonly ITestOutputHelper _testOutputHelper;

    public UnBoundedChannelTests(ITestOutputHelper testOutputHelper)
    {
        _testOutputHelper = testOutputHelper;
    }

    [Fact]
    public async Task ShouldAlwaysAcceptItems()
    {
        var source = new CancellationTokenSource(100);
        BackgroundUnBoundedProcessingQueue queue = new(_testOutputHelper);
        //Throws Async because we are only writing for 100 ms to prove the capacity has no bounds
        await Assert.ThrowsAsync<TaskCanceledException>(async () =>
        {
            for (var i = 0; i < int.MaxValue; i++)
            {
                await queue.QueueItem(i, source.Token);
            }
        });
        var totalItems = 0;
        while (queue.Reader.TryRead(out var x))
        {
            totalItems++;
        }
        _testOutputHelper.WriteLine($"Total items on the channel are {totalItems}");
        Assert.True(true);
    }
}

```

</details>



## The case of Decoupling

The sea (consumer) does not care about how the water is produced. It just consumes it metaphorically. Neither the sea knows about the production source, the glacier metaphorically.

Similarly, the producer and consumer in the .NET channel do not know about each other yet operate on the shared resource, the messages. 

## Many canals of the River and .NET Concurrency

Without going into the chemistry of water molecules, the producers put water into the river (Channel), a distinct function performed concurrently. Similarly, the river is divided into canals (consumers) that consume the water concurrently. 

The important thing to notice here, the same water drop is not shared among any involved parties; this complexity is hidden behind the .NET Channel abstraction.


## Background processing the work using Channels and Hosted Service

A web application API is a multithreading process with which many users interact concurrently. If an API logic involves an operation to perform a long-running or directly unrelated task, that will not impact the response returned to the user. You would like to offload or perform the task in the background. This leads us to find a mechanism that enables offloading. Channel is the answer.

If you have worked with .NET Framework, such background tasks were usually queued using `HostingEnvironment.QueueBackgroundItem` method or queue on the Thread Pool using `ThreadPool.QueueUserWorkItem`.
Both these approaches are hard to test and does not provide you any control on when these will be processed.

You can consider the below scenarios if you have yet to work with framework applications.

There are some commonly known requirements in traditional applications, such as: 

- Send out an email.
- Send an event to the analytics service.
- Sync the data to a third-party service.

In the below example, I have defined a simple API end point, and a hosted service. Suppose, you have an API call which should complete immediately but queue the work which can eventually complete at later time.
To achieve this, I have implemented the `IBackgroundTaskQueue` to create an abstraction over the `UnBoundedChannel`, now this abstraction is injected into API endpoint which uses it to queue the work. 
And the background service is continuously trying to read any available items to process. And as soon as it receives an item, it will start processing.

```csharp title="An exmple of background processing in the hosted service using the UnBounded Channel"

using System.Threading.Channels;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddSingleton<IBackgroundTaskQueue, LongRunningTaskBackgroundQueue>();
builder.Services.AddHostedService<LongRunningTaskBackgroundService>();

var app = builder.Build();
app.UseHttpsRedirection();

app.MapGet("dowork", async Task<IResult>(IBackgroundTaskQueue backgroundTaskQueue) =>
{
    Console.WriteLine($"I was written to queue {DateTime.Now}");
    await backgroundTaskQueue.QueueBackgroundWorkItemAsync(_ =>
    {
        //This wont run untill the reader reads and calls it
        return Task.Run(async () =>
        {
            await Task.Delay(1000);
            Console.WriteLine($"I ran {DateTime.Now}");
            
        });
    });
    return Results.Ok();
});
app.Run();


public interface IBackgroundTaskQueue
{
    ValueTask QueueBackgroundWorkItemAsync(
        Func<CancellationToken, Task> workItem);

    ValueTask<Func<CancellationToken, Task>> DequeueAsync(
        CancellationToken cancellationToken);
}

public sealed class LongRunningTaskBackgroundQueue : IBackgroundTaskQueue
{
    private readonly Channel<Func<CancellationToken, Task>> _queue;

    public LongRunningTaskBackgroundQueue()
    {
        UnboundedChannelOptions options = new()
        {
            SingleReader = true,
            SingleWriter = false
        };
        _queue = Channel.CreateUnbounded<Func<CancellationToken, Task>>(options);
    }
    public async ValueTask QueueBackgroundWorkItemAsync(
        Func<CancellationToken, Task> workItem)
    {
        await _queue.Writer.WriteAsync(workItem);
    }
    public async ValueTask<Func<CancellationToken, Task>> DequeueAsync(
        CancellationToken cancellationToken)
    {
        var workItem =
            await _queue.Reader.ReadAsync(cancellationToken);

        return workItem;
    }
}

public sealed class LongRunningTaskBackgroundService : BackgroundService
{
    private readonly ILogger<LongRunningTaskBackgroundQueue> _logger;
    private readonly IBackgroundTaskQueue _taskQueue;

    public LongRunningTaskBackgroundService(
        IBackgroundTaskQueue taskQueue,
        ILogger<LongRunningTaskBackgroundQueue> logger)
    {
        (_taskQueue, _logger) = (taskQueue, logger);
    }

    public override async Task StartAsync(CancellationToken cancellationToken)
    {
        var serviceName = nameof(LongRunningTaskBackgroundService);
        _logger.LogInformation("{ServiceName} is starting", serviceName);
        await base.StartAsync(cancellationToken);
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        var serviceName = nameof(LongRunningTaskBackgroundService);
        _logger.LogInformation("{ServiceName} is running", serviceName);

        await ProcessTaskQueueAsync(stoppingToken);
    }

    private async Task ProcessTaskQueueAsync(CancellationToken stoppingToken)
    {
        //Let the server start
        //https://learn.microsoft.com/en-us/aspnet/core/fundamentals/host/hosted-services?view=aspnetcore-7.0&tabs=visual-studio&viewFallbackFrom=aspnetcore-3.0#backgroundservice-base-class
        await Task.Yield();

        while (!stoppingToken.IsCancellationRequested)
            try
            {
                //Waiting for 5 seconds for each pass - you can remove it
                await Task.Delay(5000, stoppingToken);
                
                var task = await _taskQueue.DequeueAsync(stoppingToken);

                await task(stoppingToken);
            }
            catch (OperationCanceledException operationCanceledException)
            {
                _logger.LogInformation(operationCanceledException,
                    "Operation was cancelled because host is shutting down");
            }
            catch (AggregateException aggregateException)
            {
                _logger.LogError(aggregateException.Flatten(), "Aggregate exception occurred");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred executing task work item");
            }
    }

    public override async Task StopAsync(CancellationToken cancellationToken)
    {
        //Dump all the queue tasks in local file or log it.
        var serviceName = nameof(LongRunningTaskBackgroundService);
        _logger.LogInformation("{ServiceName} is stopping", serviceName);

        await base.StopAsync(cancellationToken);
    }
}

```

It was the most thrilling improvement I have felt when compared to .NET Framework. I asked myself, how would I test the above, and I came up with the below test.

The below test:

- Is starting the web server.
- Is starting the hosted service which continuously tries to read from the channel.
- Verifies that work item is written to channel, and then read by hosted service, and it starts the work.

That is beautiful .NET

```csharp

using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.DependencyInjection;
using Xunit.Abstractions;

namespace ChannelTests;


public class BackgroundProcessingTest : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _applicationFactory;
    private readonly ITestOutputHelper _testOutputHelper;

    public BackgroundProcessingTest(ITestOutputHelper testOutputHelper,
        WebApplicationFactory<Program> applicationFactory)
    {
        _testOutputHelper = testOutputHelper;
        _applicationFactory = applicationFactory;
    }

    [Fact]
    public async Task ShouldProcessTaskInBackgroundWhenWrittenToQueue()
    {
        var backgroundTaskQueue = _applicationFactory.Services.GetRequiredService<IBackgroundTaskQueue>();
        var expectedCount = 2;
        var countdownEvent = new CountdownEvent(expectedCount);
        for (var i = 0; i < 2; i++)
            await backgroundTaskQueue.QueueBackgroundWorkItemAsync(token =>
            {
                //decrement the count
                countdownEvent.Signal();
                _testOutputHelper.WriteLine(
                    $"I was called by the background service, should be called {countdownEvent.CurrentCount} times more.");
                return Task.CompletedTask;
            });

        //Waiting for 12 seconds because we intentionally waiting 5 secs in background service
        //These waits can be removed its only to show you how its working
        var countReached = countdownEvent.Wait(TimeSpan.FromSeconds(12));
        Assert.True(countReached);
    }
}

```


## Feedback
I would love to hear your feedback, feel free to share it on [Twitter](https://twitter.com/madnan_rafiq). 

