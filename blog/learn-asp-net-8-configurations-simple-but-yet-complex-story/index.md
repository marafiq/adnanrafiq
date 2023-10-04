---
title: ASP.NET 8 Configurations Simple but YET Complex Story
description: What you think when the word Host comes to your mind? A fictional story about the ASP.NET 8 Host and its configurations. You will learn it all. 
slug: learn-asp-net-8-configurations-simple-but-yet-complex-story 
authors: adnan 
tags: [C#, .NET8, ASP.NET8]
image : ./ASPNETCONFIGBANNER.jpeg
keywords: [Fundamentals, ASP.NET8,Configurations,CustomConfigurationSource,reloadOnChangeConfigs]
draft: true
---
<head>

<meta property="og:image:width" content="1200"/>
<meta property="og:image:height" content="670"/>  
<meta name="twitter:creator" content="@madnan_rafiq" />
<meta name="twitter:title" content="ASP.NET 8 Configurations Simple but YET Complex Story" />
<meta name="twitter:description" content="What you think when the word Host comes to your mind? A fictional story about the ASP.NET 8 Host and its configurations. You will learn it all." />
</head>

<img src={require('./ASPNETCONFIGBANNER.jpeg').default} alt="ASP.NET 8 Configurations Simple but YET Complex Story Image"/>


# ASP.NET 8 Configurations

## The Host

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

## Reasonable Host Configuration

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



## Reasoning the App Configuration

If I tell you the list of defaults, it will be another list of things to memorize, so let's reason about it instead.

You woke up feeling fresh and energized on a pleasant morning of mildly cold October morning.
You are ready for the new challenge.
Your manager, brilliant Carrie, requests for a quick meeting and sounds very exciting.
She starts by saying; finally, I found a task for you which will you are going to love.

> Story: As a developer, I would like to adjust my application behavior based on the configuration. 
> It should cover all the common ways developers configure their application.

Heck yes. You are excited and thinking that you are going to avenge all the .NET Framework 4.x miseries.


You begin asking yourself, what are the most common ways developers configure their application? 

The answer you came up with:

- CLI Arguments such as `dotnet run` accepts arguments.
- Environment Variables such as setting the TLS certificate path.
- Configuration Files such as XML, JSON, INI etc

David, the top nerd in his 40s with keen interest in security, heard about your excitement and offered to pair with you. 

David confirms that you are on the right track with the above three most common ways.
And spoke about how once he committed his Azure Storage Credentials to the git repository.
And how his knowledge of using shell scripts was handy to revoke it quickly before it could cause harm. 

He slowly said, it is a common occurrence. 

You nodded and came up with a simple solution.

How about if the .NET can read the configs which do not reside inside the git repository? 

David said, oh, that's simple.
I like it. 
But how will it work in the CI pipeline which does not have access to your local files.

You; We can only enable it when the application environment is Development.

David; That's a good trade off.

> That's how `dotnet user-secrets` is born.
> It stops accidental leakage of your secrets. Be warned, it is still plain JSON strings and is not encrypted.

But Vault Vaults, such as Azure Vault Storage, HashiCorp Vault, etc. Zero trust is the way to go. David said. 

You, I agree.
But it makes the initial developer experience complicated.
But I would expose extension points to integrate with Vault or any custom configuration provider.

David, I love it. You are moving fast.

You, having a multiple source of configurations brings complexity,
especially when the same key is present in multiple sources.
But I believe letting **the last config source wins** will be well understood and will not bring confusion.

David, Yes.
I agree.
But it must be noted in the documentation.
And asked, have you thought about the order of the configuration sources?

After a brief pause, you said that it will be best if we keep the order consistent with developer flow.

A developer flow after creating the application using `dotnet new webapi` is:

1. `appsettings.json` - The default template creates it, and name clearly conveys it. 
2. `appsettings.{EnvName}.json` file, Development one is crated, again name screams. 
3. `user-secrets.json` in `Development` environment is enabled by default. But you need to learn how to use it.
4. `Environment Variables` because that's how you configure the application in the CI pipeline or other environments.
5. `CLI Arguments` because that's when you actually run the application. `dotnet run` is usually last line in docker file.

**Remember, The last configuration source wins.** If the same key is present in multiple sources.

This is the **default behavior** of `WebApplication.CreateBuilder(args)`.

David asked, did you forget about the vaults?

You, No. Vault is not part of the default configuration sources.
But it is like any other custom configuration source.
You can add it to the list of configuration sources at any specific position
by using `ConfigurationManager.Sources.Insert(index, new VaultConfigurationSource());` or to the end `ConfigurationManager.Sources.Add(new VaultConfigurationSource());`.

_The Diagram is below._

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

Bingo! David said with fire emoji 🔥. Carrie heard about the progress and said, I am proud of you both. Great work 🙏.

You, talking to yourself.
How do I implement? 

Since the configurations will be read from multiple sources.
It would make sense to have a single interface to build the configuration values list. 

You came up with the `IConfigurationSource` interface
which has a single method `IConfigurationProvider Build(IConfigurationBuilder builder);`.

The `ConfigurationManager` exposes the `Sources` property
as it implements `IConfigurationManager` which is a mutable list of `IConfigurationSource`. 

The `IConfigurationSource` `Build` method returns `IConfigurationProvider`
that have methods to `Load` the configuration from the source and few other responsibilities.

You decided to implement the `IConfigurationProvider` interface on the abstract class
`ConfigurationProvider` which abstracts the storage of key-value pairs in a dictionary. 
Because this way, you can extend it to implement the custom configuration provider like `JsonConfigurationProvider`,
`IniConfigurationProvider`, `XmlConfigurationProvider` etc.

The flow looks like this:

- Implement `IConfigurationSource` interface on your custom configuration source class, say `TextFileConfigurationSource`.
- Implement `ConfigurationProvider` abstract class on your custom configuration provider class, say `TextFileConfigurationProvider`.
- Extend the `TextFileConfigurationProvider` class from the `FileConfigurationProvider` class which is the child of `ConfigurationProvider`.
- Write the logic on how to read the configuration from the text file in the `Load` method of the `TextFileConfigurationProvider` class.
- Parse the text file and add the key-value pairs to the `Data` property of the `ConfigurationProvider` class.
- Add the configuration source to the `ConfigurationManager` using `ConfigurationManager.Sources.Add(new TextFileConfigurationSource());`.

You got yourself a custom configuration source.
But I encourage you to implement one basic configuration source.
I left out the details about the path of the file which is better learned doing the practice.

You made David implement the text file configuration source.
He was happy about the outcome.
Find the implementation in the Custom Configuration Source section.

:::tip

If you feel annoyed by the default configurations and their orders.
You should try `WebApplication.CreateEmptyBuilder(new WebApplicationOptions());`.
But if you are tiny bit annoyed then try `WebApplication.CreateSlimBuilder(args)`.

:::

## Complicated Over-Architecture of Configs?
You might be thinking that it is too complicated.
One has to remember all the different configuration providers and their orders.
And many people argue who reloads the configuration when the file changes.

This is cost of flexibility.
But if you would like to adapt an approach to configure the defaults for your team or yourself.

> BYOC - Bring Your Own Configurations

You have options:

1. Use the `WebApplication.CreateEmptyBuilder(new() { Args = args });` and configure the defaults in the `Program.cs` file.
2. Use the more minimal `WebApplication.CreateSlimBuilder(args)` and override the defaults in the `Program.cs` file.
3. Clear the configuration sources list and add your own in whatever order you prefer. 

```csharp title="Clear the configuration sources list and add your own"
    // you are overriding the defaults
    configuration.Sources.Clear(); 
    configuration.AddIniFile("appsettings.ini", optional: false, reloadOnChange: false);
```

## Custom Configuration Source — BYOC Way

The `ConfigurationManager` class depends
on `IConfigurationBuilder` to build the configurations from the list of sources.

When extending the framework, at first, I always think it must be complicated. What about you?

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
        // Ideally, it should be needed but here we are
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
    builder.Configuration.AddTextFile("keyvaluepairs.txt", optional: true, reloadOnChange: true);
```
## Launch Settings JSON
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

## Enable Intellisense for `appsettings.json`

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
`:` is the path separator to reach the nesting level from the root.
:::

## What is this `reloadOnChange`?

It is a boolean flag that tells the `ConfigurationManager` to reload the configuration
when the file changes.
If you change the file by running a script or manually, the `ConfigurationManager` will reload the configuration.
It can be handy if you would like to flip a feature flag or change the log level without restarting the application.

I agree with you that it adds complexity, but we both can ignore it because it has default value of false.

> **Analogy:** Pre-digital era, most households only had one TV and you would prepare for exams by reading the actual books.
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

But why am I untyped magic strings?

I would like to have strongly typed configuration values.
How?
When you are back from the party break, you will learn about `IOptions<T> `pattern in the next blog post.
It has `reloadOnChange` magic on steroids.
But it gives you a lot of options.
How about giving me a shout-out, so I can finish the draft?

## Feedback
I would love to hear your feedback, feel free to share it on [Twitter](https://twitter.com/madnan_rafiq). 

