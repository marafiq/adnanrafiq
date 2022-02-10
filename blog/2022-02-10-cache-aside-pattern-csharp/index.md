---
title: Cache Aside Pattern using C# 
description: Cache Aside Patter using C# 
slug: cache-aside-pattern-csharp 
authors: adnan 
tags: [C#, .NET]
image : ./heroImage.jpg
draft: true
keywords: [Cache,Aside]
---

## What is Cache Aside Pattern?
It enables you to improve application performance by reading the data from the cache-store (Redis, Memory Cache) instead of the persistent store (database) or an integration service.

<!--truncate-->

This pattern can decrease the throughput on database or service which may save you resources and money on top of better application performance.

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
When your application runs behind load balancer memory cache data will be different in each application host, consider using distributed cache if stale data is not acceptable or implement a way to remove data using pub/sub pattern.
:::

:::info
Microsoft Abstractions are useful and available on NuGet at [Microsoft.Extensions.Caching.Abstractions](https://www.nuget.org/packages/Microsoft.Extensions.Caching.Abstractions) and  [Microsoft.Extensions.Caching.Memory](https://www.nuget.org/packages/Microsoft.Extensions.Caching.Memory).
:::


An example below is using `Memory Cache` to implement the pattern.

~~~csharp title="Read side or through implementation with memory cache"
class ReadThroughMemoryCache
{
    private readonly IMemoryCache _memoryCache;

    public ReadThroughMemoryCache(IMemoryCache memoryCache)
    {
        _memoryCache = memoryCache;
    }

    public Task<T> GetAsync<T>(string key, Func<T> retrieveFromDataStore, TimeSpan expiredAfter, CancellationToken cancellationToken = default)
    {
        if (key == null) throw new ArgumentNullException(nameof(key));

        var item = _memoryCache.Get<T>(key);

        if (item is not null) return Task.FromResult(item);

        var dbItem = retrieveFromDataStore();
        
        _memoryCache.Set<T>(key, dbItem, expiredAfter);

        return Task.FromResult<T>(dbItem);
    }
}
record Course(int Id, string CourseName);
class StudentCoursesQuery
{
    private readonly ReadThroughMemoryCache _readThroughMemoryCache;
    public StudentCoursesQuery(ReadThroughMemoryCache readThroughMemoryCache)
    {
        _readThroughMemoryCache = readThroughMemoryCache;
    }
    async Task<IEnumerable<Course>> GetEnrolledCourses(int studentId)
    {
        return await _readThroughMemoryCache.GetAsync<IEnumerable<Course>>(studentId.ToString(), RetrieveFromDataStore, TimeSpan.MaxValue);

        IEnumerable<Course> RetrieveFromDataStore()
        {
            return new List<Course>();
        }
    }
} 
~~~

~~~csharp title="Write side or delete from the memory cache after writing to the database"
class StudentEnrollCommand
{
    private readonly IMemoryCache _memoryCache;

    public StudentEnrollCommand(IMemoryCache memoryCache)
    {
        _memoryCache = memoryCache;
    }

    async Task<bool> Enroll(int studentId, int courseId)
    {
        await Task.Delay(1000); // consider this is database query executing
        
        //delete the entry from cache
        //OR
        //write the entry to cache - write behind but its better to keep write at one place.
        _memoryCache.Remove($"Student_{studentId}_Courses"); 
        
        return await Task.FromResult<bool>(true);
    }
}
~~~

:::tip
Enforce cache key pattern by creating an abstraction around it. It helps when item in the cache can change from multiple places. You do not want to duplicate the logic to construct the cache key. It also helps when you want to search keys in the cache-store.
:::

~~~csharp title="Enforce the Cache Key Name"
record CacheKey(string Prefix, string UniqueKey, string Postfix)
{
    public override string ToString()
    {
        return $"{Prefix}_{UniqueKey}_{Postfix}";
    }
}
//OR
interface ICacheKey
{
    string GetCacheKey<TUniqueKey>(string preFix, TUniqueKey uniqueKey, string postFix); 
}
~~~

## Alternate Technique
Consider using loading data into the cache-store on application startup when the data is static or changes rarely. 

## Conclusion 
Cache is proven technique to improve the performance of an application. I encourage you to measure the impact & prove your theory with data, otherwise it is another layer of complexity.
