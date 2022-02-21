---
title: Cache Aside Pattern using C# 
description: Cache Aside Patter using C# 
slug: cache-aside-pattern-csharp 
authors: adnan 
tags: [C#, .NET, Patterns]
image : ./heroImage.jpg
keywords: [Cache,Aside,Redis,Distributed,.NET6]
---

## What is Cache Aside Pattern?
It enables you to improve application performance by reading the data from the cache-store (Redis, Memory Cache) instead of the persistent store (database) or an integration service.

<!--truncate-->

This pattern can decrease the throughput on database or service which may save you resources and money on top of better application performance.

Cache Aside is a bizarre name if English is not your native language. For that matter, any pattern emerges from a series of steps to solve a problem. The pattern Name is to communicate the steps quickly.
   

### Pre-Conditions
- The data is expensive to read from persistent store.
- Measure (ex: time to read from db > time to read from cache) if it actually improves the performance. 
- The data does not change frequently.
- The application use-case is in-sensitive to occasional stale data.

### Steps
The Aside Pattern executes the following steps, when reading and writing data to the cache-store.

Read side (Read Through):
1. Read from the cache-store.
2. If data is not available in the cache-store, retrieve it from the database and store it.
3. The next read will happen from the cache-store if the information exists.

Write Side (Delete After Write):
1. Store the data in the database.
2. Delete the data from the cache-store.  

:::caution
Data consistency is not guaranteed even when you use distributed cache database such as Redis, unless you implement complex locking which will defeat the purpose of achieving performance benefits.

In the case of Memory Cache, When your application runs behind load balancer memory cache data will be different in each application host, consider using distributed cache if stale data is not acceptable or implement a way to remove data from each host using pub/sub pattern.
:::

:::info
Microsoft Abstractions are useful and available on NuGet at [Microsoft.Extensions.Caching.Abstractions](https://www.nuget.org/packages/Microsoft.Extensions.Caching.Abstractions) and  [Microsoft.Extensions.Caching.Memory](https://www.nuget.org/packages/Microsoft.Extensions.Caching.Memory).
:::


An example below is using `Distributed Cache` to implement the pattern. Please find the complete code of sample web api [here](https://github.com/marafiq/production-ready-dot-net/blob/main/CacheAsidePattern/CachePatterns/Program.cs). 

~~~csharp title="Read side or through implementation with memory cache"
//Extension Method to Regiser Redis Distributed Cache Service
builder.Services.AddStackExchangeRedisCache(options =>
{
    //To store screts locally use secret manager tool
    //dotnet user-secrets init
    //dotnet user-secrets set "RedisConnectionString" "value"
    options.Configuration = builder.Configuration["RedisConnectionString"];
});

record Course(int Id, string CourseName);

class StudentCoursesQuery
{
    private readonly ReadThroughDistributedCache _readThroughDistributedCache;

    public StudentCoursesQuery(ReadThroughDistributedCache readThroughDistributedCache)
    {
        _readThroughDistributedCache = readThroughDistributedCache;
    }

    public async Task<IEnumerable<Course>> GetEnrolledCourses(int studentId)
    {
        return await _readThroughDistributedCache.GetAsync(
        new StudentCacheKey(studentId), RetrieveFromDataStore,
            TimeSpan.MaxValue) ?? Array.Empty<Course>();

        IEnumerable<Course> RetrieveFromDataStore()
        {
            // Inject dummy delay of 5 seconds
            // when item is not in cache
            Thread.Sleep(5000); 
            var courses = new List<Course> { new(1, "CS") };
            return courses.Where(x => x.Id == studentId);
        }
    }
}

class ReadThroughDistributedCache
{
    private readonly IDistributedCache _distributedCache;

    public ReadThroughDistributedCache(IDistributedCache distributedCache)
    {
        _distributedCache = distributedCache;
    }

    public async Task<T?> GetAsync<T, TUniqueKey>(CacheKey<TUniqueKey> key, 
    Func<T?> retrieveFromDataStore,
        TimeSpan expiredAfter, CancellationToken cancellationToken = default)
    {
        var cachedItem = await _distributedCache.GetAsync(key, cancellationToken);
        if (cachedItem is { })
        {
            return JsonSerializer.Deserialize<T>(new ReadOnlySpan<byte>(cachedItem))!;
        }

        var dbItem = retrieveFromDataStore();
        if (dbItem is null) return default;
        var dbItemSerialized = JsonSerializer.SerializeToUtf8Bytes(dbItem);
        await _distributedCache.SetAsync(key, dbItemSerialized,
            new DistributedCacheEntryOptions { 
            SlidingExpiration = expiredAfter 
            }, cancellationToken);
        return dbItem;
    }
}
//To Enforce consistent cache key name pattern
abstract record CacheKey<TUniqueKey>(char Prefix, TUniqueKey UniqueKey, char Postfix)
{
    public static implicit operator string(CacheKey<TUniqueKey> studentCacheKey)
    {
        return studentCacheKey.ToString();
    }

    public override string ToString()
    {
        return $"{Prefix}_{UniqueKey}_{Postfix}";
    }
}

record StudentCacheKey(int StudentId) : CacheKey<int>('S', StudentId, 'C');
~~~

:::tip
Enforce cache key pattern by creating an abstraction around it. It helps when item in the cache can change from multiple places. You do not want to duplicate the logic to construct the cache key. It also helps when you want to search keys in the cache-store.
:::


~~~csharp title="Write side or delete from the memory cache after writing to the database"
class StudentEnrollCommand
{
    private readonly IDistributedCache _distributedCache;

    public StudentEnrollCommand(IDistributedCache distributedCache)
    {
        _distributedCache = distributedCache;
    }

    public async Task<bool> Enroll(int studentId, int courseId)
    {
        // consider this is database query executing
        await Task.Delay(1000);

        var cacheKey = new StudentCacheKey(studentId);
        //delete the entry from cache
        await _distributedCache.RemoveAsync(cacheKey); 

        return true;
    }
}
~~~

## Alternate Technique
Consider using loading data into the cache-store on application startup when the data is static or changes rarely. 

## Conclusion 
Cache is proven technique to improve the performance of an application. I encourage you to measure the impact & prove your theory with data, otherwise it is another layer of complexity.
