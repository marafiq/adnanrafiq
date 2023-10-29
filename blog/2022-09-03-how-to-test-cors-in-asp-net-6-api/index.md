---
title: How to test cors in ASP.NET6 API 
description: Test the CORS headers using xUnit in .NET6 API  
slug: how-to-test-cors-in-asp-net-6-api 
authors: adnan 
tags: [C#, .NET6, ASP.NET6]
image : ./startandfinish.jpg
keywords: [Fundamentals, ASP.NET6,Testing]
---
<head>

<meta property="og:image:width" content="1200"/>
<meta property="og:image:height" content="670"/>  
<meta name="twitter:creator" content="@madnan_rafiq" />
<meta name="twitter:title" content="How to test cors in ASP.NET6 API" />
<meta name="twitter:description" content="Test the CORS headers using xUnit in .NET6 API" />
</head>

<img src={require('./startandfinish.jpg').default} alt="Start and Finish Image"/>

Image by [awcreativeut](https://unsplash.com/@awcreativeut)

CORS are best described on [MDN](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS) 
> Cross-Origin Resource Sharing (CORS) is an HTTP-header based mechanism that allows a server to indicate any origins (domain, scheme, or port) other than its own from which a browser should permit loading resources. CORS also relies on a mechanism by which browsers make a "preflight" request to the server hosting the cross-origin resource, in order to check that the server will permit the actual request. In that preflight, the browser sends headers that indicate the HTTP method and headers that will be used in the actual request.

## How to configure CORS in .NET6 API?
CORS in .NET6 API can be configured using CORS policies. 

<!--truncate-->


~~~csharp title="Configure CORS Policy Sample"
var builder = WebApplication.CreateBuilder(args);
builder.Services.AddCors(options =>
    {
        options.AddPolicy(CorsPolicyNames.ApiCorsPolicyName, policyBuilder =>
        {
            if (builder.Environment.IsDevelopment())
                policyBuilder.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader();
            else
                policyBuilder.WithOrigins("https://google.com")
                    .AllowAnyMethod().AllowAnyHeader();
        });
    });
    
builder.Services.AddRouting();    
builder.Services.AddControllers();  
var app = builder.Build();
app.UseForwardedHeaders();
app.UseHttpsRedirection();

app.UseRouting();
app.UseCors(CorsPolicyNames.ApiCorsPolicyName);//This must come in between these middlewares.
app.UseAuthorization();  

app.UseEndpoints(routeBuilder =>
    {
        routeBuilder.MapControllers();
        routeBuilder.MapPut("/cors", Results.NoContent);
    });

app.Run();
public static class CorsPolicyNames
{
    public const string ApiCorsPolicyName = "DefaultApiCorsPolicyName";
}
~~~

## How to test CORS in .NET6 xUnit Project?
In the below code snippet, we are testing CORS by asserting the CORS policy presence in the pipeline and sending OPTIONS request to the test server and checking the existence and value of CORS Header (`Access-Control-Allow-Origin`).
~~~csharp title="Test Cors in .NET6 xUnit Project"
public class CorsPolicyTest : IClassFixture<CustomWebApplicationFactory<Program>>
{
    private readonly CustomWebApplicationFactory<Program> _webApplicationFactory;

    public CorsPolicyTest(CustomWebApplicationFactory<Program> webApplicationFactory)
    {
        _webApplicationFactory = webApplicationFactory;
    }
    
    [Fact]
    public async Task ShouldAllowCorsFromAnyOriginWhenEnvironmentIsDevelopmentAsync()
    {
        // ReSharper disable once HeapView.ClosureAllocation
        var (expectedPolicy, client) = CreateClientWithCorsPolicy(Environments.Development);

        Assert.NotNull(expectedPolicy);
        Assert.True(expectedPolicy!.AllowAnyOrigin);
        Assert.True(expectedPolicy.AllowAnyMethod);
        Assert.True(expectedPolicy.Origins.Contains("*"));


        var httpRequestMessage = GetOptionsHttpRequestMessage("https://localhost:4409");
        var responseMessage = await client.SendAsync(httpRequestMessage).ConfigureAwait(false);
        Assert.Equal(HttpStatusCode.NoContent, responseMessage.StatusCode);
        Assert.Contains("*", responseMessage.Headers.GetValues(CorsConstants.AccessControlAllowOrigin));
    }

    private static HttpRequestMessage GetOptionsHttpRequestMessage(string origin)
    {
        //Options is pre-flight request to check if client can peform certain operations - it is sent by browser
        var httpRequestMessage = new HttpRequestMessage(HttpMethod.Options, "/cors");
        //Adding Origin header will tell the server from where the request is coming
        httpRequestMessage.Headers.Add("origin", origin);
        //Adding the below header to let the server know which method we will be accessing
        httpRequestMessage.Headers.Add("Access-Control-Request-Method", "PUT");
        return httpRequestMessage;
    }
    private (CorsPolicy? expectedPolicy, HttpClient client) CreateClientWithCorsPolicy(string environment)
    {
        CorsPolicy? expectedPolicy = null;
        var client = _webApplicationFactory.WithWebHostBuilder(builder =>
        {
            builder.ConfigureServices(services =>
            {
                var sp = services.BuildServiceProvider();
                using var scope = sp.CreateScope();
                var scopedServices = scope.ServiceProvider;
                var options = scopedServices.GetService<IOptions<CorsOptions>>();
                expectedPolicy = options!.Value.GetPolicy(CorsPolicyNames.ApiCorsPolicyName);
            }).UseEnvironment(environment);
        }).CreateClient();
        return (expectedPolicy, client);
    }
}
public class CustomWebApplicationFactory<TEntryPoint> : WebApplicationFactory<TEntryPoint>
    where TEntryPoint : class
{
    public CustomWebApplicationFactory()
    {
        ClientOptions.AllowAutoRedirect = true;
    }
}

~~~

:::tip

If your CORS are not working as expected then enable the logging level of Microsoft to Information or Debug which will provide useful logs on why Method Not Allowed is being returned. You might see logs that no CORS policy was found.

:::

## Feedback
I would love to hear your feedback, feel free to share it on [Twitter](https://twitter.com/madnan_rafiq). 

