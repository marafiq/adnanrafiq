IHost host = Host.CreateDefaultBuilder(args)
    .ConfigureLogging( (context, builder) => builder.AddConsole())
    .ConfigureServices(services =>
    {
        services.Configure<HostOptions>(options =>
        {
          	// gracefull shut down time
            options.ShutdownTimeout = TimeSpan.FromSeconds(30);
        });
        services.AddHostedService<Worker>();
    })
    .Build();

await host.RunAsync();
public class Worker : BackgroundService
{
    private readonly ILogger<Worker> _logger;
    private readonly IHostApplicationLifetime _hostApplicationLifetime;

    public Worker(ILogger<Worker> logger, IHostApplicationLifetime hostApplicationLifetime)
    {
        _logger = logger;
        _hostApplicationLifetime = hostApplicationLifetime;
    }

    public override Task StartAsync(CancellationToken cancellationToken)
    {
        try
        {
            // callback methods when host is gracefully shutting down the service
            _hostApplicationLifetime.ApplicationStarted.Register(() => _logger.LogInformation("started"));
            _hostApplicationLifetime.ApplicationStopping.Register(() => _logger.LogInformation("stopping"));
            _hostApplicationLifetime.ApplicationStopped.Register(() => _logger.LogInformation("stopped"));
            return base.StartAsync(cancellationToken);
        }
        catch (Exception e)
        {
            _logger.LogError(e.Message);
            return Task.CompletedTask;
        }
    }

    public override async Task StopAsync(CancellationToken cancellationToken)
    {
        var stopWatch = Stopwatch.StartNew();
        await base.StopAsync(cancellationToken);
        // it will print 30 seconds if stopped with ctrl + c
        _logger.LogInformation($"Worker Service Stopped in : {stopWatch.ElapsedMilliseconds}");
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        stoppingToken.Register(() => _logger.LogInformation($"Worker service token is canceled"));

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await DoWork();
            }
            catch (Exception e)
            {
                _logger.LogCritical(e, "I can not work anymore!");
                /* Trigger graceful shutdown of service
                 This will respect time set on host.
                 services.Configure<HostOptions>(options =>
                    {
                        options.ShutdownTimeout = TimeSpan.FromSeconds(30);
                    });
                 */
            }
            finally
            {
                // if you can not recover, stop it.
                // All hosted services in host will be stopped in reverse order of registration
                _hostApplicationLifetime.StopApplication();
            }
        }
    }

    private async Task<bool> DoWork()
    {
        _logger.LogInformation("I started doing work!");
        // press ctrl + c - after above message - ctrl + c is equal to StopService from Windows Host
        // defualt graceful shutdown is 6 seconds
        // work will never complete
        await Task.Delay(50000);
        _logger.LogInformation("I am done with work.");
        return true;
    }
}
