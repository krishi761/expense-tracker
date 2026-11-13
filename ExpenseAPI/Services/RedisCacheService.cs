using System.Text.Json;
using Microsoft.Extensions.Caching.Distributed;

namespace ExpenseAPI.Services
{
    public class RedisCacheService
    {
        private static readonly TimeSpan CacheDuration = TimeSpan.FromMinutes(2);
        private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web);
        private readonly IDistributedCache _cache;
        private readonly ILogger<RedisCacheService> _logger;

        public RedisCacheService(
            IDistributedCache cache,
            ILogger<RedisCacheService> logger)
        {
            _cache = cache;
            _logger = logger;
        }

        public async Task<bool> CheckConnectionAsync(CancellationToken cancellationToken = default)
        {
            var key = $"healthcheck:{Guid.NewGuid():N}";
            var expectedValue = Guid.NewGuid().ToString("N");

            try
            {
                await _cache.SetStringAsync(
                    key,
                    expectedValue,
                    new DistributedCacheEntryOptions
                    {
                        AbsoluteExpirationRelativeToNow = TimeSpan.FromSeconds(15)
                    },
                    cancellationToken);

                var actualValue = await _cache.GetStringAsync(key, cancellationToken);
                var isAvailable = string.Equals(actualValue, expectedValue, StringComparison.Ordinal);
                if (!isAvailable)
                {
                    _logger.LogWarning("Redis connectivity check returned an unexpected value.");
                }

                return isAvailable;
            }
            catch (OperationCanceledException)
            {
                throw;
            }
            catch (Exception exception)
            {
                _logger.LogWarning(exception, "Redis connectivity check failed.");
                return false;
            }
        }

        public async Task<T> GetOrCreateAsync<T>(
            string key,
            Func<Task<T>> factory,
            CancellationToken cancellationToken = default)
        {
            string? cachedValue;
            try
            {
                cachedValue = await _cache.GetStringAsync(key, cancellationToken);
            }
            catch (OperationCanceledException)
            {
                throw;
            }
            catch (Exception exception)
            {
                _logger.LogWarning(
                    exception,
                    "Redis read failed for cache key {CacheKey}; loading the value from its source.",
                    key);
                return await factory();
            }

            if (cachedValue is not null)
            {
                return JsonSerializer.Deserialize<T>(cachedValue, JsonOptions)
                    ?? throw new InvalidOperationException($"Cached value for '{key}' is invalid.");
            }

            var value = await factory();
            if (value is not null)
            {
                try
                {
                    await _cache.SetStringAsync(
                        key,
                        JsonSerializer.Serialize(value, JsonOptions),
                        new DistributedCacheEntryOptions
                        {
                            AbsoluteExpirationRelativeToNow = CacheDuration
                        },
                        cancellationToken);
                }
                catch (OperationCanceledException)
                {
                    throw;
                }
                catch (Exception exception)
                {
                    _logger.LogWarning(
                        exception,
                        "Redis write failed for cache key {CacheKey}; returning the source value without caching it.",
                        key);
                }
            }

            return value;
        }

        public async Task RemoveAsync(params string[] keys)
        {
            foreach (var key in keys)
            {
                try
                {
                    await _cache.RemoveAsync(key);
                }
                catch (OperationCanceledException)
                {
                    throw;
                }
                catch (Exception exception)
                {
                    _logger.LogWarning(
                        exception,
                        "Redis cache invalidation failed for key {CacheKey}. The entry may remain until it expires.",
                        key);
                }
            }
        }
    }
}
