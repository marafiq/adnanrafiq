---
title: Chaos Engineering Experiments in .NET Framework Application 
description: Chaos Engineering Experiments in .NET Framework Application By Using Gremlin 
slug: dot-net-chaos-engineering-experiments 
authors: adnan 
tags: [.NET, Performance, Chaos]
image : ./heroImage.jpg
---
<head>

  <meta name="keywords" content="Chaos, Engineering, Experiments, Gremlin"/>
</head>

<img src={require('./heroImage.jpg').default} alt="Image of Hello"
/>

Image by [@isaacmsmith](https://unsplash.com/@isaacmsmith)
## What is Chaos Engineering?
Chaos Engineering is about testing & increasing your system resilience.

- Resilience Definitions on [merriam-webster.com](http://merriam-webster.com/)
  - the capability of a strained body to recover its size and shape after deformation caused especially by compressive stress
  - an ability to recover from or adjust easily to misfortune or change

We test our system by intentionally causing failure in parts, such as saturating the host's CPU. During the failure, we measure the time to recovery and other metrics you would want to collect.
<!--truncate-->
## Tools of Chaos

Software such as Gremlin (Paid) helps you trigger targeted failures in the system. Netflix Open Sourced [ChaosMonkey](https://github.com/netflix/chaosmonkey) a while back is another option.

I will be using Gremlin to conduct chaos experiments. I help maintain my team a .NET Framework 4.7.1 application that runs on Windows Server 2016. We use Octopus for Delivery. I should note that Gremlin does not support all types of attacks on Windows Server.

## How to set up Gremlin on Windows using Octopus and PowerShell?

The steps and script are below.

``` powershell title="PowerShell Script and Octopus"
#Pre-requisite - Create Octopus Runbook or run PowerShell Script with other tool(s)  
# Step 1 - Download 
$downloadpath="drive path"
If(!(test-path $downloadpath))
{
	New-Item -Path $downloadpath -ItemType "directory"
}
Invoke-WebRequest https://windows.gremlin.com/installer/latest/gremlin_installer.msi -OutFile "$downloadpath\gremlin_installer.msi"
#Step 2 - UnInstall if its already installed
# Use Octopus Community "Run - Windows Installer" with Action UnInstall, I ignored status code 1605 
#Step 3 - Remove Gremlin Folder if it exists 
#Why? Because that's how I got it working. Existing installation was messin up with config values.
Remove-Item -LiteralPath "C:\ProgramData\Gremlin" -Force -Recurse -ErrorAction SilentlyContinue
#Step 4 - Install Gremlin from $downloadPath
# Use Octopus Community "Run - Windows Installer" with Action Install
#Step 5 - Stop the Gremlin Service
#Why? Because we want to configure it.
Stop-Service -Name "gremlind" -ErrorAction SilentlyContinue
#Step 6 - Set Environment Variable 
[System.Environment]::SetEnvironmentVariable('GREMLIN_TEAM_ID',$gremlinteamid,[System.EnvironmentVariableTarget]::Machine)
[System.Environment]::SetEnvironmentVariable('GREMLIN_TEAM_SECRET',$gremlinteamsecret,[System.EnvironmentVariableTarget]::Machine)
[System.Environment]::SetEnvironmentVariable('GREMLIN_IDENTIFIER',$OctopusParameters["YourIdentifier"],[System.EnvironmentVariableTarget]::Machine)
$env=$OctopusParameters["YourEnvironment"]
$roles=$OctopusParameters["YourSystemRolesIfAny"]
[System.Environment]::SetEnvironmentVariable('GREMLIN_CLIENT_TAGS',"env=$env,role=$roles",[System.EnvironmentVariableTarget]::Machine)
# You can use values of whatever variables you have available, in your context.
#Step - 7 - Restart the service 
$serviceName = "gremlind"
Write-Output "Restarting $serviceName, stopping..."
$serviceInstance = Get-Service $serviceName
restart-service -InputObject $serviceName -Force
$serviceInstance.WaitForStatus('Running','00:01:00')
Write-Output "Service $serviceName started."
#Step - 8 - Use Gremlin CLI to see if it is configured correctly
cd "C:\Program Files\Gremlin\Agent" # Default Installation Directory
.\gremlin check # prints what config values are setup on host
.\gremlin check auth #prints if Gremlin Agent is able to communicate with portal.
# if .\gremlin check auth, prints OK, you can are all set to trigger attacks from Portal.
```

## What to test and measure?

The answer depends upon the complexity of your system. Most likely, your application uses a database, external service, and internal HTTP service.

It brings us to the type of common Chaos Attacks:

- CPU Saturation
- Memory Pressure
- Network Latency
- Database Failover - by Restarting.
- Monitoring and Alerts

During the failure incident, you expect the system to behave a specific way and **recover quickly**. The recovery from failure is known as Mean Time To Recovery (MTTR). The longer it takes to recover means your system is less resilient.

I started with a basic template.

| Attack Title: CPU Saturation                                                                                                    |                                                                                                                       |  |                                                                        |
|---------------------------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------| --- |------------------------------------------------------------------------|
| Attack                                                                                                                          | Expectations                                                                                                          | MTTR | Impacts                                                                |
| Explain attack conditions such as: 1- Which ENV? <br/> 2- Expected Load on System? <br/> 3- What time? <br/> 4- How Long?<br/>5-Who? | List Expectations such as: <br/> 1- How do Monitoring Tools Perform? <br/>2- Playbooks? <br/>3-Communication among teams? | - How long does it take to recover? | - Response Time Degradation? <br/>- Error Rate Increased? <br/>- Other Failures? | 

Once the test is over, you can take the measurement and improve your system. Improvement will largely depend upon your system's desired behavior and trade-offs.
