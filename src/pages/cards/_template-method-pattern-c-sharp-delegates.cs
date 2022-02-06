public interface IAwsService{};
public interface IFileReader{};
public record CloudFileInfo(string SourcePath, string DestinationPath, string CloudTier);
public record AssetFile(int PrimaryKey, string LocalPath, DateOnly CreatedDate);
public record StatementFile(int PrimaryKey, string LocalPath, DateOnly LastUpdatedDate);
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
    // Steps getItems, UploadToAws3, updateItem are executed in same order, and handling of failure
    // While Func<Task<IEnumerable<T>>> getItems, Func<T, Task<bool>> updateItem behavior depends upon caller
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
