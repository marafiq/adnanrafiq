---
title: Who calls Dispose in .NET and how Finalization works in .NET
description: Cleaning up resources in .NET after use is essential to make efficient use of memory and avoid memory leaks. It is even more important when you are making use of unmanaged resources and cleaning up using dispose pattern is efficient than relying on finalization.
slug: does-dotnet-gc-calls-dispose-and-how-finalization-works
authors: adnan
tags: [C#, .NET]
keywords: [C#, .NET]
---
<head>

<meta property="og:image:width" content="1200"/>
<meta property="og:image:height" content="500"/>  
<meta name="twitter:creator" content="@madnan_rafiq" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="Who calls Dispose in .NET and how Finalization works in .NET" />
<meta name="twitter:description" content="Cleaning up resources in .NET after use is essential to make efficient use of memory and avoid memory leaks. It is even more important when you are making use of unmanaged resources and cleaning up using dispose pattern is efficient than relying on finalization." />
</head>

## Dispose Myth's - Two Questions

Read the below code to answer the questions that follow the code.

```csharp title="General Myth's - Two Questions"

PrintFileContent();
Console.ReadKey();

static void PrintFileContent()
{
    //Notice that I have not wrapped the DisposableStream object in a using block and neither I am calling Dispose method.
    var disposableStream = new DisposableStream("file");//Assume that file exists in the current directory.
    disposableStream.PrintAllLines();
    Console.WriteLine("I am done with the stream.");
}

public class DisposableStream(string fileName) : IDisposable
{
    private readonly FileStream _fileStream = new(fileName, FileMode.Open);

    public void PrintAllLines()
    {
        using var streamReader = new StreamReader(_fileStream);
        while (streamReader.ReadLine() is { } line)
        {
            Console.WriteLine(line);
        }
    }

    public void Dispose()
    {
        _fileStream.Dispose();
        Console.WriteLine("DisposableStream dispose was called");
    }
}
```
1. Will the `Dispose` method be called on the `DisposableStream` object when the `PrintFileContent` method completes,
   since we are not wrapping it in a `using` block and neither calling the `Dispose` method explicitly?
2. If the `Dispose` method is not called, how will the `FileStream` object be collected by the Runtime?

### Answer # 1
The .NET runtime will never call the `Dispose` method on the `DisposableStream`.
Not for just this object, in fact, any object that implements the `IDisposable` interface will not have its `Dispose` method called by the .NET runtime.
It is the responsibility of the consumer of the object to call the `Dispose` method when it is done with the object.
### Answer # 2
The `FileStream` object will be collected by the .NET Garbage Collector
when the `DisposableStream` object is collected.
But the `Dispose` method will not be called on the `FileStream` object
and that means that the resources held by it will not be properly released or disposed.
As consumers, we do not know what kinds of resources were used by the `FileStream` object and how they should be released.
If the `FileStream` object implements destructor or finalizer,
it will be called by the Garbage collector on a special thread known as Finalizer thread to release the resources.

Does this mean that resources will be held until the finalizer thread runs?
Yes, that's correct. But
- We do not control the finalizer thread and when it will run.
- It is not guaranteed that the finalizer thread will run immediately after the object is collected.
- Finalizer thread maintains a queue of objects that need to be finalized. It is up to the runtime to decide when to run the finalizer thread. The key point is that it is two steps process.

In the below example, 
- I am forcing the Garbage Collector to run by calling `GC.Collect` method.
- I added a destructor to the `DisposableStream` class to print a message when the finalizer is called.


```csharp title="Forcing Garbage Collector to run"

PrintFileContent();
ForceGcSoFinalizerCanRun();
Console.ReadKey();

static void PrintFileContent()
{
    //Notice that I have not wrapped the DisposableStream object in a using block and neither I am calling Dispose method.
    var disposableStream = new DisposableStream("file");
    disposableStream.PrintAllLines();
    Console.WriteLine("I am done with the stream.");
}

void ForceGcSoFinalizerCanRun()
{
    GC.WaitForPendingFinalizers();
    GC.Collect(0, GCCollectionMode.Forced, true);
    GC.WaitForPendingFinalizers();
    GC.WaitForFullGCComplete();
}

public class DisposableStream(string fileName) : IDisposable
{
    private readonly FileStream _fileStream = new(fileName, FileMode.Open);

    public void PrintAllLines()
    {
        using var streamReader = new StreamReader(_fileStream);
        while (streamReader.ReadLine() is { } line)
        {
            Console.WriteLine(line);
        }
    }

    public void Dispose()
    {
        _fileStream.Dispose();
        Console.WriteLine("DisposableStream dispose was called.");
    }
    ~DisposableStream()
    {
        Console.WriteLine("DisposableStream finalizer was called.");
    }
}
```
### Two Steps Finalization Process
In the above snippet, you saw that we are forcing the GC by calling `ForceGcSoFinalizerCanRun` method.
If we comment out the `ForceGcSoFinalizerCanRun` method call, you will see that the finalizer or destructor will not be called.
In order for you to observe the two-step finalization process, you will have to take memory dump of the process and analyze it.

In the below code snippet, I have added comments to guide you on how to take memory dump and when to take it.

~~~csharp title="Two Steps Finalization Process

PrintFileContent();
//ForceGcSoFinalizerCanRun();
Console.WriteLine("Take memory dump using the command: dotnet-dump collect -p <process id> --output <output directory>");
Console.WriteLine("Once you have taken the memory dump, press any key to force the GC so we can take second dump.");
Console.ReadKey();
ForceGcSoFinalizerCanRun();
Console.WriteLine("You should have seen the finalizer being called line already.");
Console.WriteLine("Take memory dump using the command: dotnet-dump collect -p <process id> --output <output directory>");
Console.ReadKey();

static void PrintFileContent()
{
    //Notice that I have not wrapped the DisposableStream object in a using block and neither I am calling Dispose method.
    var disposableStream = new DisposableStream("file");
    disposableStream.PrintAllLines();
    Console.WriteLine("I am done with the stream.");
}

void ForceGcSoFinalizerCanRun()
{
    GC.WaitForPendingFinalizers();
    GC.Collect(0, GCCollectionMode.Forced, true);
    GC.WaitForPendingFinalizers();
    GC.WaitForFullGCComplete();
}

public class DisposableStream(string fileName) : IDisposable
{
    private readonly FileStream _fileStream = new(fileName, FileMode.Open);

    public void PrintAllLines()
    {
        
        using var streamReader = new StreamReader(_fileStream);
        while (streamReader.ReadLine() is { } line)
        {
            Console.WriteLine(line);
        }
    }

    public void Dispose()
    {
        _fileStream.Dispose();
        Console.WriteLine("DisposableStream dispose was called.");
    }
    ~DisposableStream()
    {
        Console.WriteLine("DisposableStream finalizer was called.");
    }
}
~~~

You have two memory dumps now. You can analyze them using the `dotnet-dump analyze` command.
Let's see what we can find in the finalizer queue, which is the queue of objects that need to be finalized.

You can run the below command to see the finalizer queue.

```shell
dotnet-dump analyze <path to the first memory dump> 
sos finalizequeue -allReady
```
Once you execute the above command, you should see the `DisposableStream` in the list of objects ready for finalization
but the runtime has not called the finalizer or destructor yet.

When we took the second dump,
we forced the GC, so it can run the finalizer for the objects which were ready to be finalized.
So let's analyze the second dump.

```shell
dotnet-dump analyze <path to the second memory dump> 
sos finalizequeue -allReady
```
Now you will see that the `DisposableStream` is not in the list.
It is because `-allReady` filter is only showing objects which are ready to be finalized. 

But if you execute the command without filter `sos finalizequeue`,
now you will see `DisposableStream` in the list because it already has been finalized.

The tools like `dotMemory` shows finalization queue visually but the feature isn't on Mac yet.

## More questions than answers 
You understand that 
1. how the finalization of an object works if you implement destructor.
2. Dispose is your responsibility and GC never calls it.

There are more questions
because you would like
to avoid the two-step process of finalization and more importantly when you should implement destructor. 
Also, you have implemented `dispose` and destructor on an object,
but consumer is properly wrapping it in `using` block, will the object go through the finalization process?

When should you implement destructor?
Only when you are using unmanaged objects,
and would like to clean up the resources if the consumer forgot to call dispose.

How to avoid the finalization if you are cleaning up in `Dispose` implementation?
You can avoid the two-step finalization process
by calling `GC.SuppressFinalize(this);` in the implementation of `Dispose`.
If you do not suppress the finalizer, the object will go through the finalization process anyway.

In the last, I will you another question.

Should you access the managed objects or try
to clean up managed resources inside the destructor
since this method is triggered by a special runtime thread known as Finalizer thread?

The answer is No,
because the finalizer thread has marked the object that it is ready for finalization,
and the existence of managed object is not certain or 100%.
That is why an IDE generates a disposed pattern like below code snippet.

```csharp title="Dispose Pattern"

class DisposePattern : IDisposable
{
    private void ReleaseUnmanagedResources()
    {
        // TODO release unmanaged resources here
    }

    protected virtual void Dispose(bool disposing)
    {
        ReleaseUnmanagedResources();
        if (disposing)
        {
            // TODO release managed resources here
        }
    }

    public void Dispose()
    {
        Dispose(true);
        GC.SuppressFinalize(this);
    }

    ~DisposePattern()
    {
        Dispose(false);
    }
}

```

Similarly, you can generate the pattern of `IAsyncDisposable`.

```csharp title="IAsyncDisposable Pattern"

class DisposePattern : IDisposable, IAsyncDisposable
{
    private void ReleaseUnmanagedResources()
    {
        // TODO release unmanaged resources here
    }

    protected virtual void Dispose(bool disposing)
    {
        ReleaseUnmanagedResources();
        if (disposing)
        {
            // TODO release managed resources here
        }
    }

    public void Dispose()
    {
        Dispose(true);
        GC.SuppressFinalize(this);
    }

    ~DisposePattern()
    {
        Dispose(false);
    }

    protected virtual async ValueTask DisposeAsyncCore()
    {
        // TODO release managed resources here
        ReleaseUnmanagedResources();
    }

    public async ValueTask DisposeAsync()
    {
        await DisposeAsyncCore();
        GC.SuppressFinalize(this);
    }
}

```