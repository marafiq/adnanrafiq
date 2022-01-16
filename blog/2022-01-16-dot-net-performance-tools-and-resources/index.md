---
title: Useful .NET Performance Tools And Resources 
description: Useful .NET Performance Tools And Resources 
slug: dot-net-performance-tools-and-resources 
authors: adnan 
tags: [.NET, Performance, Profiling .NET]
image : ./heroImage.jpg
---
<head>

  <meta name="keywords" content="Useful .NET Performance Tools And Resources"/>
</head>

<img src={require('./heroImage.jpg').default} alt="Image of Hello"
/>

Image by [@isaacmsmith](https://unsplash.com/@isaacmsmith)

List of Useful Tools and Resources for .NET Performance, which I found useful.
:::tip
The [Performance Resources Curated List by Adam Sitnik](https://github.com/adamsitnik/awesome-dot-net-performance#performance-tools) will provide you most tools you will ever need.  

:::

<!--truncate-->

- [Performance Resources](https://github.com/adamsitnik/awesome-dot-net-performance#performance-tools) 
- [PerfView](https://github.com/microsoft/perfview)
PerfView script to run in non-dev environments.
    ```bash
    cd "path-to-perfview"
    Write-Output "Start"
    
    $currentDateTime=Get-Date -Format "MM-dd-yyyy HH-mm-ss"
    .\perfview64 collect -LogFile="perfviewlog$currentDateTime.log" -DataFile="perfviewetl$currentDateTime.etl" -AcceptEula -MaxCollectSec:500   -FocusProcess="w3wp.exe"
    
    Write-Output "Done but perfview is still running it will stop collecting after value of seconds provided in -MaxCollectSec"
    
    ```
- [Pro Net Memory Management By Konrad Kokosa](https://github.com/Apress/pro-.net-memory)
- [ETW Documentation](https://docs.microsoft.com/en-us/dotnet/framework/performance/clr-etw-events)
- [Command-line environment a-la WinDbg for executing SOS commands without having SOS available.](https://github.com/goldshtn/msos)
- [Test Query without running full-blown Load Test Tool](https://github.com/ErikEJ/SqlQueryStress/wiki)
- [Common Pitfalls writing scalable services](https://github.com/davidfowl/AspNetCoreDiagnosticScenarios/blob/master/Guidance.md)
- [Logman built-in windows tool to query ETW providers](https://docs.microsoft.com/en-us/windows-server/administration/windows-commands/logman-create) 
- DotMemory by JetBrains
- [Sentry Free SQL Plan Explorer](https://docs.sentryone.com/help/plan-explorer-installation)
- [Prefix - Free Version only under local IIS](https://stackify.com/prefix/)
- [SQL First Responder Kit](https://www.BrentOzar.com/first-aid/)
