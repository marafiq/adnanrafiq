var adnan = (Name: "Adnan", Age: 40);
var anotherAdnan = (Name: "Adnan", Age: 40);
var areTheySame = adnan == anotherAdnan ? "Yes" : "No";
Console.WriteLine($"Are they same? {areTheySame}");
//output: Are they same? Yes
// highlight-start
var someoneElse = (FirstName: "Adnan", Age: 40);
areTheySame = adnan == someoneElse ? "Yes" : "No";
// highlight-end
Console.WriteLine($"Are they same? {areTheySame}");
//output: Are they same? Yes

/*
 But why?
 Because Named Tuples are syntax sugar. It makes code more readable.
 Tuples equality is done on Tuple properties, Item1, Item2
*/
