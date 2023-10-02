---
title: Explore ASP NET 6 Fundamentals 
description: Exploring fundamentals of ASP.NET 6 
slug: explore-asp-net6-fundamentals 
authors: adnan 
tags: [C#, .NET8, ASP.NET8]
image : ./startandfinish.jpg
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

<img src={require('./startandfinish.jpg').default} alt="Start and Finish Image"/>

Image by [awcreativeut](https://unsplash.com/@awcreativeut)

# ASP.NET 8 Configurations

**What comes to your mind when you think about the word Host?**

A Host takes care of you.
Remember, the last time you visited your Aunt’s home, the food, the movies, and everything they made possible for you.

But we are talking about the .NET, a cross-platform framework.
What possible relevance does it have with Aunt’s home visit?

Well, the .NET Host takes care of your application by providing out-of-the-box features such as:

- Configuration
- Logging
- Dependency Injection

and many more. 

<!--truncate-->


~~~csharp title="Web Application Host in ASP.NET 8"
    var builder = WebApplication.CreateBuilder(args);  
    
    var app = builder.Build();

    app.Run();
~~~

The `WebApplication.CreateBuilder(args);` configures the host for your web application with _reasonable defaults_.
But does this mean you cannot customize the host configurations?


> You can! 🎉🎉🎉 But how? 🤔 Before you learn about the customizations, would it be a bad idea to learn about reasonable defaults?

## Reasonable Host Configuration Defaults

Every house has an address, right? Yes, the owner has a name.

Similarly, the ASP.NET Host allows you to configure its name, address, and a few other settings.
It allows you to do it in multiple ways.
The code snippet below shows how you can change a few of those.

```csharp title="Use WebApplicationOptions overload to customize"

var builder = WebApplication.CreateBuilder(new WebApplicationOptions()
{
    Args = args, // This is the same args which you pass to the CreateBuilder method. It will respect the command line arguments.
    ApplicationName = "MottoBits.Api", // It defaults to the assembly name.
    ContentRootPath = Directory.GetCurrentDirectory(), // default:This paths is used to read your appsettings.json
    WebRootPath = "wwwroot" // This path is used to serve static files, not relevant for APIs
});

```

Do you know that you can bring the web application host to life by running dotnet run command?

Yes, I knew that. And also you can pass CLI arguments to change the behavior of the Host.

`dotnet run --project ./MottoBits.Api.csproj --environment Production --urls "http://localhost:8080;https://localhost:4434"`

The `WebApplication.CreateBuilder(args);` method takes an optional parameter of type
`string[]` which is named `args` and the values are passed from the command line using `--` prefix.

> Success 🎉🎉🎉 But do not forget to check logs. 🤔

You must be wondering if the Host configurations can be changed using environment variables.
The answer is YES.
In fact, you can change the Host behavior by passing environment variables with two different prefixes which are:
- DOTNET_
- ASPNETCORE_

Why two different prefixes.
The DOTNET_ prefixed environment variables may change the behavior other than the Host such as runtime.

What happens if multiple configuration sources have the same key.
**The rule is the last one wins.**
For the Host configurations, below is the order:

1. ASPNETCORE_ prefixed environment variables.
2. DOTNET_ prefixed environment variables.
3. CLI Arguments. The last one wins because it provides you the last chance you can change configurations.

### Launch Settings JSON
When you create a new API project using `dotnet new webapi`, it creates a file named `launchSettings.json` in the `Properties` folder.
The `launchSettings.json` file contains the configurations for the launch profiles.
Your editor uses these configurations to launch the application, and it is how it knows which Uri's to use.

```json title="launchSettings.json"
{
  "profiles": {
    "MottoBits.Api": {
      "commandName": "Project",
      "dotnetRunMessages": "true",
      "launchBrowser": true,
      "applicationUrl": "https://localhost:5001;http://localhost:5000",
      "environmentVariables": {
        "ASPNETCORE_ENVIRONMENT": "Development"
      }
    }
  }
}
```

The editor passes the environment and application url values to dotnet run command.

You can see the full schema of launchSettings.json [here](https://raw.githubusercontent.com/SchemaStore/schemastore/master/src/schemas/json/launchsettings.json)
to enable intellisense in your editor.

> 🎓🎓 You learned about the Host configurations and how to change them. 🎓🎓

## Reasonable Application Configuration Defaults

If I tell you the list of defaults, it will be another list of things to memorize, so let's reason about it.

Imagine, you are tasked to build a Host which supports:

> Story: As a developer, I would like to adjust my application behavior based on the configuration.

You begin asking yourself, what are the most common ways developers configure their application? 
The answer you came up with:

- CLI Arguments such as `dotnet run` accepts arguments.
- Environment Variables such as setting the path of Node.js
- Configuration Files such as XML, JSON, INI etc

You decided to pair with a team member Jon about the story who also has a keen interest in security.

He confirms that the above three most common ways.
But point out that there have been many instances of security breaches
simply because someone accidentally committed the application secrets to git repository. 

You suggested implementing a way to keep the secrets outside the git repository but still able
to read these configurations in your application.
Jon said great, but how will it work in the CI pipeline which does not have access to your local files.
After a few moments,
you both decided that it will be good trade off that if it only works when the application environment is Development.

That's how `dotnet user-secrets` is born.
It stops accidental leakage of your secrets.
Be warned, it is still plain JSON strings and is not encrypted.

Vault Vaults, such as Azure Vault Storage, HashiCorp Vault, etc. Zero trust is the way to go. 

Before, you learn about how to integrate or implement custom configuration services.
You said wait, what about if the same key is present in both environment variables and JSON settings file.
And Jon said, well easy the configuration which is read in the last wins.
But you said, what will be the order of these configuration sources i.e., environment variables, JSON settings file.
After a brief pause, you said that it will be best if we keep the order consistent with developer flow.

You concluded that a developer flow looks like this:

1. Create configuration settings in `appsettings.json`. 
2. Different environments like Staging, Production might have different settings thus `appsettings.{EnvName}.json`
3. Oh, few of those are secrets thus `user-secrets.json` in `Development` environment.
4. Environment Variables for some.
5. Lastly, CLI Arguments because that's when you actually run the application.

The last configuration source wins. And this is the **default behavior** of `WebApplication.CreateBuilder(args)`.

```mermaid title="ASP.NET Core 8.0 Web Application Builder Configuration Flowchart"
flowchart LR
    A[WebApplicationBuilder Initializer] 
    A --> B[Appsettings.json]
    B --> C["Appsettings.{Environment}.json"]
    C --> D{Environment is Development?}
    D --> |Yes| E[User secrets]
    D --> |No| F[Environment variables]
    E --> F
    F --> G[Command-line arguments]
    G --> H["Configuration Ready after builder.Build()"]
```

But You use `Vault` in production. _You will have to manually configure it._ How? We will explore it in another post.

You were implementing the story below,
but I do not see any architecture neither any direction on how to implement a custom configuration source. 

> Story: As a developer, I would like to adjust my application behavior based on the configuration.

Since we are reading the configuration from multiple sources.
Having an interface which reads the configuration from a single source would make sense. 

Bingo! 🔥

The .NET team provides you the `IConfigurationSource` interface
which has a single method `IConfigurationProvider Build(IConfigurationBuilder builder);`
and `ConfigurationManager` exposes the `Sources` property which is a mutable list of `IConfigurationSource`.

Once you implemented `IConfigurationSource` on your custom configuration source class say TextFileConfigurationSource.
You can add it to the configuration sources list using `ConfigurationManager.Sources.Add(new TextFileConfigurationSource());`
and you will be able to read the configuration from the text file.

The `IConfigurationSource` `Build` method returns `IConfigurationProvider`
that have methods to load the configuration from the source and reload it and others.
But you can take advantage of `ConfigurationProvider` abstract class,
and you will only have to implement `Load` method.
In the `Load` method you can parse the text file
and add the key-value pairs to the `Data` property of the `ConfigurationProvider` class.

> 🎓🎓 You learned about the application configurations. 🎓🎓

:::tip

If you feel annoyed by the default configurations and their orders.
You should try `WebApplication.CreateEmptyBuilder(new WebApplicationOptions());`.
But if you are tiny bit annoyed then try `WebApplication.CreateSlimBuilder(args)`.

:::

The full schema for the `appsettings.json` is [here](https://raw.githubusercontent.com/SchemaStore/schemastore/master/src/schemas/json/appsettings.json).
You can configure your editor to use it for intellisense.

## Change `appsettings.json` values via environment variables

You have the following application settings in your `appsettings.json`.

```json title="appsettings.json"
{
  "FileUploadLimits": {
    "MaxFileSize": 1048576,
    "MinFileSize": 98999
  }
  
}
```

But you would like to change it via environment variables.
You can do it by setting the environment variable with the same name as the configuration key.

```bash title="Environment Variables"

export FileUploadLimits__MaxFileSize=2097152
epxort FileUploadLimits__MinFileSize=199999

```

:::important
Notice the `__` double underscores in the environment variable name.
It is needed because the .NET builds the configuration keys into a flat list of key-value pairs.
As you know in JSON you can have nested key-value pairs.
:::

## Change `appsettings.json` values via CLI Arguments

You have the following application settings in your `appsettings.json`.

```json title="appsettings.json"
{
  "FileUploadLimits": {
    "MaxFileSize": 1048576,
    "MinFileSize": 98999
  }
  
}
```

But you would like to change it via CLI arguments.

You can do it with `dotnet run` command.

```bash title="CLI Arguments"
dotnet run --FileUploadLimits:MaxFileSize=2097152 --FileUploadLimits:MinFileSize=199999
```

:::important
Notice the `:` colon in argument name.
It is needed because the .NET builds the configuration keys into a flat list of key-value pairs.
As you know in JSON, you can have nested key-value pairs.
:::

## Why is it so complicated, and you are a fan of BYO?

You might be thinking that it is too complicated.
One has to remember all the different configuration providers and their orders.

This is cost of flexibility. But if you would like to adapt an approach to configure the defaults for your team.

You have options:

1. Use the `WebApplication.CreateEmptyBuilder(new() { Args = args });` and configure the defaults in the `Program.cs` file.
2. Use the `WebApplication.CreateSlimBuilder(args)` and configure the defaults in the `Program.cs` file.
3. Clear the configuration sources list and add your own. 

```csharp title="Clear the configuration sources list and add your own"
    configuration.Sources.Clear(); 
    configuration.AddIniFile("appsettings.ini", optional: true, reloadOnChange: true);
```

## Architecture of ASP.NET 8 Configurations

The `ConfigurationManager` class depends
on `IConfigurationBuilder` to build the configurations from the list of sources.

When extending the framework, at first I often think it must be complicated. What about you?

You will implement a custom text file configuration source in 3 steps:

1. Implement `IConfigurationSource` interface.
2. Implement `ConfigurationProvider` abstract class.
3. Implement extension method to add the configuration source to the `ConfigurationManager`.

```csharp title="Custom Text File Configuration Source"
namespace MottoBits.Api;
// ********* Step 1 ************
public class TextFileConfigurationSource : FileConfigurationSource, IConfigurationSource
{
    public override IConfigurationProvider Build(IConfigurationBuilder builder)
    {
        return new TextFileConfigurationProvider(this);
    }
}
// ********* Step 2 ************
public class TextFileConfigurationProvider : FileConfigurationProvider
{
    public TextFileConfigurationProvider(FileConfigurationSource source) : base(source)
    {
        // This is needed to resolve the file path relative to the base directory.
        Source.FileProvider = new PhysicalFileProvider(AppContext.BaseDirectory ?? string.Empty);
    }

    public override void Load(Stream stream)
    {
        using var reader = new StreamReader(stream);
        var fileContent = reader.ReadToEnd();
        var lines = fileContent.Split(Environment.NewLine);

        var keyValuePairs = lines.Select(line => line.Split('='));
        foreach (var keyValuePair in keyValuePairs)
        {
            Data.Add(keyValuePair[0], keyValuePair[1]);
        }
    }
}
// ********* Step 3 ************
public static class TextFileConfigurationExtensions
{
    public static IConfigurationBuilder AddTextFile(this IConfigurationBuilder builder, string path, bool optional, bool reloadOnChange)
    {
        return builder.AddTextFile(s =>
        {
            s.FileProvider = null;
            s.Path = path;
            s.Optional = optional;
            s.ReloadOnChange = reloadOnChange;
            s.ResolveFileProvider();
        });
    }

    private static IConfigurationBuilder AddTextFile(this IConfigurationBuilder builder, Action<TextFileConfigurationSource> configureSource)
    {
        return builder.Add(configureSource);
    }
}

```

I lied, you have to do one more thing.

Set the properties of your file to copy to output directory.

```xml title="csproj"

<ItemGroup>
  <Content Include="keyvaluepairs.txt">
    <CopyToOutputDirectory>Always</CopyToOutputDirectory>
  </Content>
</ItemGroup>

```

Did it work? NO, more lies. You have to add the configuration source to the `ConfigurationManager`.


```csharp title="Add the text file configuration source to the ConfigurationManager"
    builder.Configuration.AddTextFile("keyvaluepairs.txt", optional: false, reloadOnChange: true);
```

What is this `reloadOnChange`?
It is a boolean flag that tells the `ConfigurationManager` to reload the configuration
when the file changes.
If you change the file by running a script or manually, the `ConfigurationManager` will reload the configuration.
It can be handy if you would like to flip a feature flag or change the log level without restarting the application.

I agree with you that it adds complexity, but we both ignore it because it has default value of false.

> Pre-digital era, most households only had one TV and you would prepare for exams by reading the actual books.
> Now imagine, your favorite team is playing the final match of the world cup, and you are preparing for the exams.
> You would request your siblings to shout when your favorite player is batting or your team got a wicket.
> **The shout part is like the reloadOnChange flag.**

You are ready for a break.
🎉🎉🎉.

But before you go.
You should know that.
You can inject `IConfiguration` in your application and read the configuration values like below.

```csharp title="Read the configuration values"
    
    var configuration = builder.Configuration;
    // : reprsents the nested level of the key.
    var maxFileSize = configuration.GetValue<int>("FileUploadLimits:MaxFileSize");
    var minFileSize = configuration.GetValue<int>("FileUploadLimits:MinFileSize");
```

> But it is untyped magic strings.
I would like to have strongly typed configuration values.
How? 
When you are back from the party break, you will learn about **`IOptions<T>` pattern**.





## Environments
## Configuration and Options
## Configure Logging and Exception Handling 
### Using Serilog
### Override Microsoft Logs Level
### Startup Exception Handling 
### Unhandled Exceptions Logs
### Mask Sensitive Data and Personal Identifiable Information (PII) in Logs  
## Configure EFCore Database Options
## Configure Redis
## Authorization Requirements and Handlers
## MVC Action Filters
## Dependency Injection
## Middleware
## Routing
## Performance Monitoring
## API Conventions 
## Health Checks
### OpsGenie Integration
## Vault Configuration
## Security Headers

## Feedback
I would love to hear your feedback, feel free to share it on [Twitter](https://twitter.com/madnan_rafiq). 

