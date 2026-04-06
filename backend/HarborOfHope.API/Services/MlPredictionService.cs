using System.Net.Http.Json;
using HarborOfHope.API.DTOs;

namespace HarborOfHope.API.Services;

public class MlPredictionService(IHttpClientFactory httpClientFactory, ILogger<MlPredictionService> logger)
{
    private readonly HttpClient _client = httpClientFactory.CreateClient("MlApi");

    public async Task<MlHealthResponse?> GetHealthAsync()
    {
        try
        {
            return await _client.GetFromJsonAsync<MlHealthResponse>("/health");
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to reach ML API health endpoint");
            return null;
        }
    }

    public async Task<MlPredictionResponse?> PredictAsync(string modelName, Dictionary<string, object> features)
    {
        try
        {
            var response = await _client.PostAsJsonAsync($"/predict/{modelName}",
                new { features });
            if (!response.IsSuccessStatusCode)
            {
                var error = await response.Content.ReadAsStringAsync();
                logger.LogWarning("ML prediction failed for {Model}: {StatusCode} {Error}",
                    modelName, response.StatusCode, error);
                return null;
            }
            return await response.Content.ReadFromJsonAsync<MlPredictionResponse>();
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error calling ML API for model {Model}", modelName);
            return null;
        }
    }
}
