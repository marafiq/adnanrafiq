---
title: How to parse SQL Server Stored Procedures and Get Parameter(s) and ResultSet(s) Details
description: Parse SQL using ScriptDom and get stored procedure parameter and result sets information
slug: parsing-sql-server-stored-procedure-to-get-parameter-info-and-resultsets 
authors: adnan 
tags: [C#, SQL]
image : ./yougood.jpg
keywords: [SQLServer,C#]
---
<head>

<meta property="og:image:width" content="1200"/>
<meta property="og:image:height" content="670"/>  
<meta name="twitter:creator" content="@madnan_rafiq" />
<meta name="twitter:title" content="How to parse SQL Server Stored Procedures and Get Parameter(s) and ResultSet(s) Details" />
<meta name="twitter:description" content="Parse SQL using ScriptDom and get stored procedure parameter and result sets information" />
</head>

<img src={require('./yougood.jpg').default} alt="Start and Finish Image"/>

Image by [@claybanks](https://unsplash.com/@claybanks)

## Overview

I am working on migrating the .NET Framework application to the .NET6. 
Since the application was initially written in the .NET Framework 2.0 thus it contains the legacy approaches to get the data from the database.
We were using the old version of Microsoft Enterprise Library Data Access package to get the data from the database which is not compatible with the .NET Standard 2.0. 
So I decided to generate the code for stored procedures using the Dapper and Handlebars templates. 

I faced two problems:

- SQL Server system tables does not know about stored procedure parameter nullability
- When you are using conditional logic inside the stored procedure, sql server does not give you correct count of the result sets. 

<!--truncate-->

## How to get Parameter Information by parsing the stored procedure SQL

You will need to install the Microsoft.SqlServer.TransactSql.ScriptDom NuGet package. 

~~~csharp title="Parse the Stored Procedure Sql to get the parameter(s) nullability, default value and result sets"

    var storedProcResultSetVisitor = new StoredProcedureNodeVisitor();
    IList<ParseError> errors = null;
    var parser = new TSql150Parser(true, SqlEngineType.All);    
    using (var rdr = new StringReader(sql))
    {
        var tree = parser.Parse(rdr, out errors);
    
        foreach (ParseError err in errors)
        {
            Console.WriteLine(err.Message);
        }
    
        tree.Accept(storedProcResultSetVisitor);
    }

                

class StoredProcedureNodeVisitor : TSqlFragmentVisitor
    {
        private List<(string ParamName, bool AllowNull, string DefaultValue)> _inputParameters =
            new List<(string ParamName, bool AllowNull, string DefaultValue)>();
    
        private List<List<string>> _resultSetColumnNames = new List<List<string>>();
    
        public List<(string ParamName, bool AllowNull, string DefaultValue)> InputParameters
        {
            get => _inputParameters;
            set => _inputParameters = value;
        }
    
        public List<List<string>> ResultSetColumnNames => _resultSetColumnNames;
    
        // Parse the parameter node to get the default value and nullability
        public override void ExplicitVisit(ProcedureParameter node)
        {
            var paramName = node.VariableName.Value;
            var allowNull = false;
            var defaultValue = "";
            if (node?.Value is IntegerLiteral literal)
            {
                defaultValue = literal.Value;
            }
            else if (node?.Value is StringLiteral stringLiteral)
            {
                defaultValue = stringLiteral.Value;
            }
            else if (node?.Value is NullLiteral nullLiteral)
            {
                allowNull = true;
            }
    
            InputParameters.Add((paramName, allowNull,
                defaultValue));
        }
    
        //traverse the statments in the stored procedure to only level in IF/ELSE block to find the total number of result sets.
        public override void ExplicitVisit(StatementList node)
        {
            if (node.Statements.Count == 0 || node.Statements.Count > 1)
            {
                return;
            }
    
            var beginEndBlockStatement = node.Statements.OfType<BeginEndBlockStatement>().FirstOrDefault();
            if (beginEndBlockStatement == null) return;
    
            foreach (var statementListStatement in beginEndBlockStatement.StatementList.Statements)
            {
                if (statementListStatement is SelectStatement selectStatement)
                {
                    
                    if (selectStatement.QueryExpression is QuerySpecification querySpecification)
                    {
                        List<string> columnNames = new List<string>();
                        foreach (var querySpecificationSelectElement in querySpecification.SelectElements)
                        {
                            if (querySpecificationSelectElement is SelectScalarExpression selectScalarExpression)
                            {
                                if (selectScalarExpression.ColumnName != null)
                                {
                                    columnNames.Add(selectScalarExpression.ColumnName.Value);
                                }
                                else if (selectScalarExpression.Expression is ColumnReferenceExpression colRefExp)
                                {
                                    if (colRefExp.MultiPartIdentifier != null &&
                                        colRefExp.MultiPartIdentifier.Identifiers != null &&
                                        colRefExp.MultiPartIdentifier.Identifiers.Count > 0)
                                    {
                                        columnNames.Add(colRefExp.MultiPartIdentifier.Identifiers.Last().Value);
                                    }
                                    
                                }
                            }
                            else if (querySpecificationSelectElement is SelectStarExpression selectStarExpression)
                            {
                                columnNames.Add("***");
                            }
                        }
    
                        if (columnNames.Count > 0)
                        {
                            _resultSetColumnNames.Add(columnNames);
                        }
                    }
                }
                else if (statementListStatement is IfStatement ifStatement)
                {
                    if (ifStatement.ThenStatement is BeginEndBlockStatement thenStatement)
                    {
                        var colNames = ParseResultSets(thenStatement);
                        if (colNames.Count > 0)
                        {
                            _resultSetColumnNames.Add(colNames);
                        }
                    }
                }
            }
        }
    
        private List<string> ParseResultSets(BeginEndBlockStatement beginEndBlockStatement)
        {
            List<string> columnNames = new List<string>();
            foreach (var statementListStatement in beginEndBlockStatement.StatementList.Statements)
            {
                if (statementListStatement is SelectStatement selectStatement)
                {
                    
                    if (selectStatement.QueryExpression is QuerySpecification querySpecification)
                    {
                        foreach (var querySpecificationSelectElement in querySpecification.SelectElements)
                        {
                            if (querySpecificationSelectElement is SelectScalarExpression selectScalarExpression)
                            {
                                if (selectScalarExpression.ColumnName != null)
                                {
                                    columnNames.Add(selectScalarExpression.ColumnName.Value);
                                }
                                else if (selectScalarExpression.Expression is ColumnReferenceExpression colRefExp)
                                {
                                    if (colRefExp.MultiPartIdentifier != null &&
                                        colRefExp.MultiPartIdentifier.Identifiers != null &&
                                        colRefExp.MultiPartIdentifier.Identifiers.Count > 0)
                                    {
                                        columnNames.Add(colRefExp.MultiPartIdentifier.Identifiers.Last().Value);
                                    }
                                    
                                }
                            }
                            else if (querySpecificationSelectElement is SelectStarExpression selectStarExpression)
                            {
                                columnNames.Add("***");
                            }
                        }
                    }
                }
            }
    
            return columnNames;
        }
    }




~~~



## Feedback
I would love to hear your feedback, feel free to share it on [Twitter](https://twitter.com/madnan_rafiq). 

