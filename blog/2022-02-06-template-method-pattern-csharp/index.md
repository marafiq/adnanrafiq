---
title: Template Method Pattern using C# 
description: Inheritance and Delegate based Template Method Pattern Implementation using C# 
slug: template-method-pattern-csharp 
authors: adnan 
tags: [C#, .NET]
image : ./heroImage.jpg
---
<head>
   <meta name="twitter:creator" content="@madnan_rafiq" />
   <meta name="keywords" content="Template Method Pattern"/>
</head>

## What is Template Method Pattern?

Template Method Pattern executes multiple same steps in the same order and allows consumers to change the behavior of the
steps.

> “Implement the invariant parts of an algorithm once and leave it up to subclasses to implement the behavior that can vary.” Elements of Reusable Object-Oriented Software.
<!--truncate-->

There are two distinct traits of this pattern.
- Invariant - Many Steps are executed in the same order.
- Variant - Each step can have different behavior when used for type A or B.

## When to use it?

You should only refactor towards it when:
- Duplicate behavior exists in at least two different classes. When both classes A and B perform multiple same steps & same order.
- When some steps are different in behavior for class A or B.
## Benefits
- Simplify the code as it is easy to reason about it.
- Remove duplication of the standard algorithm.
- It is easier to test and increase maintainability. As it is in line with SRP (Single reason to change).
## How to implement it?
I recently worked on a task to migrate different types of files from file-share to AWS3. And each file type is persisted in a separate database table, and rules to decide the S3 storage tier vary.
The existing implementation used the `switch` statement, which is also a good & simple solution. I refactored the `switch` statement-based solution to a class inheritance-based solution, and the result seems more maintainable.

**Requirement** is to implement a migration service, which will do the following:
1. Fetch list of type [A] files to migrate to S3 from the database.
2. Upload to S3 specific bucket and access tier
   1. If operation fails then abort.
3. Update the DB with cloud path. 
   1. If operation fails then delete the S3 file, and abort the next steps.
4. Delete the file from file share.

Let's look at C# code examples, where I implemented the above requirements using the template pattern using two different approaches.
- Class Inheritance based Template Method pattern
- Delegate based Template Method Pattern
### Class Inheritance based Template Method pattern
~~~csharp title="Template Method Pattern implemented in C# 10 using Inheritence"
public interface IAwsService{};

public interface IFileReader{};
public record CloudFileInfo(string SourcePath, string DestinationPath, string CloudTier);
public abstract class CloudFileMigration<T> //Its abstract thus can not be used directly, thus must be inherited.
{
    private readonly IAwsService _awsService;
    private readonly IFileReader _fileReader;

    // All subclasses will have to provide these services or dependencies 
    protected CloudFileMigration(IAwsService awsService, IFileReader fileReader)
    {
        _awsService = awsService;
        _fileReader = fileReader;
    }
    // A Template Method  or Invariant Trait of the Pattern
    public async Task Migrate()
    {
        var items = await GetItems();
        await Task.WhenAll(items.Select(MigrateItem));
        async Task MigrateItem(T item)
        {
            var cloudFileInfo = await GetCloudFileInfo(item);
            await UploadToAws3(cloudFileInfo);
            var hasUpdateItemSucceeded = await UpdateItem(item, cloudFileInfo);
            if (!hasUpdateItemSucceeded)
                //handle failure
                await DeleteFromAws3(cloudFileInfo);
        }
    }
    private Task UploadToAws3(CloudFileInfo cloudFileInfo) => Task.CompletedTask; //Do the work
    private Task DeleteFromAws3(CloudFileInfo cloudFileInfo) => Task.CompletedTask; // Do the work
    
    /*
     * All abstract methods below will have different behavior in sub classes.
     * This is Variant Trait of the Pattern
     */
    protected abstract Task<IEnumerable<T>> GetItems(); 
    protected abstract Task<bool> UpdateItem(T item, CloudFileInfo cloudFileInfo);
    protected abstract Task<CloudFileInfo> GetCloudFileInfo(T item);
    
}
public record AssetFile(int PrimaryKey, string LocalPath, DateOnly CreatedDate);

public class AssetFileMigration : CloudFileMigration<AssetFile>
{
    public AssetFileMigration(IAwsService awsService, IFileReader fileReader) : base(awsService, fileReader){}
    protected override Task<IEnumerable<AssetFile>> GetItems() =>
        Task.FromResult(Enumerable.Empty<AssetFile>()); // Fetch it from source, say DB

    protected override Task<bool> UpdateItem(AssetFile item, CloudFileInfo cloudFileInfo) =>
        Task.FromResult(true); //Update DB

    // 1- Store in bucket A, Cloud Tier, And Local Path To Read from
    protected override Task<CloudFileInfo> GetCloudFileInfo(AssetFile item) =>
        Task.FromResult(new CloudFileInfo("", "", ""));
}
public record StatementFile(int PrimaryKey, string LocalPath, DateOnly LastUpdatedDate);
public class StatementFileMigration : CloudFileMigration<StatementFile>
{
    public StatementFileMigration(IAwsService awsService, IFileReader fileReader) : base(awsService, fileReader){}
    
    protected override Task<IEnumerable<StatementFile>> GetItems() =>
        Task.FromResult(Enumerable.Empty<StatementFile>()); // Fetch it DB

    protected override Task<bool> UpdateItem(StatementFile item, CloudFileInfo cloudFileInfo) =>
        Task.FromResult(true); //Update DB

    // 1- Store in bucket B, Cloud Tier based on LastUpdateDate, And Local Path To Read from
    protected override Task<CloudFileInfo> GetCloudFileInfo(StatementFile item) =>
        Task.FromResult(new CloudFileInfo("", "", ""));
}

~~~

:::tip

The above code sample is also an excellent example of when to choose `abstract class` over `interface`.

:::

### Delegate based Template Method Pattern
If you are not a fan of class inheritance, C# is a feature-rich language with functional qualities. Let's look at sample implementation below:

~~~csharp title="The Template Method Pattern using functions which are deletgate type in C#"
public class CloudFileMigrationSimple
{
    private readonly IAwsService _awsService;
    private readonly IFileReader _fileReader;

     
    public CloudFileMigrationSimple(IAwsService awsService, IFileReader fileReader)
    {
        _awsService = awsService;
        _fileReader = fileReader;
    }

    // A Template Method  or Invariant Trait of the Pattern
    public async Task Migrate<T>(Func<Task<IEnumerable<T>>> getItems, CloudFileInfo cloudFileInfo,
        Func<T, Task<bool>> updateItem)
    {
        var items = await getItems();
        await Task.WhenAll(items.Select(MigrateItem));

        async Task MigrateItem(T item)
        {
            await UploadToAws3(cloudFileInfo);
            var hasUpdateItemSucceeded = await updateItem(item);
            if (!hasUpdateItemSucceeded)
                //handle failure
                await DeleteFromAws3(cloudFileInfo);
        }
    }

    private Task UploadToAws3(CloudFileInfo cloudFileInfo) => Task.CompletedTask; //Do the work
    private Task DeleteFromAws3(CloudFileInfo cloudFileInfo) => Task.CompletedTask; // Do the work
}

public static class Client
{
    public static async Task Run()
    {
        CloudFileMigrationSimple migrationSimple = new(default, default);
        await migrationSimple.Migrate(() => Task.FromResult(Enumerable.Empty<StatementFile>()), default,
            (item) => Task.FromResult(true));
        
        await migrationSimple.Migrate(() => Task.FromResult(Enumerable.Empty<AssetFile>()), default, UpdateAssetFile);

        Task<bool> UpdateAssetFile(AssetFile item)
        {
            return Task.FromResult<bool>(true);
        }
    }
}

~~~

## Conclusion 
You should refactor towards a pattern rather than start with a pattern. It allows you to observe & compare two different solutions for the exact requirement. 
