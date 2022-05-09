---
title: How to compare visually same unicode characters in C# and JavaScript 
description: Normalize visually same looking unicode characters and compare to get the accurate results 
slug: how-to-compare-visually-same-unicode-characters-in-csharp-and-javascript 
authors: adnan 
tags: [C#, .NET6]
image : ./change.jpg
keywords: [Unicode, UTF8, String, Comparison]
---
<head>

<meta property="og:image:width" content="1200"/>
<meta property="og:image:height" content="670"/>  
<meta name="twitter:creator" content="@madnan_rafiq" />
<meta name="twitter:title" content="How to compare visually same unicode characters in C# and JavaScript" />
<meta name="twitter:description" content="Normalize visually same looking unicode characters and compare to get the accurate results" />
</head>
<figure>
<img src={require('./change.jpg').default} alt="An image of alphabets"/>
<figcaption >Image by <a target="_blank" href="https://unsplash.com/@linharex">@linharex</a></figcaption>
</figure>

## Problem
When the application expects Unicode characters as input from the user, it is best to normalize it before storing it in the database, especially when you plan to use the information for comparison.

Suppose the application asks the user to upload a file with the same name as their first name, which contains the character é. If you validate the file name using the string comparison (===) operator or comparing length, it will fail if different Unicode code points represent the input.

You validate the client-side and server-side using C# as a best practice. It would be best to normalize the string before comparing; otherwise, the validation will fail either at the server or client side.

Browser's behavior is different for the Unicode characters; some do the normalization, and some do not. I recently had to fix an issue where string comparison without normalization only failed when the user uploaded the file using Chrome or Firefox on Mac. One such example is on [here](https://stackoverflow.com/questions/11176603/how-to-avoid-browsers-unicode-normalization-when-submitting-a-form-with-unicode).

## Normalize unicode strings for correct comparison
Some unicode character like ñ can be represented by using one code point (\u00F1) or two code points (\u006E\u0303). Such characters visually looks exactly the same but will have different string length. 
Thus string equality comparison and length tests will fail. This [MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/normalize) and [.NET](https://docs.microsoft.com/en-us/dotnet/api/system.text.normalizationform?view=net-6.0) article(s) describe it beautifully. 
If you are expecting unicode characters as an input from the user, store it after normalizing. 
<!--truncate-->

~~~javascript title="normalize unicode strings before comparison"
const name1 = '\u0041\u006d\u00e9\u006c\u0069\u0065';
const name2 = '\u0041\u006d\u0065\u0301\u006c\u0069\u0065';

console.log(`${name1}, ${name2}`);
// expected output: "Amélie, Amélie"
console.log(name1 == name2);
// expected output: false
console.log(name1.length === name2.length);
// expected output: false

const name1NFC = name1.normalize('NFC');
const name2NFC = name2.normalize('NFC');

console.log(`${name1NFC}, ${name2NFC}`);
// expected output: "Amélie, Amélie"
console.log(name1NFC === name2NFC);
// expected output: true
console.log(name1NFC.length === name2NFC.length);
// expected output: true

~~~

~~~csharp title="String comparison with and without normalize using C#"
[Test]
public void StringComparisonGotchas()
{
    // Returns false becaues the Unicode code points are different
    Assert.IsFalse($"e{Convert.ToChar(768)}".Equals("è", StringComparison.OrdinalIgnoreCase));
    // Returns true becaues both strings are normalized using the same form
    Assert.IsTrue($"e{Convert.ToChar(768)}".Normalize().Equals("è".Normalize(), StringComparison.OrdinalIgnoreCase));
}
~~~


## Feedback
I would love to hear your feedback, feel free to share it on [Twitter](https://twitter.com/madnan_rafiq). 

