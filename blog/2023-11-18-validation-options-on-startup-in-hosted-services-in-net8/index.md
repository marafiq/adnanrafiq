---
title: Validate Options<T> on Startup in Hosted Services in .NET8 
description: Validate Options<T> on Startup in stand alone hosted Services in .NET8 and hosted services in ASP.NET8
slug: validation-options-on-startup-in-hosted-services-in-net8 
authors: adnan 
tags: [C#, .NET8, ASP.NET8,HostedServices]
image : ./validationonstartup.jpeg
keywords: [Fundamentals, ASP.NET8,OptionsPattern,Configuration,ValidateOptionsOnStartup]
---
<head>

<meta property="og:image:width" content="1200"/>
<meta property="og:image:height" content="500"/>  
<meta name="twitter:creator" content="@madnan_rafiq" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="Validate Options<T> on Startup in Hosted Services in .NET8" />
<meta name="twitter:description" content="Validate Options<T> on Startup in stand alone hosted Services in .NET8 and hosted services in ASP.NET8" />
</head>

<img src={require('./validationonstartup.jpeg').default} alt="Validate Options on Startup"/>


# Validate `Options<T>` on Startup

The .NET 8 Host Builder allows you
to bind configuration with C# objects by using `AddOptions<T>` and binding to the configuration.

It provides you an opportunity to validate the configuration values when the host (WebApplication or Hosted Server) 
is starting by using `ValidateOnStart`.

But there are two interesting aspects of it, which I will explain in this post. 

<!--truncate-->

## No Validation Rules but Validate the Binding Happens on Startup

Say, you have the below configuration in your `appsettings.json`.
```json
{
  "IntegrationService1": {
      "Name": "IntegrationService",
      "DisplayName": "Integration Service"
    }
}
```
You would like to bind it to the following class which have properties with default values.
```csharp
public class IntegrationService
{
    public string Name { get; set; } = "Hello Service";
    public string DisplayName { get; set; } = "Integration Service";   
}
```

But you would like to validate it on startup that binding actually happens,
although you do not have any validation rules.

Take a look at the below code;
should it throw exception on startup if I change the above json section `IntegrationServices` to `PrivateServices`?

```csharp title="A Hosted Service using Options<T>"
var builder = Host.CreateApplicationBuilder(args);
builder.Services.AddOptions<IntegrationService>()
    .BindConfiguration(nameof(IntegrationService))    
    .ValidateOnStart();
builder.Services.AddHostedService<Worker>();
var host = builder.Build();
host.Run();
```

The answer is no. But you are validating on startup as you are calling `ValidateOnStart`.

It won't throw because:
1. There are no validation rules.
2. You are not using getting the section of config using `GetRequiredSection`.

You can fix it by using the `GetRequiredSection`.
This way it will fail on start, rather than chasing that why your configuration values are not binding to the object.

```csharp title="A Hosted Service using Options<T>"
var builder = Host.CreateApplicationBuilder(args);
var path = builder.Configuration.GetRequiredSection(nameof(IntegrationService)).Path;
builder.Services.AddOptions<IntegrationService>()
    .BindConfiguration(path)    
    .ValidateOnStart();
builder.Services.AddHostedService<Worker>();
var host = builder.Build();
host.Run
```

## Hosted Service is not Validating Options on Start
Below is a hosted service that is adding options and binding it with a section in `appsettings.json`. 
It also adds a validation rule using attribute classes that min length of Name must be 10, and it 
is required. 

```csharp title="A Host Service using options with validation on start"
var builder = Host.CreateApplicationBuilder(args);
var path = builder.Configuration.GetRequiredSection(nameof(IntegrationService)).Path;
builder.Services.AddOptions<IntegrationService>()
    .BindConfiguration(path)
    .ValidateDataAnnotations()
    .ValidateOnStart();
builder.Services.AddHostedService<Worker>();
var host = builder.Build();
host.Run();
public class IntegrationService
{
    [Required, MinLength(10)] public required string Name { get; set; }
    public string DisplayName { get; set; } = "Integration Service";
}
public class Worker : BackgroundService
{
    private readonly IntegrationService _integrationService;
    private readonly ILogger<Worker> _logger;

    public Worker(ILogger<Worker> logger, IOptions<IntegrationService> integrationService)
    {
        _logger = logger;
        _integrationService = integrationService.Value;
    }

    public override Task StartAsync(CancellationToken cancellationToken)
    {
        _logger.LogInformation("Starting worker {Name}", _integrationService.Name);
        return base.StartAsync(cancellationToken);
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            _logger.LogInformation("Worker running at: {Time}", DateTimeOffset.Now);
            await Task.Delay(1000, stoppingToken);
        }
    }
}
```
When you run this service, it will throw exception on start, but the stack trace will point to the constructor of the 
Worker. 

```csharp title="Stack trace pointing to the construct of worker"
Unhandled exception. Microsoft.Extensions.Options.OptionsValidationException: DataAnnotation validation failed for 'IntegrationService' members: 'Name' with the error: 'The field Name must be a string or array type with a minimum length of '10'.'.
   at Microsoft.Extensions.Options.OptionsFactory`1.Create(String name)
   at Microsoft.Extensions.Options.UnnamedOptionsManager`1.get_Value()
   //highlight-start
   at Worker..ctor(ILogger`1 logger, IOptions`1 integrationService) in /Users/muhammadadnanrafiq/Documents/MicroBlogs/Courses/WorkerService1/WorkerService1/Program.cs:line 29
   //highlight-end
```

It failed to start as expected, but the stack trace can throw you off because it is pointing towards the constructor 
of the worker.

You might start wondering that I am using `ValidateOnStart` on `OptionsBuilder`, if the configuration values
were not correct, why it is trying to start the host service. 

The answer is that .NET 8 has not tried to start the service yet. It is only trying to resolve the worker service.
Since the worker service has `IOptions<IntegrationServices>` dependency injected in constructor.
So it will try to resolve it too, which it does successfully. 

But then in the constructor, you are also accessing the value of the resolved options object. That is when the 
.NET 8 triggers the validation.

When you call `ValidateOnStart` it register a delegate
to force the evaluation of the options by getting the value, so it will validate the values.
Have a look at the extension method used by .NET.

```csharp title=".NET8 ValidateOnStart Extension method"
public static OptionsBuilder<TOptions> ValidateOnStart<[DynamicallyAccessedMembers(DynamicallyAccessedMemberTypes.PublicParameterlessConstructor)] TOptions>(this OptionsBuilder<TOptions> optionsBuilder)
    where TOptions : class
{
    ThrowHelper.ThrowIfNull(optionsBuilder);

    optionsBuilder.Services.AddTransient<IStartupValidator, StartupValidator>();
    //Configure methods adds a transient services for the configured options to run
    optionsBuilder.Services.AddOptions<StartupValidatorOptions>()
        .Configure<IOptionsMonitor<TOptions>>((vo, options) =>
        {
            // This adds an action that resolves the options value to force evaluation
            // We don't care about the result as duplicates are not important
            vo._validators[(typeof(TOptions), optionsBuilder.Name)] = () => options.Get(optionsBuilder.Name);
        });

    return optionsBuilder;
}
```

Great. But it is adding the delegate onto a dictionary.

But Who invokes it?

The Answer is, when you access the `.Value` property of injected `IOptions<T>`, .NET will create its 
value by binding to the configuration.
It does so by invoking the `OptionsFactory.Create` if it is not already resolved.
The factory then calls the dictionary's delegates by resolving the `IEnumerable<IValidateOptions<TOptions>> validations` 
which are added to the service collection when you call `ValidateOnStart`.
```csharp title="OptionsFactory Code - NET8"
public TOptions Create(string name)
{
    TOptions options = CreateInstance(name);
    foreach (IConfigureOptions<TOptions> setup in _setups)
    {
        if (setup is IConfigureNamedOptions<TOptions> namedSetup)
        {
            namedSetup.Configure(name, options);
        }
        else if (name == Options.DefaultName)
        {
            setup.Configure(options);
        }
    }
    foreach (IPostConfigureOptions<TOptions> post in _postConfigures)
    {
        post.PostConfigure(name, options);
    }

    if (_validations.Length > 0)
    {
        var failures = new List<string>();
        foreach (IValidateOptions<TOptions> validate in _validations)
        {
            ValidateOptionsResult result = validate.Validate(name, options);
            if (result is not null && result.Failed)
            {
                failures.AddRange(result.Failures);
            }
        }
        if (failures.Count > 0)
        {
            throw new OptionsValidationException(name, typeof(TOptions), failures);
        }
    }

    return options;
}
```

That resolves the mystery of how your stack trace points to the worker constructor, and how 
the validations got triggered by it.
If you had not accessed the value in the constructor, this would not happen.

Now brings the second bit of mystery. Why is the host trying to resolve the hosted service if it 
is not attempting to start?

The `StartAsync` is the method which actually starts the host in .NET 8. This method resolves the services before
it kicks the startup validators by calling this `_hostedServices ??= Services.GetRequiredService<IEnumerable<IHostedService>>();`
in below code which kicks the above process explained when your access the value property.

As you will see in below code, the startup validators are kicked after resolving the services. It does so by 
`IStartupValidator? validator = Services.GetService<IStartupValidator>();` which is calling all your validation services.
It does so by resolving the `IOptions<StartupValidatorOptions>` which has access to all the validators. 

```csharp title=""
public async Task StartAsync(CancellationToken cancellationToken = default)
{
    _logger.Starting();
    //Code removed to keep it short
    using (cts)
    using (linkedCts)
    {
        CancellationToken token = linkedCts.Token;

        // This may not catch exceptions.
        await _hostLifetime.WaitForStartAsync(token).ConfigureAwait(false);
        token.ThrowIfCancellationRequested();

        List<Exception> exceptions = new();
        //highlight-start
        _hostedServices ??= Services.GetRequiredService<IEnumerable<IHostedService>>();
        //highlight-end
        _hostedLifecycleServices = GetHostLifecycles(_hostedServices);
        _hostStarting = true;
        bool concurrent = _options.ServicesStartConcurrently;
        bool abortOnFirstException = !concurrent;
        //highlight-start
        // Call startup validators.
        IStartupValidator? validator = Services.GetService<IStartupValidator>();
        if (validator is not null)
        {
            try
            {
                validator.Validate();
            }
            catch (Exception ex)
            {
                exceptions.Add(ex);

                // Validation errors cause startup to be aborted.
                LogAndRethrow();
            }
        }
        //highlight-end
        // Call StartingAsync().
        if (_hostedLifecycleServices is not null)
        {
            await ForeachService(_hostedLifecycleServices, token, concurrent, abortOnFirstException, exceptions,
                (service, token) => service.StartingAsync(token)).ConfigureAwait(false);

            // Exceptions in StartingAsync cause startup to be aborted.
            LogAndRethrow();
        }

        // Call StartAsync().
        await ForeachService(_hostedServices, token, concurrent, abortOnFirstException, exceptions,
            async (service, token) =>
            {
                await service.StartAsync(token).ConfigureAwait(false);

                if (service is BackgroundService backgroundService)
                {
                    _ = TryExecuteBackgroundServiceAsync(backgroundService);
                }
            }).ConfigureAwait(false);

        // Exceptions in StartAsync cause startup to be aborted.
        LogAndRethrow();

        // Call StartedAsync().
        if (_hostedLifecycleServices is not null)
        {
            await ForeachService(_hostedLifecycleServices, token, concurrent, abortOnFirstException, exceptions,
                (service, token) => service.StartedAsync(token)).ConfigureAwait(false);
        }

        // Exceptions in StartedAsync cause startup to be aborted.
        LogAndRethrow();
        //code removed to keep it short
    }

    _logger.Started();
}
```

This can be fixed by moving the resolving of the hosted services after the startup validations, 
but it is not a big issue since validation on start gets triggered anyway. 

Having said that, stack trace **may** lead you thinking that it is not validating on start, and there is something
wrong with your dependency, or you are not using validating on start correctly.

:::note
The .NET team has written some amazing readable code.
You can read it on [Github](https://github.com/dotnet/aspnetcore/blob/main/src/Hosting/Hosting/src/Internal/WebHostOptions.cs).
:::

## Feedback
I would love to hear your feedback, feel free to share it on [Twitter](https://twitter.com/madnan_rafiq). 

