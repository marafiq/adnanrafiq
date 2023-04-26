---
title: Incrementally Introduce Dependency Injection in .NET Framework Web API
description: Legacy .NET Framework applications which do not use any DI framework are tightly coupled with implementation and often hard to refactor, but you can enable it incrementally using Autofac container
slug: incrementally-introduce-di-in-net-framework-webapi 
authors: adnan 
tags: [C#, ASP.NETFrameworkWebAPI]
image : ./JetBrainsSurvey.png
keywords: [DI,WebAPI,Autofac]
---
<head>

<meta property="og:image:width" content="1200"/>
<meta property="og:image:height" content="670"/>  
<meta name="twitter:creator" content="@madnan_rafiq" />
<meta name="twitter:title" content="Incrementally Introduce Dependency Injection in .NET Framework Web API" />
<meta name="twitter:description" content="Legacy .NET Framework applications which do not use any DI framework are tightly coupled with implementation and often hard to refactor, but you can enable it incrementally using Autofac container" />
</head>

<img src={require('./JetBrainsSurvey.png').default} alt="Start and Finish Image"/>

Image by [JetBrains Linkedin](https://www.linkedin.com/feed/update/urn:li:activity:7054415731601391616/)

The refactoring of legacy applications is the most valuable skill, you must continuously learn. The ASP.NET Framework 4.x applications are considered legacy, and the dependency injection was not part of the framework. 
In recent survey done by JetBrains on [Linkedin](https://www.linkedin.com/feed/update/urn:li:activity:7054415731601391616/), 46% developers voted the legacy applications as their biggest challenge.
In this blog post, you will learn how to incrementally enable DI in ASP.NET 4.8 Web Api application which does not use any sort of DI mechanism, not even poor man DI.   

<!--truncate-->

## What is Dependency Injection?

The dependency injection is a way to outsource the lifetime of objects to a dedicated object which knows how to create and dispose them. It enables the key benefits of 
- Unit Testing 
- Loose Coupling 

There are many open source DI frameworks which supports both .NET Framework and .NET Core. We will use Autofac to hook up DI in .NET Framework 4.8 Web Api. 

## How to enable DI in .NET Framework Web API?

A typical .NET Framework web api application have a controller, and `Global.asax` file. Let's have a look at a controller which does not use any DI.  


~~~csharp title=".NET Framework Web Api without DI"

public class NotificationController : ApiController
{
    private readonly IAuditService _auditService;
    
    public NotificationController()
    {
        // highlight-start
        //We are manually creating the `AuditService` Instance, and then it is creating new instance of CriticalLogger in its default constructor 
        _auditService = new AuditService();
        // highlight-end
    }
}

public class MvcApplication : System.Web.HttpApplication
{
    protected void Application_Start()
    {
        AreaRegistration.RegisterAllAreas();
        GlobalConfiguration.Configure(WebApiConfig.Register);
        FilterConfig.RegisterGlobalFilters(GlobalFilters.Filters);
        RouteConfig.RegisterRoutes(RouteTable.Routes);
        BundleConfig.RegisterBundles(BundleTable.Bundles);
    }
}

public interface IAuditService
{
    Task Audit(AuditEvent auditEvent);
}

public class AuditService : IAuditService
{
    private readonly ICriticalLogger _logger;
    public AuditService()
    {
        _logger = new CriticalLogger();
    }
    public Task Audit(AuditEvent auditEvent)
    {
        return Task.CompletedTask;
    }
}

~~~

### Enable DI using Autofac

Install the following NuGet packages:

- Autofac
- Autofac.Extensions.DependencyInjection
- Autofac.Extras.CommonServiceLocator
- Autofac.WebApi2
- CommonServiceLocator
- Microsoft.Extensions.DependencyInjection
- Microsoft.Extensions.DependencyInjection.Abstractions

After installing all the packages, you will need to configure the Autofac DI in the `App_Start` event inside `Global.asax.cs`. 
In the below example, you will notice that I have removed the default constructors after hooking up the Autofac dependency resolver, 
which will inject the dependencies of the controller when creating the instance of controller.

~~~csharp title=".NET Framework Web Api with Autofac DI"

public class NotificationController : ApiController
{
    private readonly IAuditService _auditService;
    
    public NotificationController(IAuditService auditService)
    {
        // highlight-start
        //IAuditService is injected by Autofac DI Container 
        _auditService = auditService
        // highlight-end
    }
}

public class MvcApplication : System.Web.HttpApplication
{
    protected void Application_Start()
    {
        // highlight-start
        ConfigureAutofacDI();
        // highlight-end
        AreaRegistration.RegisterAllAreas();
        GlobalConfiguration.Configure(WebApiConfig.Register);
        FilterConfig.RegisterGlobalFilters(GlobalFilters.Filters);
        RouteConfig.RegisterRoutes(RouteTable.Routes);
        BundleConfig.RegisterBundles(BundleTable.Bundles);
    }
    public static void ConfigureAutofacDI()
    {
        var factory = new AutofacServiceProviderFactory();

        var services = new ServiceCollection();

        AddApplicationServices(services);

        var builder = factory.CreateBuilder(services);
        var serviceProvider = factory.CreateServiceProvider(builder);
        // highlight-start
        var serviceLocator = new AutofacServiceLocator(serviceProvider.GetAutofacRoot());
        ServiceLocator.SetLocatorProvider(() => serviceLocator);
        // highlight-end
        
        GlobalConfiguration.Configuration.DependencyResolver =
            new AutofacWebApiDependencyResolver(serviceProvider.GetAutofacRoot());
    }
    private static ServiceCollection AddApplicationServices(ServiceCollection services)
    {
        services.AddTransient<IAuditService,AuditService>()
        .AddTransient<ICriticalLogger,CriticalLogger>();
    }
}

public interface IAuditService
{
    Task Audit(AuditEvent auditEvent);
}

public class AuditService : IAuditService
{
    private readonly ICriticalLogger _logger;
    public AuditService(ICriticalLogger logger)
    {
        _logger = logger;
    }
    public Task Audit(AuditEvent auditEvent)
    {
        return Task.CompletedTask;
    }
}

~~~

### Incremental migration to DI

When you have a lot of controllers with many dependencies and long tree of dependencies, and it is not possible or feasible to register and inject services via Autofac resolver, you can use the `ServiceLocator` pattern until the whole tree of services is not registered.
The ServiceLocator is considered antipattern but in some scenarios it can be good trade off to slowing progress towards your goal. If that is the case, then instead of manually creating the instance using `new` keyword inside the default constructor, 
you can use the ServiceLocator to get the instance of required service like `ServiceLocator.Current.GetInstance<IAuditService>()`.

~~~csharp title=".NET Framework Web Api with ServiceLocator"
public class NotificationController : ApiController
{
    private readonly IAuditService _auditService;
    
    public NotificationController()
    {
        // highlight-start
        //IAuditService is injected by Autofac DI Container 
        _auditService = ServiceLocator.Current.GetInstance<IAuditService>()
        // highlight-end
    }
}
~~~

### Scoped DB Context Use Case
:::tip
One concrete example of incrementally migrating towards DI is using scoped EF Core DbContext. Once you hook up the Autofac DI resolver, you can register the `DbContext` using `services.AddDbContext<OutboxDbContext>()` and then resolve it using Service Locator pattern. 
With this approach, you would not have to manage the lifecycle of `DbContext` and all your existing code which is using manual lifetime management is still working.
:::

## Feedback
I would love to hear your feedback, feel free to share it on [Twitter](https://twitter.com/madnan_rafiq). 

