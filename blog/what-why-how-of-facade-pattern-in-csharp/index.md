---
title: What, Why and How of Facade Pattern in C#
description: What is Facade Pattern? Why or what problem it solves? How to implement it in C#.
slug: what-why-how-of-facade-pattern-in-csharp 
authors: adnan 
tags: [C#, .NET6, ASP.NET6]
image : ./startandfinish.jpg
keywords: [Fundamentals, ASP.NET6]
draft: true
---
<head>

<meta property="og:image:width" content="1200"/>
<meta property="og:image:height" content="670"/>  
<meta name="twitter:creator" content="@madnan_rafiq" />
<meta name="twitter:title" content="What, Why and How of Facade Pattern in C#" />
<meta name="twitter:description" content="What is Facade Pattern? Why or what problem it solves? How to implement it in C#." />
</head>

<img src={require('./startandfinish.jpg').default} alt="Start and Finish Image"/>

Image by [awcreativeut](https://unsplash.com/@awcreativeut)

## What is Facade?
Exposing the simplistic interface of anything complex is a Facade.
For example, when you place an order for Pizza delivery, the application hides the complex process behind Pizza Delivery to your door.
<!--truncate-->

## What is Facade Pattern?
A successful Pizza delivery order requires multiple services to participate. 
Facade Pattern exposes the participating services such as Store Availability, Delivery Staff Availability, inventory of items, and others via a straightforward interface.
With a straightforward interface, it achieves the following objectives:
- It reduces the indirect coupling and eliminates direct coupling between the consumer of the Facade and participating services.
- It hides the participating services from the consumer of the Facade.
- It simplifies the interaction between the Consumer and the Facade.




## Feedback
I would love to hear your feedback, feel free to share it on [Twitter](https://twitter.com/madnan_rafiq). 

