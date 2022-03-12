---
title: Covariant or Polymorphic return types in C# 9 
description: Enable polymorphic behavior using covariant return types in C# 9 
slug: covariant-return-types-or-polymorphic-return-types-in-csharp9 
authors: adnan 
tags: [C#, .NET6]
image : ./change.jpeg
keywords: [Polymorphic, Covariant, Contravariant, Covariance, Contravariance, C# 9, CovariantReturnTypesInC#]
---
<head>

<meta property="og:image:width" content="1200"/>
<meta property="og:image:height" content="670"/>  
<meta name="twitter:creator" content="@madnan_rafiq" />
<meta name="twitter:title" content="Covariant or Polymorphic return types in C# 9" />
<meta name="twitter:description" content="Enable polymorphic behavior using covariant return types in C# 9" />
</head>
<figure>
<img src={require('./change.jpeg').default} alt="An image of change"/>
<figcaption >Image by <a target="_blank" href="https://unsplash.com/@chrislawton">@chrislawton</a></figcaption>
</figure>

## What is Variance in C#?
Variance means change. The concept of change applies to reference types of objects in C#. 
Behavior changes in objects are observable in two ways:
<!--truncate-->
1. Runtime
2. Compile-time

Behavior change in objects at runtime is known as Polymorphism, while compile-time is known as Variance. 
But compile-time behavior change is observable in terms of objects capabilities or implicitly changing type reference.
There are two types of Variance in C#:
- Covariance
- Contravariance
### Covariance
Assigning a derived object to a base type with an implicit reference conversion is known as Covariance. A simple example of covariance is below:
~~~csharp title="Implict reference conversion examples"
string name = "Adnan";
// string is implicitly converted to an object
object nameInBaseType =  name; 
//similary custom types are implicityly convertable 
TimedTodoItem todoItem = new(); // a derived type
// a derived type is assigned to base type
TodoItem timedToItem = todoItem; 
class TodoItem {/*methods and props*/}
class TimedTodoItem : TodoItem {/*methods and props*/}
~~~

C# supports Covariance in arrays, delegates, overridden props & methods return types of classes, and generic interface types using implicit reference conversion and `out` keyword for generic types. 
Implicit reference type conversions in C# do not require a particular operation, are type-safe, and always succeed. 
But in arrays, implicit type conversions are not type-safe at runtime but allowed. It also does not change the runtime type and value of the object.
~~~csharp title="Covariance in generic types"
IEnumerable<string> names = new List<string>();  
//strings are assigned to objects.
IEnumerable<object> namesAsTypeOfObjects = strings;
// highlight-next-line
//above is only possible because T in IEnumerable is marked with out keyword.

//Below will not complile because generic typed list do not allow covariance
List<string> namesList = new List<string>();
List<object> namesObjectList = namesList; //Compiler Error

~~~

### Contravariance
Contravariance is the reverse (base type passed to derived type parameter) function of Covariance applicable to generic type (interface & delegate) input parameters. Input parameter is marked with `in` keyword.

An example is below using two types of tasks (`SimpleTask` and `RewardableSimpleTask` where `RewardableSimpleTask` is extended type of `SimpleTask`). 
~~~csharp title="Contravariance example using generic delegate"
// A method which do work on the the given task.
static void DoTaskWork(SimpleTask simpleTask) // Note SimpleTask is base class
{
    //do the work
}
/*
assigns method DoTaskWork to delegate which is declared like 
public delegate void Action<in T>(T obj)
T is of type SimpleTask which is base class.
*/
Action<SimpleTask> performTask = DoTaskWork; 

/*
assign delegate of type SimpleTask to delgate of type RewardableSimpleTask
Base type is assigned to dervied type because T is marked as in 
*/ 
Action<RewardableSimpleTask> performRewardedTask = performTask;

//OR delegate can directly reference the method
Action<RewardableSimpleTask> performRewardedTask = DoTaskWork;


//Below code will result in compile time error 
//but marking T with in keyword in delclartion of WorkDelegate will make it contravariant. 
WorkDelegate<SimpleTask> performTask = DoTaskWork;
WorkDelegate<RewardableSimpleTask> performRewardedTask = performTask;
public delegate void WorkDelegate< T>(T obj);

~~~


## Covariant return types in C# 9
C# 9 allows Covariant returns types, which unlocks compile-time observable polymorphism. 
Consider, an application which allows you to perform different type of activities and each activity includes number of tasks. 
Below is model of tasks an activity will have. 
~~~csharp title="Activities Task Model"
// A simple task.
public class SimpleTask
{
    public string Title { get; }
    public SimpleTask(string title)
    {
        Title = title;
    }
}
// A rewardable task which tracks its state and may include more behavior
public class RewardableSimpleTask : SimpleTask
{
    public RewardableSimpleTask(string title) : base(title)
    {
        State = TaskState.NotStarted;
    }

    public TaskState State { get; private set; }

    public void MarkInProgress()
    {
        State = TaskState.InProgress;
    }

    public void MarkCompleted()
    {
        State = TaskState.Completed;
    }
}

public enum TaskState
{
    NotStarted,
    InProgress,
    Completed
}
~~~
Below is model of an activity with tasks.


~~~csharp title="Activity Model"
// An abstract Activity class which also provides access to tasks it may include.
public abstract class Activity
{
    public string Name { get; }
    public bool HasCompleted { get; }

    protected Activity(string name, bool hasCompleted)
    {
        Name = name;
        HasCompleted = hasCompleted;
    }
    
    public abstract IReadOnlyCollection<SimpleTask> Tasks { get; }
}
// A activity of type Practice
public class Practice : Activity
{
    private readonly List<SimpleTask> _tasks = new();
    public int ObtainedScore { get; }

    public Practice(string name, bool hasCompleted, int obtainedScore) : base(name, hasCompleted)
    {
        ObtainedScore = obtainedScore;
    }

    public override IReadOnlyCollection<SimpleTask> Tasks => _tasks;

    public void AddTask(SimpleTask simpleTask)
    {
        _tasks.Add(simpleTask);
    }
}
// An activity of type Competation
public class Competition : Activity
{
    private readonly List<RewardableSimpleTask> _tasks = new();
    public int ObtainedScore { get; }
    
    // highlight-start
    //It is not legal prior to C# 9
    //public override IReadOnlyCollection<RewardableSimpleTask> Tasks => _tasks;
    // highlight-end
    public override IReadOnlyCollection<SimpleTask> Tasks => _tasks;
    
    public void AddTask(RewardableSimpleTask simpleTask)
    {
        _tasks.Add(simpleTask);
    }

    public Competition(string name, bool hasCompleted, int 0btainedScore) : base(name, hasCompleted)
    {
        ObtainedScore = 0btainedScore;
    }
}
~~~

Now, lets create an activity of type Competition and access its tasks using versions of C# prior to 9.

~~~csharp title="Access overridden property with pre C# 9"
Competition competition = new Competition("A cricket match", true,100);
competition.AddTask(new RewardableSimpleTask("Hit Six"));
foreach (var task in competition.Tasks)
{
    /*Here I do not have access to State of task of RewardableSimpleTask because
     Competition is returning Simple Tasks as defined by contract of base class Activity
     which is public override IReadOnlyCollection<SimpleTask> Tasks => _tasks;
     changing the return type to IReadOnlyCollection<SimpleTask> is not allowed prior to C# 9
     */
    WriteLine(task.Title);
    
    /*
    //I can access the RewardableSimpleTask behavior by explicit cast
    // But I need to look at implementation of overridden method to findout about the type
    if (simpleTask is RewardableSimpleTask task)
    {
        WriteLine(task.State);
    }
    */
}
~~~

But in C# 9 we can change the return type of overridden method or property, so more derived type behavior can be accessed at compile time.

~~~csharp title="Access overridden property with C# 9 or later versions" 
Competition competition = new Competition("A cricket match", true,100);
competition.AddTask(new RewardableSimpleTask("Hit Six"));
foreach (var task in competition.Tasks)
{
    /*
        After chaning the return in Competition type activity of Tasks to 
        IReadOnlyCollection<RewardableSimpleTask>, behavior such as State of RewardableSimpleTask can be accessed at compile time
        even though base type is still SimpleTask in type Activity.
     */
    WriteLine(task.State);
    
    //Note no explicit conversion and null checking.
}
~~~

Note that Covariant return types do not require any explicit cast to access the more derived type behavior. 
Compile-time behavior of Covariant return types makes the code safer, readable, extensible and eliminates any runtime errors as there is no explicit cast.

- Safer because there is no explicit cast and null checking.
- Readable because code editors will display hints, and behavior is accessible statically.
- Extensible because behavior can be extended by using Inheritance.

## Feedback
I would love to hear your feedback, feel free to share it on [Twitter](https://twitter.com/madnan_rafiq). 

