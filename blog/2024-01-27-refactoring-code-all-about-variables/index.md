---
title: Refactoring code - All about variables
description: Refactoring code - Variable refactoring techniques
slug: refactoring-code-all-about-variables
authors: adnan
tags: [C#, .NET8,ASP.NET8]
keywords: [C#, .NET8,refactoring,variables]
---
<head>

<meta property="og:image:width" content="1200"/>
<meta property="og:image:height" content="500"/>  
<meta name="twitter:creator" content="@madnan_rafiq" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="Refactoring code - All about variables" />
<meta name="twitter:description" content="Refactoring code - Variable refactoring techniques" />
</head>

# Refactorings
Any code written in the past is legacy code as soon as adding a new feature or fixing a bug
makes it difficult to change it.
There is only one cure to this problem: Refactor it, but only one refactoring at a time.
Otherwise, you will be frustrated to the least.

> Refactoring is a disciplined technique for restructuring an existing body of code, altering its internal structure without changing its external behavior. Its heart is a series of small behavior preserving transformations. Each transformation (called a 'refactoring') does little, but a sequence of transformations can produce a significant restructuring. Since each refactoring is small, it's less likely to go wrong. The system is kept fully working after each small refactoring, reducing the chances that a system can get seriously broken during the restructuring. Martin Fowler

There is no better refactoring than making the code more readable.
After all, to change code, you first have to understand it: by reading it.

<!--truncate-->
## Simplify Expressions with Variables
Expressions appear in many places in code like conditions, loops, and mathematical expressions.
Complex expressions are hard to read and understand, especially when their parts can be named naturally.

Extracting parts of the expression into variables and giving them natural meaningful names gives you:
- Better reading experience.
- Improve debugging experience.

But be careful: Don't get obsessed with extracting variables and start naming it a,b,c and make the code messy.

What is wrong with the below code, and how will you improve it?
Will the test pass because you will find it hard to calculate the expected value, why?
Because complex expression.

```csharp title="A complex expression requires intense focus - Bad Code" 
public class Order
{
    public int Quantity { get; init; }
    public decimal ItemPrice { get; init; }

    public decimal Total()
    {
        // 1. Calculate base price
        // 2. Apply 5% discount if quantity is more than 500
        // 3. Add 10% shipping cost but not more than 100
        return Quantity * ItemPrice -
               Math.Max(0, Quantity - 500) * ItemPrice * 0.05m +
               Math.Min(Quantity * ItemPrice * 0.1m, 100);
    }
}

public class OrderTests
{
    [Fact]
    public void Total()
    {
        var order = new Order { Quantity = 100, ItemPrice = 10 };
        Assert.Equal(1100, order.Total());
    }
}

```
I spotted a good comment but a bad code. But why rely on the comment when you can make the code self-explanatory.
Take a look at the below code and tell me how you feel about it?
```csharp title="A complex expression requires intense focus - Good Code" 
public class Order
{
    public int Quantity { get; init; }
    public decimal ItemPrice { get; init; }

    public decimal Total()
    {
        var basePrice = Quantity * ItemPrice;
        var discountBasedOnQuantity = Math.Max(0, Quantity - 500) * ItemPrice * 0.05m;
        var shippingCost = Math.Min(basePrice * 0.1m, 100);

        return basePrice - discountBasedOnQuantity + shippingCost;
    }

    //Total with more descriptive names
    public decimal TotalV2()
    {
        var basePrice = Quantity * ItemPrice;
        var applyFivePercentDiscountWhenMoreThan500 = Math.Max(0, Quantity - 500) * ItemPrice * 0.05m;
        var add10PercentShippingButNotMoreThan100 = Math.Min(basePrice * 0.1m, 100);

        return basePrice - applyFivePercentDiscountWhenMoreThan500 + add10PercentShippingButNotMoreThan100;
    }
}

public class OrderTests
{
    [Fact]
    public void Total()
    {
        var order = new Order { Quantity = 600, ItemPrice = 10 };
        Assert.Equal(6050, order.Total());
    }
}

```

So far, we have done the following:
- We avoided variable obsession by not extracting the parts of `discountBasedOnQuantity` and `shippingCost` into variables.
- We gave the variables meaningful names and directly returned the total.
- The test is still passing.


But it would make more sense to extract the expression if the usage is not local to the method.

## Simplify Expressions with Methods
If the Discount is used in other methods or classes, then it would make sense to extract it into a method or property.
For example, you would like to display the discount to the user while displaying the order.

```csharp title="Extract Methods when usage is not local - Good Code" 
public class Order
{
    public int Quantity { get; init; }
    public decimal ItemPrice { get; init; }

    public decimal Total()
    {
        var basePrice = Quantity * ItemPrice;
        
        var shippingCost = ShippingCost(basePrice);

        return basePrice - Discount + shippingCost;
    }
    
    //You can totally do same thing with Base Price
    private decimal Discount
    {
        get
        {
            if (Quantity <= 500) return 0m;
            
            var quantityEligibleForDiscount = Quantity - 500;
            var discount = quantityEligibleForDiscount * ItemPrice * 0.05m;
            return discount;
        }
    }

    private decimal ShippingCost(decimal basePrice) => Math.Min(basePrice * 0.1m, 100);

}
public class OrderTests
{
    [Fact]
    public void Total()
    {
        var order = new Order { Quantity = 500, ItemPrice = 10 };
        Assert.Equal(5100, order.Total());
    }
}
```
## Don't Mutate Variables
What is wrong with the below code, and how will you improve it?

```csharp title="Mutating variables is a bad idea - Bad Code" 
public class Order
{
    public int Quantity { get; init; }
    public decimal ItemPrice { get; init; }

    public decimal Total()
    {
        var total = Quantity * ItemPrice;
        total -= Math.Max(0, Quantity - 500) * ItemPrice * 0.05m;
        total += Math.Min(total * 0.1m, 100);

        return total;
    }
}

public class OrderTests
{
    [Fact]
    public void Total()
    {
        var order = new Order { Quantity = 100, ItemPrice = 10 };
        Assert.Equal(1100, order.Total());
    }
}

```

The variable `total` is mutated over and over again.
It makes it hard to read and understand the code.
Do not do that and instead introduce a variable with meaningful name for each step, as we did in the previous examples.

## Variable Location Matters
What is wrong with the below code, and how will you improve it?

```csharp title="Variable location matters - Bad Code" 
public class Order
{
    private const decimal DiscountRate = 0.05m;
    private const decimal ShippingRate = 0.1m;
    private const int DiscountQualifiedQuantity = 500;

    public int Quantity { get; private set; }
    public decimal ItemPrice { get; private set; }

    public decimal Total()
    {
        var total = Quantity * ItemPrice;
        if (total > 1000)
        {
            total = total - Math.Max(0, Quantity - DiscountQualifiedQuantity) * ItemPrice * DiscountRate;
        }
        total = total + Math.Min(basePrice * ShippingRate, 100);

        return total;
    }
}
```

The problem with the above code is
that it is using constants which are declared outside the method when they are only used inside the method.
It is introducing unnecessary in-direction and hurting readability.
Or simply said, scrolling.

The solution is to move the variables to closer to where they are used.

```csharp title="Variable location matters - Good Code" 
public class Order
{
    public int Quantity { get; private set; }
    public decimal ItemPrice { get; private set; }

    public decimal Total()
    {
        const decimal discountRate = 0.05m;
        const decimal shippingRate = 0.1m;
        const int discountQualifiedQuantity = 500;

        var total = Quantity * ItemPrice;
        if (total > 1000)
        {
            total = total - Math.Max(0, Quantity - discountQualifiedQuantity) * ItemPrice * discountRate;
        }
        total = total + Math.Min(basePrice * shippingRate, 100);

        return total;
    }
```