---
title: Validate Complex Types On Startup in .NET 8  
description: Learn how to validate complex types, arrays on startup in .NET 8.
slug: validation-options-of-type-array-in-net8
authors: adnan 
tags: [C#, .NET8, ASP.NET8,HostedServices]
image : ./validationonstartup.jpeg
keywords: [Fundamentals, ASP.NET8,OptionsPattern,Configuration,ValidateOptionsOnStartup,AOT]
---
<head>

<meta property="og:image:width" content="1200"/>
<meta property="og:image:height" content="500"/>  
<meta name="twitter:creator" content="@madnan_rafiq" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="Validate Complex Types On Startup in .NET 8 " />
<meta name="twitter:description" content="Learn how to validate complex types, arrays on startup in .NET 8." />
</head>

<img src={require('./validationonstartup.jpeg').default} alt="Validate Options on Startup"/>


# Validate `Options<T>` on Startup in .NET 8

The .NET 8 Host Builder allows you
to bind configuration with C# objects by using `AddOptions<T>` and binding to the configuration.

It provides you an opportunity to validate the configuration values when the host (WebApplication or Hosted Server) 
is starting by using `ValidateOnStart`.

But there are two interesting aspects of it, which I will explain in this post. 

<!--truncate-->


## Validate Complex Types

Let's say you have a configuration like this:

```json title="appsettings.json"
{
  "Cities": [
    {
      "Name": "London",
      "WeatherMood": "Sunny"
    },
    {
      "Name": "Paris",
      "WeatherMood": "Rainy"
    },
    {
      "Name": "New York",
      "WeatherMood": "Cloudy"
    }
  ]
}
```

You can bind it to a C# object like this:

```csharp title="Startup.cs"
var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOptions<List<City>>()
    .Bind(builder.Configuration.GetSection("Cities"))
    .ValidateDataAnnotations()
    .ValidateOnStart();
var app = builder.Build();
app.UseWelcomePage();
app.Run();

public class City
{
    [Required] public string Name { get; set; }
    [Required] public WeatherMood WeatherMood { get; set; }
}
public enum WeatherMood {
    Sunny,
    Rainy,
    Cloudy
}
```

So far, so good. But what if you add weather mood as `Snowy` in the configuration file. Will the application run?

```json title="appsettings.json"
{
  "Cities": [
    {
      "Name": "London",
      "WeatherMood": "Snowy"
    },
    {
      "Name": "Paris",
      "WeatherMood": "Rainy"
    },
    {
      "Name": "New York",
      "WeatherMood": "Cloudy"
    }
  ]
}
```

Yes, but it will only have two cities in the list. 
The third city is **ignored** because the weather 
mood Snowy does not have a value in `WeatherMood` enum.

Key is it is silently ignored, which can lead to a nasty bug because the item inside the array is ignored.

### What is the fix number 1 with added perf?

You can fix it by adding the below flag in `.csproj` file.

```xml title=".csproj with AOT - Next Big Thing"
<PropertyGroup>
    <EnableConfigurationBindingGenerator>true</EnableConfigurationBindingGenerator>
</PropertyGroup>
```
It will add a source generator to your project to bind the configuration to the C# object.

Now it will throw an exception on startup.
But also improves your startup time by generating the code at compile time 
and a good practice if you would like to use AOT compilation in the future.

### What is the fix number 2?

You can configure how the binding should behave by using `BinderOptions` 
and set the `ErrorOnUnknownConfiguration` to `true`.

```csharp title="Throw on unknown configuration"
var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOptions<List<City>>()
    .Bind(builder.Configuration.GetSection("Cities"),
    //highlight-start
    ,options =>
    {
        //Bind non public properties - do not do it without a fantastic reason
        //options.BindNonPublicProperties = true;
        options.ErrorOnUnknownConfiguration = true;
    })
    //highlight-end
    .ValidateDataAnnotations()
    .ValidateOnStart();
    
var app = builder.Build();
app.UseWelcomePage();
app.Run();

public class City
{
    [Required] public string Name { get; set; }
    [Required] public WeatherMood WeatherMood { get; set; }
}
public enum WeatherMood {
    Sunny,
    Rainy,
    Cloudy
}
```


## Feedback
I would love to hear your feedback, feel free to share it on [Twitter](https://twitter.com/madnan_rafiq). 

