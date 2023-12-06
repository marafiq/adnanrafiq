---
title: Serilog with CreateApplicationBuilder in .NET 8 Worker or Hosted Service
description: .NET8 Worker template use the new Create Application Builder, so how to add Serilog in .NET 8 Worker or Hosted Service with CreateApplicationBuilder?
slug: how-to-add-serilog-in-net8-worker-or-hosted-service-with-createapplicationbuilder
authors: adnan 
tags: [C#, .NET8,HostedServices]
image : ./serilog.jpeg
keywords: [C#, .NET8,HostedServices,NET8Worker,CreateApplicationBuilder,Serilog,Logging]
---
<head>

<meta property="og:image:width" content="1200"/>
<meta property="og:image:height" content="500"/>  
<meta name="twitter:creator" content="@madnan_rafiq" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="Serilog with CreateApplicationBuilder in .NET 8 Worker or Hosted Service " />
<meta name="twitter:description" content=".NET8 Worker template use the new Create Application Builder, so how to add Serilog in .NET 8 Worker or Hosted Service with CreateApplicationBuilder?" />
</head>

<img src={require('./serilog.jpeg').default} alt="How to use Serilog with Application Builder"/>


# Logging

Logs are facts emitted by your application especially when it is running in production.

Structured logging is a way to give facts a shape so that you can query logs better.

Serilog is a structured logging library for .NET and it is one of the most popular logging libraries in .NET.

But how to use Serilog with the new .NET 8 Worker template?

<!--truncate-->


## Use Serilog with .NET 8 Worker or Hosted Service

You can create a new .NET 8 Worker or Hosted Service using the following command.

```bash
dotnet new worker -n MyWorker
```

Then install the following NuGet packages.

```bash
dotnet add package Serilog
dotnet add package Serilog.Extensions.Hosting
dotnet add package Serilog.Sinks.File
dotnet add package Serilog.Sinks.Console
dotnet add package Serilog.Settings.Configuration

```

Then change the `Program.cs` file to look like this.


:::info
I would appreciate
if you can subscribe to my [YouTube Channel](https://youtube.com/@OpenSourcedotNET?sub_confirmation=1).

I know it's a big ask, but it will help me to keep writing and producing awesome content for you.

Ok, lets do it [YouTube Channel](https://youtube.com/@OpenSourcedotNET?sub_confirmation=1).

:::

```csharp

var builder = Host.CreateApplicationBuilder(args);

//Clear Providers 
builder.Logging.ClearProviders();
//Read appsettings.json
Log.Logger = new LoggerConfiguration()
    .ReadFrom.Configuration(builder.Configuration)
    .CreateLogger();
// add the provider
builder.Logging.AddSerilog();


builder.Services.AddHostedService<Worker>();

var host = builder.Build();
host.Run();

```

And your `appsettings.json` file should look like this.

```json title="Settings to add console and file sink"
{
  "Serilog": {
    "Using": [ "Serilog.Sinks.Console", "Serilog.Sinks.File" ],
    "MinimumLevel": "Debug",
    "WriteTo": [
      { "Name": "Console" },
      {
        "Name": "File",
        "Args": {
          "path": "logs/log.txt",
          "rollingInterval": "Day",
          "retainedFileCountLimit": 7
        }
      }
    ],
    
    "Properties": {
      "Application": "YourWorkerName"
    }
  }
}
```

Before .NET 8, you were using `Host.CreateDefaultBuilder(args)` to create the host builder, but now you are using `Host.CreateApplicationBuilder(args)`.
With the `Host.CreateDefaultBuilder(args)` you were able to use the `UseSerilog()` extension method, 
but with the `Host.CreateApplicationBuilder(args)` you have to use the `AddSerilog()` extension method.

The only thing different `Host.CreateApplicationBuilder(args)` is doing that it is already adding the 
Logger Factory and Configuration to the builder, so you don't have to do it manually.

It does in when you call the `CreateApplicationBuilder(args)` method, under the hood it calls the `AddLogging()` method
which then calls the extension method to add the required services [Source Code](https://github.com/dotnet/runtime/blob/69d5d3feecc66540db524c333104bbc71a5ae4ad/src/libraries/Microsoft.Extensions.Logging/src/LoggingServiceCollectionExtensions.cs#L33C10-L33C10)
Thus when you call the `AddSerilog()` extension method, it is only adding the logging provider which is then used by the factory to create the logger.
```csharp
public static IServiceCollection AddLogging(this IServiceCollection services, Action<ILoggingBuilder> configure)
{
    ThrowHelper.ThrowIfNull(services);

    services.AddOptions();

    services.TryAdd(ServiceDescriptor.Singleton<ILoggerFactory, LoggerFactory>());
    services.TryAdd(ServiceDescriptor.Singleton(typeof(ILogger<>), typeof(Logger<>)));

    services.TryAddEnumerable(ServiceDescriptor.Singleton<IConfigureOptions<LoggerFilterOptions>>(
        new DefaultLoggerLevelConfigureOptions(LogLevel.Information)));

    configure(new LoggingBuilder(services));
    return services;
}
```

## Feedback
I would love to hear your feedback, feel free to share it on [Twitter](https://twitter.com/madnan_rafiq). 

