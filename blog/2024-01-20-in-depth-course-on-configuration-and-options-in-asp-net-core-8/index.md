---
title: In Depth Course on Configuration and Options in ASP.NET Core 8
description: Configuration is the first fundamental concept you will have to master when you start building .NET Core applications. 
slug: in-depth-course-on-configuration-and-options-in-asp-net-core-8
authors: adnan 
tags: [C#, .NET8,ASP.NET8]
keywords: [C#, .NET8,ASP.NET8, Configuration, Options, IOptions, IOptionsSnapshot, IOptionsMonitor, IOptionsMonitorCache, IOptionsFactory, IConfigureOptions, IPostConfigureOptions, IValidateOptions, IValidateOptionsFactory, IOptionsChangeTokenSource]
draft: true
---
<head>

<meta property="og:image:width" content="1200"/>
<meta property="og:image:height" content="500"/>  
<meta name="twitter:creator" content="@madnan_rafiq" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="In Depth Course on Configuration and Options in ASP.NET Core 8" />
<meta name="twitter:description" content="Configuration is the first fundamental concept you will have to master when you start building .NET Core applications. " />
</head>

# Overview
You cannot build dynamic applications without configuration.

When developing any .NET application, be it a Blazor Web Application, a REST API, a Console Application or a Hosted Service, 
configuration is one of the first fundamental concepts that you will have to learn.

After completing this course, you will have a solid understanding of the configuration and options in .NET 8,
and you will be able to apply the concepts to build dynamic applications. 

Welcome to my course on configuration and options in .NET 8. My name is Adnan Rafiq, and I am a Senior Engineer.
I have built and maintained applications using the .NET stack for over a decade.


You will learn the what, when, why, and how of configuration and options in .NET 8. 
You will make use of dependency injection to access the application configuration at runtime
to register the services that require different configuration values for different environments 
such as database connection strings, API keys, feature flags, and other settings.

The major topics that we will cover in this course are:
- Defining and accessing configuration in your application
- Overriding configuration values using different sources such as environment variables
- Supplying different configuration values for different environments
- Securing sensitive configuration values during development
- Binding configuration to strongly typed objects
- KISS principle for configuration
- Using options to access configuration in your application
- Reloading configuration values at runtime without restarting the application
- Validating configuration values using various techniques
- Customizing configuration providers

For complete list of topics covered in this course, check out the course outline now.

I warmly welcome you to join me on this journey to learn configuration and options in ASP.NET Core 8 by buying it today.

<!--truncate-->

## Getting Started with Configuration

### Module Overview
This module will cover the basics of configuration in .NET 8. You will learn what configuration is, why it is important, and how to access the configuration in your application.

### Reasoning of Application Configuration in ASP.NET Core 8

> Configuration allows you to control the behavior of your application without changing the code and restarting the application. 

Any real-world application requires storing data in databases, sending emails, caching data, and integrating with third-party services.

You cannot hard-code the configuration values such as database connection strings, API keys, and other settings in your application.
As it requires you to recompile the application every time you change the configuration values or try deploying to different environments such as development, staging, and production.

By default, ASP.NET Core 8 applications use the `appsettings.json` file to store the application configuration. 
It is a JSON file that contains key-value pairs.
But you can use other formats such as XML, INI, and custom file format to store the configuration.
As it is evident from the file formats, the configuration can be hierarchical in nature that means you can have nested configuration values.

But files are not the only way to store the configuration values.
The configuration values can also be supplied or stored in environment variables, command-line arguments, and other sources.
The ASP.NET Core 8 supports multiple configuration sources out of the box, but it brings the challenge of which configuration source values to use when there are multiple sources. 
The values are loaded in a specific order, and the last value wins.

When you run the application, the configuration values are loaded into the dictionary by flattening the hierarchical key-value pairs and are available to the application at runtime.
Once the configuration values are loaded, you can access them in your application using the `IConfiguration` interface by injecting it into the constructor of your component.
The `IConfiguration` use requires you to know the configuration key to access the configuration value and cast it to the appropriate type. 
This approach is suitable for simple applications.
It also works great if you are migrating the ASP.NET Framework 4.x application to the .NET Core 8.
However, it is not ideal for complex applications as 
- It requires you to remember the configuration keys in specific convention to navigate the hierarchical nature of configuration.
- It is not strongly typed, thus makes refactoring difficult.
- It does not support control over reloading the configuration values at runtime.
- It requires `IConfiguration` to be injected everywhere even when the component does not require all the configuration values thus violates separation of concerns principle.

To overcome these challenges, the ASP.NET Core 8 introduced the Options Pattern that allows you to bind the configuration values to strongly typed objects.
The Options Pattern provides the following benefits:
- It allows you to bind the configuration values to strongly typed objects.
- It supports validation of configuration values, and does allow you to validate at startup.
- It supports reloading the configuration values at runtime via `IOptionsMonitor<T>` and `IOptionsSnapshot<T>`.
- It supports separating the configuration values into logical groups.
- It supports post-configuration via `IPostConfigureOptions<T>` that allows you to modify the options and load additional configuration values from other sources.
- It supports Named Options that allows you to register multiple instances of the same type and access using the Options Pattern.

Between the `IConfiguration` and the Options Pattern,
there is a third option that is custom-built and rather simple to implement.
I am calling it the KISS (Keep it Stupid Simple) principle for configuration.

I saved the best for the last, the ASP.NET Core 8 cares about your application security thus it provides a way to secure sensitive configuration values during development using the `dotnet user-secrets` tool.

### Defining Configuration in JSON File
The `appsettings.json` file is the default configuration file in ASP.NET Core 8 applications.
The default JSON file is a hierarchical format to represent complex data structure.
The configuration values are flattened so that you can access them using the key like a dictionary.

Let's define configuration for the two features your team is asked to implement in the application.

As a developer, you are asked to store the user registration data in a database. 
The first thing you will do is to define the database connection string in the `appsettings.json` file.

```json
{
  "ConnectionStrings": {
    "SqlDatabaseConnection": "DataSource=data/app.db;"
  }
}
```
The connection string can be accessed using the key `ConnectionStrings:SqlDatabaseConnection`.

And your fellow developer is asked to implement a user login with two-factor authentication support.
The user can receive the authentication code upon login via email or SMS based on the user's preference.

The application configuration will look like this:

```json
{
  "ConnectionStrings": {
    "SqlDatabaseConnection": "DataSource=data/app.db;"
  },
  "MessageDeliveryProviders": {
    "EmailProvider": {
      "Name": "SendGrid",
      "ApiKey": "SG.1234567890",
      "From": "support@adnanrafiq.com"
    },
    "SmsProvider": {
      "Name": "Twilio",
      "ApiKey": "AC.1234567890",
      "From": "980-000-0001"
    }
  }
}
```

The JSON file will be flattened to the following dictionary like structure.


| Key                                           | Value                   |
|-----------------------------------------------|-------------------------|
| ConnectionStrings                             |                         |
| ConnectionStrings:SqlDatabaseConnection       | DataSource=data/app.db; |
| MessageDeliveryProviders                      |                         |
| MessageDeliveryProviders:EmailProvider        |                         |
| MessageDeliveryProviders:EmailProvider:Name   | SendGrid                |
| MessageDeliveryProviders:EmailProvider:ApiKey | SG.1234567890           |
| MessageDeliveryProviders:EmailProvider:From   | support@adnanrafiq.com  |
| MessageDeliveryProviders:SmsProvider          |                         |
| MessageDeliveryProviders:SmsProvider:Name     | Twilio                  |
| MessageDeliveryProviders:SmsProvider:ApiKey   | AC.1234567890           |
| MessageDeliveryProviders:SmsProvider:From     | 980-000-0001            |


If you have written any ASP.NET Framework 4.x application,
you will find the colon `:` character familiar as the colon pattern was often used
to group the configuration values in the `web.config` file under `appSettings` section.

It is great in theory, but can I should you the debug view in the editor? Yes, watch the next lesson.

### Debug View of Flattened Configuration at Runtime

At startup in the `Program.cs` file, you can access the dictionary by accessing the builder's configuration property.

```csharp
var builder = WebApplication.CreateBuilder(args);
var configuration = builder.Configuration;
```

The `configuration` variable is of type `ConfigurationManager` that implements the `IConfiguration` interface among other interfaces
that supports accessing the values by the key.

The debug view of the configuration manager shows sections, and each section contains a path and a value.
There will be many unrelated sections in the debug view that do not map with `appsettings.json` file keys.
It is fine because by default, the configuration manager loads the configuration values from multiple sources, 
and by the end of this section you will understand that.

Let's take a look at the debug view of the configuration manager.



But how will you access the configuration values in your application? Watch the next lesson to find out.

### Accessing Configuration in ASP.NET Core 8

To access the configuration values in your application,
you will have to inject the `IConfiguration` interface into the constructor of your component or service.

But if you require the configuration value at startup, you can access it by accessing the builder's configuration property in the `Program.cs` file.

Let's first implement how to supply the connection string to the EF Core 8 `DbContext` at startup.

```csharp

var connectionString = builder.Configuration["ConnectionStrings:SqlDatabaseConnection"] ??
                       throw new InvalidOperationException("Connection string 'SqlDatabaseConnection' not found.");
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlite(connectionString));
```

But you do not like to use the colon `:` character to access the connection string. You can refactor to use the built-in `GetConnectionString` extension method.

### Accessing Configuration Values by Section and Extension Methods

```csharp
var connectionString = builder.Configuration.GetConnectionString("SqlDatabaseConnection") ??
                       throw new InvalidOperationException("Connection string 'SqlDatabaseConnection' not found.");
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlite(connectionString));
```

You must be curious to know how the `GetConnectionString` extension method is implemented. Let's take a look.

```csharp
public static string GetConnectionString(this IConfiguration configuration, string name)
{
    if (configuration == null)
    {
        throw new ArgumentNullException(nameof(configuration));
    }

    return configuration.GetSection("ConnectionStrings")[name];
}
```

You see that it first access the `ConnectionStrings` section
and then access the configuration value by the name of the connection string.
That way you do not have to use the colon convention if the section is at the root level.
The section only contains the key-value pairs under that section.

Now you know how to access the configuration values at startup
and make use of extension methods for a section so that you only specify the key name without the colon.

Now let's implement the SMS and Email providers in the `MessageDeliveryService` class.

```csharp
public interface IAuthenticationCodeDeliveryService
{
    Task SendAsync(string authenticationCode, string to);
}
public class EmailAuthenticationCodeDeliveryService : IAuthenticationCodeDeliveryService
{
    private readonly string _from;
    private readonly string _apiKey;
    private readonly string _emailSender;
    private readonly ILogger<EmailAuthenticationCodeDeliveryService> _logger;
    public EmailAuthenticationCodeDeliveryService(IConfiguration configuration, IEmailSender emailSender, ILogger<EmailAuthenticationCodeDeliveryService> logger)
   
    {
        _from = configuration["MessageDeliveryProviders:EmailProvider:From"];
        _apiKey = configuration["MessageDeliveryProviders:EmailProvider:ApiKey"];
    }

    public Task SendAsync(string authenticationCode, string to)
    {
        _logger.LogInformation("Sending authentication code {Code} to {To} via email.", code, to);
        return _emailSender.SendEmailAsync(_from, to, "Authentication Code", code);
    }
}
public class SmsAuthenticationCodeDeliveryService : IAuthenticationCodeDeliveryService
{
    private readonly string _from;
    private readonly string _apiKey;
    private readonly string _smsSender;
    private readonly ILogger<SmsAuthenticationCodeDeliveryService> _logger;
    public SmsAuthenticationCodeDeliveryService(IConfiguration configuration, ISmsSender smsSender, ILogger<SmsAuthenticationCodeDeliveryService> logger)
    {
        _from = configuration["MessageDeliveryProviders:SmsProvider:From"];
        _apiKey = configuration["MessageDeliveryProviders:SmsProvider:ApiKey"];
    }

    public Task SendAsync(string authenticationCode, string to)
    {
        _logger.LogInformation("Sending authentication code {Code} to {To} via SMS.", code, to);
        return _smsSender.SendSmsAsync(_from, to, code);
    }
}
```



## Feedback
I would love to hear your feedback, feel free to share it on [Twitter](https://twitter.com/madnan_rafiq). 

