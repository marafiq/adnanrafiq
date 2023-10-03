---
title: Options Pattern in ASP.NET 8 
description: Options Pattern in ASP.NET 8 
slug: options-pattern-dotnet 
authors: adnan 
tags: [C#, .NET8, ASP.NET8]
image : ./optionspatternperfresults.png
keywords: [Fundamentals, ASP.NET6]
draft: true
---
<head>

<meta property="og:image:width" content="1200"/>
<meta property="og:image:height" content="670"/>  
<meta name="twitter:creator" content="@madnan_rafiq" />
<meta name="twitter:title" content="Explore ASP NET 6 Fundamentals" />
<meta name="twitter:description" content="Exploring fundamentals of ASP.NET 6" />
</head>




# ASP.NET 8 Configurations

Do you love magic strings to get the configuration values?
No. Me neither.
It was a serious question except you are in JS/TS land.

> The amazing .NET supports strongly typed configurations. After all, it is a typed language.
 
Let me show you the complete usage of strongly typed configurations in ASP.NET 8.



<!--truncate-->




## Options Patterns for Strongly Typed Configuration Values

Do you love magic strings to get the configuration values?
No. Me neither.
It was a serious question except you are in JS/TS land.

> The amazing .NET supports strongly typed configurations. After all, it is a typed language.

The .NET8 offers three services to read the strongly typed configuration values, 
but each one is registered using different DI service lifetime (scope).
Why?
Total valid question.
But don't you want to know the names first?

1. `IOptions<T>` - Singleton 
2. `IOptionsSnapshot<T>` - Scoped
3. `IOptionsMonitor<T>` - Singleton

> Singleton options means that only one instance lives throughout the application lifetime. 
> One instance does mean that its values will never be changed.

> Scoped options means that one instance lives throughout the scope of the request.
> It will not change its values during the request.

Before I show you the above two quotes with code examples.

Will it be a bad idea to first learn how to register the options?
```json title="appsettings.json section for FileUploadLimits"
{
  "FileUploadLimits": {
    "MaxFileSize": 1048576,
    "MinFileSize": 98999,
    "AllowedFileExtensions": [
      ".jpg",
      ".jpeg",
      ".png"
    ]
  }
}
```
The service collection offers multiple extension methods to register the options. 
The highlighted line below will add the options of `FileUploadLimits` to the service collection that means
you can inject into your endpoint handlers, services, etc.

The `BindConfiguration` extension method binds the configuration values to `FileUploadLimits` object properties
by fetching the section of the `appsettings.json` with the same name as the class name.
 
```csharp title="Register the options - "
var builder = WebApplication.CreateBuilder(args);
//highlight-start
builder.Services.AddOptions<FileUploadLimits>()
    .BindConfiguration(nameof(FileUploadLimits));
//highlight-end
var app = builder.Build();
app.MapGet("/fileuploadlimits", (IOptions<FileUploadLimits> fileUploadLimits) => fileUploadLimits.Value)
app.Run();

public class FileUploadLimits
{
    public int MaxFileSize { get; set; }
    public int MinFileSize { get; set; }
    public string[] AllowedExtensions { get; set; } 
}

```

The code looks good, but it is still depended upon magic string.
What if `nameof(FileUploadLimits)` does not exist or exist with slightly different name.
Will the application throw an error?
No, it will not.
It will silently fail.
But then what is the point of strongly typed configurations? 

> There is a way. An elegant one.

Earlier,
we used the path overload
which does not validate for the existence of the configuration section in the `appsettings.json`.
It will automatically cover the case when your class name does not match configuration section name.
You will get an exception in the startup rather than when you actually try to use it.

```csharp title="Validate the existence of the configuration section"

services.AddOptions<FileUploadLimits>()
    .BindConfiguration(builder.Configuration.GetRequiredSection(nameof(FileUploadLimits)).Path);

```

Next question is how to validate the properties of the `FileUploadLimits` class.
The answer is to use the attribute classes found in `System.ComponentModel.DataAnnotations` namespace
and configure the `Options` registration to validate the data annotations.
Better if you enforce to throw error on the start of the server rather than later.

```csharp title="Validate the properties of the FileUploadLimits class"
var fileUploadLimitsSection = builder.Configuration.GetRequiredSection(nameof(FileUploadLimits));
services.AddOptions<FileUploadLimits>()
    .BindConfiguration(fileUploadLimitsSection.Path, bindOptions =>
    {
        bindOptions.ErrorOnUnknownConfiguration = true;
    })
    .ValidateDataAnnotations()
    .ValidateOnStart();
    
public class FileUploadLimits
{
    [Required, Range(98999,1048576)]
    public int MaxFileSize { get; set; }
    [Required, Range(0,98999)]
    public int MinFileSize { get; set; }
    [Required]
    public string[] AllowedFileExtensions { get; set; } 
}
```

What if there is no attribute class to validate the property?
You can use the `RegularExpression(@"any regular expression")` class.
But if you insist on using the custom validation logic, you can use the `Validate` method which accepts a delegate.
You can validate the property values like `.Validate(limits => limits.AllowedFileExtensions.Length>0)`.

> 🎉🎉🎉 You have covered a lot of ground.
> But you have a use case where you would like to load 
> the configuration values from the database based on the `appsettings.json` config value.

Are you thinking of any hacks? Well, no need to hack. The .NET got you covered.

You can use the `PostConfigure` method to load the configuration values from the database.

```csharp title="Load the configuration values from the database or any source"

var fileUploadLimitsSection = builder.Configuration.GetRequiredSection(nameof(FileUploadLimits));
services.AddOptions<FileUploadLimits>()
.BindConfiguration(fileUploadLimitsSection.Path, bindOptions => { bindOptions.ErrorOnUnknownConfiguration = true; })
.ValidateDataAnnotations()
.Validate(limits => limits.AllowedFileExtensions.Length > 0)
.ValidateOnStart()

//highlight-start
//Supports multiple overloads to inject specific dependencies
.PostConfigure<IServiceProvider>((limits, sp) =>
{
    //Do the processing work here
    var logger = sp.GetRequiredService<ILogger<FileUploadLimits>>();
    logger.LogInformation("After all the configuration the values are : {@Limits}", limits);

});
//highlight-end

```
> Did I forget about the promise to show the difference between scoped and singleton options? 
> Absolutely NO

## `IOptions<FileUploadLimits>`
If you are using `IOptions<FileUploadLimits>` `Singleton` service via DI Injection.
After running the application if you change the config values.
You will not see the changes
reflected in the injected `IOptions<FileUploadLimits>` instance anytime during the lifetime of the application.
**Except** if you have set the reloadOnChange to true.

## `IOptionsSnapshot<FileUploadLimits>`
If you are using `IOptionsSnapshot<FileUploadLimits>` `Scoped` service via DI Injection.
After running the application if you change the config values.
You will see the changed values for the new requests
which started after the change is detected.
Any previous requests will still get the old values.

## `IOptionsMonitor<FileUploadLimits>`
If you are using `IOptionsMonitor<FileUploadLimits>` `Singleton` service via DI Injection.
After running the application if you change the config values.
You will see the changed values everywhere in the application for inflight and new requests. 

## OnChange Validation Errors

The default behavior is to not throw an exception if the validation fails.
But if you have enabled it by using the following code.

```csharp title="Validate the properties of the FileUploadLimits class"

services.AddOptions<FileUploadLimits>()
    .BindConfiguration(fileUploadLimitsSection.Path, bindOptions =>
    {
        bindOptions.ErrorOnUnknownConfiguration = true;
    })
    .ValidateDataAnnotations()
    .ValidateOnStart();
```

What will be the behavior of `IOptionsMonitor<FileUploadLimits>`
and `IOptionsSnapshot<FileUploadLimits>` if the validation fails?

It will throw an exception when change is detected.
If that is the excepted behavior you were looking for, then you found it.

It tells you that changing values manually in the `appsettings.json` is not a good idea.
You should write a script to do it.

I personally have implemented a feature flag using the `IOptionsMonitor` service.
But it is bool and only flag in application.


## Performance of Options vs OptionsMonitor vs OptionsSnapshot

As you can see from the below image, the `OptionsSnapshotTrend` is slower than `OptionsMonitorTrend` and `OptionsTrend`.
It's the 10th of a millisecond difference, so it is not a big deal.
But the larger the file size, the more expensive it will be. 

<img src={require('./optionspatternperfresults.png').default} alt="Options Pattern Performance"/>

:::information

Avoid using `IOptionsSnapshot<FileUploadLimits>` because it can incur performance penalty.
Why?
It is calculating the hash of the configuration values on every request to detect the change which is expensive.
The larger the file size, the more expensive it will be.

:::

## Feedback
I would love to hear your feedback, feel free to share it on [Twitter](https://twitter.com/madnan_rafiq). 

