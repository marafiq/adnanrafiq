---
title: Introduction to MSSQL Server In-Memory OLTP with .NET 6 and EF Core 
description: How to use In-Memory SQL Server tables with EF Core 
slug: Introduction-to-MSSQL-Server-In-Memory-OLTP-with-NET6-EF-Core 
authors: adnan 
tags: [SQL Server, EF Core, .NET 6]
---
SQL Server Enterprise offers scalable memory optimized relational tables. Yes, all data inside table will be loaded in
memory. In-Memory tables has two flavors.
- Durable - Offers ACID
- Non-Durable
<!--truncate-->

In-Memory table(s) are relational tables. Only difference is data is reterieved from memory than from disk. Which can significantly reduce your resource consumption (dramatically) & speed by 30X.
[Table & Row Size - see this](https://docs.microsoft.com/en-us/sql/relational-databases/in-memory-oltp/table-and-row-size-in-memory-optimized-tables?view=sql-server-ver15)

If you use Entity Framework to query your datbase. You do not need to do anything special about how you manipulate data. It works perfectly.

I wrote a sample app here - [In-Memory SQL App ](https://github.com/marafiq/PerformanceBoostWithSqlServer/blob/master/PerformanceBoostWithSqlServer/Program.cs)

In EF Code First approach, you have to have specific `IsMemoryOptimized`.

``` C#
protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Course>().IsMemoryOptimized();
        
        //modelBuilder.Entity<Course>().HasMany<CourseEnrollment>().WithOne(x => x.Course);

        modelBuilder.Entity<Person>().ToTable("Persons").HasDiscriminator<PersonRole>(nameof(Person.Role)).HasValue<Student>(PersonRole.Student).HasValue<Teacher>(PersonRole.Teacher);
        
        //modelBuilder.Entity<Person>().HasMany<CourseEnrollment>().WithOne(x => x.Student);

        modelBuilder.Entity<Person>().IsMemoryOptimized();
        modelBuilder.Entity<Student>().IsMemoryOptimized();
        modelBuilder.Entity<Teacher>().IsMemoryOptimized();

        modelBuilder.Entity<CourseEnrollment>().HasKey(x => new { x.CourseId, x.StudentId });
        
        modelBuilder.Entity<CourseEnrollment>().IsMemoryOptimized();

    }

